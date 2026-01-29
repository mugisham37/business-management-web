/**
 * Mobile Authentication Hook
 * 
 * Provides mobile-specific authentication functionality including OAuth,
 * biometric authentication, and session management.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
import { useState, useCallback, useEffect } from 'react';
import { Alert, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import { 
  mobileAuthBridge, 
  AuthResult, 
  BiometricAuthResult, 
  OAuthProvider,
  DeviceSession,
  DeepLinkResult 
} from '@/lib/auth/MobileAuthBridge';
import { useAuth } from './useAuth';

interface MobileAuthState {
  isLoading: boolean;
  error: string | null;
  availableProviders: OAuthProvider[];
  deviceInfo: DeviceSession | null;
  pushToken: string | null;
}

export function useMobileAuth() {
  const { user, login: baseLogin, logout: baseLogout } = useAuth();
  
  const [state, setState] = useState<MobileAuthState>({
    isLoading: false,
    error: null,
    availableProviders: mobileAuthBridge.getAvailableProviders(),
    deviceInfo: mobileAuthBridge.getDeviceInfo(),
    pushToken: null,
  });

  /**
   * Initialize push notifications and device registration
   */
  const initializePushNotifications = useCallback(async () => {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      
      if (status === 'granted') {
        // Get push token
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        setState(prev => ({ ...prev, pushToken: token }));
        
        // Register token with backend if user is authenticated
        if (user?.id) {
          await mobileAuthBridge.registerPushToken(user.id, token);
        }
      }
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }, [user?.id]);

  /**
   * OAuth authentication with specified provider
   */
  const authenticateWithOAuth = useCallback(async (provider: 'google' | 'facebook' | 'github'): Promise<AuthResult> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      let result: AuthResult;
      
      switch (provider) {
        case 'google':
          result = await mobileAuthBridge.authenticateWithGoogle();
          break;
        case 'facebook':
          result = await mobileAuthBridge.authenticateWithFacebook();
          break;
        case 'github':
          result = await mobileAuthBridge.authenticateWithGitHub();
          break;
        default:
          throw new Error('Unsupported OAuth provider');
      }
      
      if (result.success && result.user) {
        // Sync session across devices
        await mobileAuthBridge.syncSessionAcrossDevices(result.user.id);
        
        // Register push token if available
        if (state.pushToken) {
          await mobileAuthBridge.registerPushToken(result.user.id, state.pushToken);
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.success ? null : result.error || 'Authentication failed',
        deviceInfo: mobileAuthBridge.getDeviceInfo(),
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OAuth authentication failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [state.pushToken]);

  /**
   * Biometric authentication
   */
  const authenticateWithBiometrics = useCallback(async (): Promise<BiometricAuthResult> => {
    if (!user?.id) {
      return {
        success: false,
        fallbackToPassword: true,
        error: 'No user session found',
      };
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const result = await mobileAuthBridge.authenticateWithBiometrics(user.id);
      
      if (result.success) {
        // Sync session after successful biometric auth
        await mobileAuthBridge.syncSessionAcrossDevices(user.id);
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: result.success ? null : result.error || 'Biometric authentication failed',
      }));
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Biometric authentication failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      
      return {
        success: false,
        fallbackToPassword: true,
        error: errorMessage,
      };
    }
  }, [user?.id]);

  /**
   * Handle deep link authentication flows
   */
  const handleDeepLink = useCallback(async (url: string): Promise<DeepLinkResult> => {
    try {
      const result = await mobileAuthBridge.handleDeepLink(url);
      
      if (result.success && result.action === 'oauth_callback' && result.data) {
        const { provider, code } = result.data;
        
        if (code && ['google', 'facebook', 'github'].includes(provider)) {
          // Handle OAuth callback
          const authResult = await mobileAuthBridge.handleOAuthCallback(provider, code);
          
          if (authResult.success) {
            Alert.alert(
              'Authentication Successful',
              `Successfully signed in with ${provider}`,
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'Authentication Failed',
              authResult.error || 'Failed to complete authentication',
              [{ text: 'OK' }]
            );
          }
        }
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deep link handling failed',
      };
    }
  }, []);

  /**
   * Sync session across all user devices
   */
  const syncSession = useCallback(async (): Promise<DeviceSession[]> => {
    if (!user?.id) return [];
    
    try {
      const sessions = await mobileAuthBridge.syncSessionAcrossDevices(user.id);
      setState(prev => ({ ...prev, deviceInfo: mobileAuthBridge.getDeviceInfo() }));
      return sessions;
    } catch (error) {
      console.error('Failed to sync session:', error);
      return [];
    }
  }, [user?.id]);

  /**
   * Get device information
   */
  const getDeviceInfo = useCallback((): DeviceSession | null => {
    return mobileAuthBridge.getDeviceInfo();
  }, []);

  /**
   * Enhanced login with mobile-specific features
   */
  const loginWithMobileFeatures = useCallback(async (
    credentials: { email: string; password: string } | { provider: 'google' | 'facebook' | 'github' }
  ): Promise<AuthResult> => {
    if ('provider' in credentials) {
      // OAuth login
      return authenticateWithOAuth(credentials.provider);
    } else {
      // Regular email/password login with mobile session tracking
      const result = await baseLogin(credentials);
      
      if (result.success && user?.id) {
        // Sync session after successful login
        await syncSession();
        
        // Register push token if available
        if (state.pushToken) {
          await mobileAuthBridge.registerPushToken(user.id, state.pushToken);
        }
      }
      
      return result;
    }
  }, [authenticateWithOAuth, baseLogin, user?.id, syncSession, state.pushToken]);

  /**
   * Enhanced logout with mobile session cleanup
   */
  const logoutWithMobileCleanup = useCallback(async () => {
    try {
      // Perform base logout
      await baseLogout();
      
      // Clear mobile-specific state
      setState(prev => ({ 
        ...prev, 
        error: null, 
        deviceInfo: null, 
        pushToken: null 
      }));
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [baseLogout]);

  /**
   * Clear authentication error
   */
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Show authentication options with mobile-specific providers
   */
  const showAuthOptions = useCallback(() => {
    const options = state.availableProviders.map(provider => ({
      text: `Continue with ${provider.displayName}`,
      onPress: () => authenticateWithOAuth(provider.name),
    }));

    options.push(
      {
        text: 'Use Email & Password',
        onPress: () => {
          // This would typically navigate to email login screen
          console.log('Navigate to email login');
        },
      },
      {
        text: 'Cancel',
        style: 'cancel' as const,
      }
    );

    Alert.alert('Sign In', 'Choose your preferred sign-in method:', options);
  }, [state.availableProviders, authenticateWithOAuth]);

  // Initialize push notifications on mount
  useEffect(() => {
    initializePushNotifications();
  }, [initializePushNotifications]);

  // Setup deep link listener
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription?.remove();
  }, [handleDeepLink]);

  // Register push token when user changes
  useEffect(() => {
    if (user?.id && state.pushToken) {
      mobileAuthBridge.registerPushToken(user.id, state.pushToken);
    }
  }, [user?.id, state.pushToken]);

  return {
    // State
    ...state,
    
    // OAuth methods
    authenticateWithGoogle: () => authenticateWithOAuth('google'),
    authenticateWithFacebook: () => authenticateWithOAuth('facebook'),
    authenticateWithGitHub: () => authenticateWithOAuth('github'),
    authenticateWithOAuth,
    
    // Biometric methods
    authenticateWithBiometrics,
    
    // Session management
    syncSession,
    getDeviceInfo,
    
    // Enhanced auth methods
    login: loginWithMobileFeatures,
    logout: logoutWithMobileCleanup,
    
    // Deep link handling
    handleDeepLink,
    
    // Utility methods
    clearError,
    showAuthOptions,
    
    // Push notifications
    pushToken: state.pushToken,
  };
}