import { gql } from '@apollo/client';

/**
 * Business Tier GraphQL Operations
 * 
 * Queries and mutations for tier management, feature access, and subscription handling.
 */

// Fragments
export const TIER_INFO_FRAGMENT = gql`
  fragment TierInfoFragment on TierInfo {
    tier
    displayName
    description
    features
    limits
    pricing
    isActive
    trialExpiresAt
    subscriptionExpiresAt
  }
`;

export const FEATURE_ACCESS_FRAGMENT = gql`
  fragment FeatureAccessFragment on FeatureAccess {
    feature
    hasAccess
    reason
    requiredTier
    usageCount
    usageLimit
    resetDate
  }
`;

export const TIER_USAGE_FRAGMENT = gql`
  fragment TierUsageFragment on TierUsage {
    feature
    currentUsage
    limit
    percentage
    resetDate
    isOverLimit
  }
`;

// Queries
export const GET_MY_TIER = gql`
  query GetMyTier {
    myTier {
      ...TierInfoFragment
    }
  }
  ${TIER_INFO_FRAGMENT}
`;

// Alias for backwards compatibility
export const MY_TIER_INFO = gql`
  query MyTierInfo {
    myTierInfo
  }
`;

export const GET_UPGRADE_OPTIONS = gql`
  query GetUpgradeOptions {
    getUpgradeOptions
  }
`;

export const TEST_FEATURE_FLAG = gql`
  mutation TestFeatureFlag($featureName: String!) {
    testFeatureFlag(featureName: $featureName)
  }
`;

export const SIMULATE_TIER_UPGRADE = gql`
  mutation SimulateTierUpgrade($targetTier: BusinessTier!) {
    simulateTierUpgrade(targetTier: $targetTier)
  }
`;

// Tier-specific feature queries for demonstration
export const BASIC_FEATURE = gql`
  query BasicFeature {
    basicFeature
  }
`;

export const STANDARD_FEATURE = gql`
  query StandardFeature {
    standardFeature
  }
`;

export const PREMIUM_FEATURE = gql`
  query PremiumFeature {
    premiumFeature
  }
`;

export const ENTERPRISE_FEATURE = gql`
  query EnterpriseFeature {
    enterpriseFeature
  }
`;

export const GET_AVAILABLE_TIERS = gql`
  query GetAvailableTiers {
    availableTiers {
      ...TierInfoFragment
    }
  }
  ${TIER_INFO_FRAGMENT}
`;

export const CHECK_FEATURE_ACCESS = gql`
  query CheckFeatureAccess($feature: String!) {
    checkFeatureAccess(feature: $feature) {
      ...FeatureAccessFragment
    }
  }
  ${FEATURE_ACCESS_FRAGMENT}
`;

export const GET_TIER_USAGE = gql`
  query GetTierUsage {
    tierUsage {
      ...TierUsageFragment
    }
  }
  ${TIER_USAGE_FRAGMENT}
`;

export const GET_TIER_LIMITS = gql`
  query GetTierLimits($tier: String) {
    tierLimits(tier: $tier) {
      tier
      limits {
        feature
        limit
        description
        resetPeriod
      }
    }
  }
`;

export const GET_FEATURE_COMPARISON = gql`
  query GetFeatureComparison {
    featureComparison {
      feature
      description
      tiers {
        tier
        included
        limit
        description
      }
    }
  }
`;

export const GET_SUBSCRIPTION_STATUS = gql`
  query GetSubscriptionStatus {
    subscriptionStatus {
      isActive
      tier
      status
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      trialEnd
      paymentMethod
      nextInvoiceDate
      nextInvoiceAmount
    }
  }
`;

// Mutations
export const UPGRADE_TIER = gql`
  mutation UpgradeTier($input: UpgradeTierInput!) {
    upgradeTier(input: $input) {
      success
      message
      newTier
      effectiveDate
      paymentRequired
      paymentUrl
    }
  }
`;

export const DOWNGRADE_TIER = gql`
  mutation DowngradeTier($input: DowngradeTierInput!) {
    downgradeTier(input: $input) {
      success
      message
      newTier
      effectiveDate
      refundAmount
    }
  }
`;

export const START_TRIAL = gql`
  mutation StartTrial($tier: String!) {
    startTrial(tier: $tier) {
      success
      message
      trialExpiresAt
      tier
    }
  }
`;

export const CANCEL_SUBSCRIPTION = gql`
  mutation CancelSubscription($input: CancelSubscriptionInput!) {
    cancelSubscription(input: $input) {
      success
      message
      effectiveDate
      refundAmount
    }
  }
`;

export const REACTIVATE_SUBSCRIPTION = gql`
  mutation ReactivateSubscription {
    reactivateSubscription {
      success
      message
      tier
      nextBillingDate
    }
  }
`;

export const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
    updatePaymentMethod(input: $input) {
      success
      message
      paymentMethod {
        id
        type
        last4
        expiryMonth
        expiryYear
        brand
      }
    }
  }
`;

export const REQUEST_TIER_UPGRADE = gql`
  mutation RequestTierUpgrade($input: RequestTierUpgradeInput!) {
    requestTierUpgrade(input: $input) {
      success
      message
      requestId
      approvalRequired
    }
  }
`;

export const TRACK_FEATURE_USAGE = gql`
  mutation TrackFeatureUsage($input: TrackFeatureUsageInput!) {
    trackFeatureUsage(input: $input) {
      success
      currentUsage
      remainingUsage
      isOverLimit
    }
  }
`;

// Subscriptions
export const TIER_CHANGED = gql`
  subscription TierChanged {
    tierChanged {
      userId
      oldTier
      newTier
      timestamp
      reason
      effectiveDate
    }
  }
`;

export const FEATURE_USAGE_UPDATED = gql`
  subscription FeatureUsageUpdated {
    featureUsageUpdated {
      feature
      currentUsage
      limit
      percentage
      isOverLimit
      timestamp
    }
  }
`;

export const SUBSCRIPTION_STATUS_CHANGED = gql`
  subscription SubscriptionStatusChanged {
    subscriptionStatusChanged {
      status
      tier
      timestamp
      reason
      metadata
    }
  }
`;

export const TRIAL_EXPIRING = gql`
  subscription TrialExpiring {
    trialExpiring {
      tier
      expiresAt
      daysRemaining
      timestamp
    }
  }
`;