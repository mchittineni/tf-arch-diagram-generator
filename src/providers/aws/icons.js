/**
 * Official AWS Architecture Icons SVGs and Category Theme Colors
 * Latest AWS Architecture Style (Clean vector badges with official colors)
 */

export const CATEGORIES = {
  compute: { name: 'Compute', color: '#ED7100', bgColor: 'rgba(237, 113, 0, 0.15)' },
  networking: { name: 'Networking & Content Delivery', color: '#8C4FFF', bgColor: 'rgba(140, 79, 255, 0.15)' },
  storage: { name: 'Storage', color: '#7AA116', bgColor: 'rgba(122, 161, 22, 0.15)' },
  database: { name: 'Database', color: '#3B48CC', bgColor: 'rgba(59, 72, 204, 0.15)' },
  security: { name: 'Security, Identity & Compliance', color: '#DD344C', bgColor: 'rgba(221, 52, 76, 0.15)' },
  management: { name: 'Management & Governance', color: '#E7157B', bgColor: 'rgba(231, 21, 123, 0.15)' },
  integration: { name: 'Application Integration', color: '#FF4F8B', bgColor: 'rgba(255, 79, 139, 0.15)' },
  analytics: { name: 'Analytics', color: '#8C4FFF', bgColor: 'rgba(140, 79, 255, 0.15)' },
  containers: { name: 'Containers', color: '#ED7100', bgColor: 'rgba(237, 113, 0, 0.15)' },
  general: { name: 'General', color: '#232F3E', bgColor: 'rgba(35, 47, 62, 0.15)' },
};

