/**
 * TierRecommendationService - Business profile assessment and tier recommendation
 */

import { BusinessTier, BusinessType, OnboardingData } from '@/hooks/useOnboarding';

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
    confidence: number;
  }>;
  costAnalysis: {
    recommendedCost: number;
    alternativeCosts: Array<{
      tier: BusinessTier;
      monthlyCost: number;
      annualCost: number;
      savings?: number;
    }>;
  };
}

/**
 * Business assessment criteria
 */
interface AssessmentCriteria {
  employees: number;
  locations: number;
  monthlyRevenue: number;
  monthlyTransactions: number;
  businessType: BusinessType;
  businessSize: string;
}

/**
 * Tier scoring weights
 */
interface TierScoring {
  [BusinessTier.MICRO]: number;
  [BusinessTier.SMALL]: number;
  [BusinessTier.MEDIUM]: number;
  [BusinessTier.ENTERPRISE]: number;
}

export class TierRecommendationService {
  private readonly tierLimits = {
    [BusinessTier.MICRO]: {
      employees: 5,
      locations: 1,
      transactions: 1000,
      revenue: 10000,
      price: { monthly: 0, annually: 0 },
    },
    [BusinessTier.SMALL]: {
      employees: 25,
      locations: 5,
      transactions: 10000,
      revenue: 100000,
      price: { monthly: 49, annually: 39 },
    },
    [BusinessTier.MEDIUM]: {
      employees: 100,
      locations: 20,
      transactions: 50000,
      revenue: 1000000,
      price: { monthly: 99, annually: 79 },
    },
    [BusinessTier.ENTERPRISE]: {
      employees: Infinity,
      locations: Infinity,
      transactions: Infinity,
      revenue: Infinity,
      price: { monthly: 299, annually: 249 },
    },
  };

  private readonly businessTypeWeights = {
    [BusinessType.FREE]: {
      [BusinessTier.MICRO]: 1.0,
      [BusinessTier.SMALL]: 0.3,
      [BusinessTier.MEDIUM]: 0.1,
      [BusinessTier.ENTERPRISE]: 0.0,
    },
    [BusinessType.RENEWABLES]: {
      [BusinessTier.MICRO]: 0.4,
      [BusinessTier.SMALL]: 1.0,
      [BusinessTier.MEDIUM]: 0.7,
      [BusinessTier.ENTERPRISE]: 0.3,
    },
    [BusinessType.RETAIL]: {
      [BusinessTier.MICRO]: 0.5,
      [BusinessTier.SMALL]: 1.0,
      [BusinessTier.MEDIUM]: 0.6,
      [BusinessTier.ENTERPRISE]: 0.2,
    },
    [BusinessType.WHOLESALE]: {
      [BusinessTier.MICRO]: 0.2,
      [BusinessTier.SMALL]: 0.6,
      [BusinessTier.MEDIUM]: 1.0,
      [BusinessTier.ENTERPRISE]: 0.8,
    },
    [BusinessType.INDUSTRY]: {
      [BusinessTier.MICRO]: 0.1,
      [BusinessTier.SMALL]: 0.3,
      [BusinessTier.MEDIUM]: 0.7,
      [BusinessTier.ENTERPRISE]: 1.0,
    },
  };

  /**
   * Calculate tier recommendation based on business profile
   */
  calculateRecommendation(data: OnboardingData): TierRecommendation {
    const criteria: AssessmentCriteria = {
      employees: data.expectedEmployees || 1,
      locations: data.expectedLocations || 1,
      monthlyRevenue: data.expectedMonthlyRevenue || 0,
      monthlyTransactions: data.expectedMonthlyTransactions || 0,
      businessType: data.businessType || BusinessType.RETAIL,
      businessSize: data.businessSize || 'small',
    };

    // Calculate scores for each tier
    const scores = this.calculateTierScores(criteria);
    
    // Find the best recommendation
    const recommendedTier = this.getBestTier(scores);
    const confidence = this.calculateConfidence(scores, recommendedTier);
    
    // Generate reasoning
    const reasoning = this.generateReasoning(criteria, recommendedTier);
    
    // Generate alternatives
    const alternatives = this.generateAlternatives(scores, recommendedTier);
    
    // Calculate cost analysis
    const costAnalysis = this.calculateCostAnalysis(recommendedTier);

    return {
      recommendedTier,
      confidence,
      reasoning,
      alternatives,
      costAnalysis,
    };
  }

