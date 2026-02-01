import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { forwardRef } from '@nestjs/common';
import { BaseEntity, Edge, Connection } from '../../../common/graphql/base.types';
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

// Register enums for GraphQL
registerEnumType(LocationType, {
  name: 'LocationType',
  description: 'Type of location',
});

registerEnumType(LocationStatus, {
  name: 'LocationStatus',
  description: 'Status of location',
});

registerEnumType(FranchiseType, {
  name: 'FranchiseType',
  description: 'Type of franchise',
});

registerEnumType(FranchiseStatus, {
  name: 'FranchiseStatus',
  description: 'Status of franchise',
});

registerEnumType(TerritoryType, {
  name: 'TerritoryType',
  description: 'Type of territory',
});

registerEnumType(AssignmentType, {
  name: 'AssignmentType',
  description: 'Type of assignment',
});

registerEnumType(PricingRuleType, {
  name: 'PricingRuleType',
  description: 'Type of pricing rule',
});

registerEnumType(PricingRuleStatus, {
  name: 'PricingRuleStatus',
  description: 'Status of pricing rule',
});

registerEnumType(PromotionType, {
  name: 'PromotionType',
  description: 'Type of promotion',
});

registerEnumType(PromotionStatus, {
  name: 'PromotionStatus',
  description: 'Status of promotion',
});

registerEnumType(PromotionTargetType, {
  name: 'PromotionTargetType',
  description: 'Target type of promotion',
});

registerEnumType(InventoryPolicyType, {
  name: 'InventoryPolicyType',
  description: 'Type of inventory policy',
});

registerEnumType(InventoryPolicyStatus, {
  name: 'InventoryPolicyStatus',
  description: 'Status of inventory policy',
});

registerEnumType(StockReplenishmentMethod, {
  name: 'StockReplenishmentMethod',
  description: 'Method of stock replenishment',
});

registerEnumType(ABCClassification, {
  name: 'ABCClassification',
  description: 'ABC classification for inventory',
});

registerEnumType(ReportType, {
  name: 'ReportType',
  description: 'Type of report',
});

registerEnumType(GroupByType, {
  name: 'GroupByType',
  description: 'Group by type for reports',
});

registerEnumType(DrillDownLevel, {
  name: 'DrillDownLevel',
  description: 'Drill down level for reports',
});

registerEnumType(ComparisonType, {
  name: 'ComparisonType',
  description: 'Type of comparison',
});

// Basic types
@ObjectType()
export class CoordinatesType {
  @Field(() => Float)
  latitude!: number;

  @Field(() => Float)
  longitude!: number;
}

@ObjectType()
export class AddressType {
  @Field()
  street!: string;

  @Field()
  city!: string;

  @Field()
  state!: string;

  @Field()
  country!: string;

  @Field()
  postalCode!: string;

  @Field(() => CoordinatesType, { nullable: true })
  coordinates?: CoordinatesType;
}

@ObjectType()
export class DayHoursType {
  @Field()
  open!: string;

  @Field()
  close!: string;

  @Field({ nullable: true })
  closed?: boolean;
}

@ObjectType()
export class OperatingHoursType {
  @Field(() => DayHoursType, { nullable: true })
  monday?: DayHoursType;

  @Field(() => DayHoursType, { nullable: true })
  tuesday?: DayHoursType;

  @Field(() => DayHoursType, { nullable: true })
  wednesday?: DayHoursType;

  @Field(() => DayHoursType, { nullable: true })
  thursday?: DayHoursType;

  @Field(() => DayHoursType, { nullable: true })
  friday?: DayHoursType;

  @Field(() => DayHoursType, { nullable: true })
  saturday?: DayHoursType;

  @Field(() => DayHoursType, { nullable: true })
  sunday?: DayHoursType;
}

