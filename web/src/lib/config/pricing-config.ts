/**
 * Pricing Configuration
 * 
 * Centralized pricing tier configurations for the application
 */

import { BusinessTier, TierConfig, TierFeature } from '@/types/pricing';

/**
 * Format a limit value for display
 */
export function formatLimit(value: number): string {
  if (value === -1 || value === Infinity) {
    return 'Unlimited';
  }
  return value.toLocaleString();
}

/**
 * Tier configurations
 */
export const TIER_CONFIGS: TierConfig[] = [
  {
    tier: BusinessTier.MICRO,
    displayName: 'Micro',
    description: 'Perfect for solo entrepreneurs and freelancers',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { id: 'dashboard', name: 'Basic Dashboard', included: true },
      { id: 'user_management', name: 'User Management', included: true, limit: '1 user' },
      { id: 'basic_reporting', name: 'Basic Reporting', included: true },
      { id: 'email_support', name: 'Email Support', included: true },
    ],
    limits: {
      maxEmployees: 1,
      maxLocations: 1,
      storageGB: 1,
      apiCallsPerMonth: 1000,
      maxProducts: 50,
      maxCustomers: 100,
    },
    isRecommended: false,
    isPopular: false,
    trialDays: 0,
  },
  {
    tier: BusinessTier.STARTER,
    displayName: 'Starter',
    description: 'Ideal for small teams getting started',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: [
      { id: 'dashboard', name: 'Full Dashboard', included: true },
      { id: 'user_management', name: 'User Management', included: true, limit: '5 users' },
      { id: 'basic_reporting', name: 'Advanced Reporting', included: true },
      { id: 'email_support', name: 'Priority Email Support', included: true },
      { id: 'inventory_management', name: 'Inventory Management', included: true },
      { id: 'api_access', name: 'API Access', included: true, limit: '10K calls/month' },
    ],
    limits: {
      maxEmployees: 5,
      maxLocations: 2,
      storageGB: 10,
      apiCallsPerMonth: 10000,
      maxProducts: 500,
      maxCustomers: 1000,
    },
    isRecommended: false,
    isPopular: true,
    trialDays: 14,
  },
  {
    tier: BusinessTier.PROFESSIONAL,
    displayName: 'Professional',
    description: 'For growing businesses that need more power',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: [
      { id: 'dashboard', name: 'Full Dashboard', included: true },
      { id: 'user_management', name: 'User Management', included: true, limit: '25 users' },
      { id: 'advanced_analytics', name: 'Advanced Analytics', included: true },
      { id: 'financial_reporting', name: 'Financial Reporting', included: true },
      { id: 'priority_support', name: 'Priority Support', included: true },
      { id: 'advanced_inventory', name: 'Advanced Inventory', included: true },
      { id: 'crm_integration', name: 'CRM Integration', included: true },
      { id: 'api_access', name: 'API Access', included: true, limit: '100K calls/month' },
      { id: 'custom_workflows', name: 'Custom Workflows', included: true },
    ],
    limits: {
      maxEmployees: 25,
      maxLocations: 10,
      storageGB: 50,
      apiCallsPerMonth: 100000,
      maxProducts: 5000,
      maxCustomers: 10000,
    },
    isRecommended: true,
    isPopular: false,
    trialDays: 30,
  },
  {
    tier: BusinessTier.ENTERPRISE,
    displayName: 'Enterprise',
    description: 'For large organizations with complex needs',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: [
      { id: 'dashboard', name: 'Full Dashboard', included: true },
      { id: 'user_management', name: 'User Management', included: true, limit: 'Unlimited' },
      { id: 'advanced_analytics', name: 'Advanced Analytics', included: true },
      { id: 'financial_reporting', name: 'Financial Reporting', included: true },
      { id: 'dedicated_support', name: 'Dedicated Support', included: true },
      { id: 'phone_support', name: 'Phone Support', included: true },
      { id: 'advanced_inventory', name: 'Advanced Inventory', included: true },
      { id: 'crm_integration', name: 'CRM Integration', included: true },
      { id: 'api_access', name: 'Unlimited API Access', included: true },
      { id: 'custom_workflows', name: 'Custom Workflows', included: true },
      { id: 'sso_integration', name: 'SSO Integration', included: true },
      { id: 'custom_integrations', name: 'Custom Integrations', included: true },
      { id: 'white_label', name: 'White Label', included: true },
      { id: 'compliance_tools', name: 'Compliance Tools', included: true },
    ],
    limits: {
      maxEmployees: -1, // Unlimited
      maxLocations: -1,
      storageGB: 500,
      apiCallsPerMonth: -1,
      maxProducts: -1,
      maxCustomers: -1,
    },
    isRecommended: false,
    isPopular: false,
    trialDays: 30,
  },
];

/**
 * Get tier config by tier enum
 */
export function getTierConfig(tier: BusinessTier): TierConfig | undefined {
  return TIER_CONFIGS.find(config => config.tier === tier);
}

/**
 * Get all features across all tiers
 */
export function getAllFeatures(): TierFeature[] {
  const featureMap = new Map<string, TierFeature>();
  
  TIER_CONFIGS.forEach(config => {
    config.features.forEach(feature => {
      if (!featureMap.has(feature.id)) {
        featureMap.set(feature.id, feature);
      }
    });
  });
  
  return Array.from(featureMap.values());
}

/**
 * Check if a feature is available in a tier
 */
export function isFeatureInTier(tier: BusinessTier, featureId: string): boolean {
  const config = getTierConfig(tier);
  return config?.features.some(f => f.id === featureId && f.included) ?? false;
}
