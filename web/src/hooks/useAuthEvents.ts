/**
 * Authentication Events Hook
 * React hook for managing real-time authentication events and security notifications
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  authEventManager, 
  AuthEvent, 
  SessionEvent, 
  SecurityAlert, 
  CrossDeviceNotification,
  AuthEventType,
  SessionEventType,
  SecurityAlertType,
  AuthEventSubscriptionOptions,
  SessionEventSubscriptionOptions,
  SecurityAlertSubscriptionOptions
} from '@/lib/realtime/auth-event-manager';
import { webSocketManager } from '@/lib/realtime/websocket-manager';

export interface UseAuthEventsOptions {
  autoSubscribe?: boolean;
  authEventOptions?: AuthEventSubscriptionOptions;
  sessionEventOptions?: SessionEventSubscriptionOptions;
  securityAlertOptions?: SecurityAlertSubscriptionOptions;
  onAuthEvent?: (event: AuthEvent) => void;
  onSessionEvent?: (event: SessionEvent) => void;
  onSecurityAlert?: (alert: SecurityAlert) => void;
  onCrossDeviceNotification?: (notification: CrossDeviceNotification) => void;
  onCriticalEvent?: (event: AuthEvent | SecurityAlert) => void;
}

export interface AuthEventsState {
  isConnected: boolean;
  subscriptions: {
    authEvents: boolean;
    sessionEvents: boolean;
    securityAlerts: boolean;
  };
  events: {
    auth: AuthEvent[];
    session: SessionEvent[];
    security: SecurityAlert[];
  };
  unreadCounts: {
    auth: number;
    session: number;
    security: number;
  };
  lastActivity: Date | null;
}

export interface AuthEventsActions {
  subscribeToAuthEvents: (options?: AuthEventSubscriptionOptions) => Promise<void>;
  subscribeToSessionEvents: (options?: SessionEventSubscriptionOptions) => Promise<void>;
  subscribeToSecurityAlerts: (options?: SecurityAlertSubscriptionOptions) => Promise<void>;
  unsubscribeFromAll: () => Promise<void>;
  markAsRead: (type: 'auth' | 'session' | 'security', eventId?: string) => void;
  clearHistory: (type?: 'auth' | 'session' | 'security') => void;
  getEventById: (id: string, type?: 'auth' | 'session' | 'security') => AuthEvent | SessionEvent | SecurityAlert | null;
  filterEvents: (
    type: 'auth' | 'session' | 'security',
    filter: {
      severity?: string[];
      eventType?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    }
  ) => (AuthEvent | SessionEvent | SecurityAlert)[];
}

export function useAuthEvents(options: UseAuthEventsOptions = {}): [AuthEventsState, AuthEventsActions] {
  const {
    autoSubscribe = true,
    authEventOptions,
    sessionEventOptions,
    securityAlertOptions,
    onAuthEvent,
    onSessionEvent,
    onSecurityAlert,
    onCrossDeviceNotification,
    onCriticalEvent,
  } = options;

  const [state, setState] = useState<AuthEventsState>({
    isConnected: webSocketManager.getState().isConnected,
    subscriptions: {
      authEvents: false,
      sessionEvents: false,
      securityAlerts: false,
    },
    events: {
      auth: [],
      session: [],
      security: [],
    },
    unreadCounts: {
      auth: 0,
      session: 0,
      security: 0,
    },
    lastActivity: null,
  });

  const readEventIds = useRef(new Set<string>());
  const callbacksRef = useRef({
    onAuthEvent,
    onSessionEvent,
    onSecurityAlert,
    onCrossDeviceNotification,
    onCriticalEvent,
  });

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = {
      onAuthEvent,
      onSessionEvent,
      onSecurityAlert,
      onCrossDeviceNotification,
      onCriticalEvent,
    };
  }, [onAuthEvent, onSessionEvent, onSecurityAlert, onCrossDeviceNotification, onCriticalEvent]);

  // Setup event listeners
  useEffect(() => {
    const handleConnectionStateChange = ({ connected }: { connected: boolean }) => {
      setState(prev => ({ ...prev, isConnected: connected }));
    };

    const handleSubscriptionChange = ({ type, subscribed }: { type: string; subscribed: boolean }) => {
      setState(prev => ({
        ...prev,
        subscriptions: {
          ...prev.subscriptions,
          [type === 'auth_events' ? 'authEvents' : 
           type === 'session_events' ? 'sessionEvents' : 
           'securityAlerts']: subscribed,
        },
      }));
    };

    const handleAuthEvent = (event: AuthEvent) => {
      setState(prev => {
        const newAuthEvents = [event, ...prev.events.auth].slice(0, 100);
        const isUnread = !readEventIds.current.has(event.id);
        
        return {
          ...prev,
          events: { ...prev.events, auth: newAuthEvents },
          unreadCounts: {
            ...prev.unreadCounts,
            auth: isUnread ? prev.unreadCounts.auth + 1 : prev.unreadCounts.auth,
          },
          lastActivity: new Date(),
        };
      });

      // Call callback
      callbacksRef.current.onAuthEvent?.(event);
      
      // Call critical event callback for high/critical severity
      if ((event.severity === 'high' || event.severity === 'critical') && callbacksRef.current.onCriticalEvent) {
        callbacksRef.current.onCriticalEvent(event);
      }
    };

    const handleSessionEvent = (event: SessionEvent) => {
      setState(prev => {
        const newSessionEvents = [event, ...prev.events.session].slice(0, 100);
        const isUnread = !readEventIds.current.has(event.id);
        
        return {
          ...prev,
          events: { ...prev.events, session: newSessionEvents },
          unreadCounts: {
            ...prev.unreadCounts,
            session: isUnread ? prev.unreadCounts.session + 1 : prev.unreadCounts.session,
          },
          lastActivity: new Date(),
        };
      });

      // Call callback
      callbacksRef.current.onSessionEvent?.(event);
    };

    const handleSecurityAlert = (alert: SecurityAlert) => {
      setState(prev => {
        const newSecurityAlerts = [alert, ...prev.events.security].slice(0, 100);
        const isUnread = !readEventIds.current.has(alert.id);
        
        return {
          ...prev,
          events: { ...prev.events, security: newSecurityAlerts },
          unreadCounts: {
            ...prev.unreadCounts,
            security: isUnread ? prev.unreadCounts.security + 1 : prev.unreadCounts.security,
          },
          lastActivity: new Date(),
        };
      });

      // Call callback
      callbacksRef.current.onSecurityAlert?.(alert);
      
      // Call critical event callback for critical severity
      if (alert.severity === 'critical' && callbacksRef.current.onCriticalEvent) {
        callbacksRef.current.onCriticalEvent(alert);
      }
    };

    const handleCrossDeviceNotification = (notification: CrossDeviceNotification) => {
      callbacksRef.current.onCrossDeviceNotification?.(notification);
    };

    const handleHistoryCleared = ({ type }: { type?: string }) => {
      setState(prev => {
        const newEvents = { ...prev.events };
        const newUnreadCounts = { ...prev.unreadCounts };

        if (!type || type === 'auth') {
          newEvents.auth = [];
          newUnreadCounts.auth = 0;
        }
        if (!type || type === 'session') {
          newEvents.session = [];
          newUnreadCounts.session = 0;
        }
        if (!type || type === 'security') {
          newEvents.security = [];
          newUnreadCounts.security = 0;
        }

        return {
          ...prev,
          events: newEvents,
          unreadCounts: newUnreadCounts,
        };
      });
    };

    // Add event listeners
    authEventManager.on('connectionStateChanged', handleConnectionStateChange);
    authEventManager.on('subscriptionChanged', handleSubscriptionChange);
    authEventManager.on('authEvent', handleAuthEvent);
    authEventManager.on('sessionEvent', handleSessionEvent);
    authEventManager.on('securityAlert', handleSecurityAlert);
    authEventManager.on('crossDeviceNotification', handleCrossDeviceNotification);
    authEventManager.on('historyCleared', handleHistoryCleared);

    // Initialize state from existing history
    setState(prev => ({
      ...prev,
      events: {
        auth: authEventManager.getAuthEventHistory(100),
        session: authEventManager.getSessionEventHistory(100),
        security: authEventManager.getSecurityAlertHistory(100),
      },
      subscriptions: authEventManager.getSubscriptionStatus(),
    }));

    return () => {
      authEventManager.off('connectionStateChanged', handleConnectionStateChange);
      authEventManager.off('subscriptionChanged', handleSubscriptionChange);
      authEventManager.off('authEvent', handleAuthEvent);
      authEventManager.off('sessionEvent', handleSessionEvent);
      authEventManager.off('securityAlert', handleSecurityAlert);
      authEventManager.off('crossDeviceNotification', handleCrossDeviceNotification);
      authEventManager.off('historyCleared', handleHistoryCleared);
    };
  }, []);

  // Auto-subscribe when connected
  useEffect(() => {
    if (autoSubscribe && state.isConnected && !state.subscriptions.authEvents) {
      authEventManager.subscribeToAuthEvents(authEventOptions).catch(console.error);
    }
    if (autoSubscribe && state.isConnected && !state.subscriptions.sessionEvents) {
      authEventManager.subscribeToSessionEvents(sessionEventOptions).catch(console.error);
    }
    if (autoSubscribe && state.isConnected && !state.subscriptions.securityAlerts) {
      authEventManager.subscribeToSecurityAlerts(securityAlertOptions).catch(console.error);
    }
  }, [state.isConnected, state.subscriptions, autoSubscribe, authEventOptions, sessionEventOptions, securityAlertOptions]);

  // Actions
  const subscribeToAuthEvents = useCallback(async (options?: AuthEventSubscriptionOptions) => {
    await authEventManager.subscribeToAuthEvents(options);
  }, []);

  const subscribeToSessionEvents = useCallback(async (options?: SessionEventSubscriptionOptions) => {
    await authEventManager.subscribeToSessionEvents(options);
  }, []);

  const subscribeToSecurityAlerts = useCallback(async (options?: SecurityAlertSubscriptionOptions) => {
    await authEventManager.subscribeToSecurityAlerts(options);
  }, []);

  const unsubscribeFromAll = useCallback(async () => {
    await authEventManager.unsubscribeFromAll();
  }, []);

  const markAsRead = useCallback((type: 'auth' | 'session' | 'security', eventId?: string) => {
    if (eventId) {
      readEventIds.current.add(eventId);
      setState(prev => ({
        ...prev,
        unreadCounts: {
          ...prev.unreadCounts,
          [type]: Math.max(0, prev.unreadCounts[type] - 1),
        },
      }));
    } else {
      // Mark all as read for the type
      const events = state.events[type];
      events.forEach(event => readEventIds.current.add(event.id));
      setState(prev => ({
        ...prev,
        unreadCounts: {
          ...prev.unreadCounts,
          [type]: 0,
        },
      }));
    }
  }, [state.events]);

  const clearHistory = useCallback((type?: 'auth' | 'session' | 'security') => {
    authEventManager.clearHistory(type);
  }, []);

  const getEventById = useCallback((id: string, type?: 'auth' | 'session' | 'security') => {
    if (type) {
      return state.events[type].find(event => event.id === id) || null;
    }
    
    // Search all types
    for (const eventType of ['auth', 'session', 'security'] as const) {
      const event = state.events[eventType].find(event => event.id === id);
      if (event) return event;
    }
    
    return null;
  }, [state.events]);

  const filterEvents = useCallback((
    type: 'auth' | 'session' | 'security',
    filter: {
      severity?: string[];
      eventType?: string[];
      dateRange?: { start: Date; end: Date };
      limit?: number;
    }
  ) => {
    let events = [...state.events[type]];

    // Filter by severity
    if (filter.severity && filter.severity.length > 0) {
      events = events.filter(event => 
        'severity' in event && filter.severity!.includes(event.severity)
      );
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

  const actions: AuthEventsActions = {
    subscribeToAuthEvents,
    subscribeToSessionEvents,
    subscribeToSecurityAlerts,
    unsubscribeFromAll,
    markAsRead,
    clearHistory,
    getEventById,
    filterEvents,
  };

  return [state, actions];
}

// Convenience hooks for specific event types
export function useAuthEventsOnly(options: Omit<UseAuthEventsOptions, 'sessionEventOptions' | 'securityAlertOptions'> = {}) {
  return useAuthEvents({
    ...options,
    authEventOptions: options.authEventOptions,
  });
}

export function useSessionEventsOnly(options: Omit<UseAuthEventsOptions, 'authEventOptions' | 'securityAlertOptions'> = {}) {
  return useAuthEvents({
    ...options,
    sessionEventOptions: options.sessionEventOptions,
  });
}

export function useSecurityAlertsOnly(options: Omit<UseAuthEventsOptions, 'authEventOptions' | 'sessionEventOptions'> = {}) {
  return useAuthEvents({
    ...options,
    securityAlertOptions: options.securityAlertOptions,
  });
}