import test from 'node:test';
import assert from 'node:assert/strict';

import { parseTerraformPlan } from '../src/parser/tfPlanParser.js';
import { computeArchitectureLayout } from '../src/canvas/layoutEngine.js';
import { renderStandaloneSvg, embedIcon, ICON_SIZE } from '../src/canvas/svgRenderer.js';
import { SAMPLE_PLANS } from '../src/data/samplePlans.js';
import { getIconForType, getProviderForType } from '../src/providers/index.js';

test('every built-in sample parses, lays out and renders', () => {
  for (const [key, sample] of Object.entries(SAMPLE_PLANS)) {
    const parsed = parseTerraformPlan(sample.data);
    assert.ok(parsed.nodes.length > 0, `${key}: expected resources`);
    assert.equal(parsed.stats.total, parsed.nodes.length, `${key}: stats must match node count`);

    const layout = computeArchitectureLayout(parsed);
    const unplaced = layout.nodes.filter(n => n.x === undefined && !n.renderedAsContainer);
    assert.equal(unplaced.length, 0, `${key}: unplaced nodes ${unplaced.map(n => n.id).join(', ')}`);

    const svg = renderStandaloneSvg(layout, { title: sample.name });
    assert.match(svg, /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, `${key}: expected an SVG document`);
    assert.ok(svg.includes('</svg>'), `${key}: SVG must be closed`);
  }
});

test('resource types resolve to the owning provider', () => {
  const cases = [
    ['aws_instance', 'aws'],
    ['aws_dynamodb_table', 'aws'],
    ['google_compute_instance', 'gcp'],
    ['google_sql_database_instance', 'gcp'],
    ['azurerm_kubernetes_cluster', 'azure'],
    ['azuread_service_principal', 'azure'],
    ['random_pet', 'unknown']
  ];
  for (const [type, expected] of cases) {
    assert.equal(getProviderForType(type).id, expected, type);
    assert.equal(getIconForType(type).providerId, expected, type);
  }
});

test('unmapped resource types fall back to the provider generic icon', () => {
  const icon = getIconForType('aws_some_future_service');
  assert.equal(icon.providerId, 'aws');
  assert.ok(icon.svg.includes('<svg'));
});

test('AWS hierarchy: subnets attach to their VPC and instances to their subnet', () => {
  const parsed = parseTerraformPlan(SAMPLE_PLANS.threeTier.data);
  const vpc = parsed.networkNodes[0];
  assert.ok(vpc, 'expected a VPC');
  assert.ok(parsed.subnetNodes.length > 0, 'expected subnets');
  assert.ok(parsed.subnetNodes.every(s => s.parentNetworkId === vpc.id));

  const instance = parsed.nodes.find(n => n.type === 'aws_instance');
  if (instance) assert.ok(instance.parentSubnetId, 'EC2 instance should resolve to a subnet');
});

test('GCP hierarchy: nested network_interface subnetwork references resolve', () => {
  const parsed = parseTerraformPlan(SAMPLE_PLANS.gcpWebPlatform.data);
  const bastion = parsed.nodes.find(n => n.address === 'google_compute_instance.bastion');
  assert.ok(bastion, 'expected the bastion instance');
  assert.equal(bastion.parentSubnetId, 'google_compute_subnetwork.public_us_central1');
  assert.equal(bastion.zone, 'us-central1-a');

  const subnet = parsed.subnetNodes.find(s => s.name === 'private_us_central1');
  assert.equal(subnet.parentNetworkId, 'google_compute_network.core');
  assert.equal(subnet.cidr, '10.20.16.0/20');
});

test('Azure hierarchy: subnet ids, address prefixes and locations resolve', () => {
  const parsed = parseTerraformPlan(SAMPLE_PLANS.azureAks.data);
  const cluster = parsed.nodes.find(n => n.type === 'azurerm_kubernetes_cluster');
  assert.equal(cluster.parentSubnetId, 'azurerm_subnet.aks_system');
  assert.equal(cluster.region, 'westeurope');
  assert.equal(cluster.group, 'rg-platform-weu');

  const dataSubnet = parsed.subnetNodes.find(s => s.name === 'data');
  assert.equal(dataSubnet.cidr, '10.40.32.0/24');
});

test('a multi-cloud plan keeps each cloud separate', () => {
  const parsed = parseTerraformPlan(SAMPLE_PLANS.multiCloud.data);
  assert.deepEqual(parsed.providerIds, ['aws', 'gcp', 'azure']);

  // No inferred edge may cross provider boundaries.
  const providerOf = new Map(parsed.nodes.map(n => [n.id, n.providerId]));
  for (const edge of parsed.edges) {
    assert.equal(providerOf.get(edge.source), providerOf.get(edge.target),
      `edge ${edge.source} -> ${edge.target} crosses clouds`);
  }

  const layout = computeArchitectureLayout(parsed);
  const bands = layout.containers.filter(c => c.type === 'cloud');
  assert.equal(bands.length, 3, 'expected one band per cloud');

  // Bands must not overlap vertically.
  const sorted = [...bands].sort((a, b) => a.y - b.y);
  for (let i = 1; i < sorted.length; i += 1) {
    assert.ok(sorted[i].y >= sorted[i - 1].y + sorted[i - 1].height,
      'cloud bands must be stacked without overlap');
  }
});

