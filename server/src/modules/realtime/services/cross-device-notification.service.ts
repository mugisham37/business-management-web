import { Injectable, Logger } from '@nestjs/common';
import { InjectDrizzle, DrizzleDB } from '../../database/drizzle.service';
import { RealtimeGateway } from '../gateways/realtime.gateway';
import { NotificationService } from './notification.service';
import { AuthRealtimeEventService, SecurityEventType, DeviceInfo } from './auth-realtime-event.service';
import { deviceTokens } from '../../database/schema/notification.schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';

export interface CrossDeviceNotification {
  id: string;
  userId: string;
  tenantId: string;
  type: CrossDeviceNotificationType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceDevice?: DeviceInfo;
  targetDevices?: string[]; // Device IDs, if empty then all devices
  metadata?: Record<string, any>;
  timestamp: Date;
}

export enum CrossDeviceNotificationType {
  NEW_DEVICE_LOGIN = 'new_device_login',
  SUSPICIOUS_LOGIN = 'suspicious_login',
  PASSWORD_CHANGED = 'password_changed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  ACCOUNT_LOCKED = 'account_locked',
  SECURITY_SETTINGS_CHANGED = 'security_settings_changed',
  SESSION_TERMINATED = 'session_terminated',
  PERMISSION_CHANGED = 'permission_changed',
  TIER_CHANGED = 'tier_changed',
  DEVICE_TRUSTED = 'device_trusted',
  DEVICE_UNTRUSTED = 'device_untrusted'
}

export interface SuspiciousActivityPattern {
  type: 'multiple_failed_logins' | 'unusual_location' | 'unusual_time' | 'new_device_pattern' | 'rapid_requests';
  severity: 'medium' | 'high' | 'critical';
  threshold: number;
  timeWindow: number; // in minutes
  description: string;
}

export interface MfaEventFeedback {
  userId: string;
  tenantId: string;
  eventType: 'challenge_sent' | 'challenge_success' | 'challenge_failed' | 'backup_code_used';
  method: 'totp' | 'sms' | 'email' | 'backup_code';
  deviceInfo?: DeviceInfo;
  timestamp: Date;
  metadata?: Record<string, any>;
}

@Injectable()
export class CrossDeviceNotificationService {
  private readonly logger = new Logger(CrossDeviceNotificationService.name);
  private readonly suspiciousActivityPatterns: SuspiciousActivityPattern[] = [
    {
      type: 'multiple_failed_logins',
      severity: 'high',
      threshold: 5,
      timeWindow: 15,
      description: 'Multiple failed login attempts detected',
    },
    {
      type: 'unusual_location',
      severity: 'medium',
      threshold: 1,
      timeWindow: 60,
      description: 'Login from unusual location detected',
    },
    {
      type: 'unusual_time',
      severity: 'medium',
      threshold: 1,
      timeWindow: 60,
      description: 'Login at unusual time detected',
    },
    {
      type: 'new_device_pattern',
      severity: 'high',
      threshold: 3,
      timeWindow: 60,
      description: 'Multiple new device logins detected',
    },
    {
      type: 'rapid_requests',
      severity: 'critical',
      threshold: 50,
      timeWindow: 5,
      description: 'Rapid authentication requests detected',
    },
  ];

  private readonly activityLog = new Map<string, Array<{
    type: string;
    timestamp: Date;
    metadata: Record<string, any>;
  }>>(); // userId -> activity log

  constructor(
    @InjectDrizzle() private readonly db: DrizzleDB,
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationService: NotificationService,
    private readonly authRealtimeEventService: AuthRealtimeEventService,
  ) {}

