import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { QueueType, JobPriority, ProcessorType } from '../types/queue.types';

// Metadata Keys
export const QUEUE_PERMISSION_KEY = 'queue:permission';
export const QUEUE_TENANT_KEY = 'queue:tenant';
export const QUEUE_RATE_LIMIT_KEY = 'queue:rateLimit';
export const QUEUE_AUDIT_KEY = 'queue:audit';
export const QUEUE_CACHE_KEY = 'queue:cache';
export const QUEUE_VALIDATION_KEY = 'queue:validation';
export const QUEUE_MONITORING_KEY = 'queue:monitoring';
export const QUEUE_RETRY_KEY = 'queue:retry';

// Permission Decorators
export const RequireQueuePermission = (permission: string) =>
  SetMetadata(QUEUE_PERMISSION_KEY, permission);

export const RequireQueueAdmin = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:admin');

export const RequireQueueRead = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:read');

export const RequireQueueWrite = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:write');

export const RequireQueueManage = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:manage');

// Queue Type Specific Permissions
export const RequireEmailQueueAccess = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:email:access');

export const RequireReportQueueAccess = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:reports:access');

export const RequireSyncQueueAccess = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:sync:access');

export const RequireNotificationQueueAccess = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:notifications:access');

export const RequireAnalyticsQueueAccess = () =>
  SetMetadata(QUEUE_PERMISSION_KEY, 'queue:analytics:access');

// Tenant Isolation Decorators
export const RequireTenantIsolation = () =>
  SetMetadata(QUEUE_TENANT_KEY, true);

export const AllowCrossTenant = () =>
  SetMetadata(QUEUE_TENANT_KEY, false);

// Rate Limiting Decorators
export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: string; // 'ip' | 'user' | 'tenant' | 'custom'
}

export const QueueRateLimit = (options: RateLimitOptions) =>
  SetMetadata(QUEUE_RATE_LIMIT_KEY, options);

export const QueueRateLimitByUser = (maxRequests: number, windowMs: number = 60000) =>
  SetMetadata(QUEUE_RATE_LIMIT_KEY, {
    maxRequests,
    windowMs,
    keyGenerator: 'user',
  });

export const QueueRateLimitByTenant = (maxRequests: number, windowMs: number = 60000) =>
  SetMetadata(QUEUE_RATE_LIMIT_KEY, {
    maxRequests,
    windowMs,
    keyGenerator: 'tenant',
  });

export const QueueRateLimitByIP = (maxRequests: number, windowMs: number = 60000) =>
  SetMetadata(QUEUE_RATE_LIMIT_KEY, {
    maxRequests,
    windowMs,
    keyGenerator: 'ip',
  });

// Audit Decorators
export interface AuditOptions {
  action: string;
  resource: string;
  includeRequest?: boolean;
  includeResponse?: boolean;
  sensitiveFields?: string[];
}

export const QueueAudit = (options: AuditOptions) =>
  SetMetadata(QUEUE_AUDIT_KEY, options);

export const AuditJobCreation = () =>
  SetMetadata(QUEUE_AUDIT_KEY, {
    action: 'create',
    resource: 'job',
    includeRequest: true,
    includeResponse: true,
    sensitiveFields: ['data.password', 'data.token', 'data.secret'],
  });

export const AuditJobOperation = (operation: string) =>
  SetMetadata(QUEUE_AUDIT_KEY, {
    action: operation,
    resource: 'job',
    includeRequest: true,
    includeResponse: true,
  });

export const AuditQueueOperation = (operation: string) =>
  SetMetadata(QUEUE_AUDIT_KEY, {
    action: operation,
    resource: 'queue',
    includeRequest: true,
    includeResponse: true,
  });

// Cache Decorators
export interface CacheOptions {
  ttl: number; // Time to live in seconds
  key?: string; // Custom cache key
  condition?: string; // Condition for caching
  tags?: string[]; // Cache tags for invalidation
}

export const QueueCache = (options: CacheOptions) =>
  SetMetadata(QUEUE_CACHE_KEY, options);

export const CacheQueueStats = (ttl: number = 30) =>
  SetMetadata(QUEUE_CACHE_KEY, {
    ttl,
    key: 'queue:stats',
    tags: ['queue', 'stats'],
  });

export const CacheJobList = (ttl: number = 60) =>
  SetMetadata(QUEUE_CACHE_KEY, {
    ttl,
    key: 'queue:jobs',
    tags: ['queue', 'jobs'],
  });

// Validation Decorators
export interface ValidationOptions {
  validateTenant?: boolean;
  validateUser?: boolean;
  validatePermissions?: boolean;
  customValidators?: string[];
}

export const QueueValidation = (options: ValidationOptions) =>
  SetMetadata(QUEUE_VALIDATION_KEY, options);

export const ValidateJobData = () =>
  SetMetadata(QUEUE_VALIDATION_KEY, {
    validateTenant: true,
    validateUser: true,
    customValidators: ['jobDataValidator'],
  });

export const ValidateQueueAccess = () =>
  SetMetadata(QUEUE_VALIDATION_KEY, {
    validateTenant: true,
    validateUser: true,
    validatePermissions: true,
  });

// Monitoring Decorators
export interface MonitoringOptions {
  trackPerformance?: boolean;
  trackErrors?: boolean;
  trackUsage?: boolean;
  alertOnFailure?: boolean;
  alertThreshold?: number;
}

export const QueueMonitoring = (options: MonitoringOptions) =>
  SetMetadata(QUEUE_MONITORING_KEY, options);

export const MonitorJobCreation = () =>
  SetMetadata(QUEUE_MONITORING_KEY, {
    trackPerformance: true,
    trackUsage: true,
    alertOnFailure: true,
    alertThreshold: 5, // Alert after 5 failures
  });

export const MonitorQueueHealth = () =>
  SetMetadata(QUEUE_MONITORING_KEY, {
    trackPerformance: true,
    trackErrors: true,
    alertOnFailure: true,
    alertThreshold: 10,
  });

// Retry Decorators
export interface RetryOptions {
  maxAttempts: number;
  backoffStrategy: 'fixed' | 'exponential' | 'linear';
  baseDelay: number;
  maxDelay?: number;
  retryCondition?: string;
}

export const QueueRetry = (options: RetryOptions) =>
  SetMetadata(QUEUE_RETRY_KEY, options);

export const RetryOnFailure = (maxAttempts: number = 3, baseDelay: number = 1000) =>
  SetMetadata(QUEUE_RETRY_KEY, {
    maxAttempts,
    backoffStrategy: 'exponential',
    baseDelay,
    maxDelay: 30000,
  });

// Parameter Decorators
export const CurrentQueueUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.user;
  },
);

export const CurrentTenant = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.tenant || request.user?.tenantId;
  },
);

export const QueueContext = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    
    const queueContext = {
      user: request.user,
      tenant: request.tenant || request.user?.tenantId,
      ip: request.ip,
      userAgent: request.get('User-Agent'),
      correlationId: request.get('X-Correlation-ID') || request.correlationId,
      timestamp: new Date(),
    };

    return data ? queueContext[data] : queueContext;
  },
);

export const JobMetadata = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const args = ctx.getArgs();
    const request = ctx.getContext().req;
    
    return {
      createdBy: request.user?.id,
      tenantId: request.tenant || request.user?.tenantId,
      correlationId: request.get('X-Correlation-ID') || request.correlationId,
      source: 'graphql',
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      timestamp: new Date(),
      ...args.metadata,
    };
  },
);

// Queue Type Decorators
export const EmailQueue = () =>
  SetMetadata('queueType', QueueType.EMAIL);

export const ReportQueue = () =>
  SetMetadata('queueType', QueueType.REPORTS);

export const SyncQueue = () =>
  SetMetadata('queueType', QueueType.SYNC);

export const NotificationQueue = () =>
  SetMetadata('queueType', QueueType.NOTIFICATIONS);

export const AnalyticsQueue = () =>
  SetMetadata('queueType', QueueType.ANALYTICS);

// Priority Decorators
export const LowPriority = () =>
  SetMetadata('jobPriority', JobPriority.LOW);

export const NormalPriority = () =>
  SetMetadata('jobPriority', JobPriority.NORMAL);

