import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

@ObjectType()
export class Metric {
  @Field(() => ID)
  @ApiProperty({ description: 'Metric identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Metric name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Metric description', required: false })
  description?: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Metric value' })
  value!: number;

  @Field()
  @ApiProperty({ description: 'Metric unit' })
  unit!: string;

  @Field()
  @ApiProperty({ description: 'Metric category' })
  category!: string;

  @Field()
  @ApiProperty({ description: 'Timestamp for the metric' })
  timestamp!: Date;

  @Field(() => [MetricDimension], { nullable: true })
  @ApiProperty({ type: [MetricDimension], required: false })
  dimensions?: MetricDimension[];
}

@ObjectType()
export class MetricDimension {
  @Field()
  @ApiProperty({ description: 'Dimension name' })
  name!: string;

  @Field()
  @ApiProperty({ description: 'Dimension value' })
  value!: string;
}

@ObjectType()
export class KPI {
  @Field(() => ID)
  @ApiProperty({ description: 'KPI identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'KPI name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'KPI description', required: false })
  description?: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Current value' })
  currentValue!: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Target value', required: false })
  targetValue?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Previous period value', required: false })
  previousValue?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Change percentage', required: false })
  changePercentage?: number;

  @Field()
  @ApiProperty({ description: 'KPI status' })
  status!: string;

  @Field()
  @ApiProperty({ description: 'Measurement period' })
  period!: string;

  @Field()
  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt!: Date;
}

@ObjectType()
export class Trend {
  @Field(() => ID)
  @ApiProperty({ description: 'Trend identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Metric name' })
  metricName!: string;

  @Field(() => [TrendDataPoint])
  @ApiProperty({ type: [TrendDataPoint] })
  dataPoints!: TrendDataPoint[];

  @Field()
  @ApiProperty({ description: 'Trend direction' })
  direction!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Trend slope' })
  slope!: number;

  @Field()
  @ApiProperty({ description: 'Start date' })
  startDate!: Date;

  @Field()
  @ApiProperty({ description: 'End date' })
  endDate!: Date;
}

@ObjectType()
export class TrendDataPoint {
  @Field()
  @ApiProperty({ description: 'Data point timestamp' })
  timestamp!: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Data point value' })
  value!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Data point label', required: false })
  label?: string;
}

export enum MetricCategory {
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  CUSTOMER = 'CUSTOMER',
  FINANCIAL = 'FINANCIAL',
  OPERATIONAL = 'OPERATIONAL',
}

registerEnumType(MetricCategory, {
  name: 'MetricCategory',
  description: 'Categories for metrics',
});

export enum TimePeriod {
  HOUR = 'HOUR',
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
}

registerEnumType(TimePeriod, {
  name: 'TimePeriod',
  description: 'Time period granularity',
});


@ObjectType()
export class ComparisonResult {
  @Field(() => ID)
  @ApiProperty({ description: 'Comparison identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Comparison type' })
  comparisonType!: string;

  @Field()
  @ApiProperty({ description: 'Metric name' })
  metricName!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Current period value' })
  currentValue!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Comparison period value' })
  comparisonValue!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Absolute variance' })
  variance!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Percentage change' })
  percentageChange!: number;

  @Field()
  @ApiProperty({ description: 'Current period label' })
  currentLabel!: string;

  @Field()
  @ApiProperty({ description: 'Comparison period label' })
  comparisonLabel!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Additional context', required: false })
  context?: string;
}

@ObjectType()
export class LocationComparison {
  @Field(() => ID)
  @ApiProperty({ description: 'Location identifier' })
  locationId!: string;

  @Field()
  @ApiProperty({ description: 'Location name' })
  locationName!: string;

  @Field(() => [MetricValue])
  @ApiProperty({ type: [MetricValue] })
  metrics!: MetricValue[];

  @Field(() => Int)
  @ApiProperty({ description: 'Rank among compared locations' })
  rank!: number;
}

@ObjectType()
export class MetricValue {
  @Field()
  @ApiProperty({ description: 'Metric name' })
  name!: string;

  @Field(() => Float)
  @ApiProperty({ description: 'Metric value' })
  value!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Metric unit', required: false })
  unit?: string;
}

@ObjectType()
export class SegmentComparison {
  @Field(() => ID)
  @ApiProperty({ description: 'Segment identifier' })
  segmentId!: string;

  @Field()
  @ApiProperty({ description: 'Segment name' })
  segmentName!: string;

  @Field(() => [MetricValue])
  @ApiProperty({ type: [MetricValue] })
  metrics!: MetricValue[];

  @Field(() => Int)
  @ApiProperty({ description: 'Segment size' })
  size!: number;
}


