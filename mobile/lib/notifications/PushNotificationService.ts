/**
 * Push Notification Service
 * 
 * Handles push notification integration for security events,
 * authentication requests, and session management.
 * 
 * Requirements: 3.5
 */
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { EventEmitter } from 'events';
import { sessionSyncService } from '@/lib/auth/SessionSyncService';

// Notification categories for different types of security events
const NOTIFICATION_CATEGORIES = {
  SECURITY_ALERT: 'security_alert',
  AUTH_REQUEST: 'auth_request',
  SESSION_SYNC: 'session_sync',
  DEVICE_VERIFICATION: 'device_verification',
} as const;

// Notification actions
const NOTIFICATION_ACTIONS = {
  APPROVE: 'approve',
  DENY: 'deny',
  VIEW_DETAILS: 'view_details',
  SECURE_ACCOUNT: 'secure_account',
} as const;

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

export interface SecurityNotification {
  id: string;
  type: 'SECURITY_ALERT' | 'AUTH_REQUEST' | 'SESSION_SYNC' | 'DEVICE_VERIFICATION';
  title: string;
  body: string;
  data: Record<string, any>;
  priority: 'default' | 'high' | 'max';
  sound?: string;
  vibrate?: boolean;
  actions?: Array<{
    id: string;
    title: string;
    destructive?: boolean;
  }>;
}

/**
 * Push Notification Service
 */
export class PushNotificationService extends EventEmitter {
  private static instance: PushNotificationService;
  private isInitialized = false;
  private pushToken: string | null = null;
  private permissions: NotificationPermissions | null = null;

  private constructor() {
    super();
    this.setupNotificationCategories();
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notification service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.warn('Push notifications are not supported on simulator/emulator');
        return;
      }

      // Request permissions
      await this.requestPermissions();

      // Get push token
      await this.fetchPushToken();

      // Setup notification handlers
      this.setupNotificationHandlers();

      // Setup notification categories and actions
      await this.setupNotificationCategories();

