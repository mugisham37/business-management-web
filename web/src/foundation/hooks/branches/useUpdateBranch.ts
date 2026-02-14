/**
 * Branch Update Hook
 * 
 * Provides React hook for updating branches with optimistic updates
 * and automatic cache management.
 */

import {
  useUpdateBranchMutation,
  BranchesDocument,
  type UpdateBranchInput,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to update a branch
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache update
 * - Error handling with formatted messages
 * 
 * @returns updateBranch function, loading state, and error
 * 
 * @example
 * ```tsx
 * function EditBranchForm({ branch }: { branch: Branch }) {
 *   const { updateBranch, loading, error } = useUpdateBranch();
 *   
 *   const handleSubmit = async (data: UpdateBranchInput) => {
 *     try {
 *       await updateBranch(branch.id, data);
 *       toast.success('Branch updated successfully');
 *     } catch (err) {
 *       toast.error(error?.message || 'Failed to update branch');
 *     }
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateBranch() {
  const [updateBranchMutation, { loading, error }] = useUpdateBranchMutation({
    update: (cache, { data }) => {
      if (!data?.updateBranch) return;

      try {
        // Read existing branches query
        const existingData: any = cache.readQuery({
          query: BranchesDocument,
        });

        if (existingData?.branches) {
          // Update the branch in the cache
          cache.writeQuery({
            query: BranchesDocument,
            data: {
              branches: existingData.branches.map((branch: any) =>
                branch.id === data.updateBranch.id ? data.updateBranch : branch
              ),
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
      updateBranch: {
        __typename: 'Branch',
        id: variables.id,
        organizationId: '', // Will be filled by server
        name: variables.input.name ?? '',
        location: variables.input.location ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });

  const updateBranch = async (id: string, input: UpdateBranchInput) => {
    try {
      const result = await updateBranchMutation({ variables: { id, input } });
      return result.data?.updateBranch;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    updateBranch,
    loading,
    error: error ? formatError(error) : null,
  };
}
