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
  aws_lb: 'alb',
  aws_alb: 'alb',
  aws_lb_listener: 'alb',
  aws_lb_target_group: 'alb',
  aws_alb_target_group: 'alb',
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

  // Integration & Management
  aws_cloudwatch_log_group: 'cloudwatch',
  aws_cloudwatch_metric_alarm: 'cloudwatch',
  aws_sqs_queue: 'sqs',
  aws_sqs_queue_policy: 'sqs',
  aws_sns_topic: 'sns',
  aws_sns_topic_subscription: 'sns',
  aws_cloudwatch_event_rule: 'eventbridge',
  aws_cloudwatch_event_target: 'eventbridge'
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
    const apigws = by(n => n.type.includes('apigateway') || n.type.includes('api_gateway'));
    const lambdas = by(n => n.type === 'aws_lambda_function');
    const ec2s = by(n => n.type === 'aws_instance' || n.type === 'aws_autoscaling_group');
    const rdss = by(n => n.type === 'aws_db_instance' || n.type === 'aws_rds_cluster');
    const dynamodbs = by(n => n.type === 'aws_dynamodb_table');
    const s3s = by(n => n.type === 'aws_s3_bucket');
    const igws = by(n => n.type === 'aws_internet_gateway');
    const natgws = by(n => n.type === 'aws_nat_gateway');
    const sqsList = by(n => n.type === 'aws_sqs_queue');
    const snsList = by(n => n.type === 'aws_sns_topic');
    const events = by(n => n.type.includes('cloudwatch_event'));
    const eksList = by(n => n.type === 'aws_eks_cluster');
    const nodeGroups = by(n => n.type === 'aws_eks_node_group');

    route53.forEach(r => {
      cloudfront.forEach(cf => addEdge(r.id, cf.id, 'DNS'));
      albs.forEach(alb => addEdge(r.id, alb.id, 'DNS'));
      apigws.forEach(gw => addEdge(r.id, gw.id, 'DNS'));
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

    albs.forEach(alb => {
      ec2s.forEach(ec2 => addEdge(alb.id, ec2.id, 'HTTP/HTTPS'));
      nodeGroups.forEach(ng => addEdge(alb.id, ng.id, 'Forward'));
    });

    natgws.forEach(nat => ec2s.forEach(ec2 => addEdge(nat.id, ec2.id, 'NAT')));

    apigws.forEach(gw => lambdas.forEach(l => addEdge(gw.id, l.id, 'Invoke')));

    lambdas.forEach(l => {
      dynamodbs.forEach(d => addEdge(l.id, d.id, 'Read/Write'));
      rdss.forEach(r => addEdge(l.id, r.id, 'Query'));
      s3s.forEach(s => addEdge(l.id, s.id, 'Store'));
      sqsList.forEach(q => addEdge(l.id, q.id, 'Enqueue'));
    });

    snsList.forEach(sns => {
      sqsList.forEach(sqs => addEdge(sns.id, sqs.id, 'Subscribe'));
      lambdas.forEach(l => addEdge(sns.id, l.id, 'Trigger'));
    });

    events.forEach(ev => {
      lambdas.forEach(l => addEdge(ev.id, l.id, 'Rule Event'));
      sqsList.forEach(s => addEdge(ev.id, s.id, 'Target'));
    });

    eksList.forEach(eks => nodeGroups.forEach(ng => addEdge(eks.id, ng.id, 'Managed')));

    ec2s.forEach(ec2 => {
      rdss.forEach(rds => addEdge(ec2.id, rds.id, 'SQL TCP:5432/3306'));
      s3s.forEach(s3 => addEdge(ec2.id, s3.id, 'Assets'));
    });
  },

  /** Resources that belong at the top of the diagram, outside any network. */
  isEntryResource(type) {
    return type.startsWith('aws_route53') ||
      type.includes('cloudfront') ||
      type.includes('cognito') ||
      type.includes('apigateway') ||
      type.includes('api_gateway');
  }
};

export default awsProvider;