      this.isInitialized = true;
      this.emit('initialized', { pushToken: this.pushToken });
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      this.emit('error', { error, context: 'initialization' });
    }
  }

  /**
   * Request notification permissions
   */
  public async requestPermissions(): Promise<NotificationPermissions> {
    try {
      const { status, canAskAgain } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: false,
        },
      });

      this.permissions = {
        granted: status === 'granted',
        canAskAgain,
        status: status as 'granted' | 'denied' | 'undetermined',
      };

      return this.permissions;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      this.permissions = {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
      return this.permissions;
    }
  }

  /**
   * Get push notification token
   */
  private async fetchPushToken(): Promise<string | null> {
    try {
      if (!this.permissions?.granted) {
        console.warn('Push notification permissions not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      this.pushToken = tokenData.data;
      
      return this.pushToken;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Get the current push token (synchronous)
   */
  public getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get current permissions
   */
  public getPermissions(): NotificationPermissions | null {
    return this.permissions;
  }

  /**
   * Setup notification categories and actions
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.SECURITY_ALERT, [
        {
          identifier: NOTIFICATION_ACTIONS.VIEW_DETAILS,
          buttonTitle: 'View Details',
          options: {
            opensAppToForeground: true,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.SECURE_ACCOUNT,
          buttonTitle: 'Secure Account',
          options: {
            opensAppToForeground: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.AUTH_REQUEST, [
        {
          identifier: NOTIFICATION_ACTIONS.APPROVE,
          buttonTitle: 'Approve',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.DENY,
          buttonTitle: 'Deny',
          options: {
            opensAppToForeground: false,
            isDestructive: true,
          },
        },
      ]);

      await Notifications.setNotificationCategoryAsync(NOTIFICATION_CATEGORIES.DEVICE_VERIFICATION, [
        {
          identifier: NOTIFICATION_ACTIONS.APPROVE,
          buttonTitle: 'Trust Device',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: NOTIFICATION_ACTIONS.DENY,
          buttonTitle: 'Block Device',
          options: {
            opensAppToForeground: false,
            isDestructive: true,
          },
        },
      ]);
    } catch (error) {
      console.error('Failed to setup notification categories:', error);
    }
  }

  /**
   * Setup notification handlers
   */
  private setupNotificationHandlers(): void {
    // Configure how notifications are handled when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data;
        const type = data.type as keyof typeof NOTIFICATION_CATEGORIES;

        // Determine notification behavior based on type
        switch (type) {
          case 'security_alert':
            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            };
          case 'auth_request':
            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: false,
            };
          case 'session_sync':
            return {
              shouldShowAlert: false,
              shouldPlaySound: false,
              shouldSetBadge: false,
            };
          case 'device_verification':
            return {
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
            };
          default:
            return {
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: true,
            };
        }
      },
    });

    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      this.handleNotificationReceived(notification, data);
    });

    // Handle notification tapped (app opened from notification)
    Notifications.addNotificationResponseReceivedListener((response) => {
      const notification = response.notification;
      const data = notification.request.content.data;
      const actionIdentifier = response.actionIdentifier;
      
      this.handleNotificationResponse(notification, data, actionIdentifier);
    });
  }

  /**
   * Handle notification received while app is active
   */
  private handleNotificationReceived(notification: Notifications.Notification, data: any): void {
    const type = data.type as keyof typeof NOTIFICATION_CATEGORIES;
    
    this.emit('notificationReceived', {
      notification,
      type,
      data,
    });

    // Handle specific notification types
    switch (type) {
      case 'security_alert':
        this.emit('securityAlert', { notification, data });
        break;
      case 'auth_request':
        this.emit('authRequest', { notification, data });
        break;
      case 'session_sync':
        // Trigger session sync
        sessionSyncService.syncSessions();
        break;
      case 'device_verification':
        this.emit('deviceVerification', { notification, data });
        break;
    }
  }

  /**
   * Handle notification response (tapped or action taken)
   */
  private handleNotificationResponse(
    notification: Notifications.Notification, 
    data: any, 
    actionIdentifier: string
  ): void {
    const type = data.type as keyof typeof NOTIFICATION_CATEGORIES;
    
    this.emit('notificationResponse', {
      notification,
      type,
      data,
      action: actionIdentifier,
    });

    // Handle specific actions
    switch (actionIdentifier) {
      case NOTIFICATION_ACTIONS.APPROVE:
        this.handleApproveAction(type, data);
        break;
      case NOTIFICATION_ACTIONS.DENY:
        this.handleDenyAction(type, data);
        break;
      case NOTIFICATION_ACTIONS.VIEW_DETAILS:
        this.handleViewDetailsAction(type, data);
        break;
      case NOTIFICATION_ACTIONS.SECURE_ACCOUNT:
        this.handleSecureAccountAction(type, data);
        break;
      case Notifications.DEFAULT_ACTION_IDENTIFIER:
        this.handleDefaultAction(type, data);
        break;
    }
  }

  /**
   * Handle approve action
   */
  private handleApproveAction(type: keyof typeof NOTIFICATION_CATEGORIES, data: any): void {
    this.emit('actionApprove', { type, data });
  }

  /**
   * Handle deny action
   */
  private handleDenyAction(type: keyof typeof NOTIFICATION_CATEGORIES, data: any): void {
    this.emit('actionDeny', { type, data });
  }

  /**
   * Handle view details action
   */
  private handleViewDetailsAction(type: keyof typeof NOTIFICATION_CATEGORIES, data: any): void {
    this.emit('actionViewDetails', { type, data });
  }

  /**
   * Handle secure account action
   */
  private handleSecureAccountAction(type: keyof typeof NOTIFICATION_CATEGORIES, data: any): void {
    this.emit('actionSecureAccount', { type, data });
  }

  /**
   * Handle default action (notification tapped)
   */
  private handleDefaultAction(type: keyof typeof NOTIFICATION_CATEGORIES, data: any): void {
    this.emit('actionDefault', { type, data });
  }

  /**
   * Send local notification for testing
   */
  public async sendLocalNotification(notification: SecurityNotification): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
          categoryIdentifier: notification.type,
          sound: notification.sound || 'default',
        },
        trigger: null, // Send immediately
      });

      return notificationId;
    } catch (error) {
      console.error('Failed to send local notification:', error);
      throw error;
    }
  }

  /**
   * Cancel notification
   */
  public async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  /**
   * Cancel all notifications
   */
  public async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  /**
   * Get notification permissions
   */
  public getPermissions(): NotificationPermissions | null {
    return this.permissions;
  }

  /**
   * Get push token
   */
  public getPushToken(): string | null {
    return this.pushToken;
  }

  /**
   * Check if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Cleanup service
   */
  public cleanup(): void {
    this.removeAllListeners();
    this.isInitialized = false;
    this.pushToken = null;
    this.permissions = null;
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance();