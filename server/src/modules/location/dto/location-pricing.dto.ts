import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PricingRuleType {
  MARKUP = 'markup',
  MARKDOWN = 'markdown',
  FIXED_PRICE = 'fixed_price',
  PERCENTAGE_DISCOUNT = 'percentage_discount',
  BULK_DISCOUNT = 'bulk_discount',
}

export enum PricingRuleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  EXPIRED = 'expired',
}

export class PricingRuleConditionDto {
  @IsString()
  type!: string;

  @IsString()
  operator!: string;

  value!: any;

  @IsOptional()
  parameters?: Record<string, any>;
}

export class CreateLocationPricingRuleDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PricingRuleType)
  ruleType!: PricingRuleType;

  @IsString()
  productId!: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  value!: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingRuleConditionDto)
  conditions?: PricingRuleConditionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLocationPricingRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PricingRuleType)
  ruleType?: PricingRuleType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxQuantity?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PricingRuleConditionDto)
  conditions?: PricingRuleConditionDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PricingRuleStatus)
  status?: PricingRuleStatus;
}

export class LocationPricingQueryDto {
  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(PricingRuleType)
  ruleType?: PricingRuleType;

  @IsOptional()
  @IsEnum(PricingRuleStatus)
  status?: PricingRuleStatus;

  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CalculatePriceDto {
  @IsString()
  productId!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  context?: Record<string, any>;
}

export class PriceCalculationResultDto {
  basePrice!: number;
  finalPrice!: number;
  discountAmount!: number;
  discountPercentage!: number;
  appliedRules!: Array<{
    ruleId: string;
    ruleName: string;
    ruleType: PricingRuleType;
    value: number;
    discountAmount: number;
  }>;
  breakdown!: Array<{
    step: string;
    description: string;
    amount: number;
    runningTotal: number;
  }>;
}