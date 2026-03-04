'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { apolloClient } from '@/lib/api/apollo-client';
import { tokenManager } from '@/lib/auth/token-manager';
import { sessionManager } from '@/lib/auth/session-manager';
import { permissionChecker } from '@/lib/auth/permission-checker';
import {
  LOGIN_MUTATION,
  LOGIN_WITH_PIN_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  CHANGE_PASSWORD_MUTATION,
} from '@/graphql/mutations/auth';

/**
 * User type (will be replaced by generated types)
 * 
 * Requirements: 4.2
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  hierarchyLevel: number;
  [key: string]: unknown;
}

/**
 * Authentication state interface
 * 
 * Requirements: 4.2, 9.1
 */
export interface AuthState {
  /** Current authenticated user */
  user: User | null;
  
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  
  /** Whether authentication state is being loaded */
  isLoading: boolean;
  
  /** Authentication error if any */
  error: Error | null;
}

/**
 * Authentication context value interface
 * 
 * Requirements: 4.2, 9.1
 */
export interface AuthContextValue extends AuthState {
  /**
   * Login with email and password
   * 
   * @param email - User email
   * @param password - User password
   * @param organizationId - Organization UUID
   * @returns Promise that resolves when login is complete
   */
  login: (email: string, password: string, organizationId: string) => Promise<void>;
  
  /**
   * Login with email and PIN
   * 
   * @param email - User email
   * @param pin - 6-digit PIN
   * @param organizationId - Organization UUID
   * @returns Promise that resolves when login is complete
   */
  loginWithPin: (email: string, pin: string, organizationId: string) => Promise<void>;
  
  /**
   * Logout current user
   * 
   * @returns Promise that resolves when logout is complete
   */
  logout: () => Promise<void>;
  
  /**
   * Refresh access token
   * 
   * @returns Promise that resolves when token is refreshed
   */
  refreshToken: () => Promise<void>;
  
