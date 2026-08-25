#!/usr/bin/env node
/**
 * tf-arch — command line interface.
 *
 *   tf-arch serve [plan.json] [--port 5173] [--open]
 *   tf-arch render <plan.json> [--out diagram.svg] [--title "Production"]
 *   tf-arch inspect <plan.json> [--json]
 *
 * `serve` hosts the interactive viewer from the package's built assets and
 * feeds it the given plan; `render` produces a standalone SVG with no browser
 * involved; `inspect` prints a text summary for CI logs.
 */

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import { parseTerraformPlan, MAX_EDGES } from '../src/parser/tfPlanParser.js';
import { computeArchitectureLayout } from '../src/canvas/layoutEngine.js';
import { renderStandaloneSvg } from '../src/canvas/svgRenderer.js';

/**
 * Only actively maintained Node lines are supported (see `engines` in
 * package.json). npm merely warns on an engine mismatch, so enforce it here
 * with a clear message instead of failing later in stranger ways.
 */
const MINIMUM_NODE_MAJOR = 22;
const nodeMajor = Number(process.versions.node.split('.')[0]);
if (nodeMajor < MINIMUM_NODE_MAJOR) {
  console.error(
    `tf-arch requires Node ${MINIMUM_NODE_MAJOR} or newer (you are on ${process.versions.node}). ` +
    'Node versions past their end-of-life are not supported: https://nodejs.org/en/about/previous-releases'
  );
  process.exit(1);
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const pkg = createRequire(import.meta.url)('../package.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8'
};

/**
 * Headers applied to every response. The viewer renders untrusted plan content,
 * so lock down what the page is allowed to do; the built app needs only its own
 * assets plus Google Fonts.
 */
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
    "frame-ancestors 'none'"
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

/**
 * Rejects requests whose Host header is not the loopback address we bound to.
 *
 * Without this, a malicious web page can use DNS rebinding to point its own
 * hostname at 127.0.0.1 and read the plan we are serving — and a plan routinely
 * contains account ids, CIDR ranges and other infrastructure detail.
 */
function isAllowedHost(hostHeader, boundHost, port, localAddress = null) {
  if (!hostHeader) return false;
  const hostname = hostHeader.replace(/:\d+$/, '').replace(/^\[|\]$/g, '').toLowerCase();
  const allowed = new Set(['localhost', '127.0.0.1', '::1', '[::1]', boundHost.toLowerCase()]);
  // Bound to a non-loopback address (or all interfaces): clients address the
  // machine by the interface IP they reached, which is what the socket saw.
  // Names still need an exact match, so a rebinding hostname stays rejected.
  if (localAddress && !isLoopbackHost(boundHost)) allowed.add(localAddress.replace(/^::ffff:/, '').toLowerCase());
  return allowed.has(hostname) || hostHeader.toLowerCase() === `${boundHost.toLowerCase()}:${port}`;
}

function isLoopbackHost(host) {
  const h = String(host).toLowerCase().replace(/^\[|\]$/g, '');
  return h === 'localhost' || h === '::1' || h.startsWith('127.');
}

const USAGE = `
tf-arch ${pkg.version} — Terraform plan → cloud architecture diagram (AWS, Google Cloud, Azure)

Usage
  tf-arch serve [plan.json] [options]     Open the interactive viewer
  tf-arch render <plan.json> [options]    Write a standalone SVG (no browser)
  tf-arch inspect <plan.json> [options]   Print a plan summary

  <plan.json> is the output of \`terraform show -json\`; pass \`-\` to read it from stdin.

Options
  render   -o, --out <file>     Output path (default: architecture.svg)
           -t, --title <text>   Diagram title (default: derived from the file name)
  serve    -p, --port <number>  Port (default: 5173; 0 picks a free port)
               --host <host>    Bind address (default: 127.0.0.1 — anything else exposes the plan)
               --open           Open the viewer in your default browser
           -t, --title <text>   Title shown in the viewer
  inspect      --json           Machine-readable output (stable, additive-only shape)

  -h, --help           Show this help
  -v, --version        Show version

Exit codes: 0 success · 1 error (details on stderr). Warnings go to stderr, so
\`inspect --json\` stays clean JSON on stdout.

Examples
  terraform plan -out=tfplan && terraform show -json tfplan > plan.json
  tf-arch serve plan.json --open
  tf-arch render plan.json --out docs/architecture.svg --title "Production"
  terraform show -json tfplan | tf-arch inspect - --json | jq '.providers'
`.trim();

/** Which options each command understands; anything else is a mistake worth flagging. */
const COMMAND_OPTIONS = {
  serve: ['port', 'host', 'open', 'title'],
  render: ['out', 'title'],
  inspect: ['json']
};
const OPTION_FLAGS = { out: '--out', title: '--title', port: '--port', host: '--host', open: '--open', json: '--json' };

function parsePort(raw, flag) {
  const port = Number(raw);
  if (!/^\d+$/.test(String(raw).trim()) || !Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`${flag} must be an integer between 0 and 65535 (got "${raw}")`);
  }
  return port;
}