  /**
   * Calculate scores for each tier based on criteria
   */
  private calculateTierScores(criteria: AssessmentCriteria): TierScoring {
    const scores: TierScoring = {
      [BusinessTier.MICRO]: 0,
      [BusinessTier.SMALL]: 0,
      [BusinessTier.MEDIUM]: 0,
      [BusinessTier.ENTERPRISE]: 0,
    };

    // Score based on scale metrics
    for (const tier of Object.values(BusinessTier)) {
      const limits = this.tierLimits[tier];
      let score = 0;

      // Employee count scoring
      if (criteria.employees <= limits.employees) {
        score += 0.3 * (1 - Math.abs(criteria.employees - limits.employees / 2) / limits.employees);
      } else {
        score -= 0.5; // Penalty for exceeding limits
      }

      // Location count scoring
      if (criteria.locations <= limits.locations) {
        score += 0.2 * (1 - Math.abs(criteria.locations - limits.locations / 2) / limits.locations);
      } else {
        score -= 0.3;
      }

      // Revenue scoring
      if (criteria.monthlyRevenue <= limits.revenue) {
        score += 0.25 * (criteria.monthlyRevenue / limits.revenue);
      } else {
        score -= 0.2;
      }

      // Transaction volume scoring
      if (criteria.monthlyTransactions <= limits.transactions) {
        score += 0.15 * (criteria.monthlyTransactions / limits.transactions);
      } else {
        score -= 0.1;
      }

      // Business type weighting
      const typeWeight = this.businessTypeWeights[criteria.businessType]?.[tier] || 0.5;
      score *= typeWeight;

      // Business size adjustment
      score *= this.getBusinessSizeMultiplier(criteria.businessSize, tier);

      scores[tier] = Math.max(0, score);
    }

    return scores;
  }

  /**
   * Get business size multiplier for tier scoring
   */
  private getBusinessSizeMultiplier(businessSize: string, tier: BusinessTier): number {
    const multipliers = {
      solo: {
        [BusinessTier.MICRO]: 1.2,
        [BusinessTier.SMALL]: 0.8,
        [BusinessTier.MEDIUM]: 0.4,
        [BusinessTier.ENTERPRISE]: 0.1,
      },
      small: {
        [BusinessTier.MICRO]: 0.9,
        [BusinessTier.SMALL]: 1.2,
        [BusinessTier.MEDIUM]: 0.8,
        [BusinessTier.ENTERPRISE]: 0.3,
      },
      medium: {
        [BusinessTier.MICRO]: 0.5,
        [BusinessTier.SMALL]: 0.9,
        [BusinessTier.MEDIUM]: 1.2,
        [BusinessTier.ENTERPRISE]: 0.7,
      },
      large: {
        [BusinessTier.MICRO]: 0.2,
        [BusinessTier.SMALL]: 0.6,
        [BusinessTier.MEDIUM]: 1.0,
        [BusinessTier.ENTERPRISE]: 1.1,
      },
      enterprise: {
        [BusinessTier.MICRO]: 0.1,
        [BusinessTier.SMALL]: 0.3,
        [BusinessTier.MEDIUM]: 0.7,
        [BusinessTier.ENTERPRISE]: 1.3,
      },
    };

    return multipliers[businessSize as keyof typeof multipliers]?.[tier] || 1.0;
  }

  /**
   * Get the best tier based on scores
   */
  private getBestTier(scores: TierScoring): BusinessTier {
    let bestTier = BusinessTier.MICRO;
    let bestScore = scores[BusinessTier.MICRO];

    for (const [tier, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestTier = tier as BusinessTier;
      }
    }

    return bestTier;
  }

