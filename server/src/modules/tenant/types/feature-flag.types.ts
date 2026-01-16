import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { BusinessTier } from '../entities/tenant.entity';
import { FeatureFlagStatus } from '../entities/feature-flag.entity';

/**
 * Feature usage statistics
 */
@ObjectType()
export class FeatureUsageType {
  @Field()
  featureName!: string;

  @Field(() => Int)
  usageCount!: number;

  @Field(() => Int)
  uniqueUsers!: number;

  @Field()
  lastUsedAt!: Date;

  @Field(() => Float)
  adoptionRate!: number; // percentage
}

/**
 * Feature rollout status
 */
@ObjectType()
export class FeatureRolloutType {
  @Field()
  featureName!: string;

  @Field(() => Int)
  rolloutPercentage!: number;

  @Field(() => Int)
  enabledTenants!: number;

  @Field(() => Int)
  totalTenants!: number;

  @Field(() => FeatureFlagStatus)
  status!: FeatureFlagStatus;

  @Field()
  startedAt!: Date;

  @Field({ nullable: true })
  completedAt?: Date;
}

/**
 * Feature comparison across tiers
 */
@ObjectType()
export class FeatureTierComparisonType {
  @Field(() => BusinessTier)
  tier!: BusinessTier;

  @Field(() => Int)
  totalFeatures!: number;

  @Field(() => [String])
  availableFeatures!: string[];

  @Field(() => [String])
  unavailableFeatures!: string[];
}

/**
 * Feature dependency graph
 */
@ObjectType()
export class FeatureDependencyGraphType {
  @Field()
  featureName!: string;

  @Field(() => [String])
  directDependencies!: string[];

  @Field(() => [String])
  allDependencies!: string[]; // includes transitive

  @Field(() => [String])
  dependents!: string[]; // features that depend on this

  @Field(() => Int)
  dependencyDepth!: number;
}

/**
 * Feature adoption metrics
 */
@ObjectType()
export class FeatureAdoptionType {
  @Field()
  featureName!: string;

  @Field(() => Int)
  totalEligibleTenants!: number;

  @Field(() => Int)
  adoptedTenants!: number;

  @Field(() => Float)
  adoptionRate!: number;

  @Field(() => Float)
  averageTimeToAdopt!: number; // in days

  @Field(() => [String])
  topAdoptingTiers!: string[];
}

/**
 * Feature performance metrics
 */
@ObjectType()
export class FeaturePerformanceType {
  @Field()
  featureName!: string;

  @Field(() => Float)
  averageResponseTime!: number; // in ms

  @Field(() => Int)
  errorCount!: number;

  @Field(() => Float)
  errorRate!: number; // percentage

  @Field(() => Float)
  successRate!: number; // percentage

  @Field()
  lastMeasuredAt!: Date;
}

/**
 * Feature flag audit entry
 */
@ObjectType()
export class FeatureFlagAuditType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field()
  featureName!: string;

  @Field()
  action!: string; // enabled, disabled, updated

  @Field({ nullable: true })
  previousValue?: string; // JSON

  @Field({ nullable: true })
  newValue?: string; // JSON

  @Field({ nullable: true })
  userId?: string;

  @Field()
  timestamp!: Date;
}

/**
 * Feature recommendation
 */
@ObjectType()
export class FeatureRecommendationType {
  @Field()
  featureName!: string;

  @Field()
  displayName!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  relevanceScore!: number; // 0-100

  @Field(() => [String])
  reasons!: string[];

  @Field(() => BusinessTier, { nullable: true })
  requiredTier?: BusinessTier;

  @Field()
  isUpgradeRequired!: boolean;
}

/**
 * Feature impact analysis
 */
@ObjectType()
export class FeatureImpactType {
  @Field()
  featureName!: string;

  @Field(() => [String])
  affectedFeatures!: string[];

  @Field(() => [String])
  affectedUsers!: string[];

  @Field(() => Int)
  estimatedImpact!: number; // 1-10 scale

  @Field(() => [String])
  risks!: string[];

  @Field(() => [String])
  benefits!: string[];
}

/**
 * Feature category statistics
 */
@ObjectType()
export class FeatureCategoryStatsType {
  @Field()
  category!: string;

  @Field(() => Int)
  totalFeatures!: number;

  @Field(() => Int)
  enabledFeatures!: number;

  @Field(() => Int)
  disabledFeatures!: number;

  @Field(() => Float)
  adoptionRate!: number;

  @Field(() => [String])
  topFeatures!: string[];
}

/**
 * Feature gate evaluation result
 */
@ObjectType()
export class FeatureGateEvaluationType {
  @Field()
  featureName!: string;

  @Field()
  isAllowed!: boolean;

  @Field(() => [String])
  passedRules!: string[];

  @Field(() => [String])
  failedRules!: string[];

  @Field({ nullable: true })
  reason?: string;

  @Field()
  evaluatedAt!: Date;
}
