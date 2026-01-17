import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, IsDateString, Length, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentTermsType {
  NET_15 = 'net_15',
  NET_30 = 'net_30',
  NET_45 = 'net_45',
  NET_60 = 'net_60',
  NET_90 = 'net_90',
  COD = 'cod',
  PREPAID = 'prepaid',
  CUSTOM = 'custom',
}

export enum CreditStatus {
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  UNDER_REVIEW = 'under_review',
}

export enum PricingTier {
  STANDARD = 'standard',
  PREFERRED = 'preferred',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

registerEnumType(PaymentTermsType, {
  name: 'PaymentTermsType',
});

registerEnumType(CreditStatus, {
  name: 'CreditStatus',
});

registerEnumType(PricingTier, {
  name: 'PricingTier',
});

@InputType()
export class CreateB2BCustomerInput {
  @Field()
  @IsString()
  @Length(1, 255)
  companyName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactFirstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactLastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactTitle?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  taxId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  dunsNumber?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  creditLimit!: number;

  @Field(() => PaymentTermsType)
  @IsEnum(PaymentTermsType)
  paymentTerms!: PaymentTermsType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  customPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  earlyPaymentDiscountPercentage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  earlyPaymentDiscountDays?: number;

  @Field(() => PricingTier)
  @IsEnum(PricingTier)
  pricingTier!: PricingTier;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volumeDiscountPercentage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  accountManagerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  industry?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredCategories?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  billingAddressLine1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  billingAddressLine2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  billingCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  billingState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  billingPostalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  billingCountry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  shippingAddressLine1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  shippingAddressLine2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  shippingCity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  shippingState?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  shippingPostalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  shippingCountry?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  specialInstructions?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  b2bMetadata?: Record<string, any>;
}

@InputType()
export class UpdateB2BCustomerInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactFirstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactLastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  primaryContactTitle?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @Field(() => PaymentTermsType, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentTermsType)
  paymentTerms?: PaymentTermsType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  customPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  earlyPaymentDiscountPercentage?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  earlyPaymentDiscountDays?: number;

  @Field(() => PricingTier, { nullable: true })
  @IsOptional()
  @IsEnum(PricingTier)
  pricingTier?: PricingTier;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  volumeDiscountPercentage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @Field(() => CreditStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CreditStatus)
  creditStatus?: CreditStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  accountManagerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  industry?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  employeeCount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRevenue?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  b2bMetadata?: Record<string, any>;
}

@InputType()
export class B2BCustomerFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => CreditStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CreditStatus)
  creditStatus?: CreditStatus;

  @Field(() => PricingTier, { nullable: true })
  @IsOptional()
  @IsEnum(PricingTier)
  pricingTier?: PricingTier;

  @Field(() => PaymentTermsType, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentTermsType)
  paymentTerms?: PaymentTermsType;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  salesRepId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  accountManagerId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minCreditLimit?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxCreditLimit?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minAnnualRevenue?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxAnnualRevenue?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  contractExpiringWithinDays?: number;

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
