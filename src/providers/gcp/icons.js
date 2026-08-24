/**
 * Google Cloud architecture icon set and category theme colors.
 * Vector badges drawn in the Google Cloud palette (blue/green/yellow/red).
 */

export const CATEGORIES = {
  compute: { name: 'Compute', color: '#4285F4', bgColor: 'rgba(66, 133, 244, 0.15)' },
  containers: { name: 'Containers', color: '#4285F4', bgColor: 'rgba(66, 133, 244, 0.15)' },
  networking: { name: 'Networking', color: '#34A853', bgColor: 'rgba(52, 168, 83, 0.15)' },
  storage: { name: 'Storage', color: '#F9AB00', bgColor: 'rgba(249, 171, 0, 0.15)' },
  database: { name: 'Databases', color: '#1A73E8', bgColor: 'rgba(26, 115, 232, 0.15)' },
  security: { name: 'Identity & Security', color: '#EA4335', bgColor: 'rgba(234, 67, 53, 0.15)' },
  management: { name: 'Operations', color: '#A142F4', bgColor: 'rgba(161, 66, 244, 0.15)' },
  integration: { name: 'Application Integration', color: '#F538A0', bgColor: 'rgba(245, 56, 160, 0.15)' },
  analytics: { name: 'Data Analytics', color: '#00ACC1', bgColor: 'rgba(0, 172, 193, 0.15)' },
  general: { name: 'General', color: '#5F6368', bgColor: 'rgba(95, 99, 104, 0.15)' }
};

