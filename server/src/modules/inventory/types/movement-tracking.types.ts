import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

// Enums
export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export enum AnalysisType {
  VELOCITY = 'velocity',
  PATTERN = 'pattern',
  ACCURACY = 'accuracy',
  ANOMALY = 'anomaly',
  TREND = 'trend',
}

export enum MovementPattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SEASONAL = 'seasonal',
  IRREGULAR = 'irregular',
}

registerEnumType(AnomalySeverity, { name: 'AnomalySeverity' });
registerEnumType(AnalysisType, { name: 'AnalysisType' });
registerEnumType(MovementPattern, { name: 'MovementPattern' });

@ObjectType()
export class MovementTrackingSummary {
  @Field(() => Float)
  totalInbound!: number;

  @Field(() => Float)
  totalOutbound!: number;

  @Field(() => Float)
  netMovement!: number;

  @Field(() => Int)
  uniqueProducts!: number;

  @Field(() => Object)
  movementTypes!: any;

  @Field(() => Float)
  valueImpact!: number;
}

@ObjectType()
export class PaginationInfo {
  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  page!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  totalPages!: number;
}

@ObjectType()
export class MovementHistoryResult {
  @Field(() => [Object])
  movements!: any[];

  @Field(() => PaginationInfo)
  pagination!: PaginationInfo;

  @Field(() => MovementTrackingSummary)
  summary!: MovementTrackingSummary;
}

@ObjectType()
export class VelocityPeriod {
  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field(() => Int)
  days!: number;
}

@ObjectType()
export class VelocityMetrics {
  @Field(() => Float)
  averageDailyMovement!: number;

  @Field(() => Float)
  totalInbound!: number;

  @Field(() => Float)
  totalOutbound!: number;

  @Field(() => Float)
  netMovement!: number;

  @Field(() => Float)
  movementFrequency!: number;

  @Field()
  peakMovementDay!: Date;

  @Field()
  slowestMovementDay!: Date;
}

@ObjectType()
export class PatternMetrics {
  @Field()
  mostCommonMovementType!: string;

  @Field(() => Float)
  averageMovementSize!: number;

  @Field(() => Float)
  largestSingleMovement!: number;

  @Field(() => Float)
  smallestSingleMovement!: number;
}

@ObjectType()
export class AccuracyMetrics {
  @Field(() => Int)
  adjustmentCount!: number;

  @Field(() => Float)
  adjustmentPercentage!: number;

  @Field(() => Float)
  totalAdjustmentValue!: number;

  @Field(() => Float)
  averageAdjustmentSize!: number;
}

@ObjectType()
export class MovementVelocityAnalysisResult {
  @Field(() => ID)
  productId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => VelocityPeriod)
  period!: VelocityPeriod;

  @Field(() => VelocityMetrics)
  velocity!: VelocityMetrics;

  @Field(() => PatternMetrics)
  patterns!: PatternMetrics;

  @Field(() => AccuracyMetrics)
  accuracy!: AccuracyMetrics;
}

@ObjectType()
export class PatternDistributions {
  @Field(() => Object)
  hourlyDistribution!: any;

  @Field(() => Object)
  dailyDistribution!: any;

  @Field(() => Object)
  monthlyDistribution!: any;

  @Field(() => Object)
  movementTypeDistribution!: any;

  @Field(() => Object)
  userActivityDistribution!: any;
}

@ObjectType()
export class PatternTrends {
  @Field()
  increasingMovements!: boolean;

  @Field()
  seasonalPatterns!: boolean;

  @Field(() => [String])
  peakHours!: string[];

  @Field(() => [String])
  peakDays!: string[];
}

@ObjectType()
export class PatternPeriod {
  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;
}

@ObjectType()
export class MovementPatternAnalysisResult {
  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field(() => PatternPeriod)
  period!: PatternPeriod;

  @Field(() => PatternDistributions)
  patterns!: PatternDistributions;

  @Field(() => PatternTrends)
  trends!: PatternTrends;
}

@ObjectType()
export class AccuracyPeriod {
  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;
}

@ObjectType()
export class AccuracyDetails {
  @Field(() => Int)
  totalProducts!: number;

  @Field(() => Int)
  productsWithAdjustments!: number;

  @Field(() => Float)
  accuracyPercentage!: number;

  @Field(() => Int)
  totalAdjustments!: number;

  @Field(() => Float)
  totalAdjustmentValue!: number;

  @Field(() => Float)
  averageAdjustmentPerProduct!: number;
}

@ObjectType()
export class CategoryAccuracy {
  @Field(() => ID)
  categoryId!: string;

  @Field()
  categoryName!: string;

  @Field(() => Float)
  accuracyPercentage!: number;

  @Field(() => Int)
  adjustmentCount!: number;

  @Field(() => Float)
  adjustmentValue!: number;
}

@ObjectType()
export class AdjustmentReason {
  @Field()
  reason!: string;

  @Field(() => Int)
  count!: number;

  @Field(() => Float)
  totalValue!: number;
}

@ObjectType()
export class InventoryAccuracyMetricsResult {
  @Field(() => ID)
  locationId!: string;

  @Field(() => AccuracyPeriod)
  period!: AccuracyPeriod;

  @Field(() => AccuracyDetails)
  accuracy!: AccuracyDetails;

  @Field(() => [CategoryAccuracy])
  categories!: CategoryAccuracy[];

  @Field(() => [AdjustmentReason])
  topAdjustmentReasons!: AdjustmentReason[];
}

@ObjectType()
export class AuditSummary {
  @Field(() => Int)
  totalMovements!: number;

  @Field()
  periodStart!: Date;

  @Field()
  periodEnd!: Date;

  @Field(() => Float)
  startingLevel!: number;

  @Field(() => Float)
  endingLevel!: number;

  @Field(() => Float)
  netChange!: number;

  @Field(() => Int)
  adjustmentCount!: number;
}

@ObjectType()
export class MovementAuditTrailResult {
  @Field(() => [Object])
  movements!: any[];

  @Field(() => AuditSummary)
  summary!: AuditSummary;
}

@ObjectType()
export class AnomalyDetails {
  @Field(() => ID)
  movementId!: string;

  @Field()
  type!: string;

  @Field(() => AnomalySeverity)
  severity!: AnomalySeverity;

  @Field()
  description!: string;

  @Field(() => Object)
  movement!: any;
}

@ObjectType()
export class AnomalySummary {
  @Field(() => Int)
  totalAnomalies!: number;

  @Field(() => Object)
  severityDistribution!: any;

  @Field()
  mostCommonAnomalyType!: string;
}

@ObjectType()
export class AnomalousMovementResult {
  @Field(() => [AnomalyDetails])
  anomalies!: AnomalyDetails[];

  @Field(() => AnomalySummary)
  summary!: AnomalySummary;
}