// Location types
@ObjectType('Location')
export class LocationGQLType extends BaseEntity {
  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => LocationType)
  locationType!: LocationType;

  @Field(() => LocationStatus)
  status!: LocationStatus;

  @Field(() => AddressType)
  address!: AddressType;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  website?: string;

  @Field(() => ID, { nullable: true })
  parentLocationId?: string;

  @Field()
  timezone!: string;

  @Field()
  currency!: string;

  @Field(() => OperatingHoursType, { nullable: true })
  operatingHours?: OperatingHoursType;

  @Field(() => ID, { nullable: true })
  managerId?: string;

  @Field(() => Float, { nullable: true })
  latitude?: number;

  @Field(() => Float, { nullable: true })
  longitude?: number;

  @Field(() => Float, { nullable: true })
  squareFootage?: number;

  @Field()
  isActive!: boolean;

  // Relationships
  @Field(() => LocationGQLType, { nullable: true })
  parentLocation?: LocationGQLType;

  @Field(() => [LocationGQLType], { nullable: true })
  childLocations?: LocationGQLType[];

  @Field(() => [EmployeeType], { nullable: true })
  employees?: EmployeeType[];

  @Field(() => [InventoryType], { nullable: true })
  inventory?: InventoryType[];

  @Field(() => [LocationPricingRuleType], { nullable: true })
  pricingRules?: LocationPricingRuleType[];

  @Field(() => [LocationPromotionType], { nullable: true })
  promotions?: LocationPromotionType[];

  @Field(() => [LocationInventoryPolicyType], { nullable: true })
  inventoryPolicies?: LocationInventoryPolicyType[];
}

// Franchise types
@ObjectType('Franchise')
export class FranchiseGQLType extends BaseEntity {
  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => FranchiseType)
  franchiseType!: FranchiseType;

  @Field(() => FranchiseStatus)
  status!: FranchiseStatus;

  @Field(() => ID, { nullable: true })
  ownerId?: string;

  @Field(() => ID, { nullable: true })
  operatorId?: string;

  @Field({ nullable: true })
  businessName?: string;

  @Field({ nullable: true })
  businessRegistrationNumber?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field(() => Float, { nullable: true })
  royaltyRate?: number;

  @Field(() => Float, { nullable: true })
  marketingFeeRate?: number;

  @Field(() => Float, { nullable: true })
  initialFranchiseFee?: number;

  @Field({ nullable: true })
  contractStartDate?: Date;

  @Field({ nullable: true })
  contractEndDate?: Date;

  @Field(() => ID, { nullable: true })
  primaryTerritoryId?: string;

  @Field(() => ID, { nullable: true })
  parentFranchiseId?: string;

  @Field()
  isActive!: boolean;

  // Relationships - use forwardRef for circular dependencies
  @Field(() => forwardRef(() => TerritoryGQLType), { nullable: true })
  primaryTerritory?: any; // TerritoryGQLType

  @Field(() => forwardRef(() => FranchiseGQLType), { nullable: true })
  parentFranchise?: any; // FranchiseGQLType

  @Field(() => [forwardRef(() => FranchiseGQLType)], { nullable: true })
  childFranchises?: any[]; // FranchiseGQLType[]

  @Field(() => [forwardRef(() => LocationGQLType)], { nullable: true })
  locations?: any[]; // LocationGQLType[]
}

// Territory types
@ObjectType('Territory')
export class TerritoryGQLType extends BaseEntity {
  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => TerritoryType)
  territoryType!: TerritoryType;

  @Field(() => ID, { nullable: true })
  parentTerritoryId?: string;

  @Field(() => ID, { nullable: true })
  assignedFranchiseId?: string;

  @Field(() => ID, { nullable: true })
  assignedUserId?: string;

  @Field()
  isActive!: boolean;

  // Relationships - use forwardRef for circular dependencies
  @Field(() => forwardRef(() => TerritoryGQLType), { nullable: true })
  parentTerritory?: any; // TerritoryGQLType

  @Field(() => [forwardRef(() => TerritoryGQLType)], { nullable: true })
  childTerritories?: any[]; // TerritoryGQLType[]

  @Field(() => forwardRef(() => FranchiseGQLType), { nullable: true })
  assignedFranchise?: any; // FranchiseGQLType
}

// Pricing types
@ObjectType('LocationPricingRule')
export class LocationPricingRuleType extends BaseEntity {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => PricingRuleType)
  ruleType!: PricingRuleType;

  @Field(() => PricingRuleStatus)
  status!: PricingRuleStatus;

  @Field()
  productId!: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => Float)
  value!: number;

  @Field(() => Int, { nullable: true })
  minQuantity?: number;

  @Field(() => Int, { nullable: true })
  maxQuantity?: number;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field()
  isActive!: boolean;
}

