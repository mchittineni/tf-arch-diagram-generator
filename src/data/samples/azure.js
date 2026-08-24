/**
 * Realistic Microsoft Azure Terraform plan payloads used for the demo templates.
 */

const change = (actions, after, before) => ({ actions, after, ...(before ? { before } : {}) });

export const AZURE_SAMPLES = {
  azureThreeTier: {
    provider: 'azure',
    name: 'Azure 3-Tier App (VNet, App Gateway, VMSS, Azure SQL)',
    description: 'Hub Virtual Network with gateway, application and data subnets, Application Gateway in front of a VM Scale Set, Azure SQL, Key Vault, Storage and Log Analytics.',
    data: {
      format_version: '1.2',
      terraform_version: '1.9.5',
      resource_changes: [
        {
          address: 'azurerm_resource_group.core',
          type: 'azurerm_resource_group',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'rg-core-prod-eastus',
            location: 'eastus',
            tags: { environment: 'production', owner: 'platform' }
          })
        },
        {
          address: 'azurerm_virtual_network.core',
          type: 'azurerm_virtual_network',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'vnet-core-prod',
            address_space: ['10.30.0.0/16'],
            location: 'eastus',
            resource_group_name: 'rg-core-prod-eastus',
            tags: { environment: 'production' }
          })
        },
        {
          address: 'azurerm_subnet.gateway',
          type: 'azurerm_subnet',
          name: 'gateway',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'snet-gateway',
            virtual_network_name: 'vnet-core-prod',
            address_prefixes: ['10.30.1.0/24'],
            resource_group_name: 'rg-core-prod-eastus'
          })
        },
        {
          address: 'azurerm_subnet.app',
          type: 'azurerm_subnet',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'snet-app',
            virtual_network_name: 'vnet-core-prod',
            address_prefixes: ['10.30.10.0/24'],
            resource_group_name: 'rg-core-prod-eastus'
          })
        },
        {
          address: 'azurerm_subnet.data',
          type: 'azurerm_subnet',
          name: 'data',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'snet-data',
            virtual_network_name: 'vnet-core-prod',
            address_prefixes: ['10.30.20.0/24'],
            resource_group_name: 'rg-core-prod-eastus',
            service_endpoints: ['Microsoft.Sql']
          })
        },
        {
          address: 'azurerm_public_ip.appgw',
          type: 'azurerm_public_ip',
          name: 'appgw',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'pip-appgw-prod',
            allocation_method: 'Static',
            sku: 'Standard',
            location: 'eastus'
          })
        },
        {
          address: 'azurerm_application_gateway.public',
          type: 'azurerm_application_gateway',
          name: 'public',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'agw-public-prod',
            location: 'eastus',
            resource_group_name: 'rg-core-prod-eastus',
            gateway_ip_configuration: [{ name: 'gw-ipcfg', subnet_id: 'azurerm_subnet.gateway' }],
            tags: { tier: 'edge' }
          })
        },
        {
          address: 'azurerm_linux_virtual_machine_scale_set.app',
          type: 'azurerm_linux_virtual_machine_scale_set',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'vmss-app-prod',
            sku: 'Standard_D4s_v5',
            instances: 6,
            location: 'eastus',
            zones: ['1', '2', '3'],
            resource_group_name: 'rg-core-prod-eastus',
            network_interface: [{ ip_configuration: [{ subnet_id: 'azurerm_subnet.app' }] }],
            subnet_id: 'azurerm_subnet.app',
            tags: { tier: 'app' }
          })
        },
        {
          address: 'azurerm_network_security_group.app',
          type: 'azurerm_network_security_group',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'nsg-app',
            location: 'eastus',
            subnet_id: 'azurerm_subnet.app',
            resource_group_name: 'rg-core-prod-eastus'
          })
        },
        {
          address: 'azurerm_nat_gateway.egress',
          type: 'azurerm_nat_gateway',
          name: 'egress',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'natgw-prod',
            location: 'eastus',
            sku_name: 'Standard',
            resource_group_name: 'rg-core-prod-eastus'
          })
        },
        {
          address: 'azurerm_mssql_server.core',
          type: 'azurerm_mssql_server',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'sql-core-prod',
            version: '12.0',
            location: 'eastus',
            minimum_tls_version: '1.2',
            resource_group_name: 'rg-core-prod-eastus'
          })
        },
        {
          address: 'azurerm_mssql_database.orders',
          type: 'azurerm_mssql_database',
          name: 'orders',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(
            ['update'],
            { name: 'db-orders', sku_name: 'BC_Gen5_4', zone_redundant: true, max_size_gb: 500 },
            { name: 'db-orders', sku_name: 'GP_Gen5_2', zone_redundant: false, max_size_gb: 250 }
          )
        },
        {
          address: 'azurerm_redis_cache.session',
          type: 'azurerm_redis_cache',
          name: 'session',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'redis-session-prod',
            sku_name: 'Premium',
            capacity: 1,
            location: 'eastus'
          })
        },
        {
          address: 'azurerm_storage_account.assets',
          type: 'azurerm_storage_account',
          name: 'assets',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'stassetsprod',
            account_tier: 'Standard',
            account_replication_type: 'GZRS',
            location: 'eastus',
            tags: { environment: 'production' }
          })
        },
        {
          address: 'azurerm_storage_container.static',
          type: 'azurerm_storage_container',
          name: 'static',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'static', container_access_type: 'blob' })
        },
        {
          address: 'azurerm_cdn_frontdoor_profile.edge',
          type: 'azurerm_cdn_frontdoor_profile',
          name: 'edge',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'afd-prod', sku_name: 'Premium_AzureFrontDoor' })
        },
        {
          address: 'azurerm_dns_zone.public',
          type: 'azurerm_dns_zone',
          name: 'public',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'acme.io', resource_group_name: 'rg-core-prod-eastus' })
        },
        {
          address: 'azurerm_key_vault.core',
          type: 'azurerm_key_vault',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'kv-core-prod',
            sku_name: 'premium',
            location: 'eastus',
            purge_protection_enabled: true
          })
        },
        {
          address: 'azurerm_user_assigned_identity.app',
          type: 'azurerm_user_assigned_identity',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'id-app-prod', location: 'eastus' })
        },
        {
          address: 'azurerm_log_analytics_workspace.core',
          type: 'azurerm_log_analytics_workspace',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'law-core-prod', sku: 'PerGB2018', retention_in_days: 90 })
        },
        {
          address: 'azurerm_application_insights.app',
          type: 'azurerm_application_insights',
          name: 'app',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'appi-app-prod', application_type: 'web' })
        },
        {
          address: 'azurerm_monitor_metric_alert.latency',
          type: 'azurerm_monitor_metric_alert',
          name: 'latency',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['delete'], null, { name: 'alert-legacy-latency', enabled: true })
        }
      ]
    }
  },

  azureAks: {
    provider: 'azure',
    name: 'Azure AKS Platform (AKS, ACR, Service Bus, PostgreSQL)',
    description: 'Private AKS cluster with a user node pool in a dedicated subnet, Container Registry, Service Bus messaging, PostgreSQL Flexible Server, Key Vault and workload identity.',
    data: {
      format_version: '1.2',
      terraform_version: '1.9.5',
      resource_changes: [
        {
          address: 'azurerm_resource_group.platform',
          type: 'azurerm_resource_group',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'rg-platform-weu', location: 'westeurope', tags: { environment: 'production' } })
        },
        {
          address: 'azurerm_virtual_network.platform',
          type: 'azurerm_virtual_network',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'vnet-platform-weu',
            address_space: ['10.40.0.0/16'],
            location: 'westeurope',
            resource_group_name: 'rg-platform-weu'
          })
        },
        {
          address: 'azurerm_subnet.aks_system',
          type: 'azurerm_subnet',
          name: 'aks_system',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'snet-aks-system',
            virtual_network_name: 'vnet-platform-weu',
            address_prefixes: ['10.40.0.0/20'],
            resource_group_name: 'rg-platform-weu'
          })
        },
        {
          address: 'azurerm_subnet.aks_user',
          type: 'azurerm_subnet',
          name: 'aks_user',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'snet-aks-user',
            virtual_network_name: 'vnet-platform-weu',
            address_prefixes: ['10.40.16.0/20',],
            resource_group_name: 'rg-platform-weu'
          })
        },
        {
          address: 'azurerm_subnet.data',
          type: 'azurerm_subnet',
          name: 'data',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'snet-data',
            virtual_network_name: 'vnet-platform-weu',
            address_prefixes: ['10.40.32.0/24'],
            resource_group_name: 'rg-platform-weu'
          })
        },
        {
          address: 'azurerm_kubernetes_cluster.platform',
          type: 'azurerm_kubernetes_cluster',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'aks-platform-weu',
            kubernetes_version: '1.30',
            location: 'westeurope',
            private_cluster_enabled: true,
            default_node_pool: [{ name: 'system', node_count: 3, vm_size: 'Standard_D4s_v5', vnet_subnet_id: 'azurerm_subnet.aks_system' }],
            resource_group_name: 'rg-platform-weu',
            tags: { workload: 'platform' }
          })
        },
        {
          address: 'azurerm_kubernetes_cluster_node_pool.apps',
          type: 'azurerm_kubernetes_cluster_node_pool',
          name: 'apps',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'apps',
            vm_size: 'Standard_D8s_v5',
            node_count: 6,
            vnet_subnet_id: 'azurerm_subnet.aks_user',
            zones: ['1', '2', '3']
          })
        },
        {
          address: 'azurerm_container_registry.platform',
          type: 'azurerm_container_registry',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'acrplatformweu', sku: 'Premium', location: 'westeurope' })
        },
        {
          address: 'azurerm_postgresql_flexible_server.core',
          type: 'azurerm_postgresql_flexible_server',
          name: 'core',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], {
            name: 'psql-core-weu',
            version: '16',
            sku_name: 'GP_Standard_D4s_v3',
            high_availability: [{ mode: 'ZoneRedundant' }],
            delegated_subnet_id: 'azurerm_subnet.data',
            subnet_id: 'azurerm_subnet.data',
            location: 'westeurope'
          })
        },
        {
          address: 'azurerm_servicebus_namespace.platform',
          type: 'azurerm_servicebus_namespace',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'sb-platform-weu', sku: 'Premium', location: 'westeurope' })
        },
        {
          address: 'azurerm_servicebus_topic.orders',
          type: 'azurerm_servicebus_topic',
          name: 'orders',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'orders', max_size_in_megabytes: 5120 })
        },
        {
          address: 'azurerm_servicebus_queue.dead_letter',
          type: 'azurerm_servicebus_queue',
          name: 'dead_letter',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'orders-dlq', max_delivery_count: 10 })
        },
        {
          address: 'azurerm_linux_function_app.reconciler',
          type: 'azurerm_linux_function_app',
          name: 'reconciler',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'func-reconciler-weu', location: 'westeurope', https_only: true })
        },
        {
          address: 'azurerm_key_vault.platform',
          type: 'azurerm_key_vault',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'kv-platform-weu', sku_name: 'premium', location: 'westeurope' })
        },
        {
          address: 'azurerm_user_assigned_identity.workload',
          type: 'azurerm_user_assigned_identity',
          name: 'workload',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { name: 'id-workload-weu', location: 'westeurope' })
        },
        {
          address: 'azurerm_role_assignment.acr_pull',
          type: 'azurerm_role_assignment',
          name: 'acr_pull',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['create'], { role_definition_name: 'AcrPull', scope: 'acrplatformweu' })
        },
        {
          address: 'azurerm_log_analytics_workspace.platform',
          type: 'azurerm_log_analytics_workspace',
          name: 'platform',
          provider_name: 'registry.terraform.io/hashicorp/azurerm',
          change: change(['update'], { name: 'law-platform-weu', retention_in_days: 180, sku: 'PerGB2018' }, { name: 'law-platform-weu', retention_in_days: 30, sku: 'PerGB2018' })
        }
      ]
    }
  }
};
