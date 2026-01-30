/**
 * Authentication Gateway Service
 * Central authentication orchestrator that manages all auth operations across platforms
 * Implements Requirements 7.1, 7.2, 7.3 for seamless authentication flow
 */

import { useRouter } from 'next/navigation';
// These imports are reserved for future use
// import { useAuth } from '@/hooks/authentication/useAuth';
// import { useOnboarding } from '@/hooks/useOnboarding';
// import { useTierAccess } from '@/hooks/useTierAccess';
import { PostAuthRedirectManager } from './post-auth-redirect';

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: Record<string, unknown>;
  tokens?: {
    accessToken: string;
    refreshToken: string;
  };
  requiresOnboarding?: boolean;
  redirectTo?: string;
  error?: string;
}

export interface PostAuthRouting {
  isNewUser: boolean;
  hasCompletedOnboarding: boolean;
  userTier: string;
  permissions: string[];
}

/**
 * Authentication Gateway Class
 * Manages authentication flow and post-auth routing logic
 */
export class AuthGateway {
  private static instance: AuthGateway;

  static getInstance(): AuthGateway {
    if (!AuthGateway.instance) {
      AuthGateway.instance = new AuthGateway();
    }
    return AuthGateway.instance;
  }

  /**
   * Authenticate user and determine post-auth routing
   */
  async authenticate(credentials: AuthCredentials): Promise<AuthResult> {
    try {
      // TODO: Replace with actual GraphQL authentication mutation
      console.log('Authenticating user:', credentials.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful authentication
      const mockUser = {
        id: '1',
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        hasCompletedOnboarding: Math.random() > 0.5, // Random for demo
        tier: 'small',
        permissions: ['dashboard:read', 'inventory:read']
      };

      const tokens = {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token'
      };

      // Store tokens
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);

      // Determine post-auth routing
      const routing = this.determinePostAuthRouting({
        isNewUser: false,
        hasCompletedOnboarding: mockUser.hasCompletedOnboarding,
        userTier: mockUser.tier,
        permissions: mockUser.permissions
      });

      return {
        success: true,
        user: mockUser,
        tokens,
        requiresOnboarding: !mockUser.hasCompletedOnboarding,
        redirectTo: routing.redirectTo
      };
    } catch (error) {
      console.error('Authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Register new user and initiate onboarding flow
   */
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessName: string;
    acceptTerms: boolean;
  }): Promise<AuthResult> {
    try {
      // TODO: Replace with actual GraphQL registration mutation
      console.log('Registering new user:', userData.email);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful registration
      const mockUser = {
        id: '2',
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        hasCompletedOnboarding: false,
        tier: 'micro', // Default tier for new users
        permissions: ['dashboard:read'] // Basic permissions
      };

      const tokens = {
        accessToken: 'mock-access-token-new',
        refreshToken: 'mock-refresh-token-new'
      };

      // Store tokens
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);

      return {
        success: true,
        user: mockUser,
        tokens,
        requiresOnboarding: true,
        redirectTo: '/onboarding'
      };
    } catch (error) {
      console.error('Registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      };
    }
  }

  /**
   * Determine post-authentication routing logic
   * Implements Requirements 7.2, 7.3 for appropriate routing
   */
  private determinePostAuthRouting(routing: PostAuthRouting): { redirectTo: string } {
    const redirectManager = PostAuthRedirectManager.getInstance();
    
    // Check for intended destination first
    const intendedDestination = redirectManager.getIntendedDestination();
    if (intendedDestination && this.isValidRedirectPath(intendedDestination)) {
      redirectManager.clearIntendedDestination();
      return { redirectTo: intendedDestination };
    }

    // New users or users who haven't completed onboarding
    if (routing.isNewUser || !routing.hasCompletedOnboarding) {
      return { redirectTo: '/onboarding' };
    }

    // Existing users with completed onboarding
    // Route to tier-appropriate dashboard features
    const tierDashboardRoutes = {
      micro: '/dashboard',
      small: '/dashboard',
      medium: '/dashboard',
      enterprise: '/dashboard'
    };

    const dashboardRoute = tierDashboardRoutes[routing.userTier as keyof typeof tierDashboardRoutes] || '/dashboard';

    return { redirectTo: dashboardRoute };
  }

  /**
   * Validate that a redirect path is safe
   */
  private isValidRedirectPath(path: string): boolean {
    // Prevent open redirects by ensuring path is relative
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return false;
    }

    // Ensure path starts with /
    if (!path.startsWith('/')) {
      return false;
    }

    // Block certain sensitive paths
    const blockedPaths = ['/auth', '/login', '/register'];
    if (blockedPaths.some(blocked => path.startsWith(blocked))) {
      return false;
    }

    return true;
  }

