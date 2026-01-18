import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Metadata keys
export const COMMUNICATION_CHANNEL_KEY = 'communication_channel';
export const NOTIFICATION_PRIORITY_KEY = 'notification_priority';
export const ALERT_SEVERITY_KEY = 'alert_severity';
export const COMMUNICATION_TEMPLATE_KEY = 'communication_template';
export const RATE_LIMIT_KEY = 'rate_limit';
export const DELIVERY_TRACKING_KEY = 'delivery_tracking';

// Channel requirement decorator
export const RequireChannel = (channels: string | string[]) => 
  SetMetadata(COMMUNICATION_CHANNEL_KEY, Array.isArray(channels) ? channels : [channels]);

// Priority requirement decorator
export const RequirePriority = (minPriority: 'low' | 'medium' | 'high' | 'urgent') => 
  SetMetadata(NOTIFICATION_PRIORITY_KEY, minPriority);

// Alert severity decorator
export const RequireAlertSeverity = (minSeverity: 'info' | 'warning' | 'error' | 'critical') => 
  SetMetadata(ALERT_SEVERITY_KEY, minSeverity);

// Template requirement decorator
export const RequireTemplate = (templateName: string) => 
  SetMetadata(COMMUNICATION_TEMPLATE_KEY, templateName);

// Rate limiting decorator
export const RateLimit = (maxRequests: number, windowMs: number) => 
  SetMetadata(RATE_LIMIT_KEY, { maxRequests, windowMs });

// Delivery tracking decorator
export const TrackDelivery = (enabled: boolean = true) => 
  SetMetadata(DELIVERY_TRACKING_KEY, enabled);

// Parameter decorators for extracting communication context
export const CurrentChannel = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.communicationChannel;
  },
);

export const CurrentNotification = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.currentNotification;
  },
);

export const DeliveryContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      tenantId: request.user?.tenantId,
      userId: request.user?.id,
      requestId: request.id,
      timestamp: new Date(),
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  },
);

// Notification metadata decorator
export const NotificationMetadata = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const metadata = request.notificationMetadata || {};
    
    return data ? metadata[data] : metadata;
  },
);

// Communication preferences decorator
export const CommunicationPreferences = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return request.communicationPreferences;
  },
);

// Bulk operation context decorator
export const BulkOperationContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      batchId: request.batchId || `batch_${Date.now()}`,
      operationType: request.operationType,
      totalItems: request.totalItems,
      currentBatch: request.currentBatch,
      batchSize: request.batchSize,
    };
  },
);

// Template context decorator
export const TemplateContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      templateName: request.templateName,
      templateVariables: request.templateVariables || {},
      templateCategory: request.templateCategory,
      renderingEngine: request.renderingEngine || 'handlebars',
    };
  },
);

// Provider context decorator
export const ProviderContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      preferredProvider: request.preferredProvider,
      fallbackProviders: request.fallbackProviders || [],
      providerConfig: request.providerConfig,
      retryPolicy: request.retryPolicy,
    };
  },
);

// Analytics context decorator
export const AnalyticsContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      trackingId: request.trackingId || `track_${Date.now()}`,
      sessionId: request.sessionId,
      campaignId: request.campaignId,
      source: request.source || 'api',
      medium: request.medium || 'graphql',
      tags: request.tags || [],
    };
  },
);

// Scheduling context decorator
export const SchedulingContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      scheduledAt: request.scheduledAt,
      timezone: request.timezone || 'UTC',
      recurringPattern: request.recurringPattern,
      expiresAt: request.expiresAt,
      priority: request.schedulingPriority || 'normal',
    };
  },
);

// Compliance context decorator
export const ComplianceContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      consentRequired: request.consentRequired || false,
      consentStatus: request.consentStatus,
      dataRetentionPeriod: request.dataRetentionPeriod,
      encryptionRequired: request.encryptionRequired || false,
      auditTrail: request.auditTrail || true,
      gdprCompliant: request.gdprCompliant || false,
    };
  },
);

// Multi-tenant context decorator
export const MultiTenantContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      tenantId: request.user?.tenantId,
      organizationId: request.user?.organizationId,
      tenantSettings: request.tenantSettings,
      quotaLimits: request.quotaLimits,
      billingPlan: request.billingPlan,
      featureFlags: request.featureFlags || {},
    };
  },
);

// Error handling context decorator
export const ErrorContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      errorHandlingStrategy: request.errorHandlingStrategy || 'fail-fast',
      retryPolicy: request.retryPolicy || { maxAttempts: 3, backoffMs: 1000 },
      fallbackChannels: request.fallbackChannels || [],
      alertOnFailure: request.alertOnFailure || false,
      escalationPolicy: request.escalationPolicy,
    };
  },
);

// Performance monitoring decorator
export const PerformanceContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      startTime: request.startTime || Date.now(),
      timeoutMs: request.timeoutMs || 30000,
      enableMetrics: request.enableMetrics !== false,
      traceId: request.traceId || `trace_${Date.now()}`,
      spanId: request.spanId || `span_${Date.now()}`,
      samplingRate: request.samplingRate || 0.1,
    };
  },
);

// Security context decorator
export const SecurityContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      requiresEncryption: request.requiresEncryption || false,
      encryptionAlgorithm: request.encryptionAlgorithm || 'AES-256-GCM',
      requiresSignature: request.requiresSignature || false,
      signatureAlgorithm: request.signatureAlgorithm || 'HMAC-SHA256',
      accessLevel: request.accessLevel || 'standard',
      dataClassification: request.dataClassification || 'internal',
    };
  },
);

// Integration context decorator
export const IntegrationContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      integrationId: request.integrationId,
      integrationType: request.integrationType,
      integrationVersion: request.integrationVersion || '1.0.0',
      webhookUrl: request.webhookUrl,
      apiVersion: request.apiVersion || 'v1',
      customHeaders: request.customHeaders || {},
    };
  },
);

// Localization context decorator
export const LocalizationContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      locale: request.locale || 'en-US',
      timezone: request.timezone || 'UTC',
      currency: request.currency || 'USD',
      dateFormat: request.dateFormat || 'YYYY-MM-DD',
      timeFormat: request.timeFormat || '24h',
      numberFormat: request.numberFormat || 'en-US',
    };
  },
);

// Workflow context decorator
export const WorkflowContext = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      workflowId: request.workflowId,
      stepId: request.stepId,
      workflowType: request.workflowType,
      triggerEvent: request.triggerEvent,
      previousStepResult: request.previousStepResult,
      workflowVariables: request.workflowVariables || {},
    };
  },
);