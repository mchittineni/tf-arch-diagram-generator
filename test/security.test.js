import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { parseTerraformPlan } from '../src/parser/tfPlanParser.js';
import { computeArchitectureLayout } from '../src/canvas/layoutEngine.js';
import { renderStandaloneSvg } from '../src/canvas/svgRenderer.js';

/**
 * A Terraform plan is untrusted input: it comes from whoever hands you a
 * plan.json, and every string in it is rendered into HTML and SVG. These tests
 * assert that hostile content is escaped rather than executed.
 */

const PAYLOADS = {
  script: '<script>globalThis.__pwned = 1;</script>',
  imgHandler: '<img src=x onerror="globalThis.__pwned=1">',
  attrBreakout: '" onmouseover="globalThis.__pwned=1" x="',
  svgBreakout: '</text><script>globalThis.__pwned=1</script><text>',
  closeTag: '</svg><script>globalThis.__pwned=1</script>',
  entity: '&lt;script&gt;'
};

function hostilePlan() {
  return {
    format_version: '1.2',
    resource_changes: [
      {
        address: `aws_instance.${PAYLOADS.attrBreakout}`,
        type: 'aws_instance',
        name: PAYLOADS.script,
        provider_name: PAYLOADS.imgHandler,
        change: {
          actions: ['update'],
          before: { instance_type: 't3.micro', user_data: PAYLOADS.svgBreakout },
          after: {
            instance_type: PAYLOADS.closeTag,
            user_data: PAYLOADS.imgHandler,
            availability_zone: PAYLOADS.script,
            tags: { [PAYLOADS.imgHandler]: PAYLOADS.script, Name: PAYLOADS.attrBreakout }
          }
        }
      },
      {
        address: 'aws_vpc.evil',
        type: 'aws_vpc',
        name: PAYLOADS.svgBreakout,
        change: { actions: ['create'], after: { cidr_block: PAYLOADS.script, tags: { Name: PAYLOADS.script } } }
      },
      {
        address: 'aws_subnet.evil',
        type: 'aws_subnet',
        name: `public-${PAYLOADS.imgHandler}`,
        change: {
          actions: ['create'],
          after: { vpc_id: 'aws_vpc.evil', cidr_block: PAYLOADS.script, availability_zone: PAYLOADS.script }
        }
      }
    ]
  };
}

test('a hostile plan renders no executable content in the exported SVG', () => {
  const layout = computeArchitectureLayout(parseTerraformPlan(hostilePlan()));
  const svg = renderStandaloneSvg(layout, { title: PAYLOADS.script });

  // Parse the document rather than pattern-matching the string: a payload
  // sitting safely inside an escaped attribute value still *looks* like
  // markup to a regex, so only the parsed tree tells the truth.
  const dom = new JSDOM(`<!doctype html><body>${svg}</body>`, { contentType: 'text/html' });
  const { document } = dom.window;

  assert.equal(document.querySelectorAll('script').length, 0, 'no <script> element in the SVG');
  assert.equal(document.querySelectorAll('img').length, 0, 'no injected <img> element');

  const withHandlers = [...document.querySelectorAll('*')].filter(el =>
    [...el.attributes].some(a => /^on/i.test(a.name))
  );
  assert.deepEqual(withHandlers.map(el => el.tagName), [], 'no element carries an event handler');

  const withJsUrl = [...document.querySelectorAll('*')].filter(el =>
    [...el.attributes].some(a => /javascript:/i.test(a.value))
  );
  assert.deepEqual(withJsUrl.map(el => el.tagName), [], 'no javascript: URL');

  // Escaped, not silently dropped — the operator must still see the real name.
  assert.ok(svg.includes('&lt;script&gt;'), 'payload should appear escaped in the source');
  assert.ok(document.body.textContent.includes('<script>'), 'and render as literal text');
});

test('a hostile plan cannot inject nodes or handlers into the live DOM', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', {
    url: 'http://localhost:5173/',
    pretendToBeVisual: true,
    runScripts: 'dangerously' // if injection were possible, this would let it run
  });

  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.Blob = window.Blob;
  global.URL = window.URL;
  global.alert = () => {};
  global.fetch = async () => ({
    ok: true,
    status: 200,
    headers: new Map([['content-type', 'application/json']]),
    json: async () => ({ title: PAYLOADS.script, plan: hostilePlan() })
  });

  const { App } = await import('../src/app.js');
  const app = new App();
  await new Promise(resolve => setTimeout(resolve, 0));

  // Open the inspector on the hostile resource: it renders tags and the
  // attribute-level diff, i.e. the most attacker-controlled surface.
  const hostileNode = app.parsedPlan.nodes.find(n => n.type === 'aws_instance');
  app.inspector.show(hostileNode);

  const { document } = window;
  assert.equal(document.querySelectorAll('script').length, 0, 'no script element was created');
  assert.equal(document.querySelectorAll('img').length, 0, 'no img element was created');
  assert.equal(window.__pwned, undefined, 'no payload executed');

  const handlerCarrying = [...document.querySelectorAll('*')].filter(el =>
    [...el.attributes].some(a => /^on/i.test(a.name))
  );
  assert.deepEqual(handlerCarrying, [], 'no element carries an inline event handler');

  // The payload must still be visible to the user as literal text.
  assert.ok(
    document.body.textContent.includes('<script>'),
    'the hostile name should be displayed as text'
  );
});

test('malformed and adversarial plan shapes fail safely', () => {
  const cases = [
    ['not json', '{"unterminated'],
    ['null', null],
    ['number', 42],
    ['array', []],
    ['string', 'hello']
  ];

  for (const [label, input] of cases) {
    if (label === 'array') {
      // An array is an object; it simply yields no resources rather than throwing.
      const parsed = parseTerraformPlan(input);
      assert.equal(parsed.nodes.length, 0, `${label} should yield no resources`);
      continue;
    }
    assert.throws(() => parseTerraformPlan(input), Error, `${label} should throw a clean Error`);
  }
});

test('deeply nested and oversized plan values do not crash the renderer', () => {
  let deep = { a: 1 };
  for (let i = 0; i < 2000; i += 1) deep = { nested: deep };

  const plan = {
    resource_changes: [{
      address: 'aws_s3_bucket.big',
      type: 'aws_s3_bucket',
      name: 'x'.repeat(50_000),
      change: { actions: ['create'], after: { policy: deep, tags: { Name: 'y'.repeat(10_000) } } }
    }]
  };

  const layout = computeArchitectureLayout(parseTerraformPlan(plan));
  const svg = renderStandaloneSvg(layout, { title: 'big' });
  assert.match(svg, /<svg/);
  // Labels are truncated, so one absurd name cannot blow up the document.
  assert.ok(svg.length < 200_000, `SVG should stay bounded, got ${svg.length} bytes`);
});
