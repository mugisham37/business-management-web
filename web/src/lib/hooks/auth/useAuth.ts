'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { TokenManager } from '../../auth/token-manager';
import { AuthEventEmitter } from '../../auth/auth-events';
import { 
  GET_CURRENT_USER,
  LOGIN,
  LOGOUT,
  REGISTER,
  USER_AUTH_EVENTS,
  USER_SESSION_EVENTS
} from '../../graphql/operations/auth';
import { 
  AuthUser, 
  LoginInput, 
  RegisterInput, 
  LoginResponse,
  AuthEvent,
  AuthEventType
} from '../../graphql/generated/types';

/**
 * Core Authentication Hook
 * 
 * Provides comprehensive authentication state management with:
 * - User authentication state
 * - Login/logout/register operations
 * - Token management
 * - Real-time auth events
 * - Session monitoring
 * - Multi-tab synchronization
 */

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

interface AuthOperations {
  login: (input: LoginInput) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  register: (input: RegisterInput) => Promise<LoginResponse>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
}

interface UseAuthReturn extends AuthState, AuthOperations {
  // Additional utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasTier: (tier: string) => boolean;
  hasFeature: (feature: string) => boolean;
  getSecurityLevel: () => 'low' | 'medium' | 'high' | 'unknown';
}

