/**
 * Mobile Authentication Bridge Service
 * 
 * Provides complete authentication parity between web and mobile platforms.
 * Integrates OAuth providers, biometric authentication, and mobile-specific session management.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 */
import { gql } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import { secureStorage, appStorage, STORAGE_KEYS } from '@/lib/storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Complete the auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// GraphQL Mutations for OAuth and session management
const OAUTH_LOGIN_MUTATION = gql`
  mutation OAuthLogin($input: OAuthLoginInput!) {
    oauthLogin(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
        tenantId
        tier
        permissions
        onboardingCompleted
      }
      requiresOnboarding
    }
  }
`;

const GITHUB_OAUTH_MUTATION = gql`
  mutation GitHubOAuth($input: GitHubOAuthInput!) {
    githubOAuth(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
        tenantId
        tier
        permissions
        onboardingCompleted
      }
      requiresOnboarding
    }
  }
`;

const REGISTER_DEVICE_MUTATION = gql`
  mutation RegisterDevice($input: DeviceRegistrationInput!) {
    registerDevice(input: $input) {
      deviceId
      trusted
      requiresVerification
    }
  }
`;

const UPDATE_SESSION_MUTATION = gql`
  mutation UpdateSession($input: SessionUpdateInput!) {
    updateSession(input: $input) {
      sessionId
      expiresAt
    }
  }
`;

const BIOMETRIC_LOGIN_MUTATION = gql`
  mutation BiometricLogin($input: BiometricLoginInput!) {
    biometricLogin(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
        tenantId
        tier
        permissions
      }
    }
  }
`;

// Types
export interface OAuthProvider {
  name: 'google' | 'facebook' | 'github';
  displayName: string;
  icon: string;
}

export interface AuthResult {
  success: boolean;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
    tier: string;
    permissions: string[];
    onboardingCompleted: boolean;
  };
  requiresOnboarding?: boolean;
  error?: string;
}

export interface BiometricAuthResult {
  success: boolean;
  authMethod?: 'fingerprint' | 'face' | 'voice';
  fallbackToPassword: boolean;
  error?: string;
}

export interface DeviceSession {
  deviceId: string;
  platform: string;
  deviceName: string;
  appVersion: string;
  trusted: boolean;
  lastActivity: Date;
  ipAddress?: string;
}

export interface DeepLinkResult {
  success: boolean;
  action?: 'login' | 'oauth_callback' | 'password_reset' | 'verification';
  data?: Record<string, any>;
  error?: string;
}

/**
 * Mobile Authentication Bridge Service
 */
export class MobileAuthBridge {
  private static instance: MobileAuthBridge;
  private deviceInfo: DeviceSession | null = null;
  private pushToken: string | null = null;

  private constructor() {
    this.initializeDevice();
    this.setupDeepLinkHandling();
  }

  public static getInstance(): MobileAuthBridge {
    if (!MobileAuthBridge.instance) {
      MobileAuthBridge.instance = new MobileAuthBridge();
    }
    return MobileAuthBridge.instance;
  }

  /**
   * Initialize device information and register with backend
   */
  private async initializeDevice(): Promise<void> {
    try {
      const deviceId = await this.getOrCreateDeviceId();
      const deviceName = Device.deviceName || `${Device.brand} ${Device.modelName}`;
      const appVersion = '1.0.0'; // Should come from app.json or Constants

      this.deviceInfo = {
        deviceId,
        platform: Platform.OS,
        deviceName,
        appVersion,
        trusted: false,
        lastActivity: new Date(),
      };

      // Register device with backend
      await this.registerDevice();
    } catch (error) {
      console.error('Failed to initialize device:', error);
    }
  }

