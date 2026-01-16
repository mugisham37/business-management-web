import { InputType, Field, Int, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDate, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { MetricCategory, TimePeriod } from '../types/analytics.types';

@InputType()
export class MetricsFilterInput {
  @Field(() => [MetricCategory], { nullable: true })
  @ApiProperty({ enum: MetricCategory, isArray: true, required: false })
  @IsOptional()
  @IsArray()
  @IsEnum(MetricCategory, { each: true })
  categories?: MetricCategory[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricNames?: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dimensions?: string[];
}

@InputType()
export class KPIFilterInput {
  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kpiNames?: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => TimePeriod, { nullable: true })
  @ApiProperty({ enum: TimePeriod, required: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod;
}

@InputType()
export class TrendFilterInput {
  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricNames?: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @Field(() => TimePeriod, { nullable: true })
  @ApiProperty({ enum: TimePeriod, required: false })
  @IsOptional()
  @IsEnum(TimePeriod)
  granularity?: TimePeriod;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number;
}


@InputType()
export class TimePeriodComparisonInput {
  @Field()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  currentStartDate!: Date;

  @Field()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  currentEndDate!: Date;

  @Field()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  comparisonStartDate!: Date;

  @Field()
  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  comparisonEndDate!: Date;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metricNames?: string[];
}

@InputType()
export class LocationComparisonInput {
  @Field(() => [String])
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  locationIds!: string[];

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  metricNames!: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

@InputType()
export class SegmentComparisonInput {
  @Field(() => [String])
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  segmentIds!: string[];

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  metricNames!: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}


@InputType()
export class CreateReportInput {
  @Field()
  @ApiProperty()
  @IsString()
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @ApiProperty()
  @IsString()
  reportType!: string;

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  metrics!: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dimensions?: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

@InputType()
export class ExecuteReportInput {
  @Field(() => ID)
  @ApiProperty()
  @IsString()
  reportId!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}

@InputType()
export class ScheduleReportInput {
  @Field(() => ID)
  @ApiProperty()
  @IsString()
  reportId!: string;

  @Field()
  @ApiProperty({ description: 'Cron expression for schedule' })
  @IsString()
  schedule!: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timezone?: string;
}
