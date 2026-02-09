/**
 * Authentication API Hooks with React Query
 * 
 * Provides cached, optimistic, and type-safe hooks for auth operations.
 * Synchronized with AuthContext for consistent state management.
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
import { useAuthContext } from '@/lib/auth/auth-context';
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
 * Synchronized with AuthContext
 * 
 * @returns Mutation object
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await authApi.register(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('[useRegister] Registration successful, updating state...');
      
      // Store tokens
      TokenManager.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      // Update AuthContext
      updateUser(data.user);
      
      // Set current user in cache
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * Login mutation
 * Synchronized with AuthContext - uses AuthContext.login method
 * 
 * @returns Mutation object
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const { login: authLogin, updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log('[useLogin] Calling AuthContext login...');
      return await authLogin(data);
    },
    onSuccess: (data) => {
      console.log('[useLogin] Login successful');
      
      // If MFA is required, don't update user state yet
      if (data.requiresMFA) {
        console.log('[useLogin] MFA required, waiting for MFA completion');
        return;
      }

      // Cache user data in React Query
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
      console.log('[useLogin] User data cached');
    },
    onError: (error) => {
      console.error('[useLogin] Login failed:', error);
    },
  });
}

/**
 * Team member login mutation
 * Synchronized with AuthContext
 * 
 * @returns Mutation object
 */
export function useTeamMemberLogin() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (data: TeamMemberLoginRequest) => {
      const response = await authApi.loginTeamMember(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      // Check if MFA is required
      if ('requiresMFA' in data && data.requiresMFA) {
        return;
      }

      TokenManager.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      updateUser(data.user);
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * MFA login mutation
 * Synchronized with AuthContext
 * 
 * @returns Mutation object
 */
export function useMfaLogin() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (data: MfaLoginRequest) => {
      const response = await authApi.loginMfa(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('[useMfaLogin] MFA login successful, updating state...');
      
      TokenManager.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      updateUser(data.user);
      queryClient.setQueryData(queryKeys.auth.currentUser(), data.user);
    },
  });
}

/**
 * Logout mutation
 * Synchronized with AuthContext - uses AuthContext.logout method
 * 
 * @returns Mutation object
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout: authLogout } = useAuthContext();

  return useMutation({
    mutationFn: async () => {
      console.log('[useLogout] Calling AuthContext logout...');
      await authLogout();
    },
    onSuccess: () => {
      console.log('[useLogout] Logout successful, clearing cache...');
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
 * Synchronized with AuthContext
 * 
 * @returns Mutation object
 */
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthContext();

  return useMutation({
    mutationFn: async (data: VerifyEmailRequest) => {
      const response = await authApi.verifyEmail(data);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('[useVerifyEmail] Email verified, updating state...');
      
      // Store tokens
      TokenManager.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        TokenManager.setRefreshToken(data.refreshToken);
      }
      
      // Update AuthContext
      updateUser(data.user);
      
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
