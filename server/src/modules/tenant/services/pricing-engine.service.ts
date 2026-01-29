import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CustomLoggerService } from '../../logger/logger.service';
import { BusinessProfile, IndustryType, BusinessSize, BusinessType, RevenueRange, TransactionVolumeRange } from '../entities/business-profile.entity';
import { BusinessTier } from '../entities/tenant.entity';
import { BusinessMetricsService, BusinessMetrics } from './business-metrics.service';

/**
 * Tier recommendation result
 */
export interface TierRecommendation {
  recommendedTier: BusinessTier;
  confidence: number;
  reasoning: string[];
  alternatives: Array<{
    tier: BusinessTier;
    reason: string;
    savings?: number;
  }>;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
}

/**
 * Price calculation result
 */
export interface PriceCalculation {
  originalPrice: number;
  finalPrice: number;
  discount?: number;
  prorationAmount?: number;
  effectiveDate: Date;
  nextBillingDate: Date;
}

/**
 * Trial eligibility result
 */
export interface TrialEligibility {
  isEligible: boolean;
  trialDays: number;
  reason?: string;
  restrictions?: string[];
}

/**
 * Pricing configuration for each tier
 */
interface TierPricing {
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  trialDays: number;
  description: string;
}

/**
 * AI-powered pricing engine for tier recommendations and pricing calculations
 */
