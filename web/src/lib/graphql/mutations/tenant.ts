/**
 * Complete Tenant GraphQL Mutations (TypeScript)
 * Generated from tenant.graphql with proper typing
 */

import { gql } from '@apollo/client';

// Core Tenant Mutations
export const CREATE_TENANT_MUTATION = gql`
  mutation CreateTenant($input: CreateTenantInput!) {
    createTenant(input: $input) {
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
      createdAt
      updatedAt
      trialEndDate
      isActive
    }
  }
`;

export const UPDATE_TENANT_MUTATION = gql`
  mutation UpdateTenant($id: ID!, $input: UpdateTenantInput!) {
    updateTenant(id: $id, input: $input) {
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
      createdAt
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

export const UPDATE_BUSINESS_METRICS_MUTATION = gql`
  mutation UpdateBusinessMetrics($id: ID!, $input: UpdateBusinessMetricsInput!) {
    updateBusinessMetrics(id: $id, input: $input) {
      id
      name
      slug
      businessTier
      subscriptionStatus
      metrics {
        employeeCount
        locationCount
        monthlyTransactionVolume
        monthlyRevenue
      }
      # Computed fields
      tierProgressPercentage
      nextTier
      healthStatus
    }
  }
`;

export const DELETE_TENANT_MUTATION = gql`
  mutation DeleteTenant($id: ID!) {
    deleteTenant(id: $id)
  }
`;

// Feature Flag Mutations
export const CREATE_FEATURE_FLAG_MUTATION = gql`
  mutation CreateFeatureFlag($input: CreateFeatureFlagInput!) {
    createFeatureFlag(input: $input) {
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
      createdAt
      updatedAt
      # Computed fields
      displayName
      category
      dependencies
      isFullyRolledOut
      daysEnabled
      daysDisabled
    }
  }
`;

export const ENABLE_FEATURE_MUTATION = gql`
  mutation EnableFeature($featureName: String!) {
    enableFeature(featureName: $featureName) {
      id
      tenantId
      featureName
      isEnabled
      rolloutPercentage
      status
      enabledAt
      # Computed fields
      displayName
      category
      isFullyRolledOut
    }
  }
`;

export const DISABLE_FEATURE_MUTATION = gql`
  mutation DisableFeature($featureName: String!) {
    disableFeature(featureName: $featureName) {
      id
      tenantId
      featureName
      isEnabled
      rolloutPercentage
      status
      disabledAt
      # Computed fields
      displayName
      category
      isFullyRolledOut
    }
  }
`;

export const UPDATE_FEATURE_FLAG_MUTATION = gql`
  mutation UpdateFeatureFlag($featureName: String!, $input: UpdateFeatureFlagInput!) {
    updateFeatureFlag(featureName: $featureName, input: $input) {
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

export const BULK_UPDATE_FEATURE_FLAGS_MUTATION = gql`
  mutation BulkUpdateFeatureFlags($updates: [UpdateFeatureFlagInput!]!) {
    bulkUpdateFeatureFlags(updates: $updates) {
      id
      tenantId
      featureName
      isEnabled
      rolloutPercentage
      status
      updatedAt
      # Computed fields
      displayName
      category
      isFullyRolledOut
    }
  }
`;

export const INVALIDATE_FEATURE_CACHE_MUTATION = gql`
  mutation InvalidateFeatureCache($featureName: String) {
    invalidateFeatureCache(featureName: $featureName)
  }
`;

export const INVALIDATE_ALL_FEATURE_CACHE_MUTATION = gql`
  mutation InvalidateAllFeatureCache {
    invalidateAllFeatureCache
  }
`;

// Metrics Mutations
export const RECALCULATE_METRICS_MUTATION = gql`
  mutation RecalculateMetrics {
    recalculateMetrics {
      employeeCount
      locationCount
      monthlyTransactionVolume
      monthlyRevenue
    }
  }
`;

// Tenant switching mutation (for auth integration)
export const SWITCH_TENANT_MUTATION = gql`
  mutation SwitchTenant($tenantId: ID!) {
    switchTenant(tenantId: $tenantId) {
      success
      message
      user {
        id
        email
        tenantId
        role
        permissions
      }
    }
  }
`;