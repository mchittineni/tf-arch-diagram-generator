/**
 * Microsoft Azure architecture icon set and category theme colors.
 * Vector badges drawn in the Azure palette (blue family with service accents).
 */

export const CATEGORIES = {
  compute: { name: 'Compute', color: '#0078D4', bgColor: 'rgba(0, 120, 212, 0.15)' },
  containers: { name: 'Containers', color: '#0078D4', bgColor: 'rgba(0, 120, 212, 0.15)' },
  networking: { name: 'Networking', color: '#00A4EF', bgColor: 'rgba(0, 164, 239, 0.15)' },
  storage: { name: 'Storage', color: '#00A2AD', bgColor: 'rgba(0, 162, 173, 0.15)' },
  database: { name: 'Databases', color: '#0063B1', bgColor: 'rgba(0, 99, 177, 0.15)' },
  security: { name: 'Identity & Security', color: '#E81123', bgColor: 'rgba(232, 17, 35, 0.15)' },
  management: { name: 'Monitor & Management', color: '#8661C5', bgColor: 'rgba(134, 97, 197, 0.15)' },
  integration: { name: 'Integration', color: '#C239B3', bgColor: 'rgba(194, 57, 179, 0.15)' },
  analytics: { name: 'Analytics', color: '#00B294', bgColor: 'rgba(0, 178, 148, 0.15)' },
  general: { name: 'General', color: '#5C6670', bgColor: 'rgba(92, 102, 112, 0.15)' }
};

