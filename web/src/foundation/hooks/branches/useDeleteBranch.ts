/**
 * Branch Delete Hook
 * 
 * Provides React hook for deleting branches with optimistic updates
 * and automatic cache management.
 */

import {
  useDeleteBranchMutation,
  BranchesDocument,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to delete a branch
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache update (removes branch from list)
 * - Error handling with formatted messages
 * 
 * @returns deleteBranch function, loading state, and error
 * 
 * @example
 * ```tsx
 * function BranchListItem({ branch }: { branch: Branch }) {
 *   const { deleteBranch, loading, error } = useDeleteBranch();
 *   
 *   const handleDelete = async () => {
 *     if (confirm('Are you sure you want to delete this branch?')) {
 *       try {
 *         await deleteBranch(branch.id);
 *         toast.success('Branch deleted successfully');
 *       } catch (err) {
 *         toast.error(error?.message || 'Failed to delete branch');
 *       }
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <span>{branch.name}</span>
 *       <button onClick={handleDelete} disabled={loading}>
 *         {loading ? 'Deleting...' : 'Delete'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeleteBranch() {
  const [deleteBranchMutation, { loading, error }] = useDeleteBranchMutation({
    update: (cache, { data }, { variables }) => {
      if (!data?.deleteBranch || !variables) return;

      try {
        // Read existing branches query
        const existingData: any = cache.readQuery({
          query: BranchesDocument,
        });

        if (existingData?.branches) {
          // Remove the deleted branch from the cache
          cache.writeQuery({
            query: BranchesDocument,
            data: {
              branches: existingData.branches.filter(
                (branch: any) => branch.id !== variables.id
              ),
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update branches cache:', err);
      }

      // Also evict the branch from cache
      cache.evict({ id: cache.identify({ __typename: 'Branch', id: variables.id }) });
      cache.gc();
    },
  });

  const deleteBranch = async (id: string) => {
    try {
      const result = await deleteBranchMutation({ variables: { id } });
      return result.data?.deleteBranch;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    deleteBranch,
    loading,
    error: error ? formatError(error) : null,
  };
}
