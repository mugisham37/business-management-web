import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from '../gateways/realtime.gateway';
import { NotificationService } from './notification.service';
import { AuthEventsService } from '../../auth/services/auth-events.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthEvent, AuthEventType } from '../../auth/resolvers/auth-subscriptions.resolver';

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId: string;
  tenantId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
  timestamp: Date;
}

export interface DeviceInfo {
  deviceId: string;
  platform: 'web' | 'ios' | 'android';
  deviceName: string;
  browserInfo?: {
    name: string;
    version: string;
  };
  appVersion?: string;
  trusted: boolean;
}

export enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILED = 'login_failed',
  LOGOUT = 'logout',
  NEW_DEVICE_LOGIN = 'new_device_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  MFA_CHALLENGE = 'mfa_challenge',
  MFA_SUCCESS = 'mfa_success',
  MFA_FAILED = 'mfa_failed',
  PASSWORD_CHANGED = 'password_changed',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  PERMISSION_CHANGED = 'permission_changed',
  TIER_CHANGED = 'tier_changed',
  SESSION_EXPIRED = 'session_expired',
  TOKEN_REFRESH = 'token_refresh',
  SECURITY_SETTINGS_CHANGED = 'security_settings_changed'
}

export interface AuthenticationEventData {
  eventType: SecurityEventType;
  userId: string;
  tenantId: string;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuthRealtimeEventService {
  private readonly logger = new Logger(AuthRealtimeEventService.name);
  private readonly activeConnections = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private readonly securityEventHistory = new Map<string, SecurityEvent[]>(); // userId -> events

  constructor(
    private readonly realtimeGateway: RealtimeGateway,
    private readonly notificationService: NotificationService,
    private readonly authEventsService: AuthEventsService,
  ) {}

  /**
   * Broadcast security event to all user sessions
   */
  async broadcastSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      this.logger.log(
        `Broadcasting security event: ${event.type} for user ${event.userId} (severity: ${event.severity})`
      );

      // Store event in history
      this.storeSecurityEvent(event);

      // Emit to all user sessions via WebSocket
      await this.emitToUserSessions(event.userId, event.tenantId, 'security_event', {
        id: event.id,
        type: event.type,
        severity: event.severity,
        title: event.title,
        message: event.message,
        metadata: event.metadata,
        timestamp: event.timestamp,
        ipAddress: event.ipAddress,
        deviceInfo: event.deviceInfo,
      });

      // Send notification for high/critical severity events
      if (event.severity === 'high' || event.severity === 'critical') {
        await this.sendSecurityNotification(event);
      }

      // Publish to GraphQL subscriptions
      await this.authEventsService.publishAuthEvent(
        this.mapSecurityEventToAuthEvent(event.type),
        event.userId,
        event.tenantId,
        {
          securityEventId: event.id,
          severity: event.severity,
          title: event.title,
          message: event.message,
          ...event.metadata,
        },
        event.ipAddress,
        event.userAgent,
      );

    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to broadcast security event: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Handle new device login notifications
   */
  async notifyNewDeviceLogin(
    userId: string,
    tenantId: string,
    deviceInfo: DeviceInfo,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.NEW_DEVICE_LOGIN,
      userId,
      tenantId,
      severity: 'medium',
      title: 'New Device Login',
      message: `Login detected from new ${deviceInfo.platform} device: ${deviceInfo.deviceName}`,
      metadata: {
        deviceId: deviceInfo.deviceId,
        platform: deviceInfo.platform,
        trusted: deviceInfo.trusted,
      },
      timestamp: new Date(),
      deviceInfo,
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Handle suspicious activity detection
   */
  async notifySuspiciousActivity(
    userId: string,
    tenantId: string,
    activityType: string,
    details: string,
    severity: 'medium' | 'high' | 'critical' = 'high',
    metadata?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      userId,
      tenantId,
      severity,
      title: 'Suspicious Activity Detected',
      message: `${activityType}: ${details}`,
      metadata: {
        activityType,
        details,
        ...metadata,
      },
      timestamp: new Date(),
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Handle MFA events
   */
  async notifyMfaEvent(
    userId: string,
    tenantId: string,
    eventType: 'challenge' | 'success' | 'failed',
    method: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const typeMap = {
      challenge: SecurityEventType.MFA_CHALLENGE,
      success: SecurityEventType.MFA_SUCCESS,
      failed: SecurityEventType.MFA_FAILED,
    };

    const severityMap = {
      challenge: 'low' as const,
      success: 'low' as const,
      failed: 'medium' as const,
    };

    const messageMap = {
      challenge: `MFA challenge initiated using ${method}`,
      success: `MFA verification successful using ${method}`,
      failed: `MFA verification failed using ${method}`,
    };

    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: typeMap[eventType],
      userId,
      tenantId,
      severity: severityMap[eventType],
      title: 'MFA Event',
      message: messageMap[eventType],
      metadata: {
        method,
        ...metadata,
      },
      timestamp: new Date(),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Handle authentication success events
   */
  async notifyLoginSuccess(
    userId: string,
    tenantId: string,
    sessionId: string,
    deviceInfo?: DeviceInfo,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.LOGIN_SUCCESS,
      userId,
      tenantId,
      severity: 'low',
      title: 'Login Successful',
      message: `Successful login from ${deviceInfo?.platform || 'unknown'} device`,
      metadata: {
        sessionId,
        platform: deviceInfo?.platform,
        deviceName: deviceInfo?.deviceName,
      },
      timestamp: new Date(),
      ...(deviceInfo ? { deviceInfo } : {}),
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Handle authentication failure events
   */
  async notifyLoginFailed(
    email: string,
    tenantId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    // For failed logins, we don't have a userId, so we broadcast to tenant level
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.LOGIN_FAILED,
      userId: 'unknown',
      tenantId,
      severity: 'medium',
      title: 'Login Failed',
      message: `Failed login attempt for ${email}: ${reason}`,
      metadata: {
        email,
        reason,
      },
      timestamp: new Date(),
      ...(ipAddress ? { ipAddress } : {}),
      ...(userAgent ? { userAgent } : {}),
    };

    // Broadcast to tenant administrators
    await this.broadcastToTenantAdmins(tenantId, 'security_event', {
      id: event.id,
      type: event.type,
      severity: event.severity,
      title: event.title,
      message: event.message,
      metadata: event.metadata,
      timestamp: event.timestamp,
      ipAddress: event.ipAddress,
    });
  }

  /**
   * Handle logout events
   */
  async notifyLogout(
    userId: string,
    tenantId: string,
    sessionId: string,
    reason?: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.LOGOUT,
      userId,
      tenantId,
      severity: 'low',
      title: 'Logout',
      message: reason ? `Logout: ${reason}` : 'User logged out',
      metadata: {
        sessionId,
        reason,
      },
      timestamp: new Date(),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Handle permission change events
   */
  async notifyPermissionChange(
    userId: string,
    tenantId: string,
    changeType: 'granted' | 'revoked',
    permission: string,
    changedBy: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.PERMISSION_CHANGED,
      userId,
      tenantId,
      severity: 'medium',
      title: 'Permission Changed',
      message: `Permission ${permission} was ${changeType} by ${changedBy}`,
      metadata: {
        changeType,
        permission,
        changedBy,
      },
      timestamp: new Date(),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Handle tier change events
   */
  async notifyTierChange(
    userId: string,
    tenantId: string,
    oldTier: string,
    newTier: string,
    changedBy: string,
  ): Promise<void> {
    const event: SecurityEvent = {
      id: this.generateEventId(),
      type: SecurityEventType.TIER_CHANGED,
      userId,
      tenantId,
      severity: 'medium',
      title: 'Tier Changed',
      message: `Tier changed from ${oldTier} to ${newTier} by ${changedBy}`,
      metadata: {
        oldTier,
        newTier,
        changedBy,
      },
      timestamp: new Date(),
    };

    await this.broadcastSecurityEvent(event);
  }

  /**
   * Get security event history for a user
   */
  getSecurityEventHistory(userId: string, limit: number = 50): SecurityEvent[] {
    const events = this.securityEventHistory.get(userId) || [];
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Subscribe to authentication events from the auth module
   */
  @OnEvent('auth.user_login')
  async handleUserLogin(event: AuthEvent): Promise<void> {
    if (event.metadata?.sessionId) {
      await this.notifyLoginSuccess(
        event.userId,
        event.tenantId,
        event.metadata.sessionId,
        event.metadata.deviceInfo,
        event.ipAddress,
        event.userAgent,
      );
    }
  }

  @OnEvent('auth.user_logout')
  async handleUserLogout(event: AuthEvent): Promise<void> {
    if (event.metadata?.sessionId) {
      await this.notifyLogout(
        event.userId,
        event.tenantId,
        event.metadata.sessionId,
        event.metadata.reason,
      );
    }
  }

  @OnEvent('auth.failed_login_attempt')
  async handleFailedLogin(event: AuthEvent): Promise<void> {
    if (event.metadata?.email && event.metadata?.reason) {
      await this.notifyLoginFailed(
        event.metadata.email,
        event.tenantId,
        event.metadata.reason,
        event.ipAddress,
        event.userAgent,
      );
    }
  }

  @OnEvent('auth.permission_granted')
  async handlePermissionGranted(event: AuthEvent): Promise<void> {
    if (event.metadata?.permission && event.metadata?.grantedBy) {
      await this.notifyPermissionChange(
        event.userId,
        event.tenantId,
        'granted',
        event.metadata.permission,
        event.metadata.grantedBy,
      );
    }
  }

  @OnEvent('auth.permission_revoked')
  async handlePermissionRevoked(event: AuthEvent): Promise<void> {
    if (event.metadata?.permission && event.metadata?.revokedBy) {
      await this.notifyPermissionChange(
        event.userId,
        event.tenantId,
        'revoked',
        event.metadata.permission,
        event.metadata.revokedBy,
      );
    }
  }

  /**
   * Private helper methods
   */

  private async emitToUserSessions(
    userId: string,
    tenantId: string,
    eventType: string,
    data: any,
  ): Promise<void> {
    // Emit to user-specific room
    const userRoom = `auth:user:${userId}`;
    this.realtimeGateway.server.to(userRoom).emit(eventType, data);

    // Also emit to tenant room for admin visibility
    const tenantRoom = `auth:tenant:${tenantId}`;
    this.realtimeGateway.server.to(tenantRoom).emit(eventType, {
      ...data,
      targetUserId: userId,
    });
  }

  private async broadcastToTenantAdmins(
    tenantId: string,
    eventType: string,
    data: any,
  ): Promise<void> {
    const adminRoom = `auth:tenant:${tenantId}:admins`;
    this.realtimeGateway.server.to(adminRoom).emit(eventType, data);
  }

  private async sendSecurityNotification(event: SecurityEvent): Promise<void> {
    try {
      await this.notificationService.sendRealtimeNotification(
        event.tenantId,
        [event.userId],
        {
          id: event.id,
          type: 'security_alert',
          title: event.title,
          message: event.message,
          priority: this.mapSeverityToPriority(event.severity),
          metadata: {
            securityEventType: event.type,
            severity: event.severity,
            ...event.metadata,
          },
        },
      );
    } catch (error) {
      this.logger.error('Failed to send security notification:', error);
    }
  }

  private storeSecurityEvent(event: SecurityEvent): void {
    if (!this.securityEventHistory.has(event.userId)) {
      this.securityEventHistory.set(event.userId, []);
    }

    const userEvents = this.securityEventHistory.get(event.userId)!;
    userEvents.push(event);

    // Keep only last 100 events per user
    if (userEvents.length > 100) {
      userEvents.shift();
    }
  }

  private generateEventId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

  private mapSecurityEventToAuthEvent(securityEventType: SecurityEventType): AuthEventType {
    const map: Record<SecurityEventType, AuthEventType> = {
      [SecurityEventType.LOGIN_SUCCESS]: AuthEventType.USER_LOGIN,
      [SecurityEventType.LOGIN_FAILED]: AuthEventType.FAILED_LOGIN_ATTEMPT,
      [SecurityEventType.LOGOUT]: AuthEventType.USER_LOGOUT,
      [SecurityEventType.NEW_DEVICE_LOGIN]: AuthEventType.USER_LOGIN,
      [SecurityEventType.SUSPICIOUS_ACTIVITY]: AuthEventType.FAILED_LOGIN_ATTEMPT,
      [SecurityEventType.MFA_CHALLENGE]: AuthEventType.MFA_ENABLED,
      [SecurityEventType.MFA_SUCCESS]: AuthEventType.MFA_ENABLED,
      [SecurityEventType.MFA_FAILED]: AuthEventType.MFA_DISABLED,
      [SecurityEventType.PASSWORD_CHANGED]: AuthEventType.PASSWORD_CHANGED,
      [SecurityEventType.ACCOUNT_LOCKED]: AuthEventType.ACCOUNT_LOCKED,
      [SecurityEventType.ACCOUNT_UNLOCKED]: AuthEventType.ACCOUNT_UNLOCKED,
      [SecurityEventType.PERMISSION_CHANGED]: AuthEventType.PERMISSION_GRANTED,
      [SecurityEventType.TIER_CHANGED]: AuthEventType.ROLE_ASSIGNED,
      [SecurityEventType.SESSION_EXPIRED]: AuthEventType.SESSION_EXPIRED,
      [SecurityEventType.TOKEN_REFRESH]: AuthEventType.USER_LOGIN,
      [SecurityEventType.SECURITY_SETTINGS_CHANGED]: AuthEventType.PASSWORD_CHANGED,
    };
    return map[securityEventType] || AuthEventType.USER_LOGIN;
  }
}