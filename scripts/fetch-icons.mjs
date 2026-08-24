#!/usr/bin/env node
/**
 * Downloads the official cloud architecture icon sets used for reference and
 * keeps a checksummed manifest so a scheduled job can tell whether anything
 * actually changed upstream.
 *
 *   node scripts/fetch-icons.mjs                 # refresh every cloud
 *   node scripts/fetch-icons.mjs --cloud azure   # one cloud
 *   node scripts/fetch-icons.mjs --check         # verify only, non-zero on drift
 *   node scripts/fetch-icons.mjs --out /tmp/x    # write somewhere else
 *
 * Sources live in scripts/icons/sources.json. The downloaded SVGs remain the
 * property of their respective cloud vendors under the terms recorded in
 * assets/icons/NOTICE.md — they are NOT covered by this project's MIT license
 * and are deliberately excluded from the published npm package.
 *
 * Exit codes: 0 = up to date / updated, 1 = drift found in --check, 2 = error.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import { unzip } from './lib/unzip.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const SOURCES_FILE = path.join(scriptDir, 'icons', 'sources.json');
const DEFAULT_OUT = path.join(repoRoot, 'assets', 'icons');
const MANIFEST_NAME = 'manifest.json';
const REQUEST_TIMEOUT_MS = 120_000;

function parseArgs(argv) {
  const options = { clouds: [], out: DEFAULT_OUT, check: false, quiet: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--cloud': case '-c': options.clouds.push(argv[++i]); break;
      case '--out': case '-o': options.out = path.resolve(process.cwd(), argv[++i]); break;
      case '--check': options.check = true; break;
      case '--quiet': case '-q': options.quiet = true; break;
      case '--help': case '-h': options.help = true; break;
      default: throw new Error(`Unknown option: ${arg}`);
    }
  }
  return options;
}

const USAGE = `
Download the cloud architecture icon sets and refresh assets/icons/manifest.json.

  --cloud, -c <id>   Only this cloud (repeatable): aws, gcp, azure
  --out,   -o <dir>  Output directory (default: assets/icons)
  --check            Verify against the committed manifest; exit 1 on drift
  --quiet, -q        Only print the summary
  --help,  -h        Show this help
`.trim();

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex');

/**
 * Normalises a ZIP entry name into a repo-relative path, rejecting anything
 * that tries to escape the output directory (zip-slip). Bundle entries arrive
 * looking like `/svg/compute/Virtual-Machine.svg`.
 */
function safeRelativePath(entryName, stripPrefix) {
  let name = entryName.replace(/\\/g, '/');
  if (stripPrefix && name.startsWith(stripPrefix)) name = name.slice(stripPrefix.length);
  name = name.replace(/^\/+/, '');

  const normalised = path.posix.normalize(name);
  if (!normalised || normalised.startsWith('..') || path.posix.isAbsolute(normalised)) {
    throw new Error(`Refusing unsafe archive path: ${entryName}`);
  }
  return normalised;
}

function looksLikeSvg(buffer) {
  const head = buffer.toString('utf8', 0, Math.min(buffer.length, 512)).trimStart();
  return (head.startsWith('<?xml') || head.startsWith('<svg') || head.startsWith('<!--')) &&
    buffer.toString('utf8').includes('</svg>');
}

async function download(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { 'user-agent': 'tf-arch-diagram-generator icon updater (+https://github.com/mchittineni/tf-arch-diagram-generator)' }
  });
  if (!response.ok) {
    throw new Error(`GET ${url} failed: ${response.status} ${response.statusText}`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    etag: response.headers.get('etag') || null,
    lastModified: response.headers.get('last-modified') || null
  };
}

function readManifest(outDir) {
  const file = path.join(outDir, MANIFEST_NAME);
  if (!fs.existsSync(file)) return { sources: {} };
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return { sources: {} };
  }
}

/** Extracts one bundle into `<outDir>/<id>/`, returning file hashes. */
function extractBundle(source, buffer, outDir, { dryRun }) {
  const entries = unzip(buffer).filter(entry => entry.name.toLowerCase().endsWith('.svg'));
  if (entries.length === 0) {
    throw new Error(`${source.id}: bundle contained no .svg files`);
  }

  const cloudDir = path.join(outDir, source.id);
  const files = {};

  if (!dryRun) {
    // Replace wholesale so icons retired upstream do not linger.
    fs.rmSync(cloudDir, { recursive: true, force: true });
    fs.mkdirSync(cloudDir, { recursive: true });
  }

  for (const entry of entries) {
    const relative = safeRelativePath(entry.name, source.stripPrefix);
    if (!looksLikeSvg(entry.data)) {
      throw new Error(`${source.id}: ${relative} does not look like an SVG`);
    }

    files[relative] = sha256(entry.data);

    if (!dryRun) {
      const target = path.join(cloudDir, relative);
      if (!path.resolve(target).startsWith(path.resolve(cloudDir))) {
        throw new Error(`Refusing to write outside ${cloudDir}: ${relative}`);
      }
      fs.mkdirSync(path.dirname(target), { recursive: true });
      // Vendor terms generally forbid altering the icons, so bytes are written
      // through untouched.
      fs.writeFileSync(target, entry.data);
    }
  }

  return files;
}

