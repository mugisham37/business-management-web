import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { HealthAlertService } from '../services/health-alert.service';
import { HealthNotificationService } from '../services/health-notification.service';
import { HealthAlert, HealthSeverity } from '../types/health.types';

interface AlertNotificationJobData {
  alertId: string;
  channels?: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface BulkAlertJobData {
  alertIds: string[];
  action: 'resolve' | 'escalate' | 'notify';
}

@Processor('health-alert')
export class HealthAlertProcessor {
  private readonly logger = new Logger(HealthAlertProcessor.name);

  constructor(
    private readonly alertService: HealthAlertService,
    private readonly notificationService: HealthNotificationService,
  ) {}

  @Process('send-notification')
  async processSendNotification(job: Job<AlertNotificationJobData>) {
    const { alertId, channels = [], priority = 'medium' } = job.data;
    
    this.logger.log(`Processing alert notification: ${alertId}`, {
      jobId: job.id,
      channels,
      priority,
    });

    try {
      const alert = await this.alertService.getAlert(alertId);
      if (!alert) {
        throw new Error(`Alert not found: ${alertId}`);
      }

      // Update job progress
      await job.progress(20);

      // Get notification channels if not specified
      const notificationChannels = channels.length > 0 
        ? channels 
        : await this.getDefaultChannelsForSeverity(alert.severity);

      await job.progress(40);

      // Send notifications to each channel
      const results = [];
      for (let i = 0; i < notificationChannels.length; i++) {
        const channel = notificationChannels[i];
        
        try {
          await this.notificationService.sendNotification(channel, alert);
          results.push({ channel, success: true });
          
          this.logger.log(`Notification sent successfully: ${channel}`, {
            alertId,
            jobId: job.id,
          });
        } catch (error) {
          results.push({ 
            channel, 
            success: false, 
            error: error.message 
          });
          
          this.logger.error(`Notification failed: ${channel}`, {
            alertId,
            jobId: job.id,
            error: error.message,
          });
        }

        // Update progress
        const progress = 40 + Math.round(((i + 1) / notificationChannels.length) * 60);
        await job.progress(progress);
      }

      this.logger.log(`Alert notification processing completed: ${alertId}`, {
        jobId: job.id,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      });

      return {
        alertId,
        results,
        completedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Alert notification processing failed: ${alertId}`, {
        jobId: job.id,
        error: error.message,
      });

      throw error;
    }
  }

  @Process('escalate-alert')
  async processEscalateAlert(job: Job<{ alertId: string; escalationLevel: number }>) {
    const { alertId, escalationLevel } = job.data;
    
    this.logger.log(`Processing alert escalation: ${alertId}`, {
      jobId: job.id,
      escalationLevel,
    });

    try {
      const alert = await this.alertService.getAlert(alertId);
      if (!alert) {
        throw new Error(`Alert not found: ${alertId}`);
      }

      await job.progress(25);

      // Determine escalation channels based on level
      const escalationChannels = this.getEscalationChannels(escalationLevel);
      
      await job.progress(50);

      // Send escalation notifications
      for (const channel of escalationChannels) {
        try {
          const escalationAlert = {
            ...alert,
            message: `ESCALATED (Level ${escalationLevel}): ${alert.message}`,
            severity: this.getEscalatedSeverity(alert.severity, escalationLevel),
          };

          await this.notificationService.sendNotification(channel, escalationAlert);
          
          this.logger.log(`Escalation notification sent: ${channel}`, {
            alertId,
            escalationLevel,
            jobId: job.id,
          });
        } catch (error) {
          this.logger.error(`Escalation notification failed: ${channel}`, {
            alertId,
            escalationLevel,
            jobId: job.id,
            error: error.message,
          });
        }
      }

      await job.progress(100);

      return {
        alertId,
        escalationLevel,
        escalatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Alert escalation failed: ${alertId}`, {
        jobId: job.id,
        error: error.message,
      });

      throw error;
    }
  }

