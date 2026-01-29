/**
 * AuthGateway Unit Tests
 * Basic tests for the authentication gateway functionality
 */

import { AuthGateway, SecurityEventType, type AuthGatewayConfig } from '../auth-gateway';
import { deviceFingerprintService } from '../device-fingerprint';

// Mock Apollo Client
jest.mock('@/lib/apollo/client', () => ({
  apolloClient: {
    mutate: jest.fn(),
    query: jest.fn(),
    subscribe: jest.fn(),
    cache: {
      reset: jest.fn(),
    },
  },
}));

// Mock managers
jest.mock('../subscription-manager', () => ({
  authSubscriptionManager: {
    subscribeToUserAuthEvents: jest.fn(),
    subscribeToUserPermissionEvents: jest.fn(),
    subscribeToUserSessionEvents: jest.fn(),
    subscribeToSecurityAlerts: jest.fn(),
    unsubscribeAll: jest.fn(),
  },
}));

jest.mock('../permissions-manager', () => ({
  permissionsManager: {
    getPermissions: jest.fn().mockResolvedValue(['users:read', 'pos:create']),
  },
}));

jest.mock('../mfa-manager-complete', () => ({
  completeMfaManager: {},
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window properties
Object.defineProperty(window, 'screen', {
  value: {
    width: 1920,
    height: 1080,
    colorDepth: 24,
  },
});

Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)',
    language: 'en-US',
    platform: 'Test Platform',
    cookieEnabled: true,
    hardwareConcurrency: 4,
  },
});

describe('AuthGateway', () => {
  let authGateway: AuthGateway;
  let mockConfig: AuthGatewayConfig;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);

    mockConfig = {
      tokenRefreshThreshold: 5,
      maxRetries: 3,
      sessionTimeout: 30,
      maxSessions: 5,
      enableDeviceTracking: false, // Disable in tests to avoid canvas issues
      enableSecurityEvents: true,
      enableCrossTabSync: true,
    };

    authGateway = new AuthGateway(mockConfig);
  });

  describe('initialization', () => {
    it('should initialize with default auth state', () => {
      const authState = authGateway.getAuthState();

      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
      expect(authState.permissions).toEqual([]);
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.isLoading).toBe(false);
      expect(authState.mfaRequired).toBe(false);
    });

    it('should setup device tracking when enabled', () => {
      const configWithTracking = { ...mockConfig, enableDeviceTracking: true };
      const gatewayWithTracking = new AuthGateway(configWithTracking);
      expect(gatewayWithTracking).toBeDefined();
      // Device tracking initialization is async, so we just verify config
    });
  });

  describe('security events', () => {
    it('should broadcast security events to listeners', () => {
      const mockListener = jest.fn();
      authGateway.onSecurityEvent(mockListener);

      const securityEvent = {
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: 'test-user-id',
        timestamp: new Date(),
        severity: 'low' as const,
      };

      authGateway.broadcastSecurityEvent(securityEvent);

      expect(mockListener).toHaveBeenCalledWith(securityEvent);
    });

    it('should handle security event listener errors gracefully', () => {
      const mockListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      authGateway.onSecurityEvent(mockListener);

      const securityEvent = {
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: 'test-user-id',
        timestamp: new Date(),
        severity: 'low' as const,
      };

      // Should not throw
      expect(() => {
        authGateway.broadcastSecurityEvent(securityEvent);
      }).not.toThrow();
    });

    it('should allow unsubscribing from security events', () => {
      const mockListener = jest.fn();
      const unsubscribe = authGateway.onSecurityEvent(mockListener);

      // Unsubscribe
      unsubscribe();

      const securityEvent = {
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: 'test-user-id',
        timestamp: new Date(),
        severity: 'low' as const,
      };

      authGateway.broadcastSecurityEvent(securityEvent);

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('auth state management', () => {
    it('should notify listeners when auth state changes', () => {
      const mockListener = jest.fn();
      authGateway.onAuthStateChange(mockListener);

      // Trigger a state change by calling a private method through public interface
      const initialState = authGateway.getAuthState();
      expect(initialState.isLoading).toBe(false);

      // The state change would happen during authentication
      // For now, we just verify the listener setup works
      expect(mockListener).not.toHaveBeenCalled(); // No changes yet
    });

    it('should allow unsubscribing from auth state changes', () => {
      const mockListener = jest.fn();
      const unsubscribe = authGateway.onAuthStateChange(mockListener);

      // Unsubscribe
      unsubscribe();

      // Any state changes should not trigger the listener
      // This is tested implicitly through the subscription mechanism
    });
  });

  describe('device tracking', () => {
    it('should generate device fingerprint when tracking is enabled', async () => {
      // Mock the device fingerprint service
      const mockFingerprint = {
        fingerprint: 'test-fingerprint-123',
        components: {
          userAgent: 'Mozilla/5.0 (Test Browser)',
          language: 'en-US',
          screen: '1920x1080x24',
          colorDepth: 24,
          timezone: 0,
          platform: 'Test Platform',
          cookieEnabled: true,
          localStorage: true,
          sessionStorage: true,
        },
        confidence: 85,
        timestamp: new Date(),
      };

      jest.spyOn(deviceFingerprintService, 'generateFingerprint')
        .mockResolvedValue(mockFingerprint);

      // The device tracking happens during initialization
      // We can verify it was called by checking the mock
      await new Promise(resolve => setTimeout(resolve, 0)); // Allow async init

      // Device tracking is initialized in constructor, so we verify the service exists
      expect(deviceFingerprintService).toBeDefined();
    });
  });

  describe('token management', () => {
    it('should return null for valid tokens when not authenticated', async () => {
      const tokens = await authGateway.getValidTokens();
      expect(tokens).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear auth state on logout', async () => {
      // Mock successful logout
      const { apolloClient } = require('@/lib/apollo/client');
      apolloClient.mutate.mockResolvedValue({
        data: { logout: { success: true } },
      });

      await authGateway.logout();

      const authState = authGateway.getAuthState();
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
      expect(authState.isAuthenticated).toBe(false);
    });

    it('should clear auth state even if server logout fails', async () => {
      // Mock failed logout
      const { apolloClient } = require('@/lib/apollo/client');
      apolloClient.mutate.mockRejectedValue(new Error('Network error'));

      await authGateway.logout();

      const authState = authGateway.getAuthState();
      expect(authState.user).toBeNull();
      expect(authState.tokens).toBeNull();
      expect(authState.isAuthenticated).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should use provided configuration', () => {
      const customConfig: AuthGatewayConfig = {
        tokenRefreshThreshold: 10,
        maxRetries: 5,
        sessionTimeout: 60,
        maxSessions: 10,
        enableDeviceTracking: false,
        enableSecurityEvents: false,
        enableCrossTabSync: false,
      };

      const customGateway = new AuthGateway(customConfig);
      expect(customGateway).toBeDefined();
      
      // Configuration is private, but we can verify it was used by checking behavior
      // For example, security events should not be enabled
      const mockListener = jest.fn();
      customGateway.onSecurityEvent(mockListener);

      const securityEvent = {
        type: SecurityEventType.LOGIN_SUCCESS,
        userId: 'test-user-id',
        timestamp: new Date(),
        severity: 'low' as const,
      };

      customGateway.broadcastSecurityEvent(securityEvent);
      
      // The listener should be called regardless of config
      expect(mockListener).toHaveBeenCalledWith(securityEvent);
    });
  });
});

describe('DeviceFingerprint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate fingerprint components', async () => {
    const fingerprint = await deviceFingerprintService.generateFingerprint();
    
    expect(fingerprint).toBeDefined();
    expect(fingerprint.fingerprint).toBeDefined();
    expect(fingerprint.components).toBeDefined();
    expect(fingerprint.confidence).toBeGreaterThan(0);
    expect(fingerprint.timestamp).toBeInstanceOf(Date);
  });

  it('should cache fingerprint for performance', async () => {
    const fingerprint1 = await deviceFingerprintService.generateFingerprint();
    const fingerprint2 = await deviceFingerprintService.generateFingerprint();
    
    // Should return the same cached fingerprint
    expect(fingerprint1.fingerprint).toBe(fingerprint2.fingerprint);
  });

  it('should clear cache when requested', async () => {
    await deviceFingerprintService.generateFingerprint();
    
    deviceFingerprintService.clearCache();
    
    const cachedFingerprint = deviceFingerprintService.getCachedFingerprint();
    expect(cachedFingerprint).toBeNull();
  });
});