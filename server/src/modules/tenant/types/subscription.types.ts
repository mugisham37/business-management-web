import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BusinessTier, SubscriptionStatus } from '../entities/tenant.entity';

/**
 * Billing cycle enum
 */
export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Trial notification type
 */
export enum TrialNotificationType {
  WARNING = 'warning',
  FINAL = 'final',
  EXPIRED = 'expired',
}

// Register enums for GraphQL
registerEnumType(BillingCycle, {
  name: 'BillingCycle',
  description: 'Subscription billing cycle',
});

registerEnumType(TrialNotificationType, {
  name: 'TrialNotificationType',
  description: 'Type of trial expiration notification',
});

/**
 * Price override for custom pricing
 */
@ObjectType()
export class PriceOverrideType {
  @Field()
  @ApiProperty({ description: 'Reason for the price override' })
  reason!: string;

  @Field()
  @ApiProperty({ description: 'Original price in cents' })
  originalPrice!: number;

  @Field()
  @ApiProperty({ description: 'Override price in cents' })
  overridePrice!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Expiration date for the override', required: false })
  expiresAt?: Date;
}

/**
 * Subscription details
 */
@ObjectType()
export class SubscriptionType {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique subscription identifier' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Subscription tier' })
  tier!: BusinessTier;

  @Field(() => SubscriptionStatus)
  @ApiProperty({ enum: SubscriptionStatus, description: 'Subscription status' })
  status!: SubscriptionStatus;

  @Field(() => BillingCycle)
  @ApiProperty({ enum: BillingCycle, description: 'Billing cycle' })
  billingCycle!: BillingCycle;

  @Field()
  @ApiProperty({ description: 'Current billing period start date' })
  currentPeriodStart!: Date;

  @Field()
  @ApiProperty({ description: 'Current billing period end date' })
  currentPeriodEnd!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Trial start date', required: false })
  trialStart?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Trial end date', required: false })
  trialEnd?: Date;

  @Field()
  @ApiProperty({ description: 'Whether subscription will be canceled at period end' })
  cancelAtPeriodEnd!: boolean;

  @Field(() => [PriceOverrideType], { nullable: true })
  @ApiProperty({ type: [PriceOverrideType], description: 'Price overrides if any', required: false })
  priceOverrides?: PriceOverrideType[];

  @Field()
  @ApiProperty({ description: 'Subscription creation date' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Last update date' })
  updatedAt!: Date;
}

/**
 * Trial subscription details
 */
@ObjectType()
export class TrialSubscriptionType {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Trial tier' })
  tier!: BusinessTier;

  @Field()
  @ApiProperty({ description: 'Trial start date' })
  trialStart!: Date;

  @Field()
  @ApiProperty({ description: 'Trial end date' })
  trialEnd!: Date;

  @Field()
  @ApiProperty({ description: 'Days remaining in trial' })
  daysRemaining!: number;

  @Field()
  @ApiProperty({ description: 'Whether trial is currently active' })
  isActive!: boolean;

  @Field()
  @ApiProperty({ description: 'Whether trial has expired' })
  hasExpired!: boolean;
}

/**
 * Subscription change result
 */
@ObjectType()
export class SubscriptionChangeResultType {
  @Field()
  @ApiProperty({ description: 'Whether the operation was successful' })
  success!: boolean;

  @Field(() => SubscriptionType)
  @ApiProperty({ type: SubscriptionType, description: 'Updated subscription details' })
  subscription!: SubscriptionType;

  @Field()
  @ApiProperty({ description: 'Result message' })
  message!: string;
}

/**
 * Trial expiration notification
 */
@ObjectType()
export class TrialExpirationNotificationType {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Trial tier' })
  tier!: BusinessTier;

  @Field()
  @ApiProperty({ description: 'Days remaining in trial' })
  daysRemaining!: number;

  @Field()
  @ApiProperty({ description: 'Trial end date' })
  trialEnd!: Date;

  @Field(() => TrialNotificationType)
  @ApiProperty({ enum: TrialNotificationType, description: 'Type of notification' })
  notificationType!: TrialNotificationType;
}

/**
 * Trial processing summary
 */
@ObjectType()
export class TrialProcessingSummaryType {
  @Field()
  @ApiProperty({ description: 'Number of trials processed' })
  processed!: number;

  @Field()
  @ApiProperty({ description: 'Number of subscriptions downgraded' })
  downgraded!: number;

  @Field()
  @ApiProperty({ description: 'Number of errors encountered' })
  errors!: number;
}

/**
 * Input for creating trial subscription
 */
@InputType()
export class CreateTrialSubscriptionInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Trial tier' })
  tier!: BusinessTier;
}

/**
 * Input for upgrading subscription
 */
@InputType()
export class UpgradeSubscriptionInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Target tier' })
  targetTier!: BusinessTier;

  @Field(() => BillingCycle, { defaultValue: BillingCycle.MONTHLY })
  @ApiProperty({ enum: BillingCycle, description: 'Billing cycle', default: BillingCycle.MONTHLY })
  billingCycle!: BillingCycle;
}

/**
 * Input for downgrading subscription
 */
@InputType()
export class DowngradeSubscriptionInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field(() => BusinessTier)
  @ApiProperty({ enum: BusinessTier, description: 'Target tier' })
  targetTier!: BusinessTier;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Effective date for downgrade', required: false })
  effectiveDate?: Date;
}

/**
 * Input for canceling subscription
 */
@InputType()
export class CancelSubscriptionInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field({ defaultValue: true })
  @ApiProperty({ description: 'Whether to cancel at period end', default: true })
  cancelAtPeriodEnd!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Reason for cancellation', required: false })
  reason?: string;
}

/**
 * Input for getting subscription details
 */
@InputType()
export class GetSubscriptionInput {
  @Field(() => ID)
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;
}