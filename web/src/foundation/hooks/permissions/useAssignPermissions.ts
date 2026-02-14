/**
 * Permission Mutation Hooks
 * 
 * React hooks for assigning and revoking user permissions.
 * These hooks wrap the generated GraphQL mutations and provide
 * cache updates, error handling, and support for bulk operations.
 */

'use client';

import {
  useAssignPermissionsMutation,
  useRevokePermissionsMutation,
  UserDocument,
} from '../../types/generated/graphql';
import { formatError } from '../../utils/errors';

/**
 * Hook to assign permissions to a user
 * 
 * Assigns one or more permissions to a user and refreshes the user's
 * permission cache to reflect the changes immediately.
 * 
 * @returns Object with assignPermissions function, loading state, and error
 */
export function useAssignPermissions() {
  const [assignPermissionsMutation, { loading, error }] = useAssignPermissionsMutation({
    refetchQueries: [{ query: UserDocument }],
    awaitRefetchQueries: true,
  });

  const assignPermissions = async (userId: string, permissions: string[]) => {
    try {
      const result = await assignPermissionsMutation({
        variables: { userId, permissions },
      });

      if (!result.data?.assignPermissions) {
        throw new Error('Failed to assign permissions');
      }

      return result.data.assignPermissions;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    assignPermissions,
    loading,
    error: error ? formatError(error) : null,
  };
}

/**
 * Hook to revoke permissions from a user
 * 
 * Revokes one or more permissions from a user and refreshes the user's
 * permission cache to reflect the changes immediately.
 * 
 * @returns Object with revokePermissions function, loading state, and error
 */
export function useRevokePermissions() {
  const [revokePermissionsMutation, { loading, error }] = useRevokePermissionsMutation({
    refetchQueries: [{ query: UserDocument }],
    awaitRefetchQueries: true,
  });

  const revokePermissions = async (userId: string, permissions: string[]) => {
    try {
      const result = await revokePermissionsMutation({
        variables: { userId, permissions },
      });

      if (!result.data?.revokePermissions) {
        throw new Error('Failed to revoke permissions');
      }

      return result.data.revokePermissions;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    revokePermissions,
    loading,
    error: error ? formatError(error) : null,
  };
}

/**
 * Hook to manage permissions (assign and revoke)
 * 
 * Provides both assign and revoke functionality in a single hook.
 * Useful for permission management interfaces that need both operations.
 * 
 * @returns Object with assignPermissions, revokePermissions functions, loading states, and errors
 */
export function useManagePermissions() {
  const {
    assignPermissions,
    loading: assignLoading,
    error: assignError,
  } = useAssignPermissions();

  const {
    revokePermissions,
    loading: revokeLoading,
    error: revokeError,
  } = useRevokePermissions();

  return {
    assignPermissions,
    revokePermissions,
    assignLoading,
    revokeLoading,
    assignError,
    revokeError,
    loading: assignLoading || revokeLoading,
    error: assignError || revokeError,
  };
}
