#!/usr/bin/env node
/**
 * Coverage gate: runs the test suite with V8 coverage and fails unless the
 * project-wide line coverage AND every individual source file meet the floor.
 *
 * Node's own --test-coverage-lines flag prints the report but does not fail
 * the process on this Node version, so the gate parses the report instead.
 *
 * Exit codes: 0 = above threshold, 1 = below, 2 = harness error.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const LINE_THRESHOLD = 90;         // per-file and overall
const BRANCH_THRESHOLD_ALL = 80;   // overall only: single-file branch % is noisy

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Expand the suite ourselves: a bare directory argument is not resolvable by
// the module loader, and shell globs never reach us.
const defaultSuite = fs.readdirSync(path.join(root, 'test'))
  .filter(f => f.endsWith('.test.js'))
  .map(f => path.join('test', f));

const result = spawnSync(process.execPath, [
  '--test',
  '--experimental-test-coverage',
  // Pin the reporter: without a TTY, Node 22 defaults to TAP, which prints the
  // coverage report in a different shape than the spec table parsed below.
  '--test-reporter=spec',
  '--test-reporter-destination=stdout',
  '--test-coverage-exclude=test/**',
  ...(process.argv.slice(2).length ? process.argv.slice(2) : defaultSuite)
], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

const output = `${result.stdout}\n${result.stderr}`;

if (result.status !== 0) {
  process.stdout.write(output);
  console.error('\nCoverage gate: the test run itself failed.');
  process.exit(2);
}

// Rows look like: "ℹ  cli.js  |  95.81 |    78.38 |   89.29 | 219-223"
const rows = [...output.matchAll(/^ℹ\s+(.+?)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|/gm)]
  .map(m => ({ file: m[1].trim(), lines: Number(m[2]), branches: Number(m[3]) }))
  .filter(r => r.file !== 'file');

if (rows.length === 0) {
  console.error('Coverage gate: no coverage table found in the test output.');
  process.exit(2);
}

// Completeness: a file that no test imports never appears in the table, so
// low coverage could hide by omission. Every shipped source file must show up.
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e =>
  e.isDirectory() ? walk(path.join(dir, e.name))
    : /\.(js|mjs)$/.test(e.name) ? [path.join(dir, e.name)] : []
);
// src/main.js is the browser entry point: it imports CSS, which Node cannot
// evaluate, so it is exercised by the headless-browser checks instead.
const EXEMPT = new Set(['src/main.js']);
const expected = [...walk('src'), ...walk('bin')].filter(f => !EXEMPT.has(f));

const all = rows.find(r => r.file === 'all files');
const files = rows.filter(r => r.file.endsWith('.js') || r.file.endsWith('.mjs'));
const failures = [];

if (!all) {
  console.error('Coverage gate: missing "all files" summary row.');
  process.exit(2);
}
if (all.lines < LINE_THRESHOLD) failures.push(`overall line coverage ${all.lines}% < ${LINE_THRESHOLD}%`);
if (all.branches < BRANCH_THRESHOLD_ALL) failures.push(`overall branch coverage ${all.branches}% < ${BRANCH_THRESHOLD_ALL}%`);
for (const row of files) {
  if (row.lines < LINE_THRESHOLD) failures.push(`${row.file}: ${row.lines}% lines < ${LINE_THRESHOLD}%`);
}

// The table nests by directory and prints basenames, so compare counts per
// basename rather than full paths.
const seen = files.map(r => path.basename(r.file));
for (const file of expected) {
  const base = path.basename(file);
  const needed = expected.filter(f => path.basename(f) === base).length;
  const found = seen.filter(b => b === base).length;
  if (found < needed) {
    failures.push(`${file}: absent from the coverage report — no test imports it`);
    seen.push(base); // report each missing path once
  }
}

console.log(`Coverage gate: overall ${all.lines}% lines / ${all.branches}% branches across ${files.length} files (floor: ${LINE_THRESHOLD}% lines per file and overall, ${BRANCH_THRESHOLD_ALL}% branches overall).`);

if (failures.length > 0) {
  console.error('\nBelow threshold:');
  failures.forEach(f => console.error(`  ${f}`));
  process.exit(1);
}
console.log('All files meet the floor.');
