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

/**
 * Real `terraform show -json` output never carries Terraform addresses as
 * attribute values: on create the reference is unresolved (listed under
 * `after_unknown`, absent from `after`) and the link lives only in
 * `configuration`; on no-op/update it is the cloud id (`subnet-0f9e…`).
 */
test('hierarchy resolves on a real-shaped create plan via configuration references', () => {
  const parsed = parseTerraformPlan({
    format_version: '1.2',
    resource_changes: [
      { address: 'aws_vpc.main', type: 'aws_vpc', name: 'main', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], before: null, after: { cidr_block: '10.0.0.0/16' }, after_unknown: { id: true } } },
      { address: 'aws_subnet.private[0]', type: 'aws_subnet', name: 'private', index: 0, provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], before: null, after: { cidr_block: '10.0.1.0/24' }, after_unknown: { id: true, vpc_id: true } } },
      { address: 'aws_instance.web', type: 'aws_instance', name: 'web', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], before: null, after: { instance_type: 't3.micro' }, after_unknown: { id: true, subnet_id: true } } },
      { address: 'module.db.aws_db_instance.main', module_address: 'module.db', type: 'aws_db_instance', name: 'main', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], before: null, after: { engine: 'postgres' }, after_unknown: { id: true, db_subnet_group_name: true } } },
      { address: 'module.db.aws_db_subnet_group.main', module_address: 'module.db', type: 'aws_db_subnet_group', name: 'main', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], before: null, after: {}, after_unknown: { id: true, subnet_ids: true } } }
    ],
    configuration: {
      root_module: {
        resources: [
          { address: 'aws_vpc.main', type: 'aws_vpc', name: 'main', expressions: { cidr_block: { constant_value: '10.0.0.0/16' } } },
          { address: 'aws_subnet.private', type: 'aws_subnet', name: 'private',
            expressions: { vpc_id: { references: ['aws_vpc.main.id', 'aws_vpc.main'] } }, count_expression: { constant_value: 1 } },
          { address: 'aws_instance.web', type: 'aws_instance', name: 'web',
            expressions: { subnet_id: { references: ['aws_subnet.private[0].id', 'aws_subnet.private[0]', 'aws_subnet.private'] } } }
        ],
        module_calls: {
          db: {
            expressions: { subnet_ids: { references: ['aws_subnet.private[*].id', 'aws_subnet.private'] } },
            module: {
              resources: [
                { address: 'aws_db_subnet_group.main', type: 'aws_db_subnet_group', name: 'main',
                  expressions: { subnet_ids: { references: ['var.subnet_ids'] } } },
                { address: 'aws_db_instance.main', type: 'aws_db_instance', name: 'main',
                  expressions: { db_subnet_group_name: { references: ['aws_db_subnet_group.main.name', 'aws_db_subnet_group.main'] } } }
              ]
            }
          }
        }
      }
    }
  });

  const byId = Object.fromEntries(parsed.nodes.map(n => [n.id, n]));
  assert.equal(byId['aws_subnet.private[0]'].parentNetworkId, 'aws_vpc.main');
  assert.equal(byId['aws_instance.web'].parentSubnetId, 'aws_subnet.private[0]');
  assert.equal(byId['aws_instance.web'].parentNetworkId, 'aws_vpc.main');
  // Module-relative references are resolved against module-prefixed addresses.
  assert.ok(byId['module.db.aws_db_instance.main'].configReferences.has('module.db.aws_db_subnet_group.main'));
});

