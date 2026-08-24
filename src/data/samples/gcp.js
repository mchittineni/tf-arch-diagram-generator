/**
 * Realistic Google Cloud Terraform plan payloads used for the demo templates.
 */

const change = (actions, after, before) => ({ actions, after, ...(before ? { before } : {}) });

export const GCP_SAMPLES = {
  gcpWebPlatform: {
    provider: 'gcp',
    name: 'GCP Web Platform (VPC, MIG, Cloud SQL, Global LB)',
    description: 'Shared VPC network with public and private subnetworks, a regional managed instance group behind a global HTTPS load balancer, Cloud SQL, Cloud Storage and Cloud DNS.',
    data: {
      format_version: '1.2',
      terraform_version: '1.9.5',
      resource_changes: [
        {
          address: 'google_compute_network.core',
          type: 'google_compute_network',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'core-vpc',
            auto_create_subnetworks: false,
            routing_mode: 'REGIONAL',
            project: 'acme-prod'
          })
        },
        {
          address: 'google_compute_subnetwork.public_us_central1',
          type: 'google_compute_subnetwork',
          name: 'public_us_central1',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'public-us-central1',
            network: 'google_compute_network.core',
            ip_cidr_range: '10.20.0.0/20',
            region: 'us-central1',
            private_ip_google_access: false,
            project: 'acme-prod'
          })
        },
        {
          address: 'google_compute_subnetwork.private_us_central1',
          type: 'google_compute_subnetwork',
          name: 'private_us_central1',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'private-us-central1',
            network: 'google_compute_network.core',
            ip_cidr_range: '10.20.16.0/20',
            region: 'us-central1',
            private_ip_google_access: true,
            project: 'acme-prod'
          })
        },
        {
          address: 'google_compute_subnetwork.private_us_east1',
          type: 'google_compute_subnetwork',
          name: 'private_us_east1',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'private-us-east1',
            network: 'google_compute_network.core',
            ip_cidr_range: '10.21.16.0/20',
            region: 'us-east1',
            private_ip_google_access: true,
            project: 'acme-prod'
          })
        },
        {
          address: 'google_compute_instance_template.app',
          type: 'google_compute_instance_template',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name_prefix: 'app-tpl-',
            machine_type: 'e2-standard-4',
            network_interface: [{ subnetwork: 'google_compute_subnetwork.private_us_central1' }],
            labels: { env: 'production', team: 'platform' }
          })
        },
        {
          address: 'google_compute_region_instance_group_manager.app',
          type: 'google_compute_region_instance_group_manager',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'app-mig',
            base_instance_name: 'app',
            region: 'us-central1',
            target_size: 6,
            subnetwork: 'google_compute_subnetwork.private_us_central1'
          })
        },
        {
          address: 'google_compute_instance.bastion',
          type: 'google_compute_instance',
          name: 'bastion',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'ops-bastion',
            machine_type: 'e2-micro',
            zone: 'us-central1-a',
            network_interface: [{ subnetwork: 'google_compute_subnetwork.public_us_central1' }],
            labels: { role: 'bastion' }
          })
        },
        {
          address: 'google_compute_backend_service.app',
          type: 'google_compute_backend_service',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'app-backend',
            protocol: 'HTTPS',
            load_balancing_scheme: 'EXTERNAL_MANAGED',
            enable_cdn: true
          })
        },
        {
          address: 'google_compute_url_map.app',
          type: 'google_compute_url_map',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'app-url-map', default_service: 'app-backend' })
        },
        {
          address: 'google_compute_global_forwarding_rule.https',
          type: 'google_compute_global_forwarding_rule',
          name: 'https',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'app-https-fr', port_range: '443', ip_protocol: 'TCP' })
        },
        {
          address: 'google_dns_managed_zone.public',
          type: 'google_dns_managed_zone',
          name: 'public',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'acme-public', dns_name: 'acme.io.', visibility: 'public' })
        },
        {
          address: 'google_compute_router.nat_router',
          type: 'google_compute_router',
          name: 'nat_router',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'core-nat-router', network: 'google_compute_network.core', region: 'us-central1' })
        },
        {
          address: 'google_compute_router_nat.egress',
          type: 'google_compute_router_nat',
          name: 'egress',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'core-egress-nat',
            region: 'us-central1',
            nat_ip_allocate_option: 'AUTO_ONLY',
            source_subnetwork_ip_ranges_to_nat: 'ALL_SUBNETWORKS_ALL_IP_RANGES'
          })
        },
        {
          address: 'google_sql_database_instance.primary',
          type: 'google_sql_database_instance',
          name: 'primary',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(
            ['update'],
            {
              name: 'core-postgres',
              database_version: 'POSTGRES_15',
              region: 'us-central1',
              settings: [{ tier: 'db-custom-4-16384', availability_type: 'REGIONAL' }]
            },
            {
              name: 'core-postgres',
              database_version: 'POSTGRES_14',
              region: 'us-central1',
              settings: [{ tier: 'db-custom-2-8192', availability_type: 'ZONAL' }]
            }
          )
        },
        {
          address: 'google_redis_instance.session_cache',
          type: 'google_redis_instance',
          name: 'session_cache',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'session-cache', tier: 'STANDARD_HA', memory_size_gb: 5, region: 'us-central1' })
        },
        {
          address: 'google_storage_bucket.static_assets',
          type: 'google_storage_bucket',
          name: 'static_assets',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'acme-static-assets',
            location: 'US',
            uniform_bucket_level_access: true,
            labels: { env: 'production' }
          })
        },
        {
          address: 'google_compute_backend_bucket.static',
          type: 'google_compute_backend_bucket',
          name: 'static',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'static-backend', bucket_name: 'acme-static-assets', enable_cdn: true })
        },
        {
          address: 'google_service_account.app',
          type: 'google_service_account',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { account_id: 'app-runtime', display_name: 'Application Runtime' })
        },
        {
          address: 'google_secret_manager_secret.db_password',
          type: 'google_secret_manager_secret',
          name: 'db_password',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { secret_id: 'core-db-password', labels: { rotation: '90d' } })
        },
        {
          address: 'google_monitoring_alert_policy.latency',
          type: 'google_monitoring_alert_policy',
          name: 'latency',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { display_name: 'p95 latency > 500ms', enabled: true })
        },
        {
          address: 'google_compute_firewall.allow_health_checks',
          type: 'google_compute_firewall',
          name: 'allow_health_checks',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['delete'], null, {
            name: 'allow-legacy-health-checks',
            network: 'google_compute_network.core',
            direction: 'INGRESS'
          })
        }
      ]
    }
  },

  gcpServerless: {
    provider: 'gcp',
    name: 'GCP Serverless Data Platform (Cloud Run, Pub/Sub, BigQuery)',
    description: 'API Gateway fronting Cloud Run services, Pub/Sub fan-out into Cloud Functions, Firestore and BigQuery, with Secret Manager and Cloud Scheduler.',
    data: {
      format_version: '1.2',
      terraform_version: '1.9.5',
      resource_changes: [
        {
          address: 'google_api_gateway_api.public',
          type: 'google_api_gateway_api',
          name: 'public',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { api_id: 'public-api', project: 'acme-data' })
        },
        {
          address: 'google_api_gateway_gateway.public',
          type: 'google_api_gateway_gateway',
          name: 'public',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { gateway_id: 'public-gw', region: 'us-central1' })
        },
        {
          address: 'google_cloud_run_v2_service.ingest_api',
          type: 'google_cloud_run_v2_service',
          name: 'ingest_api',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], {
            name: 'ingest-api',
            location: 'us-central1',
            ingress: 'INGRESS_TRAFFIC_ALL',
            labels: { tier: 'api' }
          })
        },
        {
          address: 'google_cloud_run_v2_service.report_api',
          type: 'google_cloud_run_v2_service',
          name: 'report_api',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['update'], {
            name: 'report-api',
            location: 'us-central1',
            ingress: 'INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER'
          }, {
            name: 'report-api',
            location: 'us-central1',
            ingress: 'INGRESS_TRAFFIC_ALL'
          })
        },
        {
          address: 'google_pubsub_topic.events',
          type: 'google_pubsub_topic',
          name: 'events',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'domain-events', labels: { domain: 'orders' } })
        },
        {
          address: 'google_pubsub_subscription.events_push',
          type: 'google_pubsub_subscription',
          name: 'events_push',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'domain-events-push', topic: 'domain-events', ack_deadline_seconds: 30 })
        },
        {
          address: 'google_cloudfunctions2_function.projector',
          type: 'google_cloudfunctions2_function',
          name: 'projector',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'event-projector', location: 'us-central1', labels: { runtime: 'nodejs20' } })
        },
        {
          address: 'google_firestore_database.default',
          type: 'google_firestore_database',
          name: 'default',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: '(default)', location_id: 'nam5', type: 'FIRESTORE_NATIVE' })
        },
        {
          address: 'google_bigquery_dataset.analytics',
          type: 'google_bigquery_dataset',
          name: 'analytics',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { dataset_id: 'analytics', location: 'US', labels: { retention: '400d' } })
        },
        {
          address: 'google_storage_bucket.raw_landing',
          type: 'google_storage_bucket',
          name: 'raw_landing',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'acme-raw-landing', location: 'US', force_destroy: false })
        },
        {
          address: 'google_cloud_scheduler_job.nightly_rollup',
          type: 'google_cloud_scheduler_job',
          name: 'nightly_rollup',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'nightly-rollup', schedule: '0 2 * * *', region: 'us-central1' })
        },
        {
          address: 'google_eventarc_trigger.bucket_finalize',
          type: 'google_eventarc_trigger',
          name: 'bucket_finalize',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { name: 'raw-object-finalized', location: 'us-central1' })
        },
        {
          address: 'google_secret_manager_secret.api_key',
          type: 'google_secret_manager_secret',
          name: 'api_key',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { secret_id: 'partner-api-key' })
        },
        {
          address: 'google_service_account.ingest',
          type: 'google_service_account',
          name: 'ingest',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['create'], { account_id: 'ingest-runtime', display_name: 'Ingest Runtime' })
        },
        {
          address: 'google_logging_project_sink.audit',
          type: 'google_logging_project_sink',
          name: 'audit',
          provider_name: 'registry.terraform.io/hashicorp/google',
          change: change(['delete'], null, { name: 'legacy-audit-sink', destination: 'storage.googleapis.com/old-audit' })
        }
      ]
    }
  }
};
