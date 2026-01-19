import { Injectable } from '@nestjs/common';
import { 
  QueueHealthUpdate, 
  JobStatusUpdate, 
  QueueType, 
  JobStatus 
} from '../types/queue.types';
import { 
  QueueSubscriptionInput, 
  JobSubscriptionInput 
} from '../inputs/queue.input';
import { CustomLoggerService } from '../../logger/logger.service';

@Injectable()
export class SubscriptionFilter {
  constructor(private readonly logger: CustomLoggerService) {
    this.logger.setContext('SubscriptionFilter');
  }

  filterQueueHealthUpdate(
    payload: { queueHealthUpdated: QueueHealthUpdate },
    variables: { input?: QueueSubscriptionInput },
    context: any
  ): boolean {
    try {
      const update = payload.queueHealthUpdated;
      const input = variables.input;

      // Tenant isolation - always enforce
      if (context.req?.user?.tenantId && update.tenantId !== context.req.user.tenantId) {
        return false;
      }

      // If no input filters, allow all (subject to tenant isolation)
      if (!input) {
        return true;
      }

      // Queue type filter
      if (input.queueTypes && input.queueTypes.length > 0) {
        if (!input.queueTypes.includes(update.queueType)) {
          return false;
        }
      }

      // Tenant filter (additional check)
      if (input.tenantId && update.tenantId !== input.tenantId) {
        return false;
      }

      this.logger.debug('Queue health update filter passed', {
        queueType: update.queueType,
        tenantId: update.tenantId,
        userId: context.req?.user?.id,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to filter queue health update', error instanceof Error ? error.stack : String(error), {
        payload,
        variables,
      });
      return false;
    }
  }

  filterJobStatusUpdate(
    payload: { jobStatusUpdated: JobStatusUpdate },
    variables: { input?: JobSubscriptionInput },
    context: any
  ): boolean {
    try {
      const update = payload.jobStatusUpdated;
      const input = variables.input;

      // Tenant isolation - always enforce
      if (context.req?.user?.tenantId && update.tenantId !== context.req.user.tenantId) {
        return false;
      }

      // If no input filters, allow all (subject to tenant isolation)
      if (!input) {
        return true;
      }

      // Job ID filter
      if (input.jobIds && input.jobIds.length > 0) {
        if (!input.jobIds.includes(update.jobId)) {
          return false;
        }
      }

      // Queue type filter
      if (input.queueTypes && input.queueTypes.length > 0) {
        if (!input.queueTypes.includes(update.queueType)) {
          return false;
        }
      }

      // Status filter
      if (input.statuses && input.statuses.length > 0) {
        if (!input.statuses.includes(update.newStatus)) {
          return false;
        }
      }

      // User filter
      if (input.userId && update.userId !== input.userId) {
        return false;
      }

      // Tenant filter (additional check)
      if (input.tenantId && update.tenantId !== input.tenantId) {
        return false;
      }

      this.logger.debug('Job status update filter passed', {
        jobId: update.jobId,
        queueType: update.queueType,
        newStatus: update.newStatus,
        tenantId: update.tenantId,
        userId: context.req?.user?.id,
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to filter job status update', error instanceof Error ? error.stack : String(error), {
        payload,
        variables,
      });
      return false;
    }
  }

  // Advanced filtering with custom logic
  filterJobStatusUpdateAdvanced(
    payload: { jobStatusUpdated: JobStatusUpdate },
    variables: { input?: JobSubscriptionInput & { 
      priority?: number;
      errorCategory?: string;
      progressThreshold?: number;
    }},
    context: any
  ): boolean {
    try {
      // First apply basic filters
      if (!this.filterJobStatusUpdate(payload, variables, context)) {
        return false;
      }

      const update = payload.jobStatusUpdated;
      const input = variables.input;

      if (!input) {
        return true;
      }

      // Priority filter
      if (input.priority !== undefined) {
        // This would require additional job data in the update
        // For now, we'll skip this filter
      }

      // Error category filter
      if (input.errorCategory && update.newStatus === JobStatus.FAILED) {
        // This would require error categorization in the update
        // For now, we'll skip this filter
      }

      // Progress threshold filter
      if (input.progressThreshold !== undefined && update.progress) {
        if (update.progress.percentage < input.progressThreshold) {
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to apply advanced job status filter', error instanceof Error ? error.stack : String(error), {
        payload,
        variables,
      });
      return false;
    }
  }

  // Rate limiting for subscriptions
  checkSubscriptionRateLimit(
    context: any,
    subscriptionType: 'queueHealth' | 'jobStatus'
  ): boolean {
    try {
      const userId = context.req?.user?.id;
      const tenantId = context.req?.user?.tenantId;

      if (!userId) {
        return false;
      }

      // Simple in-memory rate limiting (in production, use Redis)
      const key = `subscription:${subscriptionType}:${userId}:${tenantId}`;
      const now = Date.now();
      const windowMs = 60000; // 1 minute window
      const maxSubscriptions = 10; // Max 10 subscriptions per minute

      // This is a simplified implementation
      // In production, you'd use a proper rate limiting service
      
      return true; // Allow for now
    } catch (error) {
      this.logger.error('Failed to check subscription rate limit', error instanceof Error ? error.stack : String(error), {
        subscriptionType,
        userId: context.req?.user?.id,
      });
      return false;
    }
  }

