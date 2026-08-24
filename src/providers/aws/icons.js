/**
 * Official AWS Architecture Icons and category theme colors.
 * SVGs are embedded verbatim from the vendor set — see officialIcons.js (generated).
 *
 * Regenerate the embedded SVGs with: npm run icons:build
 */

import { OFFICIAL_ICONS } from './officialIcons.js';

export const CATEGORIES = {
  compute: { name: "Compute", color: "#ED7100", bgColor: "rgba(237, 113, 0, 0.15)" },
  networking: { name: "Networking & Content Delivery", color: "#8C4FFF", bgColor: "rgba(140, 79, 255, 0.15)" },
  storage: { name: "Storage", color: "#7AA116", bgColor: "rgba(122, 161, 22, 0.15)" },
  database: { name: "Database", color: "#3B48CC", bgColor: "rgba(59, 72, 204, 0.15)" },
  security: { name: "Security, Identity & Compliance", color: "#DD344C", bgColor: "rgba(221, 52, 76, 0.15)" },
  management: { name: "Management & Governance", color: "#E7157B", bgColor: "rgba(231, 21, 123, 0.15)" },
  integration: { name: "Application Integration", color: "#FF4F8B", bgColor: "rgba(255, 79, 139, 0.15)" },
  analytics: { name: "Analytics", color: "#8C4FFF", bgColor: "rgba(140, 79, 255, 0.15)" },
  containers: { name: "Containers", color: "#ED7100", bgColor: "rgba(237, 113, 0, 0.15)" },
  general: { name: "General", color: "#232F3E", bgColor: "rgba(35, 47, 62, 0.15)" }
};

export const ICONS = {
  ec2: {
    category: "compute",
    name: "Amazon EC2",
    svg: OFFICIAL_ICONS.ec2
  },
  lambda: {
    category: "compute",
    name: "AWS Lambda",
    svg: OFFICIAL_ICONS.lambda
  },
  ecs: {
    category: "containers",
    name: "Amazon ECS",
    svg: OFFICIAL_ICONS.ecs
  },
  eks: {
    category: "containers",
    name: "Amazon EKS",
    svg: OFFICIAL_ICONS.eks
  },
  autoscaling: {
    category: "compute",
    name: "Auto Scaling",
    svg: OFFICIAL_ICONS.autoscaling
  },
  vpc: {
    category: "networking",
    name: "Amazon VPC",
    svg: OFFICIAL_ICONS.vpc
  },
  subnet: {
    category: "networking",
    name: "VPC Subnet",
    svg: OFFICIAL_ICONS.subnet
  },
  alb: {
    category: "networking",
    name: "Elastic Load Balancing",
    svg: OFFICIAL_ICONS.alb
  },
  cloudfront: {
    category: "networking",
    name: "Amazon CloudFront",
    svg: OFFICIAL_ICONS.cloudfront
  },
  route53: {
    category: "networking",
    name: "Amazon Route 53",
    svg: OFFICIAL_ICONS.route53
  },
  apigateway: {
    category: "networking",
    name: "Amazon API Gateway",
    svg: OFFICIAL_ICONS.apigateway
  },
  nat_gateway: {
    category: "networking",
    name: "NAT Gateway",
    svg: OFFICIAL_ICONS.nat_gateway
  },
  internet_gateway: {
    category: "networking",
    name: "Internet Gateway",
    svg: OFFICIAL_ICONS.internet_gateway
  },
  s3: {
    category: "storage",
    name: "Amazon S3",
    svg: OFFICIAL_ICONS.s3
  },
  efs: {
    category: "storage",
    name: "Amazon EFS",
    svg: OFFICIAL_ICONS.efs
  },
  rds: {
    category: "database",
    name: "Amazon RDS",
    svg: OFFICIAL_ICONS.rds
  },
  dynamodb: {
    category: "database",
    name: "Amazon DynamoDB",
    svg: OFFICIAL_ICONS.dynamodb
  },
  elasticache: {
    category: "database",
    name: "Amazon ElastiCache",
    svg: OFFICIAL_ICONS.elasticache
  },
  iam: {
    category: "security",
    name: "AWS IAM",
    svg: OFFICIAL_ICONS.iam
  },
  kms: {
    category: "security",
    name: "AWS KMS",
    svg: OFFICIAL_ICONS.kms
  },
  secretsmanager: {
    category: "security",
    name: "AWS Secrets Manager",
    svg: OFFICIAL_ICONS.secretsmanager
  },
  cognito: {
    category: "security",
    name: "Amazon Cognito",
    svg: OFFICIAL_ICONS.cognito
  },
  cloudwatch: {
    category: "management",
    name: "Amazon CloudWatch",
    svg: OFFICIAL_ICONS.cloudwatch
  },
  sqs: {
    category: "integration",
    name: "Amazon SQS",
    svg: OFFICIAL_ICONS.sqs
  },
  sns: {
    category: "integration",
    name: "Amazon SNS",
    svg: OFFICIAL_ICONS.sns
  },
  eventbridge: {
    category: "integration",
    name: "Amazon EventBridge",
    svg: OFFICIAL_ICONS.eventbridge
  },
  generic: {
    category: "general",
    name: "AWS Resource",
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#334155"/>
      <path d="M32 16L46 24V40L32 48L18 40V24L32 16Z" stroke="#94A3B8" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M18 24L32 32L46 24M32 32V48" stroke="#94A3B8" stroke-width="2" stroke-opacity="0.7"/>
    </svg>`
  }
};