export const HighPriority = () =>
  SetMetadata('jobPriority', JobPriority.HIGH);

export const CriticalPriority = () =>
  SetMetadata('jobPriority', JobPriority.CRITICAL);

export const UrgentPriority = () =>
  SetMetadata('jobPriority', JobPriority.URGENT);

// Processor Type Decorators
export const EmailProcessor = () =>
  SetMetadata('processorType', ProcessorType.EMAIL_SEND);

export const ReportProcessor = () =>
  SetMetadata('processorType', ProcessorType.REPORT_GENERATE);

export const SyncProcessor = () =>
  SetMetadata('processorType', ProcessorType.SYNC_DATA);

export const NotificationProcessor = () =>
  SetMetadata('processorType', ProcessorType.NOTIFICATION_SEND);

export const AnalyticsProcessor = () =>
  SetMetadata('processorType', ProcessorType.ANALYTICS_PROCESS);

// Composite Decorators
export const SecureQueueOperation = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  RequireQueueWrite()(target, propertyKey, descriptor);
  RequireTenantIsolation()(target, propertyKey, descriptor);
  QueueAudit({ action: propertyKey, resource: 'queue' })(target, propertyKey, descriptor);
  QueueMonitoring({ trackPerformance: true, trackErrors: true })(target, propertyKey, descriptor);
};

export const SecureJobOperation = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  RequireQueueWrite()(target, propertyKey, descriptor);
  RequireTenantIsolation()(target, propertyKey, descriptor);
  AuditJobOperation(propertyKey)(target, propertyKey, descriptor);
  MonitorJobCreation()(target, propertyKey, descriptor);
  RetryOnFailure()(target, propertyKey, descriptor);
};

export const AdminQueueOperation = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  RequireQueueAdmin()(target, propertyKey, descriptor);
  QueueAudit({ action: propertyKey, resource: 'queue', includeRequest: true, includeResponse: true })(target, propertyKey, descriptor);
  QueueMonitoring({ trackPerformance: true, trackErrors: true, alertOnFailure: true })(target, propertyKey, descriptor);
};

export const ReadOnlyQueueOperation = () => (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  RequireQueueRead()(target, propertyKey, descriptor);
  CacheQueueStats()(target, propertyKey, descriptor);
  QueueMonitoring({ trackUsage: true })(target, propertyKey, descriptor);
};

// Method Decorators for specific queue operations
export const BulkOperation = (maxBatchSize: number = 100) =>
  SetMetadata('bulkOperation', { maxBatchSize });

export const AsyncOperation = (timeout: number = 300000) =>
  SetMetadata('asyncOperation', { timeout });

export const ScheduledOperation = () =>
  SetMetadata('scheduledOperation', true);

export const RealtimeOperation = () =>
  SetMetadata('realtimeOperation', true);

// Error Handling Decorators
export const QueueErrorHandler = (errorType: string) =>
  SetMetadata('errorHandler', errorType);

export const IgnoreErrors = (errorCodes: string[]) =>
  SetMetadata('ignoreErrors', errorCodes);

export const TransformErrors = (transformer: string) =>
  SetMetadata('errorTransformer', transformer);

// Performance Decorators
export const OptimizeForThroughput = () =>
  SetMetadata('optimization', 'throughput');

export const OptimizeForLatency = () =>
  SetMetadata('optimization', 'latency');

export const OptimizeForMemory = () =>
  SetMetadata('optimization', 'memory');

// Integration Decorators
export const IntegrateWithModule = (moduleName: string) =>
  SetMetadata('integration', moduleName);

export const NotifyOnCompletion = (channels: string[]) =>
  SetMetadata('notifyOnCompletion', channels);

export const TriggerWebhook = (webhookUrl: string) =>
  SetMetadata('webhook', webhookUrl);

// Custom Validation Decorators
export const ValidateJobPayload = (schema: string) =>
  SetMetadata('payloadValidation', schema);

export const SanitizeJobData = (sanitizers: string[]) =>
  SetMetadata('dataSanitization', sanitizers);

export const EncryptSensitiveData = (fields: string[]) =>
  SetMetadata('dataEncryption', fields);