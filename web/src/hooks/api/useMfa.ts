/**
 * MFA API Hooks with React Query
 * 
 * Provides cached, optimistic, and type-safe hooks for MFA operations.
 * 
 * Features:
 * - Automatic caching for MFA status
 * - Type-safe API calls
 * - Cache invalidation strategies
 * 
 * Requirements: Cached API hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mfaApi } from '@/lib/api/services/mfa.api';
import { queryKeys, cacheInvalidation } from '@/lib/query/query-client';
import type {
  MfaEnableRequest,
  MfaDisableRequest,
} from '@/types/api/requests';

/**
 * Fetch MFA status with caching
 * 
 * @returns Query result with MFA status
 * 
 * @example
 * ```tsx
 * const { data: mfaStatus, isLoading } = useMfaStatus();
 * ```
 */
export function useMfaStatus() {
  return useQuery({
    queryKey: queryKeys.mfa.status(),
    queryFn: async () => {
      const response = await mfaApi.getStatus();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Setup MFA mutation
 * 
 * @returns Mutation object with QR code and backup codes
 * 
 * @example
 * ```tsx
 * const setupMfa = useSetupMfa();
 * 
 * const { secret, qrCode, backupCodes } = await setupMfa.mutateAsync();
 * ```
 */
export function useSetupMfa() {
  return useMutation({
    mutationFn: async () => {
      const response = await mfaApi.setup();
      return response.data.data;
    },
  });
}

/**
 * Enable MFA mutation
 * 
 * @returns Mutation object
 */
export function useEnableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MfaEnableRequest) => {
      const response = await mfaApi.enable(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate MFA status and current user
      cacheInvalidation.invalidateMfaStatus();
      cacheInvalidation.invalidateCurrentUser();
    },
  });
}

/**
 * Disable MFA mutation
 * 
 * @returns Mutation object
 */
export function useDisableMfa() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MfaDisableRequest) => {
      const response = await mfaApi.disable(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate MFA status and current user
      cacheInvalidation.invalidateMfaStatus();
      cacheInvalidation.invalidateCurrentUser();
    },
  });
}

/**
 * Regenerate backup codes mutation
 * 
 * @returns Mutation object with new backup codes
 */
export function useRegenerateBackupCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await mfaApi.regenerateBackupCodes();
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate MFA status to update backup codes count
      cacheInvalidation.invalidateMfaStatus();
    },
  });
}
