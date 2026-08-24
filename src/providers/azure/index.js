import { CATEGORIES, ICONS } from './icons.js';

/**
 * Maps Terraform `azurerm_*` / `azuread_*` resource types to icon keys.
 */
const RESOURCE_MAP = {
  // Compute
  azurerm_linux_virtual_machine: 'virtual_machine',
  azurerm_windows_virtual_machine: 'virtual_machine',
  azurerm_virtual_machine: 'virtual_machine',
  azurerm_linux_virtual_machine_scale_set: 'vm_scale_set',
  azurerm_windows_virtual_machine_scale_set: 'vm_scale_set',
  azurerm_virtual_machine_scale_set: 'vm_scale_set',
  azurerm_orchestrated_virtual_machine_scale_set: 'vm_scale_set',
  azurerm_availability_set: 'vm_scale_set',
  azurerm_managed_disk: 'managed_disk',
  azurerm_virtual_machine_extension: 'virtual_machine',
  azurerm_function_app: 'functions',
  azurerm_linux_function_app: 'functions',
  azurerm_windows_function_app: 'functions',
  azurerm_app_service: 'app_service',
  azurerm_linux_web_app: 'app_service',
  azurerm_windows_web_app: 'app_service',
  azurerm_app_service_plan: 'app_service_plan',
  azurerm_service_plan: 'app_service_plan',

  // Containers
  azurerm_kubernetes_cluster: 'aks',
  azurerm_kubernetes_cluster_node_pool: 'aks',
  azurerm_container_app: 'container_app',
  azurerm_container_app_environment: 'container_app',
  azurerm_container_group: 'container_app',
  azurerm_container_registry: 'container_registry',

  // Networking
  azurerm_virtual_network: 'virtual_network',
  azurerm_subnet: 'subnet',
  azurerm_virtual_network_peering: 'virtual_network',
  azurerm_network_interface: 'network_interface',
  azurerm_network_interface_security_group_association: 'nsg',
  azurerm_network_security_group: 'nsg',
  azurerm_network_security_rule: 'nsg',
  azurerm_lb: 'load_balancer',
  azurerm_lb_backend_address_pool: 'load_balancer',
  azurerm_lb_rule: 'load_balancer',
  azurerm_lb_probe: 'load_balancer',
  azurerm_application_gateway: 'application_gateway',
  azurerm_cdn_profile: 'front_door',
  azurerm_cdn_endpoint: 'front_door',
  azurerm_cdn_frontdoor_profile: 'front_door',
  azurerm_cdn_frontdoor_endpoint: 'front_door',
  azurerm_frontdoor: 'front_door',
  azurerm_dns_zone: 'dns',
  azurerm_dns_a_record: 'dns',
  azurerm_dns_cname_record: 'dns',
  azurerm_private_dns_zone: 'dns',
  azurerm_nat_gateway: 'nat_gateway',
  azurerm_nat_gateway_public_ip_association: 'nat_gateway',
  azurerm_public_ip: 'public_ip',
  azurerm_route_table: 'virtual_network',
  azurerm_route: 'virtual_network',
  azurerm_private_endpoint: 'network_interface',
  azurerm_api_management: 'api_management',
  azurerm_api_management_api: 'api_management',

  // Storage
  azurerm_storage_account: 'storage_account',
  azurerm_storage_container: 'blob_container',
  azurerm_storage_blob: 'blob_container',
  azurerm_storage_share: 'file_share',
  azurerm_storage_queue: 'storage_account',
  azurerm_storage_table: 'storage_account',

  // Database
  azurerm_mssql_server: 'sql_database',
  azurerm_mssql_database: 'sql_database',
  azurerm_sql_server: 'sql_database',
  azurerm_sql_database: 'sql_database',
  azurerm_mssql_firewall_rule: 'sql_database',
  azurerm_cosmosdb_account: 'cosmos_db',
  azurerm_cosmosdb_sql_database: 'cosmos_db',
  azurerm_cosmosdb_sql_container: 'cosmos_db',
  azurerm_postgresql_server: 'postgresql',
  azurerm_postgresql_flexible_server: 'postgresql',
  azurerm_postgresql_flexible_server_database: 'postgresql',
  azurerm_mysql_flexible_server: 'postgresql',
  azurerm_redis_cache: 'redis_cache',

  // Analytics
  azurerm_synapse_workspace: 'synapse',
  azurerm_synapse_sql_pool: 'synapse',
  azurerm_data_factory: 'data_factory',
  azurerm_data_factory_pipeline: 'data_factory',

  // Integration
  azurerm_servicebus_namespace: 'service_bus',
  azurerm_servicebus_queue: 'service_bus',
  azurerm_servicebus_topic: 'service_bus',
  azurerm_servicebus_subscription: 'service_bus',
  azurerm_eventgrid_topic: 'event_grid',
  azurerm_eventgrid_system_topic: 'event_grid',
  azurerm_eventgrid_event_subscription: 'event_grid',
  azurerm_eventhub_namespace: 'event_hub',
  azurerm_eventhub: 'event_hub',
  azurerm_eventhub_consumer_group: 'event_hub',
  azurerm_logic_app_workflow: 'logic_app',

  // Security & identity
  azurerm_key_vault: 'key_vault',
  azurerm_key_vault_secret: 'key_vault',
  azurerm_key_vault_key: 'key_vault',
  azurerm_key_vault_access_policy: 'key_vault',
  azurerm_user_assigned_identity: 'managed_identity',
  azurerm_role_assignment: 'role_assignment',
  azurerm_role_definition: 'role_assignment',
  azuread_application: 'managed_identity',
  azuread_service_principal: 'managed_identity',

  // Management
  azurerm_monitor_metric_alert: 'monitor',
  azurerm_monitor_action_group: 'monitor',
  azurerm_monitor_diagnostic_setting: 'monitor',
  azurerm_monitor_autoscale_setting: 'monitor',
  azurerm_application_insights: 'monitor',
  azurerm_log_analytics_workspace: 'log_analytics',
  azurerm_resource_group: 'resource_group'
};

