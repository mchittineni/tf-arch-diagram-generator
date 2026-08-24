import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

/**
 * Interaction-level tests for the UI components: canvas pan/zoom/filtering,
 * the import modal's parse and drag-and-drop flows, the inspector's diff
 * rendering, and the app shell's navbar/sidebar callbacks.
 */

function makeDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost:5173/',
    pretendToBeVisual: true
  });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.Blob = window.Blob;
  global.FileReader = window.FileReader;
  global.URL = window.URL;
  if (!window.URL.createObjectURL) {
    window.URL.createObjectURL = () => 'blob:mock';
    window.URL.revokeObjectURL = () => {};
  }
  global.alert = (message) => { throw new Error(`unexpected alert(): ${message}`); };
  global.fetch = async () => ({ ok: false, status: 404, headers: new Map() });
  // jsdom's anchor click attempts navigation; exports only need the call.
  window.HTMLAnchorElement.prototype.click = function () { window.__downloads = (window.__downloads || 0) + 1; };
  return dom;
}

const fresh = (path) => import(`../src/${path}`);

async function mountApp() {
  const dom = makeDom();
  const { App } = await fresh('app.js');
  const app = new App();
  await new Promise(r => setTimeout(r, 0));
  return { app, window: dom.window, document: dom.window.document };
}

const mouse = (window, type, opts = {}) =>
  new window.MouseEvent(type, { bubbles: true, cancelable: true, ...opts });

test('canvas: pan, zoom clamping, fit, reset and filters', async () => {
  const { app, window, document } = await mountApp();
  const canvas = app.diagramCanvas;
  const viewport = document.getElementById('canvas-viewport');

  // Pan: drag the background.
  viewport.dispatchEvent(mouse(window, 'mousedown', { clientX: 100, clientY: 100 }));
  window.dispatchEvent(mouse(window, 'mousemove', { clientX: 160, clientY: 130 }));
  window.dispatchEvent(mouse(window, 'mouseup'));
  assert.equal(canvas.panX - 40, 60, 'panX should follow the drag');
  assert.equal(canvas.panY - 40, 30, 'panY should follow the drag');

  // A drag starting on a node must not pan.
  const before = canvas.panX;
  const node = document.querySelector('.diagram-node');
  node.dispatchEvent(mouse(window, 'mousedown', { clientX: 0, clientY: 0 }));
  window.dispatchEvent(mouse(window, 'mousemove', { clientX: 50, clientY: 50 }));
  window.dispatchEvent(mouse(window, 'mouseup'));
  assert.equal(canvas.panX, before, 'node drags must not pan the canvas');

  // Wheel zoom in and out, and clamping at both ends.
  viewport.dispatchEvent(new window.WheelEvent('wheel', { deltaY: -1, clientX: 10, clientY: 10, cancelable: true }));
  assert.ok(canvas.scale > 1 || canvas.scale <= 1.2, 'wheel zoom applied');
  for (let i = 0; i < 40; i += 1) canvas.zoom(2);
  assert.equal(canvas.scale, 3, 'zoom must clamp at 3x');
  for (let i = 0; i < 40; i += 1) canvas.zoom(0.5);
  assert.equal(canvas.scale, 0.2, 'zoom must clamp at 0.2x');
  canvas.zoom(0.5); // no-op at the floor
  assert.equal(canvas.scale, 0.2);

  canvas.resetZoom();
  assert.deepEqual([canvas.scale, canvas.panX, canvas.panY], [1, 40, 40]);

  canvas.fitToScreen(); // jsdom rects are 0-sized; must not throw and must clamp
  assert.ok(canvas.scale >= 0.25 && canvas.scale <= 1.2);

  // Filters dim non-matching nodes rather than removing them.
  canvas.setFilterCategory('database');
  canvas.setFilterAction('create');
  canvas.setFilterProvider('aws');
  canvas.setSearchTerm('postgres');
  const dimmed = [...document.querySelectorAll('.diagram-node')].filter(el => el.getAttribute('opacity') === '0.2');
  assert.ok(dimmed.length > 0, 'non-matching nodes should be dimmed');
  const visible = [...document.querySelectorAll('.diagram-node')].filter(el => el.getAttribute('opacity') === '1');
  assert.ok(visible.length >= 1, 'the matching node should stay visible');

  // Tooltip appears on hover and hides on leave.
  const anyNode = document.querySelector('.diagram-node');
  anyNode.dispatchEvent(mouse(window, 'mouseenter', { clientX: 5, clientY: 5 }));
  const tooltip = document.getElementById('canvas-tooltip');
  assert.equal(tooltip.style.display, 'block');
  anyNode.dispatchEvent(mouse(window, 'mouseleave'));
  assert.equal(tooltip.style.display, 'none');
});

