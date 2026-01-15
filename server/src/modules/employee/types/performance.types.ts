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
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field(() => ID)
  @ApiProperty()
  reviewerId!: string;

  @Field()
  @ApiProperty()
  reviewPeriodStart!: Date;

  @Field()
  @ApiProperty()
  reviewPeriodEnd!: Date;

  @Field(() => PerformanceReviewStatus)
  @ApiProperty({ enum: PerformanceReviewStatus })
  status!: PerformanceReviewStatus;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  overallRating?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  strengths?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  areasForImprovement?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  goals?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  comments?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  completedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  acknowledgedAt?: Date;

  // Field resolvers
  @Field(() => Employee, { nullable: true })
  reviewer?: any;
}

@ObjectType({ description: 'Employee goal' })
export class EmployeeGoalType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field()
  @ApiProperty()
  title!: string;

  @Field()
  @ApiProperty()
  description!: string;

  @Field(() => GoalStatus)
  @ApiProperty({ enum: GoalStatus })
  status!: GoalStatus;

  @Field(() => GoalPriority)
  @ApiProperty({ enum: GoalPriority })
  priority!: GoalPriority;

  @Field()
  @ApiProperty()
  startDate!: Date;

  @Field()
  @ApiProperty()
  targetDate!: Date;

  @Field(() => Int)
  @ApiProperty()
  progress!: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  completedDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  lastReviewDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  notes?: string;
}

@ObjectType({ description: 'Performance feedback' })
export class PerformanceFeedbackType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty()
  declare id: string;

  @Field(() => ID)
  @ApiProperty()
  employeeId!: string;

  @Field(() => ID)
  @ApiProperty()
  providedBy!: string;

  @Field()
  @ApiProperty()
  feedbackDate!: Date;

  @Field()
  @ApiProperty()
  feedbackType!: string;

  @Field()
  @ApiProperty()
  content!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  isAnonymous?: boolean;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  isAcknowledged?: boolean;
}

@ObjectType({ description: 'Performance review connection' })
export class PerformanceReviewConnection {
  @Field(() => [PerformanceReviewType])
  @ApiProperty({ type: [PerformanceReviewType] })
  reviews!: PerformanceReviewType[];

  @Field(() => Int)
  @ApiProperty()
  total!: number;

  @Field(() => Int)
  @ApiProperty()
  page!: number;

  @Field(() => Int)
  @ApiProperty()
  limit!: number;
}

@ObjectType({ description: 'Employee goal connection' })
export class EmployeeGoalConnection {
  @Field(() => [EmployeeGoalType])
  @ApiProperty({ type: [EmployeeGoalType] })
  goals!: EmployeeGoalType[];

  @Field(() => Int)
  @ApiProperty()
  total!: number;

  @Field(() => Int)
  @ApiProperty()
  page!: number;

  @Field(() => Int)
  @ApiProperty()
  limit!: number;
}

// Import Employee type reference
class Employee {
  id!: string;
  firstName!: string;
  lastName!: string;
}
