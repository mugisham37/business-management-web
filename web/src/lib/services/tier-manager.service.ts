/**
 * TierManager Service - Complete tier management system with permission enforcement
 * 
 * This service provides comprehensive tier management functionality including:
 * - 4-tier access control system (Micro/Small/Medium/Enterprise)
 * - Feature availability management and validation
 * - Tier upgrade/downgrade workflows
 * - Real-time permission updates
 * - Cross-platform permission enforcement
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3
 */

import { ApolloClient, NormalizedCacheObject, gql } from '@apollo/client';
import { BusinessTier } from '@/types/onboarding';
import { TierAssignmentService, getTierAssignmentService } from './tier-assignment.service';
import { TierRecommendationService, tierRecommendationService } from './tier-recommendation.service';
import { SubscriptionService } from './subscription-service';

// GraphQL operations for tier management
const VALIDATE_FEATURE_ACCESS = gql`
  query ValidateFeatureAccess($userId: String!, $feature: String!) {
    validateFeatureAccess(userId: $userId, feature: $feature) {
      hasAccess
      tier
      requiredTier
      reason
      upgradeRequired
    }
  }
`;

const UPGRADE_TIER = gql`
  mutation UpgradeTier($input: UpgradeTierInput!) {
    upgradeTier(input: $input) {
      success
      newTier
      previousTier
      activatedAt
      permissions
      features
      subscriptionId
      error
    }
  }
`;

const DOWNGRADE_TIER = gql`
  mutation DowngradeTier($input: DowngradeTierInput!) {
    downgradeTier(input: $input) {
      success
      newTier
      previousTier
      downgradedAt
      permissions
      features
      reason
      error
    }
  }
`;

const GET_TIER_FEATURES = gql`
  query GetTierFeatures($tier: BusinessTier!) {
    getTierFeatures(tier: $tier) {
      tier
      features
      permissions
      limits {
        employees
        locations
        transactions
        storage
        apiCalls
      }
      supportLevel
    }
  }
`;

const BROADCAST_TIER_CHANGE = gql`
  mutation BroadcastTierChange($input: BroadcastTierChangeInput!) {
    broadcastTierChange(input: $input) {
      success
      broadcastId
      affectedSessions
      error
    }
  }
`;

// Types and interfaces
export interface AccessResult {
  hasAccess: boolean;
  tier: BusinessTier;
  requiredTier?: BusinessTier;
  reason?: string;
  upgradeRequired: boolean;
  upgradeOptions?: BusinessTier[] | undefined;
}

export interface TierUpgradeResult {
  success: boolean;
  newTier: BusinessTier;
  previousTier: BusinessTier;
  activatedAt: Date;
  permissions: string[];
  features: string[];
  subscriptionId?: string;
  error?: string;
}

export interface TierDowngradeResult {
  success: boolean;
  newTier: BusinessTier;
  previousTier: BusinessTier;
  downgradedAt: Date;
  permissions: string[];
  features: string[];
  reason: DowngradeReason;
  error?: string;
}

export interface FeatureSet {
  tier: BusinessTier;
  features: string[];
  permissions: string[];
  limits: TierLimits;
  supportLevel: 'community' | 'email' | 'priority' | 'dedicated';
}

export interface TierLimits {
  employees: number;
  locations: number;
  transactions: number;
  storage: number; // in GB
  apiCalls: number; // per month
}

export enum DowngradeReason {
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  PAYMENT_FAILED = 'payment_failed',
  USER_REQUESTED = 'user_requested',
  POLICY_VIOLATION = 'policy_violation',
  ACCOUNT_SUSPENDED = 'account_suspended'
}

export interface TierChangeEvent {
  userId: string;
  oldTier: BusinessTier;
  newTier: BusinessTier;
  timestamp: Date;
  reason: string;
  permissions: string[];
  features: string[];
}

/**
 * Comprehensive Tier Management Service
 */
export class TierManager {
  private apolloClient: ApolloClient<NormalizedCacheObject>;
  private tierAssignmentService: TierAssignmentService;
  private tierRecommendationService: TierRecommendationService;
  private eventListeners: Map<string, (event: TierChangeEvent) => void> = new Map();

