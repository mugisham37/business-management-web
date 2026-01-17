import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class CustomerLifetimeValue {
  @Field(() => ID)
  customerId!: string;

  @Field(() => Float)
  currentValue!: number;

  @Field(() => Float)
  predictedValue!: number;

  @Field(() => Float)
  averageOrderValue!: number;

  @Field(() => Int)
  totalOrders!: number;

  @Field(() => Float)
  totalSpent!: number;

  @Field(() => Int)
  daysSinceFirstPurchase!: number;

  @Field(() => Float)
  purchaseFrequency!: number;

  @Field(() => Float)
  churnProbability!: number;
}

@ObjectType()
export class SegmentAnalytics {
  @Field(() => ID)
  segmentId!: string;

  @Field()
  segmentName!: string;

  @Field(() => Int)
  customerCount!: number;

  @Field(() => Float)
  averageLifetimeValue!: number;

  @Field(() => Float)
  averageOrderValue!: number;

  @Field(() => Float)
  totalRevenue!: number;

  @Field(() => Float)
  conversionRate!: number;

  @Field(() => Float)
  churnRate!: number;

  @Field(() => Int)
  averageDaysBetweenPurchases!: number;
}

@ObjectType()
export class PurchasePattern {
  @Field(() => ID)
  customerId!: string;

  @Field(() => [String])
  preferredCategories!: string[];

  @Field(() => [String])
  preferredBrands!: string[];

  @Field(() => Float)
  seasonalityScore!: number;

  @Field(() => String)
  primaryShoppingDay!: string;

  @Field(() => String)
  primaryShoppingTime!: string;

  @Field(() => Float)
  pricesensitivity!: number;

  @Field(() => Float)
  promotionResponsiveness!: number;

  @Field(() => Int)
  averageDaysBetweenPurchases!: number;

  @Field(() => Float)
  basketSizeVariability!: number;
}

@ObjectType()
export class ChurnRiskAnalysis {
  @Field(() => ID)
  customerId!: string;

  @Field(() => Float)
  churnProbability!: number;

  @Field(() => String)
  riskLevel!: string; // 'low', 'medium', 'high', 'critical'

  @Field(() => [String])
  riskFactors!: string[];

  @Field(() => Int)
  daysSinceLastPurchase!: number;

  @Field(() => Float)
  engagementScore!: number;

  @Field(() => Float)
  satisfactionScore!: number;

  @Field(() => [String])
  recommendedActions!: string[];

  @Field(() => Date, { nullable: true })
  predictedChurnDate?: Date;
}

@ObjectType()
export class CustomerMetrics {
  @Field(() => Int)
  totalCustomers!: number;

  @Field(() => Int)
  activeCustomers!: number;

  @Field(() => Int)
  newCustomersThisMonth!: number;

  @Field(() => Float)
  customerGrowthRate!: number;

  @Field(() => Float)
  averageLifetimeValue!: number;

  @Field(() => Float)
  averageOrderValue!: number;

  @Field(() => Float)
  churnRate!: number;

  @Field(() => Float)
  retentionRate!: number;

  @Field(() => Int)
  averageDaysBetweenPurchases!: number;

  @Field(() => Float)
  customerSatisfactionScore!: number;
}