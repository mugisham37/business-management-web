/**
 * Authentication API Hooks with React Query
 * 
 * Provides cached, optimistic, and type-safe hooks for auth operations.
 * 
 * Features:
 * - Automatic caching for current user
 * - Optimistic updates for auth state
 * - Type-safe API calls
 * - Integration with AuthContext
 * 
 * Requirements: Cached auth hooks with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/lib/api/services/auth.api';
import { queryKeys, cacheInvalidation } from '@/lib/query/query-client';
import { TokenManager } from '@/lib/auth/token-manager';
import type {
  RegisterRequest,
  LoginRequest,
  TeamMemberLoginRequest,
  MfaLoginRequest,
  PasswordResetRequestRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  ResendVerificationRequest,
} from '@/types/api/requests';

/**
 * Fetch current authenticated user with caching
 * 
 * @returns Query result with current user data
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading } = useCurrentUser();
 * ```
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data.data;
    },
    enabled: !!TokenManager.getAccessToken(),
    staleTime: 10 * 60 * 1000, // 10 minutes - user data doesn't change often
  });
}

/**
 * Register mutation
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const register = useRegister();
 * 
 * await register.mutateAsync({
 *   email: 'user@example.com',
 *   password: 'password',
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   organizationName: 'Acme Inc',
 * });
 * ```
 */
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authApi.register(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Store access token
      TokenManager.setAccessToken(data.accessToken);
      
      // Store refresh token
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      // Set current user in cache
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * Login mutation
 * 
 * @returns Mutation object
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await authApi.login(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('useLogin onSuccess called with data:', data)
      
      // Check if MFA is required (backend returns requiresMFA)
      if ('requiresMFA' in data && data.requiresMFA) {
        console.log('MFA required, skipping token storage')
        // Don't set token yet, wait for MFA
        return;
      }

      console.log('Storing tokens...')
      // Store access token
      TokenManager.setAccessToken(data.accessToken);
      console.log('Access token stored')
      
      // Store refresh token
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
        console.log('Refresh token stored in cookie')
      } else {
        console.warn('No refresh token in response!')
      }
      
      // Set current user in cache
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
      console.log('User data cached')
    },
  });
}

/**
 * Team member login mutation
 * 
 * @returns Mutation object
 */
export function useTeamMemberLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TeamMemberLoginRequest) => {
      const response = await authApi.loginTeamMember(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Check if MFA is required (backend returns requiresMFA)
      if ('requiresMFA' in data && data.requiresMFA) {
        return;
      }

      TokenManager.setAccessToken(data.accessToken);
      
      // Store refresh token
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * MFA login mutation
 * 
 * @returns Mutation object
 */
export function useMfaLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MfaLoginRequest) => {
      const response = await authApi.loginMfa(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      TokenManager.setAccessToken(data.accessToken);
      
      // Store refresh token
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * Logout mutation
 * 
 * @returns Mutation object
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.logout();
      return response.data;
    },
    onSuccess: () => {
      // Clear tokens
      TokenManager.clearTokens();
      
      // Clear all cached data
      queryClient.clear();
    },
  });
}

/**
 * Logout all sessions mutation
 * 
 * @returns Mutation object
 */
export function useLogoutAll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await authApi.logoutAll();
      return response.data;
    },
    onSuccess: () => {
      // Invalidate sessions
      cacheInvalidation.invalidateSessions();
    },
  });
}

/**
 * Verify email mutation
 * Auto-logs in the user after successful verification
 * 
 * @returns Mutation object
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VerifyEmailRequest) => {
      const response = await authApi.verifyEmail(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Store access token
      TokenManager.setAccessToken(data.accessToken);
      
      // Store refresh token
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      // Set current user in cache
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * Resend verification email mutation
 * 
 * @returns Mutation object
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: async (data: ResendVerificationRequest) => {
      const response = await authApi.resendVerification(data);
      return response.data;
    },
  });
}

/**
 * Request password reset mutation
 * 
 * @returns Mutation object
 */
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: async (data: PasswordResetRequestRequest) => {
      const response = await authApi.requestPasswordReset(data);
      return response.data;
    },
  });
}

/**
 * Confirm password reset mutation
 * 
 * @returns Mutation object
 */
export function useConfirmPasswordReset() {
  return useMutation({
    mutationFn: async (data: PasswordResetConfirmRequest) => {
      const response = await authApi.confirmPasswordReset(data);
      return response.data;
    },
  });
}

/**
 * Change password mutation
 * 
 * @returns Mutation object
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequest) => {
      const response = await authApi.changePassword(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate sessions as they will be revoked
      cacheInvalidation.invalidateSessions();
    },
  });
}
