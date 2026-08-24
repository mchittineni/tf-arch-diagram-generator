/**
 * Official Google Cloud product icons and category theme colors.
 * SVGs are embedded verbatim from the vendor set — see officialIcons.js (generated).
 *
 * Regenerate the embedded SVGs with: npm run icons:build
 */

import { OFFICIAL_ICONS } from './officialIcons.js';

export const CATEGORIES = {
  compute: { name: "Compute", color: "#4285F4", bgColor: "rgba(66, 133, 244, 0.15)" },
  containers: { name: "Containers", color: "#4285F4", bgColor: "rgba(66, 133, 244, 0.15)" },
  networking: { name: "Networking", color: "#34A853", bgColor: "rgba(52, 168, 83, 0.15)" },
  storage: { name: "Storage", color: "#F9AB00", bgColor: "rgba(249, 171, 0, 0.15)" },
  database: { name: "Databases", color: "#1A73E8", bgColor: "rgba(26, 115, 232, 0.15)" },
  security: { name: "Identity & Security", color: "#EA4335", bgColor: "rgba(234, 67, 53, 0.15)" },
  management: { name: "Operations", color: "#A142F4", bgColor: "rgba(161, 66, 244, 0.15)" },
  integration: { name: "Application Integration", color: "#F538A0", bgColor: "rgba(245, 56, 160, 0.15)" },
  analytics: { name: "Data Analytics", color: "#00ACC1", bgColor: "rgba(0, 172, 193, 0.15)" },
  general: { name: "General", color: "#5F6368", bgColor: "rgba(95, 99, 104, 0.15)" }
};

export const ICONS = {
  compute_engine: {
    category: "compute",
    name: "Compute Engine",
    svg: OFFICIAL_ICONS.compute_engine
  },
  instance_group: {
    category: "compute",
    name: "Managed Instance Group",
    svg: OFFICIAL_ICONS.instance_group
  },
  cloud_functions: {
    category: "compute",
    name: "Cloud Functions",
    svg: OFFICIAL_ICONS.cloud_functions
  },
  cloud_run: {
    category: "compute",
    name: "Cloud Run",
    svg: OFFICIAL_ICONS.cloud_run
  },
  app_engine: {
    category: "compute",
    name: "App Engine",
    svg: OFFICIAL_ICONS.app_engine
  },
  gke: {
    category: "containers",
    name: "Google Kubernetes Engine",
    svg: OFFICIAL_ICONS.gke
  },
  artifact_registry: {
    category: "containers",
    name: "Artifact Registry",
    svg: OFFICIAL_ICONS.artifact_registry
  },
  vpc_network: {
    category: "networking",
    name: "VPC Network",
    svg: OFFICIAL_ICONS.vpc_network
  },
  subnetwork: {
    category: "networking",
    name: "VPC Subnetwork",
    svg: OFFICIAL_ICONS.subnetwork
  },
  load_balancer: {
    category: "networking",
    name: "Cloud Load Balancing",
    svg: OFFICIAL_ICONS.load_balancer
  },
  cloud_cdn: {
    category: "networking",
    name: "Cloud CDN",
    svg: OFFICIAL_ICONS.cloud_cdn
  },
  cloud_dns: {
    category: "networking",
    name: "Cloud DNS",
    svg: OFFICIAL_ICONS.cloud_dns
  },
  cloud_nat: {
    category: "networking",
    name: "Cloud NAT",
    svg: OFFICIAL_ICONS.cloud_nat
  },
  cloud_router: {
    category: "networking",
    name: "Cloud Router",
    svg: OFFICIAL_ICONS.cloud_router
  },
  api_gateway: {
    category: "networking",
    name: "API Gateway",
    svg: OFFICIAL_ICONS.api_gateway
  },
  firewall: {
    category: "networking",
    name: "VPC Firewall Rule",
    svg: OFFICIAL_ICONS.firewall
  },
  cloud_storage: {
    category: "storage",
    name: "Cloud Storage",
    svg: OFFICIAL_ICONS.cloud_storage
  },
  filestore: {
    category: "storage",
    name: "Filestore",
    svg: OFFICIAL_ICONS.filestore
  },
  persistent_disk: {
    category: "storage",
    name: "Persistent Disk",
    svg: OFFICIAL_ICONS.persistent_disk
  },
  cloud_sql: {
    category: "database",
    name: "Cloud SQL",
    svg: OFFICIAL_ICONS.cloud_sql
  },
  spanner: {
    category: "database",
    name: "Cloud Spanner",
    svg: OFFICIAL_ICONS.spanner
  },
  firestore: {
    category: "database",
    name: "Firestore",
    svg: OFFICIAL_ICONS.firestore
  },
  bigtable: {
    category: "database",
    name: "Cloud Bigtable",
    svg: OFFICIAL_ICONS.bigtable
  },
  memorystore: {
    category: "database",
    name: "Memorystore",
    svg: OFFICIAL_ICONS.memorystore
  },
  bigquery: {
    category: "analytics",
    name: "BigQuery",
    svg: OFFICIAL_ICONS.bigquery
  },
  dataflow: {
    category: "analytics",
    name: "Dataflow",
    svg: OFFICIAL_ICONS.dataflow
  },
  pubsub: {
    category: "integration",
    name: "Pub/Sub",
    svg: OFFICIAL_ICONS.pubsub
  },
  cloud_tasks: {
    category: "integration",
    name: "Cloud Tasks",
    svg: OFFICIAL_ICONS.cloud_tasks
  },
  eventarc: {
    category: "integration",
    name: "Eventarc",
    svg: OFFICIAL_ICONS.eventarc
  },
  iam: {
    category: "security",
    name: "Cloud IAM",
    svg: OFFICIAL_ICONS.iam
  },
  service_account: {
    category: "security",
    name: "Service Account",
    svg: OFFICIAL_ICONS.service_account
  },
  kms: {
    category: "security",
    name: "Cloud KMS",
    svg: OFFICIAL_ICONS.kms
  },
  secret_manager: {
    category: "security",
    name: "Secret Manager",
    svg: OFFICIAL_ICONS.secret_manager
  },
  monitoring: {
    category: "management",
    name: "Cloud Monitoring",
    svg: OFFICIAL_ICONS.monitoring
  },
  logging: {
    category: "management",
    name: "Cloud Logging",
    svg: OFFICIAL_ICONS.logging
  },
  project: {
    category: "general",
    name: "Google Cloud Project",
    svg: OFFICIAL_ICONS.project
  },
  generic: {
    category: "general",
    name: "Google Cloud Resource",
    svg: OFFICIAL_ICONS.generic
  }
};
