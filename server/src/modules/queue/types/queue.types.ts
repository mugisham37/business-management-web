import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

// Enums
export enum QueueStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  FAILED = 'failed',
  COMPLETED = 'completed',
  WAITING = 'waiting',
  DELAYED = 'delayed',
  STUCK = 'stuck',
}

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused',
  STUCK = 'stuck',
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
  URGENT = 20,
}

export enum QueueType {
  EMAIL = 'email',
  REPORTS = 'reports',
  SYNC = 'sync',
  NOTIFICATIONS = 'notifications',
  ANALYTICS = 'analytics',
  BACKUP = 'backup',
  INTEGRATION = 'integration',
  CLEANUP = 'cleanup',
}

export enum ProcessorType {
  EMAIL_SEND = 'send-email',
  EMAIL_BULK = 'send-bulk-email',
  REPORT_GENERATE = 'generate-report',
  REPORT_SCHEDULE = 'schedule-report',
  SYNC_DATA = 'sync-data',
  SYNC_INVENTORY = 'sync-inventory',
  SYNC_CUSTOMERS = 'sync-customers',
  SYNC_TRANSACTIONS = 'sync-transactions',
  NOTIFICATION_SEND = 'send-notification',
  NOTIFICATION_BULK = 'send-bulk-notification',
  ANALYTICS_PROCESS = 'process-analytics-event',
  ANALYTICS_AGGREGATE = 'aggregate-analytics',
  BACKUP_CREATE = 'create-backup',
  BACKUP_RESTORE = 'restore-backup',
  INTEGRATION_SYNC = 'integration-sync',
  CLEANUP_OLD_DATA = 'cleanup-old-data',
}

// Register enums for GraphQL
registerEnumType(QueueStatus, { name: 'QueueStatus' });
registerEnumType(JobStatus, { name: 'JobStatus' });
registerEnumType(JobPriority, { name: 'JobPriority' });
registerEnumType(QueueType, { name: 'QueueType' });
registerEnumType(ProcessorType, { name: 'ProcessorType' });

// Base Types
@ObjectType()
export class QueueStats {
  @Field(() => Int)
  waiting: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  completed: number;

  @Field(() => Int)
  failed: number;

  @Field(() => Int)
  delayed: number;

  @Field(() => Int)
  paused: number;

  @Field(() => Int)
  total: number;

  @Field(() => Float)
  throughput: number; // jobs per minute

  @Field(() => Float)
  averageProcessingTime: number; // in milliseconds

  @Field(() => Date)
  lastUpdated: Date;
}

@ObjectType()
export class JobProgress {
  @Field(() => Int)
  current: number;

  @Field(() => Int)
  total: number;

  @Field(() => Float)
  percentage: number;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class JobAttempt {
  @Field(() => Int)
  attemptNumber: number;

  @Field(() => Date)
  attemptedAt: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Int, { nullable: true })
  duration?: number; // in milliseconds
}

@ObjectType()
export class JobMetrics {
  @Field(() => Int)
  totalAttempts: number;

  @Field(() => Int)
  successfulAttempts: number;

  @Field(() => Int)
  failedAttempts: number;

  @Field(() => Float)
  successRate: number;

  @Field(() => Float)
  averageDuration: number;

  @Field(() => Float)
  minDuration: number;

  @Field(() => Float)
  maxDuration: number;

  @Field(() => Date)
  firstAttempt: Date;

  @Field(() => Date, { nullable: true })
  lastAttempt?: Date;
}

// Main Job Type
@ObjectType()
export class QueueJob {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => QueueType)
  queueType: QueueType;

  @Field(() => ProcessorType)
  processorType: ProcessorType;

  @Field(() => JobStatus)
  status: JobStatus;

  @Field(() => JobPriority)
  priority: JobPriority;

  @Field(() => GraphQLJSON)
  data: any;

  @Field(() => GraphQLJSON, { nullable: true })
  result?: any;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => JobProgress, { nullable: true })
  progress?: JobProgress;

  @Field(() => [JobAttempt])
  attempts: JobAttempt[];

  @Field(() => JobMetrics)
  metrics: JobMetrics;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  startedAt?: Date;

  @Field(() => Date, { nullable: true })
  completedAt?: Date;

  @Field(() => Date, { nullable: true })
  failedAt?: Date;

  @Field(() => Date, { nullable: true })
  delayedUntil?: Date;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  correlationId?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => Int, { nullable: true })
  timeout?: number;

  @Field(() => Int, { nullable: true })
  delay?: number;

  @Field(() => Boolean)
  isRepeatable: boolean;

  @Field(() => String, { nullable: true })
  repeatPattern?: string;

  @Field(() => Date, { nullable: true })
  nextRunAt?: Date;
}

