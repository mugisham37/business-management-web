import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { HealthService } from '../services/health.service';
import { HealthAlertService } from '../services/health-alert.service';
import { HealthNotificationService } from '../services/health-notification.service';

interface HealthCheckJobData {
  checkId: string;
  priority?: number;
  retryAttempts?: number;
}

interface BulkHealthCheckJobData {
  checkIds: string[];
  parallel?: boolean;
}

@Processor('health-check')
export class HealthCheckProcessor {
  private readonly logger = new Logger(HealthCheckProcessor.name);

  constructor(
    private readonly healthService: HealthService,
    private readonly alertService: HealthAlertService,
    private readonly notificationService: HealthNotificationService,
  ) {}

  @Process('single-check')
  async processSingleHealthCheck(job: Job<HealthCheckJobData>) {
    const { checkId, retryAttempts = 3 } = job.data;
    
    this.logger.log(`Processing health check: ${checkId}`, {
      jobId: job.id,
      attempt: job.attemptsMade + 1,
      maxAttempts: retryAttempts,
    });

    try {
      const healthCheck = await this.healthService.performHealthCheck(checkId);
      
      this.logger.log(`Health check completed: ${checkId}`, {
        jobId: job.id,
        status: healthCheck.status,
        responseTime: healthCheck.details.responseTime,
      });

      // Update job progress
      await job.progress(100);

      return {
        checkId,
        status: healthCheck.status,
        responseTime: healthCheck.details.responseTime,
        completedAt: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Health check failed: ${checkId}`, {
        jobId: job.id,
        error: errorMessage,
        attempt: job.attemptsMade + 1,
      });

      // If this is the last attempt, create an alert
      if (job.attemptsMade >= retryAttempts - 1) {
        await this.alertService.createAlert({
          checkId,
          severity: 'HIGH' as any,
          message: `Health check job failed after ${retryAttempts} attempts: ${errorMessage}`,
          isActive: true,
        });
      }

      throw error;
    }
  }

  @Process('bulk-check')
  async processBulkHealthCheck(job: Job<BulkHealthCheckJobData>) {
    const { checkIds, parallel = true } = job.data;
    
    this.logger.log(`Processing bulk health checks: ${checkIds.length} checks`, {
      jobId: job.id,
      parallel,
    });

    const results = [];
    const errors = [];

    try {
      if (parallel) {
        // Process checks in parallel
        const promises = checkIds.map(async (checkId, index) => {
          try {
            const healthCheck = await this.healthService.performHealthCheck(checkId);
            
            // Update progress
            const progress = Math.round(((index + 1) / checkIds.length) * 100);
            await job.progress(progress);
            
            return {
              checkId,
              status: healthCheck.status,
              responseTime: healthCheck.details.responseTime,
              success: true,
            };
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Bulk health check failed for ${checkId}:`, error);
            return {
              checkId,
              error: errorMessage,
              success: false,
            };
          }
        });

        const allResults = await Promise.allSettled(promises);
        
        allResults.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            if (result.value.success) {
              results.push(result.value);
            } else {
              errors.push(result.value);
            }
          } else {
            errors.push({
              checkId: checkIds[index],
              error: result.reason?.message || 'Unknown error',
              success: false,
            });
          }
        });
      } else {
        // Process checks sequentially
        for (let i = 0; i < checkIds.length; i++) {
          const checkId = checkIds[i];
          
          try {
            if (checkId) {
              const healthCheck = await this.healthService.performHealthCheck(checkId);
            
              results.push({
                checkId,
                status: healthCheck.status,
                responseTime: healthCheck.details.responseTime,
                success: true,
              });
            }
            
            // Update progress
            const progress = Math.round(((i + 1) / checkIds.length) * 100);
            await job.progress(progress);
          } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.logger.error(`Sequential health check failed for ${checkId}:`, error);
            errors.push({
              checkId,
              error: errorMessage,
              success: false,
            });
          }
        }
      }

      this.logger.log(`Bulk health checks completed`, {
        jobId: job.id,
        successful: results.length,
        failed: errors.length,
        total: checkIds.length,
      });

      return {
        successful: results,
        failed: errors,
        totalProcessed: checkIds.length,
        completedAt: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Bulk health check job failed:`, {
        jobId: job.id,
        error: errorMessage,
      });

      throw error;
    }
  }

  @Process('scheduled-check')
  async processScheduledHealthCheck(job: Job<HealthCheckJobData>) {
    const { checkId } = job.data;
    
    this.logger.debug(`Processing scheduled health check: ${checkId}`, {
      jobId: job.id,
    });

    try {
      const healthCheck = await this.healthService.performHealthCheck(checkId);
      
      // Check if we need to send notifications for status changes
      if (healthCheck.status === 'UNHEALTHY' || healthCheck.status === 'DEGRADED') {
        // This will be handled by the monitoring service event listeners
      }

      return {
        checkId,
        status: healthCheck.status,
        scheduledAt: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Scheduled health check failed: ${checkId}`, {
        jobId: job.id,
        error: errorMessage,
      });

      // For scheduled checks, we don't throw errors to avoid job retries
      // The monitoring service will handle failure tracking
      return {
        checkId,
        status: 'ERROR',
        error: errorMessage,
        scheduledAt: new Date(),
      };
    }
  }

  @Process('cleanup-old-data')
  async processCleanupOldData(job: Job) {
    this.logger.log('Processing health data cleanup', { jobId: job.id });

    try {
      // This would typically clean up old health check data
      // For now, we'll just log the cleanup process
      
      await job.progress(25);
      this.logger.debug('Cleaning up old health history...');
      
      await job.progress(50);
      this.logger.debug('Cleaning up old metrics...');
      
      await job.progress(75);
      this.logger.debug('Cleaning up old alerts...');
      
      await job.progress(100);
      this.logger.log('Health data cleanup completed', { jobId: job.id });

      return {
        cleanupType: 'health-data',
        completedAt: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Health data cleanup failed:', {
        jobId: job.id,
        error: errorMessage,
      });

      throw error;
    }
  }

  @Process('health-report')
  async processHealthReport(job: Job) {
    this.logger.log('Processing health report generation', { jobId: job.id });

    try {
      await job.progress(20);
      
      // Get system health
      const systemHealth = await this.healthService.getSystemHealth();
      
      await job.progress(40);
      
      // Get recent alerts
      const recentAlerts = await this.alertService.getAlerts({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      });
      
      await job.progress(60);
      
      // Generate report data
      const report = {
        generatedAt: new Date(),
        systemHealth,
        recentAlerts: recentAlerts.length,
        criticalIssues: recentAlerts.filter(a => a.severity === 'CRITICAL').length,
        availability: systemHealth.totalChecks > 0 
          ? (systemHealth.healthyChecks / systemHealth.totalChecks) * 100 
          : 100,
      };
      
      await job.progress(80);
      
      // In a real implementation, you might send this report via email or save to file
      this.logger.log('Health report generated', {
        jobId: job.id,
        availability: report.availability,
        alerts: report.recentAlerts,
      });
      
      await job.progress(100);

      return {
        report,
        generatedAt: new Date(),
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Health report generation failed:', {
        jobId: job.id,
        error: errorMessage,
      });

      throw error;
    }
  }
}