  // Tier hierarchy for upgrade/downgrade logic
  private readonly tierHierarchy: BusinessTier[] = [
    BusinessTier.MICRO,
    BusinessTier.SMALL,
    BusinessTier.MEDIUM,
    BusinessTier.ENTERPRISE
  ];

  // Feature mapping for each tier
  private readonly tierFeatures: Record<BusinessTier, FeatureSet> = {
    [BusinessTier.MICRO]: {
      tier: BusinessTier.MICRO,
      features: [
        'basic-pos',
        'inventory-management',
        'customer-profiles',
        'basic-reporting',
        'community-support'
      ],
      permissions: [
        'pos:basic:read',
        'pos:basic:write',
        'inventory:basic:read',
        'inventory:basic:write',
        'customers:basic:read',
        'customers:basic:write',
        'reports:basic:read'
      ],
      limits: {
        employees: 5,
        locations: 1,
        transactions: 1000,
        storage: 1,
        apiCalls: 1000
      },
      supportLevel: 'community'
    },
    [BusinessTier.SMALL]: {
      tier: BusinessTier.SMALL,
      features: [
        'basic-pos',
        'advanced-pos',
        'inventory-management',
        'advanced-inventory',
        'customer-profiles',
        'loyalty-program',
        'multi-location-support',
        'basic-reporting',
        'advanced-analytics',
        'real-time-updates',
        'api-access',
        'email-support'
      ],
      permissions: [
        'pos:basic:read',
        'pos:basic:write',
        'pos:advanced:read',
        'pos:advanced:write',
        'inventory:basic:read',
        'inventory:basic:write',
        'inventory:advanced:read',
        'inventory:advanced:write',
        'customers:basic:read',
        'customers:basic:write',
        'customers:loyalty:read',
        'customers:loyalty:write',
        'reports:basic:read',
        'reports:advanced:read',
        'locations:multi:read',
        'locations:multi:write',
        'integrations:api:read',
        'integrations:api:write'
      ],
      limits: {
        employees: 25,
        locations: 5,
        transactions: 10000,
        storage: 10,
        apiCalls: 10000
      },
      supportLevel: 'email'
    },
    [BusinessTier.MEDIUM]: {
      tier: BusinessTier.MEDIUM,
      features: [
        'basic-pos',
        'advanced-pos',
        'inventory-management',
        'advanced-inventory',
        'customer-profiles',
        'loyalty-program',
        'multi-location-support',
        'basic-reporting',
        'advanced-analytics',
        'real-time-updates',
        'api-access',
        'b2b-operations',
        'financial-management',
        'quote-management',
        'sso-integration',
        'user-management',
        'priority-support'
      ],
      permissions: [
        'pos:basic:read',
        'pos:basic:write',
        'pos:advanced:read',
        'pos:advanced:write',
        'inventory:basic:read',
        'inventory:basic:write',
        'inventory:advanced:read',
        'inventory:advanced:write',
        'customers:basic:read',
        'customers:basic:write',
        'customers:loyalty:read',
        'customers:loyalty:write',
        'reports:basic:read',
        'reports:advanced:read',
        'locations:multi:read',
        'locations:multi:write',
        'integrations:api:read',
        'integrations:api:write',
        'b2b:operations:read',
        'b2b:operations:write',
        'financial:management:read',
        'financial:management:write',
        'users:management:read',
        'users:management:write'
      ],
      limits: {
        employees: 100,
        locations: 20,
        transactions: 50000,
        storage: 100,
        apiCalls: 100000
      },
      supportLevel: 'priority'
    },
    [BusinessTier.ENTERPRISE]: {
      tier: BusinessTier.ENTERPRISE,
      features: [
        'basic-pos',
        'advanced-pos',
        'inventory-management',
        'advanced-inventory',
        'customer-profiles',
        'loyalty-program',
        'multi-location-support',
        'basic-reporting',
        'advanced-analytics',
        'real-time-updates',
        'api-access',
        'b2b-operations',
        'financial-management',
        'quote-management',
        'sso-integration',
        'user-management',
        'warehouse-management',
        'predictive-analytics',
        'dedicated-support',
        'custom-sla',
        'white-label-options',
        'unlimited-api',
        'advanced-security',
        'compliance-tools'
      ],
      permissions: [
        'pos:*',
        'inventory:*',
        'customers:*',
        'reports:*',
        'locations:*',
        'integrations:*',
        'b2b:*',
        'financial:*',
        'users:*',
        'warehouse:*',
        'analytics:*',
        'security:*',
        'admin:*'
      ],
      limits: {
        employees: -1, // Unlimited
        locations: -1, // Unlimited
        transactions: -1, // Unlimited
        storage: -1, // Unlimited
        apiCalls: -1 // Unlimited
      },
      supportLevel: 'dedicated'
    }
  };