export const ICONS = {
  // Compute
  compute_engine: {
    category: 'compute',
    name: 'Compute Engine',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <rect x="18" y="18" width="28" height="28" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <rect x="26" y="26" width="12" height="12" rx="2" fill="#FFF"/>
      <path d="M24 14V18M32 14V18M40 14V18M24 46V50M32 46V50M40 46V50" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M14 24H18M14 32H18M14 40H18M46 24H50M46 32H50M46 40H50" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  instance_group: {
    category: 'compute',
    name: 'Managed Instance Group',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <rect x="14" y="14" width="18" height="18" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="32" y="32" width="18" height="18" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="23" y="23" width="18" height="18" rx="2" fill="#4285F4" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  cloud_functions: {
    category: 'compute',
    name: 'Cloud Functions',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <path d="M22 48C22 42 26 40 30 40C34 40 36 38 36 32C36 24 40 16 46 16" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <path d="M22 32H38" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <circle cx="18" cy="48" r="4" fill="#FFF"/>
      <circle cx="46" cy="16" r="4" fill="#FFF"/>
    </svg>`
  },
  cloud_run: {
    category: 'compute',
    name: 'Cloud Run',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <rect x="14" y="22" width="36" height="20" rx="10" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="24" cy="32" r="4" fill="#FFF"/>
      <path d="M34 27L42 32L34 37V27Z" fill="#FFF"/>
    </svg>`
  },
  app_engine: {
    category: 'compute',
    name: 'App Engine',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <path d="M32 14L48 42H16L32 14Z" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M24 42L32 28L40 42" stroke="#FFF" stroke-width="2" stroke-linejoin="round"/>
      <line x1="16" y1="48" x2="48" y2="48" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // Containers
  gke: {
    category: 'containers',
    name: 'Google Kubernetes Engine',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <polygon points="32,15 47,23.5 47,40.5 32,49 17,40.5 17,23.5" stroke="#FFF" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="32" r="5.5" fill="#FFF"/>
      <path d="M32 15V26M47 40.5L37 35.5M17 40.5L27 35.5" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  artifact_registry: {
    category: 'containers',
    name: 'Artifact Registry',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#4285F4"/>
      <path d="M32 14L46 22V40L32 48L18 40V22L32 14Z" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M18 22L32 30L46 22M32 30V48" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },

  // Networking
  vpc_network: {
    category: 'networking',
    name: 'VPC Network',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <rect x="15" y="15" width="34" height="34" rx="4" stroke="#FFF" stroke-width="2.5" stroke-dasharray="5 3"/>
      <circle cx="24" cy="24" r="3" fill="#FFF"/>
      <circle cx="40" cy="24" r="3" fill="#FFF"/>
      <circle cx="24" cy="40" r="3" fill="#FFF"/>
      <circle cx="40" cy="40" r="3" fill="#FFF"/>
      <path d="M24 24H40V40H24V24Z" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.6"/>
    </svg>`
  },
  subnetwork: {
    category: 'networking',
    name: 'VPC Subnetwork',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <rect x="14" y="18" width="36" height="28" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="18" x2="32" y2="46" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  load_balancer: {
    category: 'networking',
    name: 'Cloud Load Balancing',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <circle cx="20" cy="32" r="5" fill="#FFF"/>
      <circle cx="44" cy="20" r="5" fill="#FFF"/>
      <circle cx="44" cy="44" r="5" fill="#FFF"/>
      <path d="M25 32H32M32 20H39M32 44H39M32 20V44" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  cloud_cdn: {
    category: 'networking',
    name: 'Cloud CDN',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="7" ry="16" stroke="#FFF" stroke-width="2"/>
      <line x1="16" y1="32" x2="48" y2="32" stroke="#FFF" stroke-width="2"/>
      <circle cx="16" cy="32" r="3" fill="#FFF"/>
      <circle cx="48" cy="32" r="3" fill="#FFF"/>
    </svg>`
  },
  cloud_dns: {
    category: 'networking',
    name: 'Cloud DNS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <circle cx="32" cy="32" r="17" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 15V22M32 42V49M15 32H22M42 32H49" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M26 38L32 24L38 38H26Z" fill="#FFF"/>
    </svg>`
  },
  cloud_nat: {
    category: 'networking',
    name: 'Cloud NAT',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <rect x="18" y="20" width="28" height="24" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <path d="M26 32L34 26V38L26 32Z" fill="#FFF"/>
      <line x1="38" y1="32" x2="42" y2="32" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  cloud_router: {
    category: 'networking',
    name: 'Cloud Router',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <rect x="16" y="28" width="32" height="14" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <path d="M24 28V18M40 28V18M24 18H32M40 18H32" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="24" cy="35" r="2" fill="#FFF"/>
      <circle cx="32" cy="35" r="2" fill="#FFF"/>
      <circle cx="40" cy="35" r="2" fill="#FFF"/>
    </svg>`
  },
  api_gateway: {
    category: 'networking',
    name: 'API Gateway',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <polygon points="32,15 48,24 48,42 32,51 16,42 16,24" stroke="#FFF" stroke-width="2.5" fill="none"/>
      <rect x="26" y="27" width="12" height="12" rx="2" fill="#FFF"/>
      <line x1="32" y1="15" x2="32" y2="27" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="39" x2="32" y2="51" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  firewall: {
    category: 'networking',
    name: 'VPC Firewall Rule',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#34A853"/>
      <rect x="14" y="20" width="36" height="8" stroke="#FFF" stroke-width="2"/>
      <rect x="14" y="28" width="36" height="8" stroke="#FFF" stroke-width="2"/>
      <rect x="14" y="36" width="36" height="8" stroke="#FFF" stroke-width="2"/>
      <line x1="26" y1="20" x2="26" y2="28" stroke="#FFF" stroke-width="2"/>
      <line x1="38" y1="28" x2="38" y2="36" stroke="#FFF" stroke-width="2"/>
      <line x1="26" y1="36" x2="26" y2="44" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },

  // Storage
  cloud_storage: {
    category: 'storage',
    name: 'Cloud Storage',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#F9AB00"/>
      <rect x="14" y="20" width="36" height="10" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <rect x="14" y="34" width="36" height="10" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="21" cy="25" r="2" fill="#FFF"/>
      <circle cx="21" cy="39" r="2" fill="#FFF"/>
      <line x1="28" y1="25" x2="43" y2="25" stroke="#FFF" stroke-width="2"/>
      <line x1="28" y1="39" x2="43" y2="39" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  filestore: {
    category: 'storage',
    name: 'Filestore',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#F9AB00"/>
      <path d="M16 22H28L32 26H48V44H16V22Z" stroke="#FFF" stroke-width="2.5" stroke-linejoin="round"/>
      <line x1="24" y1="34" x2="40" y2="34" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  persistent_disk: {
    category: 'storage',
    name: 'Persistent Disk',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#F9AB00"/>
      <circle cx="32" cy="32" r="15" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="32" cy="32" r="4" fill="#FFF"/>
      <path d="M42 22L34 30" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // Database
  cloud_sql: {
    category: 'database',
    name: 'Cloud SQL',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#1A73E8"/>
      <ellipse cx="32" cy="18" rx="16" ry="6" stroke="#FFF" stroke-width="2.5" fill="#FFF" fill-opacity="0.2"/>
      <path d="M16 18V46C16 49.3 23.2 52 32 52C40.8 52 48 49.3 48 46V18" stroke="#FFF" stroke-width="2.5"/>
      <path d="M16 27C16 30.3 23.2 33 32 33C40.8 33 48 30.3 48 27" stroke="#FFF" stroke-width="2"/>
      <path d="M16 37C16 40.3 23.2 43 32 43C40.8 43 48 40.3 48 37" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  spanner: {
    category: 'database',
    name: 'Cloud Spanner',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#1A73E8"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="16" ry="6" stroke="#FFF" stroke-width="2"/>
      <path d="M32 16V48" stroke="#FFF" stroke-width="2"/>
      <circle cx="32" cy="32" r="3.5" fill="#FFF"/>
    </svg>`
  },
  firestore: {
    category: 'database',
    name: 'Firestore',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#1A73E8"/>
      <path d="M18 24L32 14L46 24L32 32L18 24Z" fill="#FFF" fill-opacity="0.9"/>
      <path d="M18 34L32 24L46 34L32 42L18 34Z" fill="#FFF" fill-opacity="0.6"/>
      <path d="M18 44L32 34L46 44L32 52L18 44Z" fill="#FFF" fill-opacity="0.35"/>
    </svg>`
  },
  bigtable: {
    category: 'database',
    name: 'Cloud Bigtable',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#1A73E8"/>
      <rect x="15" y="18" width="34" height="28" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <line x1="15" y1="27" x2="49" y2="27" stroke="#FFF" stroke-width="2"/>
      <line x1="26" y1="18" x2="26" y2="46" stroke="#FFF" stroke-width="2"/>
      <line x1="38" y1="18" x2="38" y2="46" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  memorystore: {
    category: 'database',
    name: 'Memorystore',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#1A73E8"/>
      <rect x="20" y="20" width="24" height="24" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <rect x="27" y="27" width="10" height="10" fill="#FFF"/>
      <path d="M26 14V20M32 14V20M38 14V20M26 44V50M32 44V50M38 44V50" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // Analytics
  bigquery: {
    category: 'analytics',
    name: 'BigQuery',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00ACC1"/>
      <circle cx="30" cy="30" r="13" stroke="#FFF" stroke-width="2.5"/>
      <path d="M39 39L48 48" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
      <rect x="25" y="28" width="3" height="8" fill="#FFF"/>
      <rect x="30" y="24" width="3" height="12" fill="#FFF"/>
      <rect x="35" y="31" width="3" height="5" fill="#FFF"/>
    </svg>`
  },
  dataflow: {
    category: 'analytics',
    name: 'Dataflow',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#00ACC1"/>
      <path d="M16 24H48M16 32H40M16 40H32" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="48,29 54,32 48,35" fill="#FFF"/>
    </svg>`
  },

  // Integration
  pubsub: {
    category: 'integration',
    name: 'Pub/Sub',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#F538A0"/>
      <circle cx="32" cy="32" r="7" fill="#FFF"/>
      <path d="M32 16V22M32 42V48M16 32H22M42 32H48M20 20L25 25M39 39L44 44M20 44L25 39M39 25L44 20" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  cloud_tasks: {
    category: 'integration',
    name: 'Cloud Tasks',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#F538A0"/>
      <rect x="16" y="24" width="32" height="16" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="24" x2="24" y2="40" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="24" x2="32" y2="40" stroke="#FFF" stroke-width="2"/>
      <line x1="40" y1="24" x2="40" y2="40" stroke="#FFF" stroke-width="2"/>
      <path d="M12 32H16M48 32H52" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  eventarc: {
    category: 'integration',
    name: 'Eventarc',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#F538A0"/>
      <circle cx="20" cy="32" r="5" fill="#FFF"/>
      <circle cx="44" cy="20" r="5" fill="#FFF"/>
      <circle cx="44" cy="44" r="5" fill="#FFF"/>
      <path d="M25 32C32 32 36 22 40 21M25 32C32 32 36 42 40 43" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },

  // Security
  iam: {
    category: 'security',
    name: 'Cloud IAM',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#EA4335"/>
      <circle cx="32" cy="24" r="8" stroke="#FFF" stroke-width="2.5"/>
      <path d="M18 48C18 40.3 24.3 34 32 34C39.7 34 46 40.3 46 48" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="44" cy="22" r="4" fill="#F9AB00"/>
    </svg>`
  },
  service_account: {
    category: 'security',
    name: 'Service Account',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#EA4335"/>
      <circle cx="32" cy="25" r="7" stroke="#FFF" stroke-width="2.5"/>
      <path d="M20 46C20 39 25.4 33.5 32 33.5C38.6 33.5 44 39 44 46" stroke="#FFF" stroke-width="2.5"/>
      <path d="M40 24L44 20M44 20H40M44 20V24" stroke="#F9AB00" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },
  kms: {
    category: 'security',
    name: 'Cloud KMS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#EA4335"/>
      <circle cx="32" cy="26" r="9" stroke="#FFF" stroke-width="3"/>
      <path d="M32 35V50M32 42H38M32 47H38" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  secret_manager: {
    category: 'security',
    name: 'Secret Manager',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#EA4335"/>
      <rect x="20" y="26" width="24" height="22" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <path d="M26 26V20C26 16.7 28.7 14 32 14C35.3 14 38 16.7 38 20V26" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="32" cy="35" r="2.5" fill="#FFF"/>
      <path d="M32 37.5V42" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // Operations
  monitoring: {
    category: 'management',
    name: 'Cloud Monitoring',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#A142F4"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 20V32L40 36" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 42L28 34L34 38L42 26" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  logging: {
    category: 'management',
    name: 'Cloud Logging',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#A142F4"/>
      <rect x="17" y="16" width="30" height="32" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="26" x2="40" y2="26" stroke="#FFF" stroke-width="2"/>
      <line x1="24" y1="33" x2="40" y2="33" stroke="#FFF" stroke-width="2"/>
      <line x1="24" y1="40" x2="34" y2="40" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  project: {
    category: 'general',
    name: 'Google Cloud Project',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#5F6368"/>
      <path d="M16 22H28L32 26H48V44H16V22Z" stroke="#4285F4" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="32" cy="35" r="4" fill="#FFF"/>
    </svg>`
  },
  generic: {
    category: 'general',
    name: 'Google Cloud Resource',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#5F6368"/>
      <rect x="18" y="18" width="28" height="28" rx="4" stroke="#4285F4" stroke-width="2.5"/>
      <path d="M26 32H38M32 26V38" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  }
};
