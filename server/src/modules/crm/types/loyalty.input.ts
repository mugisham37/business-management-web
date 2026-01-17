import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, IsDateString, Length, Min, Max, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CampaignType } from './campaign.input';

export enum LoyaltyTransactionType {
  EARNED = 'earned',
  REDEEMED = 'redeemed',
  EXPIRED = 'expired',
  ADJUSTED = 'adjusted',
}

export enum RewardType {
  DISCOUNT_PERCENTAGE = 'discount_percentage',
  DISCOUNT_FIXED = 'discount_fixed',
  FREE_PRODUCT = 'free_product',
  FREE_SHIPPING = 'free_shipping',
  STORE_CREDIT = 'store_credit',
  CUSTOM = 'custom',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(LoyaltyTransactionType, {
  name: 'LoyaltyTransactionType',
});

registerEnumType(RewardType, {
  name: 'RewardType',
});

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
});

@InputType()
export class CreateLoyaltyTransactionInput {
  @Field()
  @IsUUID()
  customerId!: string;

  @Field(() => LoyaltyTransactionType)
  @IsEnum(LoyaltyTransactionType)
  type!: LoyaltyTransactionType;

  @Field(() => Int)
  @IsNumber()
  points!: number;

  @Field()
  @IsString()
  @Length(1, 500)
  description!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  relatedTransactionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  promotionId?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateLoyaltyTransactionInput {
  @Field(() => LoyaltyTransactionType, { nullable: true })
  @IsOptional()
  @IsEnum(LoyaltyTransactionType)
  type?: LoyaltyTransactionType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  points?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  relatedTransactionId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  promotionId?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class CreateRewardInput {
  @Field()
  @IsString()
  @Length(1, 255)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => RewardType)
  @IsEnum(RewardType)
  type!: RewardType;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  pointsRequired!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderValue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUsageLimit?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTiers?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  termsAndConditions?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class UpdateRewardInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  pointsRequired?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderValue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimitPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalUsageLimit?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredTiers?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  termsAndConditions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class CreateCampaignInput {
  @Field()
  @IsString()
  @Length(1, 255)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field(() => CampaignType)
  @IsEnum(CampaignType)
  type!: CampaignType;

  @Field(() => Float)
  @IsNumber()
  @Min(0.1)
  @Max(10)
  pointsMultiplier!: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumPurchaseAmount?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  targetSegments?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTiers?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableCategories?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  applicableProducts?: string[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPointsPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalPointsBudget?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  termsAndConditions?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  metadata?: Record<string, any>;
}

@InputType()
export class LoyaltyTransactionFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @Field(() => LoyaltyTransactionType, { nullable: true })
  @IsOptional()
  @IsEnum(LoyaltyTransactionType)
  type?: LoyaltyTransactionType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  campaignId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}

@InputType()
export class RewardFilterInput {
  @Field(() => RewardType, { nullable: true })
  @IsOptional()
  @IsEnum(RewardType)
  type?: RewardType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activeOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  availableOnly?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPointsRequired?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
