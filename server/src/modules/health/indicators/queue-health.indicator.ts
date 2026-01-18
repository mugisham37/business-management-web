import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { HealthStatus, HealthDetails, HealthMetric } from '../types/health.types';
import { QueueService } from '../../queue/queue.service';

@Injectable()
export class QueueHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(QueueHealthIndicator.name);

  constructor(private readonly queueService: QueueService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const queueStats = await this.getQueueStats();
      const isHealthy = this.checkQueueHealth(queueStats);
      
      const result = this.getStatus(key, isHealthy, {
        queue: 'bull',
        status: isHealthy ? 'healthy' : 'unhealthy',
        stats: queueStats,
      });

      if (isHealthy) {
        return result;
      }
      
      throw new HealthCheckError('Queue health check failed', result);
    } catch (error) {
      throw new HealthCheckError('Queue health check failed', this.getStatus(key, false, {
        queue: 'bull',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }

  async performCheck(): Promise<{ status: HealthStatus; details: HealthDetails }> {
    const startTime = Date.now();
    
    try {
      // Get queue statistics
      const queueStats = await this.getQueueStats();
      
      // Test queue connectivity
      const connectivityStartTime = Date.now();
      await this.testQueueConnectivity();
      const connectivityTime = Date.now() - connectivityStartTime;
      
      // Test job processing
      const jobProcessingStartTime = Date.now();
      await this.testJobProcessing();
      const jobProcessingTime = Date.now() - jobProcessingStartTime;
      
      // Get worker statistics
      const workerStats = await this.getWorkerStats();
      
      const responseTime = Date.now() - startTime;
      
      const metrics: HealthMetric[] = [
        {
          name: 'active_jobs',
          value: queueStats.active.toString(),
          unit: 'count',
          threshold: 1000,
          withinThreshold: queueStats.active < 1000,
        },
        {
          name: 'waiting_jobs',
          value: queueStats.waiting.toString(),
          unit: 'count',
          threshold: 5000,
          withinThreshold: queueStats.waiting < 5000,
        },
        {
          name: 'completed_jobs',
          value: queueStats.completed.toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'failed_jobs',
          value: queueStats.failed.toString(),
          unit: 'count',
          threshold: 100,
          withinThreshold: queueStats.failed < 100,
        },
        {
          name: 'delayed_jobs',
          value: queueStats.delayed.toString(),
          unit: 'count',
          threshold: 1000,
          withinThreshold: queueStats.delayed < 1000,
        },
        {
          name: 'paused_jobs',
          value: queueStats.paused.toString(),
          unit: 'count',
          threshold: 10,
          withinThreshold: queueStats.paused < 10,
        },
        {
          name: 'queue_connectivity_time',
          value: connectivityTime.toString(),
          unit: 'ms',
          threshold: 1000,
          withinThreshold: connectivityTime < 1000,
        },
        {
          name: 'job_processing_time',
          value: jobProcessingTime.toString(),
          unit: 'ms',
          threshold: 5000,
          withinThreshold: jobProcessingTime < 5000,
        },
        {
          name: 'active_workers',
          value: workerStats.active.toString(),
          unit: 'count',
          threshold: 1,
          withinThreshold: workerStats.active >= 1,
        },
        {
          name: 'total_workers',
          value: workerStats.total.toString(),
          unit: 'count',
          withinThreshold: true,
        },
        {
          name: 'job_throughput',
          value: await this.calculateJobThroughput(),
          unit: 'jobs/min',
          threshold: 1,
          withinThreshold: parseFloat(await this.calculateJobThroughput()) > 1,
        },
        {
          name: 'error_rate',
          value: this.calculateErrorRate(queueStats).toFixed(2),
          unit: '%',
          threshold: 5,
          withinThreshold: this.calculateErrorRate(queueStats) < 5,
        },
      ];

      const status = this.determineHealthStatus(metrics, queueStats);
      
      return {
        status,
        details: {
          metrics,
          timestamp: new Date(),
          responseTime,
          message: status === HealthStatus.HEALTHY ? 'Queue system is healthy' : 'Queue system has issues',
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.logger.error('Queue health check failed:', error);
      
      return {
        status: HealthStatus.UNHEALTHY,
        details: {
          metrics: [],
          timestamp: new Date(),
          responseTime,
          error: error instanceof Error ? error.message : 'Unknown queue error',
          message: 'Queue health check failed',
        },
      };
    }
  }

  private async getQueueStats(): Promise<{
    active: number;
    waiting: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    try {
      // Get stats from all queues
      const queues = await this.queueService.getQueues();
      let totalStats = {
        active: 0,
        waiting: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: 0,
      };

      for (const queue of queues) {
        const stats = await queue.getJobCounts();
        totalStats.active += stats.active || 0;
        totalStats.waiting += stats.waiting || 0;
        totalStats.completed += stats.completed || 0;
        totalStats.failed += stats.failed || 0;
        totalStats.delayed += stats.delayed || 0;
        totalStats.paused += stats.paused || 0;
      }

      return totalStats;
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      return {
        active: 0,
        waiting: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        paused: 0,
      };
    }
  }

  private async testQueueConnectivity(): Promise<void> {
    try {
      // Test basic queue connectivity by checking if we can get queue info
      const queues = await this.queueService.getQueues();
      if (queues.length === 0) {
        throw new Error('No queues available');
      }

      // Test if we can access the first queue
      const firstQueue = queues[0];
      await firstQueue.getJobCounts();
    } catch (error) {
      throw new Error(`Queue connectivity test failed: ${error}`);
    }
  }

  private async testJobProcessing(): Promise<void> {
    try {
      // Add a test job to verify job processing capability
      const testJobData = {
        type: 'health_check',
        timestamp: Date.now(),
        data: 'health_check_test',
      };

      const job = await this.queueService.addJob('health-check', testJobData, {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
      });

      // Wait a short time to see if the job gets processed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check job status
      const jobState = await job.getState();
      if (jobState === 'failed') {
        const failedReason = job.failedReason;
        throw new Error(`Test job failed: ${failedReason}`);
      }

      // Job processing test passed if job is not stuck in waiting
      if (jobState === 'waiting') {
        this.logger.warn('Test job is still waiting - workers may be slow');
      }
    } catch (error) {
      throw new Error(`Job processing test failed: ${error}`);
    }
  }

  private async getWorkerStats(): Promise<{
    active: number;
    total: number;
  }> {
    try {
      const queues = await this.queueService.getQueues();
      let activeWorkers = 0;
      let totalWorkers = 0;

      for (const queue of queues) {
        const workers = await queue.getWorkers();
        totalWorkers += workers.length;
        
        // Count active workers (simplified - in real implementation you'd check worker status)
        activeWorkers += workers.filter(worker => worker.id).length;
      }

      return {
        active: activeWorkers,
        total: totalWorkers,
      };
    } catch (error) {
      this.logger.error('Failed to get worker stats:', error);
      return {
        active: 0,
        total: 0,
      };
    }
  }

  private async calculateJobThroughput(): Promise<string> {
    try {
      // Calculate jobs processed in the last minute
      const queues = await this.queueService.getQueues();
      let totalThroughput = 0;

      for (const queue of queues) {
        // Get completed jobs from the last minute
        const oneMinuteAgo = Date.now() - 60000;
        const completedJobs = await queue.getJobs(['completed'], 0, -1);
        
        const recentJobs = completedJobs.filter(job => 
          job.finishedOn && job.finishedOn > oneMinuteAgo
        );
        
        totalThroughput += recentJobs.length;
      }

      return totalThroughput.toString();
    } catch (error) {
      this.logger.error('Failed to calculate job throughput:', error);
      return '0';
    }
  }

  private calculateErrorRate(queueStats: any): number {
    const totalJobs = queueStats.completed + queueStats.failed;
    if (totalJobs === 0) return 0;
    
    return (queueStats.failed / totalJobs) * 100;
  }

  private checkQueueHealth(queueStats: any): boolean {
    // Consider unhealthy if too many jobs are waiting or failed
    const waitingThreshold = 5000;
    const failedThreshold = 100;
    const errorRateThreshold = 10; // 10%

    if (queueStats.waiting > waitingThreshold) return false;
    if (queueStats.failed > failedThreshold) return false;
    if (this.calculateErrorRate(queueStats) > errorRateThreshold) return false;

    return true;
  }

  private determineHealthStatus(metrics: HealthMetric[], queueStats: any): HealthStatus {
    const criticalIssues = metrics.filter(m => 
      !m.withinThreshold && 
      (m.name === 'active_workers' || m.name === 'queue_connectivity_time')
    );

    const warningIssues = metrics.filter(m => !m.withinThreshold);

    if (criticalIssues.length > 0) {
      return HealthStatus.UNHEALTHY;
    }

    if (warningIssues.length > 3) {
      return HealthStatus.DEGRADED;
    }

    // Check for high error rate
    if (this.calculateErrorRate(queueStats) > 5) {
      return HealthStatus.DEGRADED;
    }

    return HealthStatus.HEALTHY;
  }

  async getQueueHealthStats(): Promise<{
    totalJobs: number;
    activeJobs: number;
    waitingJobs: number;
    failedJobs: number;
    completedJobs: number;
    errorRate: number;
    throughput: number;
    activeWorkers: number;
  }> {
    try {
      const queueStats = await this.getQueueStats();
      const workerStats = await this.getWorkerStats();
      const throughput = parseFloat(await this.calculateJobThroughput());
      const errorRate = this.calculateErrorRate(queueStats);

      return {
        totalJobs: queueStats.active + queueStats.waiting + queueStats.completed + queueStats.failed,
        activeJobs: queueStats.active,
        waitingJobs: queueStats.waiting,
        failedJobs: queueStats.failed,
        completedJobs: queueStats.completed,
        errorRate,
        throughput,
        activeWorkers: workerStats.active,
      };
    } catch (error) {
      this.logger.error('Failed to get queue health stats:', error);
      return {
        totalJobs: 0,
        activeJobs: 0,
        waitingJobs: 0,
        failedJobs: 0,
        completedJobs: 0,
        errorRate: 0,
        throughput: 0,
        activeWorkers: 0,
      };
    }
  }

  async clearFailedJobs(): Promise<number> {
    try {
      const queues = await this.queueService.getQueues();
      let clearedCount = 0;

      for (const queue of queues) {
        const failedJobs = await queue.getJobs(['failed'], 0, -1);
        
        for (const job of failedJobs) {
          await job.remove();
          clearedCount++;
        }
      }

      this.logger.log(`Cleared ${clearedCount} failed jobs`);
      return clearedCount;
    } catch (error) {
      this.logger.error('Failed to clear failed jobs:', error);
      return 0;
    }
  }

  async retryFailedJobs(): Promise<number> {
    try {
      const queues = await this.queueService.getQueues();
      let retriedCount = 0;

      for (const queue of queues) {
        const failedJobs = await queue.getJobs(['failed'], 0, -1);
        
        for (const job of failedJobs) {
          await job.retry();
          retriedCount++;
        }
      }

      this.logger.log(`Retried ${retriedCount} failed jobs`);
      return retriedCount;
    } catch (error) {
      this.logger.error('Failed to retry failed jobs:', error);
      return 0;
    }
  }

  async pauseAllQueues(): Promise<void> {
    try {
      const queues = await this.queueService.getQueues();
      
      for (const queue of queues) {
        await queue.pause();
      }

      this.logger.log('All queues paused');
    } catch (error) {
      this.logger.error('Failed to pause queues:', error);
      throw error;
    }
  }

  async resumeAllQueues(): Promise<void> {
    try {
      const queues = await this.queueService.getQueues();
      
      for (const queue of queues) {
        await queue.resume();
      }

      this.logger.log('All queues resumed');
    } catch (error) {
      this.logger.error('Failed to resume queues:', error);
      throw error;
    }
  }
}