  /**
   * Calculate confidence level for recommendation
   */
  private calculateConfidence(scores: TierScoring, recommendedTier: BusinessTier): number {
    const recommendedScore = scores[recommendedTier];
    const otherScores = Object.values(scores).filter(score => score !== recommendedScore);
    const maxOtherScore = Math.max(...otherScores);

    if (maxOtherScore === 0) return 1.0;

    const confidence = Math.min(1.0, recommendedScore / (recommendedScore + maxOtherScore));
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Generate reasoning for the recommendation
   */
  private generateReasoning(criteria: AssessmentCriteria, recommendedTier: BusinessTier): string[] {
    const reasoning: string[] = [];

    // Business type reasoning
    if (criteria.businessType === BusinessType.FREE) {
      reasoning.push('Free business type suggests starting with a cost-effective solution');
    } else if (criteria.businessType === BusinessType.INDUSTRY) {
      reasoning.push('Industrial operations typically require advanced enterprise features');
    } else if (criteria.businessType === BusinessType.WHOLESALE) {
      reasoning.push('Wholesale operations benefit from B2B-focused features');
    } else {
      reasoning.push('Retail and renewable businesses typically need growth-oriented features');
    }

    // Scale reasoning
    if (criteria.employees > 100 || criteria.locations > 10) {
      reasoning.push('Large scale operations require enterprise-level capabilities');
    } else if (criteria.employees > 25 || criteria.locations > 3) {
      reasoning.push('Medium-scale operations benefit from advanced business features');
    } else if (criteria.employees <= 5 && criteria.locations <= 1) {
      reasoning.push('Small operations can start with basic features and scale up');
    }

    // Revenue reasoning
    if (criteria.monthlyRevenue > 1000000) {
      reasoning.push('High revenue volume requires enterprise-grade financial management');
    } else if (criteria.monthlyRevenue > 100000) {
      reasoning.push('Significant revenue requires advanced reporting and analytics');
    } else if (criteria.monthlyRevenue > 10000) {
      reasoning.push('Growing revenue benefits from professional business tools');
    }

    // Transaction volume reasoning
    if (criteria.monthlyTransactions > 50000) {
      reasoning.push('High transaction volume requires enterprise performance and scalability');
    } else if (criteria.monthlyTransactions > 10000) {
      reasoning.push('Moderate transaction volume benefits from advanced POS features');
    }

    // Tier-specific reasoning
    switch (recommendedTier) {
      case BusinessTier.MICRO:
        reasoning.push('Micro tier provides essential features to get started without upfront costs');
        break;
      case BusinessTier.SMALL:
        reasoning.push('Small tier offers the right balance of features and affordability for growing businesses');
        break;
      case BusinessTier.MEDIUM:
        reasoning.push('Medium tier provides advanced B2B capabilities for established operations');
        break;
      case BusinessTier.ENTERPRISE:
        reasoning.push('Enterprise tier delivers comprehensive features for large-scale operations');
        break;
    }

    return reasoning;
  }

  /**
   * Generate alternative tier suggestions
   */
  private generateAlternatives(scores: TierScoring, recommendedTier: BusinessTier): Array<{
    tier: BusinessTier;
    reason: string;
    confidence: number;
  }> {
    const alternatives: Array<{ tier: BusinessTier; reason: string; confidence: number }> = [];
    
    // Sort tiers by score, excluding the recommended one
    const sortedTiers = Object.entries(scores)
      .filter(([tier]) => tier !== recommendedTier)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2); // Top 2 alternatives

    for (const [tier, score] of sortedTiers) {
      if (score > 0.1) { // Only include meaningful alternatives
        let reason = '';
        const tierEnum = tier as BusinessTier;
        
        switch (tierEnum) {
          case BusinessTier.MICRO:
            reason = 'Consider starting with the free tier to minimize initial costs';
            break;
          case BusinessTier.SMALL:
            reason = 'Small tier offers good value for growing businesses';
            break;
          case BusinessTier.MEDIUM:
            reason = 'Medium tier provides advanced features for scaling operations';
            break;
          case BusinessTier.ENTERPRISE:
            reason = 'Enterprise tier offers unlimited scalability and premium support';
            break;
        }

        alternatives.push({
          tier: tierEnum,
          reason,
          confidence: Math.round(score * 100) / 100,
        });
      }
    }

    return alternatives;
  }

