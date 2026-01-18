import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import { 
  HealthAlert, 
  HealthCheck, 
  HealthSeverity, 
  HealthStatus 
} from '../types/health.types';
import { 
  HealthAlertInput, 
  HealthAlertFilterInput, 
  HealthNotificationConfigInput 
} from '../inputs/health.input';
import { HealthNotificationService } from './health-notification.service';

interface AlertRule {
  id: string;
  name: string;
  checkId?: string;
  checkType?: string;
  condition: AlertCondition;
  severity: HealthSeverity;
  enabled: boolean;
  cooldownSeconds: number;
  lastTriggered?: Date;
}

interface AlertCondition {
  type: 'consecutive_failures' | 'response_time' | 'availability' | 'status_change' | 'custom';
  threshold?: number;
  duration?: number;
  comparison?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  customExpression?: string;
}

@Injectable()
export class HealthAlertService {
  private readonly logger = new Logger(HealthAlertService.name);
  private alerts = new Map<string, HealthAlert>();
  private alertRules = new Map<string, AlertRule>();
  private alertHistory = new Map<string, HealthAlert[]>();
  private notificationConfigs = new Map<string, HealthNotificationConfigInput>();

  constructor(
    private readonly notificationService: HealthNotificationService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeDefaultAlertRules();
  }

  private initializeDefaultAlertRules(): void {
    const defaultRules: Omit<AlertRule, 'id'>[] = [
      {
        name: 'Critical Service Down',
        condition: {
          type: 'consecutive_failures',
          threshold: 3,
        },
        severity: HealthSeverity.CRITICAL,
        enabled: true,
        cooldownSeconds: 300, // 5 minutes
      },
      {
        name: 'High Response Time',
        condition: {
          type: 'response_time',
          threshold: 5000, // 5 seconds
          comparison: 'gt',
        },
        severity: HealthSeverity.HIGH,
        enabled: true,
        cooldownSeconds: 600, // 10 minutes
      },
      {
        name: 'Low Availability',
        condition: {
          type: 'availability',
          threshold: 0.95, // 95%
          comparison: 'lt',
        },
        severity: HealthSeverity.HIGH,
        enabled: true,
        cooldownSeconds: 900, // 15 minutes
      },
      {
        name: 'Service Status Change',
        condition: {
          type: 'status_change',
        },
        severity: HealthSeverity.MEDIUM,
        enabled: true,
        cooldownSeconds: 60, // 1 minute
      },
    ];

    defaultRules.forEach(rule => {
      const id = this.generateAlertRuleId(rule.name);
      this.alertRules.set(id, { ...rule, id });
    });
  }

  async createAlert(input: HealthAlertInput): Promise<HealthAlert> {
    const id = this.generateAlertId();
    
    const alert: HealthAlert = {
      id,
      checkId: input.checkId,
      checkName: '', // Will be populated from health check
      severity: input.severity,
      message: input.message,
      createdAt: new Date(),
      isActive: input.isActive ?? true,
      occurrenceCount: 1,
    };

    // Check if similar alert already exists
    const existingAlert = this.findSimilarAlert(input.checkId, input.message);
    if (existingAlert && existingAlert.isActive) {
      existingAlert.occurrenceCount++;
      existingAlert.createdAt = new Date();
      this.alerts.set(existingAlert.id, existingAlert);
      
      this.eventEmitter.emit('health.alert.updated', { alert: existingAlert });
      return existingAlert;
    }

    this.alerts.set(id, alert);
    
    // Add to history
    const history = this.alertHistory.get(input.checkId) || [];
    history.unshift(alert);
    if (history.length > 100) {
      history.pop();
    }
    this.alertHistory.set(input.checkId, history);

    // Send notifications
    if (alert.isActive) {
      await this.sendAlertNotifications(alert);
    }

    this.eventEmitter.emit('health.alert.created', { alert });
    this.logger.warn(`Health alert created: ${alert.message} (${alert.severity})`);
    
    return alert;
  }

