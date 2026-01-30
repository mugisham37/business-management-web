/**
 * Real-Time Permissions Hook
 * 
 * React hook for managing real-time permission and tier updates
 * Integrates with WebSocket connections for live updates across all user sessions
 * 
 * Requirements: 2.3, 10.2
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApolloClient, NormalizedCacheObject, ApolloClient } from '@apollo/client';
import { BusinessTier } from '@/types/onboarding';
import { 
  RealTimePermissionUpdatesService,
  getRealTimePermissionUpdatesService,
  PermissionChangeEvent,
  TierChangeEvent,
  SecurityEvent,
  SecurityEventType,
  SubscriptionOptions
} from '@/lib/services/real-time-permission-updates.service';

export interface UseRealTimePermissionsOptions {
  userId?: string;
  autoConnect?: boolean;
  onPermissionChange?: (event: PermissionChangeEvent) => void;
  onTierChange?: (event: TierChangeEvent) => void;
  onSecurityEvent?: (event: SecurityEvent) => void;
  onError?: (error: Error) => void;
}

export interface UseRealTimePermissionsReturn {
  // Connection state
  isConnected: boolean;
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  activeSubscriptions: number;
  
  // Recent events
  lastPermissionChange: PermissionChangeEvent | null;
  lastTierChange: TierChangeEvent | null;
  lastSecurityEvent: SecurityEvent | null;
  
  // Event history
  permissionChangeHistory: PermissionChangeEvent[];
  tierChangeHistory: TierChangeEvent[];
  securityEventHistory: SecurityEvent[];
  
  // Connection management
  connect: (userId: string) => void;
  disconnect: () => void;
  reconnect: () => void;
  
  // Broadcasting functions
  broadcastPermissionChange: (
    userId: string,
    permissions: string[],
    addedPermissions: string[],
    removedPermissions: string[],
    tier: BusinessTier,
    reason: string
  ) => Promise<{ success: boolean; affectedSessions: number; error?: string }>;
  
  broadcastTierChange: (
    userId: string,
    oldTier: BusinessTier,
    newTier: BusinessTier,
    permissions: string[],
    features: string[],
    reason: string,
    subscriptionId?: string
  ) => Promise<{ success: boolean; affectedSessions: number; error?: string }>;
  
  broadcastSecurityEvent: (
    userId: string,
    eventType: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata?: Record<string, unknown>,
    requiresAction?: boolean
  ) => Promise<{ success: boolean; affectedSessions: number; error?: string }>;
  
  // Utility functions
  clearHistory: () => void;
  getEventCount: () => { permissions: number; tiers: number; security: number };
}

/**
 * Hook for managing real-time permission and tier updates
 */
