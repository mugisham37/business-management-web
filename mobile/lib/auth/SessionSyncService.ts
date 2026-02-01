/**
 * Session Synchronization Service
 * 
 * Handles cross-device session tracking, push notification integration,
 * and deep link authentication flows for mobile devices.
 * 
 * Requirements: 3.5
 */
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { secureStorage, appStorage, STORAGE_KEYS } from '@/lib/storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';
import { EventEmitter } from 'events';

// GraphQL operations for session management
const GET_USER_SESSIONS_QUERY = gql`
  query GetUserSessions($userId: ID!) {
    userSessions(userId: $userId) {
      id
      deviceId
      deviceName
      platform
      ipAddress
      userAgent
      lastActivity
      isActive
      trusted
      location {
        city
        country
      }
    }
  }
`;

const SYNC_SESSION_MUTATION = gql`
  mutation SyncSession($input: SessionSyncInput!) {
    syncSession(input: $input) {
      sessionId
      lastSyncAt
      conflictResolution
    }
  }
`;

const TERMINATE_SESSION_MUTATION = gql`
  mutation TerminateSession($sessionId: ID!) {
    terminateSession(sessionId: $sessionId) {
      success
      terminatedAt
    }
  }
`;

const REGISTER_PUSH_TOKEN_MUTATION = gql`
  mutation RegisterPushToken($input: PushTokenInput!) {
    registerPushToken(input: $input) {
      success
      tokenId
    }
  }
`;

const SECURITY_EVENT_SUBSCRIPTION = gql`
  subscription SecurityEvents($userId: ID!) {
    securityEvents(userId: $userId) {
      id
      type
      severity
      message
      deviceInfo {
        deviceId
        deviceName
        platform
      }
      timestamp
      requiresAction
    }
  }
`;

// Types
export interface UserSession {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  isActive: boolean;
  trusted: boolean;
  location?: {
    city: string;
    country: string;
  };
}

export interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'new_device' | 'suspicious_activity' | 'mfa_challenge' | 'session_expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  deviceInfo: {
    deviceId: string;
    deviceName: string;
    platform: string;
  };
  timestamp: Date;
  requiresAction: boolean;
}

export interface PushNotificationData {
  type: 'security_alert' | 'session_sync' | 'auth_request' | 'device_verification';
  title: string;
  body: string;
  data: Record<string, any>;
  actionRequired?: boolean;
}

export interface DeepLinkAuthFlow {
  type: 'oauth_callback' | 'password_reset' | 'email_verification' | 'device_verification';
  provider?: string;
  token?: string;
  code?: string;
  state?: string;
  error?: string;
}

/**
 * Session Synchronization Service
 */
export class SessionSyncService extends EventEmitter {
  private static instance: SessionSyncService;
  private currentUserId: string | null = null;
  private pushToken: string | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private securitySubscription: any = null;
  private isInitialized = false;

  private constructor() {
    super();
    this.setupNotificationHandlers();
    this.setupDeepLinkHandlers();
  }

  public static getInstance(): SessionSyncService {
    if (!SessionSyncService.instance) {
      SessionSyncService.instance = new SessionSyncService();
    }
    return SessionSyncService.instance;
  }