export function useAuth(): UseAuthReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    isInitialized: false,
  });

  // GraphQL operations
  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(
    GET_CURRENT_USER,
    {
      skip: !TokenManager.isAuthenticated(),
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN, {
    errorPolicy: 'all',
  });

  const [logoutMutation] = useMutation(LOGOUT, {
    errorPolicy: 'all',
  });

  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER, {
    errorPolicy: 'all',
  });

  // Real-time subscriptions
  useSubscription(USER_AUTH_EVENTS, {
    skip: !authState.isAuthenticated,
    onData: ({ data }) => {
      if (data.data?.userAuthEvents) {
        handleAuthEvent(data.data.userAuthEvents);
      }
    },
  });

  useSubscription(USER_SESSION_EVENTS, {
    skip: !authState.isAuthenticated,
    onData: ({ data }) => {
      if (data.data?.userSessionEvents) {
        handleSessionEvent(data.data.userSessionEvents);
      }
    },
  });

  // Handle authentication events
  const handleAuthEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case AuthEventType.LOGIN:
        if (event.metadata?.user) {
          AuthEventEmitter.emit('auth:login', event.metadata.user as { id: string; email: string });
        }
        break;
      case AuthEventType.LOGOUT:
        AuthEventEmitter.emit('auth:logout', { reason: 'server_logout' });
        break;
      case AuthEventType.PASSWORD_CHANGED:
        // Force re-authentication after password change
        AuthEventEmitter.emit('auth:logout', { reason: 'password_changed' });
        break;
      default:
        console.log('Received auth event:', event);
    }
  }, []);

  // Handle session events
  const handleSessionEvent = useCallback((event: AuthEvent) => {
    // Session events don't have a specific type in AuthEventType, handle generically
    if (event.metadata?.sessionExpired) {
      AuthEventEmitter.emit('auth:session_expired');
    } else {
      console.log('Received session event:', event);
    }
  }, []);

  // Login operation
  const login = useCallback(async (input: LoginInput): Promise<LoginResponse> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await loginMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        const error = result.errors[0];
        
        // Handle MFA required
        if (error?.extensions?.code === 'MFA_REQUIRED') {
          throw new Error('MFA_REQUIRED');
        }
        
        throw new Error(error?.message || 'Login failed');
      }

      const loginData = result.data?.login;
      if (!loginData) {
        throw new Error('Login failed: No data returned');
      }

      // Handle MFA requirement
      if (loginData.requiresMfa) {
        throw new Error('MFA_REQUIRED');
      }

      // Store tokens
      TokenManager.setTokens({
        accessToken: loginData.accessToken,
        refreshToken: loginData.refreshToken,
        expiresIn: loginData.expiresIn,
        tokenType: loginData.tokenType,
      });

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        user: loginData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Emit login event
      AuthEventEmitter.emit('auth:login', loginData.user);

      return loginData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [loginMutation]);

  // Logout operation
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Call server logout
      await logoutMutation();
    } catch (error) {
      console.error('Server logout failed:', error);
    } finally {
      // Always clear local state
      TokenManager.clearTokens();
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
      
      AuthEventEmitter.emit('auth:logout', { reason: 'manual' });
    }
  }, [logoutMutation]);

  // Register operation
  const register = useCallback(async (input: RegisterInput): Promise<LoginResponse> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await registerMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Registration failed');
      }

      const registerData = result.data?.register;
      if (!registerData) {
        throw new Error('Registration failed: No data returned');
      }

      // Store tokens
      TokenManager.setTokens({
        accessToken: registerData.accessToken,
        refreshToken: registerData.refreshToken,
        expiresIn: registerData.expiresIn,
        tokenType: registerData.tokenType,
      });

      // Update auth state
      setAuthState(prev => ({
        ...prev,
        user: registerData.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));

      // Emit register event
      AuthEventEmitter.emit('auth:register', registerData.user);

      return registerData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [registerMutation]);

  // Refresh token operation
  const refreshToken = useCallback(async (): Promise<boolean> => {
    return TokenManager.refreshToken();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Permission checking utilities
  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user?.permissions) return false;
    
    // Check exact match
    if (authState.user.permissions.includes(permission)) return true;
    
    // Check wildcard permissions
    const parts = permission.split(':');
    if (parts.length >= 2) {
      const wildcardPermission = `${parts[0]}:*`;
      if (authState.user.permissions.includes(wildcardPermission)) return true;
    }
    
    return false;
  }, [authState.user]);

  const hasRole = useCallback((role: string): boolean => {
    return authState.user?.role === role;
  }, [authState.user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return authState.user?.role ? roles.includes(authState.user.role) : false;
  }, [authState.user]);

  const hasTier = useCallback((tier: string): boolean => {
    if (!authState.user?.businessTier) return false;
    
    // Define tier hierarchy
    const tierHierarchy = ['free', 'basic', 'standard', 'premium', 'enterprise'];
    const userTierIndex = tierHierarchy.indexOf(authState.user.businessTier);
    const requiredTierIndex = tierHierarchy.indexOf(tier);
    
    return userTierIndex >= requiredTierIndex;
  }, [authState.user]);

  const hasFeature = useCallback((feature: string): boolean => {
    return authState.user?.featureFlags?.includes(feature) || false;
  }, [authState.user]);

  const getSecurityLevel = useCallback((): 'low' | 'medium' | 'high' | 'unknown' => {
    // This would be based on risk score and other security factors
    // For now, return a simple implementation
    return 'medium';
  }, []);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (TokenManager.isAuthenticated()) {
          // Try to get current user
          const result = await refetchUser();
          
          if (result.data?.me) {
            setAuthState({
              user: result.data.me,
              isAuthenticated: true,
              isLoading: false,
              error: null,
              isInitialized: true,
            });
          } else {
            // Token exists but user fetch failed, clear tokens
            TokenManager.clearTokens();
            setAuthState({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
              isInitialized: true,
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        TokenManager.clearTokens();
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          isInitialized: true,
        });
      }
    };

    initializeAuth();
  }, [refetchUser]);

  // Update auth state when user data changes
  useEffect(() => {
    if (userData?.me && TokenManager.isAuthenticated()) {
      setAuthState(prev => ({
        ...prev,
        user: userData.me,
        isAuthenticated: true,
        isLoading: userLoading,
        error: userError?.message || null,
        isInitialized: true,
      }));
    } else if (!TokenManager.isAuthenticated()) {
      setAuthState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      }));
    }
  }, [userData, userLoading, userError]);

  // Listen to auth events
  useEffect(() => {
    const handleTokensCleared = () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true,
      });
    };

    const handleTokensUpdated = () => {
      // Refetch user data when tokens are updated
      if (TokenManager.isAuthenticated()) {
        refetchUser();
      }
    };

    AuthEventEmitter.on('tokens:cleared', handleTokensCleared);
    AuthEventEmitter.on('tokens:updated', handleTokensUpdated);
    AuthEventEmitter.on('tokens:refreshed', handleTokensUpdated);

    return () => {
      AuthEventEmitter.off('tokens:cleared', handleTokensCleared);
      AuthEventEmitter.off('tokens:updated', handleTokensUpdated);
      AuthEventEmitter.off('tokens:refreshed', handleTokensUpdated);
    };
  }, [refetchUser]);

  return {
    // State
    ...authState,
    isLoading: authState.isLoading || loginLoading || registerLoading || userLoading,
    
    // Operations
    login,
    logout,
    register,
    refreshToken,
    clearError,
    
    // Utilities
    hasPermission,
    hasRole,
    hasAnyRole,
    hasTier,
    hasFeature,
    getSecurityLevel,
  };
}