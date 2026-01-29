import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../../database/drizzle.service';
import { tenants } from '../../database/schema';
import { CustomLoggerService } from '../../logger/logger.service';
import { 
  BusinessProfile, 
  IndustryType, 
  BusinessSize, 
  BusinessType, 
  RevenueRange, 
  TransactionVolumeRange,
  IndustryClassification,
  BusinessSizeHelper
} from '../entities/business-profile.entity';
import { 
  OnboardingValidationSchemaFactory,
  OnboardingValidationHelpers,
  BusinessProfileStepValidation,
  BusinessTypeStepValidation,
  UsageExpectationsStepValidation,
  PlanSelectionStepValidation,
  WelcomeStepValidation
} from '../validation/onboarding-validation.schemas';
import { OnboardingStep } from './onboarding.service';
import { BusinessTier } from '../entities/tenant.entity';

/**
 * Business profile collection and validation service
 */
@Injectable()
export class BusinessProfileService {
  constructor(
    private readonly drizzle: DrizzleService,
    private readonly logger: CustomLoggerService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.logger.setContext('BusinessProfileService');
  }

  /**
   * Validate onboarding step data
   */
  async validateStepData(step: OnboardingStep, data: any): Promise<{ isValid: boolean; errors: Record<string, string[]> }> {
    const ValidationClass = OnboardingValidationSchemaFactory.getValidationClass(step);
    
    if (!ValidationClass) {
      throw new BadRequestException(`No validation schema found for step: ${step}`);
    }

    // Transform plain object to class instance
    const validationInstance = plainToClass(ValidationClass, { step, ...data });

    // Run class-validator validation
    const validationErrors = await validate(validationInstance);
    
    // Convert validation errors to our format
    const errors: Record<string, string[]> = {};
    
    for (const error of validationErrors) {
      if (error.property && error.constraints) {
        errors[error.property] = Object.values(error.constraints);
      }
    }

    // Add cross-field validation errors
    const crossFieldErrors = OnboardingValidationHelpers.getCrossFieldValidationErrors(data);
    for (const [field, fieldErrors] of Object.entries(crossFieldErrors)) {
      if (fieldErrors.length > 0) {
        errors[field] = errors[field] ? [...errors[field], ...fieldErrors] : fieldErrors;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Collect and validate business profile data
   */
  async collectBusinessProfile(tenantId: string, profileData: Partial<BusinessProfile>): Promise<BusinessProfile> {
    // Validate the profile data
    const validation = await this.validateStepData(OnboardingStep.BUSINESS_PROFILE, profileData);
    
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Business profile validation failed',
        errors: validation.errors,
      });
    }

    // Auto-classify industry if not provided
    let industry = profileData.industry;
    if (!industry && profileData.businessName) {
      industry = IndustryClassification.classifyIndustry(profileData.businessName);
    }

    // Auto-determine business size if not provided but employee count is
    let businessSize = profileData.businessSize;
    if (!businessSize && profileData.expectedEmployees) {
      businessSize = BusinessSizeHelper.determineBusinessSize(profileData.expectedEmployees);
    }

    // Create business profile
    const businessProfile = {
      id: `profile_${tenantId}`,
      businessName: profileData.businessName!,
      industry: industry || IndustryType.OTHER,
      businessSize: businessSize || BusinessSize.MICRO,
      businessType: this.inferBusinessType(industry, businessSize),
      expectedEmployees: profileData.expectedEmployees || 1,
      expectedLocations: profileData.expectedLocations || 1,
      expectedRevenueRange: profileData.expectedRevenueRange || RevenueRange.UNDER_10K,
      expectedTransactionVolumeRange: profileData.expectedTransactionVolumeRange || TransactionVolumeRange.UNDER_100,
      ...(profileData.expectedMonthlyRevenue !== undefined && { expectedMonthlyRevenue: profileData.expectedMonthlyRevenue }),
      ...(profileData.expectedMonthlyTransactions !== undefined && { expectedMonthlyTransactions: profileData.expectedMonthlyTransactions }),
      currentSoftware: profileData.currentSoftware || [],
      businessGoals: profileData.businessGoals || [],
      ...(profileData.description && { description: profileData.description }),
      ...(profileData.website && { website: profileData.website }),
      ...(profileData.phoneNumber && { phoneNumber: profileData.phoneNumber }),
      ...(profileData.address && { address: profileData.address }),
      ...(profileData.city && { city: profileData.city }),
      ...(profileData.state && { state: profileData.state }),
      ...(profileData.country && { country: profileData.country }),
      ...(profileData.postalCode && { postalCode: profileData.postalCode }),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as BusinessProfile;

    // Save to tenant settings
    await this.saveBusinessProfile(tenantId, businessProfile);

    this.logger.log(`Business profile collected for tenant ${tenantId}`);

    // Emit event
    this.eventEmitter.emit('tenant.business_profile.collected', {
      tenantId,
      businessProfile,
      timestamp: new Date(),
    });

    return businessProfile;
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(tenantId: string, updates: Partial<BusinessProfile>): Promise<BusinessProfile> {
    const currentProfile = await this.getBusinessProfile(tenantId);
    
    if (!currentProfile) {
      throw new NotFoundException(`Business profile not found for tenant ${tenantId}`);
    }

    // Merge updates with current profile
    const updatedProfile: BusinessProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date(),
    };

    // Validate updated profile
    const validation = await this.validateStepData(OnboardingStep.BUSINESS_PROFILE, updatedProfile);
    
    if (!validation.isValid) {
      throw new BadRequestException({
        message: 'Business profile validation failed',
        errors: validation.errors,
      });
    }

    // Save updated profile
    await this.saveBusinessProfile(tenantId, updatedProfile);

    this.logger.log(`Business profile updated for tenant ${tenantId}`);

    // Emit event
    this.eventEmitter.emit('tenant.business_profile.updated', {
      tenantId,
      businessProfile: updatedProfile,
      changes: updates,
      timestamp: new Date(),
    });

    return updatedProfile;
  }

  /**
   * Get business profile for tenant
   */
  async getBusinessProfile(tenantId: string): Promise<BusinessProfile | null> {
    const [tenant] = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const settings = (tenant.settings || {}) as Record<string, any>;
    return settings.businessProfile || null;
  }

  /**
   * Analyze business profile for plan recommendation
   */
  async analyzeBusinessProfile(tenantId: string): Promise<{
    recommendedTier: BusinessTier;
    confidence: number;
    reasoning: string[];
    alternatives: Array<{ tier: BusinessTier; reason: string }>;
  }> {
    const profile = await this.getBusinessProfile(tenantId);
    
    if (!profile) {
      throw new NotFoundException(`Business profile not found for tenant ${tenantId}`);
    }

    return this.calculateTierRecommendation(profile);
  }

  /**
   * Get industry suggestions based on input
   */
  getIndustrySuggestions(query: string): Array<{ value: IndustryType; label: string; confidence: number }> {
    const allIndustries = IndustryClassification.getAllIndustries();
    const queryLower = query.toLowerCase();

    return allIndustries
      .map(industry => {
        const labelLower = industry.label.toLowerCase();
        let confidence = 0;

        // Exact match
        if (labelLower === queryLower) {
          confidence = 1.0;
        }
        // Starts with query
        else if (labelLower.startsWith(queryLower)) {
          confidence = 0.8;
        }
        // Contains query
        else if (labelLower.includes(queryLower)) {
          confidence = 0.6;
        }
        // Query contains industry name
        else if (queryLower.includes(labelLower)) {
          confidence = 0.4;
        }

        return { ...industry, confidence };
      })
      .filter(industry => industry.confidence > 0)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Return top 10 suggestions
  }

  /**
   * Validate business profile completeness
   */
  validateProfileCompleteness(profile: BusinessProfile): {
    isComplete: boolean;
    missingFields: string[];
    completionPercentage: number;
  } {
    const requiredFields = [
      'businessName',
      'industry',
      'businessSize',
      'businessType',
      'expectedEmployees',
      'expectedLocations',
      'expectedRevenueRange',
      'expectedTransactionVolumeRange',
    ];

    const optionalFields = [
      'description',
      'website',
      'phoneNumber',
      'address',
      'city',
      'state',
      'country',
      'postalCode',
      'currentSoftware',
      'businessGoals',
    ];

    const missingFields: string[] = [];
    let completedFields = 0;

    // Check required fields
    for (const field of requiredFields) {
      const value = (profile as any)[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      } else {
        completedFields++;
      }
    }

    // Check optional fields
    for (const field of optionalFields) {
      const value = (profile as any)[field];
      if (value !== undefined && value !== null && value !== '') {
        completedFields++;
      }
    }

    const totalFields = requiredFields.length + optionalFields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    return {
      isComplete: missingFields.length === 0,
      missingFields,
      completionPercentage,
    };
  }

  /**
   * Save business profile to tenant settings
   */
  private async saveBusinessProfile(tenantId: string, profile: BusinessProfile): Promise<void> {
    const [tenant] = await this.drizzle.getDb()
      .select()
      .from(tenants)
      .where(eq(tenants.id, tenantId));

    if (!tenant) {
      throw new NotFoundException(`Tenant ${tenantId} not found`);
    }

    const currentSettings = (tenant.settings || {}) as Record<string, any>;
    const updatedSettings = {
      ...currentSettings,
      businessProfile: profile,
    };

    await this.drizzle.getDb()
      .update(tenants)
      .set({
        settings: updatedSettings,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId));
  }

  /**
   * Infer business type from industry and size
   */
  private inferBusinessType(industry?: IndustryType, businessSize?: BusinessSize): BusinessType {
    if (!industry) return BusinessType.FREE;

    // Map industry to business type
    const industryToBusinessType: Partial<Record<IndustryType, BusinessType>> = {
      [IndustryType.RENEWABLES]: BusinessType.RENEWABLES,
      [IndustryType.ENERGY]: BusinessType.RENEWABLES,
      [IndustryType.RETAIL]: BusinessType.RETAIL,
      [IndustryType.WHOLESALE]: BusinessType.WHOLESALE,
      [IndustryType.MANUFACTURING]: BusinessType.INDUSTRY,
      [IndustryType.CONSTRUCTION]: BusinessType.INDUSTRY,
      [IndustryType.AUTOMOTIVE]: BusinessType.INDUSTRY,
    };

    const mappedType = industryToBusinessType[industry];
    if (mappedType) return mappedType;

    // Default based on business size
    if (businessSize === BusinessSize.SOLO || businessSize === BusinessSize.MICRO) {
      return BusinessType.FREE;
    }

    return BusinessType.RETAIL; // Default fallback
  }

  /**
   * Calculate tier recommendation based on business profile
   */
  private calculateTierRecommendation(profile: BusinessProfile): {
    recommendedTier: BusinessTier;
    confidence: number;
    reasoning: string[];
    alternatives: Array<{ tier: BusinessTier; reason: string }>;
  } {
    const reasoning: string[] = [];
    const alternatives: Array<{ tier: BusinessTier; reason: string }> = [];
    let score = 0;

    // Score based on employee count
    if (profile.expectedEmployees <= 5) {
      score += 1;
      reasoning.push(`Small team size (${profile.expectedEmployees} employees)`);
    } else if (profile.expectedEmployees <= 25) {
      score += 2;
      reasoning.push(`Growing team size (${profile.expectedEmployees} employees)`);
    } else if (profile.expectedEmployees <= 100) {
      score += 3;
      reasoning.push(`Medium team size (${profile.expectedEmployees} employees)`);
    } else {
      score += 4;
      reasoning.push(`Large team size (${profile.expectedEmployees} employees)`);
    }

    // Score based on location count
    if (profile.expectedLocations > 1) {
      score += 1;
      reasoning.push(`Multiple locations (${profile.expectedLocations})`);
    }

    // Score based on revenue range
    const revenueScore = this.getRevenueScore(profile.expectedRevenueRange);
    score += revenueScore;
    reasoning.push(`Revenue range: ${profile.expectedRevenueRange}`);

    // Score based on transaction volume
    const transactionScore = this.getTransactionScore(profile.expectedTransactionVolumeRange);
    score += transactionScore;
    reasoning.push(`Transaction volume: ${profile.expectedTransactionVolumeRange}`);

    // Score based on business type
    const businessTypeScore = this.getBusinessTypeScore(profile.businessType);
    score += businessTypeScore;
    reasoning.push(`Business type: ${profile.businessType}`);

    // Determine tier based on total score
    let recommendedTier: BusinessTier;
    let confidence: number;

    if (score <= 3) {
      recommendedTier = BusinessTier.MICRO;
      confidence = 0.8;
      alternatives.push({ tier: BusinessTier.SMALL, reason: 'If you expect rapid growth' });
    } else if (score <= 6) {
      recommendedTier = BusinessTier.SMALL;
      confidence = 0.85;
      alternatives.push({ tier: BusinessTier.MICRO, reason: 'If you want to start smaller' });
      alternatives.push({ tier: BusinessTier.MEDIUM, reason: 'If you need advanced features' });
    } else if (score <= 9) {
      recommendedTier = BusinessTier.MEDIUM;
      confidence = 0.9;
      alternatives.push({ tier: BusinessTier.SMALL, reason: 'If budget is a concern' });
      alternatives.push({ tier: BusinessTier.ENTERPRISE, reason: 'If you need enterprise features' });
    } else {
      recommendedTier = BusinessTier.ENTERPRISE;
      confidence = 0.95;
      alternatives.push({ tier: BusinessTier.MEDIUM, reason: 'If you want to start with fewer features' });
    }

    return {
      recommendedTier,
      confidence,
      reasoning,
      alternatives,
    };
  }

  /**
   * Get score based on revenue range
   */
  private getRevenueScore(revenueRange: RevenueRange): number {
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
   * Get score based on transaction volume
   */
  private getTransactionScore(volumeRange: TransactionVolumeRange): number {
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
   * Get score based on business type
   */
  private getBusinessTypeScore(businessType: BusinessType): number {
    const scores: Record<BusinessType, number> = {
      [BusinessType.FREE]: 0,
      [BusinessType.RENEWABLES]: 1,
      [BusinessType.RETAIL]: 1,
      [BusinessType.WHOLESALE]: 2,
      [BusinessType.INDUSTRY]: 3,
    };

    return scores[businessType] || 0;
  }
}