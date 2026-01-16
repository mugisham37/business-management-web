import { InputType, Field, Int, Float, ID } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsNumber, Min, IsBoolean, IsDate, IsArray, ValidateNested, Length, Matches, IsEmail, IsPhoneNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { BusinessTier, SubscriptionStatus } from '../entities/tenant.entity';

/**
 * Input for tenant search and filtering
 */
@InputType()
export class TenantFilterInput {
  @Field(() => [BusinessTier], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(BusinessTier, { each: true })
  businessTiers?: BusinessTier[];

  @Field(() => [SubscriptionStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(SubscriptionStatus, { each: true })
  subscriptionStatuses?: SubscriptionStatus[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAfter?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdBefore?: Date;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minEmployeeCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxEmployeeCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minLocationCount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxLocationCount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minMonthlyRevenue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxMonthlyRevenue?: number;
}

/**
 * Input for tenant sorting
 */
@InputType()
export class TenantSortInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['name', 'slug', 'createdAt', 'updatedAt', 'businessTier', 'subscriptionStatus'])
  field?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  direction?: 'ASC' | 'DESC';
}

/**
 * Input for pagination
 */
@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  page!: number;

  @Field(() => Int, { defaultValue: 20 })
  @IsNumber()
  @Min(1)
  limit!: number;
}

/**
 * Input for bulk tenant operations
 */
@InputType()
export class BulkTenantOperationInput {
  @Field(() => [ID])
  @IsArray()
  @IsString({ each: true })
  tenantIds!: string[];

  @Field()
  @IsString()
  @IsEnum(['activate', 'deactivate', 'suspend', 'delete'])
  operation!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Input for tenant settings update
 */
@InputType()
export class UpdateTenantSettingsInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(2, 10)
  locale?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  primaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-F]{6}$/i)
  secondaryColor?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  companyAddress?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  enableAnalytics?: boolean;
}

/**
 * Input for subscription management
 */
@InputType()
export class UpdateSubscriptionInput {
  @Field(() => SubscriptionStatus)
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @Field(() => BusinessTier, { nullable: true })
  @IsOptional()
  @IsEnum(BusinessTier)
  tier?: BusinessTier;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Input for tenant contact information
 */
@InputType()
export class UpdateTenantContactInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  contactTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  billingEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supportEmail?: string;
}

/**
 * Input for metrics tracking event
 */
@InputType()
export class TrackMetricsEventInput {
  @Field()
  @IsString()
  @IsEnum(['transaction', 'employee', 'location', 'revenue'])
  eventType!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  metadata?: string; // JSON string

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  value?: number;
}

/**
 * Input for tenant comparison
 */
@InputType()
export class TenantComparisonInput {
  @Field(() => [ID])
  @IsArray()
  @IsString({ each: true })
  tenantIds!: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];
}

/**
 * Input for tenant activity query
 */
@InputType()
export class TenantActivityQueryInput {
  @Field(() => ID)
  @IsString()
  tenantId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actions?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  resources?: string[];

  @Field(() => PaginationInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationInput)
  pagination?: PaginationInput;
}