function diffFiles(previous = {}, next = {}) {
  const prevKeys = new Set(Object.keys(previous));
  const nextKeys = new Set(Object.keys(next));

  return {
    added: [...nextKeys].filter(k => !prevKeys.has(k)).sort(),
    removed: [...prevKeys].filter(k => !nextKeys.has(k)).sort(),
    changed: [...nextKeys].filter(k => prevKeys.has(k) && previous[k] !== next[k]).sort()
  };
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (err) {
    console.error(err.message);
    console.error(`\n${USAGE}`);
    process.exit(2);
  }

  if (options.help) {
    console.log(USAGE);
    return;
  }

  const config = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf8'));
  const selected = options.clouds.length
    ? config.sources.filter(s => options.clouds.includes(s.id))
    : config.sources;

  if (selected.length === 0) {
    console.error(`No matching sources. Available: ${config.sources.map(s => s.id).join(', ')}`);
    process.exit(2);
  }

  const previousManifest = readManifest(options.out);
  const nextManifest = { sources: { ...previousManifest.sources } };
  const log = options.quiet ? () => {} : (...args) => console.log(...args);
  let totalChanges = 0;
  const summary = [];

  for (const source of selected) {
    const previous = previousManifest.sources[source.id];
    log(`\n${source.name} (${source.id})`);
    log(`  source ${source.bundleUrl}`);

    const { buffer, etag, lastModified } = await download(source.bundleUrl);
    log(`  fetched ${(buffer.length / 1024).toFixed(0)} KiB · etag ${etag ?? 'n/a'} · upstream modified ${lastModified ?? 'n/a'}`);

    if (previous?.etag && etag && previous.etag === etag) {
      log('  upstream ETag unchanged since the last run');
    }

    // Always re-extract: a matching ETag only means the bundle is unchanged, not
    // that the files on disk still match the manifest.
    const files = extractBundle(source, buffer, options.out, { dryRun: options.check });
    const { added, removed, changed } = diffFiles(previous?.files, files);
    const changeCount = added.length + removed.length + changed.length;
    totalChanges += changeCount;

    log(`  ${Object.keys(files).length} icons` +
      (previous ? ` · +${added.length} new, -${removed.length} removed, ~${changed.length} modified` : ' (first run)'));

    const preview = (label, list) => {
      if (list.length === 0) return;
      log(`    ${label}: ${list.slice(0, 8).join(', ')}${list.length > 8 ? ` … (+${list.length - 8})` : ''}`);
    };
    preview('new', added);
    preview('removed', removed);
    preview('modified', changed);

    nextManifest.sources[source.id] = {
      name: source.name,
      site: source.site,
      bundleUrl: source.bundleUrl,
      owner: source.owner,
      termsUrl: source.termsUrl,
      etag,
      upstreamLastModified: lastModified,
      iconCount: Object.keys(files).length,
      files
    };

    summary.push({
      id: source.id,
      count: Object.keys(files).length,
      status: previous ? (changeCount === 0 ? 'unchanged' : `${changeCount} change(s)`) : 'added'
    });
  }

  const manifestPath = path.join(options.out, MANIFEST_NAME);
  // Deliberately no timestamp in the manifest: identical upstream content must
  // produce an identical file, so the scheduled job only opens a PR on real drift.
  const serialised = `${JSON.stringify(nextManifest, null, 2)}\n`;

  if (options.check) {
    const current = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf8') : '';
    if (current !== serialised) {
      console.error('\nIcon drift detected: upstream no longer matches the committed manifest.');
      console.error('Run `npm run icons:update` to refresh.');
      process.exit(1);
    }
    log('\nIcons are up to date with the committed manifest.');
    return;
  }

  fs.mkdirSync(options.out, { recursive: true });
  fs.writeFileSync(manifestPath, serialised);

  console.log('\nSummary');
  summary.forEach(s => console.log(`  ${s.id.padEnd(6)} ${String(s.count).padStart(4)} icons  ${s.status}`));
  console.log(`  manifest: ${path.relative(repoRoot, manifestPath)}`);
  console.log(totalChanges === 0
    ? '\nNo upstream changes.'
    : `\n${totalChanges} file-level change(s) written.`);
}

main().catch(err => {
  console.error(`Error: ${err.message}`);
  process.exit(2);
});
