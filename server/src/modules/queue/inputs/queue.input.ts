import { InputType, Field, Int, Float, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsUUID, IsDateString, Min, Max, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QueueType, ProcessorType, JobPriority, JobStatus, QueueStatus } from '../types/queue.types';

// Base Input Types
@InputType()
export class PaginationInput {
  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  page: number = 1;

  @Field(() => Int, { defaultValue: 20 })
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

@InputType()
export class SortInput {
  @Field(() => String)
  @IsString()
  field: string;

  @Field(() => String, { defaultValue: 'ASC' })
  @IsString()
  direction: 'ASC' | 'DESC' = 'ASC';
}

@InputType()
export class DateRangeInput {
  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  from?: Date;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  to?: Date;
}

// Job Creation Inputs
@InputType()
export class JobOptionsInput {
  @Field(() => JobPriority, { defaultValue: JobPriority.NORMAL })
  @IsOptional()
  @IsEnum(JobPriority)
  priority?: JobPriority = JobPriority.NORMAL;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  delay?: number;

  @Field(() => Int, { defaultValue: 3 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  attempts?: number = 3;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  timeout?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  correlationId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  metadata?: any;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  removeOnComplete?: boolean = false;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  removeOnFail?: boolean = false;
}

@InputType()
export class RepeatOptionsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cron?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  every?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  tz?: string;
}

@InputType()
export class CreateJobInput {
  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => QueueType)
  @IsEnum(QueueType)
  queueType: QueueType;

  @Field(() => ProcessorType)
  @IsEnum(ProcessorType)
  processorType: ProcessorType;

  @Field(() => GraphQLJSON)
  data: any;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;

  @Field(() => RepeatOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => RepeatOptionsInput)
  repeat?: RepeatOptionsInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

@InputType()
export class BulkCreateJobInput {
  @Field(() => [CreateJobInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJobInput)
  jobs: CreateJobInput[];

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  defaultOptions?: JobOptionsInput;
}

// Email Job Inputs
@InputType()
export class EmailJobDataInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @Field(() => String)
  @IsString()
  subject: string;

  @Field(() => String)
  @IsString()
  template: string;

  @Field(() => GraphQLJSON)
  data: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  from?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[];

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isHtml?: boolean = false;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

@InputType()
export class CreateEmailJobInput {
  @Field(() => EmailJobDataInput)
  @ValidateNested()
  @Type(() => EmailJobDataInput)
  emailData: EmailJobDataInput;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;
}

// Report Job Inputs
@InputType()
export class ReportJobDataInput {
  @Field(() => String)
  @IsString()
  reportType: string;

  @Field(() => GraphQLJSON)
  parameters: any;

  @Field(() => String)
  @IsUUID()
  userId: string;

  @Field(() => String)
  @IsUUID()
  tenantId: string;

  @Field(() => String, { defaultValue: 'pdf' })
  @IsOptional()
  @IsString()
  format?: 'pdf' | 'excel' | 'csv' = 'pdf';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  deliveryMethod?: 'email' | 'download' | 'storage';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  deliveryTarget?: string;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean = false;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  scheduledFor?: Date;
}

@InputType()
export class CreateReportJobInput {
  @Field(() => ReportJobDataInput)
  @ValidateNested()
  @Type(() => ReportJobDataInput)
  reportData: ReportJobDataInput;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;
}

// Sync Job Inputs
@InputType()
export class SyncJobDataInput {
  @Field(() => String)
  @IsString()
  syncType: 'inventory' | 'customers' | 'transactions' | 'full' | 'incremental';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  sourceLocationId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  targetLocationId?: string;

  @Field(() => String)
  @IsUUID()
  tenantId: string;

  @Field(() => String)
  @IsUUID()
  userId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filters?: any;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean = false;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  validateIntegrity?: boolean = true;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  conflictResolution?: 'source' | 'target' | 'merge' | 'manual';
}

@InputType()
export class CreateSyncJobInput {
  @Field(() => SyncJobDataInput)
  @ValidateNested()
  @Type(() => SyncJobDataInput)
  syncData: SyncJobDataInput;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;
}

// Notification Job Inputs
@InputType()
export class NotificationJobDataInput {
  @Field(() => String)
  @IsString()
  type: 'push' | 'sms' | 'email' | 'in-app' | 'slack' | 'teams';

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @Field(() => String)
  @IsString()
  title: string;

  @Field(() => String)
  @IsString()
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  data?: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  priority?: 'low' | 'normal' | 'high' | 'urgent';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  requiresAcknowledgment?: boolean = false;
}

@InputType()
export class CreateNotificationJobInput {
  @Field(() => NotificationJobDataInput)
  @ValidateNested()
  @Type(() => NotificationJobDataInput)
  notificationData: NotificationJobDataInput;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;
}

// Analytics Job Inputs
@InputType()
export class AnalyticsJobDataInput {
  @Field(() => String)
  @IsString()
  eventType: string;