@ObjectType()
export class Report extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Report name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Report description', required: false })
  description?: string;

  @Field()
  @ApiProperty({ description: 'Report type' })
  reportType!: string;

  @Field()
  @ApiProperty({ description: 'Report status' })
  status!: string;

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  metrics!: string[];

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], required: false })
  dimensions?: string[];

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  schedule?: string;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  lastRunAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ required: false })
  nextRunAt?: Date;
}

@ObjectType()
export class ReportExecution {
  @Field(() => ID)
  @ApiProperty({ description: 'Execution identifier' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Report identifier' })
  reportId!: string;

  @Field()
  @ApiProperty({ description: 'Execution status' })
  status!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Job ID for tracking', required: false })
  jobId?: string;

  @Field()
  @ApiProperty({ description: 'Started at timestamp' })
  startedAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Completed at timestamp', required: false })
  completedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message if failed', required: false })
  error?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Result data', required: false })
  result?: string;
}

@ObjectType()
export class ScheduledReport {
  @Field(() => ID)
  @ApiProperty({ description: 'Schedule identifier' })
  id!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'Report identifier' })
  reportId!: string;

  @Field()
  @ApiProperty({ description: 'Schedule expression (cron)' })
  schedule!: string;

  @Field()
  @ApiProperty({ description: 'Whether schedule is active' })
  isActive!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Next run timestamp', required: false })
  nextRunAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last run timestamp', required: false })
  lastRunAt?: Date;
}

export enum ReportStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(ReportStatus, {
  name: 'ReportStatus',
  description: 'Status of a report',
});

export enum ExecutionStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

registerEnumType(ExecutionStatus, {
  name: 'ExecutionStatus',
  description: 'Status of a report execution',
});


@ObjectType()
export class Dashboard extends BaseEntity {
  @Field()
  @ApiProperty({ description: 'Dashboard name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Dashboard description', required: false })
  description?: string;

  @Field(() => [DashboardWidget])
  @ApiProperty({ type: [DashboardWidget] })
  widgets!: DashboardWidget[];

  @Field()
  @ApiProperty({ description: 'Whether dashboard is public' })
  isPublic!: boolean;
}

@ObjectType()
export class DashboardWidget {
  @Field(() => ID)
  @ApiProperty({ description: 'Widget identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Widget title' })
  title!: string;

  @Field()
  @ApiProperty({ description: 'Widget type' })
  type!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Widget data', required: false })
  data?: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Widget position X' })
  x!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Widget position Y' })
  y!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Widget width' })
  width!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Widget height' })
  height!: number;
}

@ObjectType()
export class WidgetData {
  @Field(() => ID)
  @ApiProperty({ description: 'Widget identifier' })
  widgetId!: string;

  @Field()
  @ApiProperty({ description: 'Data as JSON string' })
  data!: string;

  @Field()
  @ApiProperty({ description: 'Last updated timestamp' })
  updatedAt!: Date;

  @Field()
  @ApiProperty({ description: 'Whether data is from cache' })
  fromCache!: boolean;
}

@ObjectType()
export class DataCube {
  @Field(() => ID)
  @ApiProperty({ description: 'Cube identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Cube name' })
  name!: string;

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  dimensions!: string[];

  @Field(() => [String])
  @ApiProperty({ type: [String] })
  measures!: string[];

  @Field()
  @ApiProperty({ description: 'Cube data as JSON' })
  data!: string;
}

@ObjectType()
export class Forecast {
  @Field(() => ID)
  @ApiProperty({ description: 'Forecast identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Metric name' })
  metricName!: string;

  @Field(() => [ForecastDataPoint])
  @ApiProperty({ type: [ForecastDataPoint] })
  predictions!: ForecastDataPoint[];

  @Field(() => Float)
  @ApiProperty({ description: 'Confidence level' })
  confidence!: number;

  @Field()
  @ApiProperty({ description: 'Model used' })
  model!: string;
}

@ObjectType()
export class ForecastDataPoint {
  @Field()
  @ApiProperty({ description: 'Timestamp' })
  timestamp!: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Predicted value' })
  value!: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Lower bound', required: false })
  lowerBound?: number;

  @Field(() => Float, { nullable: true })
  @ApiProperty({ description: 'Upper bound', required: false })
  upperBound?: number;
}

@ObjectType()
export class Anomaly {
  @Field(() => ID)
  @ApiProperty({ description: 'Anomaly identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Metric name' })
  metricName!: string;

  @Field()
  @ApiProperty({ description: 'Timestamp' })
  timestamp!: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Actual value' })
  actualValue!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Expected value' })
  expectedValue!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Deviation score' })
  deviationScore!: number;

  @Field()
  @ApiProperty({ description: 'Severity level' })
  severity!: string;
}