  /**
   * Send new device login notification to all other user devices
   */
  async notifyNewDeviceLogin(
    userId: string,
    tenantId: string,
    newDevice: DeviceInfo,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      this.logger.log(`Sending new device login notification for user ${userId}`);

      const notification: CrossDeviceNotification = {
        id: this.generateNotificationId(),
        userId,
        tenantId,
        type: CrossDeviceNotificationType.NEW_DEVICE_LOGIN,
        title: 'New Device Login',
        message: `A new ${newDevice.platform} device "${newDevice.deviceName}" has logged into your account`,
        severity: newDevice.trusted ? 'low' : 'medium',
        sourceDevice: newDevice,
        metadata: {
          ipAddress,
          userAgent,
          loginTime: new Date(),
          deviceTrusted: newDevice.trusted,
        },
        timestamp: new Date(),
      };

      // Send to all other devices (exclude the new device)
      await this.sendCrossDeviceNotification(notification, [newDevice.deviceId]);

      // Log activity for suspicious pattern detection
      this.logActivity(userId, 'new_device_login', {
        deviceId: newDevice.deviceId,
        platform: newDevice.platform,
        trusted: newDevice.trusted,
        ipAddress,
      });

      // Check for suspicious patterns
      await this.checkSuspiciousPatterns(userId, tenantId);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send new device login notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Detect and alert suspicious activity patterns
   */
  async detectSuspiciousActivity(
    userId: string,
    tenantId: string,
    activityType: string,
    metadata: Record<string, any>,
  ): Promise<void> {
    try {
      // Log the activity
      this.logActivity(userId, activityType, metadata);

      // Check all patterns
      for (const pattern of this.suspiciousActivityPatterns) {
        if (await this.matchesPattern(userId, pattern, activityType)) {
          await this.alertSuspiciousActivity(userId, tenantId, pattern, metadata);
        }
      }

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to detect suspicious activity: ${err.message}`, err.stack);
    }
  }

  /**
   * Send MFA event feedback to all user devices
   */
  async sendMfaEventFeedback(feedback: MfaEventFeedback): Promise<void> {
    try {
      this.logger.log(`Sending MFA event feedback: ${feedback.eventType} for user ${feedback.userId}`);

      const titleMap = {
        challenge_sent: 'MFA Challenge Sent',
        challenge_success: 'MFA Verification Successful',
        challenge_failed: 'MFA Verification Failed',
        backup_code_used: 'Backup Code Used',
      };

      const messageMap = {
        challenge_sent: `MFA challenge sent via ${feedback.method}`,
        challenge_success: `MFA verification successful using ${feedback.method}`,
        challenge_failed: `MFA verification failed using ${feedback.method}`,
        backup_code_used: `Backup code was used for authentication`,
      };

      const severityMap = {
        challenge_sent: 'low' as const,
        challenge_success: 'low' as const,
        challenge_failed: 'medium' as const,
        backup_code_used: 'medium' as const,
      };

      const notification: CrossDeviceNotification = {
        id: this.generateNotificationId(),
        userId: feedback.userId,
        tenantId: feedback.tenantId,
        type: CrossDeviceNotificationType.MFA_ENABLED, // Generic MFA type
        title: titleMap[feedback.eventType],
        message: messageMap[feedback.eventType],
        severity: severityMap[feedback.eventType],
        metadata: {
          mfaMethod: feedback.method,
          eventType: feedback.eventType,
          ...feedback.metadata,
        },
        timestamp: feedback.timestamp,
        ...(feedback.deviceInfo ? { sourceDevice: feedback.deviceInfo } : {}),
      };

      await this.sendCrossDeviceNotification(notification);

      // Use the auth realtime event service for MFA events
      await this.authRealtimeEventService.notifyMfaEvent(
        feedback.userId,
        feedback.tenantId,
        feedback.eventType === 'challenge_sent' ? 'challenge' :
        feedback.eventType === 'challenge_success' ? 'success' : 'failed',
        feedback.method,
        feedback.metadata,
      );

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send MFA event feedback: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Notify about security settings changes
   */
  async notifySecuritySettingsChanged(
    userId: string,
    tenantId: string,
    settingType: string,
    oldValue: any,
    newValue: any,
    changedBy?: string,
  ): Promise<void> {
    try {
      const notification: CrossDeviceNotification = {
        id: this.generateNotificationId(),
        userId,
        tenantId,
        type: CrossDeviceNotificationType.SECURITY_SETTINGS_CHANGED,
        title: 'Security Settings Changed',
        message: `Your ${settingType} security setting has been updated`,
        severity: 'medium',
        metadata: {
          settingType,
          oldValue,
          newValue,
          changedBy,
        },
        timestamp: new Date(),
      };

      await this.sendCrossDeviceNotification(notification);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to notify security settings change: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Notify about session termination
   */
  async notifySessionTerminated(
    userId: string,
    tenantId: string,
    terminatedSessionId: string,
    terminatedDeviceInfo: DeviceInfo,
    reason: string,
    terminatedBy?: string,
  ): Promise<void> {
    try {
      const notification: CrossDeviceNotification = {
        id: this.generateNotificationId(),
        userId,
        tenantId,
        type: CrossDeviceNotificationType.SESSION_TERMINATED,
        title: 'Session Terminated',
        message: `Your session on ${terminatedDeviceInfo.deviceName} has been terminated: ${reason}`,
        severity: terminatedBy ? 'high' : 'medium',
        metadata: {
          sessionId: terminatedSessionId,
          terminatedDevice: terminatedDeviceInfo,
          reason,
          terminatedBy,
        },
        timestamp: new Date(),
      };

      // Send to all devices except the terminated one
      await this.sendCrossDeviceNotification(notification, [terminatedDeviceInfo.deviceId]);

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to notify session termination: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Get user's active devices for cross-device notifications
   */
  async getUserActiveDevices(userId: string, tenantId: string): Promise<DeviceInfo[]> {
    try {
      const devices = await this.db
        .select()
        .from(deviceTokens)
        .where(and(
          eq(deviceTokens.userId, userId),
          eq(deviceTokens.tenantId, tenantId),
          eq(deviceTokens.isActive, true),
        ))
        .orderBy(desc(deviceTokens.lastUsedAt));

      return devices.map(device => ({
        deviceId: device.deviceId || device.id,
        platform: device.platform as 'web' | 'ios' | 'android',
        deviceName: device.deviceId || `${device.platform} device`,
        trusted: true, // Assume registered devices are trusted
        ...(device.appVersion != null ? { appVersion: device.appVersion } : {}),
      }));

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to get user active devices: ${err.message}`, err.stack);
      return [];
    }
  }