@Injectable()
export class PricingEngineService {
  private readonly tierPricing: Record<BusinessTier, TierPricing> = {
    [BusinessTier.MICRO]: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        'Basic POS System',
        'Inventory Management (up to 100 products)',
        'Basic Reports',
        'Single Location',
        'Up to 5 Employees',
        'Email Support',
      ],
      trialDays: 0,
      description: 'Perfect for solo entrepreneurs and micro-businesses',
    },
    [BusinessTier.SMALL]: {
      monthlyPrice: 4900, // $49.00
      yearlyPrice: 49000, // $490.00 (2 months free)
      features: [
        'Advanced POS System',
        'Inventory Management (up to 1,000 products)',
        'CRM & Customer Management',
        'Employee Management (up to 25)',
        'Advanced Reports & Analytics',
        'Multi-payment Methods',
        'Email & Chat Support',
      ],
      trialDays: 30,
      description: 'Ideal for small businesses with growing needs',
    },
    [BusinessTier.MEDIUM]: {
      monthlyPrice: 14900, // $149.00
      yearlyPrice: 149000, // $1,490.00 (2 months free)
      features: [
        'Multi-location Support (up to 20)',
        'B2B Features & Wholesale',
        'Advanced Analytics & Insights',
        'API Access & Integrations',
        'Employee Management (up to 100)',
        'Custom Reports',
        'Priority Support',
        'Inventory Optimization',
      ],
      trialDays: 30,
      description: 'Comprehensive solution for medium-sized businesses',
    },
    [BusinessTier.ENTERPRISE]: {
      monthlyPrice: 39900, // $399.00
      yearlyPrice: 399000, // $3,990.00 (2 months free)
      features: [
        'Unlimited Locations & Employees',
        'Custom Integrations & API',
        'Advanced Analytics & BI',
        'White-label Solutions',
        'Dedicated Account Manager',
        'Custom Training & Onboarding',
        '24/7 Priority Support',
        'Advanced Security & Compliance',
        'Custom Feature Development',
      ],
      trialDays: 30,
      description: 'Enterprise-grade platform for large organizations',
    },
  };

  constructor(
    private readonly businessMetricsService: BusinessMetricsService,
    private readonly logger: CustomLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext('PricingEngineService');
  }

  /**
   * Calculate tier recommendation based on business profile
   */
  async calculateRecommendation(profile: BusinessProfile): Promise<TierRecommendation> {
    this.logger.log(`Calculating tier recommendation for business: ${profile.businessName}`);

    const analysis = this.analyzeBusinessProfile(profile);
    const recommendedTier = this.determineTierFromAnalysis(analysis);
    const confidence = this.calculateConfidence(analysis, recommendedTier);
    const reasoning = this.generateReasoning(analysis, recommendedTier);
    const alternatives = this.generateAlternatives(recommendedTier, analysis);

    const pricing = this.tierPricing[recommendedTier];

    const recommendation: TierRecommendation = {
      recommendedTier,
      confidence,
      reasoning,
      alternatives,
      monthlyPrice: pricing.monthlyPrice,
      yearlyPrice: pricing.yearlyPrice,
      features: pricing.features,
    };

    // Emit recommendation event
    this.eventEmitter.emit('pricing.recommendation.generated', {
      businessProfile: profile,
      recommendation,
      timestamp: new Date(),
    });

    this.logger.log(`Recommended tier ${recommendedTier} with ${Math.round(confidence * 100)}% confidence`);

    return recommendation;
  }

  /**
   * Calculate upgrade price from current tier to target tier
   */
  async calculateUpgradePrice(
    currentTier: BusinessTier,
    targetTier: BusinessTier,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    currentBillingDate?: Date,
  ): Promise<PriceCalculation> {
    const currentPricing = this.tierPricing[currentTier];
    const targetPricing = this.tierPricing[targetTier];

    const currentPrice = billingCycle === 'monthly' ? currentPricing.monthlyPrice : currentPricing.yearlyPrice;
    const targetPrice = billingCycle === 'monthly' ? targetPricing.monthlyPrice : targetPricing.yearlyPrice;

    const now = new Date();
    const effectiveDate = now;
    
    // Calculate next billing date
    const nextBillingDate = new Date(now);
    if (billingCycle === 'monthly') {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    // Calculate proration if current billing date is provided
    let prorationAmount = 0;
    if (currentBillingDate && currentPrice > 0) {
      const daysInPeriod = billingCycle === 'monthly' ? 30 : 365;
      const daysRemaining = Math.max(0, Math.ceil((currentBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const unusedAmount = (currentPrice * daysRemaining) / daysInPeriod;
      prorationAmount = Math.round(unusedAmount);
    }

    const finalPrice = Math.max(0, targetPrice - prorationAmount);

    return {
      originalPrice: targetPrice,
      finalPrice,
      prorationAmount,
      effectiveDate,
      nextBillingDate,
    };
  }

  /**
   * Calculate trial eligibility for a user
   */
  async calculateTrialEligibility(
    tier: BusinessTier,
    hasUsedTrial: boolean = false,
    currentTier?: BusinessTier,
  ): Promise<TrialEligibility> {
    const pricing = this.tierPricing[tier];

    // Free tier doesn't have trials
    if (tier === BusinessTier.MICRO) {
      return {
        isEligible: false,
        trialDays: 0,
        reason: 'Free tier does not require a trial',
      };
    }

    // Already used trial
    if (hasUsedTrial) {
      return {
        isEligible: false,
        trialDays: 0,
        reason: 'Trial already used for this tier',
      };
    }

    // Already on a higher tier
    if (currentTier && this.getTierLevel(currentTier) >= this.getTierLevel(tier)) {
      return {
        isEligible: false,
        trialDays: 0,
        reason: 'Already on this tier or higher',
      };
    }

    return {
      isEligible: true,
      trialDays: pricing.trialDays,
    };
  }

  /**
   * Get all tier options with pricing
   */
  getAllTierOptions(): Array<{
    tier: BusinessTier;
    pricing: TierPricing;
    level: number;
  }> {
    return Object.entries(this.tierPricing).map(([tier, pricing]) => ({
      tier: tier as BusinessTier,
      pricing,
      level: this.getTierLevel(tier as BusinessTier),
    })).sort((a, b) => a.level - b.level);
  }

  /**
   * Get pricing for a specific tier
   */
  getTierPricing(tier: BusinessTier): TierPricing {
    return this.tierPricing[tier];
  }

  /**
   * Calculate yearly savings for a tier
   */
  calculateYearlySavings(tier: BusinessTier): number {
    const pricing = this.tierPricing[tier];
    const monthlyTotal = pricing.monthlyPrice * 12;
    return monthlyTotal - pricing.yearlyPrice;
  }

  /**
   * Analyze business profile to extract key metrics
   */
  private analyzeBusinessProfile(profile: BusinessProfile): {
    employeeScore: number;
    locationScore: number;
    revenueScore: number;
    transactionScore: number;
    industryScore: number;
    businessTypeScore: number;
    totalScore: number;
  } {
    const employeeScore = this.calculateEmployeeScore(profile.expectedEmployees);
    const locationScore = this.calculateLocationScore(profile.expectedLocations);
    const revenueScore = this.calculateRevenueScore(profile.expectedRevenueRange);
    const transactionScore = this.calculateTransactionScore(profile.expectedTransactionVolumeRange);
    const industryScore = this.calculateIndustryScore(profile.industry);
    const businessTypeScore = this.calculateBusinessTypeScore(profile.businessType);

    const totalScore = employeeScore + locationScore + revenueScore + transactionScore + industryScore + businessTypeScore;

    return {
      employeeScore,
      locationScore,
      revenueScore,
      transactionScore,
      industryScore,
      businessTypeScore,
      totalScore,
    };
  }

  /**
   * Determine tier from analysis scores
   */
  private determineTierFromAnalysis(analysis: ReturnType<typeof this.analyzeBusinessProfile>): BusinessTier {
    const { totalScore } = analysis;

    if (totalScore <= 4) return BusinessTier.MICRO;
    if (totalScore <= 8) return BusinessTier.SMALL;
    if (totalScore <= 12) return BusinessTier.MEDIUM;
    return BusinessTier.ENTERPRISE;
  }

  /**
   * Calculate confidence score for recommendation
   */
  private calculateConfidence(
    analysis: ReturnType<typeof this.analyzeBusinessProfile>,
    recommendedTier: BusinessTier,
  ): number {
    const { totalScore } = analysis;
    const tierLevel = this.getTierLevel(recommendedTier);

    // Base confidence based on how well the score aligns with tier boundaries
    let baseConfidence = 0.7;

    // Adjust confidence based on score distribution
    const scoreVariance = this.calculateScoreVariance(analysis);
    if (scoreVariance < 1) {
      baseConfidence += 0.2; // High confidence when scores are consistent
    } else if (scoreVariance > 2) {
      baseConfidence -= 0.1; // Lower confidence when scores vary widely
    }

    // Adjust confidence based on tier boundaries
    const tierBoundaries = [0, 4, 8, 12, 16];
    const lowerBound = tierBoundaries[tierLevel] || 0;
    const upperBound = tierBoundaries[tierLevel + 1] || 16;
    
    const distanceFromBoundary = Math.min(
      Math.abs(totalScore - lowerBound),
      Math.abs(totalScore - upperBound),
    );

    if (distanceFromBoundary >= 2) {
      baseConfidence += 0.1; // Higher confidence when clearly in tier range
    }

    return Math.min(0.95, Math.max(0.5, baseConfidence));
  }

  /**
   * Generate reasoning for recommendation
   */
  private generateReasoning(
    analysis: ReturnType<typeof this.analyzeBusinessProfile>,
    recommendedTier: BusinessTier,
  ): string[] {
    const reasoning: string[] = [];

    // Employee-based reasoning
    if (analysis.employeeScore >= 3) {
      reasoning.push('Large team size requires advanced employee management features');
    } else if (analysis.employeeScore >= 2) {
      reasoning.push('Growing team size benefits from employee management tools');
    } else if (analysis.employeeScore <= 1) {
      reasoning.push('Small team size suitable for basic features');
    }

    // Location-based reasoning
    if (analysis.locationScore >= 2) {
      reasoning.push('Multiple locations require multi-location management capabilities');
    }

    // Revenue-based reasoning
    if (analysis.revenueScore >= 3) {
      reasoning.push('High revenue volume justifies advanced analytics and reporting');
    } else if (analysis.revenueScore >= 2) {
      reasoning.push('Moderate revenue supports investment in business growth tools');
    }

    // Transaction-based reasoning
    if (analysis.transactionScore >= 3) {
      reasoning.push('High transaction volume requires robust POS and inventory systems');
    }

    // Industry-specific reasoning
    if (analysis.industryScore >= 2) {
      reasoning.push('Industry requirements benefit from specialized features');
    }

    // Business type reasoning
    if (analysis.businessTypeScore >= 2) {
      reasoning.push('Business model complexity requires advanced functionality');
    }

    // Add tier-specific reasoning
    const tierPricing = this.tierPricing[recommendedTier];
    reasoning.push(`${tierPricing.description}`);

    return reasoning;
  }

  /**
   * Generate alternative tier suggestions
   */
  private generateAlternatives(
    recommendedTier: BusinessTier,
    analysis: ReturnType<typeof this.analyzeBusinessProfile>,
  ): Array<{ tier: BusinessTier; reason: string; savings?: number }> {
    const alternatives: Array<{ tier: BusinessTier; reason: string; savings?: number }> = [];
    const currentLevel = this.getTierLevel(recommendedTier);

    // Suggest lower tier if close to boundary
    if (currentLevel > 0 && analysis.totalScore <= (currentLevel * 4) + 1) {
      const lowerTier = this.getTierByLevel(currentLevel - 1);
      if (lowerTier) {
        const savings = this.tierPricing[recommendedTier].monthlyPrice - this.tierPricing[lowerTier].monthlyPrice;
        alternatives.push({
          tier: lowerTier,
          reason: 'Start with fewer features and upgrade as you grow',
          savings,
        });
      }
    }

    // Suggest higher tier if close to boundary
    if (currentLevel < 3 && analysis.totalScore >= (currentLevel * 4) + 3) {
      const higherTier = this.getTierByLevel(currentLevel + 1);
      if (higherTier) {
        alternatives.push({
          tier: higherTier,
          reason: 'Get advanced features for rapid business growth',
        });
      }
    }

    // Always suggest free tier as budget option (unless already recommended)
    if (recommendedTier !== BusinessTier.MICRO) {
      alternatives.push({
        tier: BusinessTier.MICRO,
        reason: 'Start free and upgrade when ready',
        savings: this.tierPricing[recommendedTier].monthlyPrice,
      });
    }

    return alternatives;
  }

  /**
   * Calculate employee score (0-4)
   */
  private calculateEmployeeScore(employeeCount: number): number {
    if (employeeCount <= 1) return 0;
    if (employeeCount <= 5) return 1;
    if (employeeCount <= 25) return 2;
    if (employeeCount <= 100) return 3;
    return 4;
  }

  /**
   * Calculate location score (0-2)
   */
  private calculateLocationScore(locationCount: number): number {
    if (locationCount <= 1) return 0;
    if (locationCount <= 5) return 1;
    return 2;
  }

  /**
   * Calculate revenue score (0-4)
   */
  private calculateRevenueScore(revenueRange: RevenueRange): number {
    const scores: Record<RevenueRange, number> = {
      [RevenueRange.UNDER_10K]: 0,
      [RevenueRange.FROM_10K_TO_50K]: 1,
      [RevenueRange.FROM_50K_TO_100K]: 1,
      [RevenueRange.FROM_100K_TO_500K]: 2,
      [RevenueRange.FROM_500K_TO_1M]: 2,
      [RevenueRange.FROM_1M_TO_5M]: 3,
      [RevenueRange.FROM_5M_TO_10M]: 3,
      [RevenueRange.OVER_10M]: 4,
    };
    return scores[revenueRange] || 0;
  }

  /**
   * Calculate transaction score (0-4)
   */
  private calculateTransactionScore(volumeRange: TransactionVolumeRange): number {
    const scores: Record<TransactionVolumeRange, number> = {
      [TransactionVolumeRange.UNDER_100]: 0,
      [TransactionVolumeRange.FROM_100_TO_500]: 1,
      [TransactionVolumeRange.FROM_500_TO_1K]: 1,
      [TransactionVolumeRange.FROM_1K_TO_5K]: 2,
      [TransactionVolumeRange.FROM_5K_TO_10K]: 2,
      [TransactionVolumeRange.FROM_10K_TO_50K]: 3,
      [TransactionVolumeRange.OVER_50K]: 4,
    };
    return scores[volumeRange] || 0;
  }

  /**
   * Calculate industry score (0-2)
   */
  private calculateIndustryScore(industry: IndustryType): number {
    // Industries that typically need more advanced features
    const complexIndustries = [
      IndustryType.MANUFACTURING,
      IndustryType.WHOLESALE,
      IndustryType.HEALTHCARE,
      IndustryType.FINANCE,
      IndustryType.CONSTRUCTION,
      IndustryType.ENERGY,
      IndustryType.RENEWABLES,
    ];

    if (complexIndustries.includes(industry)) return 2;
    if (industry === IndustryType.RETAIL) return 1;
    return 0;
  }

  /**
   * Calculate business type score (0-3)
   */
  private calculateBusinessTypeScore(businessType: BusinessType): number {
    const scores: Record<BusinessType, number> = {
      [BusinessType.FREE]: 0,
      [BusinessType.RENEWABLES]: 1,
      [BusinessType.RETAIL]: 1,
      [BusinessType.WHOLESALE]: 2,
      [BusinessType.INDUSTRY]: 3,
    };
    return scores[businessType] || 0;
  }

  /**
   * Calculate variance in analysis scores
   */
  private calculateScoreVariance(analysis: ReturnType<typeof this.analyzeBusinessProfile>): number {
    const scores = [
      analysis.employeeScore,
      analysis.locationScore,
      analysis.revenueScore,
      analysis.transactionScore,
      analysis.industryScore,
      analysis.businessTypeScore,
    ];

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Get tier level (0-3)
   */
  private getTierLevel(tier: BusinessTier): number {
    const levels: Record<BusinessTier, number> = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 1,
      [BusinessTier.MEDIUM]: 2,
      [BusinessTier.ENTERPRISE]: 3,
    };
    return levels[tier] || 0;
  }

  /**
   * Get tier by level
   */
  private getTierByLevel(level: number): BusinessTier | null {
    const tiers: BusinessTier[] = [
      BusinessTier.MICRO,
      BusinessTier.SMALL,
      BusinessTier.MEDIUM,
      BusinessTier.ENTERPRISE,
    ];
    return tiers[level] || null;
  }
}