  @Process('bulk-alert-action')
  async processBulkAlertAction(job: Job<BulkAlertJobData>) {
    const { alertIds, action } = job.data;
    
    this.logger.log(`Processing bulk alert action: ${action}`, {
      jobId: job.id,
      alertCount: alertIds.length,
    });

    const results = [];
    const errors = [];

    try {
      for (let i = 0; i < alertIds.length; i++) {
        const alertId = alertIds[i];
        
        try {
          let result;
          
          switch (action) {
            case 'resolve':
              result = await this.alertService.resolveAlert(alertId);
              break;
            case 'escalate':
              // Add escalation job
              result = { alertId, action: 'escalation_queued' };
              break;
            case 'notify':
              // Add notification job
              result = { alertId, action: 'notification_queued' };
              break;
            default:
              throw new Error(`Unknown action: ${action}`);
          }
          
          results.push({ alertId, success: true, result });
          
          // Update progress
          const progress = Math.round(((i + 1) / alertIds.length) * 100);
          await job.progress(progress);
        } catch (error) {
          errors.push({
            alertId,
            error: error.message,
          });
          
          this.logger.error(`Bulk action failed for alert: ${alertId}`, {
            action,
            error: error.message,
          });
        }
      }

      this.logger.log(`Bulk alert action completed: ${action}`, {
        jobId: job.id,
        successful: results.length,
        failed: errors.length,
      });

      return {
        action,
        successful: results,
        failed: errors,
        completedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(`Bulk alert action failed: ${action}`, {
        jobId: job.id,
        error: error.message,
      });

      throw error;
    }
  }

  @Process('cleanup-resolved-alerts')
  async processCleanupResolvedAlerts(job: Job) {
    this.logger.log('Processing resolved alerts cleanup', { jobId: job.id });

    try {
      // This would typically clean up old resolved alerts
      // The actual cleanup is handled by the alert service's scheduled cleanup
      
      await job.progress(50);
      
      this.logger.log('Resolved alerts cleanup completed', { jobId: job.id });
      
      await job.progress(100);

      return {
        cleanupType: 'resolved-alerts',
        completedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Resolved alerts cleanup failed:', {
        jobId: job.id,
        error: error.message,
      });

      throw error;
    }
  }

  @Process('alert-digest')
  async processAlertDigest(job: Job<{ period: 'hourly' | 'daily' | 'weekly' }>) {
    const { period } = job.data;
    
    this.logger.log(`Processing alert digest: ${period}`, { jobId: job.id });

    try {
      await job.progress(20);
      
      // Get alerts for the specified period
      const hours = this.getPeriodHours(period);
      const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);
      
      const alerts = await this.alertService.getAlerts({
        startDate: startDate.toISOString(),
      });

      await job.progress(50);
      
      // Generate digest
      const digest = {
        period,
        generatedAt: new Date(),
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter(a => a.severity === HealthSeverity.CRITICAL).length,
        highAlerts: alerts.filter(a => a.severity === HealthSeverity.HIGH).length,
        mediumAlerts: alerts.filter(a => a.severity === HealthSeverity.MEDIUM).length,
        lowAlerts: alerts.filter(a => a.severity === HealthSeverity.LOW).length,
        activeAlerts: alerts.filter(a => a.isActive).length,
        resolvedAlerts: alerts.filter(a => !a.isActive).length,
      };

      await job.progress(80);
      
      // In a real implementation, you would send this digest via email or save to file
      this.logger.log(`Alert digest generated: ${period}`, {
        jobId: job.id,
        totalAlerts: digest.totalAlerts,
        criticalAlerts: digest.criticalAlerts,
      });

      await job.progress(100);

      return digest;
    } catch (error) {
      this.logger.error(`Alert digest generation failed: ${period}`, {
        jobId: job.id,
        error: error.message,
      });

      throw error;
    }
  }

  private async getDefaultChannelsForSeverity(severity: HealthSeverity): Promise<string[]> {
    const channelMap = {
      [HealthSeverity.CRITICAL]: ['email', 'slack', 'sms'],
      [HealthSeverity.HIGH]: ['email', 'slack'],
      [HealthSeverity.MEDIUM]: ['slack'],
      [HealthSeverity.LOW]: ['slack'],
      [HealthSeverity.INFO]: ['slack'],
    };

    return channelMap[severity] || ['slack'];
  }

  private getEscalationChannels(escalationLevel: number): string[] {
    const escalationMap = {
      1: ['email'],
      2: ['email', 'slack'],
      3: ['email', 'slack', 'sms'],
      4: ['email', 'slack', 'sms', 'teams'],
    };

    return escalationMap[escalationLevel] || ['email', 'slack'];
  }

  private getEscalatedSeverity(originalSeverity: HealthSeverity, escalationLevel: number): HealthSeverity {
    if (escalationLevel >= 3) {
      return HealthSeverity.CRITICAL;
    }
    if (escalationLevel >= 2) {
      return HealthSeverity.HIGH;
    }
    return originalSeverity;
  }

  private getPeriodHours(period: 'hourly' | 'daily' | 'weekly'): number {
    const periodMap = {
      hourly: 1,
      daily: 24,
      weekly: 168,
    };

    return periodMap[period];
  }
}