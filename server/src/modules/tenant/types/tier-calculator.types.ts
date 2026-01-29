import { ObjectType, Field, Int, Float, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessTier } from '../entities/tenant.entity';
import { BusinessMetrics } from '../entities/tenant.entity';

/**
 * Tier change trigger type
 */
export enum TierChangeTrigger {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  SYSTEM = 'system',
}

/**
 * Upgrade urgency level
 */
export enum UpgradeUrgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

// Register enums for GraphQL
registerEnumType(TierChangeTrigger, {
  name: 'TierChangeTrigger',
  description: 'How the tier change was triggered',
});

registerEnumType(UpgradeUrgency, {
  name: 'UpgradeUrgency',
  description: 'Urgency level for tier upgrade recommendations',
});

/**
 * Tier evaluation result
 */
@ObjectType()
export class TierEvaluationResultType {
  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Current business tier' })
  currentTier!: BusinessTier;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Recommended business tier' })
  recommendedTier!: BusinessTier;

  @Field()
  @ApiProperty({ description: 'Whether an upgrade is recommended' })
  shouldUpgrade!: boolean;

  @Field()
  @ApiProperty({ description: 'Whether a downgrade is recommended' })
  shouldDowngrade!: boolean;

  @Field(() => Float)
  @ApiProperty({ description: 'Confidence score (0-1)' })
  confidence!: number;

  @Field(() => [String])
  @ApiProperty({ description: 'Reasons for the recommendation' })
  reasons!: string[];

  @Field(() => BusinessMetrics)
  @ApiProperty({ type: BusinessMetrics, description: 'Current business metrics' })
  metrics!: BusinessMetrics;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of thresholds met' })
  thresholdsMet!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total number of thresholds' })
  totalThresholds!: number;
}

/**
 * Tier change audit log entry
 */
@ObjectType()
export class TierChangeAuditLogType {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for the audit log entry' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Previous business tier' })
  previousTier!: BusinessTier;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'New business tier' })
  newTier!: BusinessTier;

  @Field()
  @ApiProperty({ description: 'Reason for the tier change' })
  reason!: string;

  @Field(() => TierChangeTrigger)
  @ApiProperty({ enum: TierChangeTrigger, description: 'How the change was triggered' })
  triggeredBy!: TierChangeTrigger;

  @Field(() => BusinessMetrics)
  @ApiProperty({ type: BusinessMetrics, description: 'Business metrics at the time of change' })
  metricsAtChange!: BusinessMetrics;

  @Field()
  @ApiProperty({ description: 'Timestamp of the tier change' })
  timestamp!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User ID who triggered the change', required: false })
  userId?: string;
}

/**
 * Upgrade recommendation
 */
@ObjectType()
export class UpgradeRecommendationType {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Current business tier' })
  currentTier!: BusinessTier;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Recommended business tier' })
  recommendedTier!: BusinessTier;

  @Field(() => UpgradeUrgency)
  @ApiProperty({ enum: UpgradeUrgency, description: 'Urgency level for the upgrade' })
  urgency!: UpgradeUrgency;

  @Field(() => [String])
  @ApiProperty({ description: 'Reasons for the upgrade recommendation' })
  reasons!: string[];

  @Field(() => BusinessMetrics)
  @ApiProperty({ type: BusinessMetrics, description: 'Current business metrics' })
  metrics!: BusinessMetrics;

  @Field(() => [String])
  @ApiProperty({ description: 'Estimated benefits of upgrading' })
  estimatedBenefit!: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Recommended actions to take' })
  recommendedActions!: string[];
}

/**
 * Automatic tier upgrade result
 */
@ObjectType()
export class AutomaticTierUpgradeResultType {
  @Field()
  @ApiProperty({ description: 'Whether the upgrade was performed' })
  upgraded!: boolean;

  @Field(() => BusinessTier, { nullable: true })
  @ApiProperty({ enum: BusinessTier, description: 'Previous tier before upgrade', required: false })
  previousTier?: BusinessTier;

  @Field(() => BusinessTier, { nullable: true })
  @ApiProperty({ enum: BusinessTier, description: 'New tier after upgrade', required: false })
  newTier?: BusinessTier;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reason for upgrade or why it was not performed', required: false })
  reason?: string;
}

/**
 * Tier evaluation summary
 */
@ObjectType()
export class TierEvaluationSummaryType {
  @Field(() => Int)
  @ApiProperty({ description: 'Total number of tenants evaluated' })
  totalEvaluated!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of high urgency recommendations' })
  highUrgency!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of medium urgency recommendations' })
  mediumUrgency!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Number of low urgency recommendations' })
  lowUrgency!: number;

  @Field()
  @ApiProperty({ description: 'Timestamp of the evaluation' })
  timestamp!: Date;
}

/**
 * Input for tier evaluation
 */
@InputType()
export class TierEvaluationInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID to evaluate' })
  tenantId!: string;
}

/**
 * Input for manual tier change
 */
@InputType()
export class ManualTierChangeInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'New business tier' })
  newTier!: BusinessTier;

  @Field()
  @ApiProperty({ description: 'Reason for the tier change' })
  reason!: string;
}

/**
 * Input for automatic tier upgrade
 */
@InputType()
export class AutomaticTierUpgradeInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID to process upgrade for' })
  tenantId!: string;
}

/**
 * Input for upgrade recommendations query
 */
@InputType()
export class UpgradeRecommendationsInput {
  @Field(() => Int, { defaultValue: 50 })
  @ApiProperty({ description: 'Maximum number of recommendations to return', default: 50 })
  limit!: number;

  @Field(() => UpgradeUrgency, { nullable: true })
  @ApiProperty({ enum: UpgradeUrgency, description: 'Filter by urgency level', required: false })
  urgencyFilter?: UpgradeUrgency;
}

/**
 * Input for tier change history query
 */
@InputType()
export class TierChangeHistoryInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID to get history for' })
  tenantId!: string;

  @Field(() => Int, { defaultValue: 20 })
  @ApiProperty({ description: 'Maximum number of history entries to return', default: 20 })
  limit!: number;
}