  /**
   * Handle social authentication callback
   */
  async handleSocialAuthCallback(provider: string, code: string): Promise<AuthResult> {
    try {
      // TODO: Replace with actual GraphQL social auth mutation
      console.log('Handling social auth callback:', provider, code);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock successful social authentication
      const mockUser = {
        id: '3',
        email: `user@${provider}.com`,
        firstName: 'Social',
        lastName: 'User',
        hasCompletedOnboarding: Math.random() > 0.3, // Most social users complete onboarding
        tier: 'small',
        permissions: ['dashboard:read', 'inventory:read']
      };

      const tokens = {
        accessToken: 'mock-social-access-token',
        refreshToken: 'mock-social-refresh-token'
      };

      // Store tokens
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);

      // Determine post-auth routing
      const routing = this.determinePostAuthRouting({
        isNewUser: false,
        hasCompletedOnboarding: mockUser.hasCompletedOnboarding,
        userTier: mockUser.tier,
        permissions: mockUser.permissions
      });

      return {
        success: true,
        user: mockUser,
        tokens,
        requiresOnboarding: !mockUser.hasCompletedOnboarding,
        redirectTo: routing.redirectTo
      };
    } catch (error) {
      console.error('Social authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Social authentication failed'
      };
    }
  }

  /**
   * Check if user is authenticated and get current session
   */
  async getCurrentSession(): Promise<{ isAuthenticated: boolean; user?: Record<string, unknown>; requiresOnboarding?: boolean }> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return { isAuthenticated: false };
      }

      // TODO: Replace with actual token validation
      // For now, assume token is valid if it exists
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        hasCompletedOnboarding: true,
        tier: 'small',
        permissions: ['dashboard:read', 'inventory:read']
      };

      return {
        isAuthenticated: true,
        user: mockUser,
        requiresOnboarding: !mockUser.hasCompletedOnboarding
      };
    } catch (error) {
      console.error('Session check failed:', error);
      return { isAuthenticated: false };
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<void> {
    try {
      // TODO: Replace with actual logout mutation
      console.log('Logging out user');

      // Clear tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      // Clear any cached user data
      // This would typically clear auth store state
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }
}

/**
 * Hook for using the Authentication Gateway
 */
export function useAuthGateway() {
  const router = useRouter();
  const gateway = AuthGateway.getInstance();

  const authenticateAndRedirect = async (credentials: AuthCredentials) => {
    const result = await gateway.authenticate(credentials);
    
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    }
    
    return result;
  };

  const registerAndRedirect = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    businessName: string;
    acceptTerms: boolean;
  }) => {
    const result = await gateway.register(userData);
    
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    }
    
    return result;
  };

  const handleSocialAuthAndRedirect = async (provider: string, code: string) => {
    const result = await gateway.handleSocialAuthCallback(provider, code);
    
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    }
    
    return result;
  };

  const logoutAndRedirect = async () => {
    await gateway.logout();
    router.push('/');
  };

  return {
    gateway,
    authenticateAndRedirect,
    registerAndRedirect,
    handleSocialAuthAndRedirect,
    logoutAndRedirect,
    getCurrentSession: gateway.getCurrentSession.bind(gateway)
  };
}

export default AuthGateway;