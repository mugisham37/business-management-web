import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max, IsUrl, IsEmail, IsPhoneNumber, Length, IsArray, ArrayMaxSize } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IndustryType, BusinessSize, RevenueRange, TransactionVolumeRange } from '../entities/business-profile.entity';
import { OnboardingStep, BusinessType } from '../enums/onboarding.enums';

/**
 * Base validation schema for onboarding steps
 */
export abstract class BaseOnboardingStepValidation {
  @IsEnum(OnboardingStep)
  step!: OnboardingStep;
}

/**
 * Business Profile Step Validation (Step 1)
 */
export class BusinessProfileStepValidation extends BaseOnboardingStepValidation {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  @Transform(({ value }) => value?.trim())
  businessName!: string;

  @IsEnum(IndustryType)
  industry!: IndustryType;

  @IsEnum(BusinessSize)
  businessSize!: BusinessSize;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  @Transform(({ value }) => value?.trim())
  address?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Transform(({ value }) => value?.trim())
  state?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  @Transform(({ value }) => value?.trim())
  country?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  @Transform(({ value }) => value?.trim())
  postalCode?: string;
}

/**
 * Business Type Step Validation (Step 2)
 */
export class BusinessTypeStepValidation extends BaseOnboardingStepValidation {
  @IsEnum(BusinessType)
  businessType!: BusinessType;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  businessGoals?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  currentSoftware?: string[];
}

/**
 * Usage Expectations Step Validation (Step 3)
 */
export class UsageExpectationsStepValidation extends BaseOnboardingStepValidation {
  @IsInt()
  @Min(1)
  @Max(100000)
  @Type(() => Number)
  expectedEmployees!: number;

  @IsInt()
  @Min(1)
  @Max(10000)
  @Type(() => Number)
  expectedLocations!: number;

  @IsEnum(RevenueRange)
  expectedRevenueRange!: RevenueRange;

  @IsEnum(TransactionVolumeRange)
  expectedTransactionVolumeRange!: TransactionVolumeRange;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000000) // 10M in cents
  @Type(() => Number)
  expectedMonthlyRevenue?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000000) // 10M transactions
  @Type(() => Number)
  expectedMonthlyTransactions?: number;
}

/**
 * Plan Selection Step Validation (Step 4)
 */
export class PlanSelectionStepValidation extends BaseOnboardingStepValidation {
  @IsEnum(['micro', 'small', 'medium', 'enterprise'])
  selectedPlan!: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  @Transform(({ value }) => value?.trim())
  planSelectionReason?: string;
}

/**
 * Welcome Step Validation (Step 5)
 */
export class WelcomeStepValidation extends BaseOnboardingStepValidation {
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  @Transform(({ value }) => value?.trim())
  feedback?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  interestedFeatures?: string[];
}

/**
 * Validation schema factory
 */
export class OnboardingValidationSchemaFactory {
  private static readonly stepValidationClasses = {
    [OnboardingStep.BUSINESS_PROFILE]: BusinessProfileStepValidation,
    [OnboardingStep.BUSINESS_TYPE]: BusinessTypeStepValidation,
    [OnboardingStep.USAGE_EXPECTATIONS]: UsageExpectationsStepValidation,
    [OnboardingStep.PLAN_SELECTION]: PlanSelectionStepValidation,
    [OnboardingStep.WELCOME]: WelcomeStepValidation,
  };

  /**
   * Get validation class for a specific step
   */
  static getValidationClass(step: OnboardingStep): any {
    return this.stepValidationClasses[step];
  }

  /**
   * Get all validation classes
   */
  static getAllValidationClasses(): Record<OnboardingStep, any> {
    return this.stepValidationClasses;
  }
}

/**
 * Custom validation decorators
 */

/**
 * Validates that employee count matches business size
 */
export function IsValidEmployeeCountForSize() {
  return function (target: any, propertyName: string) {
    // This would be implemented as a custom validator
    // For now, we'll handle this logic in the service layer
  };
}

/**
 * Validates that revenue range is consistent with business size
 */
export function IsValidRevenueForSize() {
  return function (target: any, propertyName: string) {
    // This would be implemented as a custom validator
    // For now, we'll handle this logic in the service layer
  };
}

/**
 * Validation helper functions
 */
