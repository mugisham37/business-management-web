/**
 * Authentication Event Manager
 * Handles real-time authentication events and security notifications
 */

import { webSocketManager } from './websocket-manager';
import { EventEmitter } from 'events';

export interface AuthEvent {
  id: string;
  type: AuthEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  ipAddress?: string;
  deviceInfo?: DeviceInfo;
  targetUserId?: string;
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

export enum AuthEventType {
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

export interface SessionEvent {
  id: string;
  type: SessionEventType;
  sessionId: string;
  deviceInfo?: DeviceInfo;
  reason?: string;
  timestamp: Date;
  targetUserId?: string;
}

export enum SessionEventType {
  SESSION_CREATED = 'session_created',
  SESSION_TERMINATED = 'session_terminated',
  SESSION_EXPIRED = 'session_expired',
  SESSION_RENEWED = 'session_renewed'
}

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actionRequired?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  targetUserId?: string;
}

export enum SecurityAlertType {
  SUSPICIOUS_LOGIN = 'suspicious_login',
  MULTIPLE_FAILED_LOGINS = 'multiple_failed_logins',
  UNUSUAL_LOCATION = 'unusual_location',
  NEW_DEVICE_DETECTED = 'new_device_detected',
  ACCOUNT_COMPROMISE_SUSPECTED = 'account_compromise_suspected',
  SECURITY_POLICY_VIOLATION = 'security_policy_violation'
}

export interface CrossDeviceNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  sourceDevice?: DeviceInfo;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  excludeDevices?: string[];
}

export interface AuthEventSubscriptionOptions {
  eventTypes?: AuthEventType[];
  includeOtherUsers?: boolean;
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
}

export interface SessionEventSubscriptionOptions {
  includeOtherSessions?: boolean;
  sessionTypes?: SessionEventType[];
}

export interface SecurityAlertSubscriptionOptions {
  severity?: ('low' | 'medium' | 'high' | 'critical')[];
  includeAllUsers?: boolean;
  alertTypes?: SecurityAlertType[];
}

export class AuthEventManager extends EventEmitter {
  private isSubscribedToAuthEvents = false;
  private isSubscribedToSessionEvents = false;
  private isSubscribedToSecurityAlerts = false;
  private eventHistory: AuthEvent[] = [];
  private sessionHistory: SessionEvent[] = [];
  private alertHistory: SecurityAlert[] = [];
  private readonly maxHistorySize = 100;

  constructor() {
    super();
    this.setupWebSocketListeners();
  }

  /**
   * Subscribe to authentication events
   */
  async subscribeToAuthEvents(options: AuthEventSubscriptionOptions = {}): Promise<void> {
    if (!webSocketManager.getState().isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      webSocketManager.send({
        type: 'subscribe_auth_events',
        data: {
          eventTypes: options.eventTypes,
          includeOtherUsers: options.includeOtherUsers || false,
        },
      });

      this.isSubscribedToAuthEvents = true;
      this.emit('subscriptionChanged', { type: 'auth_events', subscribed: true });

    } catch (error) {
      console.error('Failed to subscribe to auth events:', error);
      throw error;
    }
  }

  /**
   * Subscribe to session events
   */
  async subscribeToSessionEvents(options: SessionEventSubscriptionOptions = {}): Promise<void> {
    if (!webSocketManager.getState().isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      webSocketManager.send({
        type: 'subscribe_session_events',
        data: {
          includeOtherSessions: options.includeOtherSessions || false,
        },
      });

      this.isSubscribedToSessionEvents = true;
      this.emit('subscriptionChanged', { type: 'session_events', subscribed: true });

    } catch (error) {
      console.error('Failed to subscribe to session events:', error);
      throw error;
    }
  }

