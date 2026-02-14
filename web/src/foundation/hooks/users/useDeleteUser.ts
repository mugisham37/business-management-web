/**
 * User Deletion Hook
 * 
 * Provides React hook for deleting users with optimistic updates
 * and automatic cache management.
 */

import {
  useDeleteUserMutation,
  UsersDocument,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to delete a user
 * 
 * Features:
 * - Optimistic UI updates for immediate feedback
 * - Automatic cache eviction and cleanup
 * - Removes user from users list query
 * - Error handling with formatted messages
 * 
 * @returns deleteUser function, loading state, and error
 */
export function useDeleteUser() {
  const [deleteUserMutation, { loading, error }] = useDeleteUserMutation({
    update: (cache, { data }, { variables }) => {
      if (!data?.deleteUser || !variables?.id) return;

      const userId = variables.id;

      try {
        // Evict the user from cache
        cache.evict({
          id: cache.identify({ __typename: 'User', id: userId }),
        });

        // Remove user from users list query
        const existingData: any = cache.readQuery({
          query: UsersDocument,
          variables: { filters: {} },
        });

        if (existingData?.users) {
          cache.writeQuery({
            query: UsersDocument,
            variables: { filters: {} },
            data: {
              users: existingData.users.filter((user: any) => user.id !== userId),
            },
          });
        }

        // Garbage collect orphaned references
        cache.gc();
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update cache after user deletion:', err);
      }
    },
  });

  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      const result = await deleteUserMutation({
        variables: { id },
        optimisticResponse: {
          __typename: 'Mutation',
          deleteUser: true,
        },
      });
      return result.data?.deleteUser ?? false;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    deleteUser,
    loading,
    error: error ? formatError(error) : null,
  };
}