  /**
   * Initialize session sync for a user
   */
  public async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.currentUserId === userId) {
      return;
    }

    this.currentUserId = userId;
    
    try {
      // Setup push notifications
      await this.setupPushNotifications();
      
      // Start session sync
      await this.startSessionSync();
      
      // Subscribe to security events
      await this.subscribeToSecurityEvents();
      
      this.isInitialized = true;
      this.emit('initialized', { userId });
    } catch (error) {
      console.error('Failed to initialize session sync:', error);
      this.emit('error', { error, context: 'initialization' });
    }
  }

  /**
   * Cleanup session sync
   */
  public async cleanup(): Promise<void> {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.securitySubscription) {
      this.securitySubscription.unsubscribe();
      this.securitySubscription = null;
    }

    this.currentUserId = null;
    this.isInitialized = false;
    this.emit('cleanup');
  }

  /**
   * Setup push notifications
   */
  private async setupPushNotifications(): Promise<void> {
    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Push notification permissions not granted');
        return;
      }

      // Get push token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      this.pushToken = tokenData.data;

      // Register token with backend
      if (this.currentUserId && this.pushToken) {
        await this.registerPushToken();
      }

      // Configure notification handling
      Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
          const rawData = notification.request.content.data;
          const data = rawData as unknown as PushNotificationData | undefined;
          
          // Handle security-related notifications
          if (data?.type === 'security_alert') {
            this.emit('securityAlert', {
              title: notification.request.content.title,
              body: notification.request.content.body,
              data: data.data,
              actionRequired: data.actionRequired,
            });
          }

          return {
            shouldShowAlert: true,
            shouldPlaySound: data?.type === 'security_alert',
            shouldSetBadge: true,
            shouldShowBanner: true,
            shouldShowList: true,
          };
        },
      });

    } catch (error) {
      console.error('Failed to setup push notifications:', error);
    }
  }

  /**
   * Register push token with backend
   */
  private async registerPushToken(): Promise<void> {
    if (!this.currentUserId || !this.pushToken) return;

    try {
      await apolloClient.mutate({
        mutation: REGISTER_PUSH_TOKEN_MUTATION,
        variables: {
          input: {
            userId: this.currentUserId,
            token: this.pushToken,
            platform: Platform.OS,
            deviceInfo: {
              deviceId: appStorage.getString('device_id'),
              deviceName: Device.deviceName,
              appVersion: '1.0.0', // Should come from app config
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  /**
   * Setup notification event handlers
   */
  private setupNotificationHandlers(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      const rawData = notification.request.content.data;
      const data = rawData as unknown as PushNotificationData | undefined;
      if (data) {
        this.handleNotificationReceived(data);
      }
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response) => {
      const rawData = response.notification.request.content.data;
      const data = rawData as unknown as PushNotificationData | undefined;
      if (data) {
        this.handleNotificationTapped(data);
      }
    });
  }

  /**
   * Handle notification received
   */
  private handleNotificationReceived(data: PushNotificationData): void {
    switch (data.type) {
      case 'security_alert':
        this.emit('securityAlert', data);
        break;
      case 'session_sync':
        this.syncSessions();
        break;
      case 'auth_request':
        this.emit('authRequest', data);
        break;
      case 'device_verification':
        this.emit('deviceVerification', data);
        break;
    }
  }

  /**
   * Handle notification tapped
   */
  private handleNotificationTapped(data: PushNotificationData): void {
    this.emit('notificationTapped', data);
  }

  /**
   * Setup deep link handlers
   */
  private setupDeepLinkHandlers(): void {
    Linking.addEventListener('url', ({ url }) => {
      this.handleDeepLink(url);
    });
  }

  /**
   * Handle deep link authentication flows
   */
  public async handleDeepLink(url: string): Promise<DeepLinkAuthFlow | null> {
    try {
      const parsedUrl = Linking.parse(url);
      const { hostname, path, queryParams } = parsedUrl;

      // OAuth callback handling
      if (hostname === 'auth' && path) {
        const provider = path.replace('/', '');
        const { code, state, error } = queryParams || {};

        const flow: DeepLinkAuthFlow = {
          type: 'oauth_callback',
          provider,
          code: code as string,
          state: state as string,
          error: error as string,
        };

        this.emit('deepLinkAuth', flow);
        return flow;
      }

      // Password reset handling
      if (hostname === 'reset-password') {
        const { token } = queryParams || {};
        
        const flow: DeepLinkAuthFlow = {
          type: 'password_reset',
          token: token as string,
        };

        this.emit('deepLinkAuth', flow);
        return flow;
      }

      // Email verification handling
      if (hostname === 'verify-email') {
        const { token } = queryParams || {};
        
        const flow: DeepLinkAuthFlow = {
          type: 'email_verification',
          token: token as string,
        };

        this.emit('deepLinkAuth', flow);
        return flow;
      }

      // Device verification handling
      if (hostname === 'verify-device') {
        const { token, deviceId } = queryParams || {};
        
        const flow: DeepLinkAuthFlow = {
          type: 'device_verification',
          token: token as string,
          code: deviceId as string,
        };

        this.emit('deepLinkAuth', flow);
        return flow;
      }

      return null;
    } catch (error) {
      console.error('Failed to handle deep link:', error);
      this.emit('error', { error, context: 'deep_link' });
      return null;
    }
  }

  /**
   * Start session synchronization
   */
  private async startSessionSync(): Promise<void> {
    // Initial sync
    await this.syncSessions();

    // Setup periodic sync (every 5 minutes)
    this.syncInterval = setInterval(() => {
      this.syncSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * Sync sessions across devices
   */
  public async syncSessions(): Promise<UserSession[]> {
    if (!this.currentUserId) return [];

    try {
      // Get current sessions from backend
      const { data } = await apolloClient.query({
        query: GET_USER_SESSIONS_QUERY,
        variables: { userId: this.currentUserId },
        fetchPolicy: 'network-only',
      });

      const sessions: UserSession[] = data?.userSessions?.map((session: any) => ({
        ...session,
        lastActivity: new Date(session.lastActivity),
      })) || [];

      // Sync current session
      await this.syncCurrentSession();

      this.emit('sessionsUpdated', sessions);
      return sessions;
    } catch (error) {
      console.error('Failed to sync sessions:', error);
      this.emit('error', { error, context: 'session_sync' });
      return [];
    }
  }

  /**
   * Sync current session with backend
   */
  private async syncCurrentSession(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      const deviceId = appStorage.getString('device_id');
      
      await apolloClient.mutate({
        mutation: SYNC_SESSION_MUTATION,
        variables: {
          input: {
            userId: this.currentUserId,
            deviceId,
            lastActivity: new Date().toISOString(),
            platform: Platform.OS,
            appVersion: '1.0.0',
          },
        },
      });
    } catch (error) {
      console.error('Failed to sync current session:', error);
    }
  }

  /**
   * Terminate a session
   */
  public async terminateSession(sessionId: string): Promise<boolean> {
    try {
      const { data } = await apolloClient.mutate({
        mutation: TERMINATE_SESSION_MUTATION,
        variables: { sessionId },
      });

      const success = data?.terminateSession?.success || false;
      
      if (success) {
        this.emit('sessionTerminated', { sessionId });
        // Refresh sessions list
        await this.syncSessions();
      }

      return success;
    } catch (error) {
      console.error('Failed to terminate session:', error);
      this.emit('error', { error, context: 'session_termination' });
      return false;
    }
  }

  /**
   * Subscribe to security events
   */
  private async subscribeToSecurityEvents(): Promise<void> {
    if (!this.currentUserId) return;

    try {
      this.securitySubscription = apolloClient.subscribe({
        query: SECURITY_EVENT_SUBSCRIPTION,
        variables: { userId: this.currentUserId },
      }).subscribe({
        next: ({ data }) => {
          const event: SecurityEvent = {
            ...data.securityEvents,
            timestamp: new Date(data.securityEvents.timestamp),
          };
          
          this.handleSecurityEvent(event);
        },
        error: (error) => {
          console.error('Security events subscription error:', error);
          this.emit('error', { error, context: 'security_subscription' });
        },
      });
    } catch (error) {
      console.error('Failed to subscribe to security events:', error);
    }
  }

  /**
   * Handle security events
   */
  private handleSecurityEvent(event: SecurityEvent): void {
    this.emit('securityEvent', event);

    // Handle specific event types
    switch (event.type) {
      case 'new_device':
        this.emit('newDeviceLogin', event);
        break;
      case 'suspicious_activity':
        this.emit('suspiciousActivity', event);
        break;
      case 'session_expired':
        this.emit('sessionExpired', event);
        break;
      case 'mfa_challenge':
        this.emit('mfaChallenge', event);
        break;
    }
  }

  /**
   * Get current push token
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
   * Get current user ID
   */
  public getCurrentUserId(): string | null {
    return this.currentUserId;
  }
}

// Export singleton instance
export const sessionSyncService = SessionSyncService.getInstance();