#!/usr/bin/env node
/**
 * Guards the third-party icon assets in assets/icons/.
 *
 * Those files come from a CDN we do not control, and SVG is an active document
 * format: it can carry <script>, event handlers, remote <image>/<use>
 * references and XML entity declarations. None of that belongs in the repo,
 * whatever upstream decides to publish, so the semiannual refresh is gated on
 * this check.
 *
 * Exit codes: 0 = clean, 1 = active content found, 2 = error.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const target = process.argv[2]
  ? path.resolve(process.cwd(), process.argv[2])
  : path.join(repoRoot, 'assets', 'icons');

const RULES = [
  { name: 'script element', pattern: /<script[\s>]/i },
  { name: 'inline event handler', pattern: /\son[a-z]+\s*=/i },
  { name: 'javascript: URL', pattern: /javascript:/i },
  { name: 'foreignObject', pattern: /<foreignObject[\s>]/i },
  { name: 'iframe/embed/object', pattern: /<(?:iframe|embed|object)[\s>]/i },
  { name: 'XML entity declaration', pattern: /<!ENTITY/i },
  { name: 'external reference', pattern: /(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i },
  { name: 'data: HTML payload', pattern: /data:text\/html/i },
  { name: 'CSS import', pattern: /@import/i },
  // url(#gradient) local references are fine; only remote url() beacons out
  // when an exported SVG is opened at file:// with no CSP.
  { name: 'external CSS url()', pattern: /url\(\s*["']?\s*(?:https?:)?\/\//i }
];

// `xmlns="http://www.w3.org/..."` is a namespace identifier, never fetched.
const NAMESPACE_ATTR = /xmlns(?::[a-z]+)?\s*=\s*["'][^"']*["']/gi;

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg')) out.push(full);
  }
  return out;
}

if (!fs.existsSync(target)) {
  console.log(`No icon assets at ${path.relative(repoRoot, target)} — nothing to scan.`);
  process.exit(0);
}

const files = walk(target);
const findings = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8').replace(NAMESPACE_ATTR, '');
  for (const rule of RULES) {
    if (rule.pattern.test(content)) {
      findings.push({ file: path.relative(repoRoot, file), rule: rule.name });
    }
  }
}

console.log(`Scanned ${files.length} SVG file(s) in ${path.relative(repoRoot, target)}`);

if (findings.length > 0) {
  console.error(`\nActive content found in ${findings.length} case(s):`);
  findings.slice(0, 40).forEach(f => console.error(`  ${f.rule.padEnd(24)} ${f.file}`));
  if (findings.length > 40) console.error(`  … and ${findings.length - 40} more`);
  console.error('\nDo not commit these assets. Inspect upstream before refreshing.');
  process.exit(1);
}

console.log('No active content found.');
