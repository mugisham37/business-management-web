import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { 
  RequireTier, 
  RequireFeature, 
  RequireSmallTier, 
  RequireMediumTier, 
  RequireEnterpriseTier,
  RequireAdvancedReporting,
  RequireMultiLocation,
} from '../decorators/tier-auth.decorator';
import { TierAuthorizationService } from '../services/tier-authorization.service';

/**
 * Demo resolver to showcase tier-based authorization
 * This demonstrates various authorization patterns
 */
@Resolver()
export class TierDemoResolver {
  constructor(
    private readonly tierAuthService: TierAuthorizationService,
  ) {}

  /**
   * Basic authenticated endpoint - available to all tiers
   */
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async basicFeature(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Hello ${user.email}, you have access to basic features!`;
  }

  /**
   * Small tier or higher required
   */
  @Query(() => String)
  @RequireSmallTier()
  async smallTierFeature(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Advanced feature available for ${user.businessTier} tier users!`;
  }

  /**
   * Medium tier or higher required
   */
  @Query(() => String)
  @RequireMediumTier()
  async mediumTierFeature(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Premium feature for ${user.businessTier} tier users!`;
  }

  /**
   * Enterprise tier required
   */
  @Query(() => String)
  @RequireEnterpriseTier()
  async enterpriseFeature(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Enterprise-only feature for ${user.businessTier} tier users!`;
  }

  /**
   * Specific feature requirement
   */
  @Query(() => String)
  @RequireAdvancedReporting()
  async advancedReports(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Advanced reporting data for ${user.email}`;
  }

  /**
   * Multi-location feature requirement
   */
  @Query(() => String)
  @RequireMultiLocation()
  async multiLocationData(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Multi-location management data for ${user.email}`;
  }

  /**
   * Custom tier and feature combination
   */
  @Query(() => String)
  @RequireTier('medium')
  @RequireFeature('advanced_analytics', 'custom_fields')
  async customAnalytics(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    return `Custom analytics with advanced features for ${user.email}`;
  }

  /**
   * Get user's available features
   */
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async getUserFeatures(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    const features = await this.tierAuthService.getUserAvailableFeatures(user);
    
    return JSON.stringify({
      tier: user.businessTier,
      available: features.available,
      upgradeRequired: features.upgradeRequired,
    }, null, 2);
  }

  /**
   * Get upgrade recommendations
   */
  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  async getUpgradeRecommendations(@CurrentUser() user: AuthenticatedUser): Promise<string> {
    const recommendations = await this.tierAuthService.getUpgradeRecommendations(user);
    
    return JSON.stringify(recommendations, null, 2);
  }
}