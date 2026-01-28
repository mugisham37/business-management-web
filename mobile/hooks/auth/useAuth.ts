/**
 * useAuth Hook
 *
 * Manages authentication state, login, logout, and token refresh.
 */
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSegments } from "expo-router";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client";
import {
    secureStorage,
    appStorage,
    STORAGE_KEYS,
} from "@/lib/storage";
import { apolloClient } from "@/lib/apollo";

// GraphQL operations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      user {
        id
        email
        firstName
        lastName
        role
        tenantId
      }
    }
  }
`;

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      firstName
      lastName
      role
      tenantId
      avatarUrl
      permissions
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

// Types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId: string;
    avatarUrl?: string;
    permissions?: string[];
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    error: string | null;
}

export interface LoginCredentials {
    email: string;
    password: string;
    tenantId?: string;
}

/**
 * Authentication hook
 */
export function useAuth() {
    const router = useRouter();
    const segments = useSegments();

    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        isLoading: true,
        user: null,
        error: null,
    });

    // GraphQL mutations
    const [loginMutation] = useMutation(LOGIN_MUTATION);
    const [logoutMutation] = useMutation(LOGOUT_MUTATION);
    const [refreshTokenMutation] = useMutation(REFRESH_TOKEN_MUTATION);

    // Check current user
    const { refetch: refetchMe } = useQuery(ME_QUERY, {
        skip: true, // Don't run automatically
    });

    /**
     * Initialize auth state from storage
     */
    const initializeAuth = useCallback(async () => {
        try {
            const tokens = await secureStorage.getTokens();

            if (tokens?.accessToken) {
                // Try to fetch current user
                const { data } = await refetchMe();

                if (data?.me) {
                    setAuthState({
                        isAuthenticated: true,
                        isLoading: false,
                        user: data.me,
                        error: null,
                    });
                    return;
                }
            }

            // No valid session
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
            });
        } catch (error) {
            console.error("Auth initialization error:", error);
            await secureStorage.clearTokens();
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
            });
        }
    }, [refetchMe]);

    /**
     * Login with credentials
     */
    const login = useCallback(
        async (credentials: LoginCredentials) => {
            setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

            try {
                const { data } = await loginMutation({
                    variables: {
                        input: {
                            email: credentials.email,
                            password: credentials.password,
                        },
                    },
                });

                if (data?.login) {
                    const { accessToken, refreshToken, user } = data.login;

                    // Store tokens
                    await secureStorage.setTokens(accessToken, refreshToken);

                    // Store tenant ID for multi-tenant requests
                    if (user.tenantId) {
                        appStorage.setString(STORAGE_KEYS.TENANT_ID, user.tenantId);
                    }

                    // Update state
                    setAuthState({
                        isAuthenticated: true,
                        isLoading: false,
                        user,
                        error: null,
                    });

                    // Navigate to main app
                    router.replace("/(tabs)");

                    return { success: true };
                }

                throw new Error("Login failed");
            } catch (error: any) {
                const message =
                    error.graphQLErrors?.[0]?.message ||
                    error.message ||
                    "Login failed. Please try again.";

                setAuthState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: message,
                }));

                return { success: false, error: message };
            }
        },
        [loginMutation, router]
    );

    /**
     * Logout
     */
    const logout = useCallback(async () => {
        try {
            // Call logout mutation (invalidate tokens on server)
            await logoutMutation();
        } catch (error) {
            console.error("Logout mutation error:", error);
        } finally {
            // Clear local data regardless of server response
            await secureStorage.clearTokens();
            appStorage.delete(STORAGE_KEYS.USER_ID);
            appStorage.delete(STORAGE_KEYS.TENANT_ID);

            // Reset Apollo cache
            await apolloClient.clearStore();

            // Update state
            setAuthState({
                isAuthenticated: false,
                isLoading: false,
                user: null,
                error: null,
            });

            // Navigate to auth
            router.replace("/(auth)");
        }
    }, [logoutMutation, router]);

    /**
     * Refresh access token
     */
    const refreshToken = useCallback(async () => {
        try {
            const tokens = await secureStorage.getTokens();

            if (!tokens?.refreshToken) {
                throw new Error("No refresh token available");
            }

            const { data } = await refreshTokenMutation({
                variables: { refreshToken: tokens.refreshToken },
            });

            if (data?.refreshToken) {
                await secureStorage.setTokens(
                    data.refreshToken.accessToken,
                    data.refreshToken.refreshToken
                );
                return true;
            }

            return false;
        } catch (error) {
            console.error("Token refresh error:", error);
            await logout();
            return false;
        }
    }, [refreshTokenMutation, logout]);

    /**
     * Clear error
     */
    const clearError = useCallback(() => {
        setAuthState((prev) => ({ ...prev, error: null }));
    }, []);

    // Initialize auth on mount
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // Handle navigation based on auth state
    useEffect(() => {
        if (authState.isLoading) return;

        const inAuthGroup = segments[0] === "(auth)";

        if (!authState.isAuthenticated && !inAuthGroup) {
            // Redirect to login if not authenticated
            router.replace("/(auth)");
        } else if (authState.isAuthenticated && inAuthGroup) {
            // Redirect to main app if already authenticated
            router.replace("/(tabs)");
        }
    }, [authState.isAuthenticated, authState.isLoading, segments, router]);

    return {
        ...authState,
        login,
        logout,
        refreshToken,
        clearError,
        refetch: initializeAuth,
    };
}

/**
 * Check if user has a specific permission
 */
export function useHasPermission(permission: string): boolean {
    const { user } = useAuth();
    return user?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified roles
 */
export function useHasRole(roles: string[]): boolean {
    const { user } = useAuth();
    return user ? roles.includes(user.role) : false;
}