export const azureProvider = {
  id: 'azure',
  name: 'Microsoft Azure',
  shortName: 'Azure',
  accentColor: '#0078D4',
  // Official Azure glyphs are drawn for light surfaces; the renderer puts this
  // tile behind them so they stay legible on the dark node card.
  iconBackdrop: '#f8fafc',
  typePrefixes: ['azurerm_', 'azuread_', 'azapi_', 'azurestack_'],
  categories: CATEGORIES,
  icons: ICONS,
  resourceMap: RESOURCE_MAP,
  genericIconKey: 'generic',

  terms: {
    network: 'Virtual Network',
    subnet: 'Subnet',
    zone: 'Availability Zone',
    region: 'Location',
    tags: 'Resource Tags',
    group: 'Resource Group'
  },

  hierarchy: {
    networkTypes: ['azurerm_virtual_network'],
    subnetTypes: ['azurerm_subnet'],
    networkRefKeys: ['virtual_network_name', 'virtual_network_id'],
    subnetRefKeys: [
      'subnet_id',
      'ip_configuration.0.subnet_id',
      'subnet',
      'default_node_pool.0.vnet_subnet_id',
      'vnet_subnet_id',
      'gateway_ip_configuration.0.subnet_id'
    ],
    zoneKeys: ['zone', 'zones.0', 'availability_zone'],
    regionKeys: ['location'],
    cidrKeys: ['address_prefixes.0', 'address_prefix', 'address_space.0'],
    tagKeys: ['tags'],
    groupKeys: ['resource_group_name'],
    publicSubnetHints: ['pub', 'dmz', 'edge', 'ingress', 'gateway', 'frontend'],
    isPublicSubnet: () => false
  },

  inferEdges(nodes, addEdge) {
    const by = (fn) => nodes.filter(fn);
    const dns = by(n => n.type.startsWith('azurerm_dns') || n.type.startsWith('azurerm_private_dns'));
    const frontDoors = by(n => n.type.includes('frontdoor') || n.type.startsWith('azurerm_cdn'));
    const appGateways = by(n => n.type === 'azurerm_application_gateway');
    const lbs = by(n => n.type === 'azurerm_lb');
    const apims = by(n => n.type.startsWith('azurerm_api_management'));
    const publicIps = by(n => n.type === 'azurerm_public_ip');
    const nats = by(n => n.type === 'azurerm_nat_gateway');
    const vms = by(n => n.type.endsWith('_virtual_machine') || n.type === 'azurerm_virtual_machine');
    const scaleSets = by(n => n.type.includes('virtual_machine_scale_set'));
    const nics = by(n => n.type === 'azurerm_network_interface');
    const aks = by(n => n.type === 'azurerm_kubernetes_cluster');
    const nodePools = by(n => n.type === 'azurerm_kubernetes_cluster_node_pool');
    const webApps = by(n => n.type === 'azurerm_app_service' || n.type.endsWith('_web_app'));
    const funcApps = by(n => n.type.includes('function_app'));
    const containerApps = by(n => n.type === 'azurerm_container_app');
    const sql = by(n => n.type === 'azurerm_mssql_database' || n.type === 'azurerm_sql_database');
    const sqlServers = by(n => n.type === 'azurerm_mssql_server' || n.type === 'azurerm_sql_server');
    const cosmos = by(n => n.type === 'azurerm_cosmosdb_account');
    const pg = by(n => n.type.includes('postgresql') || n.type.includes('mysql'));
    const redis = by(n => n.type === 'azurerm_redis_cache');
    const storage = by(n => n.type === 'azurerm_storage_account');
    const containers = by(n => n.type === 'azurerm_storage_container');
    const sbQueues = by(n => n.type === 'azurerm_servicebus_queue');
    const sbTopics = by(n => n.type === 'azurerm_servicebus_topic');
    const eventGrid = by(n => n.type.startsWith('azurerm_eventgrid'));
    const eventHubs = by(n => n.type === 'azurerm_eventhub');
    const keyVaults = by(n => n.type === 'azurerm_key_vault');
    const logAnalytics = by(n => n.type === 'azurerm_log_analytics_workspace');
    const appInsights = by(n => n.type === 'azurerm_application_insights');

    const workloads = [...vms, ...scaleSets, ...webApps, ...funcApps, ...containerApps, ...nodePools];
    const frontEnds = [...appGateways, ...lbs, ...apims, ...webApps, ...funcApps];

    dns.forEach(d => {
      frontDoors.forEach(fd => addEdge(d.id, fd.id, 'DNS'));
      appGateways.forEach(ag => addEdge(d.id, ag.id, 'DNS'));
      webApps.forEach(wa => addEdge(d.id, wa.id, 'DNS'));
      apims.forEach(a => addEdge(d.id, a.id, 'DNS'));
    });

    frontDoors.forEach(fd => {
      appGateways.forEach(ag => addEdge(fd.id, ag.id, 'Origin'));
      webApps.forEach(wa => addEdge(fd.id, wa.id, 'Origin'));
      containers.forEach(c => addEdge(fd.id, c.id, 'Static Origin'));
    });

    publicIps.forEach(ip => {
      appGateways.forEach(ag => addEdge(ip.id, ag.id, 'Frontend IP'));
      lbs.forEach(lb => addEdge(ip.id, lb.id, 'Frontend IP'));
      nats.forEach(nat => addEdge(ip.id, nat.id, 'Outbound'));
    });

    appGateways.forEach(ag => {
      scaleSets.forEach(ss => addEdge(ag.id, ss.id, 'HTTP/HTTPS'));
      nodePools.forEach(np => addEdge(ag.id, np.id, 'Ingress'));
      webApps.forEach(wa => addEdge(ag.id, wa.id, 'HTTP/HTTPS'));
    });

    lbs.forEach(lb => {
      vms.forEach(vm => addEdge(lb.id, vm.id, 'Balance'));
      scaleSets.forEach(ss => addEdge(lb.id, ss.id, 'Balance'));
    });

    apims.forEach(a => {
      funcApps.forEach(f => addEdge(a.id, f.id, 'Backend'));
      containerApps.forEach(c => addEdge(a.id, c.id, 'Backend'));
      webApps.forEach(w => addEdge(a.id, w.id, 'Backend'));
    });

    nics.forEach(nic => vms.forEach(vm => addEdge(nic.id, vm.id, 'Attached')));

    aks.forEach(c => nodePools.forEach(np => addEdge(c.id, np.id, 'Managed')));

    nats.forEach(nat => {
      scaleSets.forEach(ss => addEdge(nat.id, ss.id, 'Egress NAT'));
      nodePools.forEach(np => addEdge(nat.id, np.id, 'Egress NAT'));
    });

    sqlServers.forEach(s => sql.forEach(d => addEdge(s.id, d.id, 'Hosts')));

    workloads.forEach(w => {
      sql.forEach(s => addEdge(w.id, s.id, 'TDS TCP:1433'));
      cosmos.forEach(c => addEdge(w.id, c.id, 'Cosmos API'));
      pg.forEach(p => addEdge(w.id, p.id, 'SQL TCP:5432/3306'));
      redis.forEach(r => addEdge(w.id, r.id, 'Cache'));
      storage.forEach(s => addEdge(w.id, s.id, 'Blobs/Queues'));
      keyVaults.forEach(kv => addEdge(w.id, kv.id, 'Secrets'));
      sbQueues.forEach(q => addEdge(w.id, q.id, 'Enqueue'));
      sbTopics.forEach(t => addEdge(w.id, t.id, 'Publish'));
    });

    sbTopics.forEach(t => funcApps.forEach(f => addEdge(t.id, f.id, 'Trigger')));
    eventGrid.forEach(eg => {
      funcApps.forEach(f => addEdge(eg.id, f.id, 'Event'));
      containerApps.forEach(c => addEdge(eg.id, c.id, 'Event'));
      sbQueues.forEach(q => addEdge(eg.id, q.id, 'Target'));
    });
    eventHubs.forEach(eh => funcApps.forEach(f => addEdge(eh.id, f.id, 'Stream')));

    appInsights.forEach(ai => logAnalytics.forEach(la => addEdge(ai.id, la.id, 'Workspace')));
    frontEnds.forEach(fe => appInsights.forEach(ai => addEdge(fe.id, ai.id, 'Telemetry')));
  },

  isEntryResource(type) {
    return type.startsWith('azurerm_dns') ||
      type.startsWith('azurerm_private_dns') ||
      type.startsWith('azurerm_cdn') ||
      type.includes('frontdoor') ||
      type.startsWith('azurerm_api_management') ||
      type === 'azurerm_public_ip';
  }
};

export default azureProvider;