  @Field(() => GraphQLJSON)
  event: any;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDateString()
  timestamp?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  context?: any;

  @Field(() => Boolean, { defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isRealtime?: boolean = false;
}

@InputType()
export class CreateAnalyticsJobInput {
  @Field(() => AnalyticsJobDataInput)
  @ValidateNested()
  @Type(() => AnalyticsJobDataInput)
  analyticsData: AnalyticsJobDataInput;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;
}

// Job Query Inputs
@InputType()
export class JobFilterInput {
  @Field(() => [JobStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(JobStatus, { each: true })
  statuses?: JobStatus[];

  @Field(() => [QueueType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QueueType, { each: true })
  queueTypes?: QueueType[];

  @Field(() => [ProcessorType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ProcessorType, { each: true })
  processorTypes?: ProcessorType[];

  @Field(() => [JobPriority], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(JobPriority, { each: true })
  priorities?: JobPriority[];

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeInput)
  createdAt?: DateRangeInput;

  @Field(() => DateRangeInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeInput)
  completedAt?: DateRangeInput;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  correlationId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasErrors?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isRepeatable?: boolean;
}

@InputType()
export class GetJobsInput {
  @Field(() => JobFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobFilterInput)
  filter?: JobFilterInput;

  @Field(() => PaginationInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationInput)
  pagination?: PaginationInput;

  @Field(() => [SortInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInput)
  sort?: SortInput[];
}

// Queue Management Inputs
@InputType()
export class QueueFilterInput {
  @Field(() => [QueueType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QueueType, { each: true })
  types?: QueueType[];

  @Field(() => [QueueStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QueueStatus, { each: true })
  statuses?: QueueStatus[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isHealthy?: boolean;
}

@InputType()
export class GetQueuesInput {
  @Field(() => QueueFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => QueueFilterInput)
  filter?: QueueFilterInput;

  @Field(() => PaginationInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationInput)
  pagination?: PaginationInput;

  @Field(() => [SortInput], { nullable: true })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortInput)
  sort?: SortInput[];
}

// Job Operation Inputs
@InputType()
export class RetryJobInput {
  @Field(() => ID)
  @IsString()
  jobId: string;

  @Field(() => QueueType)
  @IsEnum(QueueType)
  queueType: QueueType;

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  newOptions?: JobOptionsInput;
}

@InputType()
export class BulkJobOperationInput {
  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  jobIds: string[];

  @Field(() => QueueType)
  @IsEnum(QueueType)
  queueType: QueueType;

  @Field(() => String)
  @IsString()
  operation: 'retry' | 'cancel' | 'remove' | 'promote';

  @Field(() => JobOptionsInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => JobOptionsInput)
  options?: JobOptionsInput;
}

@InputType()
export class UpdateJobProgressInput {
  @Field(() => ID)
  @IsString()
  jobId: string;

  @Field(() => QueueType)
  @IsEnum(QueueType)
  queueType: QueueType;

  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  message?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  data?: any;
}

// Queue Operation Inputs
@InputType()
export class QueueOperationInput {
  @Field(() => QueueType)
  @IsEnum(QueueType)
  queueType: QueueType;

  @Field(() => String)
  @IsString()
  operation: 'pause' | 'resume' | 'clean' | 'drain' | 'obliterate';

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  options?: any;
}

@InputType()
export class CleanQueueInput {
  @Field(() => QueueType)
  @IsEnum(QueueType)
  queueType: QueueType;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  grace?: number = 0;

  @Field(() => String, { defaultValue: 'completed' })
  @IsOptional()
  @IsString()
  status?: 'completed' | 'failed' | 'active' | 'waiting' | 'delayed' = 'completed';

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

// Analytics Inputs
@InputType()
export class QueueAnalyticsInput {
  @Field(() => [QueueType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QueueType, { each: true })
  queueTypes?: QueueType[];

  @Field(() => DateRangeInput)
  @ValidateNested()
  @Type(() => DateRangeInput)
  dateRange: DateRangeInput;

  @Field(() => String, { defaultValue: 'hour' })
  @IsOptional()
  @IsString()
  granularity?: 'minute' | 'hour' | 'day' | 'week' | 'month' = 'hour';

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];
}

// Subscription Inputs
@InputType()
export class JobSubscriptionInput {
  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobIds?: string[];

  @Field(() => [QueueType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QueueType, { each: true })
  queueTypes?: QueueType[];

  @Field(() => [JobStatus], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(JobStatus, { each: true })
  statuses?: JobStatus[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;
}

@InputType()
export class QueueSubscriptionInput {
  @Field(() => [QueueType], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsEnum(QueueType, { each: true })
  queueTypes?: QueueType[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}