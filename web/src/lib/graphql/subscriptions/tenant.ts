/**
 * Complete Tenant GraphQL Subscriptions (TypeScript)
 * Real-time updates for tenant operations
 */

import { gql } from '@apollo/client';

// Tenant Updates Subscription
export const TENANT_UPDATED_SUBSCRIPTION = gql`
  subscription TenantUpdated($tenantId: ID!) {
    tenantUpdated(tenantId: $tenantId) {
      id
      name
      slug
      businessTier
      subscriptionStatus
      settings {
        timezone
        locale
        currency
        logoUrl
        primaryColor
      }
      metrics {
        employeeCount
        locationCount
        monthlyTransactionVolume
        monthlyRevenue
      }
      contactEmail
      contactPhone
      updatedAt
      isActive
      # Computed fields
      daysUntilTrialEnd
      isTrialActive
      tierProgressPercentage
      nextTier
      healthStatus
    }
  }
`;

// Metrics Updates Subscription
export const METRICS_UPDATED_SUBSCRIPTION = gql`
  subscription MetricsUpdated($tenantId: ID!) {
    metricsUpdated(tenantId: $tenantId)
  }
`;

// Tier Changes Subscription
export const TIER_CHANGED_SUBSCRIPTION = gql`
  subscription TierChanged($tenantId: ID!) {
    tierChanged(tenantId: $tenantId)
  }
`;

// Feature Flag Changes Subscription
export const FEATURE_FLAG_CHANGED_SUBSCRIPTION = gql`
  subscription FeatureFlagChanged($tenantId: ID!) {
    featureFlagChanged(tenantId: $tenantId) {
      id
      tenantId
      featureName
      isEnabled
      rolloutPercentage
      customRules {
        condition
        value
        description
      }
      status
      description
      enabledAt
      disabledAt
      updatedAt
      # Computed fields
      displayName
      category
      dependencies
      isFullyRolledOut
    }
  }
`;

// Subscription Status Changes Subscription
export const SUBSCRIPTION_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription SubscriptionStatusChanged($tenantId: ID!) {
    subscriptionStatusChanged(tenantId: $tenantId)
  }
`;

// Tenant Activity Subscription
export const TENANT_ACTIVITY_SUBSCRIPTION = gql`
  subscription TenantActivity($tenantId: ID!) {
    tenantActivity(tenantId: $tenantId)
  }
`;