  /**
   * Calculate cost analysis for different tiers
   */
  private calculateCostAnalysis(recommendedTier: BusinessTier) {
    const recommendedCost = this.tierLimits[recommendedTier].price.monthly;
    
    const alternativeCosts = Object.values(BusinessTier).map(tier => {
      const pricing = this.tierLimits[tier].price;
      const savings = tier !== recommendedTier && pricing.monthly < recommendedCost 
        ? recommendedCost - pricing.monthly 
        : undefined;

      return {
        tier,
        monthlyCost: pricing.monthly,
        annualCost: pricing.annually * 12,
        savings,
      };
    });

    return {
      recommendedCost,
      alternativeCosts,
    };
  }

  /**
   * Get tier features for comparison
   */
  getTierFeatures(tier: BusinessTier): {
    name: string;
    features: string[];
    limits: {
      employees: number;
      locations: number;
      transactions: number;
    };
    price: {
      monthly: number;
      annually: number;
    };
  } {
    const tierDetails = {
      [BusinessTier.MICRO]: {
        name: 'Micro (Free)',
        features: [
          'Basic POS functionality',
          'Inventory management',
          'Customer profiles',
          'Basic reporting',
          'Community support',
        ],
      },
      [BusinessTier.SMALL]: {
        name: 'Small',
        features: [
          'All Micro features',
          'Multi-location support',
          'Advanced inventory',
          'Loyalty program',
          'Real-time updates',
          'API access',
          'Email support',
        ],
      },
      [BusinessTier.MEDIUM]: {
        name: 'Medium',
        features: [
          'All Small features',
          'B2B operations',
          'Financial management',
          'Quote management',
          'Advanced analytics',
          'SSO integration',
          'Priority support',
        ],
      },
      [BusinessTier.ENTERPRISE]: {
        name: 'Enterprise',
        features: [
          'All Medium features',
          'Warehouse management',
          'Predictive analytics',
          'Dedicated account manager',
          '24/7 support',
          'Custom SLA',
          'White-label options',
        ],
      },
    };

    const limits = this.tierLimits[tier];
    
    return {
      ...tierDetails[tier],
      limits: {
        employees: limits.employees === Infinity ? -1 : limits.employees,
        locations: limits.locations === Infinity ? -1 : limits.locations,
        transactions: limits.transactions === Infinity ? -1 : limits.transactions,
      },
      price: limits.price,
    };
  }

  /**
   * Validate if a tier is suitable for given criteria
   */
  validateTierSuitability(tier: BusinessTier, criteria: AssessmentCriteria): {
    suitable: boolean;
    warnings: string[];
    limitations: string[];
  } {
    const limits = this.tierLimits[tier];
    const warnings: string[] = [];
    const limitations: string[] = [];

    // Check hard limits
    if (criteria.employees > limits.employees) {
      limitations.push(`Employee limit exceeded (${criteria.employees} > ${limits.employees})`);
    }
    
    if (criteria.locations > limits.locations) {
      limitations.push(`Location limit exceeded (${criteria.locations} > ${limits.locations})`);
    }
    
    if (criteria.monthlyTransactions > limits.transactions) {
      limitations.push(`Transaction limit exceeded (${criteria.monthlyTransactions} > ${limits.transactions})`);
    }

    // Check soft warnings
    if (criteria.employees > limits.employees * 0.8) {
      warnings.push('Approaching employee limit - consider upgrading soon');
    }
    
    if (criteria.monthlyRevenue > limits.revenue * 0.8) {
      warnings.push('Revenue approaching tier limits - higher tier may provide better value');
    }

    return {
      suitable: limitations.length === 0,
      warnings,
      limitations,
    };
  }
}

// Export singleton instance
export const tierRecommendationService = new TierRecommendationService();
export default tierRecommendationService;