  /**
   * Private helper methods
   */

  private async sendCrossDeviceNotification(
    notification: CrossDeviceNotification,
    excludeDeviceIds: string[] = [],
  ): Promise<void> {
    try {
      // Send via WebSocket to all connected sessions
      await this.sendWebSocketNotification(notification, excludeDeviceIds);

      // Send push notifications to mobile devices
      await this.sendPushNotifications(notification, excludeDeviceIds);

      // Send via notification service for persistence
      await this.notificationService.sendRealtimeNotification(
        notification.tenantId,
        [notification.userId],
        {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: this.mapSeverityToPriority(notification.severity),
          ...(notification.metadata ? { metadata: notification.metadata } : {}),
        },
      );

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send cross-device notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  private async sendWebSocketNotification(
    notification: CrossDeviceNotification,
    excludeDeviceIds: string[],
  ): Promise<void> {
    // Send to user-specific auth room
    const userRoom = `auth:user:${notification.userId}`;
    this.realtimeGateway.server.to(userRoom).emit('cross_device_notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      severity: notification.severity,
      sourceDevice: notification.sourceDevice,
      metadata: notification.metadata,
      timestamp: notification.timestamp,
      excludeDevices: excludeDeviceIds,
    });
  }

  private async sendPushNotifications(
    notification: CrossDeviceNotification,
    excludeDeviceIds: string[],
  ): Promise<void> {
    try {
      // Get active mobile device tokens
      const devices = await this.db
        .select()
        .from(deviceTokens)
        .where(and(
          eq(deviceTokens.userId, notification.userId),
          eq(deviceTokens.tenantId, notification.tenantId),
          eq(deviceTokens.isActive, true),
        ));

      const mobileDevices = devices.filter(device => 
        ['ios', 'android'].includes(device.platform) &&
        !excludeDeviceIds.includes(device.deviceId || device.id)
      );

      if (mobileDevices.length > 0) {
        // TODO: Implement actual push notification sending
        // This would integrate with FCM, APNS, etc.
        this.logger.log(`Would send push notifications to ${mobileDevices.length} mobile devices`);
      }

    } catch (error) {
      this.logger.error('Failed to send push notifications:', error);
    }
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

    // Keep only last 100 activities per user
    if (userLog.length > 100) {
      userLog.shift();
    }
  }

  private async matchesPattern(
    userId: string,
    pattern: SuspiciousActivityPattern,
    activityType: string,
  ): Promise<boolean> {
    const userLog = this.activityLog.get(userId) || [];
    const cutoffTime = new Date(Date.now() - pattern.timeWindow * 60 * 1000);

    let matchingActivities = 0;

    switch (pattern.type) {
      case 'multiple_failed_logins':
        matchingActivities = userLog.filter(activity => 
          activity.type === 'failed_login' && 
          activity.timestamp > cutoffTime
        ).length;
        break;

      case 'new_device_pattern':
        matchingActivities = userLog.filter(activity => 
          activity.type === 'new_device_login' && 
          activity.timestamp > cutoffTime &&
          !activity.metadata.trusted
        ).length;
        break;

      case 'rapid_requests':
        matchingActivities = userLog.filter(activity => 
          activity.timestamp > cutoffTime
        ).length;
        break;

      default:
        return false;
    }

    return matchingActivities >= pattern.threshold;
  }

  private async alertSuspiciousActivity(
    userId: string,
    tenantId: string,
    pattern: SuspiciousActivityPattern,
    metadata: Record<string, any>,
  ): Promise<void> {
    await this.authRealtimeEventService.notifySuspiciousActivity(
      userId,
      tenantId,
      pattern.type,
      pattern.description,
      pattern.severity,
      {
        pattern: pattern.type,
        threshold: pattern.threshold,
        timeWindow: pattern.timeWindow,
        ...metadata,
      },
    );
  }

  private async checkSuspiciousPatterns(userId: string, tenantId: string): Promise<void> {
    for (const pattern of this.suspiciousActivityPatterns) {
      if (await this.matchesPattern(userId, pattern, 'new_device_login')) {
        await this.alertSuspiciousActivity(userId, tenantId, pattern, {});
      }
    }
  }

  private generateNotificationId(): string {
    return `cross_device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapSeverityToPriority(severity: string): string {
    const map: Record<string, string> = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'urgent',
    };
    return map[severity] || 'medium';
  }
}