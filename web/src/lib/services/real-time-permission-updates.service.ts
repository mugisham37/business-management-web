/**
 * Real-Time Permission Updates Service
 * 
 * Provides real-time permission and tier change broadcasting system
 * Integrates with WebSocket connections for live updates across all user sessions
 * 
 * Requirements: 2.3, 10.2
 */

import { ApolloClient, gql } from '@apollo/client';
import { BusinessTier } from '@/types/core';

// GraphQL subscriptions for real-time updates
const PERMISSION_CHANGE_SUBSCRIPTION = gql`
  subscription PermissionChanged($userId: String!) {
    permissionChanged(userId: $userId) {
      userId
      permissions
      addedPermissions
      removedPermissions
      tier
      timestamp
      reason
    }
  }
`;

const TIER_CHANGE_SUBSCRIPTION = gql`
  subscription TierChanged($userId: String!) {
    tierChanged(userId: $userId) {
      userId
      oldTier
      newTier
      permissions
      features
      timestamp
      reason
      subscriptionId
    }
  }
`;

const SECURITY_EVENT_SUBSCRIPTION = gql`
  subscription SecurityEvent($userId: String!) {
    securityEvent(userId: $userId) {
      userId
      eventType
      severity
      message
      metadata
      timestamp
      requiresAction
    }
  }
`;

// GraphQL mutations for broadcasting changes
const BROADCAST_PERMISSION_CHANGE = gql`
  mutation BroadcastPermissionChange($input: BroadcastPermissionChangeInput!) {
    broadcastPermissionChange(input: $input) {
      success
      broadcastId
      affectedSessions
      error
    }
  }
`;

const BROADCAST_TIER_CHANGE = gql`
  mutation BroadcastTierChange($input: BroadcastTierChangeInput!) {
    broadcastTierChange(input: $input) {
      success
      broadcastId
      affectedSessions
      error
    }
  }
`;

const BROADCAST_SECURITY_EVENT = gql`
  mutation BroadcastSecurityEvent($input: BroadcastSecurityEventInput!) {
    broadcastSecurityEvent(input: $input) {
      success
      broadcastId
      affectedSessions
      error
    }
  }
`;

// Types and interfaces
export interface PermissionChangeEvent {
  userId: string;
  permissions: string[];
  addedPermissions: string[];
  removedPermissions: string[];
  tier: BusinessTier;
  timestamp: Date;
  reason: string;
}

export interface TierChangeEvent {
  userId: string;
  oldTier: BusinessTier;
  newTier: BusinessTier;
  permissions: string[];
  features: string[];
  timestamp: Date;
  reason: string;
  subscriptionId?: string;
}

export interface SecurityEvent {
  userId: string;
  eventType: SecurityEventType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  requiresAction: boolean;
}

export enum SecurityEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  MFA_CHALLENGE = 'mfa_challenge',
  PERMISSION_CHANGE = 'permission_change',
  TIER_CHANGE = 'tier_change',
  SECURITY_ALERT = 'security_alert',
  NEW_DEVICE = 'new_device',
  SESSION_EXPIRED = 'session_expired',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  PASSWORD_CHANGE = 'password_change',
  ACCOUNT_LOCKED = 'account_locked'
}

export interface BroadcastResult {
  success: boolean;
  broadcastId?: string;
  affectedSessions: number;
  error?: string;
}

export interface SubscriptionOptions {
  onPermissionChange?: (event: PermissionChangeEvent) => void;
  onTierChange?: (event: TierChangeEvent) => void;
  onSecurityEvent?: (event: SecurityEvent) => void;
  onError?: (error: Error) => void;
  onConnectionChange?: (connected: boolean) => void;
}

/**
 * Real-Time Permission Updates Service
 */
export class RealTimePermissionUpdatesService {
  private apolloClient: ApolloClient<any>;
  private subscriptions: Map<string, any> = new Map();
  private connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private eventListeners: Map<string, (event: any) => void> = new Map();

  constructor(apolloClient: ApolloClient<any>) {
    this.apolloClient = apolloClient;
  }

