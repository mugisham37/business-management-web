import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

// Enums
export enum ReorderPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum TrendType {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
}

export enum ForecastMethod {
  MOVING_AVERAGE = 'moving_average',
  EXPONENTIAL_SMOOTHING = 'exponential_smoothing',
  LINEAR_REGRESSION = 'linear_regression',
  SEASONAL_DECOMPOSITION = 'seasonal_decomposition',
}

// Register enums
registerEnumType(ReorderPriority, { name: 'ReorderPriority' });
registerEnumType(TrendType, { name: 'TrendType' });
registerEnumType(ForecastMethod, { name: 'ForecastMethod' });

@ObjectType()
export class ReorderSuggestionResult {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  currentLevel!: number;

  @Field(() => Float)
  reorderPoint!: number;

  @Field(() => Float)
  reorderQuantity!: number;

  @Field(() => Float)
  suggestedQuantity!: number;

  @Field(() => Float, { nullable: true })
  unitCost?: number;

  @Field(() => Float, { nullable: true })
  totalCost?: number;

  @Field(() => ReorderPriority)
  priority!: ReorderPriority;

  @Field(() => Int, { nullable: true })
  daysUntilStockout?: number;

  @Field(() => Float, { nullable: true })
  averageDailySales?: number;

  @Field(() => Int, { nullable: true })
  leadTimeDays?: number;
}

@ObjectType()
export class ForecastDataResult {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID, { nullable: true })
  variantId?: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => Float)
  averageDailySales!: number;

  @Field(() => TrendType)
  trend!: TrendType;

  @Field(() => Float)
  seasonalFactor!: number;

  @Field(() => Float)
  forecastedDemand!: number;

  @Field(() => Float)
  confidence!: number;
}

@ObjectType()
export class SupplierSuggestion {
  @Field(() => ID)
  supplierId!: string;

  @Field(() => [ReorderSuggestionResult])
  suggestions!: ReorderSuggestionResult[];

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Int)
  itemCount!: number;
}

@ObjectType()
export class PurchaseOrderSuggestionResult {
  @Field(() => [SupplierSuggestion])
  supplierSuggestions!: SupplierSuggestion[];

  @Field(() => Int)
  totalSuggestions!: number;

  @Field(() => Float)
  totalValue!: number;
}

@ObjectType()
export class PriorityBreakdown {
  @Field(() => Int)
  high!: number;

  @Field(() => Int)
  medium!: number;

  @Field(() => Int)
  low!: number;
}

@ObjectType()
export class AnalyticsPeriod {
  @Field(() => Int)
  days!: number;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;
}

@ObjectType()
export class ReorderAnalyticsResult {
  @Field(() => Int)
  totalSuggestions!: number;

  @Field(() => PriorityBreakdown)
  priorityBreakdown!: PriorityBreakdown;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Float)
  averageLeadTime!: number;

  @Field(() => Int)
  stockoutRisk!: number;

  @Field(() => AnalyticsPeriod)
  period!: AnalyticsPeriod;
}