import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

/**
 * Renders the real application shell in jsdom.
 *
 * These are the tests that catch a blank page: the unit tests all pass while
 * the browser shows nothing if the App constructor throws, so here we assert on
 * what actually ends up in the DOM.
 */
async function mountApp({ planResponse } = {}) {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost:5173/',
    pretendToBeVisual: true
  });

  const { window } = dom;
  const consoleErrors = [];

  global.window = window;
  global.document = window.document;
  global.Blob = window.Blob;
  global.XMLSerializer = window.XMLSerializer;
  global.URL = window.URL;
  global.alert = (message) => { throw new Error(`unexpected alert(): ${message}`); };
  global.fetch = async () => planResponse ?? { ok: false, status: 404, headers: new Map() };

  const originalError = console.error;
  console.error = (...args) => consoleErrors.push(args.join(' '));

  // Surface anything the constructor throws asynchronously.
  const uncaught = [];
  window.addEventListener('error', (event) => uncaught.push(event.message));

  const { App } = await import('../src/app.js');
  const app = new App();
  // Let bootstrap()'s awaited fetch settle.
  await new Promise(resolve => setTimeout(resolve, 0));

  console.error = originalError;
  return { app, window, document: window.document, consoleErrors, uncaught };
}

test('the app renders its navbar, sidebar and diagram on load', async () => {
  const { document, consoleErrors, uncaught } = await mountApp();

  assert.deepEqual(uncaught, [], 'no uncaught errors during startup');
  assert.deepEqual(consoleErrors, [], 'no console errors during startup');

  const navbar = document.querySelector('#navbar-container .navbar');
  assert.ok(navbar, 'navbar should be rendered');
  assert.match(navbar.textContent, /Terraform Architecture Visualizer/);

  const sidebar = document.querySelector('#sidebar-container .sidebar-header');
  assert.ok(sidebar, 'sidebar should be rendered');
  assert.ok(
    document.querySelectorAll('#sidebar-container .resource-tree-item').length > 0,
    'sidebar should list resources'
  );

  assert.ok(document.querySelector('#main-svg'), 'diagram SVG should exist');
  assert.ok(
    document.querySelectorAll('#nodes-layer .diagram-node').length > 0,
    'diagram should render resource nodes'
  );
  assert.ok(
    document.querySelectorAll('#containers-layer .container-network').length > 0,
    'diagram should render the VPC container'
  );
});

test('the canvas controls survive canvas initialisation and stay wired', async () => {
  const { document } = await mountApp();

  // Regression guard: DiagramCanvas used to overwrite the whole canvas
  // container, destroying these controls and throwing on bind.
  for (const id of ['btn-zoom-in', 'btn-zoom-out', 'btn-fit-screen', 'btn-reset-view']) {
    assert.ok(document.getElementById(id), `#${id} must still be in the DOM`);
  }
  assert.ok(document.querySelector('.legend-overlay'), 'legend should survive');
  assert.ok(document.querySelector('#canvas-container #main-svg'), 'canvas mounts inside the container');
});

test('zoom controls change the canvas transform', async () => {
  const { document } = await mountApp();
  const viewport = document.getElementById('viewport-group');
  const before = viewport.getAttribute('transform');

  document.getElementById('btn-zoom-in').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  assert.notEqual(viewport.getAttribute('transform'), before, 'zoom in should change the transform');
});

test('switching template re-renders the diagram for another cloud', async () => {
  const { document, window } = await mountApp();

  const select = document.getElementById('template-select');
  select.value = 'azureAks';
  select.dispatchEvent(new window.Event('change', { bubbles: true }));

  const nodeText = document.querySelector('#nodes-layer').textContent;
  assert.match(nodeText, /kubernetes|Kubernetes/, 'Azure resources should now be on the canvas');
});

test('a plan served by the CLI is loaded instead of the demo template', async () => {
  const plan = {
    resource_changes: [{
      address: 'google_storage_bucket.served',
      type: 'google_storage_bucket',
      name: 'served',
      change: { actions: ['create'], after: { name: 'served-bucket' } }
    }]
  };

  const { app, document } = await mountApp({
    planResponse: {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'application/json']]),
      json: async () => ({ title: 'Served plan', plan })
    }
  });

  assert.equal(app.parsedPlan.nodes.length, 1);
  assert.equal(app.parsedPlan.nodes[0].address, 'google_storage_bucket.served');
  assert.match(document.querySelector('#nodes-layer').textContent, /served/);
});

test('a dev-server HTML fallback for plan.json falls back to the demo plan', async () => {
  // Vite answers unknown paths with index.html and HTTP 200, so an ok response
  // is not proof that a plan was served.
  const { app, consoleErrors } = await mountApp({
    planResponse: {
      ok: true,
      status: 200,
      headers: new Map([['content-type', 'text/html']]),
      json: async () => { throw new SyntaxError('Unexpected token <'); }
    }
  });

  assert.ok(app.parsedPlan.nodes.length > 1, 'should have loaded the demo plan');
  assert.deepEqual(consoleErrors, [], 'the HTML fallback must not log an error');
});
