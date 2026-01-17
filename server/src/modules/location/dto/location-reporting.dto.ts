import { IsDateString, IsOptional, IsEnum, IsArray, IsUUID, IsBoolean, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export enum ReportType {
  FINANCIAL = 'financial',
  INVENTORY = 'inventory',
  SALES = 'sales',
  CUSTOMER = 'customer',
  PROCUREMENT = 'procurement',
  COMPREHENSIVE = 'comprehensive',
}

export enum GroupByType {
  LOCATION = 'location',
  REGION = 'region',
  TYPE = 'type',
  MANAGER = 'manager',
}

export enum DrillDownLevel {
  SUMMARY = 'summary',
  DETAILED = 'detailed',
  TRANSACTION = 'transaction',
}

export enum ComparisonType {
  PEER = 'peer',
  HISTORICAL = 'historical',
  BENCHMARK = 'benchmark',
}

export class ConsolidatedReportQueryDto {
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  locationIds?: string[];

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate!: Date;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate!: Date;

  @IsEnum(ReportType)
  reportType!: ReportType;

  @IsOptional()
  @IsEnum(GroupByType)
  groupBy?: GroupByType;

  @IsOptional()
  @IsBoolean()
  includeComparisons?: boolean;

  @IsOptional()
  @IsBoolean()
  includeBenchmarks?: boolean;

  @IsOptional()
  @IsEnum(DrillDownLevel)
  drillDownLevel?: DrillDownLevel;
}

export class LocationComparisonQueryDto {
  @IsArray()
  @IsUUID(4, { each: true })
  locationIds!: string[];

  @IsEnum(ComparisonType)
  comparisonType!: ComparisonType;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate!: Date;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate!: Date;
}

export class LocationBenchmarkQueryDto {
  @IsUUID(4)
  locationId!: string;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  startDate!: Date;

  @IsDateString()
  @Transform(({ value }) => new Date(value))
  endDate!: Date;
}

export class LocationPerformanceMetricsDto {
  locationId!: string;
  locationName!: string;
  locationCode!: string;
  locationType!: string;
  region?: string;
  managerId?: string;
  managerName?: string;

  // Financial Metrics
  revenue!: number;
  grossProfit!: number;
  netProfit!: number;
  expenses!: number;
  profitMargin!: number;

  // Sales Metrics
  transactionCount!: number;
  averageTransactionValue!: number;
  itemsSold!: number;
  refundAmount!: number;
  refundRate!: number;

  // Inventory Metrics
  inventoryValue!: number;
  inventoryTurnover!: number;
  stockoutEvents!: number;
  excessInventoryValue!: number;

  // Customer Metrics
  uniqueCustomers!: number;
  repeatCustomerRate!: number;
  customerLifetimeValue!: number;
  customerSatisfactionScore?: number;

  // Operational Metrics
  employeeCount!: number;
  salesPerEmployee!: number;
  operatingHours!: number;
  salesPerHour!: number;

  // Comparative Metrics
  previousPeriodGrowth?: number;
  benchmarkComparison?: number;
  rankAmongLocations?: number;
}

export class AggregatedMetricsDto {
  totalRevenue!: number;
  totalTransactions!: number;
  totalCustomers!: number;
  totalInventoryValue!: number;
  averageProfitMargin!: number;
  topPerformingLocationId!: string;
  lowestPerformingLocationId!: string;
}

export class ReportPeriodDto {
  startDate!: Date;
  endDate!: Date;
  daysInPeriod!: number;
}

export class ComparativeAnalysisDto {
  periodOverPeriodGrowth!: number;
  bestPerformingMetrics!: string[];
  improvementOpportunities!: string[];
  benchmarkAnalysis?: {
    aboveAverage: number;
    belowAverage: number;
    averagePerformance: LocationPerformanceMetricsDto;
  };
}

export class ConsolidatedReportDto {
  reportId!: string;
  tenantId!: string;
  reportType!: string;
  generatedAt!: Date;

  @ValidateNested()
  @Type(() => ConsolidatedReportQueryDto)
  query!: ConsolidatedReportQueryDto;

  totalLocations!: number;

  @ValidateNested()
  @Type(() => ReportPeriodDto)
  reportPeriod!: ReportPeriodDto;

  @ValidateNested()
  @Type(() => AggregatedMetricsDto)
  aggregatedMetrics!: AggregatedMetricsDto;

  @ValidateNested({ each: true })
  @Type(() => LocationPerformanceMetricsDto)
  locationMetrics!: LocationPerformanceMetricsDto[];

  @ValidateNested()
  @Type(() => ComparativeAnalysisDto)
  comparativeAnalysis?: ComparativeAnalysisDto;

  drillDownData?: {
    [locationId: string]: {
      dailyMetrics?: any[];
      topProducts?: any[];
      topCustomers?: any[];
      transactionDetails?: any[];
    };
  };
}

export class LocationComparisonItemDto {
  locationId!: string;
  locationName!: string;

  @ValidateNested()
  @Type(() => LocationPerformanceMetricsDto)
  metrics!: LocationPerformanceMetricsDto;

  ranking!: number;
  percentileRank!: number;
  strengthAreas!: string[];
  improvementAreas!: string[];
}

export class ComparisonInsightsDto {
  topPerformers!: string[];
  underperformers!: string[];
  keySuccessFactors!: string[];
  recommendedActions!: {
    locationId: string;
    recommendations: string[];
  }[];
}

export class LocationComparisonReportDto {
  comparisonId!: string;
  tenantId!: string;
  generatedAt!: Date;
  comparisonType!: ComparisonType;

  @ValidateNested({ each: true })
  @Type(() => LocationComparisonItemDto)
  locations!: LocationComparisonItemDto[];

  @ValidateNested()
  @Type(() => ComparisonInsightsDto)
  insights!: ComparisonInsightsDto;
}

export class BenchmarkDataDto {
  @ValidateNested()
  @Type(() => LocationPerformanceMetricsDto)
  tenantAverage!: LocationPerformanceMetricsDto;

  @ValidateNested()
  @Type(() => LocationPerformanceMetricsDto)
  topQuartile!: LocationPerformanceMetricsDto;

  @ValidateNested()
  @Type(() => LocationPerformanceMetricsDto)
  industryAverage?: LocationPerformanceMetricsDto;
}

export class LocationBenchmarkReportDto {
  @ValidateNested()
  @Type(() => LocationPerformanceMetricsDto)
  location!: LocationPerformanceMetricsDto;

  @ValidateNested()
  @Type(() => BenchmarkDataDto)
  benchmarks!: BenchmarkDataDto;

  recommendations!: string[];
}

// Export query interfaces for service layer
export interface ConsolidatedReportQuery {
  locationIds?: string[];
  startDate: Date;
  endDate: Date;
  reportType: 'financial' | 'inventory' | 'sales' | 'customer' | 'procurement' | 'comprehensive';
  groupBy?: 'location' | 'region' | 'type' | 'manager';
  includeComparisons?: boolean;
  includeBenchmarks?: boolean;
  drillDownLevel?: 'summary' | 'detailed' | 'transaction';
}