import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HealthAlert, HealthSeverity } from '../types/health.types';
import { HealthNotificationConfigInput } from '../inputs/health.input';

interface NotificationChannel {
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms' | 'teams' | 'discord';
  config: Record<string, any>;
  enabled: boolean;
}

interface NotificationTemplate {
  channel: string;
  severity: HealthSeverity;
  template: string;
}

@Injectable()
export class HealthNotificationService {
  private readonly logger = new Logger(HealthNotificationService.name);
  private channels = new Map<string, NotificationChannel>();
  private templates = new Map<string, NotificationTemplate>();
  private notificationHistory: Array<{
    id: string;
    alertId: string;
    channel: string;
    timestamp: Date;
    success: boolean;
    error?: string;
  }> = [];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.initializeDefaultChannels();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultChannels(): void {
    // Email channel
    this.channels.set('email', {
      name: 'Email Notifications',
      type: 'email',
      config: {
        smtp: {
          host: process.env.SMTP_HOST || 'localhost',
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        },
        from: process.env.NOTIFICATION_FROM_EMAIL || 'health@system.com',
        to: process.env.NOTIFICATION_TO_EMAIL?.split(',') || [],
      },
      enabled: !!process.env.SMTP_HOST,
    });

    // Slack channel
    this.channels.set('slack', {
      name: 'Slack Notifications',
      type: 'slack',
      config: {
        webhookUrl: process.env.SLACK_WEBHOOK_URL,
        channel: process.env.SLACK_CHANNEL || '#alerts',
        username: process.env.SLACK_USERNAME || 'Health Monitor',
        iconEmoji: process.env.SLACK_ICON || ':warning:',
      },
      enabled: !!process.env.SLACK_WEBHOOK_URL,
    });

    // Webhook channel
    this.channels.set('webhook', {
      name: 'Generic Webhook',
      type: 'webhook',
      config: {
        url: process.env.WEBHOOK_URL,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.WEBHOOK_AUTH_HEADER,
        },
      },
      enabled: !!process.env.WEBHOOK_URL,
    });

