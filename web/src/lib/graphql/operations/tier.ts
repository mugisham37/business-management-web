import { gql } from '@apollo/client';

/**
 * Tier-based Feature Access GraphQL Operations
 * 
 * All tier and subscription-related queries and mutations
 * for feature access control and tier management.
 */

// Queries
export const BASIC_FEATURE = gql`
  query BasicFeature {
    basicFeature
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

export const STANDARD_FEATURE = gql`
  query StandardFeature {
    standardFeature
  }
`;

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
  query TestFeatureFlag($featureName: String!) {
    testFeatureFlag(featureName: $featureName)
  }
`;

// Mutations
export const SIMULATE_TIER_UPGRADE = gql`
  mutation SimulateTierUpgrade($targetTier: String!) {
    simulateTierUpgrade(targetTier: $targetTier)
  }
`;