/**
 * Realistic AWS Terraform plan payloads used for the built-in demo templates.
 */

export const AWS_SAMPLES = {
  threeTier: {
    provider: 'aws',
    name: '3-Tier Web Architecture (VPC, Multi-AZ Subnets, ALB, EC2, RDS)',
    description: 'Enterprise VPC with Public & Private Subnets across 2 AZs, ALB, Auto-scaling EC2 app servers, Multi-AZ RDS PostgreSQL, S3, and CloudFront.',
    data: {
      format_version: '1.2',
      terraform_version: '1.8.0',
      resource_changes: [
        {
          address: 'aws_vpc.main_vpc',
          type: 'aws_vpc',
          name: 'main_vpc',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              cidr_block: '10.0.0.0/16',
              enable_dns_hostnames: true,
              enable_dns_support: true,
              tags: { Environment: 'production', Name: 'prod-main-vpc' }
            }
          }
        },
        {
          address: 'aws_internet_gateway.igw',
          type: 'aws_internet_gateway',
          name: 'igw',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.main_vpc',
              tags: { Name: 'prod-igw' }
            }
          }
        },
        {
          address: 'aws_subnet.public_1a',
          type: 'aws_subnet',
          name: 'public_1a',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.main_vpc',
              cidr_block: '10.0.1.0/24',
              availability_zone: 'us-east-1a',
              map_public_ip_on_launch: true,
              tags: { Tier: 'Public', Name: 'public-subnet-1a' }
            }
          }
        },
        {
          address: 'aws_subnet.public_1b',
          type: 'aws_subnet',
          name: 'public_1b',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.main_vpc',
              cidr_block: '10.0.2.0/24',
              availability_zone: 'us-east-1b',
              map_public_ip_on_launch: true,
              tags: { Tier: 'Public', Name: 'public-subnet-1b' }
            }
          }
        },
        {
          address: 'aws_subnet.private_app_1a',
          type: 'aws_subnet',
          name: 'private_app_1a',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.main_vpc',
              cidr_block: '10.0.10.0/24',
              availability_zone: 'us-east-1a',
              tags: { Tier: 'Private-App', Name: 'private-app-subnet-1a' }
            }
          }
        },
        {
          address: 'aws_subnet.private_app_1b',
          type: 'aws_subnet',
          name: 'private_app_1b',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.main_vpc',
              cidr_block: '10.0.11.0/24',
              availability_zone: 'us-east-1b',
              tags: { Tier: 'Private-App', Name: 'private-app-subnet-1b' }
            }
          }
        },
        {
          address: 'aws_subnet.private_db_1a',
          type: 'aws_subnet',
          name: 'private_db_1a',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.main_vpc',
              cidr_block: '10.0.20.0/24',
              availability_zone: 'us-east-1a',
              tags: { Tier: 'Database', Name: 'private-db-subnet-1a' }
            }
          }
        },
        {
          address: 'aws_nat_gateway.nat_gw',
          type: 'aws_nat_gateway',
          name: 'nat_gw',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              subnet_id: 'aws_subnet.public_1a',
              tags: { Name: 'prod-nat-gw' }
            }
          }
        },
        {
          address: 'aws_lb.app_alb',
          type: 'aws_lb',
          name: 'app_alb',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              load_balancer_type: 'application',
              subnets: ['aws_subnet.public_1a', 'aws_subnet.public_1b'],
              security_groups: ['sg-019283746'],
              tags: { Name: 'prod-application-alb' }
            }
          }
        },
        {
          address: 'aws_autoscaling_group.app_asg',
          type: 'aws_autoscaling_group',
          name: 'app_asg',
          provider_name: 'aws',
          change: {
            actions: ['update'],
            before: {
              min_size: 2,
              max_size: 6,
              desired_capacity: 2
            },
            after: {
              min_size: 4,
              max_size: 12,
              desired_capacity: 4,
              vpc_zone_identifier: ['aws_subnet.private_app_1a', 'aws_subnet.private_app_1b'],
              tags: { Name: 'prod-app-asg', Tier: 'App' }
            }
          }
        },
        {
          address: 'aws_instance.app_server_primary',
          type: 'aws_instance',
          name: 'app_server_primary',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              instance_type: 't4g.xlarge',
              subnet_id: 'aws_subnet.private_app_1a',
              ami: 'ami-0c55b159cbfafe1f0',
              tags: { Name: 'primary-backend-worker', Role: 'API-Host' }
            }
          }
        },
        {
          address: 'aws_db_instance.postgres_db',
          type: 'aws_db_instance',
          name: 'postgres_db',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              engine: 'postgres',
              engine_version: '16.2',
              instance_class: 'db.r6g.2xlarge',
              allocated_storage: 200,
              multi_az: true,
              subnet_id: 'aws_subnet.private_db_1a',
              storage_encrypted: true,
              tags: { Name: 'prod-main-postgres', Backup: 'Daily' }
            }
          }
        },
        {
          address: 'aws_s3_bucket.static_assets',
          type: 'aws_s3_bucket',
          name: 'static_assets',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              bucket: 'prod-web-app-static-assets-2026',
              acl: 'private',
              tags: { Name: 'Production Static Assets CDN Origin' }
            }
          }
        },
        {
          address: 'aws_cloudfront_distribution.cdn',
          type: 'aws_cloudfront_distribution',
          name: 'cdn',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              enabled: true,
              price_class: 'PriceClass_100',
              aliases: ['app.myenterprise.com'],
              tags: { Name: 'prod-global-cdn' }
            }
          }
        },
        {
          address: 'aws_route53_record.dns_apex',
          type: 'aws_route53_record',
          name: 'dns_apex',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'app.myenterprise.com',
              type: 'A',
              zone_id: 'Z0192837465'
            }
          }
        }
      ]
    }
  },

  serverless: {
    provider: 'aws',
    name: 'Serverless Event-Driven Platform (API Gateway, Lambda, DynamoDB, SQS, Cognito)',
    description: 'CloudFront edge, API Gateway REST endpoints, Auth with Cognito, Async Lambda processors, DynamoDB Global Tables, and SQS/SNS fanout.',
    data: {
      format_version: '1.2',
      terraform_version: '1.8.0',
      resource_changes: [
        {
          address: 'aws_cognito_user_pool.auth_pool',
          type: 'aws_cognito_user_pool',
          name: 'auth_pool',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'user-auth-pool-prod',
              mfa_configuration: 'ON'
            }
          }
        },
        {
          address: 'aws_apigatewayv2_api.http_api',
          type: 'aws_apigatewayv2_api',
          name: 'http_api',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'microservices-gateway-v2',
              protocol_type: 'HTTP',
              cors_configuration: { allow_origins: ['*'] }
            }
          }
        },
        {
          address: 'aws_lambda_function.auth_authorizer',
          type: 'aws_lambda_function',
          name: 'auth_authorizer',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              function_name: 'auth-jwt-authorizer',
              runtime: 'nodejs20.x',
              memory_size: 256,
              timeout: 5
            }
          }
        },
        {
          address: 'aws_lambda_function.order_processor',
          type: 'aws_lambda_function',
          name: 'order_processor',
          provider_name: 'aws',
          change: {
            actions: ['update'],
            before: {
              memory_size: 512,
              timeout: 10
            },
            after: {
              function_name: 'order-create-processor',
              runtime: 'python3.12',
              memory_size: 1024,
              timeout: 30,
              environment: { variables: { TABLE_NAME: 'orders-table-prod' } }
            }
          }
        },
        {
          address: 'aws_lambda_function.payment_webhook',
          type: 'aws_lambda_function',
          name: 'payment_webhook',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              function_name: 'stripe-payment-listener',
              runtime: 'nodejs20.x',
              memory_size: 512
            }
          }
        },
        {
          address: 'aws_dynamodb_table.orders_table',
          type: 'aws_dynamodb_table',
          name: 'orders_table',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'orders-table-prod',
              billing_mode: 'PAY_PER_REQUEST',
              hash_key: 'order_id',
              range_key: 'created_at',
              point_in_time_recovery: true
            }
          }
        },
        {
          address: 'aws_sqs_queue.order_events_queue',
          type: 'aws_sqs_queue',
          name: 'order_events_queue',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'order-events-fifo.fifo',
              fifo_queue: true,
              content_based_deduplication: true,
              visibility_timeout_seconds: 180
            }
          }
        },
        {
          address: 'aws_sns_topic.notification_topic',
          type: 'aws_sns_topic',
          name: 'notification_topic',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'customer-sms-email-notifications'
            }
          }
        },
        {
          address: 'aws_cloudwatch_log_group.lambda_logs',
          type: 'aws_cloudwatch_log_group',
          name: 'lambda_logs',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: '/aws/lambda/orders-service-logs',
              retention_in_days: 30
            }
          }
        }
      ]
    }
  },

  eksCluster: {
    provider: 'aws',
    name: 'Amazon EKS Production Cluster & Cloud Security',
    description: 'EKS Kubernetes 1.30 Control Plane with Autoscaling Managed Node Groups, ECR, IAM OIDC Roles, and AWS Secrets Manager.',
    data: {
      format_version: '1.2',
      terraform_version: '1.8.0',
      resource_changes: [
        {
          address: 'aws_vpc.eks_vpc',
          type: 'aws_vpc',
          name: 'eks_vpc',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              cidr_block: '172.20.0.0/16',
              tags: { 'kubernetes.io/cluster/prod-eks-cluster': 'shared' }
            }
          }
        },
        {
          address: 'aws_subnet.eks_private_1',
          type: 'aws_subnet',
          name: 'eks_private_1',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              vpc_id: 'aws_vpc.eks_vpc',
              cidr_block: '172.20.1.0/24',
              availability_zone: 'us-west-2a'
            }
          }
        },
        {
          address: 'aws_eks_cluster.prod_cluster',
          type: 'aws_eks_cluster',
          name: 'prod_cluster',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'prod-k8s-platform',
              version: '1.30',
              role_arn: 'arn:aws:iam::123456789012:role/eks-cluster-role'
            }
          }
        },
        {
          address: 'aws_eks_node_group.managed_workers',
          type: 'aws_eks_node_group',
          name: 'managed_workers',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              cluster_name: 'prod-k8s-platform',
              node_group_name: 'system-workload-nodes',
              instance_types: ['m6i.xlarge', 'm6a.xlarge'],
              scaling_config: { desired_size: 6, max_size: 20, min_size: 3 }
            }
          }
        },
        {
          address: 'aws_ecr_repository.app_repo',
          type: 'aws_ecr_repository',
          name: 'app_repo',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'prod/core-backend-service',
              image_tag_mutability: 'IMMUTABLE'
            }
          }
        },
        {
          address: 'aws_secretsmanager_secret.db_credentials',
          type: 'aws_secretsmanager_secret',
          name: 'db_credentials',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'prod/eks/database/postgres-creds',
              kms_key_id: 'arn:aws:kms:us-west-2:123456789012:key/cmk-01'
            }
          }
        },
        {
          address: 'aws_kms_key.cmk',
          type: 'aws_kms_key',
          name: 'cmk',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              description: 'Customer Managed Key for EKS envelope encryption',
              enable_key_rotation: true
            }
          }
        },
        {
          address: 'aws_iam_role.eks_oidc_role',
          type: 'aws_iam_role',
          name: 'eks_oidc_role',
          provider_name: 'aws',
          change: {
            actions: ['create'],
            after: {
              name: 'eks-serviceaccount-role-prod'
            }
          }
        }
      ]
    }
  }
};
