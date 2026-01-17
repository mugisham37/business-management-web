import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsNumber, IsArray, IsDateString, Length, Min, Max, IsUUID } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum CustomerType {
  INDIVIDUAL = 'individual',
  BUSINESS = 'business',
}

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCKED = 'blocked',
  PROSPECT = 'prospect',
}

export enum LoyaltyTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond',
}

registerEnumType(CustomerType, {
  name: 'CustomerType',
});

registerEnumType(CustomerStatus, {
  name: 'CustomerStatus',
});

registerEnumType(LoyaltyTier, {
  name: 'LoyaltyTier',
});

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsEnum(CustomerType)
  type!: CustomerType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  alternatePhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  addressLine1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  addressLine2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  taxId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailOptIn?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsOptIn?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  referredBy?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  customFields?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  preferences?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  socialProfiles?: Record<string, any>;
}

@InputType()
export class UpdateCustomerInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 200)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  companyName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  alternatePhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  website?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  addressLine1?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  addressLine2?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  postalCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  country?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  taxId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(365)
  paymentTerms?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsEnum(LoyaltyTier)
  loyaltyTier?: LoyaltyTier;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  emailOptIn?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  smsOptIn?: boolean;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 5000)
  notes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  referralCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  anniversary?: string;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  customFields?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  preferences?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @IsOptional()
  socialProfiles?: Record<string, any>;
}

@InputType()
export class CustomerFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => CustomerType, { nullable: true })
  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @Field(() => CustomerStatus, { nullable: true })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;

  @Field(() => LoyaltyTier, { nullable: true })
  @IsOptional()
  @IsEnum(LoyaltyTier)
  loyaltyTier?: LoyaltyTier;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  city?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  state?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minTotalSpent?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxTotalSpent?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  minChurnRisk?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  maxChurnRisk?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lastPurchaseAfter?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  lastPurchaseBefore?: string;

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
