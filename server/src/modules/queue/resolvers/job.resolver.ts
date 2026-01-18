import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { 
  QueueJob, 
  JobOperationResponse, 
  BulkJobOperationResponse,
  PaginatedJobs,
  JobStatusUpdate,
  QueueType,
  JobStatus 
} from '../types/queue.types';
import { 
  CreateJobInput,
  BulkCreateJobInput,
  CreateEmailJobInput,
  CreateReportJobInput,
  CreateSyncJobInput,
  CreateNotificationJobInput,
  CreateAnalyticsJobInput,
  GetJobsInput,
  RetryJobInput,
  BulkJobOperationInput,
  UpdateJobProgressInput,
  JobSubscriptionInput 
} from '../inputs/queue.input';
import { QueueService } from '../queue.service';
import { JobManagementService } from '../services/job-management.service';
import { 
  QueuePermissionGuard, 
  QueueTenantGuard, 
  QueueRateLimitGuard,
  QueueValidationGuard 
} from '../guards/queue.guards';
import { 
  QueueAuditInterceptor, 
  QueueCacheInterceptor, 
  QueueMonitoringInterceptor,
  QueueRetryInterceptor,
  QueueTimeoutInterceptor 
} from '../interceptors/queue.interceptors';
import { 
  RequireQueueRead, 
  RequireQueueWrite, 
  RequireQueueManage,
  RequireTenantIsolation,
  QueueRateLimitByUser,
  CacheJobList,
  AuditJobOperation,
  MonitorJobCreation,
  SecureJobOperation,
  CurrentTenant,
  QueueContext,
  JobMetadata 
} from '../decorators/queue.decorators';
import { CustomLoggerService } from '../../logger/logger.service';

@Resolver(() => QueueJob)
@UseGuards(QueuePermissionGuard, QueueTenantGuard, QueueRateLimitGuard, QueueValidationGuard)
@UseInterceptors(QueueAuditInterceptor, QueueCacheInterceptor, QueueMonitoringInterceptor)
export class JobResolver {
  constructor(
    private readonly queueService: QueueService,
    private readonly jobManagementService: JobManagementService,
    private readonly logger: CustomLoggerService,
    private readonly pubSub: PubSub,
  ) {
    this.logger.setContext('JobResolver');
  }

