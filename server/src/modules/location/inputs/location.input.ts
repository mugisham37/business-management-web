import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsUUID,
  IsNumber,
  IsEnum,
  IsBoolean,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
  Max,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { 
  LocationType, 
  LocationStatus,
} from '../dto/location.dto';
import {
  FranchiseType,
  FranchiseStatus,
  TerritoryType,
  AssignmentType,
} from '../entities/franchise.entity';
import {
  PricingRuleType,
  PricingRuleStatus,
} from '../dto/location-pricing.dto';
import {
  PromotionType,
  PromotionStatus,
  PromotionTargetType,
} from '../dto/location-promotion.dto';
import {
  InventoryPolicyType,
  InventoryPolicyStatus,
  StockReplenishmentMethod,
  ABCClassification,
} from '../dto/location-inventory-policy.dto';
import {
  ReportType,
  GroupByType,
  DrillDownLevel,
  ComparisonType,
} from '../dto/location-reporting.dto';

// Basic inputs
@InputType()
export class CoordinatesInput {
  @Field(() => Float)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}

@InputType()
export class AddressInput {
  @Field()
  @IsString()
  @Length(1, 255)
  street!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  city!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  state!: string;

  @Field()
  @IsString()
  @Length(1, 100)
  country!: string;

  @Field()
  @IsString()
  @Length(1, 20)
  postalCode!: string;

  @Field(() => CoordinatesInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesInput)
  coordinates?: CoordinatesInput;
}

@InputType()
export class DayHoursInput {
  @Field()
  @IsString()
  open!: string;

  @Field()
  @IsString()
  close!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  closed?: boolean;
}

@InputType()
export class OperatingHoursInput {
  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  monday?: DayHoursInput;

  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  tuesday?: DayHoursInput;

  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  wednesday?: DayHoursInput;

  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  thursday?: DayHoursInput;

  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  friday?: DayHoursInput;

  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  saturday?: DayHoursInput;

  @Field(() => DayHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursInput)
  sunday?: DayHoursInput;
}

// Location inputs
@InputType()
export class CreateLocationInput {
  @Field()
  @IsString()
  @Length(1, 255)
  name!: string;

  @Field()
  @IsString()
  @Length(1, 50)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must contain only uppercase letters, numbers, underscores, and hyphens',
  })
  code!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string;

  @Field(() => LocationType)
  @IsEnum(LocationType)
  type!: LocationType;

  @Field(() => LocationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @Field(() => AddressInput)
  @ValidateNested()
  @Type(() => AddressInput)
  address!: AddressInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentLocationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @Field(() => OperatingHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursInput)
  operatingHours?: OperatingHoursInput;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFootage?: number;
}

@InputType()
export class UpdateLocationInput {
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

  @Field(() => LocationType, { nullable: true })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @Field(() => LocationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @Field(() => AddressInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressInput)
  address?: AddressInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 50)
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  website?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentLocationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  timezone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @Field(() => OperatingHoursInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursInput)
  operatingHours?: OperatingHoursInput;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareFootage?: number;
}

@InputType()
export class LocationFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => LocationType, { nullable: true })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @Field(() => LocationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(LocationStatus)
  status?: LocationStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  managerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentLocationId?: string;
}

// Franchise inputs
@InputType()
export class CreateFranchiseInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  code!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => FranchiseType)
  @IsEnum(FranchiseType)
  type!: FranchiseType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  royaltyRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  marketingFeeRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialFranchiseFee?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  primaryTerritoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentFranchiseId?: string;
}

@InputType()
export class UpdateFranchiseInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => FranchiseType, { nullable: true })
  @IsOptional()
  @IsEnum(FranchiseType)
  type?: FranchiseType;

  @Field(() => FranchiseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FranchiseStatus)
  status?: FranchiseStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  operatorId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  taxId?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  royaltyRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  marketingFeeRate?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialFranchiseFee?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractStartDate?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDateString()
  contractEndDate?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  primaryTerritoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentFranchiseId?: string;
}