export const ICONS = {
  // Compute
  virtual_machine: {
    category: 'compute',
    name: 'Virtual Machine',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <rect x="14" y="18" width="36" height="24" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <rect x="22" y="26" width="20" height="8" rx="1.5" fill="#FFF"/>
      <path d="M26 42V48H38V42" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="22" y1="48" x2="42" y2="48" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  vm_scale_set: {
    category: 'compute',
    name: 'VM Scale Set',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <rect x="13" y="13" width="20" height="16" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="31" y="35" width="20" height="16" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="22" y="24" width="20" height="16" rx="2" fill="#0078D4" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  functions: {
    category: 'compute',
    name: 'Azure Functions',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <path d="M34 14L20 36H30L26 50L44 26H32L34 14Z" fill="#FFD400" stroke="#FFF" stroke-width="2" stroke-linejoin="round"/>
    </svg>`
  },
  app_service: {
    category: 'compute',
    name: 'App Service',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="7" ry="16" stroke="#FFF" stroke-width="2"/>
      <line x1="16" y1="32" x2="48" y2="32" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  app_service_plan: {
    category: 'compute',
    name: 'App Service Plan',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <rect x="15" y="18" width="34" height="28" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="15" y1="27" x2="49" y2="27" stroke="#FFF" stroke-width="2"/>
      <circle cx="21" cy="22.5" r="1.8" fill="#FFF"/>
      <line x1="24" y1="36" x2="40" y2="36" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },

  // Containers
  aks: {
    category: 'containers',
    name: 'Azure Kubernetes Service',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <polygon points="32,15 47,23.5 47,40.5 32,49 17,40.5 17,23.5" stroke="#FFF" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="32" r="5.5" fill="#FFF"/>
      <path d="M32 15V26M47 40.5L37 35.5M17 40.5L27 35.5" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  container_app: {
    category: 'containers',
    name: 'Container Apps',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <rect x="14" y="22" width="36" height="20" rx="4" stroke="#FFF" stroke-width="2.5"/>
      <line x1="26" y1="22" x2="26" y2="42" stroke="#FFF" stroke-width="2"/>
      <line x1="38" y1="22" x2="38" y2="42" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  container_registry: {
    category: 'containers',
    name: 'Container Registry',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0078D4"/>
      <path d="M32 14L46 22V40L32 48L18 40V22L32 14Z" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M18 22L32 30L46 22M32 30V48" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },

  // Networking
  virtual_network: {
    category: 'networking',
    name: 'Virtual Network',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <rect x="15" y="15" width="34" height="34" rx="4" stroke="#FFF" stroke-width="2.5" stroke-dasharray="5 3"/>
      <circle cx="24" cy="24" r="3" fill="#FFF"/>
      <circle cx="40" cy="24" r="3" fill="#FFF"/>
      <circle cx="24" cy="40" r="3" fill="#FFF"/>
      <circle cx="40" cy="40" r="3" fill="#FFF"/>
      <path d="M24 24H40V40H24V24Z" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.6"/>
    </svg>`
  },
  subnet: {
    category: 'networking',
    name: 'Subnet',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <rect x="14" y="18" width="36" height="28" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="18" x2="32" y2="46" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  load_balancer: {
    category: 'networking',
    name: 'Load Balancer',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <circle cx="20" cy="32" r="5" fill="#FFF"/>
      <circle cx="44" cy="20" r="5" fill="#FFF"/>
      <circle cx="44" cy="44" r="5" fill="#FFF"/>
      <path d="M25 32H32M32 20H39M32 44H39M32 20V44" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  application_gateway: {
    category: 'networking',
    name: 'Application Gateway',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <polygon points="32,15 48,24 48,42 32,51 16,42 16,24" stroke="#FFF" stroke-width="2.5" fill="none"/>
      <rect x="26" y="27" width="12" height="12" rx="2" fill="#FFF"/>
      <line x1="32" y1="15" x2="32" y2="27" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="39" x2="32" y2="51" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  front_door: {
    category: 'networking',
    name: 'Front Door / CDN',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="7" ry="16" stroke="#FFF" stroke-width="2"/>
      <line x1="16" y1="32" x2="48" y2="32" stroke="#FFF" stroke-width="2"/>
      <circle cx="16" cy="32" r="3" fill="#FFF"/>
      <circle cx="48" cy="32" r="3" fill="#FFF"/>
    </svg>`
  },
  dns: {
    category: 'networking',
    name: 'Azure DNS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <circle cx="32" cy="32" r="17" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 15V22M32 42V49M15 32H22M42 32H49" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M26 38L32 24L38 38H26Z" fill="#FFF"/>
    </svg>`
  },
  nat_gateway: {
    category: 'networking',
    name: 'NAT Gateway',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <rect x="18" y="20" width="28" height="24" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <path d="M26 32L34 26V38L26 32Z" fill="#FFF"/>
      <line x1="38" y1="32" x2="42" y2="32" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  network_interface: {
    category: 'networking',
    name: 'Network Interface',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <rect x="16" y="26" width="32" height="16" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <path d="M24 26V18M40 26V18" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="26" cy="34" r="2" fill="#FFF"/>
      <circle cx="34" cy="34" r="2" fill="#FFF"/>
      <circle cx="42" cy="34" r="2" fill="#FFF"/>
    </svg>`
  },
  nsg: {
    category: 'networking',
    name: 'Network Security Group',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <path d="M32 14L46 20V32C46 41 40 47 32 50C24 47 18 41 18 32V20L32 14Z" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M26 32L31 37L40 27" stroke="#FFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  api_management: {
    category: 'networking',
    name: 'API Management',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <rect x="14" y="20" width="16" height="24" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="34" y="20" width="16" height="24" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <path d="M30 32H34" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="22" cy="32" r="2.5" fill="#FFF"/>
      <circle cx="42" cy="32" r="2.5" fill="#FFF"/>
    </svg>`
  },
  public_ip: {
    category: 'networking',
    name: 'Public IP Address',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A4EF"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <path d="M24 32H40M32 24V40" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="40,29 45,32 40,35" fill="#FFF"/>
    </svg>`
  },

  // Storage
  storage_account: {
    category: 'storage',
    name: 'Storage Account',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A2AD"/>
      <rect x="14" y="20" width="36" height="10" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="14" y="34" width="36" height="10" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="21" cy="25" r="2" fill="#FFF"/>
      <circle cx="21" cy="39" r="2" fill="#FFF"/>
      <line x1="28" y1="25" x2="43" y2="25" stroke="#FFF" stroke-width="2"/>
      <line x1="28" y1="39" x2="43" y2="39" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  blob_container: {
    category: 'storage',
    name: 'Blob Container',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A2AD"/>
      <path d="M18 20C18 17.5 24 16 32 16C40 16 46 17.5 46 20V44C46 46.5 40 48 32 48C24 48 18 46.5 18 44V20Z" stroke="#FFF" stroke-width="2.5"/>
      <path d="M18 28C18 30.5 24 32 32 32C40 32 46 30.5 46 28" stroke="#FFF" stroke-width="2"/>
      <path d="M18 36C18 38.5 24 40 32 40C40 40 46 38.5 46 36" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  managed_disk: {
    category: 'storage',
    name: 'Managed Disk',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A2AD"/>
      <circle cx="32" cy="32" r="15" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="4" fill="#FFF"/>
      <path d="M42 22L34 30" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  file_share: {
    category: 'storage',
    name: 'Azure Files',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00A2AD"/>
      <path d="M16 22H28L32 26H48V44H16V22Z" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="24" y1="34" x2="40" y2="34" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },

  // Database
  sql_database: {
    category: 'database',
    name: 'Azure SQL Database',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0063B1"/>
      <ellipse cx="32" cy="18" rx="16" ry="6" stroke="#FFF" stroke-width="2.5" fill="#FFF" fill-opacity="0.2"/>
      <path d="M16 18V46C16 49.3 23.2 52 32 52C40.8 52 48 49.3 48 46V18" stroke="#FFF" stroke-width="2.5"/>
      <path d="M16 27C16 30.3 23.2 33 32 33C40.8 33 48 30.3 48 27" stroke="#FFF" stroke-width="2"/>
      <path d="M16 37C16 40.3 23.2 43 32 43C40.8 43 48 40.3 48 37" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  cosmos_db: {
    category: 'database',
    name: 'Azure Cosmos DB',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0063B1"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="16" ry="6" stroke="#FFF" stroke-width="2"/>
      <ellipse cx="32" cy="32" rx="6" ry="16" stroke="#FFF" stroke-width="2"/>
      <circle cx="32" cy="32" r="3.5" fill="#FFF"/>
    </svg>`
  },
  postgresql: {
    category: 'database',
    name: 'Azure Database for PostgreSQL',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0063B1"/>
      <ellipse cx="32" cy="19" rx="15" ry="5" fill="#FFF" fill-opacity="0.9"/>
      <path d="M17 19V45C17 48 23.7 50 32 50C40.3 50 47 48 47 45V19" stroke="#FFF" stroke-width="2.5"/>
      <path d="M17 30C17 33 23.7 35 32 35C40.3 35 47 33 47 30" stroke="#FFF" stroke-width="2"/>
      <path d="M17 40C17 43 23.7 45 32 45C40.3 45 47 43 47 40" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  redis_cache: {
    category: 'database',
    name: 'Azure Cache for Redis',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#0063B1"/>
      <rect x="18" y="16" width="28" height="12" rx="2" stroke="#FFF" stroke-width="2"/>
      <rect x="18" y="34" width="28" height="12" rx="2" stroke="#FFF" stroke-width="2"/>
      <circle cx="24" cy="22" r="2" fill="#FFF"/>
      <circle cx="24" cy="40" r="2" fill="#FFF"/>
      <path d="M36 28L32 34M28 28L32 34" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },

  // Analytics
  synapse: {
    category: 'analytics',
    name: 'Azure Synapse Analytics',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00B294"/>
      <circle cx="30" cy="30" r="13" stroke="#FFF" stroke-width="2.5"/>
      <path d="M39 39L48 48" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <rect x="25" y="28" width="3" height="8" fill="#FFF"/>
      <rect x="30" y="24" width="3" height="12" fill="#FFF"/>
      <rect x="35" y="31" width="3" height="5" fill="#FFF"/>
    </svg>`
  },
  data_factory: {
    category: 'analytics',
    name: 'Data Factory',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00B294"/>
      <path d="M16 24H48M16 32H40M16 40H32" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="48,29 54,32 48,35" fill="#FFF"/>
    </svg>`
  },

  // Integration
  service_bus: {
    category: 'integration',
    name: 'Service Bus',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#C239B3"/>
      <rect x="16" y="24" width="32" height="16" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="24" x2="24" y2="40" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="24" x2="32" y2="40" stroke="#FFF" stroke-width="2"/>
      <line x1="40" y1="24" x2="40" y2="40" stroke="#FFF" stroke-width="2"/>
      <path d="M12 32H16M48 32H52" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  event_grid: {
    category: 'integration',
    name: 'Event Grid',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#C239B3"/>
      <circle cx="20" cy="32" r="5" fill="#FFF"/>
      <circle cx="44" cy="20" r="5" fill="#FFF"/>
      <circle cx="44" cy="44" r="5" fill="#FFF"/>
      <path d="M25 32C32 32 36 22 40 21M25 32C32 32 36 42 40 43" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  event_hub: {
    category: 'integration',
    name: 'Event Hubs',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#C239B3"/>
      <circle cx="32" cy="32" r="7" fill="#FFF"/>
      <path d="M32 16V22M32 42V48M16 32H22M42 32H48M20 20L25 25M39 39L44 44M20 44L25 39M39 25L44 20" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  logic_app: {
    category: 'integration',
    name: 'Logic Apps',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#C239B3"/>
      <circle cx="20" cy="20" r="5" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="44" cy="20" r="5" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="32" cy="44" r="5" stroke="#FFF" stroke-width="2.5"/>
      <path d="M24 23L29 40M40 23L35 40" stroke="#FFF" stroke-width="2"/>
      <path d="M25 20H39" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },

  // Security
  key_vault: {
    category: 'security',
    name: 'Key Vault',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#E81123"/>
      <rect x="18" y="20" width="28" height="28" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="32" cy="31" r="6" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 37V44" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M24 20V16H40V20" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
    </svg>`
  },
  managed_identity: {
    category: 'security',
    name: 'Managed Identity',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#E81123"/>
      <circle cx="32" cy="24" r="8" stroke="#FFF" stroke-width="2.5"/>
      <path d="M18 48C18 40.3 24.3 34 32 34C39.7 34 46 40.3 46 48" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="44" cy="22" r="4" fill="#FFD400"/>
    </svg>`
  },
  role_assignment: {
    category: 'security',
    name: 'Role Assignment',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#E81123"/>
      <rect x="17" y="16" width="30" height="32" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="26" x2="40" y2="26" stroke="#FFF" stroke-width="2"/>
      <line x1="24" y1="33" x2="40" y2="33" stroke="#FFF" stroke-width="2"/>
      <path d="M24 40L28 44L36 36" stroke="#FFD400" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },

  // Management
  monitor: {
    category: 'management',
    name: 'Azure Monitor',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8661C5"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 20V32L40 36" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 42L28 34L34 38L42 26" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  log_analytics: {
    category: 'management',
    name: 'Log Analytics Workspace',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8661C5"/>
      <rect x="17" y="16" width="30" height="32" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="26" x2="40" y2="26" stroke="#FFF" stroke-width="2"/>
      <line x1="24" y1="33" x2="40" y2="33" stroke="#FFF" stroke-width="2"/>
      <line x1="24" y1="40" x2="34" y2="40" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  resource_group: {
    category: 'general',
    name: 'Resource Group',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#5C6670"/>
      <rect x="16" y="16" width="32" height="32" rx="4" stroke="#00A4EF" stroke-width="2.5" stroke-dasharray="5 3"/>
      <rect x="23" y="23" width="8" height="8" fill="#FFF"/>
      <rect x="33" y="23" width="8" height="8" fill="#FFF" fill-opacity="0.6"/>
      <rect x="23" y="33" width="8" height="8" fill="#FFF" fill-opacity="0.6"/>
    </svg>`
  },
  generic: {
    category: 'general',
    name: 'Azure Resource',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#5C6670"/>
      <rect x="18" y="18" width="28" height="28" rx="4" stroke="#00A4EF" stroke-width="2.5"/>
      <path d="M26 32H38M32 26V38" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  }
};
