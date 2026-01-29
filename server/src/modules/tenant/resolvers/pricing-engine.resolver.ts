import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, BadRequestException } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '../../auth/types/auth.types';
import { PricingEngineService } from '../services/pricing-engine.service';
import { BusinessProfileService } from '../services/business-profile.service';
import {
  TierRecommendationType,
  PriceCalculationType,
  TrialEligibilityType,
  TierPricingType,
  PricingComparisonType,
  TierRecommendationInput,
  UpgradePriceInput,
  TrialEligibilityInput,
} from '../types/pricing.types';
import { BusinessTier } from '../entities/tenant.entity';

/**
 * GraphQL resolver for pricing engine operations
 */
@Resolver()
@UseGuards(GraphQLJwtAuthGuard)
export class PricingEngineResolver {
  constructor(
    private readonly pricingEngineService: PricingEngineService,
    private readonly businessProfileService: BusinessProfileService,
  ) {}

  /**
   * Get tier recommendation based on business profile
   */
  @Query(() => TierRecommendationType, {
    description: 'Get AI-powered tier recommendation based on business profile',
  })
  async getTierRecommendation(
    @Args('input') input: TierRecommendationInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TierRecommendationType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    // Get business profile
    const businessProfile = await this.businessProfileService.getBusinessProfile(input.tenantId);
    
    if (!businessProfile) {
      throw new BadRequestException('Business profile not found. Please complete onboarding first.');
    }

    // Calculate recommendation
    return await this.pricingEngineService.calculateRecommendation(businessProfile);
  }

  /**
   * Calculate upgrade price from current tier to target tier
   */
  @Query(() => PriceCalculationType, {
    description: 'Calculate upgrade price with proration',
  })
  async calculateUpgradePrice(
    @Args('input') input: UpgradePriceInput,
    @CurrentUser() user: AuthUser,
  ): Promise<PriceCalculationType> {
    return await this.pricingEngineService.calculateUpgradePrice(
      input.currentTier,
      input.targetTier,
      input.billingCycle,
      input.currentBillingDate,
    );
  }

  /**
   * Check trial eligibility for a tier
   */
  @Query(() => TrialEligibilityType, {
    description: 'Check if user is eligible for a trial',
  })
  async checkTrialEligibility(
    @Args('input') input: TrialEligibilityInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TrialEligibilityType> {
    return await this.pricingEngineService.calculateTrialEligibility(
      input.tier,
      input.hasUsedTrial,
      input.currentTier,
    );
  }

  /**
   * Get all tier pricing options
   */
  @Query(() => [TierPricingType], {
    description: 'Get all available tier pricing options',
  })
  async getAllTierPricing(): Promise<TierPricingType[]> {
    const tierOptions = this.pricingEngineService.getAllTierOptions();
    
    return tierOptions.map(({ tier, pricing, level }) => ({
      tier,
      monthlyPrice: pricing.monthlyPrice,
      yearlyPrice: pricing.yearlyPrice,
      features: pricing.features,
      trialDays: pricing.trialDays,
      description: pricing.description,
      level,
      yearlySavings: this.pricingEngineService.calculateYearlySavings(tier),
    }));
  }

  /**
   * Get pricing comparison with personalized recommendation
   */
  @Query(() => PricingComparisonType, {
    description: 'Get pricing comparison with personalized recommendation if available',
  })
  async getPricingComparison(
    @Args('tenantId', { nullable: true }) tenantId?: string,
    @CurrentUser() user?: AuthUser,
  ): Promise<PricingComparisonType> {
    // Get all tier pricing
    const tiers = await this.getAllTierPricing();

    // Get personalized recommendation if tenant ID is provided
    let recommendation: TierRecommendationType | undefined;
    let currentTier: BusinessTier | undefined;

    if (tenantId && user) {
      // Verify user has access to the tenant
      if (user.tenantId === tenantId) {
        try {
          const businessProfile = await this.businessProfileService.getBusinessProfile(tenantId);
          if (businessProfile) {
            recommendation = await this.pricingEngineService.calculateRecommendation(businessProfile);
          }
          currentTier = user.businessTier as BusinessTier;
        } catch (error) {
          // Ignore errors for recommendation - just return pricing without it
        }
      }
    }

    const comparison: PricingComparisonType = {
      tiers,
    };

    if (recommendation !== undefined) {
      comparison.recommendation = recommendation;
    }

    if (currentTier !== undefined) {
      comparison.currentTier = currentTier;
    }

    return comparison;
  }

  /**
   * Get pricing for a specific tier
   */
  @Query(() => TierPricingType, {
    description: 'Get pricing information for a specific tier',
  })
  async getTierPricing(
    @Args('tier', { type: () => BusinessTier }) tier: BusinessTier,
  ): Promise<TierPricingType> {
    const tierOptions = this.pricingEngineService.getAllTierOptions();
    const tierOption = tierOptions.find(option => option.tier === tier);
    
    if (!tierOption) {
      throw new BadRequestException(`Invalid tier: ${tier}`);
    }

    return {
      tier: tierOption.tier,
      monthlyPrice: tierOption.pricing.monthlyPrice,
      yearlyPrice: tierOption.pricing.yearlyPrice,
      features: tierOption.pricing.features,
      trialDays: tierOption.pricing.trialDays,
      description: tierOption.pricing.description,
      level: tierOption.level,
      yearlySavings: this.pricingEngineService.calculateYearlySavings(tier),
    };
  }

  /**
   * Calculate yearly savings for a tier
   */
  @Query(() => Number, {
    description: 'Calculate yearly savings compared to monthly billing',
  })
  async calculateYearlySavings(
    @Args('tier', { type: () => BusinessTier }) tier: BusinessTier,
  ): Promise<number> {
    return this.pricingEngineService.calculateYearlySavings(tier);
  }
}