test('hierarchy resolves on a real-shaped no-op plan via cloud ids', () => {
  const parsed = parseTerraformPlan({
    format_version: '1.2',
    resource_changes: [
      { address: 'aws_vpc.main', type: 'aws_vpc', name: 'main', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['no-op'], before: { id: 'vpc-0a1b2c3d4e5f60789' }, after: { id: 'vpc-0a1b2c3d4e5f60789' } } },
      { address: 'aws_subnet.app', type: 'aws_subnet', name: 'app', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['no-op'], before: { id: 'subnet-0f9e8d7c6b5a43210', vpc_id: 'vpc-0a1b2c3d4e5f60789' }, after: { id: 'subnet-0f9e8d7c6b5a43210', vpc_id: 'vpc-0a1b2c3d4e5f60789' } } },
      { address: 'aws_instance.web', type: 'aws_instance', name: 'web', provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['update'], before: { subnet_id: 'subnet-0f9e8d7c6b5a43210' }, after: { subnet_id: 'subnet-0f9e8d7c6b5a43210', instance_type: 't3.small' } } },
      { address: 'azurerm_virtual_network.vnet', type: 'azurerm_virtual_network', name: 'vnet', provider_name: 'registry.terraform.io/hashicorp/azurerm',
        change: { actions: ['no-op'], before: null, after: { id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg/providers/Microsoft.Network/virtualNetworks/vnet', location: 'westeurope' } } },
      { address: 'azurerm_subnet.app', type: 'azurerm_subnet', name: 'app', provider_name: 'registry.terraform.io/hashicorp/azurerm',
        change: { actions: ['no-op'], before: null, after: { id: '/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg/providers/Microsoft.Network/virtualNetworks/vnet/subnets/app', virtual_network_name: 'vnet' } } },
      { address: 'azurerm_linux_virtual_machine.vm', type: 'azurerm_linux_virtual_machine', name: 'vm', provider_name: 'registry.terraform.io/hashicorp/azurerm',
        change: { actions: ['no-op'], before: null, after: { network_interface_ids: ['/subscriptions/0/resourceGroups/rg/providers/Microsoft.Network/networkInterfaces/nic'] } } }
    ]
  });
  const byId = Object.fromEntries(parsed.nodes.map(n => [n.id, n]));
  assert.equal(byId['aws_subnet.app'].parentNetworkId, 'aws_vpc.main');
  assert.equal(byId['aws_instance.web'].parentSubnetId, 'aws_subnet.app');
  assert.equal(byId['azurerm_subnet.app'].parentNetworkId, 'azurerm_virtual_network.vnet');
});

test('malformed resource_changes entries are skipped or defaulted, deposed objects get unique ids', () => {
  const parsed = parseTerraformPlan({
    resource_changes: [
      null,
      'not an object',
      { address: 'aws_instance.old', type: 'aws_instance', name: 'old', deposed: 'a1b2c3d4', change: { actions: ['delete'], before: { id: 'i-1' }, after: null } },
      { address: 'aws_instance.old', type: 'aws_instance', name: 'old', change: { actions: ['create'], before: null, after: {} } },
      { name: 'orphan', change: { actions: 'create' } },
      { address: 'aws_s3_bucket.logs', type: 'aws_s3_bucket', name: 'logs', change: null }
    ]
  });
  const ids = parsed.nodes.map(n => n.id);
  assert.deepEqual(new Set(ids).size, ids.length, 'ids must be unique');
  assert.ok(ids.includes('aws_instance.old#deposed-a1b2c3d4'));
  assert.ok(ids.includes('aws_instance.old'));
  assert.ok(ids.includes('unknown.orphan'));
  assert.equal(parsed.stats.total, 4);
  assert.equal(parsed.stats.delete, 1);
  assert.equal(parsed.stats.noop, 2); // non-array actions and null change both mean no-op
});

test('edge inference is capped and reports how many relationships were dropped', async () => {
  const { MAX_EDGES } = await import('../src/parser/tfPlanParser.js');
  const resource_changes = [];
  for (let i = 0; i < 150; i += 1) {
    resource_changes.push({ address: `aws_instance.i${i}`, type: 'aws_instance', name: `i${i}`, change: { actions: ['create'], after: {} } });
  }
  for (let i = 0; i < 60; i += 1) {
    resource_changes.push({ address: `aws_s3_bucket.b${i}`, type: 'aws_s3_bucket', name: `b${i}`, change: { actions: ['create'], after: {} } });
  }
  const parsed = parseTerraformPlan({ resource_changes });
  assert.equal(parsed.edges.length, MAX_EDGES);
  assert.ok(parsed.edgesTruncated > 0, 'excess pairs are counted, not drawn');
  // Still renders in bounded time/space.
  const svg = renderStandaloneSvg(computeArchitectureLayout(parsed), { title: 'big' });
  assert.ok(svg.length < 50 * 1024 * 1024);
});

