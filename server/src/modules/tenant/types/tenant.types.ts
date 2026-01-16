import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { BusinessTier, SubscriptionStatus, BusinessMetrics, TenantSettings } from '../entities/tenant.entity';

/**
 * Tenant context information for GraphQL responses
 */
@ObjectType()
export class TenantContextType {
  @Field(() => ID)
  tenantId!: string;

  @Field(() => BusinessTier)
  businessTier!: BusinessTier;

  @Field(() => SubscriptionStatus)
  subscriptionStatus!: SubscriptionStatus;

  @Field()
  isActive!: boolean;

  @Field(() => BusinessMetrics)
  metrics!: BusinessMetrics;
}

/**
 * Tier benefits and features information
 */
@ObjectType()
export class TierBenefitsType {
  @Field(() => BusinessTier)
  tier!: BusinessTier;

  @Field()
  description!: string;

  @Field(() => [String])
  features!: string[];

  @Field(() => TierLimitsType)
  limits!: TierLimitsType;
}

/**
 * Tier limits information
 */
@ObjectType()
export class TierLimitsType {
  @Field(() => Int)
  employees!: number;

  @Field(() => Int)
  locations!: number;

  @Field(() => Int)
  monthlyTransactions!: number;

  @Field(() => Int)
  products!: number;

  @Field(() => Int)
  customers!: number;
}

/**
 * Metrics validation result
 */
@ObjectType()
export class MetricsValidationType {
  @Field()
  isValid!: boolean;

  @Field(() => [String])
  errors!: string[];

  @Field(() => [String])
  warnings!: string[];
}

/**
 * Tenant statistics and analytics
 */
@ObjectType()
export class TenantStatisticsType {
  @Field(() => ID)
  tenantId!: string;

  @Field(() => Int)
  totalEmployees!: number;

  @Field(() => Int)
  totalLocations!: number;

  @Field(() => Int)
  totalTransactions!: number;

  @Field(() => Float)
  totalRevenue!: number;

  @Field(() => Float)
  averageTransactionValue!: number;

  @Field(() => Int)
  activeUsers!: number;

  @Field()
  lastActivityAt!: Date;
}

/**
 * Tenant health status
 */
@ObjectType()
export class TenantHealthType {
  @Field(() => ID)
  tenantId!: string;

  @Field()
  status!: string; // healthy, warning, critical

  @Field(() => Int)
  healthScore!: number; // 0-100

  @Field(() => [String])
  issues!: string[];

  @Field(() => [String])
  recommendations!: string[];

  @Field()
  lastCheckedAt!: Date;
}

/**
 * Subscription details
 */
@ObjectType()
export class SubscriptionDetailsType {
  @Field(() => SubscriptionStatus)
  status!: SubscriptionStatus;

  @Field(() => BusinessTier)
  tier!: BusinessTier;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field({ nullable: true })
  trialEndDate?: Date;

  @Field(() => Int, { nullable: true })
  daysRemaining?: number;

  @Field()
  isTrialActive!: boolean;

  @Field()
  isSubscriptionActive!: boolean;
}

/**
 * Tenant comparison result
 */
@ObjectType()
export class TenantComparisonType {
  @Field(() => ID)
  tenantId!: string;

  @Field()
  name!: string;

  @Field(() => BusinessTier)
  tier!: BusinessTier;

  @Field(() => BusinessMetrics)
  metrics!: BusinessMetrics;

  @Field(() => Float)
  performanceScore!: number;

  @Field(() => Int)
  rank!: number;
}

/**
 * Bulk operation result
 */
@ObjectType()
export class BulkOperationResultType {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  successful!: number;

  @Field(() => Int)
  failed!: number;

  @Field(() => [String])
  errors!: string[];

  @Field()
  completedAt!: Date;
}

/**
 * Tenant activity log entry
 */
@ObjectType()
export class TenantActivityType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field()
  action!: string;

  @Field()
  resource!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  timestamp!: Date;

  @Field({ nullable: true })
  metadata?: string; // JSON string
}

/**
 * Tier change history entry
 */
@ObjectType()
export class TierChangeHistoryType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field(() => BusinessTier)
  previousTier!: BusinessTier;

  @Field(() => BusinessTier)
  newTier!: BusinessTier;

  @Field(() => BusinessMetrics)
  metricsAtChange!: BusinessMetrics;

  @Field()
  changedAt!: Date;

  @Field({ nullable: true })
  reason?: string;
}

/**
 * Tenant onboarding status
 */
@ObjectType()
export class TenantOnboardingType {
  @Field(() => ID)
  tenantId!: string;

  @Field(() => Int)
  completionPercentage!: number;

  @Field(() => [String])
  completedSteps!: string[];

  @Field(() => [String])
  pendingSteps!: string[];

  @Field()
  isComplete!: boolean;

  @Field({ nullable: true })
  completedAt?: Date;
}

/**
 * Tenant settings validation
 */
@ObjectType()
export class SettingsValidationType {
  @Field()
  isValid!: boolean;

  @Field(() => [String])
  errors!: string[];

  @Field(() => TenantSettings, { nullable: true })
  validatedSettings?: TenantSettings;
}