  private findSimilarAlert(checkId: string, message: string): HealthAlert | null {
    for (const alert of this.alerts.values()) {
      if (alert.checkId === checkId && 
          alert.message === message && 
          alert.isActive) {
        return alert;
      }
    }
    return null;
  }

  async processHealthCheckResult(check: HealthCheck): Promise<void> {
    const applicableRules = Array.from(this.alertRules.values()).filter(rule => 
      rule.enabled && this.isRuleApplicable(rule, check)
    );

    for (const rule of applicableRules) {
      if (await this.evaluateAlertRule(rule, check)) {
        await this.triggerAlert(rule, check);
      }
    }
  }

  private isRuleApplicable(rule: AlertRule, check: HealthCheck): boolean {
    if (rule.checkId && rule.checkId !== check.id) {
      return false;
    }
    if (rule.checkType && rule.checkType !== check.type) {
      return false;
    }
    return true;
  }

  private async evaluateAlertRule(rule: AlertRule, check: HealthCheck): Promise<boolean> {
    // Check cooldown
    if (rule.lastTriggered) {
      const timeSinceLastTrigger = Date.now() - rule.lastTriggered.getTime();
      if (timeSinceLastTrigger < rule.cooldownSeconds * 1000) {
        return false;
      }
    }

    const { condition } = rule;

    switch (condition.type) {
      case 'consecutive_failures':
        return check.consecutiveFailures >= (condition.threshold || 3);
      
      case 'response_time':
        return this.compareValues(
          check.details.responseTime,
          condition.threshold || 5000,
          condition.comparison || 'gt'
        );
      
      case 'status_change':
        // This would need previous status tracking
        return check.status === HealthStatus.UNHEALTHY || check.status === HealthStatus.DEGRADED;
      
      case 'availability':
        // This would need trend data
        return false; // Placeholder
      
      case 'custom':
        return this.evaluateCustomExpression(condition.customExpression || '', check);
      
      default:
        return false;
    }
  }

  private compareValues(actual: number, threshold: number, comparison: string): boolean {
    switch (comparison) {
      case 'gt': return actual > threshold;
      case 'gte': return actual >= threshold;
      case 'lt': return actual < threshold;
      case 'lte': return actual <= threshold;
      case 'eq': return actual === threshold;
      default: return false;
    }
  }

  private evaluateCustomExpression(expression: string, check: HealthCheck): boolean {
    // Simple expression evaluator - in production, use a proper expression parser
    try {
      const context = {
        responseTime: check.details.responseTime,
        consecutiveFailures: check.consecutiveFailures,
        status: check.status,
        isHealthy: check.status === HealthStatus.HEALTHY,
        isUnhealthy: check.status === HealthStatus.UNHEALTHY,
        isDegraded: check.status === HealthStatus.DEGRADED,
      };

      // Replace variables in expression
      let evaluableExpression = expression;
      Object.entries(context).forEach(([key, value]) => {
        evaluableExpression = evaluableExpression.replace(
          new RegExp(`\\b${key}\\b`, 'g'),
          String(value)
        );
      });

      // Evaluate (be careful with eval in production)
      return Boolean(eval(evaluableExpression));
    } catch (error) {
      this.logger.error(`Failed to evaluate custom expression: ${expression}`, error);
      return false;
    }
  }

  private async triggerAlert(rule: AlertRule, check: HealthCheck): Promise<void> {
    rule.lastTriggered = new Date();
    this.alertRules.set(rule.id, rule);

    await this.createAlert({
      checkId: check.id,
      severity: rule.severity,
      message: `Alert rule triggered: ${rule.name} - ${check.name}`,
      isActive: true,
    });
  }

