/**
 * Authentication Context
 * 
 * Provides global authentication state and methods throughout the application.
 * 
 * Features:
 * - User state management (user, isAuthenticated, isLoading)
 * - Authentication methods (login, logout, register, refreshUser)
 * - Automatic session initialization on mount
 * - Token management integration
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TokenManager } from './token-manager';
import { authApi } from '../api/services/auth.api';
import type { User } from '@/types/user';
import type { LoginRequest, RegisterRequest } from '@/types/api/requests';

/**
 * Authentication context type definition
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

/**
 * Create the authentication context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication state and methods.
 * Initializes authentication state on mount by attempting to restore session.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Initialize authentication state on component mount
   * Attempts to restore session using refresh token
   */
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication by attempting to restore session
   * Uses TokenManager to refresh access token from refresh token cookie
   */
  const initializeAuth = async () => {
    try {
      // Check if we have an access token
      const token = TokenManager.getAccessToken();
      if (token) {
        // Try to load user from the token
        await loadUser();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      // Clear tokens if initialization fails
      TokenManager.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user details from the backend
   * Uses the access token to fetch full user information
   */
  const loadUser = async () => {
    const tokenPayload = TokenManager.getUserFromToken();
    if (!tokenPayload) {
      setUser(null);
      return;
    }

    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      // Clear tokens if user fetch fails (token might be invalid)
      TokenManager.clearTokens();
      setUser(null);
    }
  };

  /**
   * Login with email and password
   * Stores access token and updates user state
   * 
   * @param credentials - Login credentials (email and password)
   * @throws Error if login fails
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    TokenManager.setAccessToken(response.data.data.accessToken);
    setUser(response.data.data.user);
  }, []);

  /**
   * Logout the current user
   * Clears tokens and user state
   * Calls backend logout endpoint to invalidate session
   */
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
    }
  }, []);

  /**
   * Register a new organization owner
   * Stores access token and updates user state
   * 
   * @param data - Registration data (email, password, names, organization)
   * @throws Error if registration fails
   */
  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    TokenManager.setAccessToken(response.data.data.accessToken);
    setUser(response.data.data.user);
  }, []);

  /**
   * Refresh user data from the backend
   * Useful after profile updates or permission changes
   */
  const refreshUser = useCallback(async () => {
    await loadUser();
  }, []);

  /**
   * Provide authentication context to children
   */
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access authentication context
 * 
 * Must be used within an AuthProvider component.
 * Throws an error if used outside of AuthProvider.
 * 
 * @returns Authentication context with user state and methods
 * @throws Error if used outside AuthProvider
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
