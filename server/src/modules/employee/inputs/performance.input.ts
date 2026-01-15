import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
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
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  reviewerId!: string;

  @Field()
  @ApiProperty()
  @IsDateString()
  reviewPeriodStart!: string;

  @Field()
  @ApiProperty()
  @IsDateString()
  reviewPeriodEnd!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  strengths?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  areasForImprovement?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  goals?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;
}

@InputType({ description: 'Input for updating performance review' })
export class UpdatePerformanceReviewInput {
  @Field(() => PerformanceReviewStatus, { nullable: true })
  @ApiProperty({ enum: PerformanceReviewStatus, required: false })
  @IsOptional()
  @IsEnum(PerformanceReviewStatus)
  status?: PerformanceReviewStatus;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  overallRating?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  strengths?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  areasForImprovement?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  goals?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 2000)
  comments?: string;
}

@InputType({ description: 'Input for creating employee goal' })
export class CreateEmployeeGoalInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field()
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  title!: string;

  @Field()
  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  description!: string;

  @Field(() => GoalPriority)
  @ApiProperty({ enum: GoalPriority })
  @IsEnum(GoalPriority)
  priority!: GoalPriority;

  @Field()
  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @Field()
  @ApiProperty()
  @IsDateString()
  targetDate!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType({ description: 'Input for updating employee goal' })
export class UpdateEmployeeGoalInput {
  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 2000)
  description?: string;

  @Field(() => GoalStatus, { nullable: true })
  @ApiProperty({ enum: GoalStatus, required: false })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @Field(() => GoalPriority, { nullable: true })
  @ApiProperty({ enum: GoalPriority, required: false })
  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;
}

@InputType({ description: 'Input for creating performance feedback' })
export class CreatePerformanceFeedbackInput {
  @Field(() => ID)
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @Field()
  @ApiProperty()
  @IsString()
  feedbackType!: string;

  @Field()
  @ApiProperty()
  @IsString()
  @Length(1, 2000)
  content!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  isAnonymous?: boolean;
}

@InputType({ description: 'Input for querying performance reviews' })
export class PerformanceReviewQueryInput {
  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @Field(() => PerformanceReviewStatus, { nullable: true })
  @ApiProperty({ enum: PerformanceReviewStatus, required: false })
  @IsOptional()
  @IsEnum(PerformanceReviewStatus)
  status?: PerformanceReviewStatus;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

@InputType({ description: 'Input for querying employee goals' })
export class EmployeeGoalQueryInput {
  @Field(() => ID, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @Field(() => GoalStatus, { nullable: true })
  @ApiProperty({ enum: GoalStatus, required: false })
  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;

  @Field(() => GoalPriority, { nullable: true })
  @ApiProperty({ enum: GoalPriority, required: false })
  @IsOptional()
  @IsEnum(GoalPriority)
  priority?: GoalPriority;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