const warn = (message) => console.error(`Warning: ${message}`);

function parseArgs(argv) {
  const options = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    // A value-taking flag must be followed by a value, never by another flag:
    // `--title --out x.svg` used to silently set the title to "--out".
    const takeValue = () => {
      const next = argv[i + 1];
      // `-` (stdin) and negative numbers are values, so the real validator can reject them.
      if (next === undefined || (next.startsWith('-') && next !== '-' && !/^-\d/.test(next))) {
        throw new Error(`Option ${arg} requires a value`);
      }
      i += 1;
      return next;
    };

    switch (arg) {
      case '-o': case '--out': options.out = takeValue(); break;
      case '-t': case '--title': options.title = takeValue(); break;
      case '-p': case '--port': options.port = parsePort(takeValue(), arg); break;
      case '--host': options.host = takeValue(); break;
      case '--open': options.open = true; break;
      case '--json': options.json = true; break;
      case '-h': case '--help': options.help = true; break;
      case '-v': case '--version': options.version = true; break;
      default:
        if (arg.startsWith('-') && arg !== '-') throw new Error(`Unknown option: ${arg}`);
        positionals.push(arg);
    }
  }
  return { options, positionals };
}

function assertUsage(command, positionals, options, { maxPositionals }) {
  if (positionals.length > maxPositionals) {
    throw new Error(`Unexpected argument: ${positionals[maxPositionals]} (${command} takes ${maxPositionals === 0 ? 'no plan file' : 'one plan file'})`);
  }
  const allowed = new Set(COMMAND_OPTIONS[command]);
  const stray = Object.keys(options).filter(k => !allowed.has(k) && k !== 'help' && k !== 'version');
  if (stray.length > 0) {
    throw new Error(`Option${stray.length > 1 ? 's' : ''} ${stray.map(k => OPTION_FLAGS[k] || k).join(', ')} not valid for ${command}`);
  }
}

const STDIN = '-';
const planLabel = (planPath) => (planPath === STDIN ? 'stdin' : planPath);

function readPlan(planPath) {
  let raw;
  if (planPath === STDIN) {
    try {
      raw = fs.readFileSync(0, 'utf8');
    } catch (err) {
      throw new Error(`Could not read the plan from stdin (${err.code || err.message}). Pipe it in: terraform show -json tfplan | tf-arch inspect -`);
    }
  } else {
    const resolved = path.resolve(process.cwd(), planPath);
    // Read first and classify the failure afterwards: a check-then-read pair
    // would race with anything replacing the file in between.
    try {
      raw = fs.readFileSync(resolved, 'utf8');
    } catch (err) {
      if (err.code === 'ENOENT') throw new Error(`Plan file not found: ${resolved}`);
      if (err.code === 'EISDIR') throw new Error(`${planPath} is a directory, not a plan file`);
      throw new Error(`Could not read ${planPath} (${err.code || err.message})`);
    }
  }

  // A binary plan (`terraform plan -out=tfplan`) is a zip archive.
  if (raw.startsWith('PK\u0003\u0004')) {
    throw new Error(
      `${planLabel(planPath)} is a binary Terraform plan, not JSON. ` +
      'Convert it first: terraform show -json tfplan > plan.json'
    );
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `${planLabel(planPath)} is not valid JSON (${err.message}). ` +
      'Generate it with: terraform show -json tfplan > plan.json'
    );
  }
}

