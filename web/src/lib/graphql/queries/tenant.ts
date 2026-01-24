/**
 * Complete Tenant GraphQL Queries (TypeScript)
 * Generated from tenant.graphql with proper typing
 */

import { gql } from '@apollo/client';

// Core Tenant Queries
export const GET_CURRENT_TENANT_QUERY = gql`
  query GetCurrentTenant {
    tenantContext {
      tenant {
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
        subscriptionStartDate
        subscriptionEndDate
        trialEndDate
        isActive
        # Computed fields
        daysUntilTrialEnd
        isTrialActive
        tierProgressPercentage
        nextTier
        availableFeatures
        featureCount
        healthStatus
        accountAge
      }
      businessTier
      isActive
    }
  }
`;

export const GET_TENANT_QUERY = gql`
  query GetTenant($id: ID!) {
    tenant(id: $id) {
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
      subscriptionStartDate
      subscriptionEndDate
      trialEndDate
      isActive
      # Computed fields
      daysUntilTrialEnd
      isTrialActive
      tierProgressPercentage
      nextTier
      availableFeatures
      featureCount
      healthStatus
      accountAge
    }
  }
`;

export const GET_TENANTS_QUERY = gql`
  query GetTenants($query: TenantQueryInput) {
    tenants(query: $query) {
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
      healthStatus
      accountAge
    }
  }
`;

export const GET_TENANTS_PAGINATED_QUERY = gql`
  query GetTenantsPaginated($query: TenantQueryInput) {
    tenantsPaginated(query: $query) {
      tenants {
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
        healthStatus
        accountAge
      }
      total
      page
      pageSize
      totalPages
    }
  }
`;

// Business Tier Queries
export const CALCULATE_BUSINESS_TIER_QUERY = gql`
  query CalculateBusinessTier(
    $employeeCount: Int!
    $locationCount: Int!
    $monthlyTransactionVolume: Int!
    $monthlyRevenue: Float!
  ) {
    calculateBusinessTier(
      employeeCount: $employeeCount
      locationCount: $locationCount
      monthlyTransactionVolume: $monthlyTransactionVolume
      monthlyRevenue: $monthlyRevenue
    )
  }
`;

export const GET_UPGRADE_REQUIREMENTS_QUERY = gql`
  query GetUpgradeRequirements {
    getUpgradeRequirements {
      nextTier
      requirements
      missingCriteria
    }
  }
`;

export const GET_UPGRADE_REQUIREMENTS_FOR_TENANT_QUERY = gql`
  query GetUpgradeRequirementsForTenant($tenantId: ID!) {
    upgradeRequirementsForTenant(tenantId: $tenantId) {
      nextTier
      requirements
      missingCriteria
    }
  }
`;

export const GET_TIER_PROGRESS_QUERY = gql`
  query GetTierProgress {
    tierProgress {
      currentTier
      currentTierProgress
      nextTierProgress
      nextTier
    }
  }
`;

export const GET_TENANT_ANALYTICS_QUERY = gql`
  query GetTenantAnalytics($tenantId: ID!) {
    tenantAnalytics(tenantId: $tenantId) {
      tenantId
      businessTier
      metricsQuality
      criteriaMetCount
      readiness
    }
  }
`;

export const GET_ALL_TIER_BENEFITS_QUERY = gql`
  query GetAllTierBenefits {
    allTierBenefits {
      tier
      description
      features
      limits
    }
  }
`;

export const GET_TIER_BENEFITS_QUERY = gql`
  query GetTierBenefits($tier: String!) {
    tierBenefits(tier: $tier) {
      tier
      description
      features
      limits
    }
  }
`;

export const VALIDATE_METRICS_QUERY = gql`
  query ValidateMetrics(
    $employeeCount: Int!
    $locationCount: Int!
    $monthlyTransactionVolume: Int!
    $monthlyRevenue: Float!
  ) {
    validateMetrics(
      employeeCount: $employeeCount
      locationCount: $locationCount
      monthlyTransactionVolume: $monthlyTransactionVolume
      monthlyRevenue: $monthlyRevenue
    ) {
      isValid
      errors
    }
  }
`;

export const GET_RECOMMENDED_ACTIONS_QUERY = gql`
  query GetRecommendedActions {
    recommendedActions
  }
`;

