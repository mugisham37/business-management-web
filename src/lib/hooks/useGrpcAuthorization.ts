/**
 * useGrpcAuthorization Hook
 * 
 * React hook for gRPC Authorization Service operations
 * Provides permission checking and token validation with loading/error states
 */

import { useState, useCallback } from 'react';
import {
  authorizationClient,
  type CheckPermissionResponse,
  type ValidateTokenResponse,
  type GetUserPermissionsResponse,
} from '@/grpc/clients/authorization-client';
import { errorHandler } from '@/lib/errors/error-handler';
import type { AppError } from '@/lib/errors/error-types';

export interface UseGrpcAuthorizationResult {
  // State
  permissionCheck: CheckPermissionResponse | null;
  tokenValidation: ValidateTokenResponse | null;
  userPermissions: GetUserPermissionsResponse | null;
  loading: boolean;
  error: AppError | null;

  // Operations
  checkPermission: (
    userId: string,
    module: string,
    action: string,
    options?: {
      resourceId?: string;
      resourceScope?: { branchId?: string; departmentId?: string };
      transactionContext?: { transactionType: string; amount: number };
    }
  ) => Promise<CheckPermissionResponse | null>;
  validateToken: (accessToken: string) => Promise<ValidateTokenResponse | null>;
  getUserPermissions: (userId: string) => Promise<GetUserPermissionsResponse | null>;
}

/**
 * Hook for gRPC Authorization Service operations
 * 
 * @example
 * ```typescript
 * const { 
 *   permissionCheck, 
 *   loading, 
 *   error, 
 *   checkPermission, 
 *   validateToken,
 *   getUserPermissions 
 * } = useGrpcAuthorization();
 * 
 * // Check permission
 * const result = await checkPermission('user-id', 'users', 'create');
 * if (result?.authorized) {
 *   // User has permission
 * }
 * 
 * // Validate token
 * const validation = await validateToken('access-token');
 * 
 * // Get user permissions
 * const permissions = await getUserPermissions('user-id');
 * ```
 */
export function useGrpcAuthorization(): UseGrpcAuthorizationResult {
  const [permissionCheck, setPermissionCheck] = useState<CheckPermissionResponse | null>(null);
  const [tokenValidation, setTokenValidation] = useState<ValidateTokenResponse | null>(null);
  const [userPermissions, setUserPermissions] = useState<GetUserPermissionsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  /**
   * Check if user has permission for a specific action
   */
  const checkPermission = useCallback(
    async (
      userId: string,
      module: string,
      action: string,
      options?: {
        resourceId?: string;
        resourceScope?: { branchId?: string; departmentId?: string };
        transactionContext?: { transactionType: string; amount: number };
      }
    ): Promise<CheckPermissionResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authorizationClient.checkPermission(
          userId,
          module,
          action,
          options
        );
        setPermissionCheck(response);
        return response;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Validate access token
   */
  const validateToken = useCallback(
    async (accessToken: string): Promise<ValidateTokenResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authorizationClient.validateToken(accessToken);
        setTokenValidation(response);
        return response;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Get all permissions for a user
   */
  const getUserPermissions = useCallback(
    async (userId: string): Promise<GetUserPermissionsResponse | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await authorizationClient.getUserPermissions(userId);
        setUserPermissions(response);
        return response;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    permissionCheck,
    tokenValidation,
    userPermissions,
    loading,
    error,
    checkPermission,
    validateToken,
    getUserPermissions,
  };
}