@InputType()
export class FranchiseFilterInput {
  @Field(() => FranchiseType, { nullable: true })
  @IsOptional()
  @IsEnum(FranchiseType)
  type?: FranchiseType;

  @Field(() => FranchiseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(FranchiseStatus)
  status?: FranchiseStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  territoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

// Territory inputs
@InputType()
export class CreateTerritoryInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  code!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TerritoryType)
  @IsEnum(TerritoryType)
  type!: TerritoryType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentTerritoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedFranchiseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;
}

@InputType()
export class UpdateTerritoryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => TerritoryType, { nullable: true })
  @IsOptional()
  @IsEnum(TerritoryType)
  type?: TerritoryType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  parentTerritoryId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedFranchiseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class TerritoryFilterInput {
  @Field(() => TerritoryType, { nullable: true })
  @IsOptional()
  @IsEnum(TerritoryType)
  type?: TerritoryType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  franchiseId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

// Pricing inputs
@InputType()
export class PricingRuleConditionInput {
  @Field()
  @IsString()
  type!: string;

  @Field()
  @IsString()
  operator!: string;

  @Field()
  value!: string;
}

@InputType()
export class CreateLocationPricingRuleInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PricingRuleType)
  @IsEnum(PricingRuleType)
  ruleType!: PricingRuleType;

  @Field()
  @IsString()
  productId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  value!: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

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
  @Min(0)
  @Max(100)
  priority?: number;

  @Field(() => [PricingRuleConditionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingRuleConditionInput)
  conditions?: PricingRuleConditionInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateLocationPricingRuleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PricingRuleType, { nullable: true })
  @IsOptional()
  @IsEnum(PricingRuleType)
  ruleType?: PricingRuleType;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

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
  @Min(0)
  @Max(100)
  priority?: number;

  @Field(() => [PricingRuleConditionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingRuleConditionInput)
  conditions?: PricingRuleConditionInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => PricingRuleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PricingRuleStatus)
  status?: PricingRuleStatus;
}

@InputType()
export class LocationPricingFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => PricingRuleType, { nullable: true })
  @IsOptional()
  @IsEnum(PricingRuleType)
  ruleType?: PricingRuleType;

  @Field(() => PricingRuleStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PricingRuleStatus)
  status?: PricingRuleStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

@InputType()
export class CalculatePriceInput {
  @Field()
  @IsString()
  productId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string;
}

// Promotion inputs
@InputType()
export class PromotionConditionInput {
  @Field()
  @IsString()
  type!: string;

  @Field()
  @IsString()
  operator!: string;

  @Field()
  value!: string;
}

@InputType()
export class PromotionActionInput {
  @Field()
  @IsString()
  type!: string;

  @Field()
  value!: string;
}

