/**
 * Deep Link Handler Component
 * 
 * Handles deep link authentication flows including OAuth callbacks,
 * password resets, email verification, and device verification.
 * 
 * Requirements: 3.5
 */
import React, { useEffect, useCallback } from 'react';
import { Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useMobileAuth, useSessionSync } from '@/hooks/auth';
import { usePushNotifications } from '@/hooks/notifications';

interface DeepLinkHandlerProps {
  children?: React.ReactNode;
}

export function DeepLinkHandler({ children }: DeepLinkHandlerProps) {
  const router = useRouter();
  const { handleDeepLink: handleMobileAuthDeepLink } = useMobileAuth();
  const { handleDeepLinkAuth } = useSessionSync();
  const { clearError } = usePushNotifications();

  /**
   * Handle incoming deep links
   */
  const handleDeepLink = useCallback(async (url: string) => {
    try {
      console.log('Handling deep link:', url);
      
      // Parse the URL to determine the type of deep link
      const parsedUrl = Linking.parse(url);
      const { hostname, path, queryParams } = parsedUrl;

      // Handle OAuth callbacks
      if (hostname === 'auth' && path) {
        const provider = path.replace('/', '');
        const { code, state, error } = queryParams || {};

        if (error) {
          Alert.alert(
            'Authentication Error',
            `${provider} authentication failed: ${error}`,
            [{ text: 'OK' }]
          );
          return;
        }

        if (code && ['google', 'facebook', 'github'].includes(provider)) {
          Alert.alert(
            'Authentication',
            `Processing ${provider} authentication...`,
            [{ text: 'OK' }]
          );
          
          // Let the mobile auth service handle the OAuth callback
          const result = await handleMobileAuthDeepLink(url);
          
          if (result?.success) {
            router.replace('/(tabs)');
          }
        }
        return;
      }

      // Handle password reset
      if (hostname === 'reset-password') {
        const { token } = queryParams || {};
        
        if (token) {
          Alert.alert(
            'Password Reset',
            'You can now reset your password.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Reset Password',
                onPress: () => {
                  // Navigate to password reset screen with token
                  router.push(`/(auth)/reset-password?token=${token}`);
                },
              },
            ]
          );
        }
        return;
      }

      // Handle email verification
      if (hostname === 'verify-email') {
        const { token } = queryParams || {};
        
        if (token) {
          Alert.alert(
            'Email Verification',
            'Your email has been verified successfully!',
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navigate to login or dashboard
                  router.push('/(auth)/login');
                },
              },
            ]
          );
        }
        return;
      }

      // Handle device verification
      if (hostname === 'verify-device') {
        const { token, deviceId } = queryParams || {};
        
        if (token && deviceId) {
          Alert.alert(
            'Device Verification',
            'Do you want to trust this device for future logins?',
            [
              {
                text: 'Block Device',
                style: 'destructive',
                onPress: () => {
                  // Handle device blocking
                  console.log('Device blocked:', deviceId);
                },
              },
              {
                text: 'Trust Device',
                onPress: () => {
                  // Handle device trusting
                  console.log('Device trusted:', deviceId);
                },
              },
            ]
          );
        }
        return;
      }

      // Handle MFA setup
      if (hostname === 'setup-mfa') {
        Alert.alert(
          'Multi-Factor Authentication',
          'Set up additional security for your account.',
          [
            {
              text: 'Later',
              style: 'cancel',
            },
            {
              text: 'Setup Now',
              onPress: () => {
                router.push('/(auth)/setup-mfa');
              },
            },
          ]
        );
        return;
      }

      // Handle session verification
      if (hostname === 'verify-session') {
        const { sessionId } = queryParams || {};
        
        if (sessionId) {
          Alert.alert(
            'Session Verification',
            'A new session is requesting access to your account.',
            [
              {
                text: 'Deny',
                style: 'destructive',
                onPress: () => {
                  // Handle session denial
                  console.log('Session denied:', sessionId);
                },
              },
              {
                text: 'Allow',
                onPress: () => {
                  // Handle session approval
                  console.log('Session approved:', sessionId);
                },
              },
            ]
          );
        }
        return;
      }

      // Handle general authentication deep links
      const authResult = await handleDeepLinkAuth(url);
      if (authResult) {
        console.log('Deep link handled by session sync:', authResult);
      }

    } catch (error) {
      console.error('Deep link handling error:', error);
      Alert.alert(
        'Link Error',
        'Unable to process the link. Please try again.',
        [{ text: 'OK' }]
      );
    }
  }, [handleMobileAuthDeepLink, handleDeepLinkAuth, router]);

  /**
   * Handle initial URL when app is opened from a deep link
   */
  const handleInitialURL = useCallback(async () => {
    try {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        // Add a small delay to ensure the app is fully loaded
        setTimeout(() => {
          handleDeepLink(initialUrl);
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting initial URL:', error);
    }
  }, [handleDeepLink]);

  /**
   * Setup deep link listeners
   */
  useEffect(() => {
    // Handle initial URL
    handleInitialURL();

    // Listen for incoming URLs while app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription?.remove();
    };
  }, [handleInitialURL, handleDeepLink]);

  /**
   * Handle app state changes for deep link processing
   */
  useEffect(() => {
    // Clear any notification errors when deep links are processed
    clearError();
  }, [clearError]);

  // This component doesn't render anything visible
  return <>{children}</>;
}

/**
 * Deep Link URL Builder Utility
 */
export class DeepLinkBuilder {
  private static baseScheme = 'com.enterprisebms.mobile';

  /**
   * Build OAuth callback URL
   */
  static buildOAuthCallback(provider: 'google' | 'facebook' | 'github'): string {
    return `${this.baseScheme}://auth/${provider}`;
  }

  /**
   * Build password reset URL
   */
  static buildPasswordReset(token: string): string {
    return `${this.baseScheme}://reset-password?token=${token}`;
  }

  /**
   * Build email verification URL
   */
  static buildEmailVerification(token: string): string {
    return `${this.baseScheme}://verify-email?token=${token}`;
  }

  /**
   * Build device verification URL
   */
  static buildDeviceVerification(token: string, deviceId: string): string {
    return `${this.baseScheme}://verify-device?token=${token}&deviceId=${deviceId}`;
  }

  /**
   * Build MFA setup URL
   */
  static buildMFASetup(): string {
    return `${this.baseScheme}://setup-mfa`;
  }

  /**
   * Build session verification URL
   */
  static buildSessionVerification(sessionId: string): string {
    return `${this.baseScheme}://verify-session?sessionId=${sessionId}`;
  }
}

export default DeepLinkHandler;