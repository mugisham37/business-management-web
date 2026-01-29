/**
 * Mobile Security Events Hook
 * React Native hook for managing security events and notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { 
  mobileSecurityEventHandler, 
  MobileSecurityEvent, 
  MobileSecurityEventType,
  MobilePushNotificationConfig,
  MobileDeviceInfo 
} from '../../lib/auth/MobileSecurityEventHandler';

export interface UseMobileSecurityEventsOptions {
  autoRegisterPushNotifications?: boolean;
  onSecurityEvent?: (event: MobileSecurityEvent) => void;
  onCriticalEvent?: (event: MobileSecurityEvent) => void;
  onNotificationTapped?: (data: any) => void;
  onDeepLinkReceived?: (data: { path: string; params: Record<string, string>; fullUrl: string }) => void;
}

export interface MobileSecurityEventsState {
  events: MobileSecurityEvent[];
  unreadCount: number;
  config: MobilePushNotificationConfig;
  deviceInfo: MobileDeviceInfo | null;
  pushToken: string | null;
  isRegistered: boolean;
  lastActivity: Date | null;
}

export interface MobileSecurityEventsActions {
  registerForPushNotifications: () => Promise<string | null>;
  updateConfiguration: (config: Partial<MobilePushNotificationConfig>) => Promise<void>;
  clearEventHistory: () => Promise<void>;
  markAsRead: (eventId?: string) => void;
  getEventById: (id: string) => MobileSecurityEvent | null;
  filterEvents: (filter: {
    severity?: string[];
    eventType?: MobileSecurityEventType[];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }) => MobileSecurityEvent[];
  handleNewDeviceLogin: (deviceName: string, platform: string, ipAddress?: string, location?: string) => Promise<void>;
  handleSuspiciousActivity: (activityType: string, details: string, severity?: 'medium' | 'high' | 'critical') => Promise<void>;
  handleMfaEvent: (eventType: 'challenge' | 'success' | 'failed', method: string, deviceName?: string) => Promise<void>;
  refreshDeviceInfo: () => Promise<void>;
}

export function useMobileSecurityEvents(options: UseMobileSecurityEventsOptions = {}): [MobileSecurityEventsState, MobileSecurityEventsActions] {
  const {
    autoRegisterPushNotifications = true,
    onSecurityEvent,
    onCriticalEvent,
    onNotificationTapped,
    onDeepLinkReceived,
  } = options;

  const [state, setState] = useState<MobileSecurityEventsState>({
    events: [],
    unreadCount: 0,
    config: mobileSecurityEventHandler.getConfiguration(),
    deviceInfo: null,
    pushToken: null,
    isRegistered: false,
    lastActivity: null,
  });

  const readEventIds = useRef(new Set<string>());
  const callbacksRef = useRef({
    onSecurityEvent,
    onCriticalEvent,
    onNotificationTapped,
    onDeepLinkReceived,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onSecurityEvent,
      onCriticalEvent,
      onNotificationTapped,
      onDeepLinkReceived,
    };
  }, [onSecurityEvent, onCriticalEvent, onNotificationTapped, onDeepLinkReceived]);

  // Initialize device info
  useEffect(() => {
    const initializeDeviceInfo = async () => {
      try {
        const deviceInfo = await mobileSecurityEventHandler.getDeviceInfo();
        setState(prev => ({ ...prev, deviceInfo }));
      } catch (error) {
        console.error('Failed to get device info:', error);
      }
    };

    initializeDeviceInfo();
  }, []);

  // Setup event listeners
  useEffect(() => {
    const handleSecurityEvent = (event: MobileSecurityEvent) => {
      setState(prev => {
        const newEvents = [event, ...prev.events].slice(0, 100);
        const isUnread = !readEventIds.current.has(event.id);
        
        return {
          ...prev,
          events: newEvents,
          unreadCount: isUnread ? prev.unreadCount + 1 : prev.unreadCount,
          lastActivity: new Date(),
        };
      });

      // Call callback
      callbacksRef.current.onSecurityEvent?.(event);
    };

    const handleCriticalSecurityEvent = (event: MobileSecurityEvent) => {
      callbacksRef.current.onCriticalEvent?.(event);
    };

    const handleNotificationTapped = (data: any) => {
      callbacksRef.current.onNotificationTapped?.(data);
    };

    const handleDeepLinkReceived = (data: { path: string; params: Record<string, string>; fullUrl: string }) => {
      callbacksRef.current.onDeepLinkReceived?.(data);
    };

    const handleConfigurationUpdated = (config: MobilePushNotificationConfig) => {
      setState(prev => ({ ...prev, config }));
    };

    const handleHistoryCleared = () => {
      setState(prev => ({
        ...prev,
        events: [],
        unreadCount: 0,
      }));
      readEventIds.current.clear();
    };

    // Add event listeners
    mobileSecurityEventHandler.on('securityEvent', handleSecurityEvent);
    mobileSecurityEventHandler.on('criticalSecurityEvent', handleCriticalSecurityEvent);
    mobileSecurityEventHandler.on('notificationTapped', handleNotificationTapped);
    mobileSecurityEventHandler.on('deepLinkReceived', handleDeepLinkReceived);
    mobileSecurityEventHandler.on('configurationUpdated', handleConfigurationUpdated);
    mobileSecurityEventHandler.on('historyCleared', handleHistoryCleared);

    // Initialize state from existing history
    const existingEvents = mobileSecurityEventHandler.getEventHistory(100);
    setState(prev => ({
      ...prev,
      events: existingEvents,
      unreadCount: existingEvents.filter(event => !readEventIds.current.has(event.id)).length,
    }));

    return () => {
      mobileSecurityEventHandler.off('securityEvent', handleSecurityEvent);
      mobileSecurityEventHandler.off('criticalSecurityEvent', handleCriticalSecurityEvent);
      mobileSecurityEventHandler.off('notificationTapped', handleNotificationTapped);
      mobileSecurityEventHandler.off('deepLinkReceived', handleDeepLinkReceived);
      mobileSecurityEventHandler.off('configurationUpdated', handleConfigurationUpdated);
      mobileSecurityEventHandler.off('historyCleared', handleHistoryCleared);
    };
  }, []);

  // Auto-register for push notifications
  useEffect(() => {
    if (autoRegisterPushNotifications && !state.isRegistered) {
      registerForPushNotifications().catch(console.error);
    }
  }, [autoRegisterPushNotifications, state.isRegistered]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Refresh device info when app becomes active
        refreshDeviceInfo().catch(console.error);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  // Actions
  const registerForPushNotifications = useCallback(async (): Promise<string | null> => {
    try {
      const token = await mobileSecurityEventHandler.registerForPushNotifications();
      setState(prev => ({
        ...prev,
        pushToken: token,
        isRegistered: !!token,
      }));
      return token;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }, []);

  const updateConfiguration = useCallback(async (config: Partial<MobilePushNotificationConfig>) => {
    await mobileSecurityEventHandler.updateConfiguration(config);
  }, []);

  const clearEventHistory = useCallback(async () => {
    await mobileSecurityEventHandler.clearEventHistory();
  }, []);

  const markAsRead = useCallback((eventId?: string) => {
    if (eventId) {
      readEventIds.current.add(eventId);
      setState(prev => ({
        ...prev,
        unreadCount: Math.max(0, prev.unreadCount - 1),
      }));
    } else {
      // Mark all as read
      state.events.forEach(event => readEventIds.current.add(event.id));
      setState(prev => ({
        ...prev,
        unreadCount: 0,
      }));
    }
  }, [state.events]);

  const getEventById = useCallback((id: string): MobileSecurityEvent | null => {
    return state.events.find(event => event.id === id) || null;
  }, [state.events]);

  const filterEvents = useCallback((filter: {
    severity?: string[];
    eventType?: MobileSecurityEventType[];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): MobileSecurityEvent[] => {
    let events = [...state.events];

    // Filter by severity
    if (filter.severity && filter.severity.length > 0) {
      events = events.filter(event => filter.severity!.includes(event.severity));
    }

    // Filter by event type
    if (filter.eventType && filter.eventType.length > 0) {
      events = events.filter(event => filter.eventType!.includes(event.type));
    }

    // Filter by date range
    if (filter.dateRange) {
      events = events.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= filter.dateRange!.start && eventDate <= filter.dateRange!.end;
      });
    }

    // Apply limit
    if (filter.limit && filter.limit > 0) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }, [state.events]);

  const handleNewDeviceLogin = useCallback(async (
    deviceName: string,
    platform: string,
    ipAddress?: string,
    location?: string,
  ) => {
    await mobileSecurityEventHandler.handleNewDeviceLogin(deviceName, platform, ipAddress, location);
  }, []);

  const handleSuspiciousActivity = useCallback(async (
    activityType: string,
    details: string,
    severity: 'medium' | 'high' | 'critical' = 'high',
  ) => {
    await mobileSecurityEventHandler.handleSuspiciousActivity(activityType, details, severity);
  }, []);

  const handleMfaEvent = useCallback(async (
    eventType: 'challenge' | 'success' | 'failed',
    method: string,
    deviceName?: string,
  ) => {
    await mobileSecurityEventHandler.handleMfaEvent(eventType, method, deviceName);
  }, []);

  const refreshDeviceInfo = useCallback(async () => {
    try {
      const deviceInfo = await mobileSecurityEventHandler.getDeviceInfo();
      setState(prev => ({ ...prev, deviceInfo }));
    } catch (error) {
      console.error('Failed to refresh device info:', error);
    }
  }, []);

  const actions: MobileSecurityEventsActions = {
    registerForPushNotifications,
    updateConfiguration,
    clearEventHistory,
    markAsRead,
    getEventById,
    filterEvents,
    handleNewDeviceLogin,
    handleSuspiciousActivity,
    handleMfaEvent,
    refreshDeviceInfo,
  };

  return [state, actions];
}

// Convenience hooks for specific use cases
export function useMobileSecurityAlertsOnly(options: Omit<UseMobileSecurityEventsOptions, 'onSecurityEvent'> = {}) {
  const [state, actions] = useMobileSecurityEvents(options);
  
  const criticalEvents = state.events.filter(event => 
    event.severity === 'high' || event.severity === 'critical'
  );

  return [
    { ...state, events: criticalEvents },
    actions,
  ] as const;
}

export function useMobileSecurityNotifications(options: UseMobileSecurityEventsOptions = {}) {
  const [state, actions] = useMobileSecurityEvents({
    ...options,
    autoRegisterPushNotifications: true,
  });

  const notificationEvents = state.events.filter(event => 
    state.config.severityFilter.includes(event.severity)
  );

  return [
    { ...state, events: notificationEvents },
    actions,
  ] as const;
}