/**
 * Official Microsoft Azure architecture icons and category theme colors.
 * SVGs are embedded verbatim from the vendor set — see officialIcons.js (generated).
 *
 * Regenerate the embedded SVGs with: npm run icons:build
 */

import { OFFICIAL_ICONS } from './officialIcons.js';

export const CATEGORIES = {
  compute: { name: "Compute", color: "#0078D4", bgColor: "rgba(0, 120, 212, 0.15)" },
  containers: { name: "Containers", color: "#0078D4", bgColor: "rgba(0, 120, 212, 0.15)" },
  networking: { name: "Networking", color: "#00A4EF", bgColor: "rgba(0, 164, 239, 0.15)" },
  storage: { name: "Storage", color: "#00A2AD", bgColor: "rgba(0, 162, 173, 0.15)" },
  database: { name: "Databases", color: "#0063B1", bgColor: "rgba(0, 99, 177, 0.15)" },
  security: { name: "Identity & Security", color: "#E81123", bgColor: "rgba(232, 17, 35, 0.15)" },
  management: { name: "Monitor & Management", color: "#8661C5", bgColor: "rgba(134, 97, 197, 0.15)" },
  integration: { name: "Integration", color: "#C239B3", bgColor: "rgba(194, 57, 179, 0.15)" },
  analytics: { name: "Analytics", color: "#00B294", bgColor: "rgba(0, 178, 148, 0.15)" },
  general: { name: "General", color: "#5C6670", bgColor: "rgba(92, 102, 112, 0.15)" }
};

export const ICONS = {
  virtual_machine: {
    category: "compute",
    name: "Virtual Machine",
    svg: OFFICIAL_ICONS.virtual_machine
  },
  vm_scale_set: {
    category: "compute",
    name: "VM Scale Set",
    svg: OFFICIAL_ICONS.vm_scale_set
  },
  functions: {
    category: "compute",
    name: "Azure Functions",
    svg: OFFICIAL_ICONS.functions
  },
  app_service: {
    category: "compute",
    name: "App Service",
    svg: OFFICIAL_ICONS.app_service
  },
  app_service_plan: {
    category: "compute",
    name: "App Service Plan",
    svg: OFFICIAL_ICONS.app_service_plan
  },
  aks: {
    category: "containers",
    name: "Azure Kubernetes Service",
    svg: OFFICIAL_ICONS.aks
  },
  container_app: {
    category: "containers",
    name: "Container Apps",
    svg: OFFICIAL_ICONS.container_app
  },
  container_registry: {
    category: "containers",
    name: "Container Registry",
    svg: OFFICIAL_ICONS.container_registry
  },
  virtual_network: {
    category: "networking",
    name: "Virtual Network",
    svg: OFFICIAL_ICONS.virtual_network
  },
  subnet: {
    category: "networking",
    name: "Subnet",
    svg: OFFICIAL_ICONS.subnet
  },
  load_balancer: {
    category: "networking",
    name: "Load Balancer",
    svg: OFFICIAL_ICONS.load_balancer
  },
  application_gateway: {
    category: "networking",
    name: "Application Gateway",
    svg: OFFICIAL_ICONS.application_gateway
  },
  front_door: {
    category: "networking",
    name: "Front Door / CDN",
    svg: OFFICIAL_ICONS.front_door
  },
  dns: {
    category: "networking",
    name: "Azure DNS",
    svg: OFFICIAL_ICONS.dns
  },
  nat_gateway: {
    category: "networking",
    name: "NAT Gateway",
    svg: OFFICIAL_ICONS.nat_gateway
  },
  network_interface: {
    category: "networking",
    name: "Network Interface",
    svg: OFFICIAL_ICONS.network_interface
  },
  nsg: {
    category: "networking",
    name: "Network Security Group",
    svg: OFFICIAL_ICONS.nsg
  },
  api_management: {
    category: "networking",
    name: "API Management",
    svg: OFFICIAL_ICONS.api_management
  },
  public_ip: {
    category: "networking",
    name: "Public IP Address",
    svg: OFFICIAL_ICONS.public_ip
  },
  storage_account: {
    category: "storage",
    name: "Storage Account",
    svg: OFFICIAL_ICONS.storage_account
  },
  blob_container: {
    category: "storage",
    name: "Blob Container",
    svg: OFFICIAL_ICONS.blob_container
  },
  managed_disk: {
    category: "storage",
    name: "Managed Disk",
    svg: OFFICIAL_ICONS.managed_disk
  },
  file_share: {
    category: "storage",
    name: "Azure Files",
    svg: OFFICIAL_ICONS.file_share
  },
  sql_database: {
    category: "database",
    name: "Azure SQL Database",
    svg: OFFICIAL_ICONS.sql_database
  },
  cosmos_db: {
    category: "database",
    name: "Azure Cosmos DB",
    svg: OFFICIAL_ICONS.cosmos_db
  },
  postgresql: {
    category: "database",
    name: "Azure Database for PostgreSQL",
    svg: OFFICIAL_ICONS.postgresql
  },
  redis_cache: {
    category: "database",
    name: "Azure Cache for Redis",
    svg: OFFICIAL_ICONS.redis_cache
  },
  synapse: {
    category: "analytics",
    name: "Azure Synapse Analytics",
    svg: OFFICIAL_ICONS.synapse
  },
  data_factory: {
    category: "analytics",
    name: "Data Factory",
    svg: OFFICIAL_ICONS.data_factory
  },
  service_bus: {
    category: "integration",
    name: "Service Bus",
    svg: OFFICIAL_ICONS.service_bus
  },
  event_grid: {
    category: "integration",
    name: "Event Grid",
    svg: OFFICIAL_ICONS.event_grid
  },
  event_hub: {
    category: "integration",
    name: "Event Hubs",
    svg: OFFICIAL_ICONS.event_hub
  },
  logic_app: {
    category: "integration",
    name: "Logic Apps",
    svg: OFFICIAL_ICONS.logic_app
  },
  key_vault: {
    category: "security",
    name: "Key Vault",
    svg: OFFICIAL_ICONS.key_vault
  },
  managed_identity: {
    category: "security",
    name: "Managed Identity",
    svg: OFFICIAL_ICONS.managed_identity
  },
  role_assignment: {
    category: "security",
    name: "Role Assignment",
    svg: OFFICIAL_ICONS.role_assignment
  },
  monitor: {
    category: "management",
    name: "Azure Monitor",
    svg: OFFICIAL_ICONS.monitor
  },
  log_analytics: {
    category: "management",
    name: "Log Analytics Workspace",
    svg: OFFICIAL_ICONS.log_analytics
  },
  resource_group: {
    category: "general",
    name: "Resource Group",
    svg: OFFICIAL_ICONS.resource_group
  },
  generic: {
    category: "general",
    name: "Azure Resource",
    svg: OFFICIAL_ICONS.generic
  }
};
