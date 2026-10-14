import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { PROVIDERS, getIconForType, resolveIconKey } from '../src/providers/index.js';

const mapping = JSON.parse(fs.readFileSync(new URL('../scripts/icons/mapping.json', import.meta.url), 'utf8'));

test('every icon key carries its official vendor SVG', () => {
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    const files = mapping[id];
    assert.deepEqual(Object.keys(provider.icons).sort(), Object.keys(files).sort(),
      `${id}: icons.js and scripts/icons/mapping.json must list the same keys`);
    for (const [key, icon] of Object.entries(provider.icons)) {
      assert.ok(provider.categories[icon.category], `${id}/${key}: unknown category ${icon.category}`);
      assert.match(icon.svg ?? '', /^<svg\b/, `${id}/${key}: missing SVG`);
      // Only the AWS generic tile is allowed to be a placeholder: the AWS set
      // ships no generic service icon.
      if (files[key] === null) assert.equal(`${id}/${key}`, 'aws/generic', `${id}/${key}: no official icon mapped`);
      else assert.ok(fs.existsSync(new URL(`../assets/icons/${id}/${files[key]}`, import.meta.url)), `${id}/${key}: ${files[key]} missing`);
    }
  }
});

test('every resource map and service prefix points at a real icon', () => {
  for (const [id, provider] of Object.entries(PROVIDERS)) {
    const targets = { ...provider.resourceMap, ...provider.servicePrefixes };
    for (const [type, key] of Object.entries(targets)) {
      assert.ok(provider.icons[key], `${id}: ${type} -> unknown icon ${key}`);
      // A bare token like `azuread` covers `azuread_*`, so compare it with its `_` boundary.
      assert.ok(provider.typePrefixes.some(p => `${type}_`.startsWith(p)),`${id}: ${type} is outside the provider's type prefixes`);
    }
    // Every icon other than the generic fallback is reachable from some type.
    const used = new Set([...Object.values(targets), provider.genericIconKey]);
    const orphans = Object.keys(provider.icons).filter(k => !used.has(k));
    assert.deepEqual(orphans, [], `${id}: icons no resource type resolves to`);
  }
});

test('service prefixes resolve whole tokens, longest first', () => {
  const aws = PROVIDERS.aws;
  assert.equal(resolveIconKey(aws, 'aws_glue_job'), 'glue');
  assert.equal(resolveIconKey(aws, 'aws_glue'), 'glue');
  assert.equal(resolveIconKey(aws, 'aws_rds_cluster_instance'), 'aurora');
  assert.equal(resolveIconKey(aws, 'aws_db_instance'), 'rds');
  assert.equal(resolveIconKey(aws, 'aws_kinesis_firehose_delivery_stream'), 'kinesis_firehose');
  assert.equal(resolveIconKey(aws, 'aws_cloudwatch_event_rule'), 'eventbridge');
  assert.equal(resolveIconKey(aws, 'aws_cloudwatch_log_group'), 'cloudwatch');
  // `aws_vpc` must not swallow `aws_vpclattice_*` or `aws_vpc_endpoint*`.
  assert.equal(resolveIconKey(aws, 'aws_vpclattice_service'), 'vpc_lattice');
  assert.equal(resolveIconKey(aws, 'aws_vpc_endpoint'), 'privatelink');
  assert.equal(resolveIconKey(aws, 'aws_route53_zone'), 'route53');
  assert.equal(resolveIconKey(aws, 'aws_route_table'), 'vpc');
  // Exact overrides beat prefixes; unknown services fall back to generic.
  assert.equal(resolveIconKey(aws, 'aws_vpc_ipam'), 'vpc');
  assert.equal(resolveIconKey(aws, 'aws_some_future_service'), 'generic');
});

test('commonly used resources resolve to their own service icon', () => {
  const cases = {
    aws_ecr_repository: 'Amazon ECR',
    aws_ebs_volume: 'Amazon EBS',
    aws_kinesis_stream: 'Amazon Kinesis Data Streams',
    aws_sfn_state_machine: 'AWS Step Functions',
    aws_wafv2_web_acl: 'AWS WAF',
    aws_acm_certificate: 'AWS Certificate Manager',
    aws_ec2_transit_gateway: 'AWS Transit Gateway',
    aws_opensearch_domain: 'Amazon OpenSearch Service',
    aws_sagemaker_endpoint: 'Amazon SageMaker',
    aws_codepipeline: 'AWS CodePipeline',
    google_compute_security_policy: 'Cloud Armor',
    google_workflows_workflow: 'Workflows',
    google_cloud_scheduler_job: 'Cloud Scheduler',
    google_dataproc_cluster: 'Dataproc',
    google_compute_router_nat: 'Cloud NAT',
    google_vertex_ai_endpoint: 'Vertex AI',
    google_iam_workload_identity_pool_provider: 'Workload Identity Federation',
    azurerm_mysql_flexible_server: 'Azure Database for MySQL',
    azurerm_container_group: 'Container Instances',
    azurerm_firewall: 'Azure Firewall',
    azurerm_bastion_host: 'Bastion',
    azurerm_private_endpoint: 'Private Endpoint',
    azurerm_linux_web_app_slot: 'Deployment Slot',
    azurerm_eventgrid_system_topic_event_subscription: 'Event Grid Subscription',
    azurerm_kubernetes_cluster_node_pool: 'AKS Cluster',
    azuread_group_member: 'Entra ID Group'
  };
  for (const [type, name] of Object.entries(cases)) {
    assert.equal(getIconForType(type).name, name, type);
  }
});