  async resolveAlert(alertId: string): Promise<HealthAlert | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) {
      return null;
    }

    alert.isActive = false;
    alert.resolvedAt = new Date();
    this.alerts.set(alertId, alert);

    this.eventEmitter.emit('health.alert.resolved', { alert });
    this.logger.log(`Health alert resolved: ${alertId}`);

    return alert;
  }

  async getAlerts(filter?: HealthAlertFilterInput): Promise<HealthAlert[]> {
    let alerts = Array.from(this.alerts.values());

    if (filter) {
      if (filter.severities?.length) {
        alerts = alerts.filter(a => filter.severities!.includes(a.severity));
      }
      if (filter.isActive !== undefined) {
        alerts = alerts.filter(a => a.isActive === filter.isActive);
      }
      if (filter.checkId) {
        alerts = alerts.filter(a => a.checkId === filter.checkId);
      }
      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        alerts = alerts.filter(a => a.createdAt >= startDate);
      }
      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        alerts = alerts.filter(a => a.createdAt <= endDate);
      }
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAlert(alertId: string): Promise<HealthAlert | null> {
    return this.alerts.get(alertId) || null;
  }

  async getAlertHistory(checkId: string): Promise<HealthAlert[]> {
    return this.alertHistory.get(checkId) || [];
  }

  async createAlertRule(rule: Omit<AlertRule, 'id'>): Promise<AlertRule> {
    const id = this.generateAlertRuleId(rule.name);
    const alertRule: AlertRule = { ...rule, id };
    
    this.alertRules.set(id, alertRule);
    
    this.eventEmitter.emit('health.alert.rule.created', { rule: alertRule });
    this.logger.log(`Alert rule created: ${rule.name}`);
    
    return alertRule;
  }

  async updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    const rule = this.alertRules.get(ruleId);
    if (!rule) {
      return null;
    }

    const updatedRule = { ...rule, ...updates };
    this.alertRules.set(ruleId, updatedRule);

    this.eventEmitter.emit('health.alert.rule.updated', { rule: updatedRule });
    this.logger.log(`Alert rule updated: ${ruleId}`);

    return updatedRule;
  }

  async deleteAlertRule(ruleId: string): Promise<boolean> {
    const deleted = this.alertRules.delete(ruleId);
    if (deleted) {
      this.eventEmitter.emit('health.alert.rule.deleted', { ruleId });
      this.logger.log(`Alert rule deleted: ${ruleId}`);
    }
    return deleted;
  }

  async getAlertRules(): Promise<AlertRule[]> {
    return Array.from(this.alertRules.values());
  }

  async configureNotifications(config: HealthNotificationConfigInput): Promise<void> {
    this.notificationConfigs.set(config.channel, config);
    
    this.eventEmitter.emit('health.notification.config.updated', { config });
    this.logger.log(`Notification configuration updated for channel: ${config.channel}`);
  }

  private async sendAlertNotifications(alert: HealthAlert): Promise<void> {
    const configs = Array.from(this.notificationConfigs.values()).filter(config =>
      config.enabled && config.severityLevels.includes(alert.severity)
    );

    for (const config of configs) {
      try {
        await this.notificationService.sendNotification(config.channel, alert, config);
      } catch (error) {
        this.logger.error(`Failed to send notification via ${config.channel}:`, error);
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupResolvedAlerts(): Promise<void> {
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    let cleanedCount = 0;

    for (const [alertId, alert] of this.alerts.entries()) {
      if (!alert.isActive && 
          alert.resolvedAt && 
          alert.resolvedAt.getTime() < cutoffTime) {
        this.alerts.delete(alertId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.log(`Cleaned up ${cleanedCount} resolved alerts`);
    }
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertRuleId(name: string): string {
    return `rule_${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
  }

  async getActiveAlertsCount(): Promise<number> {
    return Array.from(this.alerts.values()).filter(a => a.isActive).length;
  }

  async getAlertsByCheckId(checkId: string): Promise<HealthAlert[]> {
    return Array.from(this.alerts.values()).filter(a => a.checkId === checkId);
  }

  async bulkResolveAlerts(checkId: string): Promise<number> {
    const alerts = await this.getAlertsByCheckId(checkId);
    let resolvedCount = 0;

    for (const alert of alerts) {
      if (alert.isActive) {
        await this.resolveAlert(alert.id);
        resolvedCount++;
      }
    }

    return resolvedCount;
  }
}