/**
 * Mobile Security Event Handler
 * Handles authentication security events and cross-device notifications on mobile
 */

import { EventEmitter } from 'events';
import { Platform } from 'react-native';
import { Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { appStorage } from '@/lib/storage';

export interface MobileSecurityEvent {
  id: string;
  type: MobileSecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  actionRequired?: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export enum MobileSecurityEventType {
  NEW_DEVICE_LOGIN = 'new_device_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PASSWORD_CHANGED = 'password_changed',
  MFA_ENABLED = 'mfa_enabled',
  MFA_DISABLED = 'mfa_disabled',
  ACCOUNT_LOCKED = 'account_locked',
  SESSION_TERMINATED = 'session_terminated',
  SECURITY_SETTINGS_CHANGED = 'security_settings_changed',
  PERMISSION_CHANGED = 'permission_changed',
  TIER_CHANGED = 'tier_changed'
}

export interface MobilePushNotificationConfig {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  badgeEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  severityFilter: ('low' | 'medium' | 'high' | 'critical')[];
}

export interface MobileDeviceInfo {
  deviceId: string;
  platform: 'ios' | 'android';
  deviceName: string;
  appVersion: string;
  osVersion: string;
  pushToken?: string;
  biometricEnabled: boolean;
  trusted: boolean;
}

export class MobileSecurityEventHandler extends EventEmitter {
  private config: MobilePushNotificationConfig;
  private eventHistory: MobileSecurityEvent[] = [];
  private readonly maxHistorySize = 100;
  private readonly storageKey = '@security_events';
  private readonly configStorageKey = '@security_event_config';

  constructor() {
    super();
    this.config = {
      enabled: true,
      soundEnabled: true,
      vibrationEnabled: true,
      badgeEnabled: true,
      severityFilter: ['medium', 'high', 'critical'],
    };
    this.initializeHandler();
  }

  /**
   * Initialize the security event handler
   */
  private async initializeHandler(): Promise<void> {
    try {
      // Load configuration
      await this.loadConfiguration();
      
      // Load event history
      await this.loadEventHistory();
      
      // Configure push notifications
      this.configurePushNotifications();
      
      // Setup deep link handling
      this.setupDeepLinkHandling();
      
    } catch (error) {
      console.error('Failed to initialize mobile security event handler:', error);
    }
  }

  /**
   * Handle incoming security event
   */
  async handleSecurityEvent(event: MobileSecurityEvent): Promise<void> {
    try {
      // Add to history
      this.addToHistory(event);
      
      // Check if notification should be shown
      if (this.shouldShowNotification(event)) {
        await this.showPushNotification(event);
      }
      
      // Emit event for app components
      this.emit('securityEvent', event);
      this.emit(`securityEvent:${event.type}`, event);
      
      // Handle critical events
      if (event.severity === 'critical') {
        this.emit('criticalSecurityEvent', event);
        await this.handleCriticalEvent(event);
      }
      
    } catch (error) {
      console.error('Failed to handle security event:', error);
    }
  }

  /**
   * Handle new device login notification
   */
  async handleNewDeviceLogin(
    deviceName: string,
    platform: string,
    ipAddress?: string,
    location?: string,
  ): Promise<void> {
    const event: MobileSecurityEvent = {
      id: this.generateEventId(),
      type: MobileSecurityEventType.NEW_DEVICE_LOGIN,
      severity: 'medium',
      title: 'New Device Login',
      message: `Login detected from ${platform} device: ${deviceName}`,
      metadata: {
        deviceName,
        platform,
        ipAddress,
        location,
      },
      timestamp: new Date(),
      actionRequired: true,
      actionUrl: 'app://security/devices',
      actionLabel: 'Review Devices',
    };

    await this.handleSecurityEvent(event);
  }

  /**
   * Handle suspicious activity notification
   */
  async handleSuspiciousActivity(
    activityType: string,
    details: string,
    severity: 'medium' | 'high' | 'critical' = 'high',
  ): Promise<void> {
    const event: MobileSecurityEvent = {
      id: this.generateEventId(),
      type: MobileSecurityEventType.SUSPICIOUS_ACTIVITY,
      severity,
      title: 'Suspicious Activity Detected',
      message: `${activityType}: ${details}`,
      metadata: {
        activityType,
        details,
      },
      timestamp: new Date(),
      actionRequired: true,
      actionUrl: 'app://security/activity',
      actionLabel: 'Review Activity',
    };

    await this.handleSecurityEvent(event);
  }

  /**
   * Handle MFA event feedback
   */
  async handleMfaEvent(
    eventType: 'challenge' | 'success' | 'failed',
    method: string,
    deviceName?: string,
  ): Promise<void> {
    const titleMap = {
      challenge: 'MFA Challenge',
      success: 'MFA Successful',
      failed: 'MFA Failed',
    };

    const messageMap = {
      challenge: `MFA challenge sent via ${method}`,
      success: `MFA verification successful using ${method}`,
      failed: `MFA verification failed using ${method}`,
    };

    const severityMap = {
      challenge: 'low' as const,
      success: 'low' as const,
      failed: 'medium' as const,
    };

    const event: MobileSecurityEvent = {
      id: this.generateEventId(),
      type: eventType === 'challenge' ? MobileSecurityEventType.MFA_ENABLED : 
            eventType === 'success' ? MobileSecurityEventType.MFA_ENABLED :
            MobileSecurityEventType.MFA_DISABLED,
      severity: severityMap[eventType],
      title: titleMap[eventType],
      message: messageMap[eventType],
      metadata: {
        eventType,
        method,
        deviceName,
      },
      timestamp: new Date(),
    };

    await this.handleSecurityEvent(event);
  }

  /**
   * Update notification configuration
   */
  async updateConfiguration(config: Partial<MobilePushNotificationConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };
      await this.saveConfiguration();
      this.emit('configurationUpdated', this.config);
    } catch (error) {
      console.error('Failed to update configuration:', error);
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfiguration(): MobilePushNotificationConfig {
    return { ...this.config };
  }

  /**
   * Get event history
   */
  getEventHistory(limit?: number): MobileSecurityEvent[] {
    const events = [...this.eventHistory].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return limit ? events.slice(0, limit) : events;
  }

  /**
   * Clear event history
   */
  async clearEventHistory(): Promise<void> {
    try {
      this.eventHistory = [];
      await AsyncStorage.removeItem(this.storageKey);
      this.emit('historyCleared');
    } catch (error) {
      console.error('Failed to clear event history:', error);
      throw error;
    }
  }

  /**
   * Get device information
   */
  async getDeviceInfo(): Promise<MobileDeviceInfo> {
    const deviceId = await this.getDeviceId();
    const appVersion = await this.getAppVersion();
    const osVersion = Platform.Version.toString();
    const pushToken = await this.getPushToken();
    const biometricEnabled = await this.isBiometricEnabled();
    const trusted = await this.isDeviceTrusted();

    return {
      deviceId,
      platform: Platform.OS as 'ios' | 'android',
      deviceName: await this.getDeviceName(),
      appVersion,
      osVersion,
      pushToken,
      biometricEnabled,
      trusted,
    };
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Push notification permissions not granted');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log('Push notification token:', tokenData.data);
      
      // Setup notification handlers
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Handle notification tap
      Notifications.addNotificationResponseReceivedListener((response) => {
        this.handlePushNotificationTap(response.notification.request.content.data);
      });

      return tokenData.data;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  /**
   * Private helper methods
   */

  private async loadConfiguration(): Promise<void> {
    try {
      const configJson = appStorage.getItem(this.configStorageKey);
      if (configJson) {
        const savedConfig = JSON.parse(configJson);
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  private async saveConfiguration(): Promise<void> {
    try {
      appStorage.setItem(this.configStorageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save configuration:', error);
    }
  }

  private async loadEventHistory(): Promise<void> {
    try {
      const historyJson = appStorage.getItem(this.storageKey);
      if (historyJson) {
        const history = JSON.parse(historyJson);
        this.eventHistory = history.map((event: MobileSecurityEvent) => ({
          ...event,
          timestamp: new Date(event.timestamp),
        }));
      }
    } catch (error) {
      console.error('Failed to load event history:', error);
    }
  }

  private async saveEventHistory(): Promise<void> {
    try {
      appStorage.setItem(this.storageKey, JSON.stringify(this.eventHistory));
    } catch (error) {
      console.error('Failed to save event history:', error);
    }
  }

  private addToHistory(event: MobileSecurityEvent): void {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    this.saveEventHistory();
  }

  private shouldShowNotification(event: MobileSecurityEvent): boolean {
    if (!this.config.enabled) {
      return false;
    }

    if (!this.config.severityFilter.includes(event.severity)) {
      return false;
    }

    // Check quiet hours
    if (this.config.quietHoursStart && this.config.quietHoursEnd) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentTime >= this.config.quietHoursStart && currentTime <= this.config.quietHoursEnd) {
        return false;
      }
    }

    return true;
  }

  private async showPushNotification(event: MobileSecurityEvent): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.message,
          sound: this.config.soundEnabled ? 'default' : undefined,
          badge: this.config.badgeEnabled ? this.getUnreadCount() : undefined,
          data: {
            eventId: event.id,
            eventType: event.type,
            actionUrl: event.actionUrl,
          },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to show push notification:', error);
    }
  }

  private handlePushNotificationTap(notificationData: Record<string, unknown>): void {
    const { eventId, eventType, actionUrl } = notificationData || {};
    
    if (typeof actionUrl === 'string') {
      Linking.openURL(actionUrl).catch(error => {
        console.error('Failed to open action URL:', error);
      });
    }

    this.emit('notificationTapped', {
      eventId,
      eventType,
      actionUrl,
      notification: notificationData,
    });
  }

  private async handleCriticalEvent(event: MobileSecurityEvent): Promise<void> {
    // For critical events, show immediate alert
    if (event.actionUrl) {
      setTimeout(() => {
        Linking.openURL(event.actionUrl!).catch(error => {
          console.error('Failed to open critical event URL:', error);
        });
      }, 1000);
    }
  }

  private configurePushNotifications(): void {
    // Configure push notification channels for Android
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('security-events', {
        name: 'Security Events',
        description: 'Authentication and security notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: this.config.vibrationEnabled ? [0, 250, 250, 250] : undefined,
        lightColor: '#FF231F7C',
        sound: this.config.soundEnabled ? 'default' : undefined,
      });
    }
  }

  private setupDeepLinkHandling(): void {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then(url => {
      if (url) {
        this.handleDeepLink(url);
      }
    });

    // Handle deep links when app is already running
    Linking.addEventListener('url', ({ url }) => {
      this.handleDeepLink(url);
    });
  }

  private handleDeepLink(url: string): void {
    try {
      const parsedUrl = new URL(url);
      
      if (parsedUrl.protocol === 'app:' && parsedUrl.hostname === 'security') {
        const path = parsedUrl.pathname;
        const params = Object.fromEntries(parsedUrl.searchParams.entries());
        
        this.emit('deepLinkReceived', {
          path,
          params,
          fullUrl: url,
        });
      }
    } catch (error) {
      console.error('Failed to handle deep link:', error);
    }
  }

  private getUnreadCount(): number {
    // Count events from last 24 hours that haven't been acknowledged
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.eventHistory.filter(event => 
      new Date(event.timestamp) > oneDayAgo && 
      this.config.severityFilter.includes(event.severity)
    ).length;
  }

  private generateEventId(): string {
    return `mobile_sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Device-specific helper methods (would need platform-specific implementations)
  private async getDeviceId(): Promise<string> {
    // Implementation would use react-native-device-info or similar
    return 'device_id_placeholder';
  }

  private async getDeviceName(): Promise<string> {
    // Implementation would use react-native-device-info or similar
    return 'Device Name';
  }

  private async getAppVersion(): Promise<string> {
    // Implementation would use react-native-device-info or similar
    return '1.0.0';
  }

  private async getPushToken(): Promise<string | undefined> {
    // Implementation would get the current push token
    return undefined;
  }

  private async isBiometricEnabled(): Promise<boolean> {
    // Implementation would check biometric availability
    return false;
  }

  private async isDeviceTrusted(): Promise<boolean> {
    // Implementation would check device trust status
    return true;
  }
}

// Singleton instance
export const mobileSecurityEventHandler = new MobileSecurityEventHandler();