import { CATEGORIES, ICONS } from './icons.js';

/**
 * Maps Terraform `google_*` / `google-beta_*` resource types to icon keys.
 */
const RESOURCE_MAP = {
  // Compute
  google_compute_instance: 'compute_engine',
  google_compute_instance_template: 'compute_engine',
  google_compute_disk: 'persistent_disk',
  google_compute_instance_group_manager: 'instance_group',
  google_compute_region_instance_group_manager: 'instance_group',
  google_compute_autoscaler: 'instance_group',
  google_compute_region_autoscaler: 'instance_group',
  google_cloudfunctions_function: 'cloud_functions',
  google_cloudfunctions2_function: 'cloud_functions',
  google_cloud_run_service: 'cloud_run',
  google_cloud_run_v2_service: 'cloud_run',
  google_cloud_run_v2_job: 'cloud_run',
  google_app_engine_standard_app_version: 'app_engine',
  google_app_engine_flexible_app_version: 'app_engine',

  // Containers
  google_container_cluster: 'gke',
  google_container_node_pool: 'gke',
  google_artifact_registry_repository: 'artifact_registry',

  // Networking
  google_compute_network: 'vpc_network',
  google_compute_subnetwork: 'subnetwork',
  google_compute_firewall: 'firewall',
  google_compute_router: 'cloud_router',
  google_compute_router_nat: 'cloud_nat',
  google_compute_address: 'vpc_network',
  google_compute_global_address: 'vpc_network',
  google_compute_route: 'cloud_router',
  google_compute_forwarding_rule: 'load_balancer',
  google_compute_global_forwarding_rule: 'load_balancer',
  google_compute_target_http_proxy: 'load_balancer',
  google_compute_target_https_proxy: 'load_balancer',
  google_compute_url_map: 'load_balancer',
  google_compute_backend_service: 'load_balancer',
  google_compute_backend_bucket: 'cloud_cdn',
  google_compute_health_check: 'load_balancer',
  google_compute_ssl_certificate: 'load_balancer',
  google_compute_managed_ssl_certificate: 'load_balancer',
  google_dns_managed_zone: 'cloud_dns',
  google_dns_record_set: 'cloud_dns',
  google_api_gateway_api: 'api_gateway',
  google_api_gateway_gateway: 'api_gateway',
  google_api_gateway_api_config: 'api_gateway',
  google_vpc_access_connector: 'vpc_network',

  // Storage
  google_storage_bucket: 'cloud_storage',
  google_storage_bucket_object: 'cloud_storage',
  google_storage_bucket_iam_binding: 'cloud_storage',
  google_storage_bucket_iam_member: 'cloud_storage',
  google_filestore_instance: 'filestore',

  // Database
  google_sql_database_instance: 'cloud_sql',
  google_sql_database: 'cloud_sql',
  google_sql_user: 'cloud_sql',
  google_spanner_instance: 'spanner',
  google_spanner_database: 'spanner',
  google_firestore_database: 'firestore',
  google_firestore_index: 'firestore',
  google_bigtable_instance: 'bigtable',
  google_bigtable_table: 'bigtable',
  google_redis_instance: 'memorystore',

  // Analytics
  google_bigquery_dataset: 'bigquery',
  google_bigquery_table: 'bigquery',
  google_bigquery_job: 'bigquery',
  google_dataflow_job: 'dataflow',

  // Integration
  google_pubsub_topic: 'pubsub',
  google_pubsub_subscription: 'pubsub',
  google_cloud_tasks_queue: 'cloud_tasks',
  google_cloud_scheduler_job: 'cloud_tasks',
  google_eventarc_trigger: 'eventarc',

  // Security
  google_project_iam_member: 'iam',
  google_project_iam_binding: 'iam',
  google_project_iam_custom_role: 'iam',
  google_service_account: 'service_account',
  google_service_account_iam_member: 'service_account',
  google_service_account_key: 'service_account',
  google_kms_key_ring: 'kms',
  google_kms_crypto_key: 'kms',
  google_secret_manager_secret: 'secret_manager',
  google_secret_manager_secret_version: 'secret_manager',

  // Operations
  google_monitoring_alert_policy: 'monitoring',
  google_monitoring_dashboard: 'monitoring',
  google_monitoring_uptime_check_config: 'monitoring',
  google_logging_project_sink: 'logging',
  google_logging_metric: 'logging',

  // Project scaffolding
  google_project: 'project',
  google_project_service: 'project'
};

