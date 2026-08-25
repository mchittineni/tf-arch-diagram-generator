import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
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

const withTempDir = (fn) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-arch-'));
  try { return fn(dir); } finally { fs.rmSync(dir, { recursive: true, force: true }); }
};
const runFull = (args, input) => {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8', input });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
};

test('value-taking options refuse a missing value or a following flag', () => {
  for (const args of [['render', examplePlan, '--out'], ['render', examplePlan, '--title', '--out', 'x.svg'], ['serve', '--port']]) {
    const { code, stderr } = runFull(args);
    assert.equal(code, 1, args.join(' '));
    assert.match(stderr, /requires a value/);
  }
});

test('ports are validated instead of silently defaulting', () => {
  for (const bad of ['abc', '-1', '70000', '5173.5']) {
    const { code, stderr } = runFull(['serve', '--port', bad]);
    assert.equal(code, 1, bad);
    assert.match(stderr, /--port must be an integer between 0 and 65535/);
  }
});

test('options for the wrong command and extra plan files are rejected', () => {
  assert.match(runFull(['render', examplePlan, '--json']).stderr, /--json not valid for render/);
  assert.match(runFull(['serve', '--out', 'x.svg']).stderr, /--out not valid for serve/);
  assert.match(runFull(['inspect', examplePlan, examplePlan]).stderr, /Unexpected argument/);
});

test('version and help work as commands too', () => {
  assert.match(runFull(['version']).stdout, /^\d+\.\d+\.\d+/);
  assert.match(runFull(['help']).stdout, /Usage/);
});

test('a plan can be piped in on stdin', () => {
  const plan = fs.readFileSync(examplePlan, 'utf8');
  const report = JSON.parse(runFull(['inspect', '-', '--json'], plan).stdout);
  assert.deepEqual(report.providers.map(p => p.id), ['aws', 'gcp', 'azure']);
  assert.deepEqual(report.unmodelled, []);
  assert.equal(report.edgesTruncated, 0);

  withTempDir((dir) => {
    const out = path.join(dir, 'stdin.svg');
    const { code, stdout } = runFull(['render', '-', '--out', out], plan);
    assert.equal(code, 0);
    assert.match(stdout, /Wrote/);
    assert.ok(fs.readFileSync(out, 'utf8').includes('<title>Terraform Architecture</title>') || fs.readFileSync(out, 'utf8').includes('Terraform Architecture'));
  });
});

test('a binary tfplan and a directory are diagnosed, not reported as bad JSON', () => {
  withTempDir((dir) => {
    const tfplan = path.join(dir, 'tfplan');
    fs.writeFileSync(tfplan, Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]));
    assert.match(runFull(['inspect', tfplan]).stderr, /binary Terraform plan.*terraform show -json/);
    assert.match(runFull(['inspect', dir]).stderr, /is a directory/);
    assert.match(runFull(['render', examplePlan, '--out', dir]).stderr, /is a directory; give the SVG a file name/);
  });
});

test('caveats go to stderr: empty plans and unmodelled providers, while --json stdout stays clean', () => {
  withTempDir((dir) => {
    const empty = path.join(dir, 'empty.json');
    fs.writeFileSync(empty, '{}');
    const { code, stderr } = runFull(['render', empty, '--out', path.join(dir, 'e.svg')]);
    assert.equal(code, 0);
    assert.match(stderr, /Warning: no resources found/);

    const mixed = path.join(dir, 'mixed.json');
    fs.writeFileSync(mixed, JSON.stringify({ resource_changes: [
      { address: 'random_pet.x', type: 'random_pet', name: 'x', change: { actions: ['create'], after: {} } },
      { address: 'aws_vpc.v', type: 'aws_vpc', name: 'v', change: { actions: ['create'], after: {} } }
    ] }));
    const result = runFull(['inspect', mixed, '--json']);
    assert.match(result.stderr, /Warning: 1 resource\(s\) from providers this tool does not model yet.*random_pet/);
    const report = JSON.parse(result.stdout); // stdout must parse on its own
    assert.deepEqual(report.unmodelled, [{ address: 'random_pet.x', type: 'random_pet' }]);
    assert.match(runFull(['render', mixed, '--out', path.join(dir, 'm.svg')]).stderr, /does not model yet/);
  });
});
