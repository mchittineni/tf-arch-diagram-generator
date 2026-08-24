import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import os from 'node:os';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(root, 'bin', 'cli.js');
const examplePlan = path.join(root, 'examples', 'aws-eks.plan.json');
const distDir = path.join(root, 'dist');

/**
 * Integration tests for `tf-arch serve`: they exercise the real server over
 * real sockets, covering the hardening added in the security/backend review —
 * host validation, method restriction, traversal/symlink containment,
 * crash resilience and caching.
 */

const PORT = 5710 + (process.pid % 200); // avoid collisions across runners

function startServer(extraArgs = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'serve', examplePlan, '--port', String(PORT), ...extraArgs], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    let output = '';
    const onData = (chunk) => {
      output += chunk;
      if (output.includes('viewer running')) resolve(child);
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.once('exit', (code) => reject(new Error(`server exited early (${code}): ${output}`)));
    setTimeout(() => reject(new Error(`server did not start: ${output}`)), 10_000).unref();
  });
}

function stopServer(child) {
  return new Promise((resolve) => {
    if (child.exitCode !== null) return resolve();
    child.once('exit', resolve);
    child.kill('SIGTERM');
    setTimeout(() => { child.kill('SIGKILL'); resolve(); }, 3000).unref();
  });
}

/** fetch() follows no redirects here and never throws on HTTP errors. */
const get = (pathname, init = {}) => fetch(`http://127.0.0.1:${PORT}${pathname}`, init);