@ObjectType('PriceCalculationResult')
export class PriceCalculationResultType {
  @Field(() => Float)
  basePrice!: number;

  @Field(() => Float)
  finalPrice!: number;

  @Field(() => Float)
  discountAmount!: number;

  @Field(() => Float)
  discountPercentage!: number;

  @Field(() => [AppliedPricingRuleType])
  appliedRules!: AppliedPricingRuleType[];

  @Field(() => [PriceCalculationStepType])
  breakdown!: PriceCalculationStepType[];
}

@ObjectType('AppliedPricingRule')
export class AppliedPricingRuleType {
  @Field()
  ruleId!: string;

  @Field()
  ruleName!: string;

  @Field(() => PricingRuleType)
  ruleType!: PricingRuleType;

  @Field(() => Float)
  value!: number;

  @Field(() => Float)
  discountAmount!: number;
}

@ObjectType('PriceCalculationStep')
export class PriceCalculationStepType {
  @Field()
  step!: string;

  @Field()
  description!: string;

  @Field(() => Float)
  amount!: number;

  @Field(() => Float)
  runningTotal!: number;
}

// Promotion types
@ObjectType('LocationPromotion')
export class LocationPromotionType extends BaseEntity {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => PromotionType)
  promotionType!: PromotionType;

  @Field(() => PromotionStatus)
  status!: PromotionStatus;

  @Field(() => PromotionTargetType)
  targetType!: PromotionTargetType;

  @Field(() => [String], { nullable: true })
  targetProductIds?: string[];

  @Field(() => [String], { nullable: true })
  targetCategoryIds?: string[];

  @Field(() => [String], { nullable: true })
  targetCustomerSegments?: string[];

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field(() => Float, { nullable: true })
  discountPercentage?: number;

  @Field(() => Float, { nullable: true })
  discountAmount?: number;

  @Field(() => Float, { nullable: true })
  minPurchaseAmount?: number;

  @Field(() => Float, { nullable: true })
  maxDiscountAmount?: number;

  @Field(() => Int, { nullable: true })
  maxUsesPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  maxTotalUses?: number;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field({ nullable: true })
  isCombinable?: boolean;

  @Field({ nullable: true })
  promotionCode?: string;

  @Field()
  isActive!: boolean;
}

@ObjectType('PromotionInfo')
export class PromotionInfoType {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => PromotionType)
  type!: PromotionType;
}

@ObjectType('PromotionApplicationDetail')
export class PromotionApplicationDetailType {
  @Field()
  itemId!: string;

  @Field(() => Float)
  originalPrice!: number;

  @Field(() => Float)
  discountedPrice!: number;

  @Field(() => Float)
  discount!: number;

  @Field({ nullable: true })
  reason?: string;
}

@ObjectType('PromotionApplicationResult')
export class PromotionApplicationResultType {
  @Field()
  applied!: boolean;

  @Field(() => PromotionInfoType)
  promotion!: PromotionInfoType;

  @Field(() => Float)
  originalAmount!: number;

  @Field(() => Float)
  finalAmount!: number;

  @Field(() => Float)
  discountAmount!: number;

  @Field(() => Float)
  discountPercentage!: number;

  @Field(() => [PromotionApplicationDetailType])
  details!: PromotionApplicationDetailType[];

  @Field({ nullable: true })
  errorMessage?: string;

  @Field({ nullable: true })
  reason?: string;
}