// Queue Information Type
@ObjectType()
export class QueueInfo {
  @Field(() => String)
  name: string;

  @Field(() => QueueType)
  type: QueueType;

  @Field(() => QueueStatus)
  status: QueueStatus;

  @Field(() => QueueStats)
  stats: QueueStats;

  @Field(() => [String])
  availableProcessors: string[];

  @Field(() => GraphQLJSON)
  configuration: any;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  lastActivity: Date;

  @Field(() => Boolean)
  isHealthy: boolean;

  @Field(() => String, { nullable: true })
  healthMessage?: string;
}

// Paginated Results
@ObjectType()
export class PaginatedJobs {
  @Field(() => [QueueJob])
  jobs: QueueJob[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNext: boolean;

  @Field(() => Boolean)
  hasPrevious: boolean;
}

@ObjectType()
export class PaginatedQueues {
  @Field(() => [QueueInfo])
  queues: QueueInfo[];

  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Boolean)
  hasNext: boolean;

  @Field(() => Boolean)
  hasPrevious: boolean;
}

// Response Types
@ObjectType()
export class JobOperationResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => QueueJob, { nullable: true })
  job?: QueueJob;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class BulkJobOperationResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => [QueueJob])
  jobs: QueueJob[];

  @Field(() => Int)
  totalProcessed: number;

  @Field(() => Int)
  successCount: number;

  @Field(() => Int)
  failureCount: number;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

@ObjectType()
export class QueueOperationResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => QueueInfo, { nullable: true })
  queue?: QueueInfo;

  @Field(() => [String], { nullable: true })
  errors?: string[];
}

// Subscription Types
@ObjectType()
export class JobStatusUpdate {
  @Field(() => ID)
  jobId: string;

  @Field(() => QueueType)
  queueType: QueueType;

  @Field(() => JobStatus)
  oldStatus: JobStatus;

  @Field(() => JobStatus)
  newStatus: JobStatus;

  @Field(() => JobProgress, { nullable: true })
  progress?: JobProgress;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => String, { nullable: true })
  tenantId?: string;

  @Field(() => String, { nullable: true })
  userId?: string;
}

@ObjectType()
export class QueueHealthUpdate {
  @Field(() => String)
  queueName: string;

  @Field(() => QueueType)
  queueType: QueueType;

  @Field(() => QueueStatus)
  status: QueueStatus;

  @Field(() => QueueStats)
  stats: QueueStats;

  @Field(() => Boolean)
  isHealthy: boolean;

  @Field(() => String, { nullable: true })
  healthMessage?: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => String, { nullable: true })
  tenantId?: string;
}

// Analytics Types
@ObjectType()
export class QueueAnalytics {
  @Field(() => String)
  queueName: string;

  @Field(() => QueueType)
  queueType: QueueType;

  @Field(() => Int)
  totalJobsProcessed: number;

  @Field(() => Float)
  averageProcessingTime: number;

  @Field(() => Float)
  successRate: number;

  @Field(() => Float)
  throughputPerHour: number;

  @Field(() => Int)
  peakConcurrency: number;

  @Field(() => [QueueHourlyStats])
  hourlyStats: QueueHourlyStats[];

  @Field(() => Date)
  periodStart: Date;

  @Field(() => Date)
  periodEnd: Date;
}

@ObjectType()
export class QueueHourlyStats {
  @Field(() => Date)
  hour: Date;

  @Field(() => Int)
  jobsProcessed: number;

  @Field(() => Int)
  jobsSucceeded: number;

  @Field(() => Int)
  jobsFailed: number;

  @Field(() => Float)
  averageProcessingTime: number;

  @Field(() => Int)
  peakConcurrency: number;
}

// Error Types
@ObjectType()
export class QueueError {
  @Field(() => String)
  code: string;

  @Field(() => String)
  message: string;

  @Field(() => String, { nullable: true })
  details?: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => String, { nullable: true })
  jobId?: string;

  @Field(() => String, { nullable: true })
  queueName?: string;
}