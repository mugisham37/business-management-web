import { Resolver, ResolveField, Parent, Args, Context } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { 
  QueueJob, 
  JobProgress, 
  JobAttempt, 
  JobMetrics,
  QueueType,
  JobStatus 
} from '../types/queue.types';
import { JobManagementService } from '../services/job-management.service';
import { QueueAnalyticsService } from '../services/queue-analytics.service';
import { 
  QueuePermissionGuard, 
  QueueTenantGuard, 
  QueueRateLimitGuard 
} from '../guards/queue.guards';
import { 
  QueueCacheInterceptor, 
  QueueMonitoringInterceptor 
} from '../interceptors/queue.interceptors';
import { 
  RequireQueueRead,
  CurrentTenant 
} from '../decorators/queue.decorators';
import { CustomLoggerService } from '../../logger/logger.service';
import { GraphQLJSON } from 'graphql-type-json';

// Helper function to safely get error stack
function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack;
  }
  return String(error);
}

@Resolver(() => QueueJob)
@UseGuards(QueuePermissionGuard, QueueTenantGuard, QueueRateLimitGuard)
@UseInterceptors(QueueCacheInterceptor, QueueMonitoringInterceptor)
export class JobFieldResolver {
  constructor(
    private readonly jobManagementService: JobManagementService,
    private readonly queueAnalyticsService: QueueAnalyticsService,
    private readonly logger: CustomLoggerService,
  ) {
    this.logger.setContext('JobFieldResolver');
  }

