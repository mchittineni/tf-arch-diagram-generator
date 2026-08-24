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
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import { parseTerraformPlan } from '../src/parser/tfPlanParser.js';
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
function isAllowedHost(hostHeader, boundHost, port) {
  if (!hostHeader) return false;
  const hostname = hostHeader.replace(/:\d+$/, '').replace(/^\[|\]$/g, '').toLowerCase();
  const allowed = new Set(['localhost', '127.0.0.1', '::1', '[::1]', boundHost.toLowerCase()]);
  return allowed.has(hostname) || hostHeader.toLowerCase() === `${boundHost.toLowerCase()}:${port}`;
}

const USAGE = `
tf-arch ${pkg.version} — Terraform plan → cloud architecture diagram (AWS, Google Cloud, Azure)

Usage
  tf-arch serve [plan.json] [options]     Open the interactive viewer
  tf-arch render <plan.json> [options]    Write a standalone SVG (no browser)
  tf-arch inspect <plan.json> [options]   Print a plan summary

Options
  -o, --out <file>     Output path for render (default: architecture.svg)
  -t, --title <text>   Diagram title
  -p, --port <number>  Port for serve (default: 5173)
      --host <host>    Host for serve (default: 127.0.0.1)
      --open           Open the viewer in your default browser
      --json           Machine-readable output for inspect
  -h, --help           Show this help
  -v, --version        Show version

Examples
  terraform plan -out=tfplan && terraform show -json tfplan > plan.json
  tf-arch serve plan.json --open
  tf-arch render plan.json --out docs/architecture.svg --title "Production"
  tf-arch inspect plan.json --json | jq '.providers'
`.trim();

function parseArgs(argv) {
  const options = {};
  const positionals = [];

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const takeValue = () => argv[++i];

    switch (arg) {
      case '-o': case '--out': options.out = takeValue(); break;
      case '-t': case '--title': options.title = takeValue(); break;
      case '-p': case '--port': options.port = Number(takeValue()); break;
      case '--host': options.host = takeValue(); break;
      case '--open': options.open = true; break;
      case '--json': options.json = true; break;
      case '-h': case '--help': options.help = true; break;
      case '-v': case '--version': options.version = true; break;
      default:
        if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`);
        positionals.push(arg);
    }
  }
  return { options, positionals };
}

function readPlan(planPath) {
  const resolved = path.resolve(process.cwd(), planPath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`Plan file not found: ${resolved}`);
  }
  const raw = fs.readFileSync(resolved, 'utf8');
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `${planPath} is not valid JSON (${err.message}). ` +
      'Generate it with: terraform show -json tfplan > plan.json'
    );
  }
}

function buildDiagram(plan, title) {
  const parsed = parseTerraformPlan(plan);
  const layout = computeArchitectureLayout(parsed);
  return { parsed, layout, svg: renderStandaloneSvg(layout, { title }) };
}

function commandRender(positionals, options) {
  const [planPath] = positionals;
  if (!planPath) throw new Error('render requires a plan file: tf-arch render plan.json');

  const outPath = path.resolve(process.cwd(), options.out || 'architecture.svg');
  const title = options.title || `Terraform Architecture — ${path.basename(planPath)}`;
  const { parsed, svg } = buildDiagram(readPlan(planPath), title);

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf8');

  const clouds = parsed.providers.map(p => p.shortName).join(', ') || 'none detected';
  console.log(`Wrote ${outPath}`);
  console.log(`  ${parsed.nodes.length} resources · clouds: ${clouds}`);
  console.log(`  +${parsed.stats.create} create  ~${parsed.stats.update} update  -${parsed.stats.delete} destroy`);
}

function commandInspect(positionals, options) {
  const [planPath] = positionals;
  if (!planPath) throw new Error('inspect requires a plan file: tf-arch inspect plan.json');

  const { parsed, layout } = buildDiagram(readPlan(planPath), 'inspect');

  if (options.json) {
    console.log(JSON.stringify({
      stats: parsed.stats,
      providers: parsed.providers,
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

  console.log(`Plan summary — ${planPath}`);
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
    planPayload = JSON.stringify({
      title: options.title || path.basename(planPath),
      plan
    });
    console.log(`Loaded ${planPath}: ${parsed.nodes.length} resources · clouds: ${parsed.providers.map(p => p.shortName).join(', ') || 'none detected'}`);
  }

  const port = Number.isFinite(options.port) ? options.port : 5173;
  const host = options.host || '127.0.0.1';

  const server = http.createServer((req, res) => {
    // Only GET/HEAD are ever meaningful for a static viewer.
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain', Allow: 'GET, HEAD' });
      res.end('Method not allowed');
      return;
    }

    if (!isAllowedHost(req.headers.host, host, port)) {
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

    const stream = fs.createReadStream(resolved);
    // Without this handler an unreadable file (permissions, or a file removed
    // between stat and open) raises an unhandled 'error' event and takes the
    // whole process down.
    stream.on('error', (err) => {
      console.error(`Failed to read ${path.relative(distDir, resolved)}: ${err.code || err.message}`);
      res.destroy();
    });
    stream.pipe(res);
  });

  server.listen(port, host, () => {
    const address = `http://${host}:${port}`;
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
      console.error(`Port ${port} is already in use. Try: tf-arch serve --port ${port + 1}`);
      process.exit(1);
    }
    throw err;
  });
}

function openBrowser(url) {
  import('node:child_process').then(({ spawn }) => {
    const command = process.platform === 'darwin' ? 'open'
      : process.platform === 'win32' ? 'cmd'
      : 'xdg-open';
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
    spawn(command, args, { stdio: 'ignore', detached: true }).unref();
  }).catch(() => {
    console.log(`Open ${url} in your browser.`);
  });
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

  if (options.version) {
    console.log(pkg.version);
    return;
  }
  if (options.help || positionals.length === 0) {
    console.log(USAGE);
    return;
  }

  const [command, ...rest] = positionals;

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
