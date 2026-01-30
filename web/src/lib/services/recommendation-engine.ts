import { BusinessTier, BusinessType, OnboardingData, TierRecommendation } from '@/types/onboarding';

interface BusinessMetrics {
  employeeCount: number;
  locationCount: number;
  monthlyTransactions: number;
  monthlyRevenue: number;
  businessType: BusinessType;
  industry?: string;
}

/**
 * AI-powered tier recommendation engine
 * Analyzes business profile data to suggest the most suitable tier
 */
export class RecommendationEngine {
  /**
   * Calculate tier recommendation based on business profile
   */
  static calculateRecommendation(onboardingData: OnboardingData): TierRecommendation {
    const metrics = this.extractMetrics(onboardingData);
    
    // Calculate scores for each tier
    const tierScores = {
      [BusinessTier.MICRO]: this.calculateMicroScore(metrics),
      [BusinessTier.SMALL]: this.calculateSmallScore(metrics),
      [BusinessTier.MEDIUM]: this.calculateMediumScore(metrics),
      [BusinessTier.ENTERPRISE]: this.calculateEnterpriseScore(metrics),
    };

    // Find the tier with the highest score
    const recommendedTier = Object.entries(tierScores).reduce((best, [tier, score]) => 
      score > best.score ? { tier: tier as BusinessTier, score } : best,
      { tier: BusinessTier.MICRO, score: 0 }
    ).tier;

    const confidence = Math.min(tierScores[recommendedTier] * 100, 95); // Cap at 95%
    
    return {
      recommendedTier,
      confidence,
      reasoning: this.generateReasoning(recommendedTier, metrics),
      alternatives: this.generateAlternatives(recommendedTier, tierScores),
    };
  }

  /**
   * Extract business metrics from onboarding data
   */
  private static extractMetrics(data: OnboardingData): BusinessMetrics {
    const metrics: BusinessMetrics = {
      employeeCount: data.expectedEmployees || 1,
      locationCount: data.expectedLocations || 1,
      monthlyTransactions: data.expectedMonthlyTransactions || 10,
      monthlyRevenue: data.expectedMonthlyRevenue || 1000,
      businessType: data.businessType || BusinessType.FREE,
    };

    if (data.businessIndustry) {
      metrics.industry = data.businessIndustry;
    }

    return metrics;
  }

  /**
   * Calculate score for MICRO tier (0-1)
   */
  private static calculateMicroScore(metrics: BusinessMetrics): number {
    let score = 0.8; // Base score for micro businesses

    // Penalize if metrics exceed micro tier limits
    if (metrics.employeeCount > 5) score -= 0.3;
    if (metrics.locationCount > 1) score -= 0.2;
    if (metrics.monthlyTransactions > 100) score -= 0.3;
    if (metrics.monthlyRevenue > 5000) score -= 0.2;

    // Bonus for very small businesses
    if (metrics.employeeCount <= 2 && metrics.monthlyRevenue <= 1000) score += 0.2;

    return Math.max(0, score);
  }

  /**
   * Calculate score for SMALL tier (0-1)
   */
  private static calculateSmallScore(metrics: BusinessMetrics): number {
    let score = 0.6; // Base score

    // Ideal range bonuses
    if (metrics.employeeCount >= 3 && metrics.employeeCount <= 25) score += 0.3;
    if (metrics.locationCount >= 1 && metrics.locationCount <= 3) score += 0.2;
    if (metrics.monthlyTransactions >= 50 && metrics.monthlyTransactions <= 1000) score += 0.3;
    if (metrics.monthlyRevenue >= 2000 && metrics.monthlyRevenue <= 25000) score += 0.2;

    // Business type bonuses
    if (metrics.businessType === BusinessType.RETAIL || 
        metrics.businessType === BusinessType.RENEWABLES) score += 0.1;

    // Penalties for being too small or too large
    if (metrics.employeeCount <= 1 && metrics.monthlyRevenue <= 1000) score -= 0.4;
    if (metrics.employeeCount > 25 || metrics.monthlyRevenue > 50000) score -= 0.3;

    return Math.max(0, score);
  }

  /**
   * Calculate score for MEDIUM tier (0-1)
   */
  private static calculateMediumScore(metrics: BusinessMetrics): number {
    let score = 0.5; // Base score

    // Ideal range bonuses
    if (metrics.employeeCount >= 15 && metrics.employeeCount <= 100) score += 0.4;
    if (metrics.locationCount >= 2 && metrics.locationCount <= 10) score += 0.3;
    if (metrics.monthlyTransactions >= 500 && metrics.monthlyTransactions <= 10000) score += 0.3;
    if (metrics.monthlyRevenue >= 15000 && metrics.monthlyRevenue <= 100000) score += 0.3;

    // Business type bonuses
    if (metrics.businessType === BusinessType.WHOLESALE || 
        metrics.businessType === BusinessType.INDUSTRY) score += 0.2;

    // Penalties for being too small
    if (metrics.employeeCount < 10 && metrics.monthlyRevenue < 10000) score -= 0.3;

    return Math.max(0, score);
  }

