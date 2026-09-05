import { CATEGORIES, ICONS } from './icons.js';

/**
 * Maps Terraform `aws_*` resource types to icon keys.
 */
const RESOURCE_MAP = {
  // Compute
  aws_instance: 'ec2',
  aws_launch_template: 'ec2',
  aws_launch_configuration: 'ec2',
  aws_autoscaling_group: 'autoscaling',
  aws_autoscaling_policy: 'autoscaling',
  aws_lambda_function: 'lambda',
  aws_lambda_alias: 'lambda',
  aws_lambda_event_source_mapping: 'lambda',
  aws_lambda_layer_version: 'lambda',

  // Containers
  aws_ecs_cluster: 'ecs',
  aws_ecs_service: 'ecs',
  aws_ecs_task_definition: 'ecs',
  aws_eks_cluster: 'eks',
  aws_eks_node_group: 'eks',
  aws_eks_addon: 'eks',
  aws_ecr_repository: 'ecs',

  // Networking
  aws_vpc: 'vpc',
  aws_subnet: 'subnet',
  aws_internet_gateway: 'internet_gateway',
  aws_nat_gateway: 'nat_gateway',
  aws_route_table: 'vpc',
  aws_route: 'vpc',
  aws_route_table_association: 'vpc',
  aws_vpc_peering_connection: 'vpc',
  aws_ec2_transit_gateway: 'vpc',
  aws_ec2_transit_gateway_vpc_attachment: 'vpc',
  aws_vpn_gateway: 'vpc',
  aws_customer_gateway: 'vpc',
  aws_vpn_connection: 'vpc',
  aws_lb: 'alb',
  aws_alb: 'alb',
  aws_lb_listener: 'alb',
  aws_lb_target_group: 'alb',
  aws_alb_target_group: 'alb',
  aws_lb_target_group_attachment: 'alb',
  aws_cloudfront_distribution: 'cloudfront',
  aws_cloudfront_origin_access_identity: 'cloudfront',
  aws_cloudfront_origin_access_control: 'cloudfront',
  aws_route53_zone: 'route53',
  aws_route53_record: 'route53',
  aws_apigatewayv2_api: 'apigateway',
  aws_apigatewayv2_stage: 'apigateway',
  aws_apigatewayv2_integration: 'apigateway',
  aws_api_gateway_rest_api: 'apigateway',
  aws_api_gateway_resource: 'apigateway',
  aws_api_gateway_method: 'apigateway',
  aws_api_gateway_integration: 'apigateway',
  aws_api_gateway_stage: 'apigateway',
  aws_appsync_graphql_api: 'apigateway',

  // Storage
  aws_s3_bucket: 's3',
  aws_s3_bucket_policy: 's3',
  aws_s3_bucket_public_access_block: 's3',
  aws_s3_bucket_versioning: 's3',
  aws_s3_bucket_server_side_encryption_configuration: 's3',
  aws_s3_object: 's3',
  aws_efs_file_system: 'efs',
  aws_efs_mount_target: 'efs',
  aws_ebs_volume: 'efs',

  // Database
  aws_db_instance: 'rds',
  aws_rds_cluster: 'rds',
  aws_rds_cluster_instance: 'rds',
  aws_db_subnet_group: 'rds',
  aws_db_parameter_group: 'rds',
  aws_dynamodb_table: 'dynamodb',
  aws_elasticache_cluster: 'elasticache',
  aws_elasticache_replication_group: 'elasticache',
  aws_elasticache_subnet_group: 'elasticache',

  // Security
  aws_iam_role: 'iam',
  aws_iam_policy: 'iam',
  aws_iam_role_policy_attachment: 'iam',
  aws_iam_instance_profile: 'iam',
  aws_iam_user: 'iam',
  aws_kms_key: 'kms',
  aws_kms_alias: 'kms',
  aws_secretsmanager_secret: 'secretsmanager',
  aws_secretsmanager_secret_version: 'secretsmanager',
  aws_security_group: 'iam',
  aws_security_group_rule: 'iam',
  aws_cognito_user_pool: 'cognito',
  aws_cognito_user_pool_client: 'cognito',
  aws_wafv2_web_acl: 'iam',
  aws_waf_web_acl: 'iam',
  aws_wafv2_web_acl_association: 'iam',
  aws_acm_certificate: 'iam',
  aws_acm_certificate_validation: 'iam',

  // Integration & Management
  aws_cloudwatch_log_group: 'cloudwatch',
  aws_cloudwatch_log_stream: 'cloudwatch',
  aws_cloudwatch_metric_alarm: 'cloudwatch',
  aws_sqs_queue: 'sqs',
  aws_sqs_queue_policy: 'sqs',
  aws_sns_topic: 'sns',
  aws_sns_topic_subscription: 'sns',
  aws_cloudwatch_event_rule: 'eventbridge',
  aws_cloudwatch_event_target: 'eventbridge',
  aws_sfn_state_machine: 'eventbridge',
  aws_stepfunctions_state_machine: 'eventbridge',
  aws_kinesis_stream: 'sqs'
};