function buildDiagram(plan, title) {
  const parsed = parseTerraformPlan(plan);
  const layout = computeArchitectureLayout(parsed);
  return { parsed, layout, svg: renderStandaloneSvg(layout, { title }) };
}

const unmodelledResources = (parsed) => parsed.nodes.filter(n => n.providerId === 'unknown');

/**
 * Things worth knowing that are not errors: an empty plan (almost always the
 * wrong file), resources from providers the tool has no model for, and edges
 * left undrawn because the plan is enormous. Always on stderr.
 */
function reportPlanCaveats(parsed, planPath) {
  if (parsed.nodes.length === 0) {
    warn(`no resources found in ${planLabel(planPath)} — is this the output of \`terraform show -json\` for a plan (or state) file?`);
  }
  const unknown = unmodelledResources(parsed);
  if (unknown.length > 0) {
    const shown = unknown.slice(0, 5).map(n => n.type);
    const more = unknown.length > shown.length ? `, +${unknown.length - shown.length} more` : '';
    warn(`${unknown.length} resource(s) from providers this tool does not model yet render with a generic icon: ${shown.join(', ')}${more}`);
  }
  if (parsed.edgesTruncated > 0) {
    warn(`plan is very large: ${parsed.edgesTruncated} inferred relationship(s) beyond the first ${MAX_EDGES} were not drawn`);
  }
}

function commandRender(positionals, options) {
  assertUsage('render', positionals, options, { maxPositionals: 1 });
  const [planPath] = positionals;
  if (!planPath) throw new Error('render requires a plan file: tf-arch render plan.json');

  const outPath = path.resolve(process.cwd(), options.out || 'architecture.svg');
  if (fs.existsSync(outPath) && fs.statSync(outPath).isDirectory()) {
    throw new Error(`--out ${options.out} is a directory; give the SVG a file name`);
  }
  const title = options.title
    || (planPath === STDIN || path.basename(planPath) === 'plan.json'
      ? 'Terraform Architecture'
      : `Terraform Architecture — ${path.basename(planPath)}`);
  const { parsed, svg } = buildDiagram(readPlan(planPath), title);
  reportPlanCaveats(parsed, planPath);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf8');

  const clouds = parsed.providers.map(p => p.shortName).join(', ') || 'none detected';
  console.log(`Wrote ${outPath}`);
  console.log(`  ${parsed.nodes.length} resources · clouds: ${clouds}`);
  console.log(`  +${parsed.stats.create} create  ~${parsed.stats.update} update  -${parsed.stats.delete} destroy`);
}