  constructor(apolloClient: ApolloClient<NormalizedCacheObject>) {
    this.apolloClient = apolloClient;
    this.tierAssignmentService = getTierAssignmentService(apolloClient);
    this.tierRecommendationService = tierRecommendationService;
  }

  /**
   * Validate access to a specific feature for a user
   * Requirements: 2.1, 2.2, 10.1, 10.3
   */
  async validateAccess(userId: string, feature: string): Promise<AccessResult> {
    try {
      const { data } = await this.apolloClient.query({
        query: VALIDATE_FEATURE_ACCESS,
        variables: { userId, feature },
        fetchPolicy: 'cache-first'
      });

      const result = data.validateFeatureAccess;
      
      return {
        hasAccess: result.hasAccess,
        tier: result.tier,
        requiredTier: result.requiredTier,
        reason: result.reason,
        upgradeRequired: result.upgradeRequired,
        upgradeOptions: result.upgradeRequired ? this.getUpgradeOptions(result.tier) : undefined
      };
    } catch (error) {
      console.error('Failed to validate feature access:', error);
      return {
        hasAccess: false,
        tier: BusinessTier.MICRO,
        upgradeRequired: true,
        reason: 'Validation failed'
      };
    }
  }

  /**
   * Upgrade user to a higher tier
   * Requirements: 2.4
   */
  async upgradeTier(
    userId: string, 
    newTier: BusinessTier, 
    paymentMethodId?: string,
    billingCycle: 'monthly' | 'annually' = 'monthly'
  ): Promise<TierUpgradeResult> {
    try {
      // Validate upgrade path
      const currentTierData = await this.getCurrentUserTier(userId);
      if (!this.isValidUpgrade(currentTierData.tier, newTier)) {
        return {
          success: false,
          newTier,
          previousTier: currentTierData.tier,
          activatedAt: new Date(),
          permissions: [],
          features: [],
          error: 'Invalid upgrade path'
        };
      }

      // Process payment if required (for paid tiers)
      let subscriptionId: string | undefined;
      if (newTier !== BusinessTier.MICRO && paymentMethodId) {
        const subscriptionResult = await SubscriptionService.initializeSubscription({
          tier: newTier,
          billingCycle
        });

        if (!subscriptionResult.success) {
          return {
            success: false,
            newTier,
            previousTier: currentTierData.tier,
            activatedAt: new Date(),
            permissions: [],
            features: [],
            error: subscriptionResult.error || 'Payment processing failed'
          };
        }

        subscriptionId = subscriptionResult.subscriptionId;
      }

      // Execute tier upgrade
      const { data } = await this.apolloClient.mutate({
        mutation: UPGRADE_TIER,
        variables: {
          input: {
            userId,
            newTier,
            previousTier: currentTierData.tier,
            subscriptionId,
            billingCycle
          }
        }
      });

      const result = data.upgradeTier;

      if (result.success) {
        // Broadcast tier change for real-time updates
        await this.broadcastTierChange(userId, currentTierData.tier, newTier);

        // Trigger event listeners
        this.emitTierChangeEvent({
          userId,
          oldTier: currentTierData.tier,
          newTier,
          timestamp: new Date(result.activatedAt),
          reason: 'User upgrade',
          permissions: result.permissions,
          features: result.features
        });

        return {
          success: true,
          newTier: result.newTier,
          previousTier: result.previousTier,
          activatedAt: new Date(result.activatedAt),
          permissions: result.permissions,
          features: result.features,
          subscriptionId: result.subscriptionId
        };
      } else {
        return {
          success: false,
          newTier,
          previousTier: currentTierData.tier,
          activatedAt: new Date(),
          permissions: [],
          features: [],
          error: result.error || 'Upgrade failed'
        };
      }
    } catch (error) {
      console.error('Failed to upgrade tier:', error);
      return {
        success: false,
        newTier,
        previousTier: BusinessTier.MICRO,
        activatedAt: new Date(),
        permissions: [],
        features: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Downgrade user to a lower tier
   * Requirements: 2.4
   */
  async downgradeTier(
    userId: string, 
    newTier: BusinessTier, 
    reason: DowngradeReason
  ): Promise<TierDowngradeResult> {
    try {
      const currentTierData = await this.getCurrentUserTier(userId);
      
      // Validate downgrade path
      if (!this.isValidDowngrade(currentTierData.tier, newTier)) {
        return {
          success: false,
          newTier,
          previousTier: currentTierData.tier,
          downgradedAt: new Date(),
          permissions: [],
          features: [],
          reason,
          error: 'Invalid downgrade path'
        };
      }

      // Execute tier downgrade
      const { data } = await this.apolloClient.mutate({
        mutation: DOWNGRADE_TIER,
        variables: {
          input: {
            userId,
            newTier,
            previousTier: currentTierData.tier,
            reason
          }
        }
      });

      const result = data.downgradeTier;

      if (result.success) {
        // Broadcast tier change for real-time updates
        await this.broadcastTierChange(userId, currentTierData.tier, newTier);

        // Trigger event listeners
        this.emitTierChangeEvent({
          userId,
          oldTier: currentTierData.tier,
          newTier,
          timestamp: new Date(result.downgradedAt),
          reason: `Downgrade: ${reason}`,
          permissions: result.permissions,
          features: result.features
        });

        return {
          success: true,
          newTier: result.newTier,
          previousTier: result.previousTier,
          downgradedAt: new Date(result.downgradedAt),
          permissions: result.permissions,
          features: result.features,
          reason
        };
      } else {
        return {
          success: false,
          newTier,
          previousTier: currentTierData.tier,
          downgradedAt: new Date(),
          permissions: [],
          features: [],
          reason,
          error: result.error || 'Downgrade failed'
        };
      }
    } catch (error) {
      console.error('Failed to downgrade tier:', error);
      return {
        success: false,
        newTier,
        previousTier: BusinessTier.MICRO,
        downgradedAt: new Date(),
        permissions: [],
        features: [],
        reason,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get features available for a specific tier
   * Requirements: 2.1, 2.2
   */
  async getTierFeatures(tier: BusinessTier): Promise<FeatureSet> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_TIER_FEATURES,
        variables: { tier },
        fetchPolicy: 'cache-first'
      });

      return data.getTierFeatures;
    } catch (error) {
      console.error('Failed to get tier features:', error);
      // Return cached feature set as fallback
      return this.tierFeatures[tier];
    }
  }

  /**
   * Broadcast tier change to all user sessions for real-time updates
   * Requirements: 2.3, 10.2
   */
  async broadcastTierChange(userId: string, oldTier: BusinessTier, newTier: BusinessTier): Promise<void> {
    try {
      await this.apolloClient.mutate({
        mutation: BROADCAST_TIER_CHANGE,
        variables: {
          input: {
            userId,
            oldTier,
            newTier,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Failed to broadcast tier change:', error);
      // Don't throw error as this is not critical for the tier change operation
    }
  }

  /**
   * Check if a feature is available for a specific tier
   */
  isFeatureAvailable(tier: BusinessTier, feature: string): boolean {
    const tierFeatureSet = this.tierFeatures[tier];
    return tierFeatureSet.features.includes(feature);
  }

  /**
   * Check if a permission is granted for a specific tier
   */
  hasPermission(tier: BusinessTier, permission: string): boolean {
    const tierFeatureSet = this.tierFeatures[tier];
    
    // Check for exact permission match
    if (tierFeatureSet.permissions.includes(permission)) {
      return true;
    }

    // Check for wildcard permissions (e.g., "pos:*" matches "pos:basic:read")
    return tierFeatureSet.permissions.some(p => {
      if (p.endsWith(':*')) {
        const prefix = p.slice(0, -1);
        return permission.startsWith(prefix);
      }
      return false;
    });
  }

  /**
   * Get upgrade options for a given tier
   */
  getUpgradeOptions(currentTier: BusinessTier): BusinessTier[] {
    const currentIndex = this.tierHierarchy.indexOf(currentTier);
    return this.tierHierarchy.slice(currentIndex + 1);
  }

  /**
   * Get downgrade options for a given tier
   */
  getDowngradeOptions(currentTier: BusinessTier): BusinessTier[] {
    const currentIndex = this.tierHierarchy.indexOf(currentTier);
    return this.tierHierarchy.slice(0, currentIndex).reverse();
  }

  /**
   * Validate if upgrade path is valid
   */
  private isValidUpgrade(fromTier: BusinessTier, toTier: BusinessTier): boolean {
    const fromIndex = this.tierHierarchy.indexOf(fromTier);
    const toIndex = this.tierHierarchy.indexOf(toTier);
    return toIndex > fromIndex;
  }

  /**
   * Validate if downgrade path is valid
   */
  private isValidDowngrade(fromTier: BusinessTier, toTier: BusinessTier): boolean {
    const fromIndex = this.tierHierarchy.indexOf(fromTier);
    const toIndex = this.tierHierarchy.indexOf(toTier);
    return toIndex < fromIndex;
  }

  /**
   * Get current user tier (mock implementation - would fetch from backend)
   */
  private async getCurrentUserTier(userId: string): Promise<{ tier: BusinessTier }> {
    // TODO: In a real implementation, this would fetch from the backend using userId
    // For now, return a default tier
    console.debug(`Fetching tier for user: ${userId}`);
    return { tier: BusinessTier.MICRO };
  }

  /**
   * Add event listener for tier changes
   */
  onTierChange(eventId: string, callback: (event: TierChangeEvent) => void): void {
    this.eventListeners.set(eventId, callback);
  }

  /**
   * Remove event listener
   */
  offTierChange(eventId: string): void {
    this.eventListeners.delete(eventId);
  }

  /**
   * Emit tier change event to all listeners
   */
  private emitTierChangeEvent(event: TierChangeEvent): void {
    this.eventListeners.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in tier change event listener:', error);
      }
    });
  }

  /**
   * Get tier comparison data
   */
  getTierComparison(): Array<{
    tier: BusinessTier;
    name: string;
    features: string[];
    limits: TierLimits;
    supportLevel: string;
    price: { monthly: number; annually: number };
  }> {
    const prices = {
      [BusinessTier.MICRO]: { monthly: 0, annually: 0 },
      [BusinessTier.SMALL]: { monthly: 49, annually: 39 },
      [BusinessTier.MEDIUM]: { monthly: 99, annually: 79 },
      [BusinessTier.ENTERPRISE]: { monthly: 299, annually: 249 }
    };

    const names = {
      [BusinessTier.MICRO]: 'Micro (Free)',
      [BusinessTier.SMALL]: 'Small Business',
      [BusinessTier.MEDIUM]: 'Medium Business',
      [BusinessTier.ENTERPRISE]: 'Enterprise'
    };

    return this.tierHierarchy.map(tier => ({
      tier,
      name: names[tier],
      features: this.tierFeatures[tier].features,
      limits: this.tierFeatures[tier].limits,
      supportLevel: this.tierFeatures[tier].supportLevel,
      price: prices[tier]
    }));
  }
}

// Export singleton instance
let tierManagerInstance: TierManager | null = null;

export const getTierManager = (apolloClient: ApolloClient<NormalizedCacheObject>): TierManager => {
  if (!tierManagerInstance) {
    tierManagerInstance = new TierManager(apolloClient);
  }
  return tierManagerInstance;
};

export default TierManager;