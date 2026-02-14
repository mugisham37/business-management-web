/**
 * User Update Hook
 * 
 * Provides React hook for updating user information with optimistic updates
 * and automatic cache management.
 */

import {
  useUpdateUserMutation,
  UserDocument,
  UsersDocument,
  type UpdateUserInput,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to update a user's information
 * 
 * Features:
 * - Optimistic UI updates for immediate feedback
 * - Automatic cache update for both single user and users list queries
 * - Error handling with formatted messages
 * 
 * @returns updateUser function, loading state, and error
 */
export function useUpdateUser() {
  const [updateUserMutation, { loading, error }] = useUpdateUserMutation({
    update: (cache, { data }) => {
      if (!data?.updateUser) return;

      const updatedUser = data.updateUser;

      try {
        // Update single user query cache
        cache.writeQuery({
          query: UserDocument,
          variables: { id: updatedUser.id },
          data: {
            user: updatedUser,
          },
        });

        // Update users list query cache
        const existingData: any = cache.readQuery({
          query: UsersDocument,
          variables: { filters: {} },
        });

        if (existingData?.users) {
          cache.writeQuery({
            query: UsersDocument,
            variables: { filters: {} },
            data: {
              users: existingData.users.map((user: any) =>
                user.id === updatedUser.id ? updatedUser : user
              ),
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update user cache:', err);
      }
    },
  });

  const updateUser = async (
    id: string,
    input: UpdateUserInput
  ) => {
    try {
      const result = await updateUserMutation({
        variables: { id, input },
      });
      return result.data?.updateUser;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    updateUser,
    loading,
    error: error ? formatError(error) : null,
  };
}