export const gcpProvider = {
  id: 'gcp',
  name: 'Google Cloud',
  shortName: 'GCP',
  accentColor: '#4285F4',
  typePrefixes: ['google_'],
  categories: CATEGORIES,
  icons: ICONS,
  resourceMap: RESOURCE_MAP,
  genericIconKey: 'generic',

  terms: {
    network: 'VPC Network',
    subnet: 'Subnetwork',
    zone: 'Zone',
    region: 'Region',
    tags: 'Labels',
    group: 'Project'
  },

  hierarchy: {
    networkTypes: ['google_compute_network'],
    subnetTypes: ['google_compute_subnetwork'],
    networkRefKeys: ['network', 'network_interface.0.network'],
    subnetRefKeys: ['subnetwork', 'network_interface.0.subnetwork', 'subnetwork_id'],
    zoneKeys: ['zone', 'location'],
    regionKeys: ['region'],
    cidrKeys: ['ip_cidr_range'],
    tagKeys: ['labels'],
    groupKeys: ['project'],
    publicSubnetHints: ['pub', 'dmz', 'edge', 'ingress', 'external'],
    // A GCP subnetwork with Private Google Access off and no NAT hint reads as public-facing.
    isPublicSubnet: (attrs) => attrs.private_ip_google_access === false
  },

  inferEdges(nodes, addEdge) {
    const by = (fn) => nodes.filter(fn);
    const dns = by(n => n.type.startsWith('google_dns'));
    const globalLbs = by(n => n.type === 'google_compute_global_forwarding_rule' || n.type === 'google_compute_forwarding_rule');
    const urlMaps = by(n => n.type === 'google_compute_url_map');
    const backends = by(n => n.type === 'google_compute_backend_service');
    const backendBuckets = by(n => n.type === 'google_compute_backend_bucket');
    const apigws = by(n => n.type.startsWith('google_api_gateway'));
    const instanceGroups = by(n => n.type.includes('instance_group_manager'));
    const instances = by(n => n.type === 'google_compute_instance');
    const cloudRun = by(n => n.type.startsWith('google_cloud_run'));
    const functions = by(n => n.type.startsWith('google_cloudfunctions'));
    const gkeClusters = by(n => n.type === 'google_container_cluster');
    const nodePools = by(n => n.type === 'google_container_node_pool');
    const sql = by(n => n.type === 'google_sql_database_instance');
    const spanner = by(n => n.type === 'google_spanner_instance');
    const firestore = by(n => n.type === 'google_firestore_database');
    const bigtable = by(n => n.type === 'google_bigtable_instance');
    const redis = by(n => n.type === 'google_redis_instance');
    const buckets = by(n => n.type === 'google_storage_bucket');
    const topics = by(n => n.type === 'google_pubsub_topic');
    const subscriptions = by(n => n.type === 'google_pubsub_subscription');
    const scheduler = by(n => n.type === 'google_cloud_scheduler_job');
    const eventarc = by(n => n.type === 'google_eventarc_trigger');
    const bq = by(n => n.type === 'google_bigquery_dataset');
    const nats = by(n => n.type === 'google_compute_router_nat');
    const secrets = by(n => n.type === 'google_secret_manager_secret');

    dns.forEach(d => {
      globalLbs.forEach(lb => addEdge(d.id, lb.id, 'DNS'));
      apigws.forEach(gw => addEdge(d.id, gw.id, 'DNS'));
      cloudRun.forEach(cr => addEdge(d.id, cr.id, 'DNS'));
    });

    globalLbs.forEach(lb => urlMaps.forEach(um => addEdge(lb.id, um.id, 'Route')));

    urlMaps.forEach(um => {
      backends.forEach(b => addEdge(um.id, b.id, 'Path Rule'));
      backendBuckets.forEach(b => addEdge(um.id, b.id, 'Static'));
    });

    backendBuckets.forEach(b => buckets.forEach(bk => addEdge(b.id, bk.id, 'Origin')));

    backends.forEach(b => {
      instanceGroups.forEach(ig => addEdge(b.id, ig.id, 'Backend'));
      cloudRun.forEach(cr => addEdge(b.id, cr.id, 'Serverless NEG'));
      nodePools.forEach(np => addEdge(b.id, np.id, 'NEG'));
    });

    instanceGroups.forEach(ig => instances.forEach(i => addEdge(ig.id, i.id, 'Manages')));

    apigws.forEach(gw => {
      functions.forEach(f => addEdge(gw.id, f.id, 'Invoke'));
      cloudRun.forEach(cr => addEdge(gw.id, cr.id, 'Invoke'));
    });

    gkeClusters.forEach(c => nodePools.forEach(np => addEdge(c.id, np.id, 'Managed')));

    nats.forEach(nat => {
      instances.forEach(i => addEdge(nat.id, i.id, 'Egress NAT'));
      nodePools.forEach(np => addEdge(nat.id, np.id, 'Egress NAT'));
    });

    const workloads = [...functions, ...cloudRun, ...instances, ...nodePools];
    workloads.forEach(w => {
      sql.forEach(s => addEdge(w.id, s.id, 'SQL TCP:5432/3306'));
      spanner.forEach(s => addEdge(w.id, s.id, 'Spanner API'));
      firestore.forEach(f => addEdge(w.id, f.id, 'Read/Write'));
      bigtable.forEach(b => addEdge(w.id, b.id, 'Read/Write'));
      redis.forEach(r => addEdge(w.id, r.id, 'Cache'));
      buckets.forEach(b => addEdge(w.id, b.id, 'Objects'));
      topics.forEach(t => addEdge(w.id, t.id, 'Publish'));
      secrets.forEach(s => addEdge(w.id, s.id, 'Secrets'));
    });

    topics.forEach(t => {
      subscriptions.forEach(s => addEdge(t.id, s.id, 'Subscribe'));
      bq.forEach(d => addEdge(t.id, d.id, 'Stream'));
    });

    subscriptions.forEach(s => {
      functions.forEach(f => addEdge(s.id, f.id, 'Push'));
      cloudRun.forEach(cr => addEdge(s.id, cr.id, 'Push'));
    });

    scheduler.forEach(sc => {
      topics.forEach(t => addEdge(sc.id, t.id, 'Schedule'));
      functions.forEach(f => addEdge(sc.id, f.id, 'Schedule'));
    });

    eventarc.forEach(ev => {
      cloudRun.forEach(cr => addEdge(ev.id, cr.id, 'Event'));
      functions.forEach(f => addEdge(ev.id, f.id, 'Event'));
    });
  },

  isEntryResource(type) {
    return type.startsWith('google_dns') ||
      type.startsWith('google_api_gateway') ||
      type === 'google_compute_global_forwarding_rule' ||
      type === 'google_compute_forwarding_rule' ||
      type === 'google_compute_url_map' ||
      type === 'google_compute_target_http_proxy' ||
      type === 'google_compute_target_https_proxy' ||
      type === 'google_compute_managed_ssl_certificate';
  }
};

export default gcpProvider;
