import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { 
  QueueJob, 
  PaginatedJobs,
  BulkJobOperationResponse,
  QueueType,
  JobStatus,
  JobPriority,
  ProcessorType,
  JobProgress,
  JobAttempt,
  JobMetrics 
} from '../types/queue.types';
import { 
  CreateJobInput,
  BulkCreateJobInput,
  GetJobsInput,
  BulkJobOperationInput,
  UpdateJobProgressInput 
} from '../inputs/queue.input';
import { CustomLoggerService } from '../../logger/logger.service';
import { CacheService } from '../../cache/cache.service';
import { RealtimeService } from '../../realtime/services/realtime.service';

@Injectable()
export class JobManagementService {
  private readonly logger = new Logger(JobManagementService.name);

  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('reports') private readonly reportsQueue: Queue,
    @InjectQueue('sync') private readonly syncQueue: Queue,
    @InjectQueue('notifications') private readonly notificationsQueue: Queue,
    @InjectQueue('analytics') private readonly analyticsQueue: Queue,
    private readonly customLogger: CustomLoggerService,
    private readonly cacheService?: CacheService,
    private readonly realtimeService?: RealtimeService,
  ) {
    this.customLogger.setContext('JobManagementService');
  }

  async getJobs(input?: GetJobsInput, tenantId?: string): Promise<PaginatedJobs> {
    try {
      const page = input?.pagination?.page || 1;
      const limit = input?.pagination?.limit || 20;
      const offset = (page - 1) * limit;

      // Get jobs from all queues
      const allJobs = await this.getAllJobs(input?.filter, tenantId);
      
      // Apply sorting
      let sortedJobs = allJobs;
      if (input?.sort && input.sort.length > 0) {
        sortedJobs = this.applySorting(allJobs, input.sort);
      }

      // Apply pagination
      const total = sortedJobs.length;
      const paginatedJobs = sortedJobs.slice(offset, offset + limit);
      const totalPages = Math.ceil(total / limit);

      // Convert Bull jobs to QueueJob format
      const jobs = await Promise.all(
        paginatedJobs.map(job => this.convertBullJobToQueueJob(job))
      );

      return {
        jobs,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      };
    } catch (error) {
      this.customLogger.error('Failed to get jobs', error instanceof Error ? error.stack : String(error), { input, tenantId });
      throw error;
    }
  }

  async getJob(jobId: string, queueType: QueueType, tenantId?: string): Promise<QueueJob | null> {
    try {
      const queue = this.getQueueByType(queueType);
      const bullJob = await queue.getJob(jobId);

      if (!bullJob) {
        return null;
      }

      // Check tenant isolation
      if (tenantId && bullJob.data.tenantId && bullJob.data.tenantId !== tenantId) {
        return null;
      }

      return await this.convertBullJobToQueueJob(bullJob);
    } catch (error) {
      this.customLogger.error('Failed to get job', error instanceof Error ? error.stack : String(error), { jobId, queueType, tenantId });
      throw error;
    }
  }

  async getJobsByCorrelationId(correlationId: string, tenantId?: string): Promise<QueueJob[]> {
    try {
      const allJobs = await this.getAllJobs(
        { 
          correlationId,
          tenantId 
        }, 
        tenantId
      );

      return await Promise.all(
        allJobs.map(job => this.convertBullJobToQueueJob(job))
      );
    } catch (error) {
      this.customLogger.error('Failed to get jobs by correlation ID', error instanceof Error ? error.stack : String(error), { correlationId, tenantId });
      throw error;
    }
  }

  async createJob(input: CreateJobInput, metadata?: any): Promise<QueueJob> {
    try {
      const queue = this.getQueueByType(input.queueType);
      
      const jobOptions = {
        priority: input.options?.priority || JobPriority.NORMAL,
        delay: input.options?.delay || 0,
        attempts: input.options?.attempts || 3,
        timeout: input.options?.timeout,
        removeOnComplete: input.options?.removeOnComplete || false,
        removeOnFail: input.options?.removeOnFail || false,
        ...metadata,
      };

      // Add repeat options if specified
      if (input.repeat) {
        jobOptions['repeat'] = {
          cron: input.repeat.cron,
          every: input.repeat.every,
          limit: input.repeat.limit,
          endDate: input.repeat.endDate,
          tz: input.repeat.tz,
        };
      }

      const bullJob = await queue.add(
        this.getProcessorName(input.processorType),
        {
          ...input.data,
          tenantId: input.tenantId,
          userId: input.userId,
          correlationId: input.options?.correlationId,
          metadata: input.options?.metadata,
        },
        jobOptions
      );

      this.customLogger.log('Job created successfully', {
        jobId: bullJob.id,
        queueType: input.queueType,
        processorType: input.processorType,
        tenantId: input.tenantId,
        userId: input.userId,
      });

      return await this.convertBullJobToQueueJob(bullJob);
    } catch (error) {
      this.customLogger.error('Failed to create job', error instanceof Error ? error.stack : String(error), { input });
      throw error;
    }
  }

  async createBulkJobs(input: BulkCreateJobInput, metadata?: any): Promise<BulkJobOperationResponse> {
    try {
      const results: QueueJob[] = [];
      const errors: string[] = [];
      let successCount = 0;
      let failureCount = 0;

      // Group jobs by queue type for efficient bulk operations
      const jobsByQueue = this.groupJobsByQueue(input.jobs);

      for (const [queueType, jobs] of jobsByQueue.entries()) {
        try {
          const queue = this.getQueueByType(queueType);
          
          const bulkJobs = jobs.map(job => ({
            name: this.getProcessorName(job.processorType),
            data: {
              ...job.data,
              tenantId: job.tenantId,
              userId: job.userId,
              correlationId: job.options?.correlationId,
              metadata: job.options?.metadata,
            },
            opts: {
              priority: job.options?.priority || input.defaultOptions?.priority || JobPriority.NORMAL,
              delay: job.options?.delay || input.defaultOptions?.delay || 0,
              attempts: job.options?.attempts || input.defaultOptions?.attempts || 3,
              timeout: job.options?.timeout || input.defaultOptions?.timeout,
              removeOnComplete: job.options?.removeOnComplete || input.defaultOptions?.removeOnComplete || false,
              removeOnFail: job.options?.removeOnFail || input.defaultOptions?.removeOnFail || false,
              ...metadata,
            },
          }));

          const createdJobs = await queue.addBulk(bulkJobs);
          
          for (const bullJob of createdJobs) {
            try {
              const queueJob = await this.convertBullJobToQueueJob(bullJob);
              results.push(queueJob);
              successCount++;
            } catch (conversionError) {
              errors.push(`Failed to convert job ${bullJob.id}: ${conversionError instanceof Error ? conversionError.message : String(conversionError)}`);
              failureCount++;
            }
          }
        } catch (queueError) {
          const errorMessage = `Failed to create jobs in ${queueType} queue: ${queueError instanceof Error ? queueError.message : String(queueError)}`;
          errors.push(errorMessage);
          failureCount += jobs.length;
        }
      }

      this.customLogger.log('Bulk job creation completed', {
        totalProcessed: input.jobs.length,
        successCount,
        failureCount,
        errorCount: errors.length,
      });

      return {
        success: successCount > 0,
        message: `Bulk job creation completed: ${successCount} successful, ${failureCount} failed`,
        jobs: results,
        totalProcessed: input.jobs.length,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : [],
      };
    } catch (error) {
      this.customLogger.error('Failed to create bulk jobs', error instanceof Error ? error.stack : String(error), { input });
      throw error;
    }
  }

  async bulkJobOperation(input: BulkJobOperationInput, tenantId?: string): Promise<BulkJobOperationResponse> {
    try {
      const queue = this.getQueueByType(input.queueType);
      const results: QueueJob[] = [];
      const errors: string[] = [];
      let successCount = 0;
      let failureCount = 0;

      for (const jobId of input.jobIds) {
        try {
          const bullJob = await queue.getJob(jobId);
          
          if (!bullJob) {
            errors.push(`Job ${jobId} not found`);
            failureCount++;
            continue;
          }

          // Check tenant isolation
          if (tenantId && bullJob.data.tenantId && bullJob.data.tenantId !== tenantId) {
            errors.push(`Job ${jobId} access denied`);
            failureCount++;
            continue;
          }

          // Perform the requested operation
          await this.performJobOperation(bullJob, input.operation, input.options);
          
          const queueJob = await this.convertBullJobToQueueJob(bullJob);
          results.push(queueJob);
          successCount++;
        } catch (operationError) {
          errors.push(`Job ${jobId}: ${operationError instanceof Error ? operationError.message : String(operationError)}`);
          failureCount++;
        }
      }

      this.customLogger.log('Bulk job operation completed', {
        operation: input.operation,
        totalProcessed: input.jobIds.length,
        successCount,
        failureCount,
      });

      return {
        success: successCount > 0,
        message: `Bulk ${input.operation} operation completed: ${successCount} successful, ${failureCount} failed`,
        jobs: results,
        totalProcessed: input.jobIds.length,
        successCount,
        failureCount,
        errors: errors.length > 0 ? errors : [],
      };
    } catch (error) {
      this.customLogger.error('Failed to perform bulk job operation', error instanceof Error ? error.stack : String(error), { input, tenantId });
      throw error;
    }
  }

  async updateJobProgress(input: UpdateJobProgressInput, tenantId?: string): Promise<QueueJob | null> {
    try {
      const queue = this.getQueueByType(input.queueType);
      const bullJob = await queue.getJob(input.jobId);

      if (!bullJob) {
        throw new NotFoundException(`Job ${input.jobId} not found`);
      }

      // Check tenant isolation
      if (tenantId && bullJob.data.tenantId && bullJob.data.tenantId !== tenantId) {
        throw new NotFoundException(`Job ${input.jobId} not found`);
      }

      // Update job progress
      await bullJob.progress({
        percentage: input.progress,
        message: input.message,
        data: input.data,
        updatedAt: new Date(),
      });

      this.customLogger.log('Job progress updated', {
        jobId: input.jobId,
        progress: input.progress,
        message: input.message,
      });

      // Send real-time progress update
      if (this.realtimeService && bullJob.data.tenantId) {
        try {
          // TODO: Implement sendJobUpdate method in RealtimeService or remove this call
          // await this.realtimeService.sendJobUpdate(bullJob.data.tenantId, {
          //   jobId: input.jobId,
          //   queueType: input.queueType,
          //   progress: input.progress,
          //   message: input.message,
          //   timestamp: new Date(),
          // });
        } catch (err) {
          this.customLogger.warn('Failed to send real-time job update', { error: err instanceof Error ? err.message : String(err) });
        }
      }

      return await this.convertBullJobToQueueJob(bullJob);
    } catch (error) {
      this.customLogger.error('Failed to update job progress', error instanceof Error ? error.stack : String(error), { input, tenantId });
      throw error;
    }
  }

  async convertBullJobToQueueJob(bullJob: Job): Promise<QueueJob> {
    const attempts = await this.getJobAttempts(bullJob);
    const metrics = this.calculateJobMetrics(bullJob, attempts);
    const progress = this.extractJobProgress(bullJob);

    const result: QueueJob = {
      id: bullJob.id.toString(),
      name: bullJob.name,
      queueType: this.getQueueTypeFromQueue(bullJob.queue.name),
      processorType: this.getProcessorTypeFromName(bullJob.name),
      status: this.mapBullStatusToJobStatus(await bullJob.getState()),
      priority: bullJob.opts.priority || JobPriority.NORMAL,
      data: bullJob.data,
      result: bullJob.returnvalue,
      attempts,
      metrics,
      createdAt: new Date(bullJob.timestamp),
      isRepeatable: !!bullJob.opts.repeat,
    };

    // Add optional fields only if they have values
    if (progress) {
      result.progress = progress;
    }
    if (bullJob.failedReason) {
      result.error = bullJob.failedReason;
    }
    if (bullJob.processedOn) {
      result.startedAt = new Date(bullJob.processedOn);
    }
    if (bullJob.finishedOn) {
      result.completedAt = new Date(bullJob.finishedOn);
    }
    if (bullJob.failedReason && bullJob.finishedOn) {
      result.failedAt = new Date(bullJob.finishedOn);
    }
    if (bullJob.opts.delay) {
      result.delayedUntil = new Date(bullJob.timestamp + bullJob.opts.delay);
    }
    if (bullJob.data.tenantId) {
      result.tenantId = bullJob.data.tenantId;
    }
    if (bullJob.data.userId) {
      result.userId = bullJob.data.userId;
    }
    if (bullJob.data.correlationId) {
      result.correlationId = bullJob.data.correlationId;
    }
    if (bullJob.data.metadata) {
      result.metadata = bullJob.data.metadata;
    }
    if (bullJob.opts.timeout) {
      result.timeout = bullJob.opts.timeout;
    }
    if (bullJob.opts.delay) {
      result.delay = bullJob.opts.delay;
    }

    const repeatPattern = this.extractRepeatPattern(bullJob.opts.repeat);
    if (repeatPattern) {
      result.repeatPattern = repeatPattern;
    }

    const nextRun = bullJob.opts.repeat ? this.calculateNextRun(bullJob.opts.repeat) : undefined;
    if (nextRun) {
      result.nextRunAt = nextRun;
    }

    return result;
  }

  private async getAllJobs(filter?: any, tenantId?: string): Promise<Job[]> {
    const queues = [
      this.emailQueue,
      this.reportsQueue,
      this.syncQueue,
      this.notificationsQueue,
      this.analyticsQueue,
    ];

    const allJobs: Job[] = [];

    for (const queue of queues) {
      try {
        // Get jobs in different states
        const [waiting, active, completed, failed, delayed] = await Promise.all([
          queue.getWaiting(),
          queue.getActive(),
          queue.getCompleted(),
          queue.getFailed(),
          queue.getDelayed(),
        ]);

        const queueJobs = [...waiting, ...active, ...completed, ...failed, ...delayed];
        
        // Apply filters
        const filteredJobs = this.applyJobFilters(queueJobs, filter, tenantId);
        allJobs.push(...filteredJobs);
      } catch (error) {
        this.customLogger.warn(`Failed to get jobs from queue ${queue.name}`, { error: error instanceof Error ? error.message : String(error) });
      }
    }

    return allJobs;
  }

  private applyJobFilters(jobs: Job[], filter?: any, tenantId?: string): Job[] {
    if (!filter && !tenantId) {
      return jobs;
    }

    return jobs.filter(job => {
      // Tenant isolation
      if (tenantId && job.data.tenantId && job.data.tenantId !== tenantId) {
        return false;
      }

      if (!filter) {
        return true;
      }

      // Status filter
      if (filter.statuses && filter.statuses.length > 0) {
        const jobState = this.mapBullStatusToJobStatus(job.opts.jobId ? 'active' : 'waiting'); // Simplified
        if (!filter.statuses.includes(jobState)) {
          return false;
        }
      }

      // Queue type filter
      if (filter.queueTypes && filter.queueTypes.length > 0) {
        const queueType = this.getQueueTypeFromQueue(job.queue.name);
        if (!filter.queueTypes.includes(queueType)) {
          return false;
        }
      }

      // Priority filter
      if (filter.priorities && filter.priorities.length > 0) {
        if (!filter.priorities.includes(job.opts.priority || JobPriority.NORMAL)) {
          return false;
        }
      }

      // Date range filters
      if (filter.createdAt) {
        const jobDate = new Date(job.timestamp);
        if (filter.createdAt.from && jobDate < new Date(filter.createdAt.from)) {
          return false;
        }
        if (filter.createdAt.to && jobDate > new Date(filter.createdAt.to)) {
          return false;
        }
      }

      // User filter
      if (filter.userId && job.data.userId !== filter.userId) {
        return false;
      }

      // Correlation ID filter
      if (filter.correlationId && job.data.correlationId !== filter.correlationId) {
        return false;
      }

      // Search filter
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = `${job.name} ${JSON.stringify(job.data)}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Error filter
      if (filter.hasErrors !== undefined) {
        const hasErrors = !!job.failedReason;
        if (filter.hasErrors !== hasErrors) {
          return false;
        }
      }

      // Repeatable filter
      if (filter.isRepeatable !== undefined) {
        const isRepeatable = !!job.opts.repeat;
        if (filter.isRepeatable !== isRepeatable) {
          return false;
        }
      }

      return true;
    });
  }

  private applySorting(jobs: Job[], sortOptions: any[]): Job[] {
    return jobs.sort((a, b) => {
      for (const sort of sortOptions) {
        let aValue: any;
        let bValue: any;

        switch (sort.field) {
          case 'createdAt':
            aValue = a.timestamp;
            bValue = b.timestamp;
            break;
          case 'priority':
            aValue = a.opts.priority || JobPriority.NORMAL;
            bValue = b.opts.priority || JobPriority.NORMAL;
            break;
          case 'status':
            aValue = this.mapBullStatusToJobStatus('waiting'); // Simplified
            bValue = this.mapBullStatusToJobStatus('waiting');
            break;
          default:
            continue;
        }

        if (aValue < bValue) {
          return sort.direction === 'ASC' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sort.direction === 'ASC' ? 1 : -1;
        }
      }
      return 0;
    });
  }

  private groupJobsByQueue(jobs: CreateJobInput[]): Map<QueueType, CreateJobInput[]> {
    const grouped = new Map<QueueType, CreateJobInput[]>();

    for (const job of jobs) {
      if (!grouped.has(job.queueType)) {
        grouped.set(job.queueType, []);
      }
      grouped.get(job.queueType)!.push(job);
    }

    return grouped;
  }

  private async performJobOperation(bullJob: Job, operation: string, options?: any): Promise<void> {
    switch (operation) {
      case 'retry':
        await bullJob.retry();
        break;
      case 'cancel':
        await bullJob.remove();
        break;
      case 'remove':
        await bullJob.remove();
        break;
      case 'promote':
        await bullJob.promote();
        break;
      default:
        throw new BadRequestException(`Unknown job operation: ${operation}`);
    }
  }

  private async getJobAttempts(bullJob: Job): Promise<JobAttempt[]> {
    const attempts: JobAttempt[] = [];
    
    // Get attempt history from job data
    if (bullJob.attemptsMade > 0) {
      for (let i = 1; i <= bullJob.attemptsMade; i++) {
        const attemptObj: JobAttempt = {
          attemptNumber: i,
          attemptedAt: new Date(bullJob.processedOn || bullJob.timestamp),
        };
        
        // Only add optional fields if they have values
        if (i === bullJob.attemptsMade && bullJob.finishedOn) {
          attemptObj.completedAt = new Date(bullJob.finishedOn);
        }
        
        if (i === bullJob.attemptsMade && bullJob.failedReason) {
          attemptObj.error = bullJob.failedReason;
        }
        
        if (bullJob.finishedOn && bullJob.processedOn) {
          attemptObj.duration = bullJob.finishedOn - bullJob.processedOn;
        }
        
        attempts.push(attemptObj);
      }
    }

    return attempts;
  }

  private calculateJobMetrics(bullJob: Job, attempts: JobAttempt[]): JobMetrics {
    const totalAttempts = attempts.length;
    const successfulAttempts = attempts.filter(a => !a.error).length;
    const failedAttempts = totalAttempts - successfulAttempts;
    const successRate = totalAttempts > 0 ? successfulAttempts / totalAttempts : 0;

    const durations = attempts.filter(a => a.duration).map(a => a.duration!);
    const averageDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
    const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
    const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

    const result: JobMetrics = {
      totalAttempts,
      successfulAttempts,
      failedAttempts,
      successRate,
      averageDuration,
      minDuration,
      maxDuration,
      firstAttempt: new Date(bullJob.timestamp),
    };

    // Only add lastAttempt if there are attempts
    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      if (lastAttempt) {
        result.lastAttempt = lastAttempt.attemptedAt;
      }
    }

    return result;
  }

  private extractJobProgress(bullJob: Job): JobProgress | undefined {
    // Bull's progress() is a function, not a property
    // The actual progress data is stored in bullJob's internal state
    // For now, return undefined as we need to access the progress callback properly
    
    // If you have custom progress data in the job data, you can extract it like:
    if (bullJob.data?.progress) {
      const prog = bullJob.data.progress;
      if (typeof prog === 'object' && prog !== null) {
        return {
          current: prog.current || 0,
          total: prog.total || 100,
          percentage: prog.percentage || 0,
          message: prog.message,
          updatedAt: prog.updatedAt ? new Date(prog.updatedAt) : new Date(),
        };
      }
    }

    return undefined;
  }

  private extractRepeatPattern(repeatOptions: any): string | undefined {
    if (!repeatOptions) {
      return undefined;
    }

    // Check if it's cron-based repeat
    if (typeof repeatOptions === 'object') {
      if ('cron' in repeatOptions && repeatOptions.cron) {
        return repeatOptions.cron;
      }
      if ('every' in repeatOptions && repeatOptions.every) {
        return `every ${repeatOptions.every}ms`;
      }
    }

    return undefined;
  }

  private calculateNextRun(repeatOptions: any): Date | undefined {
    if (!repeatOptions) {
      return undefined;
    }

    if (typeof repeatOptions === 'object') {
      // For cron-based repeats
      if ('cron' in repeatOptions && repeatOptions.cron) {
        // Calculate next cron execution (simplified)
        return new Date(Date.now() + 60000); // Next minute as placeholder
      }

      // For interval-based repeats
      if ('every' in repeatOptions && repeatOptions.every) {
        return new Date(Date.now() + repeatOptions.every);
      }
    }

    return undefined;
  }

  private getQueueByType(queueType: QueueType): Queue {
    switch (queueType) {
      case QueueType.EMAIL:
        return this.emailQueue;
      case QueueType.REPORTS:
        return this.reportsQueue;
      case QueueType.SYNC:
        return this.syncQueue;
      case QueueType.NOTIFICATIONS:
        return this.notificationsQueue;
      case QueueType.ANALYTICS:
        return this.analyticsQueue;
      default:
        throw new BadRequestException(`Unknown queue type: ${queueType}`);
    }
  }

  private getQueueTypeFromQueue(queueName: string): QueueType {
    switch (queueName) {
      case 'email':
        return QueueType.EMAIL;
      case 'reports':
        return QueueType.REPORTS;
      case 'sync':
        return QueueType.SYNC;
      case 'notifications':
        return QueueType.NOTIFICATIONS;
      case 'analytics':
        return QueueType.ANALYTICS;
      default:
        return QueueType.EMAIL; // Default fallback
    }
  }

  private getProcessorName(processorType: ProcessorType): string {
    switch (processorType) {
      case ProcessorType.EMAIL_SEND:
      case ProcessorType.EMAIL_BULK:
        return 'send-email';
      case ProcessorType.REPORT_GENERATE:
      case ProcessorType.REPORT_SCHEDULE:
        return 'generate-report';
      case ProcessorType.SYNC_DATA:
      case ProcessorType.SYNC_INVENTORY:
      case ProcessorType.SYNC_CUSTOMERS:
      case ProcessorType.SYNC_TRANSACTIONS:
        return 'sync-data';
      case ProcessorType.NOTIFICATION_SEND:
      case ProcessorType.NOTIFICATION_BULK:
        return 'send-notification';
      case ProcessorType.ANALYTICS_PROCESS:
      case ProcessorType.ANALYTICS_AGGREGATE:
        return 'process-analytics-event';
      default:
        return 'generic-job';
    }
  }

  private getProcessorTypeFromName(processorName: string): ProcessorType {
    switch (processorName) {
      case 'send-email':
        return ProcessorType.EMAIL_SEND;
      case 'generate-report':
        return ProcessorType.REPORT_GENERATE;
      case 'sync-data':
        return ProcessorType.SYNC_DATA;
      case 'send-notification':
        return ProcessorType.NOTIFICATION_SEND;
      case 'process-analytics-event':
        return ProcessorType.ANALYTICS_PROCESS;
      default:
        return ProcessorType.EMAIL_SEND; // Default fallback
    }
  }

  private mapBullStatusToJobStatus(bullStatus: string): JobStatus {
    switch (bullStatus) {
      case 'waiting':
        return JobStatus.WAITING;
      case 'active':
        return JobStatus.ACTIVE;
      case 'completed':
        return JobStatus.COMPLETED;
      case 'failed':
        return JobStatus.FAILED;
      case 'delayed':
        return JobStatus.DELAYED;
      case 'paused':
        return JobStatus.PAUSED;
      case 'stuck':
        return JobStatus.STUCK;
      default:
        return JobStatus.WAITING;
    }
  }
}