  /**
   * Subscribe to real-time permission updates for a user
   * Requirements: 2.3, 10.2
   */
  subscribeToPermissionUpdates(userId: string, options: SubscriptionOptions = {}): () => void {
    const subscriptionKey = `permissions_${userId}`;
    
    // Clean up existing subscription if any
    this.unsubscribe(subscriptionKey);

    try {
      this.connectionStatus = 'connecting';
      
      const subscription = this.apolloClient.subscribe({
        query: PERMISSION_CHANGE_SUBSCRIPTION,
        variables: { userId },
        errorPolicy: 'all'
      }).subscribe({
        next: ({ data }) => {
          if (data?.permissionChanged) {
            const event: PermissionChangeEvent = {
              userId: data.permissionChanged.userId,
              permissions: data.permissionChanged.permissions,
              addedPermissions: data.permissionChanged.addedPermissions,
              removedPermissions: data.permissionChanged.removedPermissions,
              tier: data.permissionChanged.tier,
              timestamp: new Date(data.permissionChanged.timestamp),
              reason: data.permissionChanged.reason
            };

            options.onPermissionChange?.(event);
            this.emitEvent('permissionChange', event);
          }
        },
        error: (error) => {
          console.error('Permission subscription error:', error);
          this.connectionStatus = 'error';
          options.onError?.(error);
          options.onConnectionChange?.(false);
          this.handleReconnection(subscriptionKey, userId, options);
        },
        complete: () => {
          console.log('Permission subscription completed');
          this.connectionStatus = 'disconnected';
          options.onConnectionChange?.(false);
        }
      });

      this.subscriptions.set(subscriptionKey, subscription);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      options.onConnectionChange?.(true);

      return () => this.unsubscribe(subscriptionKey);
    } catch (error) {
      console.error('Failed to subscribe to permission updates:', error);
      this.connectionStatus = 'error';
      options.onError?.(error as Error);
      return () => {};
    }
  }

  /**
   * Subscribe to real-time tier changes for a user
   * Requirements: 2.3, 10.2
   */
  subscribeToTierChanges(userId: string, options: SubscriptionOptions = {}): () => void {
    const subscriptionKey = `tier_${userId}`;
    
    // Clean up existing subscription if any
    this.unsubscribe(subscriptionKey);

    try {
      const subscription = this.apolloClient.subscribe({
        query: TIER_CHANGE_SUBSCRIPTION,
        variables: { userId },
        errorPolicy: 'all'
      }).subscribe({
        next: ({ data }) => {
          if (data?.tierChanged) {
            const event: TierChangeEvent = {
              userId: data.tierChanged.userId,
              oldTier: data.tierChanged.oldTier,
              newTier: data.tierChanged.newTier,
              permissions: data.tierChanged.permissions,
              features: data.tierChanged.features,
              timestamp: new Date(data.tierChanged.timestamp),
              reason: data.tierChanged.reason,
              subscriptionId: data.tierChanged.subscriptionId
            };

            options.onTierChange?.(event);
            this.emitEvent('tierChange', event);
          }
        },
        error: (error) => {
          console.error('Tier subscription error:', error);
          options.onError?.(error);
          this.handleReconnection(subscriptionKey, userId, options);
        }
      });

      this.subscriptions.set(subscriptionKey, subscription);
      return () => this.unsubscribe(subscriptionKey);
    } catch (error) {
      console.error('Failed to subscribe to tier changes:', error);
      options.onError?.(error as Error);
      return () => {};
    }
  }

  /**
   * Subscribe to real-time security events for a user
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
   */
  subscribeToSecurityEvents(userId: string, options: SubscriptionOptions = {}): () => void {
    const subscriptionKey = `security_${userId}`;
    
    // Clean up existing subscription if any
    this.unsubscribe(subscriptionKey);

    try {
      const subscription = this.apolloClient.subscribe({
        query: SECURITY_EVENT_SUBSCRIPTION,
        variables: { userId },
        errorPolicy: 'all'
      }).subscribe({
        next: ({ data }) => {
          if (data?.securityEvent) {
            const event: SecurityEvent = {
              userId: data.securityEvent.userId,
              eventType: data.securityEvent.eventType,
              severity: data.securityEvent.severity,
              message: data.securityEvent.message,
              metadata: data.securityEvent.metadata,
              timestamp: new Date(data.securityEvent.timestamp),
              requiresAction: data.securityEvent.requiresAction
            };

            options.onSecurityEvent?.(event);
            this.emitEvent('securityEvent', event);
          }
        },
        error: (error) => {
          console.error('Security event subscription error:', error);
          options.onError?.(error);
          this.handleReconnection(subscriptionKey, userId, options);
        }
      });

      this.subscriptions.set(subscriptionKey, subscription);
      return () => this.unsubscribe(subscriptionKey);
    } catch (error) {
      console.error('Failed to subscribe to security events:', error);
      options.onError?.(error as Error);
      return () => {};
    }
  }

  /**
   * Subscribe to all real-time updates for a user
   */
  subscribeToAllUpdates(userId: string, options: SubscriptionOptions = {}): () => void {
    const unsubscribePermissions = this.subscribeToPermissionUpdates(userId, options);
    const unsubscribeTier = this.subscribeToTierChanges(userId, options);
    const unsubscribeSecurity = this.subscribeToSecurityEvents(userId, options);

    return () => {
      unsubscribePermissions();
      unsubscribeTier();
      unsubscribeSecurity();
    };
  }

