'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '../graphql/client';
import { AuthEventEmitter } from '../auth/auth-events';
import { TokenManager } from '../auth/token-manager';
import { useAuth } from '../hooks/auth/useAuth';
import type { AuthUser } from '../graphql/generated/types';

/**
 * Authentication Provider
 * 
 * Provides authentication context and state management throughout the application.
 * Combines Apollo Client provider with authentication state management.
 * 
 * Features:
 * - Global authentication state
 * - Token management
 * - Real-time auth events
 * - Multi-tab synchronization
 * - Automatic session management
 */

interface AuthContextValue {
  // Authentication state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Authentication operations
  login: (input: any) => Promise<any>;
  logout: () => Promise<void>;
  register: (input: any) => Promise<any>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;

  // Permission utilities
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasTier: (tier: string) => boolean;
  hasFeature: (feature: string) => boolean;
  getSecurityLevel: () => 'low' | 'medium' | 'high' | 'unknown';
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

function AuthProviderInner({ children }: AuthProviderProps) {
  const auth = useAuth();

  // Setup global auth event handlers
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'auth_tokens') {
        // Token changed in another tab
        if (!event.newValue) {
          // Tokens were cleared
          auth.logout();
        }
      }
    };

    const handleBeforeUnload = () => {
      // Cleanup on page unload
      if (auth.isAuthenticated) {
        // Could save state or perform cleanup here
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && auth.isAuthenticated) {
        // Page became visible, check if token is still valid
        if (!TokenManager.isAuthenticated()) {
          auth.logout();
        }
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [auth]);

  // Handle authentication events
  useEffect(() => {
    const handleLogin = (user: AuthUser) => {
      console.log('User logged in:', user.email);
    };

    const handleLogout = (data?: { reason: string }) => {
      console.log('User logged out:', data?.reason || 'manual');
      
      // Clear Apollo cache
      apolloClient.clearStore();
      
      // Redirect to login if not already there
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        window.location.href = '/auth';
      }
    };

    const handleMfaRequired = (data: { mfaToken?: string; userId?: string }) => {
      console.log('MFA required for authentication');
      
      // Store MFA data for the flow
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('mfa_data', JSON.stringify(data));
        window.location.href = '/auth/mfa';
      }
    };

    const handlePermissionDenied = (data: { operation?: string; error: string }) => {
      console.warn('Permission denied:', data);
      
      // You could show a toast notification here
      // toast.error(`Access denied: ${data.error}`);
    };

    // Register event handlers
    AuthEventEmitter.on('auth:login', handleLogin);
    AuthEventEmitter.on('auth:logout', handleLogout);
    AuthEventEmitter.on('auth:mfa_required', handleMfaRequired);
    AuthEventEmitter.on('auth:permission_denied', handlePermissionDenied);

    // Cleanup
    return () => {
      AuthEventEmitter.off('auth:login', handleLogin);
      AuthEventEmitter.off('auth:logout', handleLogout);
      AuthEventEmitter.off('auth:mfa_required', handleMfaRequired);
      AuthEventEmitter.off('auth:permission_denied', handlePermissionDenied);
    };
  }, []);

  const contextValue: AuthContextValue = {
    // State
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    isInitialized: auth.isInitialized,

    // Operations
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    refreshToken: auth.refreshToken,
    clearError: auth.clearError,

    // Utilities
    hasPermission: auth.hasPermission,
    hasRole: auth.hasRole,
    hasAnyRole: auth.hasAnyRole,
    hasTier: auth.hasTier,
    hasFeature: auth.hasFeature,
    getSecurityLevel: auth.getSecurityLevel,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProviderInner>
        {children}
      </AuthProviderInner>
    </ApolloProvider>
  );
}

/**
 * Hook to access authentication context
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Higher-order component for authentication requirements
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    requireAuth?: boolean;
    requiredPermissions?: string[];
    requiredRoles?: string[];
    requiredTier?: string;
    fallback?: React.ComponentType;
  }
) {
  const {
    requireAuth = true,
    requiredPermissions = [],
    requiredRoles = [],
    requiredTier,
    fallback: Fallback,
  } = options || {};

  return function AuthenticatedComponent(props: P) {
    const auth = useAuthContext();

    // Show loading state while initializing
    if (!auth.isInitialized) {
      return <div>Loading...</div>;
    }

    // Check authentication requirement
    if (requireAuth && !auth.isAuthenticated) {
      if (Fallback) {
        return <Fallback />;
      }
      
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return <div>Redirecting to login...</div>;
    }

    // Check permission requirements
    if (requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.some(permission => 
        auth.hasPermission(permission)
      );
      
      if (!hasRequiredPermissions) {
        if (Fallback) {
          return <Fallback />;
        }
        return <div>Access denied: Insufficient permissions</div>;
      }
    }

    // Check role requirements
    if (requiredRoles.length > 0) {
      const hasRequiredRole = auth.hasAnyRole(requiredRoles);
      
      if (!hasRequiredRole) {
        if (Fallback) {
          return <Fallback />;
        }
        return <div>Access denied: Insufficient role</div>;
      }
    }

    // Check tier requirements
    if (requiredTier && !auth.hasTier(requiredTier)) {
      if (Fallback) {
        return <Fallback />;
      }
      return <div>Access denied: Upgrade required</div>;
    }

    return <Component {...props} />;
  };
}

/**
 * Hook for conditional rendering based on authentication
 */
export function useAuthGuard() {
  const auth = useAuthContext();

  return {
    canRender: (options: {
      requireAuth?: boolean;
      requiredPermissions?: string[];
      requiredRoles?: string[];
      requiredTier?: string;
    }) => {
      const {
        requireAuth = false,
        requiredPermissions = [],
        requiredRoles = [],
        requiredTier,
      } = options;

      if (requireAuth && !auth.isAuthenticated) {
        return false;
      }

      if (requiredPermissions.length > 0) {
        const hasPermissions = requiredPermissions.some(permission => 
          auth.hasPermission(permission)
        );
        if (!hasPermissions) return false;
      }

      if (requiredRoles.length > 0) {
        const hasRole = auth.hasAnyRole(requiredRoles);
        if (!hasRole) return false;
      }

      if (requiredTier && !auth.hasTier(requiredTier)) {
        return false;
      }

      return true;
    },
    
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    user: auth.user,
  };
}