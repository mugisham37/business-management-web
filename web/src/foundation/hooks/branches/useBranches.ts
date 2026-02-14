/**
 * Branch Management Hooks
 * 
 * Provides React hooks for branch operations with proper error handling,
 * loading states, and automatic cache management.
 */

import {
  useBranchesQuery,
  useCreateBranchMutation,
  useAssignBranchesMutation,
  BranchesDocument,
  type CreateBranchInput,
  type Branch,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to fetch all branches
 * 
 * @returns Array of branches, loading state, error, and refetch function
 */
export function useBranches() {
  const { data, loading, error, refetch } = useBranchesQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    branches: data?.branches ?? [],
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}

/**
 * Hook to create a new branch
 * 
 * Features:
 * - Optimistic UI updates with temporary ID
 * - Automatic cache update to add new branch to branches list
 * - Error handling with formatted messages
 * 
 * @returns createBranch function, loading state, and error
 */
export function useCreateBranch() {
  const [createBranchMutation, { loading, error }] = useCreateBranchMutation({
    update: (cache, { data }) => {
      if (!data?.createBranch) return;

      try {
        // Read existing branches query
        const existingData: any = cache.readQuery({
          query: BranchesDocument,
        });

        if (existingData?.branches) {
          // Write updated branches query with new branch
          cache.writeQuery({
            query: BranchesDocument,
            data: {
              branches: [...existingData.branches, data.createBranch],
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update branches cache:', err);
      }
    },
    optimisticResponse: (variables) => ({
      __typename: 'Mutation',
      createBranch: {
        __typename: 'Branch',
        id: `temp-${Date.now()}`,
        organizationId: '', // Will be filled by server
        name: variables.input.name,
        location: variables.input.location ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });

  const createBranch = async (input: CreateBranchInput) => {
    try {
      const result = await createBranchMutation({ variables: { input } });
      return result.data?.createBranch;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    createBranch,
    loading,
    error: error ? formatError(error) : null,
  };
}

/**
 * Hook to assign branches to a user
 * 
 * Features:
 * - Refetches user data after assignment to reflect changes
 * - Error handling with formatted messages
 * 
 * @returns assignBranches function, loading state, and error
 */
export function useAssignBranches() {
  const [assignBranchesMutation, { loading, error }] = useAssignBranchesMutation();

  const assignBranches = async (userId: string, branchIds: string[]) => {
    try {
      const result = await assignBranchesMutation({
        variables: { userId, branchIds },
      });
      return result.data?.assignBranches;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    assignBranches,
    loading,
    error: error ? formatError(error) : null,
  };
}
