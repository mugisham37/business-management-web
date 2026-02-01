/**
 * Mobile Auth Events Hook
 * Real-time authentication events with mobile optimizations
 */

import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { MobileWebSocketManager } from '@/lib/realtime/MobileWebSocketManager';
import { useAuth } from './useAuth';

export interface AuthEvent {
  id: string;
  type: AuthEventType;
  userId: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    platform: string;
    deviceId: string;
    appVersion: string;
  };
}

export enum AuthEventType {
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTERED = 'USER_REGISTERED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PERMISSION_GRANTED = 'PERMISSION_GRANTED',
  PERMISSION_REVOKED = 'PERMISSION_REVOKED',
  ROLE_ASSIGNED = 'ROLE_ASSIGNED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  DEVICE_TRUSTED = 'DEVICE_TRUSTED',
  DEVICE_UNTRUSTED = 'DEVICE_UNTRUSTED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export interface SecurityAlert {
  id: string;
  type: SecurityAlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  actionRequired?: boolean;
  metadata?: Record<string, any>;
}

export enum SecurityAlertType {
  NEW_DEVICE_LOGIN = 'NEW_DEVICE_LOGIN',
  SUSPICIOUS_LOGIN = 'SUSPICIOUS_LOGIN',
  MULTIPLE_FAILED_ATTEMPTS = 'MULTIPLE_FAILED_ATTEMPTS',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  PASSWORD_BREACH = 'PASSWORD_BREACH',
  PERMISSION_ESCALATION = 'PERMISSION_ESCALATION',
  UNUSUAL_ACTIVITY = 'UNUSUAL_ACTIVITY',
}

export interface AuthEventsState {
  isConnected: boolean;
  events: AuthEvent[];
  securityAlerts: SecurityAlert[];
  unreadCount: number;
  lastEventTime?: Date;
}

export interface UseAuthEventsOptions {
  enablePushNotifications?: boolean;
  maxEvents?: number;
  autoAcknowledge?: boolean;
  eventTypes?: AuthEventType[];
}

export interface UseAuthEventsReturn {
  state: AuthEventsState;
  
  // Event management
  acknowledgeAlert: (alertId: string) => void;
  clearEvents: () => void;
  markAllAsRead: () => void;
  
  // Filtering
  getEventsByType: (type: AuthEventType) => AuthEvent[];
  getUnacknowledgedAlerts: () => SecurityAlert[];
  getCriticalAlerts: () => SecurityAlert[];
  
  // Connection management
  connect: () => void;
  disconnect: () => void;
}