test('tf-arch serve behaves correctly end to end', async (t) => {
  const hasDist = fs.existsSync(path.join(distDir, 'index.html'));
  if (!hasDist) {
    t.skip('dist/ not built — run `npm run build` first');
    return;
  }

  const server = await startServer();
  t.after(() => stopServer(server));

  await t.test('serves the app and the plan', async () => {
    const index = await get('/');
    assert.equal(index.status, 200);
    assert.match(index.headers.get('content-type'), /text\/html/);

    const plan = await get('/plan.json');
    assert.equal(plan.status, 200);
    const payload = await plan.json();
    assert.equal(typeof payload.plan, 'object');
    assert.ok(payload.title);
  });

  await t.test('sends the security headers on every response class', async () => {
    for (const pathname of ['/', '/plan.json', '/definitely-missing']) {
      const res = await get(pathname);
      assert.ok(res.headers.get('content-security-policy'), `${pathname}: CSP missing`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff', pathname);
      assert.equal(res.headers.get('x-frame-options'), 'DENY', pathname);
    }
  });

  await t.test('rejects spoofed Host headers (DNS rebinding)', async () => {
    // fetch() silently drops Host overrides (it's a forbidden header), so use
    // a raw request — exactly what a rebinding attacker's browser would send.
    const rawStatus = (host) => new Promise((resolve, reject) => {
      const req = http.request(
        { host: '127.0.0.1', port: PORT, path: '/plan.json', headers: { Host: host } },
        (res) => { res.resume(); resolve(res.statusCode); }
      );
      req.on('error', reject);
      req.end();
    });

    assert.equal(await rawStatus('evil.example'), 403);
    assert.equal(await rawStatus(`attacker.example:${PORT}`), 403);
    assert.equal(await rawStatus(`localhost:${PORT}`), 200);
    assert.equal(await rawStatus(`127.0.0.1:${PORT}`), 200);
  });

  await t.test('allows only GET and HEAD', async () => {
    for (const method of ['POST', 'PUT', 'DELETE', 'PATCH']) {
      const res = await get('/', { method });
      assert.equal(res.status, 405, method);
    }
    const head = await get('/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal((await head.arrayBuffer()).byteLength, 0, 'HEAD must carry no body');
  });

  await t.test('blocks path traversal in every encoding', async () => {
    const attempts = [
      '/../package.json',
      '/../../etc/passwd',
      '/%2e%2e/package.json',
      '/%2e%2e%2fpackage.json',
      '/..%2fpackage.json',
      '/....//package.json',
      '/assets/../../package.json'
    ];
    for (const attempt of attempts) {
      const res = await get(attempt);
      assert.equal(res.status, 404, attempt);
      assert.ok(!(await res.text()).includes('"name"'), `${attempt} leaked file content`);
    }
  });

  await t.test('does not follow symlinks out of dist/', async () => {
    const link = path.join(distDir, 'escape-test.txt');
    fs.symlinkSync('/etc/hosts', link);
    try {
      const res = await get('/escape-test.txt');
      assert.equal(res.status, 404, 'symlink escaping dist/ must not be served');
    } finally {
      fs.unlinkSync(link);
    }
  });

  await t.test('survives an unreadable file and keeps serving', async () => {
    const locked = path.join(distDir, 'locked-test.txt');
    fs.writeFileSync(locked, 'x');
    fs.chmodSync(locked, 0o000);
    try {
      await get('/locked-test.txt').then(r => r.arrayBuffer()).catch(() => {});
      // The regression this guards: the stream error used to crash the process.
      const after = await get('/');
      assert.equal(after.status, 200, 'server must still be alive');
    } finally {
      fs.chmodSync(locked, 0o644);
      fs.unlinkSync(locked);
    }
  });

  await t.test('serves fingerprinted assets with immutable caching and honours ETags', async () => {
    const html = await (await get('/')).text();
    const asset = html.match(/assets\/index-[^"]+\.js/)?.[0];
    assert.ok(asset, 'built index.html should reference a fingerprinted asset');

    const first = await get(`/${asset}`);
    assert.equal(first.status, 200);
    assert.match(first.headers.get('cache-control'), /immutable/);
    const etag = first.headers.get('etag');
    assert.ok(etag, 'asset must carry an ETag');

    const conditional = await get(`/${asset}`, { headers: { 'If-None-Match': etag } });
    assert.equal(conditional.status, 304);

    const index = await get('/');
    assert.equal(index.headers.get('cache-control'), 'no-cache', 'the shell must revalidate');
  });
});

test('tf-arch serve without a plan answers /plan.json with 404', async (t) => {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    t.skip('dist/ not built');
    return;
  }
  const port = PORT + 1;
  const child = spawn(process.execPath, [cli, 'serve', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => new Promise((resolve) => { child.once('exit', resolve); child.kill('SIGTERM'); }));

  await new Promise((resolve, reject) => {
    let out = '';
    child.stdout.on('data', (c) => { out += c; if (out.includes('viewer running')) resolve(); });
    setTimeout(() => reject(new Error('no start')), 10_000).unref();
  });

  const res = await fetch(`http://127.0.0.1:${port}/plan.json`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { error: 'no plan supplied' });

  const index = await fetch(`http://127.0.0.1:${port}/`);
  assert.equal(index.status, 200, 'demo mode still serves the app');
});

test('tf-arch serve fails clearly when the built assets are missing', () => {
  // Point the loader at a copy of the package without dist/ by renaming; too
  // invasive — instead exercise the branch via a bad port type which reaches
  // the same validation layer? No: test the real branch with a temp HOME copy.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tf-arch-nodist-'));
  for (const entry of ['bin', 'src', 'package.json']) {
    fs.cpSync(path.join(root, entry), path.join(tmp, entry), { recursive: true });
  }
  try {
    execFileSync(process.execPath, [path.join(tmp, 'bin', 'cli.js'), 'serve'], { encoding: 'utf8' });
    assert.fail('serve should have exited non-zero');
  } catch (err) {
    assert.match(String(err.stderr), /Built assets missing/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('tf-arch serve reports a port conflict instead of crashing with a stack', async (t) => {
  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    t.skip('dist/ not built');
    return;
  }
  const port = PORT + 2;
  const first = spawn(process.execPath, [cli, 'serve', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  t.after(() => new Promise((resolve) => { first.once('exit', resolve); first.kill('SIGTERM'); }));
  await new Promise((resolve) => {
    let out = '';
    first.stdout.on('data', (c) => { out += c; if (out.includes('viewer running')) resolve(); });
  });

  const second = spawn(process.execPath, [cli, 'serve', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  const result = await new Promise((resolve) => {
    let err = '';
    second.stderr.on('data', (c) => { err += c; });
    second.once('exit', (code) => resolve({ code, err }));
  });
  assert.equal(result.code, 1);
  assert.match(result.err, /already in use/);
  assert.doesNotMatch(result.err, /at Server/, 'no raw stack trace');
});
