import { Injectable, Logger } from '@nestjs/common';
import { CommunicationIntegrationService } from '../services/communication-integration.service';
import { SlackIntegrationService } from '../services/slack-integration.service';
import { TeamsIntegrationService } from '../services/teams-integration.service';

@Injectable()
export class SystemCommunicationIntegrationService {
  private readonly logger = new Logger(SystemCommunicationIntegrationService.name);

  constructor(
    private readonly communicationService: CommunicationIntegrationService,
    private readonly slackService: SlackIntegrationService,
    private readonly teamsService: TeamsIntegrationService,
  ) {}

  /**
   * Send system error alert
   */
  async sendSystemErrorAlert(
    tenantId: string,
    errorDetails: {
      errorId: string;
      service: string;
      message: string;
      stackTrace?: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      affectedUsers?: number;
      timestamp: Date;
      environment: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending system error alert ${errorDetails.errorId}`);

      const severity = errorDetails.severity === 'critical' || errorDetails.severity === 'high' 
        ? 'critical' 
        : errorDetails.severity === 'medium' 
        ? 'error' 
        : 'warning';

      await this.communicationService.sendAlert(tenantId, {
        title: `System Error - ${errorDetails.service}`,
        message: errorDetails.message,
        severity,
        metadata: {
          errorId: errorDetails.errorId,
          service: errorDetails.service,
          stackTrace: errorDetails.stackTrace,
          affectedUsers: errorDetails.affectedUsers,
          timestamp: errorDetails.timestamp,
          environment: errorDetails.environment,
        },
        actionUrl: `${process.env.ADMIN_URL}/errors/${errorDetails.errorId}`,
        actionLabel: 'View Error Details',
        recipients: {
          roles: ['system_admin', 'devops', 'on_call_engineer'],
        },
      });

      // Send to Slack for immediate attention if critical
      if (errorDetails.severity === 'critical') {
        await this.slackService.sendAlert(tenantId, {
          title: `🚨 CRITICAL ERROR - ${errorDetails.service}`,
          message: errorDetails.message,
          severity: 'critical',
          channel: '#alerts',
          mentionChannel: true,
          metadata: {
            errorId: errorDetails.errorId,
            environment: errorDetails.environment,
            affectedUsers: errorDetails.affectedUsers,
          },
        });
      }

      this.logger.log(`System error alert sent successfully for error ${errorDetails.errorId}`);
    } catch (error) {
      this.logger.error(`Failed to send system error alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send performance degradation alert
   */
  async sendPerformanceAlert(
    tenantId: string,
    performanceDetails: {
      service: string;
      metric: string;
      currentValue: number;
      threshold: number;
      unit: string;
      duration: number; // in minutes
      severity: 'warning' | 'critical';
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending performance alert for ${performanceDetails.service}`);

      await this.communicationService.sendAlert(tenantId, {
        title: `Performance Alert - ${performanceDetails.service}`,
        message: `${performanceDetails.metric} is ${performanceDetails.currentValue}${performanceDetails.unit} (threshold: ${performanceDetails.threshold}${performanceDetails.unit}) for ${performanceDetails.duration} minutes`,
        severity: performanceDetails.severity === 'critical' ? 'error' : 'warning',
        metadata: {
          service: performanceDetails.service,
          metric: performanceDetails.metric,
          currentValue: performanceDetails.currentValue,
          threshold: performanceDetails.threshold,
          unit: performanceDetails.unit,
          duration: performanceDetails.duration,
        },
        actionUrl: `${process.env.ADMIN_URL}/monitoring/${performanceDetails.service}`,
        actionLabel: 'View Metrics',
        recipients: {
          roles: ['system_admin', 'devops', 'performance_engineer'],
        },
      });

      this.logger.log(`Performance alert sent successfully for ${performanceDetails.service}`);
    } catch (error) {
      this.logger.error(`Failed to send performance alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send backup completion notification
   */
  async sendBackupNotification(
    tenantId: string,
    backupDetails: {
      backupId: string;
      type: 'database' | 'files' | 'full_system';
      status: 'success' | 'failed' | 'partial';
      startTime: Date;
      endTime: Date;
      size?: number; // in bytes
      location?: string;
      errorMessage?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending backup notification for backup ${backupDetails.backupId}`);

      const duration = Math.round((backupDetails.endTime.getTime() - backupDetails.startTime.getTime()) / (1000 * 60));
      const sizeFormatted = backupDetails.size ? this.formatBytes(backupDetails.size) : 'Unknown';

      const severity = backupDetails.status === 'failed' ? 'error' : 
                      backupDetails.status === 'partial' ? 'warning' : 'info';

      await this.slackService.sendNotification(tenantId, {
        title: `Backup ${backupDetails.status.toUpperCase()} - ${backupDetails.type}`,
        message: `Backup ${backupDetails.backupId} completed with status: ${backupDetails.status}`,
        priority: backupDetails.status === 'failed' ? 'high' : 'medium',
        type: 'backup_notification',
        channel: '#operations',
        metadata: {
          backupId: backupDetails.backupId,
          type: backupDetails.type,
          status: backupDetails.status,
          duration: `${duration} minutes`,
          size: sizeFormatted,
          location: backupDetails.location,
          errorMessage: backupDetails.errorMessage,
        },
      });

      this.logger.log(`Backup notification sent successfully for backup ${backupDetails.backupId}`);
    } catch (error) {
      this.logger.error(`Failed to send backup notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send deployment notification
   */
  async sendDeploymentNotification(
    tenantId: string,
    deploymentDetails: {
      deploymentId: string;
      service: string;
      version: string;
      environment: string;
      status: 'started' | 'success' | 'failed' | 'rolled_back';
      deployedBy: string;
      startTime: Date;
      endTime?: Date;
      changes?: string[];
      errorMessage?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending deployment notification for ${deploymentDetails.deploymentId}`);

      const statusEmojis = {
        started: '🚀',
        success: '✅',
        failed: '❌',
        rolled_back: '🔄',
      };

      const duration = deploymentDetails.endTime 
        ? Math.round((deploymentDetails.endTime.getTime() - deploymentDetails.startTime.getTime()) / (1000 * 60))
        : null;

      await this.slackService.sendNotification(tenantId, {
        title: `${statusEmojis[deploymentDetails.status]} Deployment ${deploymentDetails.status.toUpperCase()}`,
        message: `${deploymentDetails.service} v${deploymentDetails.version} deployment to ${deploymentDetails.environment}`,
        priority: deploymentDetails.status === 'failed' ? 'high' : 'medium',
        type: 'deployment_notification',
        channel: '#deployments',
        metadata: {
          deploymentId: deploymentDetails.deploymentId,
          service: deploymentDetails.service,
          version: deploymentDetails.version,
          environment: deploymentDetails.environment,
          status: deploymentDetails.status,
          deployedBy: deploymentDetails.deployedBy,
          duration: duration ? `${duration} minutes` : 'In progress',
          changes: deploymentDetails.changes,
          errorMessage: deploymentDetails.errorMessage,
        },
      });

      this.logger.log(`Deployment notification sent successfully for ${deploymentDetails.deploymentId}`);
    } catch (error) {
      this.logger.error(`Failed to send deployment notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send security incident alert
   */
  async sendSecurityIncidentAlert(
    tenantId: string,
    incidentDetails: {
      incidentId: string;
      type: 'unauthorized_access' | 'data_breach' | 'malware' | 'ddos' | 'suspicious_activity';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      affectedSystems: string[];
      sourceIP?: string;
      detectedAt: Date;
      status: 'detected' | 'investigating' | 'contained' | 'resolved';
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending security incident alert ${incidentDetails.incidentId}`);

      await this.communicationService.sendAlert(tenantId, {
        title: `🔒 Security Incident - ${incidentDetails.type.replace('_', ' ').toUpperCase()}`,
        message: incidentDetails.description,
        severity: incidentDetails.severity === 'critical' || incidentDetails.severity === 'high' 
          ? 'critical' 
          : 'error',
        metadata: {
          incidentId: incidentDetails.incidentId,
          type: incidentDetails.type,
          severity: incidentDetails.severity,
          affectedSystems: incidentDetails.affectedSystems,
          sourceIP: incidentDetails.sourceIP,
          detectedAt: incidentDetails.detectedAt,
          status: incidentDetails.status,
        },
        actionUrl: `${process.env.ADMIN_URL}/security/incidents/${incidentDetails.incidentId}`,
        actionLabel: 'View Incident',
        recipients: {
          roles: ['security_admin', 'incident_response', 'system_admin'],
        },
      });

      // Send immediate Slack alert for high/critical incidents
      if (incidentDetails.severity === 'critical' || incidentDetails.severity === 'high') {
        await this.slackService.sendAlert(tenantId, {
          title: `🚨 SECURITY INCIDENT - ${incidentDetails.type.replace('_', ' ').toUpperCase()}`,
          message: incidentDetails.description,
          severity: 'critical',
          channel: '#security-alerts',
          mentionChannel: true,
          metadata: {
            incidentId: incidentDetails.incidentId,
            severity: incidentDetails.severity,
            affectedSystems: incidentDetails.affectedSystems.join(', '),
            sourceIP: incidentDetails.sourceIP,
          },
        });
      }

      this.logger.log(`Security incident alert sent successfully for ${incidentDetails.incidentId}`);
    } catch (error) {
      this.logger.error(`Failed to send security incident alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send system health report
   */
  async sendSystemHealthReport(
    tenantId: string,
    healthData: {
      reportId: string;
      period: string;
      overallStatus: 'healthy' | 'degraded' | 'critical';
      services: Array<{
        name: string;
        status: 'up' | 'down' | 'degraded';
        uptime: number; // percentage
        responseTime: number; // ms
        errorRate: number; // percentage
      }>;
      metrics: {
        totalRequests: number;
        averageResponseTime: number;
        errorRate: number;
        uptime: number;
      };
      incidents: number;
      generatedAt: Date;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending system health report ${healthData.reportId}`);

      const statusEmojis = {
        healthy: '🟢',
        degraded: '🟡',
        critical: '🔴',
      };

      await this.teamsService.sendRichCard(tenantId, {
        title: `${statusEmojis[healthData.overallStatus]} System Health Report - ${healthData.period}`,
        summary: `System health report for ${healthData.period}`,
        themeColor: healthData.overallStatus === 'healthy' ? '00B294' : 
                   healthData.overallStatus === 'degraded' ? 'FF8C00' : 'FF0000',
        sections: [
          {
            title: 'Overall Metrics',
            facts: [
              { name: 'Status', value: healthData.overallStatus.toUpperCase() },
              { name: 'Total Requests', value: healthData.metrics.totalRequests.toLocaleString() },
              { name: 'Average Response Time', value: `${healthData.metrics.averageResponseTime}ms` },
              { name: 'Error Rate', value: `${healthData.metrics.errorRate.toFixed(2)}%` },
              { name: 'Uptime', value: `${healthData.metrics.uptime.toFixed(2)}%` },
              { name: 'Incidents', value: healthData.incidents.toString() },
            ],
          },
          {
            title: 'Service Status',
            text: healthData.services.map(service => 
              `**${service.name}**: ${service.status.toUpperCase()} (${service.uptime.toFixed(1)}% uptime, ${service.responseTime}ms avg)`
            ).join('\n'),
          },
        ],
        actions: [
          {
            type: 'OpenUri',
            name: 'View Dashboard',
            url: `${process.env.ADMIN_URL}/monitoring/dashboard`,
          },
        ],
      });

      this.logger.log(`System health report sent successfully for ${healthData.reportId}`);
    } catch (error) {
      this.logger.error(`Failed to send system health report: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send capacity planning alert
   */
  async sendCapacityAlert(
    tenantId: string,
    capacityDetails: {
      resource: string;
      currentUsage: number;
      capacity: number;
      unit: string;
      threshold: number; // percentage
      projectedFullDate?: Date;
      recommendations?: string[];
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending capacity alert for ${capacityDetails.resource}`);

      const usagePercentage = (capacityDetails.currentUsage / capacityDetails.capacity) * 100;
      const severity = usagePercentage >= 90 ? 'critical' : 
                      usagePercentage >= 80 ? 'error' : 'warning';

      await this.communicationService.sendAlert(tenantId, {
        title: `Capacity Alert - ${capacityDetails.resource}`,
        message: `${capacityDetails.resource} usage is at ${usagePercentage.toFixed(1)}% (${capacityDetails.currentUsage}/${capacityDetails.capacity} ${capacityDetails.unit})`,
        severity,
        metadata: {
          resource: capacityDetails.resource,
          currentUsage: capacityDetails.currentUsage,
          capacity: capacityDetails.capacity,
          unit: capacityDetails.unit,
          usagePercentage: usagePercentage.toFixed(1),
          threshold: capacityDetails.threshold,
          projectedFullDate: capacityDetails.projectedFullDate,
          recommendations: capacityDetails.recommendations,
        },
        actionUrl: `${process.env.ADMIN_URL}/capacity/${capacityDetails.resource}`,
        actionLabel: 'View Capacity Details',
        recipients: {
          roles: ['system_admin', 'capacity_planner', 'infrastructure_team'],
        },
      });

      this.logger.log(`Capacity alert sent successfully for ${capacityDetails.resource}`);
    } catch (error) {
      this.logger.error(`Failed to send capacity alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Helper method to format bytes
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}