export function useRealTimePermissions(options: UseRealTimePermissionsOptions = {}): UseRealTimePermissionsReturn {
  const {
    userId,
    autoConnect = true,
    onPermissionChange,
    onTierChange,
    onSecurityEvent,
    onError
  } = options;

  const apolloClient = useApolloClient();
  const serviceRef = useRef<RealTimePermissionUpdatesService | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const currentUserIdRef = useRef<string | null>(null);

  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);
  
  // Recent events
  const [lastPermissionChange, setLastPermissionChange] = useState<PermissionChangeEvent | null>(null);
  const [lastTierChange, setLastTierChange] = useState<TierChangeEvent | null>(null);
  const [lastSecurityEvent, setLastSecurityEvent] = useState<SecurityEvent | null>(null);
  
  // Event history
  const [permissionChangeHistory, setPermissionChangeHistory] = useState<PermissionChangeEvent[]>([]);
  const [tierChangeHistory, setTierChangeHistory] = useState<TierChangeEvent[]>([]);
  const [securityEventHistory, setSecurityEventHistory] = useState<SecurityEvent[]>([]);

  // Initialize service
  useEffect(() => {
    if (!serviceRef.current) {
      serviceRef.current = getRealTimePermissionUpdatesService(
        apolloClient as ApolloClient<NormalizedCacheObject>
      );
    }
    return undefined;
  }, [apolloClient]);

  // Update connection status
  useEffect(() => {
    if (serviceRef.current) {
      const updateStatus = () => {
        const status = serviceRef.current!.getConnectionStatus();
        const connected = serviceRef.current!.isConnected();
        const subscriptions = serviceRef.current!.getActiveSubscriptionsCount();
        
        setConnectionStatus(status);
        setIsConnected(connected);
        setActiveSubscriptions(subscriptions);
      };

      // Update immediately
      updateStatus();

      // Set up periodic status updates
      const interval = setInterval(updateStatus, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, []);

  // Handle permission change events
  const handlePermissionChange = useCallback((event: PermissionChangeEvent) => {
    setLastPermissionChange(event);
    setPermissionChangeHistory(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    onPermissionChange?.(event);
  }, [onPermissionChange]);

  // Handle tier change events
  const handleTierChange = useCallback((event: TierChangeEvent) => {
    setLastTierChange(event);
    setTierChangeHistory(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    onTierChange?.(event);
  }, [onTierChange]);

  // Handle security events
  const handleSecurityEvent = useCallback((event: SecurityEvent) => {
    setLastSecurityEvent(event);
    setSecurityEventHistory(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
    onSecurityEvent?.(event);
  }, [onSecurityEvent]);

  // Handle connection changes
  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    setConnectionStatus(connected ? 'connected' : 'disconnected');
  }, []);

  // Handle errors
  const handleError = useCallback((error: Error) => {
    console.error('Real-time permissions error:', error);
    setConnectionStatus('error');
    onError?.(error);
  }, [onError]);

  // Connect to real-time updates
  const connect = useCallback((targetUserId: string) => {
    if (!serviceRef.current || !targetUserId) return;

    // Disconnect existing connection
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    currentUserIdRef.current = targetUserId;
    setConnectionStatus('connecting');

    const subscriptionOptions: SubscriptionOptions = {
      onPermissionChange: handlePermissionChange,
      onTierChange: handleTierChange,
      onSecurityEvent: handleSecurityEvent,
      onConnectionChange: handleConnectionChange,
      onError: handleError
    };

    unsubscribeRef.current = serviceRef.current.subscribeToAllUpdates(targetUserId, subscriptionOptions);
  }, [handlePermissionChange, handleTierChange, handleSecurityEvent, handleConnectionChange, handleError]);

  // Disconnect from real-time updates
  const disconnect = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    currentUserIdRef.current = null;
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setActiveSubscriptions(0);
  }, []);

  // Reconnect to real-time updates
  const reconnect = useCallback(() => {
    if (currentUserIdRef.current) {
      disconnect();
      setTimeout(() => connect(currentUserIdRef.current!), 1000);
    }
  }, [connect, disconnect]);

  // Auto-connect when userId is provided
  useEffect(() => {
    if (autoConnect && userId && serviceRef.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- connect establishes WebSocket subscription
      void connect(userId);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId, autoConnect, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (serviceRef.current) {
        serviceRef.current.destroy();
      }
    };
  }, [disconnect]);

  // Broadcasting functions
  const broadcastPermissionChange = useCallback(async (
    targetUserId: string,
    permissions: string[],
    addedPermissions: string[],
    removedPermissions: string[],
    tier: BusinessTier,
    reason: string
  ) => {
    if (!serviceRef.current) {
      return { success: false, affectedSessions: 0, error: 'Service not initialized' };
    }

    return await serviceRef.current.broadcastPermissionChange(
      targetUserId,
      permissions,
      addedPermissions,
      removedPermissions,
      tier,
      reason
    );
  }, []);

  const broadcastTierChange = useCallback(async (
    targetUserId: string,
    oldTier: BusinessTier,
    newTier: BusinessTier,
    permissions: string[],
    features: string[],
    reason: string,
    subscriptionId?: string
  ) => {
    if (!serviceRef.current) {
      return { success: false, affectedSessions: 0, error: 'Service not initialized' };
    }

    return await serviceRef.current.broadcastTierChange(
      targetUserId,
      oldTier,
      newTier,
      permissions,
      features,
      reason,
      subscriptionId
    );
  }, []);

  const broadcastSecurityEvent = useCallback(async (
    targetUserId: string,
    eventType: SecurityEventType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata?: Record<string, unknown>,
    requiresAction = false
  ) => {
    if (!serviceRef.current) {
      return { success: false, affectedSessions: 0, error: 'Service not initialized' };
    }

    return await serviceRef.current.broadcastSecurityEvent(
      targetUserId,
      eventType,
      severity,
      message,
      metadata,
      requiresAction
    );
  }, []);

  // Utility functions
  const clearHistory = useCallback(() => {
    setPermissionChangeHistory([]);
    setTierChangeHistory([]);
    setSecurityEventHistory([]);
    setLastPermissionChange(null);
    setLastTierChange(null);
    setLastSecurityEvent(null);
  }, []);

  const getEventCount = useCallback(() => ({
    permissions: permissionChangeHistory.length,
    tiers: tierChangeHistory.length,
    security: securityEventHistory.length
  }), [permissionChangeHistory.length, tierChangeHistory.length, securityEventHistory.length]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    activeSubscriptions,
    
    // Recent events
    lastPermissionChange,
    lastTierChange,
    lastSecurityEvent,
    
    // Event history
    permissionChangeHistory,
    tierChangeHistory,
    securityEventHistory,
    
    // Connection management
    connect,
    disconnect,
    reconnect,
    
    // Broadcasting functions
    broadcastPermissionChange,
    broadcastTierChange,
    broadcastSecurityEvent,
    
    // Utility functions
    clearHistory,
    getEventCount
  };
}

export default useRealTimePermissions;