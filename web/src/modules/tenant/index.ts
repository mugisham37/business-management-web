/**
 * Tenant Module - Complete Multi-Tenancy System
 * Comprehensive tenant management with progressive feature disclosure
 * Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7
 */

// Core tenant management
export * from '@/lib/tenant';

// Tenant components
export { TenantManager } from '@/components/tenant/TenantManager';

// GraphQL operations
export * from '@/graphql/queries/tenant';
export * from '@/graphql/mutations/tenant';
export * from '@/graphql/subscriptions/tenant';

// Store integration
export { 
  useTenantStore, 
  tenantSelectors, 
  useTenantUtils 
} from '@/lib/stores/tenant-store';

// Types
export type {
  Tenant,
  TenantSettings,
  TenantLimits,
  BrandingConfig,
  FeatureFlag,
  BusinessTier,
} from '@/types/core';

// Module metadata
export const TenantModuleMetadata = {
  name: 'tenant',
  displayName: 'Tenant Management',
  description: 'Multi-tenant management with progressive feature disclosure',
  version: '1.0.0',
  category: 'core',
  permissions: [
    'tenants:read',
    'tenants:write',
    'tenants:switch',
    'features:read',
    'features:manage',
  ],
  requiredTier: 'MICRO' as const,
  features: [
    'tenant-switching',
    'feature-flags',
    'business-tier-progression',
    'real-time-updates',
    'tenant-theming',
    'audit-logging',
  ],
  dependencies: [
    'auth',
    'cache',
    'logger',
  ],
  routes: [
    '/tenant',
    '/tenant/settings',
    '/tenant/features',
    '/tenant/analytics',
  ],
  components: {
    lazy: [
      'TenantDashboard',
      'TenantSettings', 
      'FeatureManagement',
      'TenantAnalytics',
    ],
    eager: [
      'TenantManager',
      'TenantSwitcher',
      'FeatureGate',
      'TierGate',
    ],
  },
  hooks: [
    'useTenantContext',
    'useCurrentTenant',
    'useFeatureFlags',
    'useTenantSwitching',
    'useBusinessTier',
    'useTenantSettings',
    'useFeatureGate',
    'useTierGate',
    'useFeatureAndTierGate',
  ],
  graphql: {
    queries: [
      'GetCurrentTenant',
      'GetTenant',
      'GetTenants',
      'GetAvailableFeatures',
      'GetTenantMetrics',
      'GetTierProgress',
    ],
    mutations: [
      'UpdateTenant',
      'UpdateBusinessMetrics',
      'EnableFeature',
      'DisableFeature',
      'SwitchTenant',
    ],
    subscriptions: [
      'TenantUpdated',
      'MetricsUpdated',
      'TierChanged',
      'FeatureFlagChanged',
    ],
  },
  caching: {
    strategies: ['cache-first', 'network-first'],
    ttl: {
      tenant: 300, // 5 minutes
      features: 300, // 5 minutes
      metrics: 60, // 1 minute
    },
    invalidation: [
      'tenant-updated',
      'feature-changed',
      'tier-changed',
    ],
  },
  realtime: {
    subscriptions: true,
    events: [
      'tenant.updated',
      'tenant.metrics.updated',
      'tenant.tier.changed',
      'feature-flag.changed',
    ],
  },
  audit: {
    enabled: true,
    events: [
      'tenant.created',
      'tenant.updated',
      'tenant.deleted',
      'tenant.switched',
      'feature.enabled',
      'feature.disabled',
      'metrics.updated',
      'tier.changed',
    ],
  },
  monitoring: {
    metrics: [
      'tenant.switch.duration',
      'feature.evaluation.duration',
      'tier.calculation.duration',
      'cache.hit.rate',
    ],
    alerts: [
      'tenant.switch.failure',
      'feature.evaluation.error',
      'tier.calculation.error',
    ],
  },
};

/**
 * Tenant module configuration
 */
export const tenantModuleConfig = {
  // Feature flags
  features: {
    'tenant-switching': {
      enabled: true,
      requiredTier: 'MICRO',
      description: 'Switch between available tenants',
    },
    'feature-flags': {
      enabled: true,
      requiredTier: 'SMALL',
      description: 'Manage feature flags and rollouts',
    },
    'business-tier-progression': {
      enabled: true,
      requiredTier: 'MICRO',
      description: 'Track business tier progression',
    },
    'real-time-updates': {
      enabled: true,
      requiredTier: 'MEDIUM',
      description: 'Real-time tenant and feature updates',
    },
    'tenant-theming': {
      enabled: true,
      requiredTier: 'SMALL',
      description: 'Custom tenant branding and theming',
    },
    'audit-logging': {
      enabled: true,
      requiredTier: 'MEDIUM',
      description: 'Comprehensive audit logging',
    },
    'advanced-analytics': {
      enabled: true,
      requiredTier: 'ENTERPRISE',
      description: 'Advanced tenant analytics and insights',
    },
  },

  // Business tier limits
  tierLimits: {
    MICRO: {
      maxTenants: 1,
      maxUsers: 5,
      maxFeatures: 10,
      maxApiCalls: 1000,
      realTimeUpdates: false,
      customTheming: false,
      auditLogging: false,
    },
    SMALL: {
      maxTenants: 3,
      maxUsers: 20,
      maxFeatures: 25,
      maxApiCalls: 10000,
      realTimeUpdates: false,
      customTheming: true,
      auditLogging: false,
    },
    MEDIUM: {
      maxTenants: 10,
      maxUsers: 100,
      maxFeatures: 50,
      maxApiCalls: 100000,
      realTimeUpdates: true,
      customTheming: true,
      auditLogging: true,
    },
    ENTERPRISE: {
      maxTenants: -1, // Unlimited
      maxUsers: -1, // Unlimited
      maxFeatures: -1, // Unlimited
      maxApiCalls: -1, // Unlimited
      realTimeUpdates: true,
      customTheming: true,
      auditLogging: true,
    },
  },

  // Cache configuration
  cache: {
    tenant: {
      ttl: 300, // 5 minutes
      strategy: 'cache-first',
    },
    features: {
      ttl: 300, // 5 minutes
      strategy: 'cache-first',
    },
    metrics: {
      ttl: 60, // 1 minute
      strategy: 'network-first',
    },
    analytics: {
      ttl: 900, // 15 minutes
      strategy: 'cache-first',
    },
  },

  // Error handling
  errors: {
    retryAttempts: 3,
    retryDelay: 1000,
    fallbackToCache: true,
    showUserFriendlyMessages: true,
  },

  // Performance
  performance: {
    lazyLoadComponents: true,
    preloadCriticalData: true,
    optimisticUpdates: true,
    batchRequests: true,
  },
};

/**
 * Tenant module initialization
 */
export function initializeTenantModule() {
  console.log('Initializing Tenant Module v1.0.0');
  
  // Initialize tenant context
  // This will be called by the main app initialization
  
  return {
    name: 'tenant',
    version: '1.0.0',
    initialized: true,
    config: tenantModuleConfig,
    metadata: TenantModuleMetadata,
  };
}