  // Subscription authorization
  authorizeSubscription(
    context: any,
    subscriptionType: 'queueHealth' | 'jobStatus',
    variables: any
  ): boolean {
    try {
      const user = context.req?.user;

      if (!user) {
        this.logger.warn('Subscription denied: No user context', {
          subscriptionType,
        });
        return false;
      }

      // Check basic queue read permission
      const hasQueueReadPermission = user.permissions?.includes('queue:read') ||
                                   user.permissions?.includes('queue:admin') ||
                                   user.permissions?.includes('admin');

      if (!hasQueueReadPermission) {
        this.logger.warn('Subscription denied: Insufficient permissions', {
          subscriptionType,
          userId: user.id,
          permissions: user.permissions,
        });
        return false;
      }

      // Check rate limits
      if (!this.checkSubscriptionRateLimit(context, subscriptionType)) {
        this.logger.warn('Subscription denied: Rate limit exceeded', {
          subscriptionType,
          userId: user.id,
        });
        return false;
      }

      // Additional authorization checks based on subscription type
      switch (subscriptionType) {
        case 'queueHealth':
          return this.authorizeQueueHealthSubscription(context, variables);
        case 'jobStatus':
          return this.authorizeJobStatusSubscription(context, variables);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error('Failed to authorize subscription', error instanceof Error ? error.stack : String(error), {
        subscriptionType,
        userId: context.req?.user?.id,
      });
      return false;
    }
  }

  private authorizeQueueHealthSubscription(context: any, variables: any): boolean {
    const user = context.req?.user;
    const input = variables.input as QueueSubscriptionInput;

    // Check if user can access specific queue types
    if (input?.queueTypes && input.queueTypes.length > 0) {
      for (const queueType of input.queueTypes) {
        const queuePermission = `queue:${queueType.toLowerCase()}:access`;
        
        if (!user.permissions?.includes(queuePermission) &&
            !user.permissions?.includes('queue:admin') &&
            !user.permissions?.includes('admin')) {
          this.logger.warn('Queue health subscription denied: No access to queue type', {
            queueType,
            userId: user.id,
          });
          return false;
        }
      }
    }

    return true;
  }

  private authorizeJobStatusSubscription(context: any, variables: any): boolean {
    const user = context.req?.user;
    const input = variables.input as JobSubscriptionInput;

    // Check if user can access specific queue types
    if (input?.queueTypes && input.queueTypes.length > 0) {
      for (const queueType of input.queueTypes) {
        const queuePermission = `queue:${queueType.toLowerCase()}:access`;
        
        if (!user.permissions?.includes(queuePermission) &&
            !user.permissions?.includes('queue:admin') &&
            !user.permissions?.includes('admin')) {
          this.logger.warn('Job status subscription denied: No access to queue type', {
            queueType,
            userId: user.id,
          });
          return false;
        }
      }
    }

    // If filtering by specific user, ensure it's the current user or admin
    if (input?.userId && input.userId !== user.id) {
      if (!user.permissions?.includes('queue:admin') &&
          !user.permissions?.includes('admin')) {
        this.logger.warn('Job status subscription denied: Cannot access other user jobs', {
          requestedUserId: input.userId,
          currentUserId: user.id,
        });
        return false;
      }
    }

    return true;
  }

  // Subscription cleanup and management
  trackSubscription(
    context: any,
    subscriptionType: 'queueHealth' | 'jobStatus',
    subscriptionId: string
  ): void {
    try {
      const userId = context.req?.user?.id;
      const tenantId = context.req?.user?.tenantId;

      this.logger.log('Subscription started', {
        subscriptionId,
        subscriptionType,
        userId,
        tenantId,
        timestamp: new Date(),
      });

      // In production, you might want to store subscription metadata
      // for monitoring and cleanup purposes
    } catch (error) {
      this.logger.error('Failed to track subscription', error instanceof Error ? error.stack : String(error), {
        subscriptionType,
        subscriptionId,
      });
    }
  }

  cleanupSubscription(
    subscriptionId: string,
    subscriptionType: 'queueHealth' | 'jobStatus'
  ): void {
    try {
      this.logger.log('Subscription ended', {
        subscriptionId,
        subscriptionType,
        timestamp: new Date(),
      });

      // Cleanup any resources associated with the subscription
    } catch (error) {
      this.logger.error('Failed to cleanup subscription', error instanceof Error ? error.stack : String(error), {
        subscriptionType,
        subscriptionId,
      });
    }
  }
}