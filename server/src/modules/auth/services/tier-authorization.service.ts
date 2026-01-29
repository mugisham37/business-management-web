import { Injectable } from '@nestjs/common';
import { FeatureFlagService } from '../../tenant/services/feature-flag.service';
import { PermissionsService } from './permissions.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

export interface AuthorizationContext {
  user: AuthenticatedUser;
  resource?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  requiredTier?: string;
  missingFeatures?: string[];
  missingPermissions?: string[];
  upgradeRequired?: boolean;
}

/**
 * Comprehensive Authorization Service
 * Integrates tier-based access control with existing RBAC system
 * Provides unified authorization checking for all access control needs
 */
@Injectable()
export class TierAuthorizationService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Check comprehensive authorization including tier, features, and permissions
   */
  async checkAuthorization(
    context: AuthorizationContext,
    requirements: {
      tier?: string;
      features?: string[];
      permissions?: string[];
    },
  ): Promise<AuthorizationResult> {
    const { user } = context;
    const { tier, features = [], permissions = [] } = requirements;

    // Check tier requirement
    if (tier && !this.checkTierAccess(user.businessTier, tier)) {
      return {
        allowed: false,
        reason: `Insufficient tier access. Required: ${tier}, Current: ${user.businessTier}`,
        requiredTier: tier,
        upgradeRequired: true,
      };
    }

    // Check feature requirements
    const missingFeatures: string[] = [];
    for (const feature of features) {
      const hasFeature = await this.featureFlagService.hasFeature(
        user.tenantId,
        feature,
        {
          businessTier: user.businessTier,
          businessMetrics: {}, // Would be populated from tenant context
          userId: user.id,
          userRoles: [user.role],
        }
      );

      if (!hasFeature) {
        missingFeatures.push(feature);
      }
    }

    if (missingFeatures.length > 0) {
      return {
        allowed: false,
        reason: `Missing required features: ${missingFeatures.join(', ')}`,
        missingFeatures,
        upgradeRequired: true,
      };
    }

    // Check permission requirements
    if (permissions.length > 0) {
      const userPermissions = await this.permissionsService.getUserPermissions(
        user.id,
        user.tenantId,
      );

      const missingPermissions = permissions.filter(
        permission => !this.permissionsService.hasPermission(userPermissions, permission)
      );

      if (missingPermissions.length > 0) {
        return {
          allowed: false,
          reason: `Missing required permissions: ${missingPermissions.join(', ')}`,
          missingPermissions,
          upgradeRequired: false, // Permissions are role-based, not tier-based
        };
      }
    }

    return {
      allowed: true,
    };
  }

  /**
   * Check if user can access a specific feature
   */
  async canAccessFeature(
    user: AuthenticatedUser,
    featureName: string,
  ): Promise<boolean> {
    return this.featureFlagService.hasFeature(
      user.tenantId,
      featureName,
      {
        businessTier: user.businessTier,
        businessMetrics: {}, // Would be populated from tenant context
        userId: user.id,
        userRoles: [user.role],
      }
    );
  }

  /**
   * Get all available features for a user
   */
  async getUserAvailableFeatures(user: AuthenticatedUser): Promise<{
    available: string[];
    unavailable: string[];
    upgradeRequired: string[];
  }> {
    const featureDefinitions = this.featureFlagService.getFeatureDefinitions();
    const available: string[] = [];
    const unavailable: string[] = [];
    const upgradeRequired: string[] = [];

    for (const [featureName, definition] of Object.entries(featureDefinitions)) {
      const hasAccess = await this.canAccessFeature(user, featureName);
      
      if (hasAccess) {
        available.push(featureName);
      } else if (this.checkTierAccess(user.businessTier, definition.requiredTier)) {
        unavailable.push(featureName);
      } else {
        upgradeRequired.push(featureName);
      }
    }

    return { available, unavailable, upgradeRequired };
  }

  /**
   * Get upgrade recommendations for a user
   */
  async getUpgradeRecommendations(user: AuthenticatedUser): Promise<{
    recommendedTier: string;
    additionalFeatures: string[];
    estimatedBenefit: string;
  }> {
    const currentTier = user.businessTier;
    const nextTier = this.getNextTier(currentTier);
    
    // Get features that would be unlocked with upgrade
    const featureDefinitions = this.featureFlagService.getFeatureDefinitions();
    const additionalFeatures = Object.entries(featureDefinitions)
      .filter(([_, definition]) => 
        this.checkTierAccess(nextTier, definition.requiredTier) &&
        !this.checkTierAccess(currentTier, definition.requiredTier)
      )
      .map(([featureName, _]) => featureName);

    return {
      recommendedTier: nextTier,
      additionalFeatures,
      estimatedBenefit: this.calculateEstimatedBenefit(additionalFeatures),
    };
  }

  /**
   * Check if current tier meets required tier
   */
  private checkTierAccess(currentTier: string, requiredTier: string): boolean {
    const tierOrder = ['micro', 'small', 'medium', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    
    if (currentIndex === -1 || requiredIndex === -1) {
      return false;
    }
    
    return currentIndex >= requiredIndex;
  }

  /**
   * Get the next tier in progression
   */
  private getNextTier(currentTier: string): string {
    const tierProgression = {
      micro: 'small',
      small: 'medium',
      medium: 'enterprise',
      enterprise: 'enterprise',
    };
    
    return tierProgression[currentTier as keyof typeof tierProgression] || 'small';
  }

  /**
   * Calculate estimated benefit of additional features
   */
  private calculateEstimatedBenefit(features: string[]): string {
    if (features.length === 0) {
      return 'No additional features available';
    }

    const benefitMap: Record<string, string> = {
      advanced_reporting: 'Better business insights',
      multi_location: 'Manage multiple locations',
      api_access: 'Custom integrations',
      advanced_analytics: 'Detailed performance metrics',
      custom_fields: 'Tailored data collection',
    };

    const benefits = features
      .map(feature => benefitMap[feature])
      .filter(Boolean)
      .slice(0, 3); // Top 3 benefits

    return benefits.length > 0 
      ? benefits.join(', ') 
      : `${features.length} additional features`;
  }
}