export const IS_VALID_TENANT_QUERY = gql`
  query IsValidTenant($tenantId: ID!) {
    isValidTenant(tenantId: $tenantId)
  }
`;

// Feature Flag Queries
export const GET_FEATURE_DEFINITIONS_QUERY = gql`
  query GetFeatureDefinitions {
    featureDefinitions {
      name
      displayName
      description
      requiredTier
      category
      dependencies
    }
  }
`;

export const GET_AVAILABLE_FEATURES_QUERY = gql`
  query GetAvailableFeatures {
    availableFeatures {
      available {
        name
        displayName
        description
        requiredTier
        category
        dependencies
      }
      unavailable {
        name
        displayName
        description
        requiredTier
        category
        dependencies
      }
      upgradeRequired {
        name
        displayName
        description
        requiredTier
        category
        dependencies
      }
    }
  }
`;

export const CHECK_FEATURE_ACCESS_QUERY = gql`
  query CheckFeatureAccess($featureName: String!) {
    checkFeatureAccess(featureName: $featureName) {
      featureName
      hasAccess
      reason
    }
  }
`;

export const CHECK_MULTIPLE_FEATURES_QUERY = gql`
  query CheckMultipleFeatures($featureNames: [String!]!) {
    checkMultipleFeatures(featureNames: $featureNames) {
      featureName
      hasAccess
      reason
    }
  }
`;

export const GET_FEATURES_BY_CATEGORY_QUERY = gql`
  query GetFeaturesByCategory($category: String!) {
    featuresByCategory(category: $category) {
      name
      displayName
      description
      requiredTier
      category
      dependencies
    }
  }
`;

export const GET_FEATURES_BY_TIER_QUERY = gql`
  query GetFeaturesByTier($tier: String!) {
    featuresByTier(tier: $tier) {
      name
      displayName
      description
      requiredTier
      category
      dependencies
    }
  }
`;

export const GET_FEATURE_CATEGORY_DETAILS_QUERY = gql`
  query GetFeatureCategoryDetails($category: String!) {
    featureCategoryDetails(category: $category) {
      category
      features {
        name
        displayName
        description
        requiredTier
        category
        dependencies
      }
      count
    }
  }
`;

export const GET_FEATURE_TIER_DETAILS_QUERY = gql`
  query GetFeatureTierDetails($tier: String!) {
    featureTierDetails(tier: $tier) {
      tier
      features {
        name
        displayName
        description
        requiredTier
        category
        dependencies
      }
      count
    }
  }
`;

export const GET_FEATURE_DEPENDENCIES_QUERY = gql`
  query GetFeatureDependencies($featureName: String!) {
    featureDependencies(featureName: $featureName) {
      featureName
      dependencies
      dependenciesStatus {
        featureName
        hasAccess
        reason
      }
    }
  }
`;

// Metrics Queries
export const GET_TENANT_METRICS_QUERY = gql`
  query GetTenantMetrics {
    tenantMetrics {
      employeeCount
      locationCount
      monthlyTransactionVolume
      monthlyRevenue
    }
  }
`;

export const GET_TENANT_USAGE_QUERY = gql`
  query GetTenantUsage {
    tenantUsage {
      metrics {
        employeeCount
        locationCount
        monthlyTransactionVolume
        monthlyRevenue
      }
      businessTier
      lastUpdated
    }
  }
`;

export const GET_TENANT_LIMITS_QUERY = gql`
  query GetTenantLimits {
    tenantLimits {
      maxEmployees
      maxLocations
      maxMonthlyTransactions
      currentTier
      nextTier
    }
  }
`;

export const GET_TIER_PROGRESSION_QUERY = gql`
  query GetTierProgression {
    tierProgression {
      currentTier
      nextTier
      progress
      requirements
      recommendations
    }
  }
`;

export const GET_METRICS_HISTORY_QUERY = gql`
  query GetMetricsHistory($startDate: DateTime!, $endDate: DateTime!) {
    metricsHistory(startDate: $startDate, endDate: $endDate) {
      date
      metrics {
        employeeCount
        locationCount
        monthlyTransactionVolume
        monthlyRevenue
      }
      tier
    }
  }
`;

// Legacy queries for backward compatibility
export const GET_FEATURE_FLAGS_QUERY = GET_AVAILABLE_FEATURES_QUERY;