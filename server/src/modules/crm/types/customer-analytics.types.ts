import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { GraphQLJSONObject } from 'graphql-type-json';

export enum SpendingTrend {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
}

registerEnumType(SpendingTrend, {
  name: 'SpendingTrend',
});

@ObjectType()
export class CustomerLifetimeValueType {
  @Field(() => ID)
  @ApiProperty()
  customerId!: string;

  @Field(() => Float)
  @ApiProperty()
  currentValue!: number;

  @Field(() => Float)
  @ApiProperty()
  predictedValue!: number;

  @Field(() => Int)
  @ApiProperty()
  totalOrders!: number;

  @Field(() => Float)
  @ApiProperty()
  averageOrderValue!: number;

  @Field(() => Int)
  @ApiProperty()
  daysSinceFirstPurchase!: number;

  @Field(() => Int)
  @ApiProperty()
  daysSinceLastPurchase!: number;

  @Field(() => Float)
  @ApiProperty()
  purchaseFrequency!: number;

  @Field(() => Float)
  @ApiProperty()
  churnRisk!: number;
}

@ObjectType()
export class CustomerSegmentAnalyticsType {
  @Field()
  @ApiProperty()
  segmentName!: string;

  @Field(() => Int)
  @ApiProperty()
  customerCount!: number;

  @Field(() => Float)
  @ApiProperty()
  averageLifetimeValue!: number;

  @Field(() => Float)
  @ApiProperty()
  averageOrderValue!: number;

  @Field(() => Float)
  @ApiProperty()
  averagePurchaseFrequency!: number;

  @Field(() => Float)
  @ApiProperty()
  churnRate!: number;

  @Field(() => GraphQLJSONObject)
  @ApiProperty()
  loyaltyTierDistribution!: Record<string, number>;
}

@ObjectType()
export class PurchasePatternAnalysisType {
  @Field(() => ID)
  @ApiProperty()
  customerId!: string;

  @Field(() => GraphQLJSONObject)
  @ApiProperty()
  seasonalPatterns!: Record<string, number>;

  @Field(() => GraphQLJSONObject)
  @ApiProperty()
  dayOfWeekPatterns!: Record<string, number>;

  @Field(() => GraphQLJSONObject)
  @ApiProperty()
  categoryPreferences!: Record<string, number>;

  @Field(() => Float)
  @ApiProperty()
  averageTimeBetweenPurchases!: number;

  @Field()
  @ApiProperty()
  preferredPurchaseTime!: string;

  @Field(() => SpendingTrend)
  @ApiProperty({ enum: SpendingTrend })
  spendingTrend!: SpendingTrend;
}

@ObjectType()
export class ChurnPredictionType {
  @Field(() => ID)
  @ApiProperty()
  customerId!: string;

  @Field(() => Float)
  @ApiProperty()
  churnRisk!: number;

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  riskFactors!: string[];

  @Field()
  @ApiProperty()
  lastPurchaseDate!: Date;

  @Field(() => Int)
  @ApiProperty()
  daysSinceLastPurchase!: number;

  @Field()
  @ApiProperty()
  expectedNextPurchaseDate!: Date;

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  recommendedActions!: string[];
}

@ObjectType()
export class CustomerTouchpointType {
  @Field()
  @ApiProperty()
  date!: Date;

  @Field()
  @ApiProperty()
  type!: string;

  @Field()
  @ApiProperty()
  description!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  outcome?: string;
}

@ObjectType()
export class CustomerMilestoneType {
  @Field()
  @ApiProperty()
  date!: Date;

  @Field()
  @ApiProperty()
  milestone!: string;

  @Field()
  @ApiProperty()
  description!: string;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ required: false })
  value?: number;
}

@ObjectType()
export class CustomerJourneyType {
  @Field(() => ID)
  @ApiProperty()
  customerId!: string;

  @Field(() => CustomerLifetimeValueType)
  @ApiProperty({ type: CustomerLifetimeValueType })
  lifetimeValue!: CustomerLifetimeValueType;

  @Field(() => PurchasePatternAnalysisType)
  @ApiProperty({ type: PurchasePatternAnalysisType })
  purchasePatterns!: PurchasePatternAnalysisType;

  @Field(() => ChurnPredictionType)
  @ApiProperty({ type: ChurnPredictionType })
  churnPrediction!: ChurnPredictionType;

  @Field(() => [CustomerTouchpointType])
  @ApiProperty({ type: [CustomerTouchpointType] })
  touchpoints!: CustomerTouchpointType[];

  @Field(() => [CustomerMilestoneType])
  @ApiProperty({ type: [CustomerMilestoneType] })
  milestones!: CustomerMilestoneType[];
}