export function useAuthEvents(options: UseAuthEventsOptions = {}): UseAuthEventsReturn {
  const {
    enablePushNotifications = true,
    maxEvents = 100,
    autoAcknowledge = false,
    eventTypes,
  } = options;

  const { user } = useAuth();
  const [state, setState] = useState<AuthEventsState>({
    isConnected: false,
    events: [],
    securityAlerts: [],
    unreadCount: 0,
  });

  const wsManager = MobileWebSocketManager.getInstance();

  // Setup WebSocket connection and event handlers
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribeState = wsManager.onStateChange((wsState) => {
      setState(prev => ({
        ...prev,
        isConnected: wsState.isConnected,
      }));
    });

    const unsubscribeAuthEvents = wsManager.subscribe('auth_event', handleAuthEvent);
    const unsubscribeSecurityAlerts = wsManager.subscribe('security_alert', handleSecurityAlert);

    // Connect to WebSocket
    wsManager.connect();

    return () => {
      unsubscribeState();
      unsubscribeAuthEvents();
      unsubscribeSecurityAlerts();
    };
  }, [user?.id]);

  // Setup push notifications
  useEffect(() => {
    if (enablePushNotifications) {
      setupPushNotifications();
    }
  }, [enablePushNotifications]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, mark notifications as read
        markAllAsRead();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const handleAuthEvent = useCallback((message: any) => {
    try {
      const event: AuthEvent = {
        ...message.payload,
        timestamp: new Date(message.payload.timestamp),
      };

      // Filter by event types if specified
      if (eventTypes && !eventTypes.includes(event.type)) {
        return;
      }

      setState(prev => {
        const newEvents = [event, ...prev.events].slice(0, maxEvents);
        return {
          ...prev,
          events: newEvents,
          unreadCount: prev.unreadCount + 1,
          lastEventTime: event.timestamp,
        };
      });

      // Show push notification for critical events
      if (shouldShowNotification(event)) {
        showPushNotification(event);
      }

    } catch (error) {
      console.error('Failed to handle auth event:', error);
    }
  }, [eventTypes, maxEvents]);

  const handleSecurityAlert = useCallback((message: any) => {
    try {
      const alert: SecurityAlert = {
        ...message.payload,
        timestamp: new Date(message.payload.timestamp),
        acknowledged: autoAcknowledge,
      };

      setState(prev => ({
        ...prev,
        securityAlerts: [alert, ...prev.securityAlerts].slice(0, 50), // Keep last 50 alerts
        unreadCount: prev.unreadCount + (autoAcknowledge ? 0 : 1),
      }));

      // Show push notification for security alerts
      if (alert.severity === 'high' || alert.severity === 'critical') {
        showSecurityAlertNotification(alert);
      }

    } catch (error) {
      console.error('Failed to handle security alert:', error);
    }
  }, [autoAcknowledge]);

  const setupPushNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Push notification permissions not granted');
        return;
      }

      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  };

  const shouldShowNotification = (event: AuthEvent): boolean => {
    const criticalEvents = [
      AuthEventType.FAILED_LOGIN_ATTEMPT,
      AuthEventType.ACCOUNT_LOCKED,
      AuthEventType.SUSPICIOUS_ACTIVITY,
      AuthEventType.DEVICE_TRUSTED,
      AuthEventType.PASSWORD_CHANGED,
    ];

    return criticalEvents.includes(event.type);
  };

  const showPushNotification = async (event: AuthEvent) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: getEventTitle(event.type),
          body: getEventMessage(event),
          data: { eventId: event.id, type: 'auth_event' },
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to show push notification:', error);
    }
  };

  const showSecurityAlertNotification = async (alert: SecurityAlert) => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Security Alert: ${alert.title}`,
          body: alert.message,
          data: { alertId: alert.id, type: 'security_alert' },
          sound: true,
          priority: alert.severity === 'critical' ? 'high' : 'normal',
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Failed to show security alert notification:', error);
    }
  };

  const getEventTitle = (type: AuthEventType): string => {
    const titles: Record<AuthEventType, string> = {
      [AuthEventType.USER_LOGIN]: 'New Login',
      [AuthEventType.USER_LOGOUT]: 'Logout',
      [AuthEventType.USER_REGISTERED]: 'Account Created',
      [AuthEventType.PASSWORD_CHANGED]: 'Password Changed',
      [AuthEventType.MFA_ENABLED]: 'Two-Factor Authentication Enabled',
      [AuthEventType.MFA_DISABLED]: 'Two-Factor Authentication Disabled',
      [AuthEventType.PERMISSION_GRANTED]: 'Permission Granted',
      [AuthEventType.PERMISSION_REVOKED]: 'Permission Revoked',
      [AuthEventType.ROLE_ASSIGNED]: 'Role Assigned',
      [AuthEventType.SESSION_EXPIRED]: 'Session Expired',
      [AuthEventType.FAILED_LOGIN_ATTEMPT]: 'Failed Login Attempt',
      [AuthEventType.ACCOUNT_LOCKED]: 'Account Locked',
      [AuthEventType.ACCOUNT_UNLOCKED]: 'Account Unlocked',
      [AuthEventType.DEVICE_TRUSTED]: 'Device Trusted',
      [AuthEventType.DEVICE_UNTRUSTED]: 'Device Untrusted',
      [AuthEventType.SUSPICIOUS_ACTIVITY]: 'Suspicious Activity',
    };

    return titles[type] || 'Security Event';
  };

  const getEventMessage = (event: AuthEvent): string => {
    const deviceInfo = event.deviceInfo ? ` from ${event.deviceInfo.platform}` : '';
    const location = event.ipAddress ? ` (${event.ipAddress})` : '';
    
    return `${getEventTitle(event.type)}${deviceInfo}${location}`;
  };

  // Public methods
  const acknowledgeAlert = useCallback((alertId: string) => {
    setState(prev => ({
      ...prev,
      securityAlerts: prev.securityAlerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ),
      unreadCount: Math.max(0, prev.unreadCount - 1),
    }));
  }, []);

  const clearEvents = useCallback(() => {
    setState(prev => ({
      ...prev,
      events: [],
      securityAlerts: [],
      unreadCount: 0,
    }));
  }, []);

  const markAllAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      unreadCount: 0,
      securityAlerts: prev.securityAlerts.map(alert => ({
        ...alert,
        acknowledged: true,
      })),
    }));
  }, []);

  const getEventsByType = useCallback((type: AuthEventType): AuthEvent[] => {
    return state.events.filter(event => event.type === type);
  }, [state.events]);

  const getUnacknowledgedAlerts = useCallback((): SecurityAlert[] => {
    return state.securityAlerts.filter(alert => !alert.acknowledged);
  }, [state.securityAlerts]);

  const getCriticalAlerts = useCallback((): SecurityAlert[] => {
    return state.securityAlerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'high'
    );
  }, [state.securityAlerts]);

  const connect = useCallback(() => {
    wsManager.connect();
  }, []);

  const disconnect = useCallback(() => {
    wsManager.disconnect();
  }, []);

  return {
    state,
    acknowledgeAlert,
    clearEvents,
    markAllAsRead,
    getEventsByType,
    getUnacknowledgedAlerts,
    getCriticalAlerts,
    connect,
    disconnect,
  };
}