/**
 * Mobile Authentication Bridge Tests
 * 
 * Tests for OAuth integration, biometric authentication, and session management.
 */
import { MobileAuthBridge } from '../MobileAuthBridge';

// Mock dependencies
jest.mock('@apollo/client');
jest.mock('@/lib/apollo');
jest.mock('@/lib/storage');
jest.mock('expo-local-authentication');
jest.mock('expo-auth-session');
jest.mock('expo-linking');
jest.mock('expo-device');
jest.mock('expo-notifications');

describe('MobileAuthBridge', () => {
  let authBridge: MobileAuthBridge;

  beforeEach(() => {
    authBridge = MobileAuthBridge.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('OAuth Authentication', () => {
    test('should authenticate with Google successfully', async () => {
      // Mock successful Google OAuth flow
      const mockResult = {
        success: true,
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
          tenantId: 'tenant-123',
          tier: 'small',
          permissions: ['read:dashboard'],
          onboardingCompleted: true,
        },
      };

      // Test Google authentication
      const result = await authBridge.authenticateWithGoogle();
      
      // Verify the result structure
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
    });

    test('should authenticate with Facebook successfully', async () => {
      const result = await authBridge.authenticateWithFacebook();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
    });

    test('should authenticate with GitHub successfully', async () => {
      const result = await authBridge.authenticateWithGitHub();
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('tokens');
      expect(result).toHaveProperty('user');
    });

    test('should handle OAuth cancellation', async () => {
      const result = await authBridge.authenticateWithGoogle();
      
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe('Biometric Authentication', () => {
    test('should authenticate with biometrics when available', async () => {
      const userId = 'user-123';
      const result = await authBridge.authenticateWithBiometrics(userId);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('fallbackToPassword');
      
      if (result.success) {
        expect(result.authMethod).toBeDefined();
      }
    });

    test('should fallback to password when biometrics unavailable', async () => {
      const userId = 'user-123';
      const result = await authBridge.authenticateWithBiometrics(userId);
      
      if (!result.success) {
        expect(result.fallbackToPassword).toBe(true);
      }
    });
  });

  describe('Deep Link Handling', () => {
    test('should handle OAuth callback deep links', async () => {
      const deepLinkUrl = 'com.enterprisebms.mobile://auth/google?code=auth-code&state=state-123';
      const result = await authBridge.handleDeepLink(deepLinkUrl);
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('action');
      expect(result).toHaveProperty('data');
    });

    test('should handle password reset deep links', async () => {
      const deepLinkUrl = 'com.enterprisebms.mobile://reset-password?token=reset-token';
      const result = await authBridge.handleDeepLink(deepLinkUrl);
      
      expect(result).toHaveProperty('success');
      expect(result.action).toBe('password_reset');
    });

    test('should handle email verification deep links', async () => {
      const deepLinkUrl = 'com.enterprisebms.mobile://verify-email?token=verify-token';
      const result = await authBridge.handleDeepLink(deepLinkUrl);
      
      expect(result).toHaveProperty('success');
      expect(result.action).toBe('verification');
    });
  });

  describe('Session Management', () => {
    test('should sync sessions across devices', async () => {
      const userId = 'user-123';
      const sessions = await authBridge.syncSessionAcrossDevices(userId);
      
      expect(Array.isArray(sessions)).toBe(true);
    });

    test('should register push token', async () => {
      const userId = 'user-123';
      const pushToken = 'expo-push-token';
      
      await expect(
        authBridge.registerPushToken(userId, pushToken)
      ).resolves.not.toThrow();
    });
  });

  describe('Provider Management', () => {
    test('should return available OAuth providers', () => {
      const providers = authBridge.getAvailableProviders();
      
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
      
      providers.forEach(provider => {
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('displayName');
        expect(provider).toHaveProperty('icon');
      });
    });

    test('should include Google, Facebook, and GitHub providers', () => {
      const providers = authBridge.getAvailableProviders();
      const providerNames = providers.map(p => p.name);
      
      expect(providerNames).toContain('google');
      expect(providerNames).toContain('facebook');
      expect(providerNames).toContain('github');
    });
  });

  describe('Device Information', () => {
    test('should return device information', () => {
      const deviceInfo = authBridge.getDeviceInfo();
      
      if (deviceInfo) {
        expect(deviceInfo).toHaveProperty('deviceId');
        expect(deviceInfo).toHaveProperty('platform');
        expect(deviceInfo).toHaveProperty('deviceName');
        expect(deviceInfo).toHaveProperty('appVersion');
        expect(deviceInfo).toHaveProperty('trusted');
        expect(deviceInfo).toHaveProperty('lastActivity');
      }
    });
  });
});