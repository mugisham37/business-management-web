import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PromotionType {
  PERCENTAGE_DISCOUNT = 'percentage_discount',
  FIXED_AMOUNT_DISCOUNT = 'fixed_amount_discount',
  BUY_X_GET_Y = 'buy_x_get_y',
  BUNDLE_DISCOUNT = 'bundle_discount',
  FREE_SHIPPING = 'free_shipping',
  LOYALTY_POINTS_MULTIPLIER = 'loyalty_points_multiplier',
}

export enum PromotionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export enum PromotionTargetType {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  PRODUCT_CATEGORIES = 'product_categories',
  CUSTOMER_SEGMENTS = 'customer_segments',
}

export class PromotionConditionDto {
  @IsString()
  type!: string;

  @IsString()
  operator!: string;

  value!: any;

  @IsOptional()
  parameters?: Record<string, any>;
}

export class PromotionActionDto {
  @IsString()
  type!: string;

  value: any;

  @IsOptional()
  parameters?: Record<string, any>;
}

export class CreateLocationPromotionDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(PromotionType)
  promotionType!: PromotionType;

  @IsEnum(PromotionTargetType)
  targetType!: PromotionTargetType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCategoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCustomerSegments?: string[];

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerCustomer?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTotalUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isCombinable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionConditionDto)
  conditions?: PromotionConditionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionActionDto)
  actions?: PromotionActionDto[];

  @IsOptional()
  @IsString()
  promotionCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLocationPromotionDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(PromotionType)
  promotionType?: PromotionType;

  @IsOptional()
  @IsEnum(PromotionTargetType)
  targetType?: PromotionTargetType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetProductIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCategoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetCustomerSegments?: string[];

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
  discountPercentage?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPurchaseAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscountAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerCustomer?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxTotalUses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isCombinable?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionConditionDto)
  conditions?: PromotionConditionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PromotionActionDto)
  actions?: PromotionActionDto[];

  @IsOptional()
  @IsString()
  promotionCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;
}

export class LocationPromotionQueryDto {
  @IsOptional()
  @IsEnum(PromotionType)
  promotionType?: PromotionType;

  @IsOptional()
  @IsEnum(PromotionStatus)
  status?: PromotionStatus;

  @IsOptional()
  @IsBoolean()
  activeOnly?: boolean;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

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

export class ApplyPromotionDto {
  @IsString()
  promotionIdOrCode!: string;

  @IsArray()
  cartItems!: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  context?: Record<string, any>;
}

export class PromotionApplicationResultDto {
  applied!: boolean;
  promotion!: {
    id: string;
    name: string;
    type: PromotionType;
  };
  originalAmount!: number;
  finalAmount!: number;
  discountAmount!: number;
  discountPercentage!: number;
  details!: Array<{
    itemId: string;
    originalPrice: number;
    discountedPrice: number;
    discountAmount: number;
  }>;
  errorMessage?: string;
  reason?: string;
}