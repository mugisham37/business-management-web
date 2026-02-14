/**
 * User Query Hooks
 * 
 * Provides React hooks for fetching user data with proper error handling and loading states.
 * Wraps generated GraphQL query hooks with formatted errors and convenient return values.
 */

import {
  useMeQuery,
  useUserQuery,
  useUsersQuery,
  type UserFilters,
  type User,
} from '@/foundation/types/generated/graphql';
import { formatError, type AppError } from '@/foundation/utils/errors';

/**
 * Hook to fetch the current authenticated user
 * 
 * @returns Current user data, loading state, error, and refetch function
 */
export function useMe() {
  const { data, loading, error, refetch } = useMeQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    user: data?.me ?? null,
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}

/**
 * Hook to fetch a single user by ID
 * 
 * @param id - User ID to fetch
 * @returns User data, loading state, error, and refetch function
 */
export function useUser(id: string) {
  const { data, loading, error, refetch } = useUserQuery({
    variables: { id },
    fetchPolicy: 'cache-and-network',
    skip: !id,
  });

  return {
    user: data?.user ?? null,
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}

/**
 * Hook to fetch a list of users with optional filters
 * 
 * @param filters - Optional filters for role, branch, or department
 * @returns Array of users, loading state, error, and refetch function
 */
export function useUsers(filters?: UserFilters) {
  const { data, loading, error, refetch } = useUsersQuery({
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  });

  return {
    users: data?.users ?? [],
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}