test('reference-based edge extraction extracts links from configuration expressions and attributes', () => {
  const plan = {
    resource_changes: [
      {
        address: 'aws_kms_key.app_key',
        type: 'aws_kms_key',
        name: 'app_key',
        provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], after: { arn: 'arn:aws:kms:us-east-1:123456789012:key/test-key-id' } }
      },
      {
        address: 'aws_s3_bucket.secure_data',
        type: 'aws_s3_bucket',
        name: 'secure_data',
        provider_name: 'registry.terraform.io/hashicorp/aws',
        change: {
          actions: ['create'],
          after: {
            server_side_encryption_configuration: {
              rule: { apply_server_side_encryption_by_default: { kms_master_key_id: 'arn:aws:kms:us-east-1:123456789012:key/test-key-id' } }
            }
          }
        }
      },
      {
        address: 'aws_lb.web',
        type: 'aws_lb',
        name: 'web',
        provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], after: { arn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/web/123' } }
      },
      {
        address: 'aws_lb_target_group.app',
        type: 'aws_lb_target_group',
        name: 'app',
        provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], after: { arn: 'arn:aws:elasticloadbalancing:us-east-1:123456789012:targetgroup/app/456' } }
      }
    ],
    configuration: {
      root_module: {
        resources: [
          {
            address: 'aws_lb.web',
            type: 'aws_lb',
            name: 'web',
            expressions: {
              default_target_group_arn: {
                references: ['aws_lb_target_group.app.arn', 'aws_lb_target_group.app']
              }
            }
          }
        ]
      }
    }
  };

  const parsed = parseTerraformPlan(plan);
  const kmsEdge = parsed.edges.find(e => e.source === 'aws_s3_bucket.secure_data' && e.target === 'aws_kms_key.app_key');
  assert.ok(kmsEdge, 'should infer edge from S3 bucket to KMS key via attribute ARN match');
  assert.equal(kmsEdge.relation, 'security');

  const lbEdge = parsed.edges.find(e => e.source === 'aws_lb.web' && e.target === 'aws_lb_target_group.app');
  assert.ok(lbEdge, 'should infer edge from ALB to Target Group via configuration references');
  assert.equal(lbEdge.relation, 'traffic');
});

test('layout engine routes edges snapping to node perimeter with arrowhead clearance', () => {
  const plan = {
    resource_changes: [
      {
        address: 'aws_instance.web',
        type: 'aws_instance',
        name: 'web',
        provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], after: {} }
      },
      {
        address: 'aws_s3_bucket.data',
        type: 'aws_s3_bucket',
        name: 'data',
        provider_name: 'registry.terraform.io/hashicorp/aws',
        change: { actions: ['create'], after: {} }
      }
    ],
    configuration: {
      root_module: {
        resources: [
          {
            address: 'aws_instance.web',
            type: 'aws_instance',
            name: 'web',
            expressions: {
              bucket: { references: ['aws_s3_bucket.data.bucket'] }
            }
          }
        ]
      }
    }
  };

  const parsed = parseTerraformPlan(plan);
  const layout = computeArchitectureLayout(parsed);
  assert.equal(layout.edges.length, 1);

  const edge = layout.edges[0];
  const sourceNode = layout.nodes.find(n => n.id === edge.source);
  const targetNode = layout.nodes.find(n => n.id === edge.target);

  // Target anchor should snap to card perimeter, not card center (targetNode.x + targetNode.width / 2)
  const targetCenterX = targetNode.x + targetNode.width / 2;
  const targetCenterY = targetNode.y + targetNode.height / 2;
  const isAtCenter = Math.abs(edge.x2 - targetCenterX) < 1 && Math.abs(edge.y2 - targetCenterY) < 1;
  assert.ok(!isAtCenter, 'connector endpoint must snap to perimeter, not node center');
  assert.ok(edge.x1 !== undefined && edge.y1 !== undefined && edge.x2 !== undefined && edge.y2 !== undefined);
});
