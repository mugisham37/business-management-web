/**
 * Authentication Gateway
 * Central authentication orchestrator that manages all auth operations across platforms
 * Requirements: 6.1, 6.2, 6.3, 9.1, 9.2
 */

import { apolloClient } from '@/lib/apollo/client';
import { TokenManager, SecureTokenStorage, createTokenManager } from './token-manager';
import { authSubscriptionManager, AuthSubscriptionOptions } from './subscription-manager';
import { permissionsManager } from './permissions-manager';
import { completeMfaManager } from './mfa-manager-complete';
import { TokenPair as CoreTokenPair } from '@/types/core';
import { TokenPair, CompleteUser, CompleteAuthState, CompleteSessionInfo } from '@/types/auth';

import {
  LOGIN_MUTATION,
  REFRESH_TOKEN_MUTATION,
  LOGOUT_MUTATION,
  LOGOUT_ALL_SESSIONS_MUTATION,
} from '@/graphql/mutations/auth-complete';
import {
  ME_QUERY,
  GET_ACTIVE_SESSIONS_QUERY,
} from '@/graphql/queries/auth-complete';

/**
 * Authentication credentials for login
 */
export interface AuthCredentials {
  email: string;
  password: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

/**
 * Authentication result from login
 */
export interface AuthResult {
  tokens: TokenPair;
  user: CompleteUser;
  permissions: string[];
  tier: TierInfo;
  requiresOnboarding: boolean;
  sessionInfo: CompleteSessionInfo;
}

/**
 * Tier information
 */
export interface TierInfo {
  type: 'micro' | 'small' | 'medium' | 'enterprise';
  features: string[];
  limits: Record<string, number>;
}

/**
 * Device information for tracking
 */
export interface DeviceInfo {
  deviceId: string;
  platform: 'web' | 'ios' | 'android';
  deviceName: string;
  browserInfo?: {
    name: string;
    version: string;
    userAgent: string;
  };
  appVersion: string;
  trusted: boolean;
  fingerprint: string;
}

/**
 * Device session information
 */
export interface DeviceSession {
  sessionId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
  isCurrent: boolean;
}

/**
 * Security event types
 */
export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  MFA_CHALLENGE = 'MFA_CHALLENGE',
  MFA_SUCCESS = 'MFA_SUCCESS',
  MFA_FAILED = 'MFA_FAILED',
  NEW_DEVICE = 'NEW_DEVICE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  TIER_CHANGE = 'TIER_CHANGE',
}

/**
 * Security event data
 */
export interface SecurityEvent {
  type: SecurityEventType;
  userId: string;
  sessionId?: string;
  deviceInfo?: DeviceInfo;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Authentication Gateway Configuration
 */
export interface AuthGatewayConfig {
  tokenRefreshThreshold: number; // Minutes before expiry to refresh
  maxRetries: number;
  sessionTimeout: number; // Minutes
  maxSessions: number;
  enableDeviceTracking: boolean;
  enableSecurityEvents: boolean;
  enableCrossTabSync: boolean;
}

/**
 * Authentication Gateway
 * Central orchestrator for all authentication operations
 */
export class AuthGateway {
  private tokenManager: TokenManager;
  private authState: CompleteAuthState;
  private deviceInfo: DeviceInfo | null = null;
  private securityEventListeners: Set<(event: SecurityEvent) => void> = new Set();
  private stateChangeListeners: Set<(state: CompleteAuthState) => void> = new Set();

  constructor(private config: AuthGatewayConfig) {
    // Initialize token manager with refresh function
    this.tokenManager = createTokenManager(
      this.refreshTokens.bind(this),
      {
        refreshThreshold: config.tokenRefreshThreshold,
        maxRetries: config.maxRetries,
        storage: new SecureTokenStorage(),
      }
    );

    // Initialize auth state
    this.authState = {
      user: null,
      tokens: null,
      permissions: [],
      mfaRequired: false,
      isAuthenticated: false,
      isLoading: false,
      lastActivity: new Date(),
    };

    // Initialize device tracking
    if (config.enableDeviceTracking) {
      this.initializeDeviceTracking();
    }

    // Setup token change listener
    this.tokenManager.onTokenChange((tokens) => {
      this.updateAuthState({ tokens });
      if (tokens) {
        this.updateLastActivity();
      }
    });

    // Setup cross-tab synchronization
    if (config.enableCrossTabSync) {
      this.setupCrossTabSync();
    }
  }

