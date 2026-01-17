import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class AccuracyMetricsData {
  @Field(() => Int)
  totalProducts!: number;

  @Field(() => Int)
  productsWithVariance!: number;

  @Field(() => Float)
  accuracyPercentage!: number;

  @Field(() => Int)
  totalAdjustments!: number;

  @Field(() => Float)
  totalVarianceValue!: number;

  @Field(() => Float)
  averageVariancePerProduct!: number;
}

@ObjectType()
export class LocationAccuracy {
  @Field(() => ID)
  locationId!: string;

  @Field()
  locationName!: string;

  @Field(() => Float)
  accuracyPercentage!: number;

  @Field(() => Int)
  varianceCount!: number;

  @Field(() => Float)
  varianceValue!: number;
}

@ObjectType()
export class CategoryAccuracyData {
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
export class AdjustmentReasonData {
  @Field()
  reason!: string;

  @Field(() => Int)
  count!: number;

  @Field(() => Float)
  totalValue!: number;

  @Field(() => Float)
  percentage!: number;
}

@ObjectType()
export class AccuracyReportPeriod {
  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field(() => Int)
  days!: number;
}

@ObjectType()
export class AccuracyReport {
  @Field(() => ID)
  reportId!: string;

  @Field(() => ID)
  locationId!: string;

  @Field(() => AccuracyReportPeriod)
  period!: AccuracyReportPeriod;

  @Field(() => AccuracyMetricsData)
  metrics!: AccuracyMetricsData;

  @Field(() => [CategoryAccuracyData])
  byCategory!: CategoryAccuracyData[];

  @Field(() => [AdjustmentReasonData])
  adjustmentReasons!: AdjustmentReasonData[];

  @Field()
  generatedDate!: Date;

  @Field({ nullable: true })
  generatedBy?: string;
}

@ObjectType()
export class VarianceAnalysis {
  @Field(() => ID)
  locationId!: string;

  @Field(() => Int)
  totalVariances!: number;

  @Field(() => Float)
  totalVarianceValue!: number;

  @Field(() => Float)
  averageVariancePerItem!: number;

  @Field(() => Float)
  maxVariance!: number;

  @Field(() => Float)
  minVariance!: number;

  @Field(() => [CategoryAccuracyData])
  byCategory!: CategoryAccuracyData[];

  @Field()
  reportDate!: Date;
}

@ObjectType()
export class CountAccuracy {
  @Field(() => ID, { nullable: true })
  locationId?: string;

  @Field(() => Float)
  overallAccuracy!: number;

  @Field(() => Int)
  totalCountsPerformed!: number;

  @Field(() => Int)
  countsWithVariances!: number;

  @Field(() => Int)
  perfectCounts!: number;

  @Field(() => Float)
  variance!: number;

  @Field(() => [LocationAccuracy])
  byLocation!: LocationAccuracy[];

  @Field()
  generatedDate!: Date;
}
