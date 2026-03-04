/**
 * usePermissions Hook
 * 
 * React hook for permission management operations.
 * Provides access to permission grant/revoke operations with loading/error states.
 * 
 * Features:
 * - Grant and revoke permissions
 * - Fetch user permissions
 * - Fetch permission history
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.2, 3.10, 3.11
 */

import { useState, useCallback } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation } from '@apollo/client/react';

import type { ApolloCache } from '@apollo/client/cache';
import { GET_USER_PERMISSIONS, GET_PERMISSION_HISTORY } from '@/graphql/queries/permissions';
import { GRANT_PERMISSIONS, REVOKE_PERMISSIONS } from '@/graphql/mutations/permissions';
import type {
  GetUserPermissionsData,
  GetPermissionHistoryData,
  GrantPermissionsData,
  RevokePermissionsData,
} from '@/graphql/types/operations';
import { updateUserPermissionsCache } from '@/lib/cache/cache-updaters';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Input types for permission operations
 */
export interface GrantPermissionsInput {
  userId: string;
  permissions: PermissionInput[];
}

export interface RevokePermissionsInput {
  userId: string;
  permissionIds: string[];
}

export interface PermissionInput {
  resource: string;
  action: string;
  scope: 'ORGANIZATION' | 'BRANCH' | 'DEPARTMENT' | 'SELF';
  conditions?: Record<string, any>;
}

/**
 * Permission types
 */
export interface Permission {
  id: string;
  userId: string;
  resource: string;
  action: string;
  scope: string;
  conditions?: Record<string, any>;
  grantedAt: string;
  grantedBy: string;
}

export interface PermissionSnapshot {
  id: string;
  userId: string;
  permissions: Permission[];
  reason: string;
  createdAt: string;
  createdBy: string;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UsePermissionsReturn {
  // Query data
  permissions: Permission[] | undefined;
  permissionHistory: PermissionSnapshot[] | undefined;
  
  // Loading states
  loading: boolean;
  permissionsLoading: boolean;
  historyLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  grantPermissions: (input: GrantPermissionsInput) => Promise<boolean>;
  revokePermissions: (input: RevokePermissionsInput) => Promise<boolean>;
  refetchPermissions: () => Promise<void>;
  refetchHistory: () => Promise<void>;
}

/**
 * usePermissions Hook
 * 
 * @param userId - User ID to fetch permissions for
 * @returns Permission management operations and data
 * 
 * Requirements: 3.2, 3.10, 3.11
 */
export function usePermissions(userId?: string): UsePermissionsReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Query for user permissions
  const {
    data: permissionsData,
    loading: permissionsLoading,
    error: permissionsError,
    refetch: refetchPermissionsList,
  } = useApolloQuery<GetUserPermissionsData>(GET_USER_PERMISSIONS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-first',
  });

  // Query for permission history
  const {
    data: historyData,
    loading: historyLoading,
    error: historyError,
    refetch: refetchHistoryList,
  } = useApolloQuery<GetPermissionHistoryData>(GET_PERMISSION_HISTORY, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (permissionsError && !error) {
    setError(errorHandler.handle(permissionsError));
  }
  if (historyError && !error) {
    setError(errorHandler.handle(historyError));
  }

  // Mutation for granting permissions
  const [grantPermissionsMutation] = useApolloMutation<GrantPermissionsData>(GRANT_PERMISSIONS, {
    update: (cache: ApolloCache, { data }: any, { variables }: any) => {
      if ((data as any)?.grantPermissions && variables?.input?.userId) {
        // Refetch permissions to get updated list
        refetchPermissionsList();
      }
    },
  });

  // Mutation for revoking permissions
  const [revokePermissionsMutation] = useApolloMutation<RevokePermissionsData>(REVOKE_PERMISSIONS, {
    update: (cache: ApolloCache, { data }: any, { variables }: any) => {
      if (data?.revokePermissions && variables?.input?.userId) {
        // Refetch permissions to get updated list
        refetchPermissionsList();
      }
    },
  });

  /**
   * Grant permissions to a user
   * Requirements: 3.2, 3.11
   */
  const grantPermissions = useCallback(
    async (input: GrantPermissionsInput): Promise<boolean> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await grantPermissionsMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            grantPermissions: true,
          },
        });

        if (data?.grantPermissions === undefined) {
          throw new Error('No data returned from grantPermissions mutation');
        }

        return data.grantPermissions;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [grantPermissionsMutation]
  );

  /**
   * Revoke permissions from a user
   * Requirements: 3.2, 3.11
   */
  const revokePermissions = useCallback(
    async (input: RevokePermissionsInput): Promise<boolean> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await revokePermissionsMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            revokePermissions: true,
          },
        });

        if (data?.revokePermissions === undefined) {
          throw new Error('No data returned from revokePermissions mutation');
        }

        return data.revokePermissions;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [revokePermissionsMutation]
  );

  /**
   * Refetch user permissions
   * Requirements: 3.2
   */
  const refetchPermissions = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    setError(null);
    try {
      await refetchPermissionsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [userId, refetchPermissionsList]);

  /**
   * Refetch permission history
   * Requirements: 3.2
   */
  const refetchHistory = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    setError(null);
    try {
      await refetchHistoryList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [userId, refetchHistoryList]);

  // Combine loading states
  const loading = operationLoading || permissionsLoading || historyLoading;

  // Handle query errors
  if (permissionsError && !error) {
    setError(errorHandler.handle(permissionsError));
  }
  if (historyError && !error) {
    setError(errorHandler.handle(historyError));
  }

  return {
    // Data
    permissions: permissionsData?.getUserPermissions?.permissions,
    permissionHistory: historyData?.getPermissionHistory?.snapshots,
    
    // Loading states
    loading,
    permissionsLoading,
    historyLoading,
    
    // Error state
    error,
    
    // Operations
    grantPermissions,
    revokePermissions,
    refetchPermissions,
    refetchHistory,
  };
}
