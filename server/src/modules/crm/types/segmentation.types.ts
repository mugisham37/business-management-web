import { ObjectType, Field, Int, ID, Float } from '@nestjs/graphql';

@ObjectType()
export class SegmentationType {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [SegmentRule])
  rules!: SegmentRule[];

  @Field()
  isActive!: boolean;

  @Field(() => Int)
  memberCount!: number;

  @Field({ nullable: true })
  lastCalculatedAt?: Date;

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
export class SegmentRule {
  @Field()
  field!: string;

  @Field()
  operator!: string; // 'equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'in', 'not_in'

  @Field()
  value!: any;

  @Field({ nullable: true })
  logicalOperator?: string; // 'AND', 'OR'
}

@ObjectType()
export class SegmentMember {
  @Field(() => ID)
  segmentId!: string;

  @Field(() => ID)
  customerId!: string;

  @Field()
  addedAt!: Date;

  @Field({ nullable: true })
  removedAt?: Date;

  @Field()
  isActive!: boolean;
}

@ObjectType()
export class SegmentPerformance {
  @Field(() => ID)
  segmentId!: string;

  @Field()
  segmentName!: string;

  @Field(() => Int)
  memberCount!: number;

  @Field(() => Float)
  totalRevenue!: number;

  @Field(() => Float)
  averageOrderValue!: number;

  @Field(() => Float)
  conversionRate!: number;

  @Field(() => Float)
  churnRate!: number;

  @Field(() => Float)
  engagementScore!: number;

  @Field(() => Int)
  totalOrders!: number;

  @Field(() => Int)
  activeMembers!: number;

  @Field(() => Int)
  newMembersThisMonth!: number;

  @Field(() => Float)
  memberGrowthRate!: number;
}

@ObjectType()
export class SegmentComparison {
  @Field(() => [SegmentPerformance])
  segments!: SegmentPerformance[];

  @Field(() => String)
  comparisonMetric!: string;

  @Field(() => Date)
  comparisonDate!: Date;

  @Field(() => String)
  period!: string; // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
}

// Type aliases for backward compatibility
export type SegmentType = SegmentationType;
export type SegmentMemberType = SegmentMember;

// Response type for segment jobs
@ObjectType()
export class SegmentJobResponse {
  @Field(() => ID)
  jobId!: string;

  @Field()
  status!: string; // 'pending', 'processing', 'completed', 'failed'

  @Field(() => Int, { nullable: true })
  processedCount?: number;

  @Field(() => Int, { nullable: true })
  totalCount?: number;

  @Field({ nullable: true })
  errorMessage?: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  completedAt?: Date;
}

export type SegmentJobResponseType = SegmentJobResponse;