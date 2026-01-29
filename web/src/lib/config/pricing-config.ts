import { BusinessTier, BusinessTierConfig, TierFeature } from '@/types/pricing';

// Core features available across all tiers
const coreFeatures: TierFeature[] = [
  {
    id: 'dashboard',
    name: 'Dashboard Access',
    description: 'Basic dashboard with key metrics',
    included: true,
  },
  {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage team members and permissions',
    included: true,
  },
  {
    id: 'basic_reporting',
    name: 'Basic Reporting',
    description: 'Standard reports and analytics',
    included: true,
  },
  {
    id: 'email_support',
    name: 'Email Support',
    description: 'Support via email',
    included: true,
  },
];

// Growth tier additional features
const growthFeatures: TierFeature[] = [
  ...coreFeatures,
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed insights and custom reports',
    included: true,
  },
  {
    id: 'api_access',
    name: 'API Access',
    description: 'REST API for integrations',
    included: true,
  },
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Faster response times',
    included: true,
  },
  {
    id: 'inventory_management',
    name: 'Inventory Management',
    description: 'Track and manage inventory',
    included: true,
  },
];

// Business tier additional features
const businessFeatures: TierFeature[] = [
  ...growthFeatures,
  {
    id: 'advanced_inventory',
    name: 'Advanced Inventory',
    description: 'Multi-location inventory tracking',
    included: true,
  },
  {
    id: 'crm_integration',
    name: 'CRM Integration',
    description: 'Customer relationship management',
    included: true,
  },
  {
    id: 'financial_reporting',
    name: 'Financial Reporting',
    description: 'Comprehensive financial analytics',
    included: true,
  },
  {
    id: 'custom_workflows',
    name: 'Custom Workflows',
    description: 'Automated business processes',
    included: true,
  },
  {
    id: 'phone_support',
    name: 'Phone Support',
    description: 'Direct phone support',
    included: true,
  },
];

// Enterprise tier additional features
const enterpriseFeatures: TierFeature[] = [
  ...businessFeatures,
  {
    id: 'white_label',
    name: 'White Label',
    description: 'Custom branding options',
    included: true,
  },
  {
    id: 'sso_integration',
    name: 'SSO Integration',
    description: 'Single sign-on with your systems',
    included: true,
  },
  {
    id: 'dedicated_support',
    name: 'Dedicated Support',
    description: 'Dedicated account manager',
    included: true,
  },
  {
    id: 'custom_integrations',
    name: 'Custom Integrations',
    description: 'Bespoke integration development',
    included: true,
  },
  {
    id: 'compliance_tools',
    name: 'Compliance Tools',
    description: 'Industry-specific compliance features',
    included: true,
  },
];

export const TIER_CONFIGS: BusinessTierConfig[] = [
  {
    tier: BusinessTier.MICRO,
    displayName: 'Free',
    description: 'Perfect for getting started with basic business management',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: coreFeatures,
    limits: {
      maxEmployees: 5,
      maxLocations: 1,
      maxTransactions: 100,
      maxApiCalls: 1000,
      storageGB: 1,
    },
    trialDays: 0,
  },
  {
    tier: BusinessTier.SMALL,
    displayName: 'Growth',
    description: 'Ideal for growing businesses that need more advanced features',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: growthFeatures,
    limits: {
      maxEmployees: 25,
      maxLocations: 3,
      maxTransactions: 1000,
      maxApiCalls: 10000,
      storageGB: 10,
    },
    trialDays: 30,
    isPopular: true,
  },
  {
    tier: BusinessTier.MEDIUM,
    displayName: 'Business',
    description: 'Comprehensive solution for established businesses',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: businessFeatures,
    limits: {
      maxEmployees: 100,
      maxLocations: 10,
      maxTransactions: 10000,
      maxApiCalls: 100000,
      storageGB: 100,
    },
    trialDays: 30,
    isRecommended: true,
  },
  {
    tier: BusinessTier.ENTERPRISE,
    displayName: 'Industry',
    description: 'Enterprise-grade solution with unlimited scalability',
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: enterpriseFeatures,
    limits: {
      maxEmployees: -1, // Unlimited
      maxLocations: -1, // Unlimited
      maxTransactions: -1, // Unlimited
      maxApiCalls: -1, // Unlimited
      storageGB: -1, // Unlimited
    },
    trialDays: 30,
  },
];

export const getTierConfig = (tier: BusinessTier): BusinessTierConfig | undefined => {
  return TIER_CONFIGS.find(config => config.tier === tier);
};

export const getTierDisplayName = (tier: BusinessTier): string => {
  const config = getTierConfig(tier);
  return config?.displayName || tier;
};

export const formatLimit = (limit: number | undefined): string => {
  if (limit === undefined || limit === -1) return 'Unlimited';
  if (limit >= 1000) return `${(limit / 1000).toFixed(0)}k`;
  return limit.toString();
};