    // Teams channel
    this.channels.set('teams', {
      name: 'Microsoft Teams',
      type: 'teams',
      config: {
        webhookUrl: process.env.TEAMS_WEBHOOK_URL,
      },
      enabled: !!process.env.TEAMS_WEBHOOK_URL,
    });
  }

  private initializeDefaultTemplates(): void {
    // Email templates
    this.templates.set('email_critical', {
      channel: 'email',
      severity: HealthSeverity.CRITICAL,
      template: `
        <h2>🚨 Critical Health Alert</h2>
        <p><strong>Check:</strong> {{checkName}}</p>
        <p><strong>Message:</strong> {{message}}</p>
        <p><strong>Severity:</strong> {{severity}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p><strong>Occurrences:</strong> {{occurrenceCount}}</p>
        <hr>
        <p>Please investigate immediately.</p>
      `,
    });

    this.templates.set('email_high', {
      channel: 'email',
      severity: HealthSeverity.HIGH,
      template: `
        <h2>⚠️ High Priority Health Alert</h2>
        <p><strong>Check:</strong> {{checkName}}</p>
        <p><strong>Message:</strong> {{message}}</p>
        <p><strong>Severity:</strong> {{severity}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
        <p><strong>Occurrences:</strong> {{occurrenceCount}}</p>
      `,
    });

    // Slack templates
    this.templates.set('slack_critical', {
      channel: 'slack',
      severity: HealthSeverity.CRITICAL,
      template: `
        {
          "text": "🚨 Critical Health Alert",
          "attachments": [
            {
              "color": "danger",
              "fields": [
                {
                  "title": "Check",
                  "value": "{{checkName}}",
                  "short": true
                },
                {
                  "title": "Severity",
                  "value": "{{severity}}",
                  "short": true
                },
                {
                  "title": "Message",
                  "value": "{{message}}",
                  "short": false
                },
                {
                  "title": "Occurrences",
                  "value": "{{occurrenceCount}}",
                  "short": true
                },
                {
                  "title": "Time",
                  "value": "{{timestamp}}",
                  "short": true
                }
              ]
            }
          ]
        }
      `,
    });

    this.templates.set('slack_high', {
      channel: 'slack',
      severity: HealthSeverity.HIGH,
      template: `
        {
          "text": "⚠️ High Priority Health Alert",
          "attachments": [
            {
              "color": "warning",
              "fields": [
                {
                  "title": "Check",
                  "value": "{{checkName}}",
                  "short": true
                },
                {
                  "title": "Message",
                  "value": "{{message}}",
                  "short": false
                }
              ]
            }
          ]
        }
      `,
    });

    // Teams templates
    this.templates.set('teams_critical', {
      channel: 'teams',
      severity: HealthSeverity.CRITICAL,
      template: `
        {
          "@type": "MessageCard",
          "@context": "http://schema.org/extensions",
          "themeColor": "FF0000",
          "summary": "Critical Health Alert",
          "sections": [{
            "activityTitle": "🚨 Critical Health Alert",
            "activitySubtitle": "{{checkName}}",
            "facts": [{
              "name": "Message",
              "value": "{{message}}"
            }, {
              "name": "Severity",
              "value": "{{severity}}"
            }, {
              "name": "Time",
              "value": "{{timestamp}}"
            }, {
              "name": "Occurrences",
              "value": "{{occurrenceCount}}"
            }]
          }]
        }
      `,
    });
  }

  async sendNotification(
    channelName: string, 
    alert: HealthAlert, 
    config?: HealthNotificationConfigInput
  ): Promise<void> {
    const channel = this.channels.get(channelName);
    if (!channel || !channel.enabled) {
      throw new Error(`Notification channel not found or disabled: ${channelName}`);
    }

    // Check cooldown
    if (config?.cooldownSeconds) {
      const recentNotification = this.notificationHistory
        .filter(n => n.alertId === alert.id && n.channel === channelName)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      if (recentNotification) {
        const timeSinceLastNotification = Date.now() - recentNotification.timestamp.getTime();
        if (timeSinceLastNotification < config.cooldownSeconds * 1000) {
          this.logger.debug(`Notification skipped due to cooldown: ${channelName}`);
          return;
        }
      }
    }

    const notificationId = this.generateNotificationId();
    
    try {
      await this.sendToChannel(channel, alert, config);
      
      this.notificationHistory.push({
        id: notificationId,
        alertId: alert.id,
        channel: channelName,
        timestamp: new Date(),
        success: true,
      });

      this.eventEmitter.emit('health.notification.sent', {
        notificationId,
        channel: channelName,
        alert,
      });

      this.logger.log(`Notification sent successfully: ${channelName} for alert ${alert.id}`);
    } catch (error) {
      this.notificationHistory.push({
        id: notificationId,
        alertId: alert.id,
        channel: channelName,
        timestamp: new Date(),
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      this.eventEmitter.emit('health.notification.failed', {
        notificationId,
        channel: channelName,
        alert,
        error,
      });

      throw error;
    }
  }

  private async sendToChannel(
    channel: NotificationChannel, 
    alert: HealthAlert, 
    config?: HealthNotificationConfigInput
  ): Promise<void> {
    const template = config?.template || this.getDefaultTemplate(channel.name, alert.severity);
    const message = this.renderTemplate(template, alert);

    switch (channel.type) {
      case 'email':
        await this.sendEmail(channel, message, alert);
        break;
      case 'slack':
        await this.sendSlack(channel, message);
        break;
      case 'webhook':
        await this.sendWebhook(channel, message, alert);
        break;
      case 'teams':
        await this.sendTeams(channel, message);
        break;
      case 'sms':
        await this.sendSMS(channel, message, alert);
        break;
      case 'discord':
        await this.sendDiscord(channel, message);
        break;
      default:
        throw new Error(`Unsupported notification channel type: ${channel.type}`);
    }
  }

  private async sendEmail(channel: NotificationChannel, message: string, alert: HealthAlert): Promise<void> {
    // In a real implementation, you would use a proper email service like nodemailer
    this.logger.log(`Email notification would be sent: ${message}`);
    
    // Simulate email sending
    if (Math.random() > 0.1) { // 90% success rate
      return Promise.resolve();
    } else {
      throw new Error('Email service temporarily unavailable');
    }
  }

  private async sendSlack(channel: NotificationChannel, message: string): Promise<void> {
    const { webhookUrl } = channel.config;
    
    try {
      const payload = JSON.parse(message);
      
      // In a real implementation, you would make an HTTP request to the webhook URL
      this.logger.log(`Slack notification would be sent to ${webhookUrl}: ${JSON.stringify(payload)}`);
      
      // Simulate HTTP request
      if (Math.random() > 0.05) { // 95% success rate
        return Promise.resolve();
      } else {
        throw new Error('Slack webhook request failed');
      }
    } catch (error) {
      throw new Error(`Failed to send Slack notification: ${error}`);
    }
  }

  private async sendWebhook(channel: NotificationChannel, message: string, alert: HealthAlert): Promise<void> {
    const { url, method, headers } = channel.config;
    
    const payload = {
      alert,
      message,
      timestamp: new Date().toISOString(),
    };

    // In a real implementation, you would make an HTTP request
    this.logger.log(`Webhook notification would be sent to ${url}: ${JSON.stringify(payload)}`);
    
    // Simulate HTTP request
    if (Math.random() > 0.05) { // 95% success rate
      return Promise.resolve();
    } else {
      throw new Error('Webhook request failed');
    }
  }

  private async sendTeams(channel: NotificationChannel, message: string): Promise<void> {
    const { webhookUrl } = channel.config;
    
    try {
      const payload = JSON.parse(message);
      
      // In a real implementation, you would make an HTTP request to the webhook URL
      this.logger.log(`Teams notification would be sent to ${webhookUrl}: ${JSON.stringify(payload)}`);
      
      // Simulate HTTP request
      if (Math.random() > 0.05) { // 95% success rate
        return Promise.resolve();
      } else {
        throw new Error('Teams webhook request failed');
      }
    } catch (error) {
      throw new Error(`Failed to send Teams notification: ${error}`);
    }
  }

  private async sendSMS(channel: NotificationChannel, message: string, alert: HealthAlert): Promise<void> {
    // In a real implementation, you would use an SMS service like Twilio
    this.logger.log(`SMS notification would be sent: ${message}`);
    
    // Simulate SMS sending
    if (Math.random() > 0.1) { // 90% success rate
      return Promise.resolve();
    } else {
      throw new Error('SMS service temporarily unavailable');
    }
  }

  private async sendDiscord(channel: NotificationChannel, message: string): Promise<void> {
    // In a real implementation, you would use Discord webhook
    this.logger.log(`Discord notification would be sent: ${message}`);
    
    // Simulate Discord sending
    if (Math.random() > 0.05) { // 95% success rate
      return Promise.resolve();
    } else {
      throw new Error('Discord webhook request failed');
    }
  }

  private getDefaultTemplate(channelName: string, severity: HealthSeverity): string {
    const templateKey = `${channelName}_${severity.toLowerCase()}`;
    const template = this.templates.get(templateKey);
    
    if (template) {
      return template.template;
    }

    // Fallback to generic template
    return `
      Health Alert: {{checkName}}
      Severity: {{severity}}
      Message: {{message}}
      Time: {{timestamp}}
      Occurrences: {{occurrenceCount}}
    `;
  }

  private renderTemplate(template: string, alert: HealthAlert): string {
    const variables = {
      checkName: alert.checkName,
      message: alert.message,
      severity: alert.severity,
      timestamp: alert.createdAt.toISOString(),
      occurrenceCount: alert.occurrenceCount.toString(),
      alertId: alert.id,
      checkId: alert.checkId,
      isActive: alert.isActive.toString(),
      resolvedAt: alert.resolvedAt?.toISOString() || 'Not resolved',
    };

    let rendered = template;
    Object.entries(variables).forEach(([key, value]) => {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return rendered;
  }

  async addNotificationChannel(channel: NotificationChannel): Promise<void> {
    this.channels.set(channel.name, channel);
    
    this.eventEmitter.emit('health.notification.channel.added', { channel });
    this.logger.log(`Notification channel added: ${channel.name}`);
  }

  async updateNotificationChannel(channelName: string, updates: Partial<NotificationChannel>): Promise<NotificationChannel | null> {
    const channel = this.channels.get(channelName);
    if (!channel) {
      return null;
    }

    const updatedChannel = { ...channel, ...updates };
    this.channels.set(channelName, updatedChannel);

    this.eventEmitter.emit('health.notification.channel.updated', { channel: updatedChannel });
    this.logger.log(`Notification channel updated: ${channelName}`);

    return updatedChannel;
  }

  async removeNotificationChannel(channelName: string): Promise<boolean> {
    const removed = this.channels.delete(channelName);
    if (removed) {
      this.eventEmitter.emit('health.notification.channel.removed', { channelName });
      this.logger.log(`Notification channel removed: ${channelName}`);
    }
    return removed;
  }

  async getNotificationChannels(): Promise<NotificationChannel[]> {
    return Array.from(this.channels.values());
  }

  async testNotificationChannel(channelName: string): Promise<boolean> {
    const testAlert: HealthAlert = {
      id: 'test_alert',
      checkId: 'test_check',
      checkName: 'Test Health Check',
      severity: HealthSeverity.INFO,
      message: 'This is a test notification',
      createdAt: new Date(),
      isActive: true,
      occurrenceCount: 1,
    };

    try {
      await this.sendNotification(channelName, testAlert);
      return true;
    } catch (error) {
      this.logger.error(`Test notification failed for channel ${channelName}:`, error);
      return false;
    }
  }

  async getNotificationHistory(hours: number = 24): Promise<Array<{
    id: string;
    alertId: string;
    channel: string;
    timestamp: Date;
    success: boolean;
    error?: string;
  }>> {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    return this.notificationHistory.filter(n => n.timestamp.getTime() >= cutoffTime);
  }

  private generateNotificationId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}