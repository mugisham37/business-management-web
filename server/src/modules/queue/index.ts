// Main Module
export { QueueModule } from './queue.module';

// Core Services
export { QueueService } from './queue.service';
export { QueueManagementService } from './services/queue-management.service';
export { JobManagementService } from './services/job-management.service';
export { QueueAnalyticsService } from './services/queue-analytics.service';

// Processors
export { EmailProcessor } from './processors/email.processor';
export { ReportProcessor } from './processors/report.processor';
export { SyncProcessor } from './processors/sync.processor';
export { NotificationProcessor } from './processors/notification.processor';
export { AnalyticsProcessor } from './processors/analytics.processor';

// GraphQL Resolvers
export { QueueResolver } from './resolvers/queue.resolver';
export { JobResolver } from './resolvers/job.resolver';
export { QueueFieldResolver } from './resolvers/queue-field.resolver';
export { JobFieldResolver } from './resolvers/job-field.resolver';

// DataLoaders and Context
export { QueueDataLoader } from './dataloaders/queue.dataloader';
export { QueueContextProvider } from './providers/queue-context.provider';

// Guards
export {
  QueuePermissionGuard,
  QueueTenantGuard,
  QueueRateLimitGuard,
  QueueValidationGuard,
  QueueHealthGuard,
  QueueMaintenanceGuard
} from './guards/queue.guards';

// Interceptors
export {
  QueueAuditInterceptor,
  QueueCacheInterceptor,
  QueueMonitoringInterceptor,
  QueueRetryInterceptor,
  QueueTimeoutInterceptor,
  QueueTransformInterceptor
} from './interceptors/queue.interceptors';

// Plugins and Filters
export { QueueComplexityPlugin } from './plugins/queue-complexity.plugin';
export { SubscriptionFilter } from './filters/subscription.filter';

// Types
export * from './types/queue.types';

// Inputs
export * from './inputs/queue.input';

// Decorators
export * from './decorators/queue.decorators';

// Re-export commonly used types for convenience
export type {
  QueueJob,
  QueueInfo,
  QueueStats,
  QueueAnalytics,
  JobProgress,
  JobAttempt,
  JobMetrics,
  PaginatedJobs,
  PaginatedQueues,
  JobOperationResponse,
  BulkJobOperationResponse,
  QueueOperationResponse,
  JobStatusUpdate,
  QueueHealthUpdate
} from './types/queue.types';

export {
  QueueType,
  JobStatus,
  JobPriority,
  ProcessorType,
  QueueStatus
} from './types/queue.types';

// Re-export commonly used inputs
export type {
  CreateJobInput,
  BulkCreateJobInput,
  CreateEmailJobInput,
  CreateReportJobInput,
  CreateSyncJobInput,
  CreateNotificationJobInput,
  CreateAnalyticsJobInput,
  GetJobsInput,
  GetQueuesInput,
  JobFilterInput,
  QueueFilterInput,
  QueueAnalyticsInput,
  JobSubscriptionInput,
  QueueSubscriptionInput
} from './inputs/queue.input';

// Re-export commonly used decorators
export {
  RequireQueueRead,
  RequireQueueWrite,
  RequireQueueManage,
  RequireQueueAdmin,
  RequireTenantIsolation,
  QueueRateLimitByUser,
  QueueRateLimitByTenant,
  CacheQueueStats,
  CacheJobList,
  AuditJobOperation,
  AuditQueueOperation,
  MonitorJobCreation,
  MonitorQueueHealth,
  SecureJobOperation,
  SecureQueueOperation,
  CurrentTenant,
  QueueContext,
  JobMetadata
} from './decorators/queue.decorators';