  /**
   * Get or create unique device ID
   */
  private async getOrCreateDeviceId(): Promise<string> {
    let deviceId = appStorage.getString('device_id');
    if (!deviceId) {
      deviceId = `mobile_${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      appStorage.setString('device_id', deviceId);
    }
    return deviceId;
  }

  /**
   * Register device with backend
   */
  private async registerDevice(): Promise<void> {
    if (!this.deviceInfo) return;

    try {
      const { data } = await apolloClient.mutate({
        mutation: REGISTER_DEVICE_MUTATION,
        variables: {
          input: {
            deviceId: this.deviceInfo.deviceId,
            platform: this.deviceInfo.platform,
            deviceName: this.deviceInfo.deviceName,
            appVersion: this.deviceInfo.appVersion,
            pushToken: this.pushToken,
          },
        },
      });

      if (data?.registerDevice) {
        this.deviceInfo.trusted = data.registerDevice.trusted;
      }
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  }

  /**
   * Setup deep link handling for OAuth callbacks and other auth flows
   */
  private setupDeepLinkHandling(): void {
    Linking.addEventListener('url', this.handleDeepLink.bind(this));
  }

  /**
   * Handle deep link URLs
   */
  public async handleDeepLink(url: string): Promise<DeepLinkResult> {
    try {
      const parsedUrl = Linking.parse(url);
      const { hostname, path, queryParams } = parsedUrl;

      // OAuth callback handling
      if (hostname === 'auth' && path) {
        const provider = path.replace('/', '') as 'google' | 'facebook' | 'github';
        
        if (['google', 'facebook', 'github'].includes(provider)) {
          return {
            success: true,
            action: 'oauth_callback',
            data: { provider, ...queryParams },
          };
        }
      }

      // Password reset handling
      if (hostname === 'reset-password') {
        return {
          success: true,
          action: 'password_reset',
          data: queryParams,
        };
      }

      // Email verification handling
      if (hostname === 'verify-email') {
        return {
          success: true,
          action: 'verification',
          data: queryParams,
        };
      }

      return {
        success: false,
        error: 'Unknown deep link format',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deep link parsing failed',
      };
    }
  }

  /**
   * Authenticate with Google OAuth
   */
  public async authenticateWithGoogle(): Promise<AuthResult> {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.enterprisebms.mobile',
        path: 'auth/google',
      });

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        additionalParameters: {},
        extraParams: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for tokens via backend
        const { data } = await apolloClient.mutate({
          mutation: OAUTH_LOGIN_MUTATION,
          variables: {
            input: {
              provider: 'google',
              code,
              redirectUri,
              deviceInfo: this.deviceInfo,
            },
          },
        });

        if (data?.oauthLogin) {
          const { accessToken, refreshToken, user, requiresOnboarding } = data.oauthLogin;
          
          // Store tokens securely
          await secureStorage.setTokens(accessToken, refreshToken);
          
          // Store user info
          if (user.tenantId) {
            appStorage.setString(STORAGE_KEYS.TENANT_ID, user.tenantId);
          }
          appStorage.setString(STORAGE_KEYS.USER_ID, user.id);

          return {
            success: true,
            tokens: { accessToken, refreshToken },
            user,
            requiresOnboarding,
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication cancelled by user',
        };
      }

      return {
        success: false,
        error: 'Google authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google authentication error',
      };
    }
  }

  /**
   * Authenticate with Facebook OAuth
   */
  public async authenticateWithFacebook(): Promise<AuthResult> {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.enterprisebms.mobile',
        path: 'auth/facebook',
      });

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID!,
        scopes: ['email', 'public_profile'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://www.facebook.com/v18.0/dialog/oauth',
      });

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for tokens via backend
        const { data } = await apolloClient.mutate({
          mutation: OAUTH_LOGIN_MUTATION,
          variables: {
            input: {
              provider: 'facebook',
              code,
              redirectUri,
              deviceInfo: this.deviceInfo,
            },
          },
        });

        if (data?.oauthLogin) {
          const { accessToken, refreshToken, user, requiresOnboarding } = data.oauthLogin;
          
          // Store tokens securely
          await secureStorage.setTokens(accessToken, refreshToken);
          
          // Store user info
          if (user.tenantId) {
            appStorage.setString(STORAGE_KEYS.TENANT_ID, user.tenantId);
          }
          appStorage.setString(STORAGE_KEYS.USER_ID, user.id);

          return {
            success: true,
            tokens: { accessToken, refreshToken },
            user,
            requiresOnboarding,
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication cancelled by user',
        };
      }

      return {
        success: false,
        error: 'Facebook authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Facebook authentication error',
      };
    }
  }

  /**
   * Authenticate with GitHub OAuth
   */
  public async authenticateWithGitHub(): Promise<AuthResult> {
    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'com.enterprisebms.mobile',
        path: 'auth/github',
      });

      const request = new AuthSession.AuthRequest({
        clientId: process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!,
        scopes: ['user:email', 'read:user'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://github.com/login/oauth/authorize',
      });

      if (result.type === 'success') {
        const { code } = result.params;
        
        // Exchange code for tokens via backend
        const { data } = await apolloClient.mutate({
          mutation: GITHUB_OAUTH_MUTATION,
          variables: {
            input: {
              code,
              redirectUri,
              deviceInfo: this.deviceInfo,
            },
          },
        });

        if (data?.githubOAuth) {
          const { accessToken, refreshToken, user, requiresOnboarding } = data.githubOAuth;
          
          // Store tokens securely
          await secureStorage.setTokens(accessToken, refreshToken);
          
          // Store user info
          if (user.tenantId) {
            appStorage.setString(STORAGE_KEYS.TENANT_ID, user.tenantId);
          }
          appStorage.setString(STORAGE_KEYS.USER_ID, user.id);

          return {
            success: true,
            tokens: { accessToken, refreshToken },
            user,
            requiresOnboarding,
          };
        }
      } else if (result.type === 'cancel') {
        return {
          success: false,
          error: 'Authentication cancelled by user',
        };
      }

      return {
        success: false,
        error: 'GitHub authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'GitHub authentication error',
      };
    }
  }

  /**
   * Authenticate with biometrics
   */
  public async authenticateWithBiometrics(userId: string): Promise<BiometricAuthResult> {
    try {
      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        return {
          success: false,
          fallbackToPassword: true,
          error: 'Biometric authentication not available',
        };
      }

      // Get supported authentication types
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      let authMethod: 'fingerprint' | 'face' | 'voice' = 'fingerprint';
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        authMethod = 'face';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        authMethod = 'fingerprint';
      }

      // Perform biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your account',
        fallbackLabel: 'Use password',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        // Verify with backend and get fresh tokens
        const { data } = await apolloClient.mutate({
          mutation: BIOMETRIC_LOGIN_MUTATION,
          variables: {
            input: {
              userId,
              deviceId: this.deviceInfo?.deviceId,
              biometricType: authMethod,
            },
          },
        });

        if (data?.biometricLogin) {
          const { accessToken, refreshToken } = data.biometricLogin;
          await secureStorage.setTokens(accessToken, refreshToken);
          
          return {
            success: true,
            authMethod,
            fallbackToPassword: false,
          };
        }
      }

      return {
        success: false,
        fallbackToPassword: result.error === 'user_fallback',
        error: result.error || 'Biometric authentication failed',
      };
    } catch (error) {
      return {
        success: false,
        fallbackToPassword: true,
        error: error instanceof Error ? error.message : 'Biometric authentication error',
      };
    }
  }

  /**
   * Register push notification token for security events
   */
  public async registerPushToken(userId: string, token: string): Promise<void> {
    try {
      this.pushToken = token;
      
      // Update device registration with push token
      await apolloClient.mutate({
        mutation: REGISTER_DEVICE_MUTATION,
        variables: {
          input: {
            deviceId: this.deviceInfo?.deviceId,
            platform: this.deviceInfo?.platform,
            deviceName: this.deviceInfo?.deviceName,
            appVersion: this.deviceInfo?.appVersion,
            pushToken: token,
            userId,
          },
        },
      });
    } catch (error) {
      console.error('Failed to register push token:', error);
    }
  }

  /**
   * Sync session across devices
   */
  public async syncSessionAcrossDevices(userId: string): Promise<DeviceSession[]> {
    try {
      // Update current session activity
      if (this.deviceInfo) {
        this.deviceInfo.lastActivity = new Date();
        
        await apolloClient.mutate({
          mutation: UPDATE_SESSION_MUTATION,
          variables: {
            input: {
              deviceId: this.deviceInfo.deviceId,
              lastActivity: this.deviceInfo.lastActivity.toISOString(),
              userId,
            },
          },
        });
      }

      // This would typically fetch all user sessions from the backend
      // For now, return current device session
      return this.deviceInfo ? [this.deviceInfo] : [];
    } catch (error) {
      console.error('Failed to sync session:', error);
      return [];
    }
  }

  /**
   * Get current device information
   */
  public getDeviceInfo(): DeviceSession | null {
    return this.deviceInfo;
  }

  /**
   * Get available OAuth providers
   */
  public getAvailableProviders(): OAuthProvider[] {
    return [
      {
        name: 'google',
        displayName: 'Google',
        icon: 'logo-google',
      },
      {
        name: 'facebook',
        displayName: 'Facebook',
        icon: 'logo-facebook',
      },
      {
        name: 'github',
        displayName: 'GitHub',
        icon: 'logo-github',
      },
    ];
  }

  /**
   * Handle OAuth callback from deep link
   */
  public async handleOAuthCallback(provider: 'google' | 'facebook' | 'github', code: string): Promise<AuthResult> {
    switch (provider) {
      case 'google':
        return this.authenticateWithGoogle();
      case 'facebook':
        return this.authenticateWithFacebook();
      case 'github':
        return this.authenticateWithGitHub();
      default:
        return {
          success: false,
          error: 'Unsupported OAuth provider',
        };
    }
  }
}

// Export singleton instance
export const mobileAuthBridge = MobileAuthBridge.getInstance();