test('plan actions map to diff stats', () => {
  const plan = {
    resource_changes: [
      { address: 'aws_s3_bucket.a', type: 'aws_s3_bucket', name: 'a', change: { actions: ['create'], after: {} } },
      { address: 'aws_s3_bucket.b', type: 'aws_s3_bucket', name: 'b', change: { actions: ['update'], before: { acl: 'private' }, after: { acl: 'public-read' } } },
      { address: 'aws_s3_bucket.c', type: 'aws_s3_bucket', name: 'c', change: { actions: ['delete'], before: {} } },
      { address: 'aws_s3_bucket.d', type: 'aws_s3_bucket', name: 'd', change: { actions: ['no-op'], after: {} } },
      { address: 'aws_s3_bucket.e', type: 'aws_s3_bucket', name: 'e', change: { actions: ['delete', 'create'], before: {}, after: {} } }
    ]
  };
  const { stats } = parseTerraformPlan(plan);
  assert.deepEqual(stats, { create: 2, update: 1, delete: 1, noop: 1, total: 5 });
});

test('planned-state-only plans are supported, including child modules', () => {
  const plan = {
    planned_values: {
      root_module: {
        resources: [
          { address: 'google_storage_bucket.root', type: 'google_storage_bucket', name: 'root', values: { name: 'root-bucket' } }
        ],
        child_modules: [
          {
            resources: [
              { address: 'module.db.azurerm_mssql_server.main', type: 'azurerm_mssql_server', name: 'main', values: { name: 'sql-main', location: 'eastus' } }
            ]
          }
        ]
      }
    }
  };
  const parsed = parseTerraformPlan(plan);
  assert.equal(parsed.nodes.length, 2);
  assert.equal(parsed.stats.create, 2);
  assert.deepEqual(parsed.providerIds.sort(), ['azure', 'gcp']);
});

test('accepts a JSON string and rejects malformed input', () => {
  const parsed = parseTerraformPlan(JSON.stringify(SAMPLE_PLANS.serverless.data));
  assert.ok(parsed.nodes.length > 0);

  assert.throws(() => parseTerraformPlan('{not json'), /Invalid JSON format/);
  assert.throws(() => parseTerraformPlan(null), /must be an object/);
});

test('an empty plan produces an empty but valid diagram', () => {
  const parsed = parseTerraformPlan({ format_version: '1.2', resource_changes: [] });
  assert.equal(parsed.nodes.length, 0);
  const layout = computeArchitectureLayout(parsed);
  assert.ok(layout.bounds.width > 0 && layout.bounds.height > 0);
  assert.match(renderStandaloneSvg(layout, { title: 'Empty' }), /<svg/);
});

test('resource names are escaped in rendered SVG', () => {
  const plan = {
    resource_changes: [{
      address: 'aws_s3_bucket.xss',
      type: 'aws_s3_bucket',
      name: '<script>alert(1)</script>',
      change: { actions: ['create'], after: { name: 'x' } }
    }]
  };
  const svg = renderStandaloneSvg(computeArchitectureLayout(parseTerraformPlan(plan)), { title: '<b>t</b>' });
  assert.ok(!svg.includes('<script>'), 'node names must be escaped');
  assert.ok(!svg.includes('<b>t</b>'), 'title must be escaped');
});

test('embedded icons always carry an explicit viewport size', () => {
  // A nested <svg> without width/height means "100% of the current viewport",
  // which scales each icon up to fill the whole diagram.
  for (const [key, sample] of Object.entries(SAMPLE_PLANS)) {
    const layout = computeArchitectureLayout(parseTerraformPlan(sample.data));
    const svg = renderStandaloneSvg(layout, { title: sample.name });

    const nested = (svg.match(/<svg\b[^>]*>/g) || []).slice(1); // skip the root element
    assert.ok(nested.length > 0, `${key}: expected embedded icons`);
    for (const tag of nested) {
      assert.match(tag, /\swidth="\d+(\.\d+)?"/, `${key}: icon missing width -> ${tag}`);
      assert.match(tag, /\sheight="\d+(\.\d+)?"/, `${key}: icon missing height -> ${tag}`);
    }
  }
});

test('embedIcon replaces any pre-existing size and is idempotent', () => {
  const once = embedIcon('<svg width="999" height="999" viewBox="0 0 64 64"><rect/></svg>', 34);
  assert.match(once, /width="34"/);
  assert.ok(!once.includes('999'), 'the original size must be dropped');
  assert.equal(embedIcon(once, 34), once, 'embedding twice must not stack attributes');
});

test('icons fit inside their node card', () => {
  const layout = computeArchitectureLayout(parseTerraformPlan(SAMPLE_PLANS.threeTier.data));
  const node = layout.nodes.find(n => !n.renderedAsContainer && n.height);
  assert.ok(ICON_SIZE < node.height, 'icon must be shorter than the card');
  assert.ok(ICON_SIZE < node.width / 2, 'icon must leave room for the labels');
});
