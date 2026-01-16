import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNumber, Min, Max, IsBoolean, IsArray, ValidateNested, Length, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessTier } from '../entities/tenant.entity';
import { FeatureFlagStatus } from '../entities/feature-flag.entity';

/**
 * Input for feature flag filtering
 */
@InputType()
export class FeatureFlagFilterInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  featureNames?: string[];

  @Field(() => [FeatureFlagStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(FeatureFlagStatus, { each: true })
  statuses?: FeatureFlagStatus[];

  @Field(() => [BusinessTier], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BusinessTier, { each: true })
  requiredTiers?: BusinessTier[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Input for feature rollout configuration
 */
@InputType()
export class FeatureRolloutInput {
  @Field()
  @IsString()
  @Length(1, 100)
  @Matches(/^[a-z0-9-]+$/)
  featureName!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(100)
  targetPercentage!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  incrementPercentage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  incrementIntervalHours?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTenantIds?: string[];

  @Field(() => [BusinessTier], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BusinessTier, { each: true })
  targetTiers?: BusinessTier[];
}

/**
 * Input for feature rule creation
 */
@InputType()
export class CreateFeatureRuleInput {
  @Field()
  @IsString()
  @Length(1, 500)
  condition!: string;

  @Field()
  @IsBoolean()
  value!: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority?: number;
}

/**
 * Input for bulk feature flag operations
 */
@InputType()
export class BulkFeatureFlagOperationInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  featureNames!: string[];

  @Field()
  @IsString()
  @IsEnum(['enable', 'disable', 'rollout', 'rollback'])
  operation!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  rolloutPercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Input for feature dependency management
 */
@InputType()
export class FeatureDependencyInput {
  @Field()
  @IsString()
  featureName!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  dependencies!: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enforceStrict?: boolean;
}

/**
 * Input for feature usage tracking
 */
@InputType()
export class TrackFeatureUsageInput {
  @Field()
  @IsString()
  featureName!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  action?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metadata?: string; // JSON string
}

/**
 * Input for feature recommendation query
 */
@InputType()
export class FeatureRecommendationQueryInput {
  @Field(() => ID)
  @IsString()
  tenantId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeUpgradeRequired?: boolean;
}

/**
 * Input for feature impact analysis
 */
@InputType()
export class FeatureImpactAnalysisInput {
  @Field()
  @IsString()
  featureName!: string;

  @Field()
  @IsString()
  @IsEnum(['enable', 'disable', 'update'])
  operation!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeTransitiveDependencies?: boolean;
}

/**
 * Input for feature gate evaluation
 */
@InputType()
export class FeatureGateEvaluationInput {
  @Field()
  @IsString()
  featureName!: string;

  @Field(() => ID)
  @IsString()
  tenantId!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  context?: string; // JSON string with additional context
}

/**
 * Input for feature category management
 */
@InputType()
export class FeatureCategoryInput {
  @Field()
  @IsString()
  @Length(1, 50)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

/**
 * Input for feature A/B testing
 */
@InputType()
export class FeatureABTestInput {
  @Field()
  @IsString()
  featureName!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  testName!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(100)
  variantAPercentage!: number;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(100)
  variantBPercentage!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  variantAConfig?: string; // JSON

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  variantBConfig?: string; // JSON

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;
}

/**
 * Input for feature scheduling
 */
@InputType()
export class FeatureScheduleInput {
  @Field()
  @IsString()
  featureName!: string;

  @Field()
  @IsString()
  @IsEnum(['enable', 'disable'])
  action!: string;

  @Field()
  @IsString()
  scheduledAt!: string; // ISO date string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  recurring?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  cronExpression?: string;
}