function commandInspect(positionals, options) {
  assertUsage('inspect', positionals, options, { maxPositionals: 1 });
  const [planPath] = positionals;
  if (!planPath) throw new Error('inspect requires a plan file: tf-arch inspect plan.json');

  const { parsed, layout } = buildDiagram(readPlan(planPath), 'inspect');
  reportPlanCaveats(parsed, planPath);

  if (options.json) {
    console.log(JSON.stringify({
      stats: parsed.stats,
      providers: parsed.providers,
      unmodelled: unmodelledResources(parsed).map(n => ({ address: n.address, type: n.type })),
      edgesTruncated: parsed.edgesTruncated,
      resources: parsed.nodes.map(n => ({
        address: n.address,
        type: n.type,
        provider: n.providerId,
        action: n.action,
        service: n.icon.name,
        network: n.parentNetworkId,
        subnet: n.parentSubnetId,
        zone: n.zone,
        region: n.region
      })),
      edges: parsed.edges.map(e => ({ source: e.source, target: e.target, label: e.label }))
    }, null, 2));
    return;
  }

  console.log(`Plan summary — ${planLabel(planPath)}`);
  console.log(`  Resources : ${parsed.stats.total}`);
  console.log(`  Actions   : +${parsed.stats.create} create, ~${parsed.stats.update} update, -${parsed.stats.delete} destroy, ${parsed.stats.noop} unchanged`);
  console.log(`  Clouds    : ${parsed.providers.map(p => `${p.shortName} (${parsed.nodes.filter(n => n.providerId === p.id).length})`).join(', ') || 'none detected'}`);
  console.log(`  Networks  : ${parsed.networkNodes.length}, subnets: ${parsed.subnetNodes.length}`);
  console.log(`  Edges     : ${parsed.edges.length}, containers: ${layout.containers.length}`);

  const unknown = parsed.nodes.filter(n => n.providerId === 'unknown');
  if (unknown.length > 0) {
    console.log(`  Note      : ${unknown.length} resource(s) from providers this tool does not model yet:`);
    unknown.slice(0, 10).forEach(n => console.log(`              ${n.type} (${n.address})`));
  }
}

function notFound(res) {
  res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
  res.end('Not found');
}

