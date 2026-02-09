import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { PlanDefinition, PlanTier } from './types/onboarding.types';

/**
 * Plan Definitions
 * 
 * Defines all available subscription plans with their pricing, limits,
 * features, and target segments for the recommendation algorithm.
 * 
 * Requirements: 5.8
 */
const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    tier: 'Starter',
    name: 'Starter Plan',
    monthlyPrice: 29,
    maxUsers: 10,
    maxLocations: 1,
    features: [
      'Basic user management',
      'Single location',
      'Email support',
      'Core features',
      '10 GB storage',
    ],
    targetSegments: {
      teamSizeMin: 1,
      teamSizeMax: 10,
      locationCountMin: 1,
      locationCountMax: 1,
      featureComplexity: 'basic',
    },
  },
  {
    tier: 'Professional',
    name: 'Professional Plan',
    monthlyPrice: 99,
    maxUsers: 50,
    maxLocations: 5,
    features: [
      'Advanced user management',
      'Multiple locations (up to 5)',
      'Role-based access control',
      'Priority support',
      'Advanced features',
      '50 GB storage',
      'API access',
    ],
    targetSegments: {
      teamSizeMin: 11,
      teamSizeMax: 50,
      locationCountMin: 1,
      locationCountMax: 5,
      featureComplexity: 'intermediate',
    },
  },
  {
    tier: 'Business',
    name: 'Business Plan',
    monthlyPrice: 299,
    maxUsers: 200,
    maxLocations: 20,
    features: [
      'Enterprise user management',
      'Unlimited locations',
      'Advanced permissions',
      'Department management',
      'Audit logging',
      '24/7 support',
      'All features',
      '200 GB storage',
      'Advanced API access',
      'Custom integrations',
    ],
    targetSegments: {
      teamSizeMin: 51,
      teamSizeMax: 200,
      locationCountMin: 6,
      locationCountMax: 20,
      featureComplexity: 'advanced',
    },
  },
  {
    tier: 'Enterprise',
    name: 'Enterprise Plan',
    monthlyPrice: 999,
    maxUsers: 1000,
    maxLocations: 100,
    features: [
      'All Business features',
      'Unlimited users',
      'Unlimited locations',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
      'Advanced security',
      'Unlimited storage',
      'White-label options',
      'Custom development',
    ],
    targetSegments: {
      teamSizeMin: 201,
      teamSizeMax: 10000,
      locationCountMin: 21,
      locationCountMax: 1000,
      featureComplexity: 'enterprise',
    },
  },
];

/**
 * Onboarding Service
 * 
 * Provides business logic for onboarding operations:
 * - Save and retrieve onboarding progress
 * - Plan recommendation algorithm
 * - Organization limits updates
 * - Onboarding completion tracking
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */
@Injectable()
export class OnboardingService {
  private readonly logger = new Logger(OnboardingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly organizations: OrganizationsService,
  ) {}

