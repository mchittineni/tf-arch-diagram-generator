import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'cli.js');
const examplePlan = path.join(root, 'examples', 'multi-cloud.plan.json');

const run = (args) => execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8' });

test('tf-arch --help lists the commands', () => {
  const out = run(['--help']);
  for (const command of ['serve', 'render', 'inspect']) {
    assert.match(out, new RegExp(`tf-arch ${command}`));
  }
});

test('tf-arch --version prints the package version', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(run(['--version']).trim(), pkg.version);
});

test('tf-arch render writes a standalone SVG', () => {
  const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-arch-'));
  const outFile = path.join(outDir, 'nested', 'diagram.svg');

  const stdout = run(['render', examplePlan, '--out', outFile, '--title', 'Landing Zone']);
  assert.match(stdout, /Wrote/);

  const svg = fs.readFileSync(outFile, 'utf8');
  assert.match(svg, /^<svg xmlns/);
  assert.ok(svg.includes('Landing Zone'));
  fs.rmSync(outDir, { recursive: true, force: true });
});

test('tf-arch inspect --json reports providers and resources', () => {
  const report = JSON.parse(run(['inspect', examplePlan, '--json']));
  assert.equal(report.stats.total, report.resources.length);
  assert.deepEqual(report.providers.map(p => p.id), ['aws', 'gcp', 'azure']);
});

test('tf-arch fails clearly on a missing or invalid plan', () => {
  assert.throws(
    () => run(['render', path.join(root, 'nope.json')]),
    (err) => /Plan file not found/.test(err.stderr)
  );

  const badFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'tf-arch-')), 'bad.json');
  fs.writeFileSync(badFile, '{ not json');
  assert.throws(
    () => run(['inspect', badFile]),
    (err) => /not valid JSON/.test(err.stderr)
  );
});

test('tf-arch rejects unknown commands and options with usage help', () => {
  assert.throws(() => run(['frobnicate']), (err) => /Unknown command: frobnicate/.test(err.stderr));
  assert.throws(() => run(['render', '--bogus']), (err) => /Unknown option: --bogus/.test(err.stderr));
  assert.throws(() => run(['render']), (err) => /render requires a plan file/.test(err.stderr));
  assert.throws(() => run(['inspect']), (err) => /inspect requires a plan file/.test(err.stderr));
});

test('tf-arch inspect prints the human-readable summary', () => {
  const out = run(['inspect', examplePlan]);
  assert.match(out, /Plan summary/);
  assert.match(out, /Resources : \d+/);
  assert.match(out, /Clouds\s+: AWS/);
});

test('tf-arch inspect reports resources from unmodelled providers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-arch-'));
  const planFile = path.join(dir, 'plan.json');
  fs.writeFileSync(planFile, JSON.stringify({
    resource_changes: [
      { address: 'random_pet.x', type: 'random_pet', name: 'x', change: { actions: ['create'], after: {} } }
    ]
  }));
  const out = run(['inspect', planFile]);
  assert.match(out, /providers this tool does not model yet/);
  assert.match(out, /random_pet/);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('tf-arch refuses to run on end-of-life Node versions', () => {
  // process.versions.node is configurable, so a preload can simulate an old
  // runtime without one being installed.
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-arch-node-'));
  const shim = path.join(dir, 'fake-node-version.mjs');

  const runAs = (version) => {
    fs.writeFileSync(shim, `Object.defineProperty(process.versions, 'node', { value: '${version}' });`);
    return execFileSync(process.execPath, ['--import', shim, cli, '--version'], { encoding: 'utf8' });
  };

  try {
    for (const eol of ['18.20.4', '20.19.0']) {
      assert.throws(
        () => runAs(eol),
        (err) => err.status === 1 && /requires Node 22 or newer/.test(err.stderr) && new RegExp(eol).test(err.stderr),
        `Node ${eol} must be refused`
      );
    }
    // The oldest supported line still works.
    assert.match(runAs('22.0.0'), /^\d+\.\d+\.\d+/m);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
