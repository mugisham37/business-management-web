import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, IsDateString, Length, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum CampaignType {
  LOYALTY_POINTS = 'loyalty_points',
  DISCOUNT = 'discount',
  PROMOTION = 'promotion',
  REFERRAL = 'referral',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

registerEnumType(CampaignType, {
  name: 'CampaignType',
});

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
});

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

  @Field(() => CampaignType)
  @IsEnum(CampaignType)
  type!: CampaignType;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10)
  pointsMultiplier?: number;

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
export class UpdateCampaignInput {
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

  @Field(() => CampaignStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10)
  pointsMultiplier?: number;

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
export class CampaignFilterInput {
  @Field(() => CampaignStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @Field(() => CampaignType, { nullable: true })
  @IsOptional()
  @IsEnum(CampaignType)
  type?: CampaignType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDateAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  startDateBefore?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDateAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  endDateBefore?: string;

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