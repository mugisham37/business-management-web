/**
 * Authentication Context
 * 
 * Provides global authentication state and methods throughout the application.
 * 
 * Features:
 * - User state management (user, isAuthenticated, isLoading)
 * - Authentication methods (login, logout, register, refreshUser)
 * - Automatic session initialization on mount with retry logic
 * - Token management integration
 * - Synchronized with React Query cache
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  isInitialized: boolean;
  login: (credentials: LoginRequest) => Promise<{ user: User; requiresMFA?: boolean; tempToken?: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const initializationAttempted = useRef(false);

  /**
   * Initialize authentication state on component mount
   * Attempts to restore session using refresh token
   */
  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initializationAttempted.current) {
      return;
    }
    initializationAttempted.current = true;
    
    initializeAuth();
  }, []);

  /**
   * Initialize authentication by attempting to restore session
   * Uses TokenManager to refresh access token from refresh token cookie
   */
  const initializeAuth = async () => {
    try {
      console.log('[AuthContext] Initializing authentication...');
      
      // Try to initialize session (will use refresh token if available)
      const sessionRestored = await TokenManager.initializeSession();
      
      if (sessionRestored) {
        console.log('[AuthContext] Session restored, loading user data...');
        await loadUser();
      } else {
        console.log('[AuthContext] No session to restore');
      }
    } catch (error) {
      console.error('[AuthContext] Failed to initialize auth:', error);
      // Clear tokens if initialization fails
      TokenManager.clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
      console.log('[AuthContext] Initialization complete');
    }
  };

  /**
   * Load user details from the backend
   * Uses the access token to fetch full user information
   */
  const loadUser = async () => {
    try {
      // First check if we have a valid token
      const token = TokenManager.getAccessToken();
      if (!token) {
        console.log('[AuthContext] No access token available');
        setUser(null);
        return;
      }

      console.log('[AuthContext] Fetching user data from API...');
      const response = await authApi.getCurrentUser();
      const userData = response.data.data;
      
      console.log('[AuthContext] User data loaded:', {
        id: userData.id,
        email: userData.email,
        name: `${userData.firstName} ${userData.lastName}`,
      });
      
      setUser(userData);
    } catch (error) {
      console.error('[AuthContext] Failed to load user:', error);
      // Clear tokens if user fetch fails (token might be invalid)
      TokenManager.clearTokens();
      setUser(null);
      throw error;
    }
  };

  /**
   * Login with email and password
   * Stores access token and updates user state
   * 
   * @param credentials - Login credentials (email and password)
   * @returns Object with user data and MFA status
   * @throws Error if login fails
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      console.log('[AuthContext] Logging in...');
      const response = await authApi.login(credentials);
      const data = response.data.data;

      // Check if MFA is required
      if ('requiresMFA' in data && data.requiresMFA) {
        console.log('[AuthContext] MFA required');
        return {
          user: null as any,
          requiresMFA: true,
          tempToken: data.tempToken,
        };
      }

      // Store tokens
      console.log('[AuthContext] Storing tokens...');
      TokenManager.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }

      // Update user state
      console.log('[AuthContext] Updating user state...');
      setUser(data.user);
      
      console.log('[AuthContext] Login successful');
      return { user: data.user };
    } catch (error) {
      console.error('[AuthContext] Login failed:', error);
      throw error;
    }
  }, []);

  /**
   * Logout the current user
   * Clears tokens and user state
   * Calls backend logout endpoint to invalidate session
   */
  const logout = useCallback(async () => {
    try {
      console.log('[AuthContext] Logging out...');
      await authApi.logout();
    } catch (error) {
      console.error('[AuthContext] Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
      console.log('[AuthContext] Logout complete');
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
    try {
      console.log('[AuthContext] Registering...');
      const response = await authApi.register(data);
      const responseData = response.data.data;
      
      TokenManager.setAccessToken(responseData.accessToken);
      if (responseData.refreshToken) {
        TokenManager.setRefreshToken(responseData.refreshToken);
      }
      
      setUser(responseData.user);
      console.log('[AuthContext] Registration successful');
    } catch (error) {
      console.error('[AuthContext] Registration failed:', error);
      throw error;
    }
  }, []);

  /**
   * Refresh user data from the backend
   * Useful after profile updates or permission changes
   */
  const refreshUser = useCallback(async () => {
    console.log('[AuthContext] Refreshing user data...');
    await loadUser();
  }, []);

  /**
   * Update user state directly (for optimistic updates)
   * @param updatedUser - Updated user object
   */
  const updateUser = useCallback((updatedUser: User) => {
    console.log('[AuthContext] Updating user state directly');
    setUser(updatedUser);
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
        isInitialized,
        login,
        logout,
        register,
        refreshUser,
        updateUser,
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
