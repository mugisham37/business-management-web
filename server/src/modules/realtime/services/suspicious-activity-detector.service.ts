import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle, DrizzleDB } from '../../database/drizzle.service';
import { CrossDeviceNotificationService } from './cross-device-notification.service';
import { AuthRealtimeEventService } from './auth-realtime-event.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { eq, and, gte, count, desc, sql } from 'drizzle-orm';
import { userSessions } from '../../database/schema/notification.schema';

export interface SuspiciousActivityRule {
  id: string;
  name: string;
  type: SuspiciousActivityType;
  severity: 'medium' | 'high' | 'critical';
  threshold: number;
  timeWindow: number; // in minutes
  description: string;
  enabled: boolean;
  conditions: SuspiciousActivityCondition[];
}

export enum SuspiciousActivityType {
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  RAPID_LOGIN_ATTEMPTS = 'rapid_login_attempts',
  UNUSUAL_LOCATION = 'unusual_location',
  UNUSUAL_TIME = 'unusual_time',
  NEW_DEVICE_PATTERN = 'new_device_pattern',
  CONCURRENT_SESSIONS = 'concurrent_sessions',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  UNUSUAL_API_USAGE = 'unusual_api_usage',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',
  ACCOUNT_ENUMERATION = 'account_enumeration'
}

export interface SuspiciousActivityCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: any;
  weight: number; // 0-1, how much this condition contributes to suspicion score
}

export interface SuspiciousActivityEvent {
  id: string;
  userId: string;
  tenantId: string;
  type: SuspiciousActivityType;
  severity: 'medium' | 'high' | 'critical';
  suspicionScore: number; // 0-100
  description: string;
  evidence: SuspiciousActivityEvidence[];
  metadata: Record<string, any>;
  timestamp: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
}

export interface SuspiciousActivityEvidence {
  type: string;
  description: string;
  data: Record<string, any>;
  timestamp: Date;
  weight: number;
}

export interface ActivityPattern {
  userId: string;
  tenantId: string;
  activityType: string;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  ipAddresses: string[];
  userAgents: string[];
  locations: string[];
  devices: string[];
}

@Injectable()
export class SuspiciousActivityDetectorService {
  private readonly logger = new Logger(SuspiciousActivityDetectorService.name);
  private readonly activityLog = new Map<string, Array<{
    type: string;
    timestamp: Date;
    metadata: Record<string, any>;
  }>>(); // userId -> activity log

  private readonly suspiciousEvents = new Map<string, SuspiciousActivityEvent[]>(); // userId -> events
  private readonly detectionRules: SuspiciousActivityRule[] = [];

  constructor(
    @InjectDrizzle() private readonly db: DrizzleDB,
    private readonly crossDeviceNotificationService: CrossDeviceNotificationService,
    private readonly authRealtimeEventService: AuthRealtimeEventService,
  ) {
    this.initializeDetectionRules();
  }

