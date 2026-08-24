#!/usr/bin/env node
/**
 * Generates src/providers/<p>/officialIcons.js from the official vendor SVGs
 * in assets/icons/, using the key → file mapping in scripts/icons/mapping.json.
 *
 *   node scripts/build-icon-modules.mjs           # regenerate all three
 *   node scripts/build-icon-modules.mjs --check   # verify only, non-zero on drift
 *
 * Each SVG is sanitized and normalized before embedding:
 *   - XML prolog, DOCTYPE, comments, <title>/<desc> stripped
 *   - active content rejected (same rules as scripts/scan-svg-assets.mjs)
 *   - `id` attributes and `.class` names namespaced per icon, because the
 *     vendor sets reuse the same identifiers in every file (`linearGradient-1`,
 *     `.cls-1`, …) and the diagram inlines many icons into ONE SVG document
 *   - root width/height removed so the renderer controls the viewport size
 *
 * The embedded SVGs remain the property of their respective vendors under the
 * terms recorded in assets/icons/NOTICE.md.
 *
 * Exit codes: 0 = ok, 1 = drift found in --check, 2 = error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const MAPPING_FILE = path.join(scriptDir, 'icons', 'mapping.json');
const ASSETS_DIR = path.join(repoRoot, 'assets', 'icons');

const PROVIDER_DIRS = {
  aws: path.join(repoRoot, 'src', 'providers', 'aws'),
  gcp: path.join(repoRoot, 'src', 'providers', 'gcp'),
  azure: path.join(repoRoot, 'src', 'providers', 'azure')
};

/** Same active-content rules that gate the semiannual asset refresh. */
const ACTIVE_CONTENT_RULES = [
  { name: 'script element', pattern: /<script[\s>]/i },
  { name: 'inline event handler', pattern: /\son[a-z]+\s*=/i },
  { name: 'javascript: URL', pattern: /javascript:/i },
  { name: 'foreignObject', pattern: /<foreignObject[\s>]/i },
  { name: 'iframe/embed/object', pattern: /<(?:iframe|embed|object)[\s>]/i },
  { name: 'XML entity declaration', pattern: /<!ENTITY/i },
  { name: 'external reference', pattern: /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i },
  { name: 'data: HTML payload', pattern: /data:text\/html/i },
  { name: 'CSS import', pattern: /@import/i }
];

const NAMESPACE_ATTR = /xmlns(?::[a-z]+)?\s*=\s*["'][^"']*["']/gi;

function assertNoActiveContent(svg, sourcePath) {
  const stripped = svg.replace(NAMESPACE_ATTR, '');
  for (const rule of ACTIVE_CONTENT_RULES) {
    if (rule.pattern.test(stripped)) {
      throw new Error(`${sourcePath}: refusing to embed — ${rule.name}`);
    }
  }
}

/** Strips prolog, DOCTYPE, comments and metadata elements. */
function stripMetadata(svg) {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<!DOCTYPE[\s\S]*?>/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<desc>[\s\S]*?<\/desc>/gi, '')
    .replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
}

/**
 * Prefixes every id and class name so icons from the same vendor set can be
 * inlined side by side in one document without gradients/styles cross-wiring.
 */
function namespaceIdentifiers(svg, prefix) {
  const ids = new Set();
  for (const match of svg.matchAll(/\sid="([^"]+)"/g)) ids.add(match[1]);
  let out = svg;
  for (const id of ids) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next = `${prefix}-${id}`;
    out = out
      .replace(new RegExp(`(\\sid=")${safe}(")`, 'g'), `$1${next}$2`)
      .replace(new RegExp(`(url\\(#)${safe}(\\))`, 'g'), `$1${next}$2`)
      .replace(new RegExp(`((?:xlink:)?href="#)${safe}(")`, 'g'), `$1${next}$2`);
  }

  const classes = new Set();
  for (const match of svg.matchAll(/class="([^"]+)"/g)) {
    match[1].trim().split(/\s+/).forEach(c => classes.add(c));
  }
  for (const cls of classes) {
    const safe = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const next = `${prefix}-${cls}`;
    out = out
      .replace(new RegExp(`\\.${safe}(?![\\w-])`, 'g'), `.${next}`)
      .replace(new RegExp(`(class="[^"]*?)(?<![\\w-])${safe}(?![\\w-])`, 'g'), `$1${next}`);
  }
  return out;
}

/** Removes fixed width/height from the root element; the renderer sizes icons. */
function normalizeRoot(svg, sourcePath) {
  const rootMatch = svg.match(/<svg\b[^>]*>/);
  if (!rootMatch) throw new Error(`${sourcePath}: no <svg> root element`);
  if (!/viewBox="[^"]+"/.test(rootMatch[0])) {
    throw new Error(`${sourcePath}: root <svg> is missing a viewBox`);
  }
  return svg.replace(/<svg\b([^>]*)>/, (_m, attrs) => {
    const cleaned = attrs.replace(/\s(?:width|height)="[^"]*"/g, '');
    return `<svg${cleaned}>`;
  });
}

function minify(svg) {
  return svg.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
}

function buildIcon(provider, key, relPath) {
  const sourcePath = path.join(ASSETS_DIR, provider, relPath);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`${provider}/${key}: missing asset ${relPath} — run \`npm run icons:update\` first`);
  }
  let svg = stripMetadata(fs.readFileSync(sourcePath, 'utf8'));
  assertNoActiveContent(svg, sourcePath);
  svg = normalizeRoot(svg, sourcePath);
  svg = namespaceIdentifiers(svg, `tfarch-${provider}-${key}`);
  return minify(svg);
}

function renderModule(provider, icons, sources) {
  const entries = Object.entries(icons)
    .map(([key, svg]) => `  ${JSON.stringify(key)}: ${JSON.stringify(svg)}`)
    .join(',\n');
  return `/**
 * GENERATED FILE — do not edit by hand.
 *
 * Official ${provider.toUpperCase()} architecture icons, embedded from assets/icons/${provider}/
 * by scripts/build-icon-modules.mjs (mapping: scripts/icons/mapping.json).
 * Regenerate with: npm run icons:build
 *
 * The artwork is the property of its vendor — see assets/icons/NOTICE.md.
 * Sources: ${sources.join(', ')}
 */

export const OFFICIAL_ICONS = {
${entries}
};
`;
}

const check = process.argv.includes('--check');

try {
  const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
  let drift = false;

  for (const [provider, keys] of Object.entries(mapping)) {
    if (provider.startsWith('$')) continue;
    const icons = {};
    const sources = new Set();
    for (const [key, relPath] of Object.entries(keys)) {
      if (relPath === null) continue; // no official icon exists; provider keeps a neutral glyph
      icons[key] = buildIcon(provider, key, relPath);
      sources.add(relPath);
    }
    const outPath = path.join(PROVIDER_DIRS[provider], 'officialIcons.js');
    const next = renderModule(provider, icons, [...sources].sort());
    const current = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (current === next) {
      console.log(`${provider}: up to date (${Object.keys(icons).length} icons)`);
    } else if (check) {
      console.error(`${provider}: ${path.relative(repoRoot, outPath)} is stale`);
      drift = true;
    } else {
      fs.writeFileSync(outPath, next);
      console.log(`${provider}: wrote ${path.relative(repoRoot, outPath)} (${Object.keys(icons).length} icons)`);
    }
  }

  process.exit(drift ? 1 : 0);
} catch (error) {
  console.error(`build-icon-modules: ${error.message}`);
  process.exit(2);
}