// Inventory Policy types
@ObjectType('LocationInventoryPolicy')
export class LocationInventoryPolicyType extends BaseEntity {
  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => InventoryPolicyType)
  policyType!: InventoryPolicyType;

  @Field(() => InventoryPolicyStatus)
  status!: InventoryPolicyStatus;

  @Field({ nullable: true })
  productId?: string;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => Int, { nullable: true })
  minStockLevel?: number;

  @Field(() => Int, { nullable: true })
  maxStockLevel?: number;

  @Field(() => Int, { nullable: true })
  safetyStock?: number;

  @Field(() => Int, { nullable: true })
  reorderQuantity?: number;

  @Field(() => Int, { nullable: true })
  leadTimeDays?: number;

  @Field(() => StockReplenishmentMethod, { nullable: true })
  replenishmentMethod?: StockReplenishmentMethod;

  @Field(() => ABCClassification, { nullable: true })
  abcClassification?: ABCClassification;

  @Field(() => Float, { nullable: true })
  seasonalMultiplier?: number;

  @Field(() => Int, { nullable: true })
  forecastPeriodDays?: number;

  @Field({ nullable: true })
  autoCreatePurchaseOrders?: boolean;

  @Field({ nullable: true })
  preferredSupplierId?: string;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field()
  isActive!: boolean;
}

@ObjectType('InventoryRecommendation')
export class InventoryRecommendationType {
  @Field()
  productId!: string;

  @Field(() => Int)
  currentStock!: number;

  @Field()
  recommendedAction!: string;

  @Field(() => Int)
  recommendedQuantity!: number;

  @Field()
  reason!: string;

  @Field()
  priority!: string;

  @Field({ nullable: true })
  expectedStockOutDate?: Date;

  @Field(() => [AppliedInventoryPolicyType])
  appliedPolicies!: AppliedInventoryPolicyType[];
}

@ObjectType('AppliedInventoryPolicy')
export class AppliedInventoryPolicyType {
  @Field()
  policyId!: string;

  @Field()
  policyName!: string;

  @Field(() => InventoryPolicyType)
  policyType!: InventoryPolicyType;
}

// Reporting types
@ObjectType('LocationPerformanceMetrics')
export class LocationPerformanceMetricsType {
  @Field()
  locationId!: string;

  @Field()
  locationName!: string;

  @Field()
  locationCode!: string;

  @Field()
  locationType!: string;

  @Field({ nullable: true })
  region?: string;

  @Field({ nullable: true })
  managerId?: string;

  @Field({ nullable: true })
  managerName?: string;

  // Financial Metrics
  @Field(() => Float)
  revenue!: number;

  @Field(() => Float)
  grossProfit!: number;

  @Field(() => Float)
  netProfit!: number;

  @Field(() => Float)
  expenses!: number;

  @Field(() => Float)
  profitMargin!: number;

  // Sales Metrics
  @Field(() => Int)
  transactionCount!: number;

  @Field(() => Float)
  averageTransactionValue!: number;

  @Field(() => Int)
  itemsSold!: number;

  @Field(() => Float)
  refundAmount!: number;

  @Field(() => Float)
  refundRate!: number;

  // Inventory Metrics
  @Field(() => Float)
  inventoryValue!: number;

  @Field(() => Float)
  inventoryTurnover!: number;

  @Field(() => Int)
  stockoutEvents!: number;

  @Field(() => Float)
  excessInventoryValue!: number;

  // Customer Metrics
  @Field(() => Int)
  uniqueCustomers!: number;

  @Field(() => Float)
  repeatCustomerRate!: number;

  @Field(() => Float)
  customerLifetimeValue!: number;

  @Field(() => Float, { nullable: true })
  customerSatisfactionScore?: number;

  // Operational Metrics
  @Field(() => Int)
  employeeCount!: number;

  @Field(() => Float)
  salesPerEmployee!: number;

  @Field(() => Int)
  operatingHours!: number;

  @Field(() => Float)
  salesPerHour!: number;

  // Comparative Metrics
  @Field(() => Float, { nullable: true })
  previousPeriodGrowth?: number;

  @Field(() => Float, { nullable: true })
  benchmarkComparison?: number;

  @Field(() => Int, { nullable: true })
  rankAmongLocations?: number;
}

@ObjectType('ReportPeriod')
export class ReportPeriodType {
  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field(() => Int)
  daysInPeriod!: number;
}

@ObjectType('AggregatedMetrics')
export class AggregatedMetricsType {
  @Field(() => Float)
  totalRevenue!: number;

  @Field(() => Int)
  totalTransactions!: number;

  @Field(() => Int)
  totalCustomers!: number;

  @Field(() => Float)
  totalInventoryValue!: number;

  @Field(() => Float)
  averageProfitMargin!: number;