  @ResolveField(() => JobProgress, { 
    name: 'progress',
    description: 'Current job progress information',
    nullable: true 
  })
  @RequireQueueRead()
  async getJobProgress(
    @Parent() job: QueueJob,
  ): Promise<JobProgress | null> {
    try {
      // Progress is already included in the job object from the service
      return job.progress || null;
    } catch (error) {
      this.logger.error('Failed to resolve job progress', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return null;
    }
  }

  @ResolveField(() => [JobAttempt], { 
    name: 'attempts',
    description: 'List of job execution attempts' 
  })
  @RequireQueueRead()
  async getJobAttempts(
    @Parent() job: QueueJob,
  ): Promise<JobAttempt[]> {
    try {
      // Attempts are already included in the job object from the service
      return job.attempts || [];
    } catch (error) {
      this.logger.error('Failed to resolve job attempts', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return [];
    }
  }

  @ResolveField(() => JobMetrics, { 
    name: 'metrics',
    description: 'Job performance metrics' 
  })
  @RequireQueueRead()
  async getJobMetrics(
    @Parent() job: QueueJob,
  ): Promise<JobMetrics> {
    try {
      // Metrics are already included in the job object from the service
      return job.metrics;
    } catch (error) {
      this.logger.error('Failed to resolve job metrics', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      
      // Return default metrics if resolution fails
      return {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        successRate: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        firstAttempt: new Date(),
      };
    }
  }

  @ResolveField(() => Number, { 
    name: 'duration',
    description: 'Total job execution duration in milliseconds',
    nullable: true 
  })
  @RequireQueueRead()
  async getJobDuration(
    @Parent() job: QueueJob,
  ): Promise<number | null> {
    try {
      if (job.startedAt && job.completedAt) {
        return job.completedAt.getTime() - job.startedAt.getTime();
      }
      
      if (job.startedAt && job.status === JobStatus.ACTIVE) {
        return Date.now() - job.startedAt.getTime();
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to resolve job duration', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return null;
    }
  }

  @ResolveField(() => Number, { 
    name: 'waitTime',
    description: 'Time job waited before processing in milliseconds',
    nullable: true 
  })
  @RequireQueueRead()
  async getJobWaitTime(
    @Parent() job: QueueJob,
  ): Promise<number | null> {
    try {
      if (job.createdAt && job.startedAt) {
        return job.startedAt.getTime() - job.createdAt.getTime();
      }
      
      if (job.createdAt && job.status === JobStatus.WAITING) {
        return Date.now() - job.createdAt.getTime();
      }
      
      return null;
    } catch (error) {
      this.logger.error('Failed to resolve job wait time', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return null;
    }
  }

  @ResolveField(() => String, { 
    name: 'statusDescription',
    description: 'Human-readable status description' 
  })
  @RequireQueueRead()
  async getStatusDescription(
    @Parent() job: QueueJob,
  ): Promise<string> {
    try {
      switch (job.status) {
        case JobStatus.WAITING:
          return job.delayedUntil 
            ? `Scheduled to run at ${job.delayedUntil.toISOString()}`
            : 'Waiting to be processed';
        case JobStatus.ACTIVE:
          const progress = job.progress?.percentage || 0;
          return `Processing (${progress}% complete)`;
        case JobStatus.COMPLETED:
          const duration = job.completedAt && job.startedAt 
            ? job.completedAt.getTime() - job.startedAt.getTime()
            : 0;
          return `Completed in ${duration}ms`;
        case JobStatus.FAILED:
          const attempts = job.attempts?.length || 0;
          return `Failed after ${attempts} attempts: ${job.error || 'Unknown error'}`;
        case JobStatus.DELAYED:
          return job.delayedUntil 
            ? `Delayed until ${job.delayedUntil.toISOString()}`
            : 'Delayed';
        case JobStatus.PAUSED:
          return 'Paused';
        case JobStatus.STUCK:
          return 'Stuck - may require manual intervention';
        default:
          return 'Unknown status';
      }
    } catch (error) {
      this.logger.error('Failed to resolve status description', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return 'Status unavailable';
    }
  }

  @ResolveField(() => Boolean, { 
    name: 'canRetry',
    description: 'Whether the job can be retried' 
  })
  @RequireQueueRead()
  async getCanRetry(
    @Parent() job: QueueJob,
  ): Promise<boolean> {
    try {
      // Jobs can be retried if they are failed and haven't exceeded max attempts
      return job.status === JobStatus.FAILED && 
             job.attempts.length < 10; // Max retry limit
    } catch (error) {
      this.logger.error('Failed to resolve can retry', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return false;
    }
  }

  @ResolveField(() => Boolean, { 
    name: 'canCancel',
    description: 'Whether the job can be cancelled' 
  })
  @RequireQueueRead()
  async getCanCancel(
    @Parent() job: QueueJob,
  ): Promise<boolean> {
    try {
      // Jobs can be cancelled if they are waiting, delayed, or active
      return [JobStatus.WAITING, JobStatus.DELAYED, JobStatus.ACTIVE].includes(job.status);
    } catch (error) {
      this.logger.error('Failed to resolve can cancel', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return false;
    }
  }

  @ResolveField(() => String, { 
    name: 'priorityDescription',
    description: 'Human-readable priority description' 
  })
  @RequireQueueRead()
  async getPriorityDescription(
    @Parent() job: QueueJob,
  ): Promise<string> {
    try {
      switch (job.priority) {
        case 1:
          return 'Low Priority';
        case 5:
          return 'Normal Priority';
        case 10:
          return 'High Priority';
        case 15:
          return 'Critical Priority';
        case 20:
          return 'Urgent Priority';
        default:
          return `Priority ${job.priority}`;
      }
    } catch (error) {
      this.logger.error('Failed to resolve priority description', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return 'Unknown Priority';
    }
  }

  @ResolveField(() => [QueueJob], { 
    name: 'relatedJobs',
    description: 'Jobs with the same correlation ID' 
  })
  @RequireQueueRead()
  async getRelatedJobs(
    @Parent() job: QueueJob,
    @CurrentTenant() tenantId?: string,
  ): Promise<QueueJob[]> {
    try {
      if (!job.correlationId) {
        return [];
      }

      const relatedJobs = await this.jobManagementService.getJobsByCorrelationId(
        job.correlationId,
        tenantId
      );

      // Exclude the current job from related jobs
      return relatedJobs.filter(relatedJob => relatedJob.id !== job.id);
    } catch (error) {
      this.logger.error('Failed to resolve related jobs', getErrorStack(error), {
        jobId: job.id,
        correlationId: job.correlationId,
        tenantId,
      });
      return [];
    }
  }

  @ResolveField(() => GraphQLJSON, { 
    name: 'sanitizedData',
    description: 'Job data with sensitive fields removed',
    nullable: true 
  })
  @RequireQueueRead()
  async getSanitizedData(
    @Parent() job: QueueJob,
  ): Promise<any> {
    try {
      if (!job.data) {
        return null;
      }

      // Create a deep copy and remove sensitive fields
      const sanitized = JSON.parse(JSON.stringify(job.data));
      
      // List of sensitive field patterns to remove
      const sensitivePatterns = [
        'password',
        'token',
        'secret',
        'apiKey',
        'privateKey',
        'credential',
        'auth',
      ];

      this.removeSensitiveFields(sanitized, sensitivePatterns);
      
      return sanitized;
    } catch (error) {
      this.logger.error('Failed to resolve sanitized data', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return null;
    }
  }

  @ResolveField(() => Number, { 
    name: 'estimatedCompletion',
    description: 'Estimated completion time in milliseconds from now',
    nullable: true 
  })
  @RequireQueueRead()
  async getEstimatedCompletion(
    @Parent() job: QueueJob,
  ): Promise<number | null> {
    try {
      if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
        return 0;
      }

      if (job.status === JobStatus.ACTIVE && job.progress?.percentage) {
        // Estimate based on current progress and elapsed time
        const elapsed = job.startedAt ? Date.now() - job.startedAt.getTime() : 0;
        const progressPercent = job.progress.percentage / 100;
        
        if (progressPercent > 0) {
          const totalEstimated = elapsed / progressPercent;
          return Math.max(0, totalEstimated - elapsed);
        }
      }

      if (job.status === JobStatus.WAITING || job.status === JobStatus.DELAYED) {
        // Estimate based on queue position and average processing time
        // This would require additional queue analysis
        return null;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to resolve estimated completion', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return null;
    }
  }

  @ResolveField(() => String, { 
    name: 'nextRetryAt',
    description: 'When the job will be retried if it fails',
    nullable: true 
  })
  @RequireQueueRead()
  async getNextRetryAt(
    @Parent() job: QueueJob,
  ): Promise<string | null> {
    try {
      // Check if job can retry (same logic as getCanRetry)
      const canRetry = job.status === JobStatus.FAILED && job.attempts.length < 10;
      if (job.status !== JobStatus.FAILED || !canRetry) {
        return null;
      }

      // Calculate next retry time based on exponential backoff
      const attemptNumber = job.attempts.length;
      const baseDelay = 2000; // 2 seconds
      const delay = baseDelay * Math.pow(2, attemptNumber - 1);
      const maxDelay = 30000; // 30 seconds max
      
      const actualDelay = Math.min(delay, maxDelay);
      const nextRetry = new Date(Date.now() + actualDelay);
      
      return nextRetry.toISOString();
    } catch (error) {
      this.logger.error('Failed to resolve next retry at', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return null;
    }
  }

  @ResolveField(() => String, { 
    name: 'errorCategory',
    description: 'Category of error if job failed',
    nullable: true 
  })
  @RequireQueueRead()
  async getErrorCategory(
    @Parent() job: QueueJob,
  ): Promise<string | null> {
    try {
      if (!job.error) {
        return null;
      }

      const error = job.error.toLowerCase();
      
      // Categorize common error types
      if (error.includes('timeout') || error.includes('timed out')) {
        return 'Timeout';
      }
      if (error.includes('network') || error.includes('connection')) {
        return 'Network';
      }
      if (error.includes('validation') || error.includes('invalid')) {
        return 'Validation';
      }
      if (error.includes('permission') || error.includes('unauthorized')) {
        return 'Permission';
      }
      if (error.includes('not found') || error.includes('404')) {
        return 'Not Found';
      }
      if (error.includes('rate limit') || error.includes('throttle')) {
        return 'Rate Limit';
      }
      if (error.includes('memory') || error.includes('out of')) {
        return 'Resource';
      }
      
      return 'Unknown';
    } catch (error) {
      this.logger.error('Failed to resolve error category', getErrorStack(error), {
        jobId: job.id,
        queueType: job.queueType,
      });
      return 'Unknown';
    }
  }

  private removeSensitiveFields(obj: any, sensitivePatterns: string[]): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const keyLower = key.toLowerCase();
        
        // Check if key matches any sensitive pattern
        const isSensitive = sensitivePatterns.some(pattern => 
          keyLower.includes(pattern.toLowerCase())
        );

        if (isSensitive) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          // Recursively check nested objects
          this.removeSensitiveFields(obj[key], sensitivePatterns);
        }
      }
    }
  }
}