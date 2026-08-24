import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * The public API surface (`import ... from 'tf-arch-diagram-generator'`).
 * Consumers program against these exports, so their presence and behaviour
 * are part of the package contract.
 */
import * as api from '../src/index.js';

test('the package exports the documented API surface', () => {
  const contract = [
    'parseTerraformPlan', 'computeArchitectureLayout', 'renderStandaloneSvg',
    'planToSvg', 'renderContainers', 'renderEdges', 'renderNodes', 'escapeXml',
    'getProvider', 'getProviderForType', 'getIconForType', 'getMergedCategories',
    'PROVIDERS', 'PROVIDER_IDS', 'SAMPLE_PLANS', 'SAMPLE_GROUPS',
    'DEFAULT_SAMPLE_KEY', 'ACTION_COLORS', 'SVG_DEFS'
  ];
  for (const name of contract) {
    assert.ok(name in api, `missing export: ${name}`);
  }
  assert.deepEqual(api.PROVIDER_IDS, ['aws', 'gcp', 'azure']);
  assert.ok(api.SAMPLE_PLANS[api.DEFAULT_SAMPLE_KEY], 'default sample key resolves');
});

test('planToSvg goes from raw plan JSON to a standalone SVG in one call', async () => {
  const svg = await api.planToSvg(api.SAMPLE_PLANS.multiCloud.data, { title: 'One-shot' });
  assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.ok(svg.includes('One-shot'));
  assert.ok(svg.includes('</svg>'));

  // Accepts a JSON string as well as an object.
  const fromString = await api.planToSvg(JSON.stringify(api.SAMPLE_PLANS.serverless.data));
  assert.match(fromString, /<svg/);

  await assert.rejects(() => api.planToSvg('{nope'), /Invalid JSON/);
});