  // Queries
  @Query(() => PaginatedJobs, { 
    name: 'getJobs',
    description: 'Get paginated list of jobs with filtering and sorting' 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  @CacheJobList(30)
  @QueueRateLimitByUser(200, 60000)
  async getJobs(
    @Args('input', { nullable: true }) input?: GetJobsInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<PaginatedJobs> {
    try {
      this.logger.log('Getting jobs', { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.jobManagementService.getJobs(input, tenantId);
      
      this.logger.debug('Jobs retrieved successfully', { 
        total: result.total,
        page: result.page,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get jobs', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  @Query(() => QueueJob, { 
    name: 'getJob',
    description: 'Get detailed information about a specific job',
    nullable: true 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  async getJob(
    @Args('jobId', { type: () => ID }) jobId: string,
    @Args('queueType', { type: () => QueueType }) queueType: QueueType,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueJob | null> {
    try {
      this.logger.log('Getting job', { 
        jobId, 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.jobManagementService.getJob(jobId, queueType, tenantId);
      
      if (result) {
        this.logger.debug('Job retrieved successfully', { 
          jobId, 
          status: result.status,
          tenantId 
        });
      } else {
        this.logger.warn('Job not found', { jobId, queueType, tenantId });
      }

      return result;
    } catch (error) {
      this.logger.error('Failed to get job', error.stack, { 
        jobId, 
        queueType, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  @Query(() => [QueueJob], { 
    name: 'getJobsByCorrelationId',
    description: 'Get all jobs associated with a correlation ID' 
  })
  @RequireQueueRead()
  @RequireTenantIsolation()
  async getJobsByCorrelationId(
    @Args('correlationId') correlationId: string,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<QueueJob[]> {
    try {
      this.logger.log('Getting jobs by correlation ID', { 
        correlationId, 
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.jobManagementService.getJobsByCorrelationId(correlationId, tenantId);
      
      this.logger.debug('Jobs retrieved by correlation ID', { 
        correlationId, 
        count: result.length,
        tenantId 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to get jobs by correlation ID', error.stack, { 
        correlationId, 
        tenantId, 
        userId: context?.user?.id 
      });
      throw error;
    }
  }

  // Job Creation Mutations
  @Mutation(() => JobOperationResponse, { 
    name: 'createJob',
    description: 'Create a new job in the specified queue' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  @UseInterceptors(QueueRetryInterceptor, QueueTimeoutInterceptor)
  async createJob(
    @Args('input') input: CreateJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Creating job', { 
        input: { ...input, data: '[REDACTED]' }, 
        tenantId, 
        userId: context?.user?.id 
      });

      // Inject tenant and user context
      const jobData = {
        ...input.data,
        tenantId: tenantId || input.tenantId,
        userId: context?.user?.id || input.userId,
      };

      const job = await this.jobManagementService.createJob({
        ...input,
        data: jobData,
      }, metadata);

      // Publish job status update
      await this.pubSub.publish('jobStatusUpdated', {
        jobStatusUpdated: {
          jobId: job.id,
          queueType: input.queueType,
          oldStatus: JobStatus.WAITING,
          newStatus: job.status,
          progress: job.progress,
          timestamp: new Date(),
          tenantId,
          userId: context?.user?.id,
        },
      });

      this.logger.log('Job created successfully', { 
        jobId: job.id, 
        queueType: input.queueType,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Job created successfully in ${input.queueType} queue`,
        job,
      };
    } catch (error) {
      this.logger.error('Failed to create job', error.stack, { 
        input: { ...input, data: '[REDACTED]' }, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create job: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => BulkJobOperationResponse, { 
    name: 'createBulkJobs',
    description: 'Create multiple jobs in batch' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  @QueueRateLimitByUser(10, 60000) // Limit bulk operations
  async createBulkJobs(
    @Args('input') input: BulkCreateJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<BulkJobOperationResponse> {
    try {
      this.logger.log('Creating bulk jobs', { 
        jobCount: input.jobs.length, 
        tenantId, 
        userId: context?.user?.id 
      });

      // Inject tenant and user context into all jobs
      const jobsWithContext = input.jobs.map(job => ({
        ...job,
        data: {
          ...job.data,
          tenantId: tenantId || job.tenantId,
          userId: context?.user?.id || job.userId,
        },
      }));

      const result = await this.jobManagementService.createBulkJobs({
        ...input,
        jobs: jobsWithContext,
      }, metadata);

      // Publish job status updates for successful jobs
      for (const job of result.jobs) {
        await this.pubSub.publish('jobStatusUpdated', {
          jobStatusUpdated: {
            jobId: job.id,
            queueType: job.queueType,
            oldStatus: JobStatus.WAITING,
            newStatus: job.status,
            progress: job.progress,
            timestamp: new Date(),
            tenantId,
            userId: context?.user?.id,
          },
        });
      }

      this.logger.log('Bulk jobs created successfully', { 
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        failureCount: result.failureCount,
        tenantId, 
        userId: context?.user?.id 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to create bulk jobs', error.stack, { 
        jobCount: input.jobs.length, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create bulk jobs: ${error.message}`,
        jobs: [],
        totalProcessed: 0,
        successCount: 0,
        failureCount: input.jobs.length,
        errors: [error.message],
      };
    }
  }

  // Specialized Job Creation Mutations
  @Mutation(() => JobOperationResponse, { 
    name: 'createEmailJob',
    description: 'Create an email job with email-specific validation' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  async createEmailJob(
    @Args('input') input: CreateEmailJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Creating email job', { 
        to: input.emailData.to.length, 
        subject: input.emailData.subject,
        tenantId, 
        userId: context?.user?.id 
      });

      const job = await this.queueService.addEmailJob({
        ...input.emailData,
        tenantId: tenantId || input.emailData.tenantId,
      }, input.options);

      const queueJob = await this.jobManagementService.convertBullJobToQueueJob(job);

      this.logger.log('Email job created successfully', { 
        jobId: job.id, 
        recipients: input.emailData.to.length,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Email job created successfully for ${input.emailData.to.length} recipients`,
        job: queueJob,
      };
    } catch (error) {
      this.logger.error('Failed to create email job', error.stack, { 
        input: { ...input, emailData: { ...input.emailData, data: '[REDACTED]' } }, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create email job: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => JobOperationResponse, { 
    name: 'createReportJob',
    description: 'Create a report generation job' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  async createReportJob(
    @Args('input') input: CreateReportJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Creating report job', { 
        reportType: input.reportData.reportType,
        format: input.reportData.format,
        tenantId, 
        userId: context?.user?.id 
      });

      const job = await this.queueService.addReportJob({
        ...input.reportData,
        tenantId: tenantId || input.reportData.tenantId,
        userId: context?.user?.id || input.reportData.userId,
      }, input.options);

      const queueJob = await this.jobManagementService.convertBullJobToQueueJob(job);

      this.logger.log('Report job created successfully', { 
        jobId: job.id, 
        reportType: input.reportData.reportType,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Report job created successfully (${input.reportData.reportType})`,
        job: queueJob,
      };
    } catch (error) {
      this.logger.error('Failed to create report job', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create report job: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => JobOperationResponse, { 
    name: 'createSyncJob',
    description: 'Create a data synchronization job' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  async createSyncJob(
    @Args('input') input: CreateSyncJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Creating sync job', { 
        syncType: input.syncData.syncType,
        sourceLocationId: input.syncData.sourceLocationId,
        targetLocationId: input.syncData.targetLocationId,
        tenantId, 
        userId: context?.user?.id 
      });

      const job = await this.queueService.addSyncJob({
        ...input.syncData,
        tenantId: tenantId || input.syncData.tenantId,
        userId: context?.user?.id || input.syncData.userId,
      }, input.options);

      const queueJob = await this.jobManagementService.convertBullJobToQueueJob(job);

      this.logger.log('Sync job created successfully', { 
        jobId: job.id, 
        syncType: input.syncData.syncType,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Sync job created successfully (${input.syncData.syncType})`,
        job: queueJob,
      };
    } catch (error) {
      this.logger.error('Failed to create sync job', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create sync job: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => JobOperationResponse, { 
    name: 'createNotificationJob',
    description: 'Create a notification job' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  async createNotificationJob(
    @Args('input') input: CreateNotificationJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Creating notification job', { 
        type: input.notificationData.type,
        recipients: input.notificationData.recipients.length,
        title: input.notificationData.title,
        tenantId, 
        userId: context?.user?.id 
      });

      const job = await this.queueService.addNotificationJob({
        ...input.notificationData,
        tenantId: tenantId || input.notificationData.tenantId,
      }, input.options);

      const queueJob = await this.jobManagementService.convertBullJobToQueueJob(job);

      this.logger.log('Notification job created successfully', { 
        jobId: job.id, 
        type: input.notificationData.type,
        recipients: input.notificationData.recipients.length,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Notification job created successfully (${input.notificationData.type} to ${input.notificationData.recipients.length} recipients)`,
        job: queueJob,
      };
    } catch (error) {
      this.logger.error('Failed to create notification job', error.stack, { 
        input: { ...input, notificationData: { ...input.notificationData, data: '[REDACTED]' } }, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create notification job: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => JobOperationResponse, { 
    name: 'createAnalyticsJob',
    description: 'Create an analytics processing job' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @SecureJobOperation()
  async createAnalyticsJob(
    @Args('input') input: CreateAnalyticsJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
    @JobMetadata() metadata?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Creating analytics job', { 
        eventType: input.analyticsData.eventType,
        tenantId, 
        userId: context?.user?.id 
      });

      const job = await this.queueService.addAnalyticsJob({
        ...input.analyticsData,
        tenantId: tenantId || input.analyticsData.tenantId,
        userId: context?.user?.id || input.analyticsData.userId,
      }, input.options);

      const queueJob = await this.jobManagementService.convertBullJobToQueueJob(job);

      this.logger.log('Analytics job created successfully', { 
        jobId: job.id, 
        eventType: input.analyticsData.eventType,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Analytics job created successfully (${input.analyticsData.eventType})`,
        job: queueJob,
      };
    } catch (error) {
      this.logger.error('Failed to create analytics job', error.stack, { 
        input: { ...input, analyticsData: { ...input.analyticsData, event: '[REDACTED]' } }, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to create analytics job: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  // Job Management Mutations
  @Mutation(() => JobOperationResponse, { 
    name: 'retryJob',
    description: 'Retry a failed job' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  @AuditJobOperation('retry')
  async retryJob(
    @Args('input') input: RetryJobInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Retrying job', { 
        jobId: input.jobId, 
        queueType: input.queueType,
        tenantId, 
        userId: context?.user?.id 
      });

      await this.queueService.retryJob(input.queueType as any, input.jobId);
      
      const job = await this.jobManagementService.getJob(input.jobId, input.queueType, tenantId);

      if (job) {
        // Publish job status update
        await this.pubSub.publish('jobStatusUpdated', {
          jobStatusUpdated: {
            jobId: input.jobId,
            queueType: input.queueType,
            oldStatus: JobStatus.FAILED,
            newStatus: job.status,
            progress: job.progress,
            timestamp: new Date(),
            tenantId,
            userId: context?.user?.id,
          },
        });
      }

      this.logger.log('Job retried successfully', { 
        jobId: input.jobId, 
        queueType: input.queueType,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Job ${input.jobId} retried successfully`,
        job,
      };
    } catch (error) {
      this.logger.error('Failed to retry job', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to retry job ${input.jobId}: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => BulkJobOperationResponse, { 
    name: 'bulkJobOperation',
    description: 'Perform bulk operations on multiple jobs' 
  })
  @RequireQueueManage()
  @RequireTenantIsolation()
  @AuditJobOperation('bulk')
  @QueueRateLimitByUser(5, 60000) // Limit bulk operations
  async bulkJobOperation(
    @Args('input') input: BulkJobOperationInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<BulkJobOperationResponse> {
    try {
      this.logger.log('Performing bulk job operation', { 
        operation: input.operation,
        jobCount: input.jobIds.length,
        queueType: input.queueType,
        tenantId, 
        userId: context?.user?.id 
      });

      const result = await this.jobManagementService.bulkJobOperation(input, tenantId);

      // Publish job status updates for affected jobs
      for (const job of result.jobs) {
        await this.pubSub.publish('jobStatusUpdated', {
          jobStatusUpdated: {
            jobId: job.id,
            queueType: input.queueType,
            oldStatus: JobStatus.WAITING, // This would need to be tracked properly
            newStatus: job.status,
            progress: job.progress,
            timestamp: new Date(),
            tenantId,
            userId: context?.user?.id,
          },
        });
      }

      this.logger.log('Bulk job operation completed', { 
        operation: input.operation,
        totalProcessed: result.totalProcessed,
        successCount: result.successCount,
        failureCount: result.failureCount,
        tenantId, 
        userId: context?.user?.id 
      });

      return result;
    } catch (error) {
      this.logger.error('Failed to perform bulk job operation', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to perform bulk operation: ${error.message}`,
        jobs: [],
        totalProcessed: 0,
        successCount: 0,
        failureCount: input.jobIds.length,
        errors: [error.message],
      };
    }
  }

  @Mutation(() => JobOperationResponse, { 
    name: 'updateJobProgress',
    description: 'Update job progress (for active jobs)' 
  })
  @RequireQueueWrite()
  @RequireTenantIsolation()
  async updateJobProgress(
    @Args('input') input: UpdateJobProgressInput,
    @CurrentTenant() tenantId?: string,
    @QueueContext() context?: any,
  ): Promise<JobOperationResponse> {
    try {
      this.logger.log('Updating job progress', { 
        jobId: input.jobId, 
        progress: input.progress,
        queueType: input.queueType,
        tenantId, 
        userId: context?.user?.id 
      });

      const job = await this.jobManagementService.updateJobProgress(input, tenantId);

      if (job) {
        // Publish job progress update
        await this.pubSub.publish('jobStatusUpdated', {
          jobStatusUpdated: {
            jobId: input.jobId,
            queueType: input.queueType,
            oldStatus: job.status,
            newStatus: job.status,
            progress: job.progress,
            timestamp: new Date(),
            tenantId,
            userId: context?.user?.id,
          },
        });
      }

      this.logger.log('Job progress updated successfully', { 
        jobId: input.jobId, 
        progress: input.progress,
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: true,
        message: `Job progress updated to ${input.progress}%`,
        job,
      };
    } catch (error) {
      this.logger.error('Failed to update job progress', error.stack, { 
        input, 
        tenantId, 
        userId: context?.user?.id 
      });

      return {
        success: false,
        message: `Failed to update job progress: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  // Subscriptions
  @Subscription(() => JobStatusUpdate, {
    name: 'jobStatusUpdated',
    description: 'Subscribe to job status updates',
    filter: (payload, variables, context) => {
      const update = payload.jobStatusUpdated;
      const input = variables.input as JobSubscriptionInput;
      
      // Tenant isolation
      if (context.req?.user?.tenantId && update.tenantId !== context.req.user.tenantId) {
        return false;
      }
      
      // Job ID filter
      if (input?.jobIds && !input.jobIds.includes(update.jobId)) {
        return false;
      }
      
      // Queue type filter
      if (input?.queueTypes && !input.queueTypes.includes(update.queueType)) {
        return false;
      }
      
      // Status filter
      if (input?.statuses && !input.statuses.includes(update.newStatus)) {
        return false;
      }
      
      // User filter
      if (input?.userId && update.userId !== input.userId) {
        return false;
      }
      
      return true;
    },
  })
  @RequireQueueRead()
  jobStatusUpdated(
    @Args('input', { nullable: true }) input?: JobSubscriptionInput,
  ) {
    return this.pubSub.asyncIterator('jobStatusUpdated');
  }
}