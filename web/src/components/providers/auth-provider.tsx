'use client';

/**
 * Authentication Provider
 * Provides authentication context and functionality to the application
 * Integrates with the auth store (Zustand) for state management
 */

import React, { ReactNode, createContext, useContext } from 'react';
import { useAuthStore } from '@/lib/stores';
import type { User, TokenPair, Permission } from '@/types/core';

/**
 * Auth Context Interface
 */
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  tokens: TokenPair | null;
  permissions: Permission[];
  error: string | null;
  login: (user: User, tokens: TokenPair, permissions: Permission[]) => void;
  logout: () => void;
  refreshTokens: (tokens: TokenPair) => void;
}

/**
 * Auth Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
export interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Provides authentication context and manages auth state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    tokens,
    permissions,
    error,
    login,
    logout,
    refreshTokens,
  } = useAuthStore();

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    tokens,
    permissions,
    error,
    login,
    logout,
    refreshTokens,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