export class OnboardingValidationHelpers {
  /**
   * Validate employee count consistency with business size
   */
  static validateEmployeeCountConsistency(employeeCount: number, businessSize: BusinessSize): boolean {
    const ranges = {
      [BusinessSize.SOLO]: { min: 1, max: 1 },
      [BusinessSize.MICRO]: { min: 2, max: 9 },
      [BusinessSize.SMALL]: { min: 10, max: 49 },
      [BusinessSize.MEDIUM]: { min: 50, max: 249 },
      [BusinessSize.LARGE]: { min: 250, max: 999 },
      [BusinessSize.ENTERPRISE]: { min: 1000, max: Infinity },
    };

    const range = ranges[businessSize];
    return employeeCount >= range.min && employeeCount <= range.max;
  }

  /**
   * Validate revenue consistency with business size
   */
  static validateRevenueConsistency(revenueRange: RevenueRange, businessSize: BusinessSize): boolean {
    // Define expected revenue ranges for each business size
    const expectedRanges: Record<BusinessSize, RevenueRange[]> = {
      [BusinessSize.SOLO]: [RevenueRange.UNDER_10K, RevenueRange.FROM_10K_TO_50K],
      [BusinessSize.MICRO]: [RevenueRange.FROM_10K_TO_50K, RevenueRange.FROM_50K_TO_100K],
      [BusinessSize.SMALL]: [RevenueRange.FROM_50K_TO_100K, RevenueRange.FROM_100K_TO_500K],
      [BusinessSize.MEDIUM]: [RevenueRange.FROM_100K_TO_500K, RevenueRange.FROM_500K_TO_1M, RevenueRange.FROM_1M_TO_5M],
      [BusinessSize.LARGE]: [RevenueRange.FROM_1M_TO_5M, RevenueRange.FROM_5M_TO_10M, RevenueRange.OVER_10M],
      [BusinessSize.ENTERPRISE]: [RevenueRange.FROM_5M_TO_10M, RevenueRange.OVER_10M],
    };

    const allowedRanges = expectedRanges[businessSize];
    return allowedRanges.includes(revenueRange);
  }

  /**
   * Validate transaction volume consistency with business size
   */
  static validateTransactionVolumeConsistency(volumeRange: TransactionVolumeRange, businessSize: BusinessSize): boolean {
    // Define expected transaction volume ranges for each business size
    const expectedRanges: Record<BusinessSize, TransactionVolumeRange[]> = {
      [BusinessSize.SOLO]: [TransactionVolumeRange.UNDER_100, TransactionVolumeRange.FROM_100_TO_500],
      [BusinessSize.MICRO]: [TransactionVolumeRange.FROM_100_TO_500, TransactionVolumeRange.FROM_500_TO_1K],
      [BusinessSize.SMALL]: [TransactionVolumeRange.FROM_500_TO_1K, TransactionVolumeRange.FROM_1K_TO_5K],
      [BusinessSize.MEDIUM]: [TransactionVolumeRange.FROM_1K_TO_5K, TransactionVolumeRange.FROM_5K_TO_10K],
      [BusinessSize.LARGE]: [TransactionVolumeRange.FROM_5K_TO_10K, TransactionVolumeRange.FROM_10K_TO_50K],
      [BusinessSize.ENTERPRISE]: [TransactionVolumeRange.FROM_10K_TO_50K, TransactionVolumeRange.OVER_50K],
    };

    const allowedRanges = expectedRanges[businessSize];
    return allowedRanges.includes(volumeRange);
  }

  /**
   * Get validation errors for cross-field validation
   */
  static getCrossFieldValidationErrors(data: any): Record<string, string[]> {
    const errors: Record<string, string[]> = {};

    // Validate employee count consistency
    if (data.expectedEmployees && data.businessSize) {
      if (!this.validateEmployeeCountConsistency(data.expectedEmployees, data.businessSize)) {
        errors.expectedEmployees = errors.expectedEmployees || [];
        errors.expectedEmployees.push('Employee count is not consistent with selected business size');
      }
    }

    // Validate revenue consistency
    if (data.expectedRevenueRange && data.businessSize) {
      if (!this.validateRevenueConsistency(data.expectedRevenueRange, data.businessSize)) {
        errors.expectedRevenueRange = errors.expectedRevenueRange || [];
        errors.expectedRevenueRange.push('Revenue range is not typical for selected business size');
      }
    }

    // Validate transaction volume consistency
    if (data.expectedTransactionVolumeRange && data.businessSize) {
      if (!this.validateTransactionVolumeConsistency(data.expectedTransactionVolumeRange, data.businessSize)) {
        errors.expectedTransactionVolumeRange = errors.expectedTransactionVolumeRange || [];
        errors.expectedTransactionVolumeRange.push('Transaction volume is not typical for selected business size');
      }
    }

    return errors;
  }
}