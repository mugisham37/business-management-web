/**
 * Auth Provider
 * 
 * Provides authentication state and functions to the application through React Context.
 * Manages user state, loading state, and authentication status.
 * 
 * Features:
 * - Session restoration on mount
 * - Login with email/password
 * - Google OAuth login
 * - MFA verification
 * - Logout (single device and all devices)
 * - Token refresh
 * - MFA enrollment and disable
 * - Session management
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { 
  AuthManager, 
  AuthUser, 
  LoginResult, 
  MFASetup,
  initializeAuthManager,
  getAuthManager 
} from '@/foundation/lib/auth/auth-manager';
import { 
  TokenManager, 
  initializeTokenManager,
  getTokenManager 
} from '@/foundation/lib/auth/token-manager';

/**
 * Auth Context Value
 * 
 * Provides authentication state and functions to consuming components
 */
export interface AuthContextValue {
  // State
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Authentication
  login: (email: string, password: string, organizationId: string) => Promise<LoginResult>;
  loginWithGoogle: (code: string, organizationId?: string) => Promise<LoginResult>;
  verifyMFA: (userId: string, token: string, organizationId: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  refreshSession: () => Promise<void>;

  // MFA
  enableMFA: () => Promise<MFASetup>;
  disableMFA: (password: string, totpToken: string) => Promise<void>;

  // Password Management
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string, organizationId?: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Props for AuthProvider
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * 
 * Manages authentication state and provides auth functions to the application.
 * Automatically restores session on mount if valid refresh token exists.
 * 
 * @example
 * ```tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 * ```
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const apolloClient = useApolloClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authManager, setAuthManager] = useState<AuthManager | null>(null);
  const [tokenManager, setTokenManager] = useState<TokenManager | null>(null);

  // Initialize managers on mount
  useEffect(() => {
    const tokenMgr = initializeTokenManager(apolloClient);
    const authMgr = initializeAuthManager(apolloClient, tokenMgr);
    
    setTokenManager(tokenMgr);
    setAuthManager(authMgr);
  }, [apolloClient]);

  // Restore session on mount
  useEffect(() => {
    if (!authManager) return;

    const restoreSession = async () => {
      try {
        const restoredUser = await authManager.restoreSession();
        setUser(restoredUser);
      } catch (error) {
        console.error('Failed to restore session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [authManager]);

  /**
   * Login with email and password
   */
  const login = useCallback(
    async (email: string, password: string, organizationId: string): Promise<LoginResult> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      const result = await authManager.login(email, password, organizationId);
      
      if (!result.requiresMFA && result.user) {
        setUser(result.user);
      }
      
      return result;
    },
    [authManager]
  );

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = useCallback(
    async (code: string, organizationId?: string): Promise<LoginResult> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      const result = await authManager.loginWithGoogle(code, organizationId);
      
      if (!result.requiresMFA && result.user) {
        setUser(result.user);
      }
      
      return result;
    },
    [authManager]
  );

  /**
   * Verify MFA code
   */
  const verifyMFA = useCallback(
    async (userId: string, token: string, organizationId: string): Promise<AuthUser> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      const user = await authManager.verifyMFA(userId, token, organizationId);
      setUser(user);
      return user;
    },
    [authManager]
  );

  /**
   * Logout from current device
   */
  const logout = useCallback(async () => {
    if (!authManager) {
      throw new Error('AuthManager not initialized');
    }

    await authManager.logout();
    setUser(null);
  }, [authManager]);

  /**
   * Logout from all devices
   */
  const logoutAllDevices = useCallback(async () => {
    if (!authManager) {
      throw new Error('AuthManager not initialized');
    }

    await authManager.logoutAllDevices();
    setUser(null);
  }, [authManager]);

  /**
   * Refresh session (restore user state)
   */
  const refreshSession = useCallback(async () => {
    if (!authManager) {
      throw new Error('AuthManager not initialized');
    }

    const restoredUser = await authManager.restoreSession();
    setUser(restoredUser);
  }, [authManager]);

  /**
   * Enable MFA for current user
   */
  const enableMFA = useCallback(async (): Promise<MFASetup> => {
    if (!authManager) {
      throw new Error('AuthManager not initialized');
    }

    return await authManager.enableMFA();
  }, [authManager]);

  /**
   * Disable MFA for current user
   */
  const disableMFA = useCallback(
    async (password: string, totpToken: string): Promise<void> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      await authManager.disableMFA(password, totpToken);
      
      // Update user state to reflect MFA disabled
      if (user) {
        setUser({
          ...user,
          mfaEnabled: false,
        });
      }
    },
    [authManager, user]
  );

  /**
   * Change password for current user
   */
  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<void> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      await authManager.changePassword(currentPassword, newPassword);
    },
    [authManager]
  );

  /**
   * Request password reset email
   */
  const requestPasswordReset = useCallback(
    async (email: string, organizationId?: string): Promise<void> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      await authManager.requestPasswordReset(email, organizationId);
    },
    [authManager]
  );

  /**
   * Reset password with token from email
   */
  const resetPassword = useCallback(
    async (token: string, newPassword: string): Promise<void> => {
      if (!authManager) {
        throw new Error('AuthManager not initialized');
      }

      await authManager.resetPassword(token, newPassword);
    },
    [authManager]
  );

  const value: AuthContextValue = {
    // State
    user,
    loading,
    isAuthenticated: !!user,

    // Authentication
    login,
    loginWithGoogle,
    verifyMFA,
    logout,
    logoutAllDevices,
    refreshSession,

    // MFA
    enableMFA,
    disableMFA,

    // Password Management
    changePassword,
    requestPasswordReset,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * 
 * @throws Error if used outside AuthProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, login, logout } = useAuth();
 *   
 *   if (!user) {
 *     return <LoginForm onLogin={login} />;
 *   }
 *   
 *   return <div>Welcome {user.firstName}!</div>;
 * }
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}
