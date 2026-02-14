/**
 * User Creation Hooks
 * 
 * Provides React hooks for creating users (managers and workers) with optimistic updates
 * and automatic cache management.
 */

import {
  useCreateManagerMutation,
  useCreateWorkerMutation,
  UsersDocument,
  UserRole,
  type CreateManagerInput,
  type CreateWorkerInput,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to create a manager user
 * 
 * Features:
 * - Optimistic UI updates with temporary ID
 * - Automatic cache update to add new user to users list
 * - Error handling with formatted messages
 * 
 * @returns createManager function, loading state, and error
 */
export function useCreateManager() {
  const [createManagerMutation, { loading, error }] = useCreateManagerMutation({
    update: (cache, { data }) => {
      if (!data?.createManager) return;

      try {
        // Read existing users query
        const existingData: any = cache.readQuery({
          query: UsersDocument,
          variables: { filters: {} },
        });

        if (existingData?.users) {
          // Write updated users query with new manager
          cache.writeQuery({
            query: UsersDocument,
            variables: { filters: {} },
            data: {
              users: [...existingData.users, data.createManager],
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update users cache:', err);
      }
    },
    optimisticResponse: (variables) => ({
      __typename: 'Mutation',
      createManager: {
        __typename: 'User',
        id: `temp-${Date.now()}`,
        organizationId: '', // Will be filled by server
        email: variables.input.email,
        firstName: variables.input.firstName,
        lastName: variables.input.lastName,
        phone: variables.input.phone ?? null,
        role: UserRole.Manager,
        emailVerified: false,
        mfaEnabled: false,
        accountLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null,
        permissions: variables.input.permissions ?? [],
        branches: [],
        departments: [],
      },
    }),
  });

  const createManager = async (input: CreateManagerInput) => {
    try {
      const result = await createManagerMutation({ variables: { input } });
      return result.data?.createManager;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    createManager,
    loading,
    error: error ? formatError(error) : null,
  };
}

/**
 * Hook to create a worker user
 * 
 * Features:
 * - Optimistic UI updates with temporary ID
 * - Automatic cache update to add new user to users list
 * - Error handling with formatted messages
 * 
 * @returns createWorker function, loading state, and error
 */
export function useCreateWorker() {
  const [createWorkerMutation, { loading, error }] = useCreateWorkerMutation({
    update: (cache, { data }) => {
      if (!data?.createWorker) return;

      try {
        // Read existing users query
        const existingData: any = cache.readQuery({
          query: UsersDocument,
          variables: { filters: {} },
        });

        if (existingData?.users) {
          // Write updated users query with new worker
          cache.writeQuery({
            query: UsersDocument,
            variables: { filters: {} },
            data: {
              users: [...existingData.users, data.createWorker],
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update users cache:', err);
      }
    },
    optimisticResponse: (variables) => ({
      __typename: 'Mutation',
      createWorker: {
        __typename: 'User',
        id: `temp-${Date.now()}`,
        organizationId: '', // Will be filled by server
        email: variables.input.email,
        firstName: variables.input.firstName,
        lastName: variables.input.lastName,
        phone: variables.input.phone ?? null,
        role: UserRole.Worker,
        emailVerified: false,
        mfaEnabled: false,
        accountLocked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        permissions: variables.input.permissions ?? [],
      },
    }),
  });

  const createWorker = async (input: CreateWorkerInput) => {
    try {
      const result = await createWorkerMutation({ variables: { input } });
      return result.data?.createWorker;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    createWorker,
    loading,
    error: error ? formatError(error) : null,
  };
}
