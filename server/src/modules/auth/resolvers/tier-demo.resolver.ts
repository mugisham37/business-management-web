import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { TierAuthorizationService } from '../services/tier-authorization.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { TierAuthGuard } from '../guards/tier-auth.guard';
import { TierAuth, PremiumAndAbove, EnterpriseOnly } from '../decorators/tier-auth.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Tier Demo Resolver
 * 
 * Provides demonstration endpoints for tier-based access control.
 * Used for testing and showcasing different subscription tier features.
 * 
 * Features:
 * - Basic tier demonstration
 * - Premium tier features
 * - Enterprise tier capabilities
 * - Tier upgrade simulation
 * - Feature flag testing
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class TierDemoResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly tierAuthService: TierAuthorizationService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Basic tier feature - available to all authenticated users
   */
  @Query(() => String, {
    description: 'Basic tier feature available to all users',
  })
  async basicFeature(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    return `Hello ${user.displayName}! This is a basic feature available to all users.`;
  }

  /**
   * Premium tier feature - requires premium or higher
   */
  @Query(() => String, {
    description: 'Premium tier feature',
  })
  @UseGuards(TierAuthGuard)
  @PremiumAndAbove()
  async premiumFeature(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    return `Welcome to premium features, ${user.displayName}! You have access to advanced analytics and reporting.`;
  }

  /**
   * Enterprise tier feature - requires enterprise tier
   */
  @Query(() => String, {
    description: 'Enterprise tier feature',
  })
  @UseGuards(TierAuthGuard)
  @EnterpriseOnly()
  async enterpriseFeature(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    return `Enterprise features activated for ${user.displayName}! You have access to advanced security and compliance tools.`;
  }

  /**
   * Custom tier requirement demonstration
   */
  @Query(() => String, {
    description: 'Custom tier requirement demo',
  })
  @UseGuards(TierAuthGuard)
  @TierAuth('standard')
  async standardFeature(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    return `Standard tier feature for ${user.displayName}! You can access custom dashboards and integrations.`;
  }

  /**
   * Get user's current tier information
   */
  @Query(() => String, {
    description: 'Get current user tier information',
  })
  async myTierInfo(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      const tierInfo = await this.tierAuthService.getTenantTierInfo(user.tenantId);
      
      return JSON.stringify({
        currentTier: tierInfo.tier,
        features: tierInfo.features,
        limits: tierInfo.limits,
        expiresAt: tierInfo.expiresAt,
        isActive: tierInfo.isActive,
      });
    } catch (error: any) {
      return JSON.stringify({
        currentTier: 'free',
        features: ['basic_reporting', 'email_support'],
        limits: { users: 5, storage: '1GB' },
        isActive: true,
      });
    }
  }

  /**
   * Simulate tier upgrade
   */
  @Mutation(() => String, {
    description: 'Simulate tier upgrade (demo only)',
  })
  async simulateTierUpgrade(
    @Args('targetTier') targetTier: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    const validTiers = ['free', 'basic', 'standard', 'premium', 'enterprise'];
    
    if (!validTiers.includes(targetTier)) {
      throw new Error(`Invalid tier: ${targetTier}. Valid tiers: ${validTiers.join(', ')}`);
    }

    // In a real implementation, this would update the database
    // For demo purposes, we just return a success message
    return `Tier upgrade simulation: ${user.displayName} upgraded to ${targetTier} tier. (This is a demo - no actual changes made)`;
  }

  /**
   * Get available tier upgrade options
   */
  @Query(() => String, {
    description: 'Get available tier upgrade options',
  })
  async getUpgradeOptions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      const currentTier = await this.tierAuthService.getTenantTier(user.tenantId);
      
      const tierHierarchy = ['free', 'basic', 'standard', 'premium', 'enterprise'];
      const currentIndex = tierHierarchy.indexOf(currentTier);
      const availableUpgrades = tierHierarchy.slice(currentIndex + 1);

      const upgradeOptions = availableUpgrades.map(tier => ({
        tier,
        features: this.getTierFeatures(tier),
        pricing: this.getTierPricing(tier),
      }));

      return JSON.stringify({
        currentTier,
        availableUpgrades: upgradeOptions,
      });
    } catch (error: any) {
      return JSON.stringify({
        currentTier: 'free',
        availableUpgrades: [
          {
            tier: 'basic',
            features: ['Advanced reporting', 'Up to 25 users', 'Priority support'],
            pricing: { monthly: 29, yearly: 290 },
          },
          {
            tier: 'premium',
            features: ['Unlimited users', 'Advanced analytics', '24/7 support'],
            pricing: { monthly: 149, yearly: 1490 },
          },
        ],
      });
    }
  }

  /**
   * Test feature flag access
   */
  @Query(() => String, {
    description: 'Test feature flag access',
  })
  async testFeatureFlag(
    @Args('featureName') featureName: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      const hasAccess = await this.tierAuthService.checkFeatureAccess(
        user.tenantId,
        featureName,
      );

      return JSON.stringify({
        feature: featureName,
        hasAccess,
        userTier: await this.tierAuthService.getTenantTier(user.tenantId),
        message: hasAccess 
          ? `Access granted to feature: ${featureName}`
          : `Access denied to feature: ${featureName}. Upgrade required.`,
      });
    } catch (error: any) {
      return JSON.stringify({
        feature: featureName,
        hasAccess: false,
        error: error.message,
      });
    }
  }

  /**
   * Get tier features for a specific tier
   */
  private getTierFeatures(tier: string): string[] {
    const features = {
      free: ['Basic reporting', 'Up to 5 users', 'Email support'],
      basic: ['Advanced reporting', 'Up to 25 users', 'Priority support', 'API access'],
      standard: ['Custom dashboards', 'Up to 100 users', 'Phone support', 'Integrations'],
      premium: ['Advanced analytics', 'Unlimited users', '24/7 support', 'Custom integrations'],
      enterprise: ['Enterprise SSO', 'Advanced security', 'Dedicated support', 'Custom development'],
    };

    return features[tier as keyof typeof features] || [];
  }

  /**
   * Get tier pricing information
   */
  private getTierPricing(tier: string): { monthly: number; yearly: number } {
    const pricing = {
      free: { monthly: 0, yearly: 0 },
      basic: { monthly: 29, yearly: 290 },
      standard: { monthly: 79, yearly: 790 },
      premium: { monthly: 149, yearly: 1490 },
      enterprise: { monthly: 299, yearly: 2990 },
    };

    return pricing[tier as keyof typeof pricing] || { monthly: 0, yearly: 0 };
  }
}