  /**
   * Save step data to organization's onboardingData JSON field
   * 
   * This method merges new step data with existing onboarding data,
   * preserving all previously saved information.
   * 
   * @param organizationId - Organization ID
   * @param stepData - Partial onboarding data for the current step
   * @returns Updated complete onboarding data
   */
  async saveProgress(
    organizationId: string,
    stepData: any,
  ): Promise<any> {
    this.logger.log(`Saving progress for organization: ${organizationId}`);

    // Retrieve the organization to get existing onboarding data
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { onboardingData: true },
    });

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    // Get existing onboarding data or initialize as empty object
    const existingData = (organization.onboardingData as any) || {};

    // Merge new step data with existing data, preserving all previous data
    const updatedData = {
      ...existingData,
      ...stepData,
    };

    // Update the organization with merged data
    const updated = await this.prisma.organization.update({
      where: { id: organizationId },
      data: { onboardingData: updatedData },
      select: { onboardingData: true },
    });

    return updated.onboardingData;
  }

  /**
   * Retrieve current onboarding progress
   * 
   * @param organizationId - Organization ID
   * @returns Current onboarding progress or null if not started
   */
  async getProgress(organizationId: string): Promise<any | null> {
    this.logger.log(`Getting progress for organization: ${organizationId}`);

    // Query organization by ID and extract onboarding fields
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        onboardingData: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!organization) {
      throw new Error(`Organization with ID ${organizationId} not found`);
    }

    // Return null if no onboarding data exists
    if (!organization.onboardingData) {
      return null;
    }

    // Transform to OnboardingProgress format
    const progress = {
      organizationId: organization.id,
      data: organization.onboardingData,
      onboardingCompleted: organization.onboardingCompleted,
      startedAt: organization.createdAt,
      lastUpdatedAt: organization.updatedAt,
    };

    return progress;
  }

  /**
   * Mark onboarding as complete
   * 
   * @param organizationId - Organization ID
   */
  async completeOnboarding(organizationId: string): Promise<void> {
    this.logger.log(`Completing onboarding for organization: ${organizationId}`);

    // Update Organization.onboardingCompleted to true
    await this.prisma.organization.update({
      where: { id: organizationId },
      data: {
        onboardingCompleted: true,
        updatedAt: new Date(), // Set completion timestamp
      },
    });
  }

  /**
   * Generate plan recommendations based on collected data
   * 
   * Analyzes onboarding data using a weighted scoring system:
   * - Team size (30%)
   * - Feature complexity (25%)
   * - Infrastructure requirements (20%)
   * - Location needs (15%)
   * - Business context (10%)
   * 
   * @param organizationId - Organization ID
   * @returns Array of plan recommendations with scores and reasoning
   * 
   * Requirements: 5.5, 5.6, 5.7, 5.8
   */
  async recommendPlan(organizationId: string): Promise<any[]> {
    this.logger.log(`Recommending plan for organization: ${organizationId}`);

    // Get onboarding progress to access collected data
    const progress = await this.getProgress(organizationId);

    if (!progress || !progress.data) {
      throw new Error('No onboarding data found for organization');
    }

    const data = progress.data;

    // Calculate scores for all plans
    const planScores = PLAN_DEFINITIONS.map(plan => ({
      plan,
      score: this.calculatePlanScore(data, plan),
    }));

    // Sort by score descending
    planScores.sort((a, b) => b.score - a.score);

    // Determine recommended plan (highest score)
    const recommendedPlan = planScores[0];

    // Calculate confidence score based on:
    // - Data completeness (40%)
    // - Score distribution (30%)
    // - Consistency (30%)
    const dataCompleteness = this.calculateDataCompleteness(data);
    const scoreDistribution = this.calculateScoreDistribution(planScores);
    const consistency = this.calculateConsistency(planScores);

    const confidence = Math.min(100, Math.max(0,
      dataCompleteness * 0.40 +
      scoreDistribution * 0.30 +
      consistency * 0.30
    ));

    // Generate recommendations array
    const recommendations = planScores.map((planScore, index) => {
      const isRecommended = index === 0;
      const reasons = this.generateRecommendationReason(data, planScore.plan);

      // Identify alternatives for the recommended plan
      let alternatives: { tier: PlanTier; reason: string }[] | undefined;
      if (isRecommended && planScores.length > 1) {
        alternatives = planScores.slice(1, 3).map(alt => ({
          tier: alt.plan.tier,
          reason: this.generateAlternativeReason(alt.plan, recommendedPlan.plan, data),
        }));
      }

      return {
        tier: planScore.plan.tier,
        score: Math.round(planScore.score * 100) / 100, // Round to 2 decimal places
        confidence: isRecommended ? Math.round(confidence * 100) / 100 : 0,
        reasons,
        monthlyPrice: planScore.plan.monthlyPrice,
        features: planScore.plan.features,
        limits: {
          maxUsers: planScore.plan.maxUsers,
          maxLocations: planScore.plan.maxLocations,
        },
        alternatives: isRecommended ? alternatives : undefined,
      };
    });

    return recommendations;
  }

  /**
   * Update organization limits based on selected plan
   * 
   * @param organizationId - Organization ID
   * @param planTier - Selected plan tier
   */
  async selectPlan(organizationId: string, planTier: string): Promise<void> {
    // TODO: Implement selectPlan logic
    // This will be implemented in task 6.1
    this.logger.log(`Selecting plan ${planTier} for organization: ${organizationId}`);
  }

  /**
   * Calculate recommendation score for a specific plan
   * 
   * Combines all scoring functions with their respective weights:
   * - Team size: 30%
   * - Feature complexity: 25%
   * - Infrastructure: 20%
   * - Location: 15%
   * - Business context: 10%
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   * 
   * Requirements: 5.5
   */
  private calculatePlanScore(data: any, plan: PlanDefinition): number {
    const teamSizeScore = this.calculateTeamSizeScore(data, plan);
    const featureComplexityScore = this.calculateFeatureComplexityScore(data, plan);
    const infrastructureScore = this.calculateInfrastructureScore(data, plan);
    const locationScore = this.calculateLocationScore(data, plan);
    const businessContextScore = this.calculateBusinessContextScore(data, plan);

    // Apply weights and calculate final score
    const finalScore = (
      teamSizeScore * 0.30 +
      featureComplexityScore * 0.25 +
      infrastructureScore * 0.20 +
      locationScore * 0.15 +
      businessContextScore * 0.10
    );

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, finalScore));
  }

  /**
   * Generate reasoning for plan recommendation
   * 
   * Analyzes onboarding data to create human-readable explanations
   * for why a specific plan is recommended.
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Array of reason strings
   * 
   * Requirements: 5.6
   */
  private generateRecommendationReason(data: any, plan: PlanDefinition): string[] {
    const reasons: string[] = [];

    // Team size reasoning
    if (data.teamSize) {
      const { current, growthProjection } = data.teamSize;
      const { teamSizeMin, teamSizeMax } = plan.targetSegments;

      if (current >= teamSizeMin && current <= teamSizeMax) {
        reasons.push(`Your team size of ${current} employees fits perfectly within this plan's capacity.`);
      } else if (growthProjection !== 'None') {
        reasons.push(`With ${growthProjection} growth projection, this plan provides room for your team to expand.`);
      }

      if (plan.maxUsers === 1000) {
        reasons.push(`Unlimited user capacity supports your scaling needs.`);
      }
    }

    // Feature complexity reasoning
    if (data.features && data.features.selectedFeatures) {
      const selectedCount = data.features.selectedFeatures.length;
      
      if (selectedCount >= 10 && plan.tier === 'Enterprise') {
        reasons.push(`Your selection of ${selectedCount} features requires enterprise-level capabilities.`);
      } else if (selectedCount >= 6 && ['Business', 'Enterprise'].includes(plan.tier)) {
        reasons.push(`Advanced features you selected are fully supported in this plan.`);
      } else if (selectedCount <= 3 && plan.tier === 'Starter') {
        reasons.push(`This plan covers all the core features you need.`);
      }
    }

    // Infrastructure reasoning
    if (data.infrastructure) {
      const { storage, transactionVolume, compliance } = data.infrastructure;

      if (storage > 50 && ['Business', 'Enterprise'].includes(plan.tier)) {
        reasons.push(`${storage}GB storage requirement is well-supported by this plan.`);
      }

      if (transactionVolume.includes('Enterprise') && plan.tier === 'Enterprise') {
        reasons.push(`Enterprise-level transaction volume requires this tier's infrastructure.`);
      } else if (transactionVolume.includes('High') && ['Business', 'Enterprise'].includes(plan.tier)) {
        reasons.push(`High transaction volume is optimally handled by this plan.`);
      }

      if (compliance && compliance.length > 0) {
        if (['Business', 'Enterprise'].includes(plan.tier)) {
          reasons.push(`Compliance requirements (${compliance.join(', ')}) are fully met.`);
        }
      }
    }

    // Location reasoning
    if (data.locations) {
      const { multiLocation, count, geographicSpread } = data.locations;

      if (multiLocation && count) {
        if (count > 20 && plan.tier === 'Enterprise') {
          reasons.push(`${count} locations require enterprise-scale management capabilities.`);
        } else if (count > 5 && plan.tier === 'Business') {
          reasons.push(`Managing ${count} locations is ideal for this plan.`);
        } else if (count <= 5 && plan.tier === 'Professional') {
          reasons.push(`This plan supports up to ${plan.maxLocations} locations, perfect for your needs.`);
        }

        if (geographicSpread === 'International' && ['Business', 'Enterprise'].includes(plan.tier)) {
          reasons.push(`International operations benefit from this plan's global capabilities.`);
        }
      } else if (!multiLocation && plan.tier === 'Starter') {
        reasons.push(`Single location operations are perfect for the Starter plan.`);
      }
    }

    // Business context reasoning
    if (data.businessInfo) {
      const { businessType, industry } = data.businessInfo;

      if (['Manufacturing', 'Wholesale', 'Hybrid'].includes(businessType)) {
        if (['Business', 'Enterprise'].includes(plan.tier)) {
          reasons.push(`${businessType} businesses benefit from this plan's advanced features.`);
        }
      }

      const enterpriseIndustries = ['Healthcare', 'Finance', 'Government', 'Manufacturing'];
      const isEnterpriseIndustry = enterpriseIndustries.some(ei => 
        industry?.toLowerCase().includes(ei.toLowerCase())
      );

      if (isEnterpriseIndustry && ['Business', 'Enterprise'].includes(plan.tier)) {
        reasons.push(`${industry} industry standards are met with this plan's security and compliance features.`);
      }
    }

    // Plan-specific benefits
    if (plan.tier === 'Enterprise') {
      reasons.push(`Dedicated account manager and SLA guarantee ensure premium support.`);
    } else if (plan.tier === 'Business') {
      reasons.push(`24/7 support and audit logging provide enterprise-grade reliability.`);
    } else if (plan.tier === 'Professional') {
      reasons.push(`Priority support and API access enable efficient operations.`);
    } else if (plan.tier === 'Starter') {
      reasons.push(`Cost-effective solution for getting started quickly.`);
    }

    // Ensure at least one reason is provided
    if (reasons.length === 0) {
      reasons.push(`This plan offers a balanced set of features for your business needs.`);
    }

    return reasons;
  }

  /**
   * Calculate team size score (30% weight)
   * 
   * Analyzes current team size and growth projection against plan capacity.
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   * 
   * Requirements: 5.1
   */
  private calculateTeamSizeScore(data: any, plan: PlanDefinition): number {
    if (!data.teamSize) {
      return 50; // Neutral score if no data
    }

    const { current, growthProjection } = data.teamSize;

    // Apply growth multiplier based on projection
    const growthMultipliers: Record<string, number> = {
      'None': 1.0,
      '2x': 1.5,
      '5x': 2.0,
      '10x+': 3.0,
    };

    const growthMultiplier = growthMultipliers[growthProjection] || 1.0;
    const projectedTeamSize = current * growthMultiplier;

    // Calculate how well the team size fits the plan
    const { teamSizeMin, teamSizeMax } = plan.targetSegments;

    if (projectedTeamSize >= teamSizeMin && projectedTeamSize <= teamSizeMax) {
      // Perfect fit
      return 100;
    } else if (projectedTeamSize < teamSizeMin) {
      // Team is smaller than plan target - penalize based on how much smaller
      const ratio = projectedTeamSize / teamSizeMin;
      return Math.max(0, ratio * 80); // Max 80 points if undersized
    } else {
      // Team is larger than plan target - penalize based on how much larger
      const ratio = teamSizeMax / projectedTeamSize;
      return Math.max(0, ratio * 70); // Max 70 points if oversized
    }
  }

  /**
   * Calculate feature complexity score (25% weight)
   * 
   * Analyzes selected features to determine complexity level.
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   * 
   * Requirements: 5.2
   */
  private calculateFeatureComplexityScore(data: any, plan: PlanDefinition): number {
    if (!data.features || !data.features.selectedFeatures) {
      return 50; // Neutral score if no data
    }

    const selectedCount = data.features.selectedFeatures.length;

    // Define feature complexity tiers
    const complexityMapping: Record<string, { min: number; max: number }> = {
      'basic': { min: 1, max: 3 },
      'intermediate': { min: 3, max: 6 },
      'advanced': { min: 6, max: 10 },
      'enterprise': { min: 10, max: 20 },
    };

    const targetComplexity = plan.targetSegments.featureComplexity;
    const range = complexityMapping[targetComplexity];

    if (selectedCount >= range.min && selectedCount <= range.max) {
      // Perfect fit
      return 100;
    } else if (selectedCount < range.min) {
      // Fewer features than plan target
      const ratio = selectedCount / range.min;
      return Math.max(0, ratio * 75);
    } else {
      // More features than plan target
      const ratio = range.max / selectedCount;
      return Math.max(0, ratio * 85);
    }
  }

  /**
   * Calculate infrastructure score (20% weight)
   * 
   * Analyzes storage, transaction volume, and compliance requirements.
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   * 
   * Requirements: 5.3
   */
  private calculateInfrastructureScore(data: any, plan: PlanDefinition): number {
    if (!data.infrastructure) {
      return 50; // Neutral score if no data
    }

    const { storage, transactionVolume, compliance } = data.infrastructure;

    // Storage score
    let storageScore = 0;
    if (plan.tier === 'Starter' && storage <= 10) {
      storageScore = 100;
    } else if (plan.tier === 'Professional' && storage <= 50) {
      storageScore = 100;
    } else if (plan.tier === 'Business' && storage <= 200) {
      storageScore = 100;
    } else if (plan.tier === 'Enterprise') {
      storageScore = 100;
    } else {
      // Storage exceeds plan capacity
      storageScore = 30;
    }

    // Transaction volume score
    const volumeMapping: Record<string, number> = {
      'Low (<1k/month)': 1,
      'Medium (1k-50k/month)': 2,
      'High (50k-500k/month)': 3,
      'Enterprise (500k+/month)': 4,
    };

    const planTierMapping: Record<PlanTier, number> = {
      'Starter': 1,
      'Professional': 2,
      'Business': 3,
      'Enterprise': 4,
    };

    const volumeLevel = volumeMapping[transactionVolume] || 1;
    const planLevel = planTierMapping[plan.tier];

    let transactionScore = 0;
    if (volumeLevel === planLevel) {
      transactionScore = 100;
    } else if (volumeLevel < planLevel) {
      transactionScore = 70; // Plan is more than needed
    } else {
      transactionScore = Math.max(0, 100 - (volumeLevel - planLevel) * 30);
    }

    // Compliance score
    const complianceCount = compliance?.length || 0;
    let complianceScore = 0;

    if (complianceCount === 0) {
      complianceScore = plan.tier === 'Starter' ? 100 : 80;
    } else if (complianceCount <= 2) {
      complianceScore = ['Professional', 'Business', 'Enterprise'].includes(plan.tier) ? 100 : 50;
    } else {
      complianceScore = ['Business', 'Enterprise'].includes(plan.tier) ? 100 : 30;
    }

    // Average the three scores
    return (storageScore + transactionScore + complianceScore) / 3;
  }

  /**
   * Calculate location score (15% weight)
   * 
   * Analyzes multi-location needs and geographic spread.
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   * 
   * Requirements: 5.4
   */
  private calculateLocationScore(data: any, plan: PlanDefinition): number {
    if (!data.locations) {
      return 50; // Neutral score if no data
    }

    const { multiLocation, count, geographicSpread } = data.locations;

    // If single location
    if (!multiLocation || !count || count === 1) {
      return plan.tier === 'Starter' ? 100 : 70;
    }

    // Multi-location scoring
    const locationCount = count || 1;
    const { locationCountMin, locationCountMax } = plan.targetSegments;

    let locationScore = 0;
    if (locationCount >= locationCountMin && locationCount <= locationCountMax) {
      locationScore = 100;
    } else if (locationCount < locationCountMin) {
      const ratio = locationCount / locationCountMin;
      locationScore = Math.max(0, ratio * 75);
    } else {
      const ratio = locationCountMax / locationCount;
      locationScore = Math.max(0, ratio * 60);
    }

    // Geographic spread bonus/penalty
    const spreadMapping: Record<string, number> = {
      'Single city': 1,
      'Multiple cities': 2,
      'Regional': 3,
      'National': 4,
      'International': 5,
    };

    const spreadLevel = spreadMapping[geographicSpread || 'Single city'] || 1;
    const planTierMapping: Record<PlanTier, number> = {
      'Starter': 1,
      'Professional': 2,
      'Business': 4,
      'Enterprise': 5,
    };

    const planSpreadLevel = planTierMapping[plan.tier];

    if (spreadLevel <= planSpreadLevel) {
      return locationScore;
    } else {
      // Geographic spread exceeds plan capability
      return locationScore * 0.7;
    }
  }

  /**
   * Calculate business context score (10% weight)
   * 
   * Analyzes industry and business type considerations.
   * 
   * @param data - Onboarding data
   * @param plan - Plan definition
   * @returns Score between 0-100
   * 
   * Requirements: 5.4
   */
  private calculateBusinessContextScore(data: any, plan: PlanDefinition): number {
    if (!data.businessInfo) {
      return 50; // Neutral score if no data
    }

    const { businessType, industry } = data.businessInfo;

    // Business type scoring
    const complexBusinessTypes = ['Manufacturing', 'Wholesale', 'Hybrid'];
    const simpleBusinessTypes = ['Retail', 'Service', 'E-commerce'];

    let businessTypeScore = 50;

    if (complexBusinessTypes.includes(businessType)) {
      // Complex business types benefit from higher tiers
      if (plan.tier === 'Enterprise' || plan.tier === 'Business') {
        businessTypeScore = 100;
      } else if (plan.tier === 'Professional') {
        businessTypeScore = 70;
      } else {
        businessTypeScore = 40;
      }
    } else if (simpleBusinessTypes.includes(businessType)) {
      // Simple business types can work with any tier
      if (plan.tier === 'Starter' || plan.tier === 'Professional') {
        businessTypeScore = 100;
      } else {
        businessTypeScore = 80;
      }
    }

    // Industry considerations (some industries need more robust solutions)
    const enterpriseIndustries = ['Healthcare', 'Finance', 'Government', 'Manufacturing'];
    const isEnterpriseIndustry = enterpriseIndustries.some(ei => 
      industry?.toLowerCase().includes(ei.toLowerCase())
    );

    let industryScore = 50;
    if (isEnterpriseIndustry) {
      if (plan.tier === 'Enterprise' || plan.tier === 'Business') {
        industryScore = 100;
      } else if (plan.tier === 'Professional') {
        industryScore = 60;
      } else {
        industryScore = 30;
      }
    } else {
      industryScore = 80; // Most industries work with any tier
    }

    // Average business type and industry scores
    return (businessTypeScore + industryScore) / 2;
  }

  /**
   * Calculate data completeness score
   * 
   * Measures how much onboarding data has been collected.
   * 
   * @param data - Onboarding data
   * @returns Score between 0-100
   */
  private calculateDataCompleteness(data: any): number {
    const sections = [
      'businessInfo',
      'features',
      'teamSize',
      'locations',
      'infrastructure',
      'integrations',
    ];

    const completedSections = sections.filter(section => data[section] != null).length;
    return (completedSections / sections.length) * 100;
  }

  /**
   * Calculate score distribution metric
   * 
   * Measures how clearly one plan stands out from others.
   * Higher score means clearer recommendation.
   * 
   * @param planScores - Array of plans with scores
   * @returns Score between 0-100
   */
  private calculateScoreDistribution(planScores: { plan: PlanDefinition; score: number }[]): number {
    if (planScores.length < 2) {
      return 100;
    }

    const topScore = planScores[0].score;
    const secondScore = planScores[1].score;

    // Calculate the gap between top and second
    const gap = topScore - secondScore;

    // Larger gap = higher confidence
    // Gap of 20+ points = 100% confidence
    return Math.min(100, (gap / 20) * 100);
  }

  /**
   * Calculate consistency metric
   * 
   * Measures how consistent the scoring is across different factors.
   * 
   * @param planScores - Array of plans with scores
   * @returns Score between 0-100
   */
  private calculateConsistency(planScores: { plan: PlanDefinition; score: number }[]): number {
    // If all scores are similar, consistency is low
    // If scores are well-distributed, consistency is high
    
    const scores = planScores.map(ps => ps.score);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);
    const range = maxScore - minScore;

    // Good range (30-60 points) indicates consistent differentiation
    if (range >= 30 && range <= 60) {
      return 100;
    } else if (range < 30) {
      // Scores too similar - low consistency
      return (range / 30) * 70;
    } else {
      // Scores too spread out - moderate consistency
      return 80;
    }
  }

  /**
   * Generate reason for alternative plan
   * 
   * Explains why an alternative plan might be considered.
   * 
   * @param alternativePlan - Alternative plan
   * @param recommendedPlan - Recommended plan
   * @param data - Onboarding data
   * @returns Reason string
   */
  private generateAlternativeReason(
    alternativePlan: PlanDefinition,
    recommendedPlan: PlanDefinition,
    data: any,
  ): string {
    const tierOrder: PlanTier[] = ['Starter', 'Professional', 'Business', 'Enterprise'];
    const altIndex = tierOrder.indexOf(alternativePlan.tier);
    const recIndex = tierOrder.indexOf(recommendedPlan.tier);

    if (altIndex < recIndex) {
      // Alternative is lower tier
      return `Consider ${alternativePlan.name} if you want to start with a more cost-effective option at $${alternativePlan.monthlyPrice}/month.`;
    } else {
      // Alternative is higher tier
      return `Consider ${alternativePlan.name} if you anticipate rapid growth or need additional features like ${alternativePlan.features[alternativePlan.features.length - 1]}.`;
    }
  }
}