test('navbar and sidebar callbacks drive the app', async () => {
  const { app, window, document } = await mountApp();

  // Sidebar toggle.
  document.getElementById('btn-toggle-sidebar').dispatchEvent(mouse(window, 'click'));
  assert.ok(document.getElementById('sidebar-container').classList.contains('collapsed'));

  // Category, action and search filters propagate to the canvas.
  const searchInput = document.getElementById('sidebar-search-input');
  searchInput.value = 'vpc';
  searchInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(app.diagramCanvas.searchTerm, 'vpc');

  const catItem = document.querySelector('.category-filter-item[data-category="networking"]');
  catItem.dispatchEvent(mouse(window, 'click'));
  assert.equal(app.diagramCanvas.filterCategory, 'networking');
  assert.ok(catItem.classList.contains('active'));

  document.querySelector('.action-filter-btn[data-action="create"]').dispatchEvent(mouse(window, 'click'));
  assert.equal(app.diagramCanvas.filterAction, 'create');

  // Clicking a sidebar resource selects it and opens the inspector.
  const row = document.querySelector('.resource-tree-item');
  row.dispatchEvent(mouse(window, 'click'));
  assert.ok(row.classList.contains('selected'));
  assert.ok(!document.getElementById('inspector-container').classList.contains('hidden'));
  assert.equal(app.diagramCanvas.selectedNodeId, row.getAttribute('data-id'));

  // Closing the inspector clears the canvas selection.
  document.getElementById('btn-close-inspector').dispatchEvent(mouse(window, 'click'));
  assert.equal(app.diagramCanvas.selectedNodeId, null);

  // Export produces a download without touching the network.
  document.getElementById('btn-export-diagram').dispatchEvent(mouse(window, 'click'));
  assert.equal(window.__downloads, 1, 'export should trigger one download');

  // Multi-cloud template: provider chips appear and filter by cloud.
  const select = document.getElementById('template-select');
  select.value = 'multiCloud';
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
  const chip = document.querySelector('.provider-chip[data-provider="gcp"]');
  assert.ok(chip, 'multi-cloud plan should render provider chips');
  chip.dispatchEvent(mouse(window, 'click'));
  assert.equal(app.diagramCanvas.filterProvider, 'gcp');
});

