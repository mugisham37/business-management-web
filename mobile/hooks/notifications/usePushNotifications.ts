/**
 * Push Notifications Hook
 * 
 * Provides push notification functionality for security events,
 * authentication requests, and session management.
 * 
 * Requirements: 3.5
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { 
  pushNotificationService, 
  NotificationPermissions, 
  SecurityNotification 
} from '@/lib/notifications/PushNotificationService';
import { useAuth } from '@/hooks/auth/useAuth';

interface PushNotificationState {
  isInitialized: boolean;
  permissions: NotificationPermissions | null;
  pushToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface NotificationEvent {
  type: 'security_alert' | 'auth_request' | 'session_sync' | 'device_verification';
  notification: any;
  data: Record<string, any>;
  action?: string;
}

export function usePushNotifications() {
  const { user } = useAuth();
  
  const [state, setState] = useState<PushNotificationState>({
    isInitialized: false,
    permissions: null,
    pushToken: null,
    isLoading: false,
    error: null,
  });

  const [recentNotifications, setRecentNotifications] = useState<NotificationEvent[]>([]);

  /**
   * Initialize push notifications when user is authenticated
   */
  useEffect(() => {
    if (user?.id) {
      initializePushNotifications();
    } else {
      cleanupPushNotifications();
    }

    return () => {
      cleanupPushNotifications();
    };
  }, [user?.id]);

  /**
   * Initialize push notification service
   */
  const initializePushNotifications = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      await pushNotificationService.initialize();
      
      setState(prev => ({
        ...prev,
        isInitialized: pushNotificationService.isServiceInitialized(),
        permissions: pushNotificationService.getPermissions(),
        pushToken: pushNotificationService.getPushToken(),
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize push notifications',
      }));
    }
  }, []);

  /**
   * Cleanup push notifications
   */
  const cleanupPushNotifications = useCallback(() => {
    pushNotificationService.cleanup();
    setState({
      isInitialized: false,
      permissions: null,
      pushToken: null,
      isLoading: false,
      error: null,
    });
    setRecentNotifications([]);
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<NotificationPermissions> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const permissions = await pushNotificationService.requestPermissions();
      
      setState(prev => ({
        ...prev,
        permissions,
        isLoading: false,
      }));
      
      return permissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request permissions';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }
  }, []);

  /**
   * Send test notification
   */
  const sendTestNotification = useCallback(async (type: SecurityNotification['type'] = 'security_alert') => {
    try {
      const testNotification: SecurityNotification = {
        id: `test_${Date.now()}`,
        type,
        title: 'Test Security Alert',
        body: 'This is a test notification to verify push notification functionality.',
        data: {
          test: true,
          timestamp: new Date().toISOString(),
        },
        priority: 'default',
      };

      await pushNotificationService.sendLocalNotification(testNotification);
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to send test notification',
      }));
    }
  }, []);

  /**
   * Handle permission request with user guidance
   */
  const handlePermissionRequest = useCallback(async () => {
    const permissions = await requestPermissions();
    
    if (!permissions.granted) {
      if (permissions.canAskAgain) {
        Alert.alert(
          'Enable Notifications',
          'Push notifications help keep your account secure by alerting you to important security events.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
            },
            {
              text: 'Enable',
              onPress: () => requestPermissions(),
            },
          ]
        );
      } else {
        Alert.alert(
          'Notifications Disabled',
          'To receive security alerts, please enable notifications in your device settings.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    }
  }, [requestPermissions]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear recent notifications
   */
  const clearRecentNotifications = useCallback(() => {
    setRecentNotifications([]);
  }, []);

  /**
   * Setup event listeners
   */
  useEffect(() => {
    const handleNotificationReceived = (event: NotificationEvent) => {
      setRecentNotifications(prev => [event, ...prev.slice(0, 19)]); // Keep last 20
    };

    const handleSecurityAlert = ({ notification, data }: { notification: any; data: any }) => {
      // Handle security alerts with immediate user attention
      Alert.alert(
        'Security Alert',
        notification.request.content.body,
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
    };

    const handleAuthRequest = ({ notification, data }: { notification: any; data: any }) => {
      // Handle authentication requests
      Alert.alert(
        'Authentication Request',
        notification.request.content.body,
        [
          {
            text: 'Deny',
            style: 'destructive',
            onPress: () => {
              // Handle deny action
            },
          },
          {
            text: 'Approve',
            onPress: () => {
              // Handle approve action
            },
          },
        ]
      );
    };

    const handleDeviceVerification = ({ notification, data }: { notification: any; data: any }) => {
      // Handle device verification requests
      Alert.alert(
        'Device Verification',
        notification.request.content.body,
        [
          {
            text: 'Block Device',
            style: 'destructive',
            onPress: () => {
              // Handle block device action
            },
          },
          {
            text: 'Trust Device',
            onPress: () => {
              // Handle trust device action
            },
          },
        ]
      );
    };

    const handleActionApprove = ({ type, data }: { type: string; data: any }) => {
      console.log('Notification approved:', type, data);
      // Handle approve actions based on type
    };

    const handleActionDeny = ({ type, data }: { type: string; data: any }) => {
      console.log('Notification denied:', type, data);
      // Handle deny actions based on type
    };

    const handleActionViewDetails = ({ type, data }: { type: string; data: any }) => {
      console.log('View details requested:', type, data);
      // Navigate to appropriate details screen
    };

    const handleActionSecureAccount = ({ type, data }: { type: string; data: any }) => {
      console.log('Secure account requested:', type, data);
      // Navigate to security settings
    };

    const handleError = ({ error, context }: { error: Error; context: string }) => {
      console.error(`Push notification error (${context}):`, error);
      setState(prev => ({
        ...prev,
        error: `${context}: ${error.message}`,
      }));
    };

    // Add event listeners
    pushNotificationService.on('notificationReceived', handleNotificationReceived);
    pushNotificationService.on('securityAlert', handleSecurityAlert);
    pushNotificationService.on('authRequest', handleAuthRequest);
    pushNotificationService.on('deviceVerification', handleDeviceVerification);
    pushNotificationService.on('actionApprove', handleActionApprove);
    pushNotificationService.on('actionDeny', handleActionDeny);
    pushNotificationService.on('actionViewDetails', handleActionViewDetails);
    pushNotificationService.on('actionSecureAccount', handleActionSecureAccount);
    pushNotificationService.on('error', handleError);

    return () => {
      // Remove event listeners
      pushNotificationService.off('notificationReceived', handleNotificationReceived);
      pushNotificationService.off('securityAlert', handleSecurityAlert);
      pushNotificationService.off('authRequest', handleAuthRequest);
      pushNotificationService.off('deviceVerification', handleDeviceVerification);
      pushNotificationService.off('actionApprove', handleActionApprove);
      pushNotificationService.off('actionDeny', handleActionDeny);
      pushNotificationService.off('actionViewDetails', handleActionViewDetails);
      pushNotificationService.off('actionSecureAccount', handleActionSecureAccount);
      pushNotificationService.off('error', handleError);
    };
  }, []);

  /**
   * Check if notifications are properly configured
   */
  const isProperlyConfigured = useCallback((): boolean => {
    return !!(
      state.isInitialized &&
      state.permissions?.granted &&
      state.pushToken
    );
  }, [state.isInitialized, state.permissions?.granted, state.pushToken]);

  /**
   * Get notification status summary
   */
  const getNotificationStatus = useCallback(() => {
    if (!state.isInitialized) {
      return { status: 'not_initialized', message: 'Push notifications not initialized' };
    }
    
    if (!state.permissions?.granted) {
      return { status: 'permission_denied', message: 'Notification permissions not granted' };
    }
    
    if (!state.pushToken) {
      return { status: 'no_token', message: 'Push token not available' };
    }
    
    return { status: 'ready', message: 'Push notifications ready' };
  }, [state.isInitialized, state.permissions?.granted, state.pushToken]);

  return {
    // State
    ...state,
    recentNotifications,
    
    // Actions
    requestPermissions,
    sendTestNotification,
    handlePermissionRequest,
    clearError,
    clearRecentNotifications,
    
    // Utilities
    isProperlyConfigured,
    getNotificationStatus,
    
    // Service reference
    service: pushNotificationService,
  };
}