export const awsProvider = {
  id: 'aws',
  name: 'Amazon Web Services',
  shortName: 'AWS',
  accentColor: '#FF9900',
  typePrefixes: ['aws_'],
  categories: CATEGORIES,
  icons: ICONS,
  resourceMap: RESOURCE_MAP,
  genericIconKey: 'generic',

  terms: {
    network: 'VPC',
    subnet: 'Subnet',
    zone: 'Availability Zone',
    region: 'Region',
    tags: 'Resource Tags',
    group: 'Account Scope'
  },

  hierarchy: {
    networkTypes: ['aws_vpc'],
    subnetTypes: ['aws_subnet'],
    networkRefKeys: ['vpc_id'],
    subnetRefKeys: ['subnet_id', 'subnet_ids.0', 'vpc_config.0.subnet_ids.0'],
    zoneKeys: ['availability_zone'],
    regionKeys: ['region'],
    cidrKeys: ['cidr_block'],
    tagKeys: ['tags'],
    groupKeys: [],
    publicSubnetHints: ['pub', 'dmz', 'edge', 'ingress'],
    isPublicSubnet: (attrs) => attrs.map_public_ip_on_launch === true
  },

  /**
   * Infer architectural traffic-flow edges between AWS resources.
   */
  inferEdges(nodes, addEdge) {
    const by = (fn) => nodes.filter(fn);
    const cloudfront = by(n => n.type === 'aws_cloudfront_distribution');
    const route53 = by(n => n.type.startsWith('aws_route53'));
    const albs = by(n => n.type === 'aws_lb' || n.type === 'aws_alb');
    const targetGroups = by(n => n.type === 'aws_lb_target_group' || n.type === 'aws_alb_target_group');
    const apigws = by(n => n.type.includes('apigateway') || n.type.includes('api_gateway') || n.type.includes('appsync'));
    const lambdas = by(n => n.type === 'aws_lambda_function');
    const ec2s = by(n => n.type === 'aws_instance' || n.type === 'aws_autoscaling_group');
    const rdss = by(n => n.type === 'aws_db_instance' || n.type === 'aws_rds_cluster');
    const dynamodbs = by(n => n.type === 'aws_dynamodb_table');
    const elasticaches = by(n => n.type.startsWith('aws_elasticache_cluster') || n.type.startsWith('aws_elasticache_replication_group'));
    const s3s = by(n => n.type === 'aws_s3_bucket');
    const igws = by(n => n.type === 'aws_internet_gateway');
    const natgws = by(n => n.type === 'aws_nat_gateway');
    const routeTables = by(n => n.type === 'aws_route_table');
    const sqsList = by(n => n.type === 'aws_sqs_queue');
    const snsList = by(n => n.type === 'aws_sns_topic');
    const events = by(n => n.type.includes('cloudwatch_event'));
    const alarms = by(n => n.type === 'aws_cloudwatch_metric_alarm');
    const sfnList = by(n => n.type.includes('stepfunctions') || n.type.includes('sfn'));
    const eksList = by(n => n.type === 'aws_eks_cluster');
    const nodeGroups = by(n => n.type === 'aws_eks_node_group');
    const ecsClusters = by(n => n.type === 'aws_ecs_cluster');
    const ecsServices = by(n => n.type === 'aws_ecs_service');
    const ecsTasks = by(n => n.type === 'aws_ecs_task_definition');
    const ecrList = by(n => n.type === 'aws_ecr_repository');
    const kmsKeys = by(n => n.type === 'aws_kms_key');
    const secrets = by(n => n.type === 'aws_secretsmanager_secret');
    const wafList = by(n => n.type.startsWith('aws_waf'));
    const certs = by(n => n.type.startsWith('aws_acm_certificate'));
    const cognitoList = by(n => n.type === 'aws_cognito_user_pool');
    const vpcList = by(n => n.type === 'aws_vpc');
    const peerings = by(n => n.type === 'aws_vpc_peering_connection');
    const tgws = by(n => n.type === 'aws_ec2_transit_gateway');

    route53.forEach(r => {
      cloudfront.forEach(cf => addEdge(r.id, cf.id, 'DNS'));
      albs.forEach(alb => addEdge(r.id, alb.id, 'DNS'));
      apigws.forEach(gw => addEdge(r.id, gw.id, 'DNS'));
    });

    wafList.forEach(waf => {
      cloudfront.forEach(cf => addEdge(waf.id, cf.id, 'WAF Shield', 'security'));
      albs.forEach(alb => addEdge(waf.id, alb.id, 'WAF Shield', 'security'));
      apigws.forEach(gw => addEdge(waf.id, gw.id, 'WAF Shield', 'security'));
    });

    certs.forEach(cert => {
      cloudfront.forEach(cf => addEdge(cert.id, cf.id, 'TLS Cert', 'security'));
      albs.forEach(alb => addEdge(cert.id, alb.id, 'TLS Cert', 'security'));
    });

    cloudfront.forEach(cf => {
      s3s.forEach(s3 => addEdge(cf.id, s3.id, 'Origin'));
      albs.forEach(alb => addEdge(cf.id, alb.id, 'Origin'));
      apigws.forEach(gw => addEdge(cf.id, gw.id, 'Origin'));
    });

    igws.forEach(igw => {
      albs.forEach(alb => addEdge(igw.id, alb.id, 'Traffic'));
      natgws.forEach(nat => addEdge(igw.id, nat.id, 'Egress'));
    });

    routeTables.forEach(rt => {
      natgws.forEach(nat => addEdge(rt.id, nat.id, 'Route', 'dependency'));
      igws.forEach(igw => addEdge(rt.id, igw.id, 'Route', 'dependency'));
    });

    albs.forEach(alb => {
      targetGroups.forEach(tg => addEdge(alb.id, tg.id, 'Forward'));
      ec2s.forEach(ec2 => addEdge(alb.id, ec2.id, 'HTTP/HTTPS'));
      nodeGroups.forEach(ng => addEdge(alb.id, ng.id, 'Forward'));
      ecsServices.forEach(svc => addEdge(alb.id, svc.id, 'Forward'));
    });

    targetGroups.forEach(tg => {
      ec2s.forEach(ec2 => addEdge(tg.id, ec2.id, 'Target'));
      ecsServices.forEach(svc => addEdge(tg.id, svc.id, 'Target'));
    });

    natgws.forEach(nat => {
      ec2s.forEach(ec2 => addEdge(nat.id, ec2.id, 'NAT'));
      nodeGroups.forEach(ng => addEdge(nat.id, ng.id, 'NAT'));
      ecsServices.forEach(svc => addEdge(nat.id, svc.id, 'NAT'));
    });

    apigws.forEach(gw => {
      lambdas.forEach(l => addEdge(gw.id, l.id, 'Invoke'));
      albs.forEach(alb => addEdge(gw.id, alb.id, 'Proxy'));
    });

    cognitoList.forEach(cog => {
      apigws.forEach(gw => addEdge(cog.id, gw.id, 'Auth', 'security'));
      albs.forEach(alb => addEdge(cog.id, alb.id, 'Auth', 'security'));
    });

    ecsClusters.forEach(cluster => {
      ecsServices.forEach(svc => addEdge(cluster.id, svc.id, 'Service', 'dependency'));
    });

    ecsServices.forEach(svc => {
      ecsTasks.forEach(task => addEdge(svc.id, task.id, 'Task Def', 'dependency'));
    });

    eksList.forEach(eks => nodeGroups.forEach(ng => addEdge(eks.id, ng.id, 'Managed', 'dependency')));

    ecrList.forEach(ecr => {
      nodeGroups.forEach(ng => addEdge(ecr.id, ng.id, 'Container Image'));
      eksList.forEach(eks => addEdge(ecr.id, eks.id, 'Container Image'));
      ecsServices.forEach(svc => addEdge(ecr.id, svc.id, 'Container Image'));
      lambdas.forEach(l => addEdge(ecr.id, l.id, 'Image'));
    });

    const computeWorkloads = [...lambdas, ...ec2s, ...ecsServices, ...nodeGroups];

    lambdas.forEach(l => {
      dynamodbs.forEach(d => addEdge(l.id, d.id, 'Read/Write'));
      rdss.forEach(r => addEdge(l.id, r.id, 'Query'));
      s3s.forEach(s => addEdge(l.id, s.id, 'Store'));
      sqsList.forEach(q => addEdge(l.id, q.id, 'Enqueue'));
      elasticaches.forEach(c => addEdge(l.id, c.id, 'Cache'));
    });

    snsList.forEach(sns => {
      sqsList.forEach(sqs => addEdge(sns.id, sqs.id, 'Subscribe'));
      lambdas.forEach(l => addEdge(sns.id, l.id, 'Trigger'));
    });

    events.forEach(ev => {
      lambdas.forEach(l => addEdge(ev.id, l.id, 'Rule Event'));
      sqsList.forEach(s => addEdge(ev.id, s.id, 'Target'));
      snsList.forEach(s => addEdge(ev.id, s.id, 'Target'));
    });

    alarms.forEach(alm => {
      snsList.forEach(sns => addEdge(alm.id, sns.id, 'Alarm Action'));
    });

    sfnList.forEach(sfn => {
      lambdas.forEach(l => addEdge(sfn.id, l.id, 'Step Invoke'));
      sqsList.forEach(s => addEdge(sfn.id, s.id, 'Step Enqueue'));
      snsList.forEach(s => addEdge(sfn.id, s.id, 'Step Notify'));
    });

    ec2s.forEach(ec2 => {
      rdss.forEach(rds => addEdge(ec2.id, rds.id, 'SQL TCP:5432/3306'));
      dynamodbs.forEach(d => addEdge(ec2.id, d.id, 'NoSQL'));
      s3s.forEach(s => addEdge(ec2.id, s.id, 'Assets'));
      elasticaches.forEach(c => addEdge(ec2.id, c.id, 'Cache'));
    });

    secrets.forEach(sec => {
      computeWorkloads.forEach(w => addEdge(w.id, sec.id, 'Secret', 'security'));
      rdss.forEach(r => addEdge(r.id, sec.id, 'Auth Creds', 'security'));
    });

    kmsKeys.forEach(key => {
      secrets.forEach(sec => addEdge(key.id, sec.id, 'KMS Encryption', 'security'));
      s3s.forEach(s => addEdge(key.id, s.id, 'SSE-KMS', 'security'));
      rdss.forEach(r => addEdge(key.id, r.id, 'Storage KMS', 'security'));
      eksList.forEach(eks => addEdge(key.id, eks.id, 'Envelope KMS', 'security'));
    });

    peerings.forEach(peer => {
      vpcList.forEach(vpc => addEdge(peer.id, vpc.id, 'VPC Peering', 'peering'));
    });

    tgws.forEach(tgw => {
      vpcList.forEach(vpc => addEdge(tgw.id, vpc.id, 'TGW Attachment', 'peering'));
    });
  },

  /** Resources that belong at the top of the diagram, outside any network. */
  isEntryResource(type) {
    return type.startsWith('aws_route53') ||
      type.includes('cloudfront') ||
      type.includes('cognito') ||
      type.includes('apigateway') ||
      type.includes('api_gateway') ||
      type.startsWith('aws_waf');
  }
};

export default awsProvider;
