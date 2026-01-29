/**
 * Session Synchronization Hook
 * 
 * Provides cross-device session tracking, push notification integration,
 * and security event handling for mobile authentication.
 * 
 * Requirements: 3.5
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { 
  sessionSyncService, 
  UserSession, 
  SecurityEvent, 
  PushNotificationData,
  DeepLinkAuthFlow 
} from '@/lib/auth/SessionSyncService';
import { useAuth } from './useAuth';

interface SessionSyncState {
  sessions: UserSession[];
  isLoading: boolean;
  error: string | null;
  pushToken: string | null;
  lastSyncAt: Date | null;
}

interface SecurityAlert {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  requiresAction: boolean;
}

export function useSessionSync() {
  const { user, logout } = useAuth();
  
  const [state, setState] = useState<SessionSyncState>({
    sessions: [],
    isLoading: false,
    error: null,
    pushToken: null,
    lastSyncAt: null,
  });

  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);

  /**
   * Initialize session sync when user changes
   */
  useEffect(() => {
    if (user?.id) {
      initializeSessionSync(user.id);
    } else {
      cleanupSessionSync();
    }

    return () => {
      cleanupSessionSync();
    };
  }, [user?.id]);

  /**
   * Initialize session synchronization
   */
  const initializeSessionSync = useCallback(async (userId: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await sessionSyncService.initialize(userId);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        pushToken: sessionSyncService.getPushToken(),
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize session sync' 
      }));
    }
  }, []);

  /**
   * Cleanup session sync
   */
  const cleanupSessionSync = useCallback(async () => {
    await sessionSyncService.cleanup();
    setState({
      sessions: [],
      isLoading: false,
      error: null,
      pushToken: null,
      lastSyncAt: null,
    });
    setSecurityAlerts([]);
  }, []);

  /**
   * Sync sessions manually
   */
  const syncSessions = useCallback(async (): Promise<UserSession[]> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const sessions = await sessionSyncService.syncSessions();
      
      setState(prev => ({ 
        ...prev, 
        sessions, 
        isLoading: false,
        lastSyncAt: new Date(),
      }));
      
      return sessions;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to sync sessions' 
      }));
      return [];
    }
  }, []);

  /**
   * Terminate a session
   */
  const terminateSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const success = await sessionSyncService.terminateSession(sessionId);
      
      if (success) {
        // Remove from local state immediately for better UX
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => s.id !== sessionId),
        }));
      }
      
      return success;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to terminate session' 
      }));
      return false;
    }
  }, []);

  /**
   * Handle deep link authentication flows
   */
  const handleDeepLinkAuth = useCallback(async (url: string): Promise<DeepLinkAuthFlow | null> => {
    return sessionSyncService.handleDeepLink(url);
  }, []);

  /**
   * Clear security alerts
   */
  const clearSecurityAlerts = useCallback(() => {
    setSecurityAlerts([]);
  }, []);

  /**
   * Dismiss specific security alert
   */
  const dismissSecurityAlert = useCallback((alertId: string) => {
    setSecurityAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  /**
   * Show security alert dialog
   */
  const showSecurityAlert = useCallback((event: SecurityEvent) => {
    const alertButtons = [
      {
        text: 'OK',
        onPress: () => dismissSecurityAlert(event.id),
      },
    ];

    // Add action button for critical events
    if (event.requiresAction) {
      alertButtons.unshift({
        text: 'Take Action',
        onPress: () => {
          // Handle specific actions based on event type
          switch (event.type) {
            case 'new_device':
              // Navigate to device management
              break;
            case 'suspicious_activity':
              // Navigate to security settings
              break;
            case 'session_expired':
              // Force logout
              logout();
              break;
          }
          dismissSecurityAlert(event.id);
        },
      });
    }

    Alert.alert(
      `Security Alert - ${event.severity.toUpperCase()}`,
      event.message,
      alertButtons
    );
  }, [dismissSecurityAlert, logout]);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const handleSessionsUpdated = (sessions: UserSession[]) => {
      setState(prev => ({ 
        ...prev, 
        sessions,
        lastSyncAt: new Date(),
      }));
    };

    const handleSecurityEvent = (event: SecurityEvent) => {
      // Add to alerts list
      const alert: SecurityAlert = {
        id: event.id,
        title: `Security Event - ${event.type}`,
        message: event.message,
        severity: event.severity,
        timestamp: event.timestamp,
        requiresAction: event.requiresAction,
      };
      
      setSecurityAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
      
      // Show immediate alert for high/critical events
      if (event.severity === 'high' || event.severity === 'critical') {
        showSecurityAlert(event);
      }
    };

    const handleSecurityAlert = (data: PushNotificationData) => {
      if (data.actionRequired) {
        Alert.alert(
          data.title,
          data.body,
          [
            {
              text: 'Dismiss',
              style: 'cancel',
            },
            {
              text: 'View Details',
              onPress: () => {
                // Navigate to security details
              },
            },
          ]
        );
      }
    };

    const handleNewDeviceLogin = (event: SecurityEvent) => {
      Alert.alert(
        'New Device Login',
        `A new device (${event.deviceInfo.deviceName}) has logged into your account. If this wasn't you, please secure your account immediately.`,
        [
          {
            text: 'It was me',
            style: 'cancel',
          },
          {
            text: 'Secure Account',
            onPress: () => {
              // Navigate to security settings
            },
          },
        ]
      );
    };

    const handleSuspiciousActivity = (event: SecurityEvent) => {
      Alert.alert(
        'Suspicious Activity Detected',
        event.message,
        [
          {
            text: 'Review Activity',
            onPress: () => {
              // Navigate to activity log
            },
          },
          {
            text: 'Secure Account',
            onPress: () => {
              // Navigate to security settings
            },
          },
        ]
      );
    };

    const handleSessionExpired = (event: SecurityEvent) => {
      Alert.alert(
        'Session Expired',
        'Your session has expired for security reasons. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => logout(),
          },
        ]
      );
    };

    const handleError = ({ error, context }: { error: Error; context: string }) => {
      console.error(`Session sync error (${context}):`, error);
      setState(prev => ({ 
        ...prev, 
        error: `${context}: ${error.message}` 
      }));
    };

    // Add event listeners
    sessionSyncService.on('sessionsUpdated', handleSessionsUpdated);
    sessionSyncService.on('securityEvent', handleSecurityEvent);
    sessionSyncService.on('securityAlert', handleSecurityAlert);
    sessionSyncService.on('newDeviceLogin', handleNewDeviceLogin);
    sessionSyncService.on('suspiciousActivity', handleSuspiciousActivity);
    sessionSyncService.on('sessionExpired', handleSessionExpired);
    sessionSyncService.on('error', handleError);

    return () => {
      // Remove event listeners
      sessionSyncService.off('sessionsUpdated', handleSessionsUpdated);
      sessionSyncService.off('securityEvent', handleSecurityEvent);
      sessionSyncService.off('securityAlert', handleSecurityAlert);
      sessionSyncService.off('newDeviceLogin', handleNewDeviceLogin);
      sessionSyncService.off('suspiciousActivity', handleSuspiciousActivity);
      sessionSyncService.off('sessionExpired', handleSessionExpired);
      sessionSyncService.off('error', handleError);
    };
  }, [showSecurityAlert, logout]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Get session by device ID
   */
  const getSessionByDeviceId = useCallback((deviceId: string): UserSession | undefined => {
    return state.sessions.find(session => session.deviceId === deviceId);
  }, [state.sessions]);

  /**
   * Get active sessions count
   */
  const getActiveSessionsCount = useCallback((): number => {
    return state.sessions.filter(session => session.isActive).length;
  }, [state.sessions]);

  /**
   * Get trusted sessions count
   */
  const getTrustedSessionsCount = useCallback((): number => {
    return state.sessions.filter(session => session.trusted).length;
  }, [state.sessions]);

  return {
    // State
    ...state,
    securityAlerts,
    
    // Actions
    syncSessions,
    terminateSession,
    handleDeepLinkAuth,
    clearError,
    clearSecurityAlerts,
    dismissSecurityAlert,
    
    // Utilities
    getSessionByDeviceId,
    getActiveSessionsCount,
    getTrustedSessionsCount,
    
    // Service status
    isInitialized: sessionSyncService.isServiceInitialized(),
  };
}