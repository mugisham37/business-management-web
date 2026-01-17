import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class Campaign {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  type!: string; // 'loyalty_points', 'discount', 'promotion', 'referral'

  @Field()
  status!: string; // 'draft', 'active', 'paused', 'completed', 'cancelled'

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field(() => Float, { nullable: true })
  pointsMultiplier?: number;

  @Field(() => Float, { nullable: true })
  minimumPurchaseAmount?: number;

  @Field(() => [String])
  targetSegments!: string[];

  @Field(() => [String])
  targetTiers!: string[];

  @Field(() => [String])
  applicableCategories!: string[];

  @Field(() => [String])
  applicableProducts!: string[];

  @Field(() => Int, { nullable: true })
  maxPointsPerCustomer?: number;

  @Field(() => Int, { nullable: true })
  totalPointsBudget?: number;

  @Field(() => Int)
  pointsAwarded!: number;

  @Field(() => Int)
  participantCount!: number;

  @Field(() => Float)
  conversionRate!: number;

  @Field({ nullable: true })
  termsAndConditions?: string;

  @Field(() => Object)
  metadata!: Record<string, any>;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;

  @Field()
  createdBy!: string;

  @Field()
  updatedBy!: string;
}

@ObjectType()
export class CampaignPerformance {
  @Field(() => ID)
  campaignId!: string;

  @Field()
  campaignName!: string;

  @Field()
  status!: string;

  @Field(() => Int)
  pointsAwarded!: number;

  @Field(() => Int)
  participantCount!: number;

  @Field(() => Float)
  conversionRate!: number;

  @Field(() => Float)
  budgetUtilization!: number;

  @Field(() => Int)
  daysRemaining!: number;

  @Field(() => Float, { nullable: true })
  averagePointsPerParticipant?: number;

  @Field(() => Float, { nullable: true })
  totalRevenue?: number;

  @Field(() => Float, { nullable: true })
  averageOrderValue?: number;

  @Field(() => Float, { nullable: true })
  returnOnInvestment?: number;
}

@ObjectType()
export class CampaignMetrics {
  @Field(() => Int)
  totalCampaigns!: number;

  @Field(() => Int)
  activeCampaigns!: number;

  @Field(() => Int)
  completedCampaigns!: number;

  @Field(() => Int)
  totalPointsAwarded!: number;

  @Field(() => Int)
  totalParticipants!: number;

  @Field(() => Float)
  averageConversionRate!: number;

  @Field(() => Float)
  totalBudgetUtilized!: number;

  @Field(() => Float)
  averageCampaignDuration!: number;
}