@InputType()
export class CreateLocationPromotionInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PromotionType)
  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @Field(() => PromotionTargetType)
  @IsEnum(PromotionTargetType)
  targetType!: PromotionTargetType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetProductIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCategoryIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCustomerSegments?: string[];

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTotalUses?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isCombinable?: boolean;

  @Field(() => [PromotionConditionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionConditionInput)
  conditions?: PromotionConditionInput[];

  @Field(() => [PromotionActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionActionInput)
  actions?: PromotionActionInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  promotionCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateLocationPromotionInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => PromotionType, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionType)
  promotionType?: PromotionType;

  @Field(() => PromotionTargetType, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionTargetType)
  targetType?: PromotionTargetType;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetProductIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCategoryIds?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCustomerSegments?: string[];

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
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTotalUses?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isCombinable?: boolean;

  @Field(() => [PromotionConditionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionConditionInput)
  conditions?: PromotionConditionInput[];

  @Field(() => [PromotionActionInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionActionInput)
  actions?: PromotionActionInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  promotionCode?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => PromotionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;
}

@InputType()
export class LocationPromotionFilterInput {
  @Field(() => PromotionType, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionType)
  promotionType?: PromotionType;

  @Field(() => PromotionStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string;
}

@InputType()
export class CartItemInput {
  @Field()
  @IsString()
  productId!: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity!: number;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

@InputType()
export class ApplyPromotionInput {
  @Field()
  @IsString()
  promotionIdOrCode!: string;

  @Field(() => [CartItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemInput)
  cartItems!: CartItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string;
}

// Inventory Policy inputs
@InputType()
export class InventoryPolicyRuleInput {
  @Field()
  @IsString()
  type!: string;

  @Field()
  @IsString()
  condition!: string;

  @Field()
  @IsString()
  action!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;
}

@InputType()
export class CreateLocationInventoryPolicyInput {
  @Field()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => InventoryPolicyType)
  @IsEnum(InventoryPolicyType)
  policyType!: InventoryPolicyType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @Field(() => StockReplenishmentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(StockReplenishmentMethod)
  replenishmentMethod?: StockReplenishmentMethod;

  @Field(() => ABCClassification, { nullable: true })
  @IsOptional()
  @IsEnum(ABCClassification)
  abcClassification?: ABCClassification;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  seasonalMultiplier?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  forecastPeriodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoCreatePurchaseOrders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preferredSupplierId?: string;

  @Field(() => [InventoryPolicyRuleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryPolicyRuleInput)
  rules?: InventoryPolicyRuleInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class UpdateLocationInventoryPolicyInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => InventoryPolicyType, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryPolicyType)
  policyType?: InventoryPolicyType;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @Field(() => StockReplenishmentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(StockReplenishmentMethod)
  replenishmentMethod?: StockReplenishmentMethod;

  @Field(() => ABCClassification, { nullable: true })
  @IsOptional()
  @IsEnum(ABCClassification)
  abcClassification?: ABCClassification;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  seasonalMultiplier?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  forecastPeriodDays?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  autoCreatePurchaseOrders?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  preferredSupplierId?: string;

  @Field(() => [InventoryPolicyRuleInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryPolicyRuleInput)
  rules?: InventoryPolicyRuleInput[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field(() => InventoryPolicyStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryPolicyStatus)
  status?: InventoryPolicyStatus;
}

@InputType()
export class LocationInventoryPolicyFilterInput {
  @Field(() => InventoryPolicyType, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryPolicyType)
  policyType?: InventoryPolicyType;

  @Field(() => InventoryPolicyStatus, { nullable: true })
  @IsOptional()
  @IsEnum(InventoryPolicyStatus)
  status?: InventoryPolicyStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  productId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;
}

@InputType()
export class BulkInventoryPolicyUpdateInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];

  @Field(() => UpdateLocationInventoryPolicyInput)
  @ValidateNested()
  @Type(() => UpdateLocationInventoryPolicyInput)
  updates!: UpdateLocationInventoryPolicyInput;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  createIfNotExists?: boolean;
}

// Reporting inputs
@InputType()
export class ConsolidatedReportQueryInput {
  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  locationIds?: string[];

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;

  @Field(() => ReportType)
  @IsEnum(ReportType)
  reportType!: ReportType;

  @Field(() => GroupByType, { nullable: true })
  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeComparisons?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  includeBenchmarks?: boolean;

  @Field(() => DrillDownLevel, { nullable: true })
  @IsOptional()
  @IsEnum(DrillDownLevel)
  drillDownLevel?: DrillDownLevel;
}

@InputType()
export class LocationComparisonQueryInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID(4, { each: true })
  locationIds!: string[];

  @Field(() => ComparisonType)
  @IsEnum(ComparisonType)
  comparisonType!: ComparisonType;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;
}

@InputType()
export class LocationBenchmarkQueryInput {
  @Field(() => ID)
  @IsUUID(4)
  locationId!: string;

  @Field()
  @IsDateString()
  startDate!: string;

  @Field()
  @IsDateString()
  endDate!: string;
}