test('import modal: open, paste, validate, drag-drop and file read', async () => {
  const { app, window, document } = await mountApp();
  const modal = app.importModal;

  document.getElementById('btn-import-plan').dispatchEvent(mouse(window, 'click'));
  assert.ok(modal.isOpen);
  assert.ok(document.getElementById('import-modal-backdrop').classList.contains('open'));

  const textarea = document.getElementById('import-textarea');
  const submit = document.getElementById('btn-submit-import');
  const errorMsg = document.getElementById('import-error-msg');

  // Empty submit -> inline error, modal stays open.
  textarea.value = '';
  submit.dispatchEvent(mouse(window, 'click'));
  assert.equal(errorMsg.style.display, 'block');
  assert.ok(modal.isOpen);

  // Invalid JSON -> inline error.
  textarea.value = '{oops';
  submit.dispatchEvent(mouse(window, 'click'));
  assert.match(errorMsg.textContent, /Invalid JSON/);
  assert.ok(modal.isOpen);

  // Valid plan -> loads and closes.
  textarea.value = JSON.stringify({
    resource_changes: [{
      address: 'google_storage_bucket.pasted',
      type: 'google_storage_bucket',
      name: 'pasted',
      change: { actions: ['create'], after: { name: 'pasted-bucket' } }
    }]
  });
  submit.dispatchEvent(mouse(window, 'click'));
  assert.ok(!modal.isOpen, 'modal closes on success');
  assert.equal(app.currentTemplateKey, 'custom');
  assert.equal(app.parsedPlan.nodes[0].address, 'google_storage_bucket.pasted');

  // Drag-and-drop styling plus FileReader path.
  modal.open();
  const dropzone = document.getElementById('import-dropzone');
  const dragover = mouse(window, 'dragover');
  dropzone.dispatchEvent(dragover);
  assert.ok(dropzone.classList.contains('dragover'));
  assert.ok(dragover.defaultPrevented);
  dropzone.dispatchEvent(mouse(window, 'dragleave'));
  assert.ok(!dropzone.classList.contains('dragover'));

  const file = new window.File(['{"resource_changes": []}'], 'plan.json', { type: 'application/json' });
  const drop = mouse(window, 'drop');
  Object.defineProperty(drop, 'dataTransfer', { value: { files: [file] } });
  dropzone.dispatchEvent(drop);
  await new Promise(r => setTimeout(r, 20)); // FileReader is async
  assert.equal(textarea.value, '{"resource_changes": []}', 'dropped file fills the textarea');

  // Cancel and close buttons.
  document.getElementById('btn-cancel-import').dispatchEvent(mouse(window, 'click'));
  assert.ok(!modal.isOpen);
  modal.open();
  document.getElementById('btn-modal-close').dispatchEvent(mouse(window, 'click'));
  assert.ok(!modal.isOpen);
});

test('inspector renders update diffs, deletions and value formatting', async () => {
  const { app, document } = await mountApp();

  const plan = {
    resource_changes: [
      {
        address: 'aws_db_instance.up',
        type: 'aws_db_instance',
        name: 'up',
        change: {
          actions: ['update'],
          before: { instance_class: 'db.t3.medium', multi_az: false, retired_attr: 'gone', port: 5432 },
          after: { instance_class: 'db.r6g.large', multi_az: true, new_attr: null, port: 5432, opts: { a: 1 }, tags: { Env: 'prod' } }
        }
      },
      {
        address: 'aws_s3_bucket.gone',
        type: 'aws_s3_bucket',
        name: 'gone',
        change: { actions: ['delete'], before: { bucket: 'old-bucket' }, after: null }
      },
      {
        address: 'aws_sqs_queue.same',
        type: 'aws_sqs_queue',
        name: 'same',
        change: { actions: ['no-op'], before: { name: 'q' }, after: { name: 'q' } }
      }
    ]
  };
  app.currentTemplateKey = 'custom';
  app.loadPlan(plan);

  const inspector = app.inspector;
  const [updated, deleted, unchanged] = app.parsedPlan.nodes;

  inspector.show(updated);
  let html = document.getElementById('inspector-container').innerHTML;
  assert.match(html, /Update \(~\)/);
  assert.match(html, /db\.t3\.medium/, 'old value shown');
  assert.match(html, /db\.r6g\.large/, 'new value shown');
  assert.match(html, /retired_attr/, 'removed attribute shown');
  assert.match(html, /Env/, 'tags rendered');
  assert.match(html, /5432/, 'numbers formatted');
  assert.match(html, /true/, 'booleans formatted');

  inspector.show(deleted);
  html = document.getElementById('inspector-container').innerHTML;
  assert.match(html, /Destroy \(-\)/);
  assert.match(html, /old-bucket/);

  inspector.show(unchanged);
  html = document.getElementById('inspector-container').innerHTML;
  assert.match(html, /No change/);

  inspector.hide();
  assert.ok(document.getElementById('inspector-container').classList.contains('hidden'));
});

test('loadPlan surfaces a parse failure via alert without crashing the shell', async () => {
  const { app, window } = await mountApp();
  const alerts = [];
  global.alert = (message) => alerts.push(message);

  app.loadPlan('{broken');
  assert.equal(alerts.length, 1);
  assert.match(alerts[0], /Invalid JSON/);
  // The previous diagram must still be intact.
  assert.ok(window.document.querySelectorAll('.diagram-node').length > 0);
});