  /**
   * Authenticate user with credentials
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    this.updateAuthState({ isLoading: true });

    try {
      // Perform login mutation
      const result = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          input: {
            email: credentials.email,
            password: credentials.password,
            mfaToken: credentials.mfaToken,
            rememberMe: credentials.rememberMe,
            deviceInfo: this.deviceInfo,
          },
        },
      });

      const loginData = result.data?.login;
      if (!loginData?.success) {
        throw new Error(loginData?.message || 'Authentication failed');
      }

      // Extract tokens and user data
      const tokens: TokenPair = {
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn,
        tokenType: 'Bearer' as const,
      };

      const user: CompleteUser = loginData.user;
      const permissions = await this.loadUserPermissions(user.id);
      const tier = await this.loadUserTier(user.id);
      const sessionInfo = await this.createSessionInfo(loginData.sessionId);

      // Store tokens
      const coreTokens: CoreTokenPair = {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        tokenType: 'Bearer' as const,
      };
      this.tokenManager.setTokens(coreTokens);

      // Update auth state
      this.updateAuthState({
        user,
        tokens,
        permissions,
        isAuthenticated: true,
        isLoading: false,
        sessionInfo,
      });

      // Broadcast security event
      this.broadcastSecurityEvent({
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: user.id,
        sessionId: sessionInfo.id,
        ...(this.deviceInfo && { deviceInfo: this.deviceInfo }),
        timestamp: new Date(),
        severity: 'low',
      });

      // Setup real-time subscriptions
      this.setupAuthSubscriptions();

      const authResult: AuthResult = {
        tokens,
        user,
        permissions,
        tier,
        requiresOnboarding: !user.emailVerified || !loginData.onboardingCompleted,
        sessionInfo,
      };

      return authResult;
    } catch (error) {
      // Broadcast security event for failed login
      this.broadcastSecurityEvent({
        type: SecurityEventType.LOGIN_FAILED,
        userId: credentials.email, // Use email as identifier for failed attempts
        ...(this.deviceInfo && { deviceInfo: this.deviceInfo }),
        timestamp: new Date(),
        severity: 'medium',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
      });

      this.updateAuthState({ isLoading: false });
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshTokens(refreshToken: string): Promise<CoreTokenPair> {
    try {
      const result = await apolloClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {
          input: { refreshToken },
        },
      });

      const refreshData = result.data?.refreshToken;
      if (!refreshData?.success) {
        throw new Error(refreshData?.message || 'Token refresh failed');
      }

      const tokens: CoreTokenPair = {
        accessToken: refreshData.accessToken,
        refreshToken: refreshData.refreshToken,
        expiresAt: new Date(Date.now() + refreshData.expiresIn * 1000),
        tokenType: 'Bearer' as const,
      };

      // Broadcast security event
      if (this.authState.user) {
        this.broadcastSecurityEvent({
          type: SecurityEventType.TOKEN_REFRESH,
          userId: this.authState.user.id,
          timestamp: new Date(),
          severity: 'low',
        });
      }

      return tokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Validate current session
   */
  async validateSession(sessionId: string): Promise<CompleteSessionInfo> {
    try {
      const result = await apolloClient.query({
        query: GET_ACTIVE_SESSIONS_QUERY,
        variables: { sessionId },
        fetchPolicy: 'network-only',
      });

      const sessions = result.data?.getActiveSessions || [];
      const currentSession = sessions.find((s: CompleteSessionInfo) => s.id === sessionId);

      if (!currentSession || !currentSession.isActive) {
        throw new Error('Session not found or inactive');
      }

      return currentSession;
    } catch (error) {
      console.error('Session validation failed:', error);
      throw error;
    }
  }