  /**
   * Analyze activity for suspicious patterns
   */
  async analyzeActivity(
    userId: string,
    tenantId: string,
    activityType: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      // Log the activity
      this.logActivity(userId, activityType, metadata);

      // Run detection rules
      for (const rule of this.detectionRules.filter(r => r.enabled)) {
        const suspiciousEvent = await this.evaluateRule(userId, tenantId, rule, activityType, metadata);
        if (suspiciousEvent) {
          await this.handleSuspiciousActivity(suspiciousEvent);
        }
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to analyze activity: ${err.message}`, err.stack);
    }
  }

  /**
   * Detect multiple failed login attempts
   */
  async detectMultipleFailedLogins(
    email: string,
    tenantId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const activityType = 'failed_login';
    const metadata = { email, ipAddress, userAgent };

    // For failed logins, we don't have a userId yet, so we track by email/tenant
    const key = `${tenantId}:${email}`;
    
    if (!this.activityLog.has(key)) {
      this.activityLog.set(key, []);
    }

    const log = this.activityLog.get(key)!;
    log.push({ type: activityType, timestamp: new Date(), metadata });

    // Check for brute force pattern
    const recentFailures = this.getRecentActivities(key, 'failed_login', 15); // 15 minutes
    
    if (recentFailures.length >= 5) {
      // Create suspicious activity event
      const suspiciousEvent: SuspiciousActivityEvent = {
        id: this.generateEventId(),
        userId: 'unknown', // No user ID for failed logins
        tenantId,
        type: SuspiciousActivityType.BRUTE_FORCE_ATTACK,
        severity: 'high',
        suspicionScore: Math.min(100, recentFailures.length * 10),
        description: `Multiple failed login attempts detected for ${email}`,
        evidence: recentFailures.map(activity => ({
          type: 'failed_login',
          description: `Failed login attempt from ${activity.metadata.ipAddress}`,
          data: activity.metadata,
          timestamp: activity.timestamp,
          weight: 0.8,
        })),
        metadata: {
          email,
          attemptCount: recentFailures.length,
          ipAddresses: [...new Set(recentFailures.map(a => a.metadata.ipAddress).filter(Boolean))],
          userAgents: [...new Set(recentFailures.map(a => a.metadata.userAgent).filter(Boolean))],
        },
        timestamp: new Date(),
        resolved: false,
      };

      await this.handleSuspiciousActivity(suspiciousEvent);
    }
  }

  /**
   * Detect unusual location login
   */
  async detectUnusualLocation(
    userId: string,
    tenantId: string,
    currentLocation: string,
    ipAddress?: string,
  ): Promise<void> {
    try {
      // Get user's typical locations from recent activity
      const recentActivities = this.getRecentActivities(userId, 'login', 30 * 24 * 60); // 30 days
      const typicalLocations = [...new Set(recentActivities
        .map(a => a.metadata.location)
        .filter(Boolean)
      )];

      // If this is a new location and user has established patterns
      if (typicalLocations.length > 0 && !typicalLocations.includes(currentLocation)) {
        const suspiciousEvent: SuspiciousActivityEvent = {
          id: this.generateEventId(),
          userId,
          tenantId,
          type: SuspiciousActivityType.UNUSUAL_LOCATION,
          severity: 'medium',
          suspicionScore: 60,
          description: `Login from unusual location: ${currentLocation}`,
          evidence: [{
            type: 'location_anomaly',
            description: `Login from ${currentLocation}, typical locations: ${typicalLocations.join(', ')}`,
            data: {
              currentLocation,
              typicalLocations,
              ipAddress,
            },
            timestamp: new Date(),
            weight: 0.7,
          }],
          metadata: {
            currentLocation,
            typicalLocations,
            ipAddress,
          },
          timestamp: new Date(),
          resolved: false,
        };

        await this.handleSuspiciousActivity(suspiciousEvent);
      }

    } catch (error) {
      this.logger.error('Failed to detect unusual location:', error);
    }
  }

  /**
   * Detect unusual time login
   */
  async detectUnusualTime(
    userId: string,
    tenantId: string,
    loginTime: Date,
  ): Promise<void> {
    try {
      // Get user's typical login hours from recent activity
      const recentActivities = this.getRecentActivities(userId, 'login', 30 * 24 * 60); // 30 days
      const typicalHours = recentActivities.map(a => a.timestamp.getHours());
      
      if (typicalHours.length < 5) {
        // Not enough data to establish pattern
        return;
      }

      const currentHour = loginTime.getHours();
      const hourCounts = typicalHours.reduce((acc, hour) => {
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);

      // If current hour has less than 10% of typical activity, it's unusual
      const maxCount = Math.max(...Object.values(hourCounts));
      const currentHourCount = hourCounts[currentHour] || 0;
      
      if (currentHourCount < maxCount * 0.1) {
        const suspiciousEvent: SuspiciousActivityEvent = {
          id: this.generateEventId(),
          userId,
          tenantId,
          type: SuspiciousActivityType.UNUSUAL_TIME,
          severity: 'medium',
          suspicionScore: 50,
          description: `Login at unusual time: ${currentHour}:00`,
          evidence: [{
            type: 'time_anomaly',
            description: `Login at ${currentHour}:00, typical hours: ${Object.keys(hourCounts).join(', ')}`,
            data: {
              currentHour,
              typicalHours: Object.keys(hourCounts).map(Number),
              hourCounts,
            },
            timestamp: new Date(),
            weight: 0.5,
          }],
          metadata: {
            currentHour,
            typicalHours: Object.keys(hourCounts).map(Number),
          },
          timestamp: new Date(),
          resolved: false,
        };

        await this.handleSuspiciousActivity(suspiciousEvent);
      }

    } catch (error) {
      this.logger.error('Failed to detect unusual time:', error);
    }
  }

  /**
   * Detect concurrent sessions anomaly
   */
  async detectConcurrentSessions(userId: string, tenantId: string): Promise<void> {
    try {
      // Get active sessions for user
      const activeSessions = await this.db
        .select()
        .from(userSessions)
        .where(and(
          eq(userSessions.userId, userId),
          eq(userSessions.tenantId, tenantId),
          eq(userSessions.isActive, true),
        ));

      // If more than 5 concurrent sessions, it's suspicious
      if (activeSessions.length > 5) {
        const suspiciousEvent: SuspiciousActivityEvent = {
          id: this.generateEventId(),
          userId,
          tenantId,
          type: SuspiciousActivityType.CONCURRENT_SESSIONS,
          severity: 'high',
          suspicionScore: Math.min(100, activeSessions.length * 15),
          description: `Unusual number of concurrent sessions: ${activeSessions.length}`,
          evidence: [{
            type: 'concurrent_sessions',
            description: `${activeSessions.length} active sessions detected`,
            data: {
              sessionCount: activeSessions.length,
              sessions: activeSessions.map(s => ({
                id: s.id,
                ipAddress: s.ipAddress,
                userAgent: s.userAgent,
                createdAt: s.createdAt,
              })),
            },
            timestamp: new Date(),
            weight: 0.9,
          }],
          metadata: {
            sessionCount: activeSessions.length,
            ipAddresses: [...new Set(activeSessions.map(s => s.ipAddress).filter(Boolean))],
          },
          timestamp: new Date(),
          resolved: false,
        };

        await this.handleSuspiciousActivity(suspiciousEvent);
      }

    } catch (error) {
      this.logger.error('Failed to detect concurrent sessions:', error);
    }
  }

  /**
   * Get suspicious activity events for a user
   */
  getSuspiciousEvents(userId: string, limit: number = 50): SuspiciousActivityEvent[] {
    const events = this.suspiciousEvents.get(userId) || [];
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Resolve suspicious activity event
   */
  async resolveSuspiciousEvent(
    eventId: string,
    resolvedBy: string,
    resolutionNotes?: string,
  ): Promise<void> {
    try {
      // Find and update the event
      for (const [userId, events] of this.suspiciousEvents.entries()) {
        const event = events.find(e => e.id === eventId);
        if (event) {
          event.resolved = true;
          event.resolvedBy = resolvedBy;
          event.resolvedAt = new Date();
          event.resolutionNotes = resolutionNotes;

          this.logger.log(`Suspicious activity event resolved: ${eventId} by ${resolvedBy}`);
          break;
        }
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to resolve suspicious event: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Scheduled cleanup of old activity logs
   */
  @Cron(CronExpression.EVERY_HOUR)
  private cleanupOldActivityLogs(): void {
    try {
      const cutoffTime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

      for (const [key, activities] of this.activityLog.entries()) {
        const filteredActivities = activities.filter(activity => activity.timestamp > cutoffTime);
        
        if (filteredActivities.length === 0) {
          this.activityLog.delete(key);
        } else {
          this.activityLog.set(key, filteredActivities);
        }
      }

      this.logger.log('Cleaned up old activity logs');

    } catch (error) {
      this.logger.error('Failed to cleanup activity logs:', error);
    }
  }

  /**
   * Private helper methods
   */

  private initializeDetectionRules(): void {
    this.detectionRules.push(
      {
        id: 'multiple_failed_logins',
        name: 'Multiple Failed Logins',
        type: SuspiciousActivityType.MULTIPLE_FAILED_LOGINS,
        severity: 'high',
        threshold: 5,
        timeWindow: 15,
        description: 'Detect multiple failed login attempts',
        enabled: true,
        conditions: [
          { field: 'activityType', operator: 'equals', value: 'failed_login', weight: 1.0 }
        ],
      },
      {
        id: 'rapid_login_attempts',
        name: 'Rapid Login Attempts',
        type: SuspiciousActivityType.RAPID_LOGIN_ATTEMPTS,
        severity: 'medium',
        threshold: 10,
        timeWindow: 5,
        description: 'Detect rapid succession of login attempts',
        enabled: true,
        conditions: [
          { field: 'activityType', operator: 'equals', value: 'login', weight: 1.0 }
        ],
      },
      {
        id: 'new_device_pattern',
        name: 'New Device Pattern',
        type: SuspiciousActivityType.NEW_DEVICE_PATTERN,
        severity: 'high',
        threshold: 3,
        timeWindow: 60,
        description: 'Detect multiple new device logins',
        enabled: true,
        conditions: [
          { field: 'activityType', operator: 'equals', value: 'new_device_login', weight: 1.0 }
        ],
      }
    );
  }

  private logActivity(userId: string, type: string, metadata: Record<string, any>): void {
    if (!this.activityLog.has(userId)) {
      this.activityLog.set(userId, []);
    }

    const userLog = this.activityLog.get(userId)!;
    userLog.push({
      type,
      timestamp: new Date(),
      metadata,
    });

    // Keep only last 1000 activities per user
    if (userLog.length > 1000) {
      userLog.shift();
    }
  }

  private getRecentActivities(
    userId: string,
    activityType: string,
    timeWindowMinutes: number,
  ): Array<{ type: string; timestamp: Date; metadata: Record<string, any> }> {
    const userLog = this.activityLog.get(userId) || [];
    const cutoffTime = new Date(Date.now() - timeWindowMinutes * 60 * 1000);

    return userLog.filter(activity => 
      activity.type === activityType && 
      activity.timestamp > cutoffTime
    );
  }

  private async evaluateRule(
    userId: string,
    tenantId: string,
    rule: SuspiciousActivityRule,
    activityType: string,
    metadata: Record<string, any>,
  ): Promise<SuspiciousActivityEvent | null> {
    try {
      // Check if rule conditions match
      const conditionsMet = rule.conditions.every(condition => {
        const fieldValue = activityType === condition.field ? activityType : metadata[condition.field];
        return this.evaluateCondition(fieldValue, condition);
      });

      if (!conditionsMet) {
        return null;
      }

      // Check if threshold is exceeded
      const recentActivities = this.getRecentActivities(userId, activityType, rule.timeWindow);
      
      if (recentActivities.length < rule.threshold) {
        return null;
      }

      // Calculate suspicion score
      const suspicionScore = Math.min(100, (recentActivities.length / rule.threshold) * 50 + 
        rule.conditions.reduce((sum, c) => sum + c.weight, 0) * 25);

      return {
        id: this.generateEventId(),
        userId,
        tenantId,
        type: rule.type,
        severity: rule.severity,
        suspicionScore,
        description: `${rule.description}: ${recentActivities.length} occurrences in ${rule.timeWindow} minutes`,
        evidence: recentActivities.map(activity => ({
          type: activityType,
          description: `${activityType} at ${activity.timestamp.toISOString()}`,
          data: activity.metadata,
          timestamp: activity.timestamp,
          weight: 0.8,
        })),
        metadata: {
          ruleId: rule.id,
          ruleName: rule.name,
          threshold: rule.threshold,
          actualCount: recentActivities.length,
          timeWindow: rule.timeWindow,
        },
        timestamp: new Date(),
        resolved: false,
      };

    } catch (error) {
      this.logger.error(`Failed to evaluate rule ${rule.id}:`, error);
      return null;
    }
  }

  private evaluateCondition(fieldValue: any, condition: SuspiciousActivityCondition): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value;
      case 'not_equals':
        return fieldValue !== condition.value;
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value);
      case 'less_than':
        return Number(fieldValue) < Number(condition.value);
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      case 'not_contains':
        return !String(fieldValue).includes(String(condition.value));
      default:
        return false;
    }
  }

  private async handleSuspiciousActivity(event: SuspiciousActivityEvent): Promise<void> {
    try {
      // Store the event
      if (!this.suspiciousEvents.has(event.userId)) {
        this.suspiciousEvents.set(event.userId, []);
      }
      
      const userEvents = this.suspiciousEvents.get(event.userId)!;
      userEvents.push(event);

      // Keep only last 100 events per user
      if (userEvents.length > 100) {
        userEvents.shift();
      }

      this.logger.warn(
        `Suspicious activity detected: ${event.type} for user ${event.userId} (score: ${event.suspicionScore})`
      );

      // Send notifications
      if (event.userId !== 'unknown') {
        await this.authRealtimeEventService.notifySuspiciousActivity(
          event.userId,
          event.tenantId,
          event.type,
          event.description,
          event.severity,
          event.metadata,
        );

        await this.crossDeviceNotificationService.detectSuspiciousActivity(
          event.userId,
          event.tenantId,
          event.type,
          event.metadata,
        );
      }

    } catch (error) {
      this.logger.error('Failed to handle suspicious activity:', error);
    }
  }

  private generateEventId(): string {
    return `suspicious_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}