function commandServe(positionals, options) {
  assertUsage('serve', positionals, options, { maxPositionals: 1 });
  const [planPath] = positionals;
  const distDir = path.join(packageRoot, 'dist');

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    throw new Error(
      `Built assets missing at ${distDir}. ` +
      'If you are running from a clone, build them first with: npm run build'
    );
  }

  let planPayload = null;
  if (planPath) {
    const plan = readPlan(planPath);
    // Fail fast on an unparseable plan rather than in the browser.
    const { parsed } = buildDiagram(plan, 'serve');
    reportPlanCaveats(parsed, planPath);
    planPayload = JSON.stringify({
      title: options.title || (planPath === STDIN ? 'Terraform Architecture' : path.basename(planPath)),
      plan
    });
    console.log(`Loaded ${planLabel(planPath)}: ${parsed.nodes.length} resources · clouds: ${parsed.providers.map(p => p.shortName).join(', ') || 'none detected'}`);
  }

  const requestedPort = Number.isInteger(options.port) ? options.port : 5173;
  const host = options.host || '127.0.0.1';
  if (!isLoopbackHost(host)) {
    warn(`binding to ${host} exposes this plan (account ids, CIDR ranges, names) to everyone who can reach that address. See SECURITY.md.`);
  }
  let port = requestedPort; // replaced by the real port once listening (matters for --port 0)

  const server = http.createServer((req, res) => {
    // Only GET/HEAD are ever meaningful for a static viewer.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain', Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }

    if (!isAllowedHost(req.headers.host, host, port, req.socket?.localAddress)) {
      res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
      res.end('Forbidden: unexpected Host header');
      return;
    }

    const url = new URL(req.url, `http://${host}:${port}`);

    if (url.pathname === '/plan.json') {
      if (!planPayload) {
        res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'application/json' });
        res.end('{"error":"no plan supplied"}');
        return;
      }
      res.writeHead(200, {
        ...SECURITY_HEADERS,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(planPayload);
      return;
    }

    const requested = url.pathname === '/' ? '/index.html' : url.pathname;
    const candidate = path.join(distDir, path.normalize(requested).replace(/^(\.\.[/\\])+/, ''));

    // Resolve symlinks before the containment check: comparing an unresolved
    // path lets a link inside dist/ point anywhere on disk. The trailing
    // separator stops a sibling directory that merely shares the prefix
    // (dist-evil) from satisfying startsWith.
    let resolved;
    let stats;
    try {
      resolved = fs.realpathSync(candidate);
      stats = fs.statSync(resolved);
    } catch {
      notFound(res);
      return;
    }

    const root = fs.realpathSync(distDir) + path.sep;
    if (!resolved.startsWith(root) || !stats.isFile()) {
      notFound(res);
      return;
    }

    // Vite fingerprints asset filenames, so they can be cached indefinitely;
    // index.html must always be revalidated or a stale shell pins old assets.
    const isFingerprinted = resolved.includes(`${path.sep}assets${path.sep}`);
    const etag = `W/"${stats.size.toString(16)}-${stats.mtimeMs.toString(16)}"`;

    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, { ...SECURITY_HEADERS, ETag: etag });
      res.end();
      return;
    }

    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': MIME_TYPES[path.extname(resolved)] || 'application/octet-stream',
      'Content-Length': stats.size,
      ETag: etag,
      'Last-Modified': stats.mtime.toUTCString(),
      'Cache-Control': isFingerprinted ? 'public, max-age=31536000, immutable' : 'no-cache'
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    // pipeline() (rather than pipe()) destroys the file stream when the client
    // goes away mid-transfer and surfaces read errors — an unreadable file
    // (permissions, or removed between stat and open) must not take the
    // whole process down.
    pipeline(fs.createReadStream(resolved), res, (err) => {
      if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
        console.error(`Failed to read ${path.relative(distDir, resolved)}: ${err.code || err.message}`);
        res.destroy();
      }
    });
  });

  server.listen(requestedPort, host, () => {
    port = server.address().port;
    const displayHost = net.isIPv6(host) ? `[${host}]` : host;
    const address = `http://${displayHost}:${port}`;
    console.log(`tf-arch viewer running at ${address}`);
    console.log(planPath ? 'Showing your plan. Press Ctrl+C to stop.' : 'No plan supplied — showing built-in demo templates. Press Ctrl+C to stop.');
    if (options.open) openBrowser(address);
  });

  const shutdown = (signal) => {
    console.log(`\nReceived ${signal}; shutting down.`);
    server.close(() => process.exit(0));
    // Do not hang forever on a keep-alive connection.
    setTimeout(() => process.exit(0), 2000).unref();
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Error: port ${requestedPort} is already in use. Try: tf-arch serve --port ${requestedPort + 1} (or --port 0 for a free one)`);
    } else if (err.code === 'EACCES') {
      console.error(`Error: no permission to listen on ${host}:${requestedPort} — ports below 1024 need elevated privileges. Try --port 5173.`);
    } else if (err.code === 'EADDRNOTAVAIL') {
      console.error(`Error: ${host} is not an address of this machine (${err.code}). Check --host.`);
    } else {
      console.error(`Error: cannot listen on ${host}:${requestedPort} (${err.code || err.message})`);
    }
    process.exit(1);
  });
}

function openBrowser(url) {
  const fallback = () => console.log(`Open ${url} in your browser.`);
  import('node:child_process').then(({ spawn }) => {
    const command = process.platform === 'darwin' ? 'open'
      : process.platform === 'win32' ? 'cmd'
      : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    const child = spawn(command, args, { stdio: 'ignore', detached: true });
    // No opener installed (headless Linux, containers, WSL): without this
    // listener the 'error' event is unhandled and kills the running server.
    child.on('error', fallback);
    child.unref();
  }).catch(fallback);
}

function main(argv) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (err) {
    console.error(err.message);
    console.error('\nRun `tf-arch --help` for usage.');
    process.exit(1);
  }

  const { options, positionals } = parsed;

  const [command, ...rest] = positionals;

  if (options.version || command === 'version') {
    console.log(pkg.version);
    return;
  }
  if (options.help || positionals.length === 0 || command === 'help') {
    console.log(USAGE);
    return;
  }

  try {
    switch (command) {
      case 'serve': commandServe(rest, options); break;
      case 'render': commandRender(rest, options); break;
      case 'inspect': commandInspect(rest, options); break;
      default:
        console.error(`Unknown command: ${command}`);
        console.error('\n' + USAGE);
        process.exit(1);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main(process.argv.slice(2));