  /**
   * Track device information and create fingerprint
   */
  async trackDevice(deviceInfo: DeviceInfo): Promise<DeviceSession> {
    this.deviceInfo = deviceInfo;

    // Create device session
    const deviceSession: DeviceSession = {
      sessionId: this.generateSessionId(),
      deviceInfo,
      ipAddress: await this.getClientIP(),
      createdAt: new Date(),
      lastActivity: new Date(),
      isActive: true,
      isCurrent: true,
    };

    // Check if this is a new device
    const isNewDevice = await this.isNewDevice(deviceInfo.fingerprint);
    if (isNewDevice && this.authState.user) {
      this.broadcastSecurityEvent({
        type: SecurityEventType.NEW_DEVICE,
        userId: this.authState.user.id,
        deviceInfo,
        timestamp: new Date(),
        severity: 'medium',
      });
    }

    return deviceSession;
  }

  /**
   * Broadcast security event to all listeners
   */
  broadcastSecurityEvent(event: SecurityEvent): void {
    // Always notify local listeners regardless of config
    this.securityEventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Security event listener error:', error);
      }
    });

    // Only broadcast to external systems if enabled
    if (!this.config.enableSecurityEvents) return;

    // Broadcast to other tabs/windows
    if (typeof window !== 'undefined') {
      const customEvent = new CustomEvent('auth:security-event', {
        detail: event,
      });
      window.dispatchEvent(customEvent);
    }

    // Send to real-time subscription system
    authSubscriptionManager.subscribeToSecurityAlerts({
      onEvent: (authEvent) => {
        // Handle incoming security events from server
        console.log('Received security event from server:', authEvent);
      },
    });
  }

  /**
   * Get current authentication state
   */
  getAuthState(): CompleteAuthState {
    return { ...this.authState };
  }

  /**
   * Get valid tokens, refreshing if necessary
   */
  async getValidTokens(): Promise<TokenPair | null> {
    const coreTokens = await this.tokenManager.getValidTokens();
    if (!coreTokens) return null;
    
    // Convert CoreTokenPair to TokenPair
    return {
      accessToken: coreTokens.accessToken,
      refreshToken: coreTokens.refreshToken,
      expiresIn: Math.floor((coreTokens.expiresAt.getTime() - Date.now()) / 1000),
      tokenType: coreTokens.tokenType,
    };
  }

  /**
   * Logout current session
   */
  async logout(): Promise<void> {
    try {
      // Logout from server
      if (this.authState.tokens) {
        await apolloClient.mutate({
          mutation: LOGOUT_MUTATION,
        });
      }

      // Broadcast security event
      if (this.authState.user) {
        this.broadcastSecurityEvent({
          type: SecurityEventType.LOGOUT,
          userId: this.authState.user.id,
          timestamp: new Date(),
          severity: 'low',
        });
      }

      // Clear local state
      this.clearAuthState();
    } catch (error) {
      console.error('Logout error:', error);
      // Clear local state even if server logout fails
      this.clearAuthState();
    }
  }

  /**
   * Logout from all sessions
   */
  async logoutAllSessions(): Promise<void> {
    try {
      await apolloClient.mutate({
        mutation: LOGOUT_ALL_SESSIONS_MUTATION,
      });

      // Clear local state
      this.clearAuthState();
    } catch (error) {
      console.error('Logout all sessions error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to authentication state changes
   */
  onAuthStateChange(listener: (state: CompleteAuthState) => void): () => void {
    this.stateChangeListeners.add(listener);
    return () => this.stateChangeListeners.delete(listener);
  }

  /**
   * Subscribe to security events
   */
  onSecurityEvent(listener: (event: SecurityEvent) => void): () => void {
    this.securityEventListeners.add(listener);
    return () => this.securityEventListeners.delete(listener);
  }

  /**
   * Initialize device tracking and fingerprinting
   */
  private async initializeDeviceTracking(): Promise<void> {
    if (typeof window === 'undefined') return;

    const fingerprint = await this.generateDeviceFingerprint();
    const deviceInfo: DeviceInfo = {
      deviceId: this.getOrCreateDeviceId(),
      platform: 'web',
      deviceName: this.getDeviceName(),
      browserInfo: {
        name: this.getBrowserName(),
        version: this.getBrowserVersion(),
        userAgent: navigator.userAgent,
      },
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      trusted: this.isDeviceTrusted(fingerprint),
      fingerprint,
    };

    await this.trackDevice(deviceInfo);
  }

  /**
   * Generate device fingerprint for tracking
   */
  private async generateDeviceFingerprint(): Promise<string> {
    if (typeof window === 'undefined') return 'server';

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.platform,
      navigator.cookieEnabled,
      typeof window.localStorage !== 'undefined',
      typeof window.sessionStorage !== 'undefined',
    ];

    // Add canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        components.push(canvas.toDataURL());
      }
    } catch (error) {
      // Canvas fingerprinting blocked
      components.push('canvas-blocked');
    }

    const fingerprint = components.join('|');
    return btoa(fingerprint).slice(0, 32);
  }

  /**
   * Setup real-time authentication subscriptions
   */
  private setupAuthSubscriptions(): void {
    if (!this.authState.user) return;

    // Subscribe to user auth events
    authSubscriptionManager.subscribeToUserAuthEvents({
      onEvent: (event) => {
        this.handleAuthEvent(event);
      },
    });

    // Subscribe to permission changes
    authSubscriptionManager.subscribeToUserPermissionEvents({
      onEvent: (event) => {
        this.handlePermissionEvent(event);
      },
    });

    // Subscribe to session events
    authSubscriptionManager.subscribeToUserSessionEvents({
      onEvent: (event) => {
        this.handleSessionEvent(event);
      },
    });
  }

  /**
   * Handle incoming authentication events
   */
  private handleAuthEvent(event: any): void {
    // Handle different auth event types
    switch (event.type) {
      case 'SESSION_EXPIRED':
        this.handleSessionExpired();
        break;
      case 'PERMISSION_CHANGE':
        this.refreshUserPermissions();
        break;
      case 'MFA_REQUIRED':
        this.updateAuthState({ mfaRequired: true });
        break;
      default:
        console.log('Unhandled auth event:', event);
    }
  }

  /**
   * Handle permission change events
   */
  private async handlePermissionEvent(event: any): void {
    if (this.authState.user) {
      const permissions = await this.loadUserPermissions(this.authState.user.id);
      this.updateAuthState({ permissions });

      this.broadcastSecurityEvent({
        type: SecurityEventType.PERMISSION_CHANGE,
        userId: this.authState.user.id,
        timestamp: new Date(),
        severity: 'low',
        metadata: { event },
      });
    }
  }

  /**
   * Handle session events
   */
  private handleSessionEvent(event: any): void {
    if (event.type === 'SESSION_TERMINATED') {
      this.clearAuthState();
    }
  }

  /**
   * Handle session expiration
   */
  private handleSessionExpired(): void {
    this.broadcastSecurityEvent({
      type: SecurityEventType.SESSION_EXPIRED,
      userId: this.authState.user?.id || 'unknown',
      timestamp: new Date(),
      severity: 'medium',
    });

    this.clearAuthState();
  }

  /**
   * Load user permissions from server
   */
  private async loadUserPermissions(userId: string): Promise<string[]> {
    try {
      return await permissionsManager.getPermissions(userId);
    } catch (error) {
      console.error('Failed to load user permissions:', error);
      return [];
    }
  }

  /**
   * Load user tier information
   */
  private async loadUserTier(userId: string): Promise<TierInfo> {
    // This would typically call a GraphQL query to get tier info
    // For now, return a default tier
    return {
      type: 'micro',
      features: ['basic_pos', 'basic_inventory'],
      limits: {
        maxUsers: 1,
        maxProducts: 100,
        maxTransactions: 1000,
      },
    };
  }

  /**
   * Create session info object
   */
  private async createSessionInfo(sessionId: string): Promise<CompleteSessionInfo> {
    return {
      id: sessionId,
      userId: this.authState.user?.id ?? '',
      deviceInfo: this.deviceInfo?.deviceName ?? 'Unknown',
      ipAddress: await this.getClientIP(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionTimeout * 60 * 1000),
      isActive: true,
      isCurrentSession: true,
    };
  }

  /**
   * Refresh user permissions
   */
  private async refreshUserPermissions(): Promise<void> {
    if (this.authState.user) {
      const permissions = await this.loadUserPermissions(this.authState.user.id);
      this.updateAuthState({ permissions });
    }
  }

  /**
   * Update authentication state and notify listeners
   */
  private updateAuthState(updates: Partial<CompleteAuthState>): void {
    this.authState = { ...this.authState, ...updates };
    
    // Notify listeners
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.authState);
      } catch (error) {
        console.error('Auth state change listener error:', error);
      }
    });
  }

  /**
   * Clear authentication state
   */
  private clearAuthState(): void {
    this.tokenManager.clearTokens();
    authSubscriptionManager.unsubscribeAll();
    
    this.updateAuthState({
      user: null,
      tokens: null,
      permissions: [],
      mfaRequired: false,
      isAuthenticated: false,
      isLoading: false,
    });
  }

  /**
   * Update last activity timestamp
   */
  private updateLastActivity(): void {
    this.updateAuthState({ lastActivity: new Date() });
  }

  /**
   * Setup cross-tab synchronization
   */
  private setupCrossTabSync(): void {
    if (typeof window === 'undefined') return;

    // Listen for auth events from other tabs
    window.addEventListener('auth:security-event', ((event: CustomEvent) => {
      const securityEvent = event.detail as SecurityEvent;
      this.securityEventListeners.forEach(listener => {
        try {
          listener(securityEvent);
        } catch (error) {
          console.error('Cross-tab security event listener error:', error);
        }
      });
    }) as EventListener);

    // Listen for storage events
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth:state-change') {
        // Handle auth state changes from other tabs
        this.handleCrossTabStateChange(event.newValue);
      }
    });
  }

  /**
   * Handle auth state changes from other tabs
   */
  private handleCrossTabStateChange(newValue: string | null): void {
    if (!newValue) return;

    try {
      const stateUpdate = JSON.parse(newValue);
      this.updateAuthState(stateUpdate);
    } catch (error) {
      console.error('Failed to parse cross-tab state change:', error);
    }
  }

  /**
   * Utility methods for device tracking
   */
  private getOrCreateDeviceId(): string {
    const stored = localStorage.getItem('device_id');
    if (stored) return stored;

    const deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('device_id', deviceId);
    return deviceId;
  }

  private getDeviceName(): string {
    return `${this.getBrowserName()} on ${navigator.platform}`;
  }

  private getBrowserName(): string {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getBrowserVersion(): string {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const match = userAgent.match(/(?:Chrome|Firefox|Safari|Edge)\/(\d+)/);
    return match ? match[1] : 'Unknown';
  }

  private isDeviceTrusted(fingerprint: string): boolean {
    const trustedDevices = JSON.parse(localStorage.getItem('trusted_devices') || '[]');
    return trustedDevices.includes(fingerprint);
  }

  private async isNewDevice(fingerprint: string): Promise<boolean> {
    const knownDevices = JSON.parse(localStorage.getItem('known_devices') || '[]');
    const isNew = !knownDevices.includes(fingerprint);
    
    if (isNew) {
      knownDevices.push(fingerprint);
      localStorage.setItem('known_devices', JSON.stringify(knownDevices));
    }
    
    return isNew;
  }

  private async getClientIP(): Promise<string> {
    try {
      // This would typically call an IP detection service
      // For now, return a placeholder
      return '127.0.0.1';
    } catch (error) {
      return 'unknown';
    }
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substr(2, 16);
  }
}

// Default configuration
const defaultConfig: AuthGatewayConfig = {
  tokenRefreshThreshold: 5, // 5 minutes before expiry
  maxRetries: 3,
  sessionTimeout: 30, // 30 minutes
  maxSessions: 5,
  enableDeviceTracking: true,
  enableSecurityEvents: true,
  enableCrossTabSync: true,
};

// Export singleton instance
export const authGateway = new AuthGateway(defaultConfig);

// Export configuration function
export function configureAuthGateway(config: Partial<AuthGatewayConfig>): AuthGateway {
  return new AuthGateway({ ...defaultConfig, ...config });
}