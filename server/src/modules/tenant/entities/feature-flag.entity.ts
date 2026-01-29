import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessTier } from './tenant.entity';

export enum FeatureFlagStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ROLLOUT = 'rollout',
  TESTING = 'testing',
}

registerEnumType(FeatureFlagStatus, {
  name: 'FeatureFlagStatus',
  description: 'Feature flag status for gradual rollout and testing',
});

@ObjectType()
export class FeatureRule {
  @Field()
  @ApiProperty({ description: 'Rule condition (e.g., "employeeCount > 10")' })
  condition!: string;

  @Field()
  @ApiProperty({ description: 'Rule value (true/false)' })
  value!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Rule description' })
  description?: string;
}

@ObjectType()
export class FeatureFlag {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for the feature flag' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID this feature flag belongs to' })
  tenantId!: string;

  @Field()
  @ApiProperty({ description: 'Feature name (kebab-case)' })
  featureName!: string;

  @Field()
  @ApiProperty({ description: 'Whether the feature is enabled' })
  isEnabled!: boolean;

  @Field(() => BusinessTier, { nullable: true })
  @ApiProperty({ enum: BusinessTier, description: 'Required business tier for this feature' })
  requiredTier?: BusinessTier;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Rollout percentage (0-100)' })
  rolloutPercentage?: number;

  @Field(() => [FeatureRule], { nullable: true })
  @ApiProperty({ type: [FeatureRule], description: 'Custom rules for feature evaluation' })
  customRules?: FeatureRule[];

  @Field(() => FeatureFlagStatus)
  @ApiProperty({ enum: FeatureFlagStatus, description: 'Feature flag status' })
  status!: FeatureFlagStatus;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Feature description' })
  description?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'When the feature was enabled' })
  enabledAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'When the feature was disabled' })
  disabledAt?: Date;

  @Field()
  @ApiProperty({ description: 'Feature flag creation timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;
}

// Predefined feature definitions
export interface FeatureDefinition {
  name: string;
  displayName: string;
  description: string;
  requiredTier: BusinessTier;
  category: string;
  dependencies?: string[];
  customRules?: FeatureRule[];
  isProgressive?: boolean; // If true, higher tiers inherit access
  tierOverrides?: Partial<Record<BusinessTier, boolean>>; // Tier-specific overrides
  upgradePrompt?: {
    title: string;
    description: string;
    ctaText: string;
  };
}

export const FEATURE_DEFINITIONS: Record<string, FeatureDefinition> = {
  // Core POS Features
  'point-of-sale': {
    name: 'point-of-sale',
    displayName: 'Point of Sale',
    description: 'Basic POS functionality for processing transactions',
    requiredTier: BusinessTier.MICRO,
    category: 'pos',
    isProgressive: true,
    upgradePrompt: {
      title: 'Upgrade to unlock POS features',
      description: 'Process transactions with our intuitive point-of-sale system',
      ctaText: 'Upgrade Now'
    }
  },
  'advanced-pos': {
    name: 'advanced-pos',
    displayName: 'Advanced POS',
    description: 'Advanced POS features like discounts, promotions, and complex pricing',
    requiredTier: BusinessTier.SMALL,
    category: 'pos',
    dependencies: ['point-of-sale'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Unlock Advanced POS Features',
      description: 'Access discounts, promotions, and complex pricing rules',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'offline-pos': {
    name: 'offline-pos',
    displayName: 'Offline POS',
    description: 'Offline transaction processing with sync capabilities',
    requiredTier: BusinessTier.SMALL,
    category: 'pos',
    dependencies: ['point-of-sale'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Work Offline with Confidence',
      description: 'Process transactions even without internet connection',
      ctaText: 'Upgrade to Small Plan'
    }
  },

  // Inventory Management
  'inventory-management': {
    name: 'inventory-management',
    displayName: 'Inventory Management',
    description: 'Basic inventory tracking and management',
    requiredTier: BusinessTier.MICRO,
    category: 'inventory',
    isProgressive: true,
    upgradePrompt: {
      title: 'Track Your Inventory',
      description: 'Keep track of stock levels and product information',
      ctaText: 'Upgrade Now'
    }
  },
  'advanced-inventory': {
    name: 'advanced-inventory',
    displayName: 'Advanced Inventory',
    description: 'Multi-location inventory, lot tracking, and automated reordering',
    requiredTier: BusinessTier.SMALL,
    category: 'inventory',
    dependencies: ['inventory-management'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Advanced Inventory Features',
      description: 'Multi-location tracking, lot management, and automated reordering',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'warehouse-management': {
    name: 'warehouse-management',
    displayName: 'Warehouse Management',
    description: 'Advanced warehouse operations, bin locations, and picking optimization',
    requiredTier: BusinessTier.MEDIUM,
    category: 'inventory',
    dependencies: ['advanced-inventory'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Professional Warehouse Management',
      description: 'Optimize warehouse operations with bin locations and picking routes',
      ctaText: 'Upgrade to Medium Plan'
    }
  },

  // Customer Management
  'customer-management': {
    name: 'customer-management',
    displayName: 'Customer Management',
    description: 'Basic customer profiles and purchase history',
    requiredTier: BusinessTier.MICRO,
    category: 'crm',
    isProgressive: true,
    upgradePrompt: {
      title: 'Manage Your Customers',
      description: 'Store customer information and track purchase history',
      ctaText: 'Upgrade Now'
    }
  },
  'loyalty-program': {
    name: 'loyalty-program',
    displayName: 'Loyalty Program',
    description: 'Customer loyalty points, tiers, and rewards',
    requiredTier: BusinessTier.SMALL,
    category: 'crm',
    dependencies: ['customer-management'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Build Customer Loyalty',
      description: 'Reward customers with points, tiers, and special offers',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'advanced-crm': {
    name: 'advanced-crm',
    displayName: 'Advanced CRM',
    description: 'Customer segmentation, analytics, and marketing campaigns',
    requiredTier: BusinessTier.MEDIUM,
    category: 'crm',
    dependencies: ['customer-management'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Advanced Customer Insights',
      description: 'Segment customers, analyze behavior, and run targeted campaigns',
      ctaText: 'Upgrade to Medium Plan'
    }
  },

  // Employee Management
  'employee-management': {
    name: 'employee-management',
    displayName: 'Employee Management',
    description: 'Basic employee profiles and role management',
    requiredTier: BusinessTier.SMALL,
    category: 'hr',
    isProgressive: true,
    upgradePrompt: {
      title: 'Manage Your Team',
      description: 'Create employee profiles and manage roles and permissions',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'time-tracking': {
    name: 'time-tracking',
    displayName: 'Time Tracking',
    description: 'Employee time tracking and attendance management',
    requiredTier: BusinessTier.SMALL,
    category: 'hr',
    dependencies: ['employee-management'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Track Employee Hours',
      description: 'Monitor attendance and track working hours accurately',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'payroll-management': {
    name: 'payroll-management',
    displayName: 'Payroll Management',
    description: 'Payroll calculation and processing',
    requiredTier: BusinessTier.MEDIUM,
    category: 'hr',
    dependencies: ['employee-management', 'time-tracking'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Streamline Payroll',
      description: 'Automate payroll calculations and processing',
      ctaText: 'Upgrade to Medium Plan'
    }
  },

  // Financial Management
  'basic-reporting': {
    name: 'basic-reporting',
    displayName: 'Basic Reporting',
    description: 'Basic sales and inventory reports',
    requiredTier: BusinessTier.MICRO,
    category: 'financial',
    isProgressive: true,
    upgradePrompt: {
      title: 'Get Business Insights',
      description: 'View basic sales and inventory reports',
      ctaText: 'Upgrade Now'
    }
  },
  'financial-management': {
    name: 'financial-management',
    displayName: 'Financial Management',
    description: 'Complete accounting, P&L, and financial reporting',
    requiredTier: BusinessTier.MEDIUM,
    category: 'financial',
    dependencies: ['basic-reporting'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Complete Financial Control',
      description: 'Full accounting features with P&L and financial reporting',
      ctaText: 'Upgrade to Medium Plan'
    }
  },
  'advanced-analytics': {
    name: 'advanced-analytics',
    displayName: 'Advanced Analytics',
    description: 'Predictive analytics, forecasting, and business intelligence',
    requiredTier: BusinessTier.ENTERPRISE,
    category: 'analytics',
    dependencies: ['financial-management'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Enterprise Analytics',
      description: 'Predictive analytics, forecasting, and business intelligence',
      ctaText: 'Upgrade to Enterprise'
    }
  },

  // Multi-Location
  'multi-location': {
    name: 'multi-location',
    displayName: 'Multi-Location',
    description: 'Multi-location operations and centralized management',
    requiredTier: BusinessTier.SMALL,
    category: 'operations',
    isProgressive: true,
    upgradePrompt: {
      title: 'Manage Multiple Locations',
      description: 'Centrally manage operations across multiple locations',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'location-analytics': {
    name: 'location-analytics',
    displayName: 'Location Analytics',
    description: 'Location-specific analytics and performance comparison',
    requiredTier: BusinessTier.MEDIUM,
    category: 'analytics',
    dependencies: ['multi-location'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Location Performance Insights',
      description: 'Compare performance and analyze trends across locations',
      ctaText: 'Upgrade to Medium Plan'
    }
  },

  // Real-time Features
  'real-time-updates': {
    name: 'real-time-updates',
    displayName: 'Real-time Updates',
    description: 'Real-time data synchronization and live updates',
    requiredTier: BusinessTier.SMALL,
    category: 'realtime',
    isProgressive: true,
    upgradePrompt: {
      title: 'Real-time Synchronization',
      description: 'Get instant updates across all devices and locations',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'real-time-inventory': {
    name: 'real-time-inventory',
    displayName: 'Real-time Inventory',
    description: 'Real-time inventory updates across all locations',
    requiredTier: BusinessTier.MEDIUM,
    category: 'realtime',
    dependencies: ['real-time-updates', 'multi-location'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Real-time Inventory Sync',
      description: 'Keep inventory synchronized in real-time across all locations',
      ctaText: 'Upgrade to Medium Plan'
    }
  },

  // B2B Features
  'b2b-operations': {
    name: 'b2b-operations',
    displayName: 'B2B Operations',
    description: 'B2B customer management, wholesale pricing, and bulk operations',
    requiredTier: BusinessTier.MEDIUM,
    category: 'b2b',
    isProgressive: true,
    upgradePrompt: {
      title: 'B2B Operations',
      description: 'Manage wholesale customers and bulk operations',
      ctaText: 'Upgrade to Medium Plan'
    }
  },
  'quote-management': {
    name: 'quote-management',
    displayName: 'Quote Management',
    description: 'Quote generation, approval workflows, and conversion tracking',
    requiredTier: BusinessTier.MEDIUM,
    category: 'b2b',
    dependencies: ['b2b-operations'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Professional Quoting',
      description: 'Generate quotes with approval workflows and tracking',
      ctaText: 'Upgrade to Medium Plan'
    }
  },

  // Integration Features
  'api-access': {
    name: 'api-access',
    displayName: 'API Access',
    description: 'REST and GraphQL API access for integrations',
    requiredTier: BusinessTier.SMALL,
    category: 'integration',
    isProgressive: true,
    upgradePrompt: {
      title: 'API Integration Access',
      description: 'Connect with third-party systems using our APIs',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'advanced-integrations': {
    name: 'advanced-integrations',
    displayName: 'Advanced Integrations',
    description: 'Pre-built connectors and advanced integration features',
    requiredTier: BusinessTier.MEDIUM,
    category: 'integration',
    dependencies: ['api-access'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Advanced Integrations',
      description: 'Access pre-built connectors and advanced integration features',
      ctaText: 'Upgrade to Medium Plan'
    }
  },
  'custom-integrations': {
    name: 'custom-integrations',
    displayName: 'Custom Integrations',
    description: 'Custom integration development and webhook management',
    requiredTier: BusinessTier.ENTERPRISE,
    category: 'integration',
    dependencies: ['advanced-integrations'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Custom Integration Development',
      description: 'Build custom integrations with webhook management',
      ctaText: 'Upgrade to Enterprise'
    }
  },

  // Tier-based Authentication and Onboarding Features
  'social-authentication': {
    name: 'social-authentication',
    displayName: 'Social Authentication',
    description: 'Login with Google, Facebook, and other social providers',
    requiredTier: BusinessTier.MICRO,
    category: 'auth',
    isProgressive: true,
    upgradePrompt: {
      title: 'Quick Social Login',
      description: 'Login easily with your Google or Facebook account',
      ctaText: 'Upgrade Now'
    }
  },
  'progressive-onboarding': {
    name: 'progressive-onboarding',
    displayName: 'Progressive Onboarding',
    description: 'Guided multi-step onboarding with business profile collection',
    requiredTier: BusinessTier.MICRO,
    category: 'onboarding',
    isProgressive: true,
    upgradePrompt: {
      title: 'Guided Setup Experience',
      description: 'Get personalized recommendations with our guided onboarding',
      ctaText: 'Upgrade Now'
    }
  },
  'ai-plan-recommendations': {
    name: 'ai-plan-recommendations',
    displayName: 'AI Plan Recommendations',
    description: 'AI-powered plan recommendations based on business profile',
    requiredTier: BusinessTier.SMALL,
    category: 'onboarding',
    dependencies: ['progressive-onboarding'],
    isProgressive: true,
    upgradePrompt: {
      title: 'Smart Plan Recommendations',
      description: 'Get AI-powered recommendations for the perfect plan',
      ctaText: 'Upgrade to Small Plan'
    }
  },
  'tier-based-dashboard': {
    name: 'tier-based-dashboard',
    displayName: 'Tier-based Dashboard',
    description: 'Customized dashboard experience based on subscription tier',
    requiredTier: BusinessTier.MICRO,
    category: 'dashboard',
    isProgressive: true,
    upgradePrompt: {
      title: 'Personalized Dashboard',
      description: 'Get a dashboard tailored to your business needs',
      ctaText: 'Upgrade Now'
    }
  },
  'upgrade-prompts': {
    name: 'upgrade-prompts',
    displayName: 'Smart Upgrade Prompts',
    description: 'Contextual upgrade prompts with pricing information',
    requiredTier: BusinessTier.MICRO,
    category: 'dashboard',
    isProgressive: true,
    upgradePrompt: {
      title: 'Smart Upgrade Suggestions',
      description: 'Get contextual suggestions to unlock more features',
      ctaText: 'Upgrade Now'
    }
  },
  'trial-management': {
    name: 'trial-management',
    displayName: 'Trial Management',
    description: '30-day free trials with automatic tier management',
    requiredTier: BusinessTier.SMALL,
    category: 'subscription',
    isProgressive: true,
    upgradePrompt: {
      title: 'Try Before You Buy',
      description: 'Start with a 30-day free trial of premium features',
      ctaText: 'Start Free Trial'
    }
  },
  'subscription-management': {
    name: 'subscription-management',
    displayName: 'Subscription Management',
    description: 'Easy upgrade/downgrade with prorated pricing',
    requiredTier: BusinessTier.SMALL,
    category: 'subscription',
    isProgressive: true,
    upgradePrompt: {
      title: 'Flexible Subscription Management',
      description: 'Easily upgrade or downgrade your plan anytime',
      ctaText: 'Manage Subscription'
    }
  },
};