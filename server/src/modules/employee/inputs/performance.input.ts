import { InputType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsUUID,
  IsNumber,
  Min,
  Max,
  Length,
} from 'class-validator';
import { PerformanceReviewStatus, GoalStatus, GoalPriority } from '../types/performance.types';

@InputType({ description: 'Input for creating performance review' })
export class CreatePerformanceReviewInput {
  @Field(() => ID)

  @IsUUID()
  employeeId!: string;

  @Field(() => ID)

  @IsUUID()
  reviewerId!: string;

  @Field()

  @IsDateString()
  reviewPeriodStart!: string;

  @Field()

  @IsDateString()
  reviewPeriodEnd!: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  strengths?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  areasForImprovement?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  goals?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;
}

@InputType({ description: 'Input for updating performance review' })
export class UpdatePerformanceReviewInput {
  @Field(() => PerformanceReviewStatus, { nullable: true })

  @IsOptional()
  @IsEnum(PerformanceReviewStatus)
  status?: PerformanceReviewStatus;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  overallRating?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  strengths?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  areasForImprovement?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  goals?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;
}

@InputType({ description: 'Input for creating employee goal' })
export class CreateEmployeeGoalInput {
  @Field(() => ID)

  @IsUUID()
  employeeId!: string;

  @Field()

  @IsString()
  @Length(1, 255)
  title!: string;

  @Field()

  @IsString()
  @Length(1, 2000)
  description!: string;

  @Field(() => GoalPriority)

  @IsEnum(GoalPriority)
  priority!: GoalPriority;

  @Field()

  @IsDateString()
  startDate!: string;

  @Field()

  @IsDateString()
  targetDate!: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType({ description: 'Input for updating employee goal' })
export class UpdateEmployeeGoalInput {
  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @Field(() => GoalStatus, { nullable: true })

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @Field(() => GoalPriority, { nullable: true })

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @Field(() => Int, { nullable: true })

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @Field({ nullable: true })

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType({ description: 'Input for creating performance feedback' })
export class CreatePerformanceFeedbackInput {
  @Field(() => ID)

  @IsUUID()
  employeeId!: string;

  @Field()

  @IsString()
  feedbackType!: string;

  @Field()

  @IsString()
  @Length(1, 2000)
  content!: string;

  @Field({ nullable: true })

  @IsOptional()
  isAnonymous?: boolean;
}

@InputType({ description: 'Input for querying performance reviews' })
export class PerformanceReviewQueryInput {
  @Field(() => ID, { nullable: true })

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field(() => ID, { nullable: true })

  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @Field(() => PerformanceReviewStatus, { nullable: true })

  @IsOptional()
  @IsEnum(PerformanceReviewStatus)
  status?: PerformanceReviewStatus;

  @Field(() => Int, { nullable: true })

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

@InputType({ description: 'Input for querying employee goals' })
export class EmployeeGoalQueryInput {
  @Field(() => ID, { nullable: true })

  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field(() => GoalStatus, { nullable: true })

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @Field(() => GoalPriority, { nullable: true })

  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @Field(() => Int, { nullable: true })

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