// SVG Icon definitions for AWS services
export const ICONS = {
  // Compute
  ec2: {
    category: 'compute',
    name: 'Amazon EC2',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ED7100"/>
      <path d="M16 22H28V34H16V22Z" fill="#FFF" fill-opacity="0.9"/>
      <path d="M36 22H48V34H36V22Z" fill="#FFF" fill-opacity="0.9"/>
      <path d="M16 38H28V46H16V38Z" fill="#FFF" fill-opacity="0.6"/>
      <path d="M36 38H48V46H36V38Z" fill="#FFF" fill-opacity="0.6"/>
      <path d="M22 14V22M42 14V22M22 46V52M42 46V52" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M12 28H16M48 28H52M12 42H16M48 42H52" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  lambda: {
    category: 'compute',
    name: 'AWS Lambda',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ED7100"/>
      <path d="M20 48L32 16H40L28 48H20Z" fill="#FFF"/>
      <path d="M34 36L44 48H52L39 30L34 36Z" fill="#FFF" fill-opacity="0.85"/>
      <path d="M14 48H22" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  ecs: {
    category: 'containers',
    name: 'Amazon ECS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ED7100"/>
      <path d="M32 14L48 23V41L32 50L16 41V23L32 14Z" stroke="#FFF" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 14V50M16 23L48 41M48 23L16 41" stroke="#FFF" stroke-width="2" stroke-opacity="0.6"/>
      <circle cx="32" cy="32" r="5" fill="#FFF"/>
    </svg>`
  },
  eks: {
    category: 'containers',
    name: 'Amazon EKS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ED7100"/>
      <polygon points="32,16 47,24.5 47,41.5 32,50 17,41.5 17,24.5" stroke="#FFF" stroke-width="3" fill="none"/>
      <circle cx="32" cy="32" r="6" fill="#FFF"/>
      <line x1="32" y1="16" x2="32" y2="26" stroke="#FFF" stroke-width="2.5"/>
      <line x1="47" y1="41.5" x2="37" y2="36.5" stroke="#FFF" stroke-width="2.5"/>
      <line x1="17" y1="41.5" x2="27" y2="36.5" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  autoscaling: {
    category: 'compute',
    name: 'Auto Scaling',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#ED7100"/>
      <rect x="24" y="24" width="16" height="16" rx="2" stroke="#FFF" stroke-width="3"/>
      <path d="M14 18L14 14L18 14M50 18L50 14L46 14M14 46L14 50L18 50M50 46L50 50L46 50" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M14 14L22 22M50 14L42 22M14 50L22 42M50 50L42 42" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },

  // Networking
  vpc: {
    category: 'networking',
    name: 'Amazon VPC',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <rect x="15" y="15" width="34" height="34" rx="4" stroke="#FFF" stroke-width="3" stroke-dasharray="4 2"/>
      <circle cx="23" cy="23" r="3" fill="#FFF"/>
      <circle cx="41" cy="23" r="3" fill="#FFF"/>
      <circle cx="23" cy="41" r="3" fill="#FFF"/>
      <circle cx="41" cy="41" r="3" fill="#FFF"/>
      <path d="M23 23H41V41H23V23Z" stroke="#FFF" stroke-width="1.5" stroke-opacity="0.6"/>
    </svg>`
  },
  subnet: {
    category: 'networking',
    name: 'VPC Subnet',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <rect x="14" y="18" width="36" height="28" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <line x1="14" y1="32" x2="50" y2="32" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="18" x2="32" y2="46" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  alb: {
    category: 'networking',
    name: 'Elastic Load Balancing',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <circle cx="20" cy="32" r="5" fill="#FFF"/>
      <circle cx="44" cy="20" r="5" fill="#FFF"/>
      <circle cx="44" cy="44" r="5" fill="#FFF"/>
      <path d="M25 32H32M32 20H39M32 44H39M32 20V44" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  cloudfront: {
    category: 'networking',
    name: 'Amazon CloudFront',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="32" rx="7" ry="16" stroke="#FFF" stroke-width="2"/>
      <line x1="16" y1="32" x2="48" y2="32" stroke="#FFF" stroke-width="2"/>
      <circle cx="16" cy="32" r="3" fill="#FFF"/>
      <circle cx="48" cy="32" r="3" fill="#FFF"/>
    </svg>`
  },
  route53: {
    category: 'networking',
    name: 'Amazon Route 53',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <circle cx="32" cy="32" r="17" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 15V22M32 42V49M15 32H22M42 32H49" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M26 38L32 24L38 38H26Z" fill="#FFF"/>
    </svg>`
  },
  apigateway: {
    category: 'networking',
    name: 'Amazon API Gateway',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <polygon points="32,15 48,24 48,42 32,51 16,42 16,24" stroke="#FFF" stroke-width="2.5" fill="none"/>
      <rect x="26" y="27" width="12" height="12" rx="2" fill="#FFF"/>
      <line x1="32" y1="15" x2="32" y2="27" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="39" x2="32" y2="51" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  nat_gateway: {
    category: 'networking',
    name: 'NAT Gateway',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <rect x="18" y="20" width="28" height="24" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <path d="M26 32L34 26V38L26 32Z" fill="#FFF"/>
      <line x1="38" y1="32" x2="42" y2="32" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  internet_gateway: {
    category: 'networking',
    name: 'Internet Gateway',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#8C4FFF"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <path d="M24 32H40M32 24V40" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <polygon points="40,29 45,32 40,35" fill="#FFF"/>
    </svg>`
  },

  // Storage
  s3: {
    category: 'storage',
    name: 'Amazon S3',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#7AA116"/>
      <path d="M18 20C18 17.5 24 16 32 16C40 16 46 17.5 46 20V44C46 46.5 40 48 32 48C24 48 18 46.5 18 44V20Z" stroke="#FFF" stroke-width="3"/>
      <path d="M18 28C18 30.5 24 32 32 32C40 32 46 30.5 46 28" stroke="#FFF" stroke-width="2.5"/>
      <path d="M18 36C18 38.5 24 40 32 40C40 40 46 38.5 46 36" stroke="#FFF" stroke-width="2.5"/>
      <ellipse cx="32" cy="20" rx="14" ry="4" fill="#FFF" fill-opacity="0.3"/>
    </svg>`
  },
  efs: {
    category: 'storage',
    name: 'Amazon EFS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#7AA116"/>
      <path d="M16 20H48V44H16V20Z" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="28" x2="40" y2="28" stroke="#FFF" stroke-width="2"/>
      <line x1="24" y1="36" x2="34" y2="36" stroke="#FFF" stroke-width="2"/>
      <circle cx="40" cy="36" r="2.5" fill="#FFF"/>
    </svg>`
  },

  // Database
  rds: {
    category: 'database',
    name: 'Amazon RDS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#3B48CC"/>
      <ellipse cx="32" cy="18" rx="16" ry="6" stroke="#FFF" stroke-width="2.5" fill="#FFF" fill-opacity="0.2"/>
      <path d="M16 18V46C16 49.3 23.2 52 32 52C40.8 52 48 49.3 48 46V18" stroke="#FFF" stroke-width="2.5"/>
      <path d="M16 27C16 30.3 23.2 33 32 33C40.8 33 48 30.3 48 27" stroke="#FFF" stroke-width="2"/>
      <path d="M16 37C16 40.3 23.2 43 32 43C40.8 43 48 40.3 48 37" stroke="#FFF" stroke-width="2"/>
    </svg>`
  },
  dynamodb: {
    category: 'database',
    name: 'Amazon DynamoDB',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#3B48CC"/>
      <ellipse cx="32" cy="19" rx="15" ry="5" fill="#FFF" fill-opacity="0.9"/>
      <path d="M17 19V45C17 48 23.7 50 32 50C40.3 50 47 48 47 45V19" stroke="#FFF" stroke-width="2.5"/>
      <path d="M17 28C17 31 23.7 33 32 33C40.3 33 47 31 47 28" stroke="#FFF" stroke-width="2"/>
      <path d="M17 37C17 40 23.7 42 32 42C40.3 42 47 40 47 37" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="19" x2="32" y2="49" stroke="#3B48CC" stroke-width="2"/>
    </svg>`
  },
  elasticache: {
    category: 'database',
    name: 'Amazon ElastiCache',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#3B48CC"/>
      <rect x="18" y="16" width="28" height="12" rx="2" stroke="#FFF" stroke-width="2"/>
      <rect x="18" y="34" width="28" height="12" rx="2" stroke="#FFF" stroke-width="2"/>
      <circle cx="24" cy="22" r="2" fill="#FFF"/>
      <circle cx="24" cy="40" r="2" fill="#FFF"/>
      <path d="M36 28L32 34M28 28L32 34" stroke="#FFF" stroke-width="2" stroke-linecap="round"/>
    </svg>`
  },

  // Security & Identity
  iam: {
    category: 'security',
    name: 'AWS IAM',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#DD344C"/>
      <circle cx="32" cy="24" r="8" stroke="#FFF" stroke-width="2.5"/>
      <path d="M18 48C18 40.3 24.3 34 32 34C39.7 34 46 40.3 46 48" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="44" cy="22" r="4" fill="#FF9900"/>
      <path d="M44 26V32M44 29H47" stroke="#FF9900" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`
  },
  kms: {
    category: 'security',
    name: 'AWS KMS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#DD344C"/>
      <circle cx="32" cy="26" r="9" stroke="#FFF" stroke-width="3"/>
      <path d="M32 35V50M32 42H38M32 47H38" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  secretsmanager: {
    category: 'security',
    name: 'AWS Secrets Manager',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#DD344C"/>
      <rect x="20" y="26" width="24" height="22" rx="3" stroke="#FFF" stroke-width="2.5"/>
      <path d="M26 26V20C26 16.7 28.7 14 32 14C35.3 14 38 16.7 38 20V26" stroke="#FFF" stroke-width="2.5"/>
      <circle cx="32" cy="35" r="2.5" fill="#FFF"/>
      <path d="M32 37.5V42" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  cognito: {
    category: 'security',
    name: 'Amazon Cognito',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#DD344C"/>
      <circle cx="32" cy="22" r="7" stroke="#FFF" stroke-width="2.5"/>
      <path d="M19 46C19 39 25 33 32 33C39 33 45 39 45 46" stroke="#FFF" stroke-width="2.5"/>
      <polygon points="32,38 35,44 32,50 29,44" fill="#FF9900"/>
    </svg>`
  },

  // Management & Integration
  cloudwatch: {
    category: 'management',
    name: 'Amazon CloudWatch',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#E7157B"/>
      <circle cx="32" cy="32" r="16" stroke="#FFF" stroke-width="2.5"/>
      <path d="M32 20V32L40 36" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M22 42L28 34L34 38L42 26" stroke="#FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  },
  sqs: {
    category: 'integration',
    name: 'Amazon SQS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#FF4F8B"/>
      <rect x="16" y="24" width="32" height="16" rx="2" stroke="#FFF" stroke-width="2.5"/>
      <line x1="24" y1="24" x2="24" y2="40" stroke="#FFF" stroke-width="2"/>
      <line x1="32" y1="24" x2="32" y2="40" stroke="#FFF" stroke-width="2"/>
      <line x1="40" y1="24" x2="40" y2="40" stroke="#FFF" stroke-width="2"/>
      <path d="M12 32H16M48 32H52" stroke="#FFF" stroke-width="3" stroke-linecap="round"/>
    </svg>`
  },
  sns: {
    category: 'integration',
    name: 'Amazon SNS',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#FF4F8B"/>
      <circle cx="32" cy="32" r="7" fill="#FFF"/>
      <path d="M32 16V22M32 42V48M16 32H22M42 32H48M20 20L25 25M39 39L44 44M20 44L25 39M39 25L44 20" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  },
  eventbridge: {
    category: 'integration',
    name: 'Amazon EventBridge',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#FF4F8B"/>
      <circle cx="20" cy="32" r="5" fill="#FFF"/>
      <circle cx="44" cy="20" r="5" fill="#FFF"/>
      <circle cx="44" cy="44" r="5" fill="#FFF"/>
      <path d="M25 32C32 32 36 22 40 21M25 32C32 32 36 42 40 43" stroke="#FFF" stroke-width="2.5"/>
    </svg>`
  },
  generic: {
    category: 'general',
    name: 'AWS Resource',
    svg: `<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" rx="8" fill="#232F3E"/>
      <rect x="18" y="18" width="28" height="28" rx="4" stroke="#FF9900" stroke-width="2.5"/>
      <path d="M26 32H38M32 26V38" stroke="#FFF" stroke-width="2.5" stroke-linecap="round"/>
    </svg>`
  }
};
