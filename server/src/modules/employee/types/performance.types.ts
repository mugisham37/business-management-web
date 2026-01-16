import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

// Define enums
export enum PerformanceReviewStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ACKNOWLEDGED = 'acknowledged',
}

export enum GoalStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum GoalPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Register enums for GraphQL
registerEnumType(PerformanceReviewStatus, {
  name: 'PerformanceReviewStatus',
  description: 'Status of performance review',
});

registerEnumType(GoalStatus, {
  name: 'GoalStatus',
  description: 'Status of employee goal',
});

registerEnumType(GoalPriority, {
  name: 'GoalPriority',
  description: 'Priority level of goal',
});

@ObjectType({ description: 'Performance review record' })
export class PerformanceReviewType extends BaseEntity {
  @Field(() => ID)

  declare id: string;

  @Field(() => ID)

  employeeId!: string;

  @Field(() => ID)

  reviewerId!: string;

  @Field()

  reviewPeriodStart!: Date;

  @Field()

  reviewPeriodEnd!: Date;

  @Field(() => PerformanceReviewStatus)

  status!: PerformanceReviewStatus;

  @Field({ nullable: true })

  overallRating?: string;

  @Field({ nullable: true })

  strengths?: string;

  @Field({ nullable: true })

  areasForImprovement?: string;

  @Field({ nullable: true })

  goals?: string;

  @Field({ nullable: true })

  comments?: string;

  @Field({ nullable: true })

  completedAt?: Date;

  @Field({ nullable: true })

  acknowledgedAt?: Date;

  // Field resolvers
  @Field(() => Employee, { nullable: true })
  reviewer?: any;
}

@ObjectType({ description: 'Employee goal' })
export class EmployeeGoalType extends BaseEntity {
  @Field(() => ID)

  declare id: string;

  @Field(() => ID)

  employeeId!: string;

  @Field()

  title!: string;

  @Field()

  description!: string;

  @Field(() => GoalStatus)

  status!: GoalStatus;

  @Field(() => GoalPriority)

  priority!: GoalPriority;

  @Field()

  startDate!: Date;

  @Field()

  targetDate!: Date;

  @Field(() => Int)

  progress!: number;

  @Field({ nullable: true })

  completedDate?: Date;

  @Field({ nullable: true })

  lastReviewDate?: Date;

  @Field({ nullable: true })

  notes?: string;
}

@ObjectType({ description: 'Performance feedback' })
export class PerformanceFeedbackType extends BaseEntity {
  @Field(() => ID)

  declare id: string;

  @Field(() => ID)

  employeeId!: string;

  @Field(() => ID)

  providedBy!: string;

  @Field()

  feedbackDate!: Date;

  @Field()

  feedbackType!: string;

  @Field()

  content!: string;

  @Field({ nullable: true })

  isAnonymous?: boolean;

  @Field({ nullable: true })

  isAcknowledged?: boolean;
}

@ObjectType({ description: 'Performance review connection' })
export class PerformanceReviewConnection {
  @Field(() => [PerformanceReviewType])

  reviews!: PerformanceReviewType[];

  @Field(() => Int)

  total!: number;

  @Field(() => Int)

  page!: number;

  @Field(() => Int)

  limit!: number;
}

@ObjectType({ description: 'Employee goal connection' })
export class EmployeeGoalConnection {
  @Field(() => [EmployeeGoalType])

  goals!: EmployeeGoalType[];

  @Field(() => Int)

  total!: number;

  @Field(() => Int)

  page!: number;

  @Field(() => Int)

  limit!: number;
}

// Import Employee type reference
class Employee {
  id!: string;
  firstName!: string;
  lastName!: string;
}