  /**
   * Subscribe to security alerts
   */
  async subscribeToSecurityAlerts(options: SecurityAlertSubscriptionOptions = {}): Promise<void> {
    if (!webSocketManager.getState().isConnected) {
      throw new Error('WebSocket not connected');
    }

    try {
      webSocketManager.send({
        type: 'subscribe_security_alerts',
        data: {
          severity: options.severity,
          includeAllUsers: options.includeAllUsers || false,
        },
      });

      this.isSubscribedToSecurityAlerts = true;
      this.emit('subscriptionChanged', { type: 'security_alerts', subscribed: true });

    } catch (error) {
      console.error('Failed to subscribe to security alerts:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from all authentication-related events
   */
  async unsubscribeFromAll(): Promise<void> {
    const unsubscribePromises = [];

    if (this.isSubscribedToAuthEvents) {
      unsubscribePromises.push(this.unsubscribeFromAuthEvents());
    }

    if (this.isSubscribedToSessionEvents) {
      unsubscribePromises.push(this.unsubscribeFromSessionEvents());
    }

    if (this.isSubscribedToSecurityAlerts) {
      unsubscribePromises.push(this.unsubscribeFromSecurityAlerts());
    }

    await Promise.all(unsubscribePromises);
  }

  /**
   * Get authentication event history
   */
  getAuthEventHistory(limit?: number): AuthEvent[] {
    const events = [...this.eventHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Get session event history
   */
  getSessionEventHistory(limit?: number): SessionEvent[] {
    const events = [...this.sessionHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Get security alert history
   */
  getSecurityAlertHistory(limit?: number): SecurityAlert[] {
    const alerts = [...this.alertHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? alerts.slice(0, limit) : alerts;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus() {
    return {
      authEvents: this.isSubscribedToAuthEvents,
      sessionEvents: this.isSubscribedToSessionEvents,
      securityAlerts: this.isSubscribedToSecurityAlerts,
    };
  }

  /**
   * Clear event history
   */
  clearHistory(type?: 'auth' | 'session' | 'security'): void {
    if (!type || type === 'auth') {
      this.eventHistory = [];
    }
    if (!type || type === 'session') {
      this.sessionHistory = [];
    }
    if (!type || type === 'security') {
      this.alertHistory = [];
    }
    
    this.emit('historyCleared', { type });
  }

  /**
   * Private methods
   */

  private setupWebSocketListeners(): void {
    // Listen for authentication events
    webSocketManager.on('message:auth_event', (data: Record<string, unknown>) => {
      const authEvent: AuthEvent = {
        id: String(data.id || ''),
        type: (data.type as AuthEventType) || AuthEventType.LOGIN_SUCCESS,
        severity: (data.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
        title: String(data.title || ''),
        message: String(data.message || ''),
        metadata: (data.metadata as Record<string, unknown>) || undefined,
        timestamp: new Date(String(data.timestamp || new Date())),
        ...((data.ipAddress) && { ipAddress: String(data.ipAddress) }),
        deviceInfo: data.deviceInfo as DeviceInfo | undefined,
        targetUserId: data.targetUserId as string | undefined,
      };
      this.handleAuthEvent(authEvent);
    });

    // Listen for session events
    webSocketManager.on('message:session_event', (data: Record<string, unknown>) => {
      const sessionEvent: SessionEvent = {
        id: String(data.id || ''),
        type: (data.type as string) || 'session_event',
        sessionId: String(data.sessionId || ''),
        timestamp: new Date(String(data.timestamp || new Date())),
        userId: String(data.userId || ''),
        deviceInfo: data.deviceInfo as DeviceInfo | undefined,
        metadata: (data.metadata as Record<string, unknown>) || undefined,
      };
      this.handleSessionEvent(sessionEvent);
    });

    // Listen for security alerts
    webSocketManager.on('message:security_alert', (data: Record<string, unknown>) => {
      const securityAlert: SecurityAlert = {
        id: String(data.id || ''),
        type: (data.type as string) || 'security_alert',
        severity: (data.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
        title: String(data.title || ''),
        message: String(data.message || ''),
        timestamp: new Date(String(data.timestamp || new Date())),
        metadata: (data.metadata as Record<string, unknown>) || undefined,
      };
      this.handleSecurityAlert(securityAlert);
    });

    // Listen for cross-device notifications
    webSocketManager.on('message:cross_device_notification', (data: Record<string, unknown>) => {
      const notification: CrossDeviceNotification = {
        id: String(data.id || ''),
        type: (data.type as string) || 'notification',
        title: String(data.title || ''),
        message: String(data.message || ''),
        severity: (data.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
        sourceDevice: data.sourceDevice as DeviceInfo | undefined,
        metadata: (data.metadata as Record<string, unknown>) || undefined,
        timestamp: new Date(String(data.timestamp || new Date())),
        excludeDevices: (data.excludeDevices as string[]) || undefined,
      };
      this.handleCrossDeviceNotification(notification);
    });

    // Listen for security events (from auth realtime service)
    webSocketManager.on('message:security_event', (data: Record<string, unknown>) => {
      const securityEvent: AuthEvent = {
        id: String(data.id || ''),
        type: (data.type as AuthEventType) || AuthEventType.LOGIN_SUCCESS,
        severity: (data.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
        title: String(data.title || ''),
        message: String(data.message || ''),
        metadata: (data.metadata as Record<string, unknown>) || undefined,
        timestamp: new Date(String(data.timestamp || new Date())),
        ...((data.ipAddress) && { ipAddress: String(data.ipAddress) }),
        deviceInfo: data.deviceInfo as DeviceInfo | undefined,
        targetUserId: data.targetUserId as string | undefined,
      };
      this.handleAuthEvent(securityEvent);
    });

    // Handle connection state changes
    webSocketManager.on('connected', () => {
      this.emit('connectionStateChanged', { connected: true });
    });

    webSocketManager.on('disconnected', () => {
      this.isSubscribedToAuthEvents = false;
      this.isSubscribedToSessionEvents = false;
      this.isSubscribedToSecurityAlerts = false;
      this.emit('connectionStateChanged', { connected: false });
    });
  }

  private handleAuthEvent(event: AuthEvent): void {
    // Add to history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Emit event for listeners
    this.emit('authEvent', event);
    this.emit(`authEvent:${event.type}`, event);

    // Handle high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      this.emit('criticalAuthEvent', event);
    }
  }

  private handleSessionEvent(event: SessionEvent): void {
    // Add to history
    this.sessionHistory.push(event);
    if (this.sessionHistory.length > this.maxHistorySize) {
      this.sessionHistory.shift();
    }

    // Emit event for listeners
    this.emit('sessionEvent', event);
    this.emit(`sessionEvent:${event.type}`, event);
  }

  private handleSecurityAlert(alert: SecurityAlert): void {
    // Add to history
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift();
    }

    // Emit event for listeners
    this.emit('securityAlert', alert);
    this.emit(`securityAlert:${alert.type}`, alert);

    // Handle critical alerts
    if (alert.severity === 'critical') {
      this.emit('criticalSecurityAlert', alert);
    }
  }

  private handleCrossDeviceNotification(notification: CrossDeviceNotification): void {
    // Emit event for listeners
    this.emit('crossDeviceNotification', notification);

    // Convert to auth event for history
    const authEvent: AuthEvent = {
      id: notification.id,
      type: notification.type as AuthEventType,
      severity: notification.severity,
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata,
      timestamp: notification.timestamp,
      deviceInfo: notification.sourceDevice,
    };

    this.handleAuthEvent(authEvent);
  }

  private async unsubscribeFromAuthEvents(): Promise<void> {
    webSocketManager.send({
      type: 'unsubscribe',
      data: { room: 'auth_events' },
    });
    this.isSubscribedToAuthEvents = false;
    this.emit('subscriptionChanged', { type: 'auth_events', subscribed: false });
  }

  private async unsubscribeFromSessionEvents(): Promise<void> {
    webSocketManager.send({
      type: 'unsubscribe',
      data: { room: 'session_events' },
    });
    this.isSubscribedToSessionEvents = false;
    this.emit('subscriptionChanged', { type: 'session_events', subscribed: false });
  }

  private async unsubscribeFromSecurityAlerts(): Promise<void> {
    webSocketManager.send({
      type: 'unsubscribe',
      data: { room: 'security_alerts' },
    });
    this.isSubscribedToSecurityAlerts = false;
    this.emit('subscriptionChanged', { type: 'security_alerts', subscribed: false });
  }
}

// Singleton instance
export const authEventManager = new AuthEventManager();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    authEventManager.unsubscribeFromAll();
  });
}