  @Field()
  topPerformingLocationId!: string;

  @Field()
  lowestPerformingLocationId!: string;
}

@ObjectType('BenchmarkAnalysis')
export class BenchmarkAnalysisType {
  @Field(() => Int)
  aboveAverage!: number;

  @Field(() => Int)
  belowAverage!: number;

  @Field(() => LocationPerformanceMetricsType)
  averagePerformance!: LocationPerformanceMetricsType;
}

@ObjectType('ComparativeAnalysis')
export class ComparativeAnalysisType {
  @Field(() => Float)
  periodOverPeriodGrowth!: number;

  @Field(() => [String])
  bestPerformingMetrics!: string[];

  @Field(() => [String])
  improvementOpportunities!: string[];

  @Field(() => BenchmarkAnalysisType, { nullable: true })
  benchmarkAnalysis?: BenchmarkAnalysisType;
}

@ObjectType('ConsolidatedReport')
export class ConsolidatedReportType {
  @Field()
  reportId!: string;

  @Field()
  tenantId!: string;

  @Field(() => ReportType)
  reportType!: ReportType;

  @Field()
  generatedAt!: Date;

  @Field(() => Int)
  totalLocations!: number;

  @Field(() => ReportPeriodType)
  reportPeriod!: ReportPeriodType;

  @Field(() => AggregatedMetricsType)
  aggregatedMetrics!: AggregatedMetricsType;

  @Field(() => [LocationPerformanceMetricsType])
  locationMetrics!: LocationPerformanceMetricsType[];

  @Field(() => ComparativeAnalysisType, { nullable: true })
  comparativeAnalysis?: ComparativeAnalysisType;
}

// Placeholder types for relationships
@ObjectType()
export class EmployeeType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;
}

@ObjectType()
export class InventoryType {
  @Field(() => ID)
  id!: string;

  @Field()
  productId!: string;
}

// Connection types
@ObjectType()
export class LocationEdge extends Edge<LocationGQLType> {
  @Field(() => LocationGQLType)
  node!: LocationGQLType;
}

@ObjectType()
export class LocationConnection extends Connection<LocationGQLType> {
  @Field(() => [LocationEdge])
  edges!: LocationEdge[];
}

@ObjectType()
export class FranchiseEdge extends Edge<FranchiseGQLType> {
  @Field(() => FranchiseGQLType)
  node!: FranchiseGQLType;
}

@ObjectType()
export class FranchiseConnection extends Connection<FranchiseGQLType> {
  @Field(() => [FranchiseEdge])
  edges!: FranchiseEdge[];
}

@ObjectType()
export class TerritoryEdge extends Edge<TerritoryGQLType> {
  @Field(() => TerritoryGQLType)
  node!: TerritoryGQLType;
}

@ObjectType()
export class TerritoryConnection extends Connection<TerritoryGQLType> {
  @Field(() => [TerritoryEdge])
  edges!: TerritoryEdge[];
}

@ObjectType()
export class LocationPricingRuleEdge extends Edge<LocationPricingRuleType> {
  @Field(() => LocationPricingRuleType)
  node!: LocationPricingRuleType;
}

@ObjectType()
export class LocationPricingRuleConnection extends Connection<LocationPricingRuleType> {
  @Field(() => [LocationPricingRuleEdge])
  edges!: LocationPricingRuleEdge[];
}

@ObjectType()
export class LocationPromotionEdge extends Edge<LocationPromotionType> {
  @Field(() => LocationPromotionType)
  node!: LocationPromotionType;
}

@ObjectType()
export class LocationPromotionConnection extends Connection<LocationPromotionType> {
  @Field(() => [LocationPromotionEdge])
  edges!: LocationPromotionEdge[];
}

@ObjectType()
export class LocationInventoryPolicyEdge extends Edge<LocationInventoryPolicyType> {
  @Field(() => LocationInventoryPolicyType)
  node!: LocationInventoryPolicyType;
}

@ObjectType()
export class LocationInventoryPolicyConnection extends Connection<LocationInventoryPolicyType> {
  @Field(() => [LocationInventoryPolicyEdge])
  edges!: LocationInventoryPolicyEdge[];
}