  /**
   * Broadcast permission change to all user sessions
   * Requirements: 2.3, 10.2
   */
  async broadcastPermissionChange(
    userId: string,
    permissions: string[],
    addedPermissions: string[],
    removedPermissions: string[],
    tier: BusinessTier,
    reason: string
  ): Promise<BroadcastResult> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: BROADCAST_PERMISSION_CHANGE,
        variables: {
          input: {
            userId,
            permissions,
            addedPermissions,
            removedPermissions,
            tier,
            reason,
            timestamp: new Date().toISOString()
          }
        }
      });

      const result = data.broadcastPermissionChange;
      
      return {
        success: result.success,
        broadcastId: result.broadcastId,
        affectedSessions: result.affectedSessions,
        error: result.error
      };
    } catch (error) {
      console.error('Failed to broadcast permission change:', error);
      return {
        success: false,
        affectedSessions: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Broadcast tier change to all user sessions
   * Requirements: 2.3, 10.2
   */
  async broadcastTierChange(
    userId: string,
    oldTier: BusinessTier,
    newTier: BusinessTier,
    permissions: string[],
    features: string[],
    reason: string,
    subscriptionId?: string
  ): Promise<BroadcastResult> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: BROADCAST_TIER_CHANGE,
        variables: {
          input: {
            userId,
            oldTier,
            newTier,
            permissions,
            features,
            reason,
            subscriptionId,
            timestamp: new Date().toISOString()
          }
        }
      });

      const result = data.broadcastTierChange;
      
      return {
        success: result.success,
        broadcastId: result.broadcastId,
        affectedSessions: result.affectedSessions,
        error: result.error
      };
    } catch (error) {
      console.error('Failed to broadcast tier change:', error);
      return {
        success: false,
        affectedSessions: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Broadcast security event to user sessions
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
   */
  async broadcastSecurityEvent(
    userId: string,
    eventType: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata?: Record<string, any>,
    requiresAction = false
  ): Promise<BroadcastResult> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: BROADCAST_SECURITY_EVENT,
        variables: {
          input: {
            userId,
            eventType,
            severity,
            message,
            metadata,
            requiresAction,
            timestamp: new Date().toISOString()
          }
        }
      });

      const result = data.broadcastSecurityEvent;
      
      return {
        success: result.success,
        broadcastId: result.broadcastId,
        affectedSessions: result.affectedSessions,
        error: result.error
      };
    } catch (error) {
      console.error('Failed to broadcast security event:', error);
      return {
        success: false,
        affectedSessions: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    return this.connectionStatus;
  }

  /**
   * Check if connected to real-time updates
   */
  isConnected(): boolean {
    return this.connectionStatus === 'connected';
  }

  /**
   * Get active subscriptions count
   */
  getActiveSubscriptionsCount(): number {
    return this.subscriptions.size;
  }

  /**
   * Add event listener
   */
  addEventListener(eventType: string, callback: (event: any) => void): void {
    this.eventListeners.set(`${eventType}_${Date.now()}`, callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(eventId: string): void {
    this.eventListeners.delete(eventId);
  }

  /**
   * Unsubscribe from a specific subscription
   */
  private unsubscribe(subscriptionKey: string): void {
    const subscription = this.subscriptions.get(subscriptionKey);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionKey);
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.connectionStatus = 'disconnected';
  }

  /**
   * Handle reconnection logic with exponential backoff
   */
  private handleReconnection(subscriptionKey: string, userId: string, options: SubscriptionOptions): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.connectionStatus = 'error';
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (subscriptionKey.startsWith('permissions_')) {
        this.subscribeToPermissionUpdates(userId, options);
      } else if (subscriptionKey.startsWith('tier_')) {
        this.subscribeToTierChanges(userId, options);
      } else if (subscriptionKey.startsWith('security_')) {
        this.subscribeToSecurityEvents(userId, options);
      }
    }, delay);
  }

  /**
   * Emit event to all listeners
   */
  private emitEvent(eventType: string, event: any): void {
    this.eventListeners.forEach((callback, key) => {
      if (key.startsWith(eventType)) {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.unsubscribeAll();
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
  }
}

// Export singleton instance
let realTimePermissionUpdatesServiceInstance: RealTimePermissionUpdatesService | null = null;

export const getRealTimePermissionUpdatesService = (apolloClient: ApolloClient<any>): RealTimePermissionUpdatesService => {
  if (!realTimePermissionUpdatesServiceInstance) {
    realTimePermissionUpdatesServiceInstance = new RealTimePermissionUpdatesService(apolloClient);
  }
  return realTimePermissionUpdatesServiceInstance;
};

export default RealTimePermissionUpdatesService;