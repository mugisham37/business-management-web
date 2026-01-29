import { ObjectType, Field, Float, Int, InputType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessTier } from '../entities/tenant.entity';

/**
 * Alternative tier suggestion
 */
@ObjectType()
export class TierAlternativeType {
  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Alternative tier' })
  tier!: BusinessTier;

  @Field()
  @ApiProperty({ description: 'Reason for suggesting this alternative' })
  reason!: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Potential savings in cents', required: false })
  savings?: number;
}

/**
 * Tier recommendation result
 */
@ObjectType()
export class TierRecommendationType {
  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Recommended business tier' })
  recommendedTier!: BusinessTier;

  @Field(() => Float)
  @ApiProperty({ description: 'Confidence score (0-1)' })
  confidence!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'Reasoning for the recommendation' })
  reasoning!: string[];

  @Field(() => [TierAlternativeType])
  @ApiProperty({ type: [TierAlternativeType], description: 'Alternative tier suggestions' })
  alternatives!: TierAlternativeType[];

  @Field(() => Int)
  @ApiProperty({ description: 'Monthly price in cents' })
  monthlyPrice!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Yearly price in cents' })
  yearlyPrice!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'Features included in this tier' })
  features!: string[];
}

/**
 * Price calculation result
 */
@ObjectType()
export class PriceCalculationType {
  @Field(() => Int)
  @ApiProperty({ description: 'Original price in cents' })
  originalPrice!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Final price after adjustments in cents' })
  finalPrice!: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Discount amount in cents', required: false })
  discount?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Proration amount in cents', required: false })
  prorationAmount?: number;

  @Field()
  @ApiProperty({ description: 'Effective date of the price change' })
  effectiveDate!: Date;

  @Field()
  @ApiProperty({ description: 'Next billing date' })
  nextBillingDate!: Date;
}

/**
 * Trial eligibility result
 */
@ObjectType()
export class TrialEligibilityType {
  @Field()
  @ApiProperty({ description: 'Whether the user is eligible for a trial' })
  isEligible!: boolean;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of trial days available' })
  trialDays!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reason for eligibility status', required: false })
  reason?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ description: 'Trial restrictions if any', required: false })
  restrictions?: string[];
}

/**
 * Tier pricing information
 */
@ObjectType()
export class TierPricingType {
  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Business tier' })
  tier!: BusinessTier;

  @Field(() => Int)
  @ApiProperty({ description: 'Monthly price in cents' })
  monthlyPrice!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Yearly price in cents' })
  yearlyPrice!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'Features included in this tier' })
  features!: string[];

  @Field(() => Int)
  @ApiProperty({ description: 'Trial days available' })
  trialDays!: number;

  @Field()
  @ApiProperty({ description: 'Tier description' })
  description!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Tier level (0-3)' })
  level!: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Yearly savings compared to monthly billing', required: false })
  yearlySavings?: number;
}

/**
 * Pricing comparison result
 */
@ObjectType()
export class PricingComparisonType {
  @Field(() => [TierPricingType])
  @ApiProperty({ type: [TierPricingType], description: 'All available tiers with pricing' })
  tiers!: TierPricingType[];

  @Field(() => TierRecommendationType, { nullable: true })
  @ApiProperty({ type: TierRecommendationType, description: 'Personalized recommendation if available', required: false })
  recommendation?: TierRecommendationType;

  @Field(() => BusinessTier, { nullable: true })
  @ApiProperty({ enum: BusinessTier, description: 'Current tier if applicable', required: false })
  currentTier?: BusinessTier;
}

/**
 * Input for calculating tier recommendation
 */
@InputType()
export class TierRecommendationInput {
  @Field()
  @ApiProperty({ description: 'Tenant ID to get business profile for recommendation' })
  tenantId!: string;
}

/**
 * Input for calculating upgrade price
 */
@InputType()
export class UpgradePriceInput {
  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Current tier' })
  currentTier!: BusinessTier;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Target tier' })
  targetTier!: BusinessTier;

  @Field(() => String, { defaultValue: 'monthly' })
  @ApiProperty({ description: 'Billing cycle', enum: ['monthly', 'yearly'], default: 'monthly' })
  billingCycle!: 'monthly' | 'yearly';

  @Field({ nullable: true })
  @ApiProperty({ description: 'Current billing date for proration calculation', required: false })
  currentBillingDate?: Date;
}

/**
 * Input for checking trial eligibility
 */
@InputType()
export class TrialEligibilityInput {
  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Tier to check trial eligibility for' })
  tier!: BusinessTier;

  @Field({ defaultValue: false })
  @ApiProperty({ description: 'Whether the user has already used a trial', default: false })
  hasUsedTrial!: boolean;

  @Field(() => BusinessTier, { nullable: true })
  @ApiProperty({ enum: BusinessTier, description: 'Current tier if applicable', required: false })
  currentTier?: BusinessTier;
}

/**
 * Pricing analysis result
 */
@ObjectType()
export class PricingAnalysisType {
  @Field(() => Int)
  @ApiProperty({ description: 'Employee score (0-4)' })
  employeeScore!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Location score (0-2)' })
  locationScore!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Revenue score (0-4)' })
  revenueScore!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Transaction score (0-4)' })
  transactionScore!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Industry score (0-2)' })
  industryScore!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Business type score (0-3)' })
  businessTypeScore!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total score' })
  totalScore!: number;
}