  /**
   * Calculate score for ENTERPRISE tier (0-1)
   */
  private static calculateEnterpriseScore(metrics: BusinessMetrics): number {
    let score = 0.3; // Base score

    // Large business bonuses
    if (metrics.employeeCount >= 50) score += 0.4;
    if (metrics.locationCount >= 5) score += 0.3;
    if (metrics.monthlyTransactions >= 5000) score += 0.4;
    if (metrics.monthlyRevenue >= 75000) score += 0.4;

    // Business type bonuses
    if (metrics.businessType === BusinessType.INDUSTRY) score += 0.3;

    // Industry-specific bonuses
    if (metrics.industry?.toLowerCase().includes('manufacturing') ||
        metrics.industry?.toLowerCase().includes('enterprise') ||
        metrics.industry?.toLowerCase().includes('corporation')) score += 0.2;

    // Penalties for being too small
    if (metrics.employeeCount < 25 && metrics.monthlyRevenue < 25000) score -= 0.4;

    return Math.max(0, score);
  }

  /**
   * Generate human-readable reasoning for the recommendation
   */
  private static generateReasoning(tier: BusinessTier, metrics: BusinessMetrics): string[] {
    const reasoning: string[] = [];

    switch (tier) {
      case BusinessTier.MICRO:
        reasoning.push("Perfect for getting started with essential features");
        if (metrics.employeeCount <= 5) reasoning.push("Team size fits within the free tier limits");
        if (metrics.monthlyRevenue <= 5000) reasoning.push("Revenue level is ideal for the free plan");
        reasoning.push("No upfront costs while you establish your business");
        break;

      case BusinessTier.SMALL:
        reasoning.push("Ideal for growing businesses that need advanced features");
        if (metrics.employeeCount > 5) reasoning.push("Team size requires more user seats");
        if (metrics.monthlyTransactions > 100) reasoning.push("Transaction volume exceeds free tier limits");
        reasoning.push("Includes analytics and API access for business growth");
        if (metrics.businessType === BusinessType.RETAIL) reasoning.push("Retail-specific features included");
        break;

      case BusinessTier.MEDIUM:
        reasoning.push("Comprehensive solution for established businesses");
        if (metrics.employeeCount >= 15) reasoning.push("Team size benefits from advanced collaboration features");
        if (metrics.locationCount > 3) reasoning.push("Multi-location management capabilities included");
        reasoning.push("Advanced inventory and CRM features for business optimization");
        if (metrics.monthlyRevenue >= 25000) reasoning.push("Revenue level justifies investment in business tools");
        break;

      case BusinessTier.ENTERPRISE:
        reasoning.push("Enterprise-grade solution for large organizations");
        if (metrics.employeeCount >= 50) reasoning.push("Large team requires unlimited user access");
        if (metrics.locationCount >= 5) reasoning.push("Multi-location operations need enterprise features");
        reasoning.push("Custom integrations and dedicated support included");
        if (metrics.businessType === BusinessType.INDUSTRY) reasoning.push("Industry-specific compliance tools available");
        break;
    }

    return reasoning;
  }

  /**
   * Generate alternative tier suggestions
   */
  private static generateAlternatives(
    recommendedTier: BusinessTier, 
    tierScores: Record<BusinessTier, number>
  ): TierRecommendation['alternatives'] {
    const alternatives: TierRecommendation['alternatives'] = [];
    
    // Sort tiers by score, excluding the recommended one
    const sortedTiers = Object.entries(tierScores)
      .filter(([tier]) => tier !== recommendedTier)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2); // Top 2 alternatives

    for (const [tier, score] of sortedTiers) {
      if (score > 0.3) { // Only suggest if reasonably viable
        const businessTier = tier as BusinessTier;
        let reason = '';
        let savings = undefined;

        switch (businessTier) {
          case BusinessTier.MICRO:
            reason = 'Start free and upgrade as you grow';
            savings = this.calculateSavings(recommendedTier, businessTier);
            break;
          case BusinessTier.SMALL:
            if (recommendedTier === BusinessTier.MEDIUM || recommendedTier === BusinessTier.ENTERPRISE) {
              reason = 'More cost-effective for your current size';
              savings = this.calculateSavings(recommendedTier, businessTier);
            } else {
              reason = 'Access to growth features when ready';
            }
            break;
          case BusinessTier.MEDIUM:
            if (recommendedTier === BusinessTier.ENTERPRISE) {
              reason = 'Sufficient features at lower cost';
              savings = this.calculateSavings(recommendedTier, businessTier);
            } else {
              reason = 'Advanced features for scaling business';
            }
            break;
          case BusinessTier.ENTERPRISE:
            reason = 'Future-proof solution with unlimited scalability';
            break;
        }

        alternatives.push({
          tier: businessTier,
          reason,
          ...(savings !== undefined && { savings }),
        });
      }
    }

    return alternatives;
  }

  /**
   * Calculate potential monthly savings between tiers
   */
  private static calculateSavings(fromTier: BusinessTier, toTier: BusinessTier): number | undefined {
    const prices = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 49,
      [BusinessTier.MEDIUM]: 99,
      [BusinessTier.ENTERPRISE]: 199,
    };

    const savings = prices[fromTier] - prices[toTier];
    return savings > 0 ? savings : undefined;
  }

  /**
   * Get fallback recommendation for users without onboarding data
   */
  static getFallbackRecommendation(): TierRecommendation {
    return {
      recommendedTier: BusinessTier.SMALL,
      confidence: 75,
      reasoning: [
        "Most popular choice for growing businesses",
        "Includes essential features for business management",
        "30-day free trial to test all features",
        "Easy to upgrade or downgrade as needed"
      ],
      alternatives: [
        {
          tier: BusinessTier.MICRO,
          reason: "Start free if you're just getting started",
          savings: 49
        },
        {
          tier: BusinessTier.MEDIUM,
          reason: "More advanced features for established businesses"
        }
      ]
    };
  }
}