  /**
   * Change user password
   * 
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @returns Promise that resolves when password is changed
   */
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

/**
 * Authentication context
 * 
 * Requirements: 4.2
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider props
 */
export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * 
 * Provides authentication state and methods to the application.
 * Manages user session, token lifecycle, and multi-tab synchronization.
 * 
 * Features:
 * - User authentication state management
 * - Token management (access & refresh tokens)
 * - Multi-tab session synchronization
 * - Automatic token refresh
 * - Session timeout handling
 * 
 * Requirements: 4.2, 9.1
 * 
 * @example
 * ```typescript
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Initialize authentication state from token
   */
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = tokenManager.getAccessToken();
        
        if (token && !tokenManager.isTokenExpired()) {
          const payload = tokenManager.decodeToken();
          
          if (payload) {
            // Reconstruct user from token payload
            setUser({
              id: payload.sub,
              email: payload.email,
              organizationId: payload.organizationId,
              hierarchyLevel: payload.hierarchyLevel,
              // Note: Full user object should be fetched from API if needed
            } as User);
          }
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err instanceof Error ? err : new Error('Authentication initialization failed'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Track component mount status
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Login with email and password
   * 
   * Requirements: 4.2
   */
  const login = useCallback(async (
    email: string,
    password: string,
    organizationId: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apolloClient.mutate<{
        login: {
          accessToken: string;
          refreshToken: string;
          user: User;
        };
      }>({
        mutation: LOGIN_MUTATION,
        variables: { email, password, organizationId },
      });

      if (data?.login) {
        const { accessToken, refreshToken, user: userData } = data.login;
        
        // Store tokens
        tokenManager.setTokens(accessToken, refreshToken);
        
        // Update user state
        if (isMountedRef.current) {
          setUser(userData);
        }
        
        // Broadcast login event to other tabs
        sessionManager.broadcastEvent('login', { user: userData });
      }
    } catch (err) {
      const loginError = err instanceof Error ? err : new Error('Login failed');
      if (isMountedRef.current) {
        setError(loginError);
      }
      throw loginError;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Login with email and PIN
   * 
   * Requirements: 4.2
   */
  const loginWithPin = useCallback(async (
    email: string,
    pin: string,
    organizationId: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apolloClient.mutate<{
        loginWithPin: {
          accessToken: string;
          refreshToken: string;
          user: User;
        };
      }>({
        mutation: LOGIN_WITH_PIN_MUTATION,
        variables: { email, pin, organizationId },
      });

      if (data?.loginWithPin) {
        const { accessToken, refreshToken, user: userData } = data.loginWithPin;
        
        // Store tokens
        tokenManager.setTokens(accessToken, refreshToken);
        
        // Update user state
        if (isMountedRef.current) {
          setUser(userData);
        }
        
        // Broadcast login event to other tabs
        sessionManager.broadcastEvent('login', { user: userData });
      }
    } catch (err) {
      const loginError = err instanceof Error ? err : new Error('PIN login failed');
      if (isMountedRef.current) {
        setError(loginError);
      }
      throw loginError;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Logout current user
   * 
   * Requirements: 4.2
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call logout mutation
      await apolloClient.mutate({
        mutation: LOGOUT_MUTATION,
      });
      
      // Clear tokens
      tokenManager.clearTokens();
      
      // Clear permission cache
      permissionChecker.clearCache();
      
      // Clear user state
      if (isMountedRef.current) {
        setUser(null);
      }
      
      // Broadcast logout event to other tabs
      sessionManager.broadcastEvent('logout');
    } catch (err) {
      const logoutError = err instanceof Error ? err : new Error('Logout failed');
      if (isMountedRef.current) {
        setError(logoutError);
      }
      throw logoutError;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Refresh access token
   * 
   * Requirements: 4.2
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const currentRefreshToken = tokenManager.getRefreshToken();
      
      if (!currentRefreshToken) {
        throw new Error('No refresh token available');
      }

      const { data } = await apolloClient.mutate<{
        refreshToken: {
          accessToken: string;
          refreshToken: string;
        };
      }>({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: { refreshToken: currentRefreshToken },
      });

      if (data?.refreshToken) {
        const { accessToken, refreshToken: newRefreshToken } = data.refreshToken;
        
        // Update tokens
        tokenManager.setTokens(accessToken, newRefreshToken);
        
        // Broadcast token refresh event to other tabs
        sessionManager.broadcastEvent('token_refresh', {
          accessToken,
          refreshToken: newRefreshToken,
        });
      }
    } catch (err) {
      const refreshError = err instanceof Error ? err : new Error('Token refresh failed');
      if (isMountedRef.current) {
        setError(refreshError);
      }
      
      // If refresh fails, logout user
      await logout();
      
      throw refreshError;
    }
  }, [logout]);

  /**
   * Change user password
   * 
   * Requirements: 4.2
   */
  const changePassword = useCallback(async (
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const { data } = await apolloClient.mutate<{
        changePassword: {
          success: boolean;
        };
      }>({
        mutation: CHANGE_PASSWORD_MUTATION,
        variables: { oldPassword, newPassword },
      });
      
      if (!data?.changePassword?.success) {
        throw new Error('Password change failed');
      }
    } catch (err) {
      const passwordError = err instanceof Error ? err : new Error('Password change failed');
      if (isMountedRef.current) {
        setError(passwordError);
      }
      throw passwordError;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithPin,
    logout,
    refreshToken,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Access authentication state and methods from any component.
 * Must be used within an AuthProvider.
 * 
 * Features:
 * - Access current user
 * - Check authentication status
 * - Login/logout methods
 * - Token refresh
 * - Password change
 * 
 * Requirements: 4.2, 9.1
 * 
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { user, isAuthenticated, login, logout } = useAuth();
 *   
 *   if (!isAuthenticated) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *   
 *   return (
 *     <div>
 *       <p>Welcome, {user.firstName}!</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
