import { IsString, IsNumber, IsOptional, IsEnum, IsBoolean, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryPolicyType {
  REORDER_POINT = 'reorder_point',
  SAFETY_STOCK = 'safety_stock',
  MAX_STOCK_LEVEL = 'max_stock_level',
  ABC_CLASSIFICATION = 'abc_classification',
  SEASONAL_ADJUSTMENT = 'seasonal_adjustment',
  DEMAND_FORECASTING = 'demand_forecasting',
}

export enum InventoryPolicyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum StockReplenishmentMethod {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  SCHEDULED = 'scheduled',
  DEMAND_BASED = 'demand_based',
}

export enum ABCClassification {
  A = 'A', // High value, low quantity
  B = 'B', // Medium value, medium quantity
  C = 'C', // Low value, high quantity
}

export class InventoryPolicyRuleDto {
  @IsString()
  type!: string;

  @IsString()
  condition!: string;

  @IsString()
  action!: string;

  parameters!: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;
}

export class CreateLocationInventoryPolicyDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(InventoryPolicyType)
  policyType!: InventoryPolicyType;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @IsOptional()
  @IsEnum(StockReplenishmentMethod)
  replenishmentMethod?: StockReplenishmentMethod;

  @IsOptional()
  @IsEnum(ABCClassification)
  abcClassification?: ABCClassification;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  seasonalMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  forecastPeriodDays?: number;

  @IsOptional()
  @IsBoolean()
  autoCreatePurchaseOrders?: boolean;

  @IsOptional()
  @IsString()
  preferredSupplierId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryPolicyRuleDto)
  rules?: InventoryPolicyRuleDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  parameters?: Record<string, any>;
}

export class UpdateLocationInventoryPolicyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(InventoryPolicyType)
  policyType?: InventoryPolicyType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStockLevel?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  safetyStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  reorderQuantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  leadTimeDays?: number;

  @IsOptional()
  @IsEnum(StockReplenishmentMethod)
  replenishmentMethod?: StockReplenishmentMethod;

  @IsOptional()
  @IsEnum(ABCClassification)
  abcClassification?: ABCClassification;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(10.0)
  seasonalMultiplier?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  forecastPeriodDays?: number;

  @IsOptional()
  @IsBoolean()
  autoCreatePurchaseOrders?: boolean;

  @IsOptional()
  @IsString()
  preferredSupplierId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InventoryPolicyRuleDto)
  rules?: InventoryPolicyRuleDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(InventoryPolicyStatus)
  status?: InventoryPolicyStatus;

  @IsOptional()
  parameters?: Record<string, any>;
}

export class LocationInventoryPolicyQueryDto {
  @IsOptional()
  @IsEnum(InventoryPolicyType)
  policyType?: InventoryPolicyType;

  @IsOptional()
  @IsEnum(InventoryPolicyStatus)
  status?: InventoryPolicyStatus;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

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

export class InventoryRecommendationDto {
  productId!: string;
  currentStock!: number;
  recommendedAction!: 'reorder' | 'reduce_stock' | 'maintain' | 'increase_safety_stock';
  recommendedQuantity!: number;
  reason!: string;
  priority!: 'low' | 'medium' | 'high' | 'critical';
  expectedStockOutDate?: Date;
  appliedPolicies!: Array<{
    policyId: string;
    policyName: string;
    policyType: InventoryPolicyType;
  }>;
}

export class BulkInventoryPolicyUpdateDto {
  @IsArray()
  @IsString({ each: true })
  productIds!: string[];

  @ValidateNested()
  @Type(() => UpdateLocationInventoryPolicyDto)
  updates!: UpdateLocationInventoryPolicyDto;

  @IsOptional()
  @IsBoolean()
  createIfNotExists?: boolean;
}