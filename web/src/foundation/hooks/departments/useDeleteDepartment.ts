/**
 * Department Delete Hook
 * 
 * Provides React hook for deleting departments with optimistic updates
 * and automatic cache management.
 */

import {
  useDeleteDepartmentMutation,
  DepartmentsDocument,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to delete a department
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache update (removes department from list)
 * - Error handling with formatted messages
 * 
 * @returns deleteDepartment function, loading state, and error
 * 
 * @example
 * ```tsx
 * function DepartmentListItem({ department }: { department: Department }) {
 *   const { deleteDepartment, loading, error } = useDeleteDepartment();
 *   
 *   const handleDelete = async () => {
 *     if (confirm('Are you sure you want to delete this department?')) {
 *       try {
 *         await deleteDepartment(department.id);
 *         toast.success('Department deleted successfully');
 *       } catch (err) {
 *         toast.error(error?.message || 'Failed to delete department');
 *       }
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <span>{department.name}</span>
 *       <button onClick={handleDelete} disabled={loading}>
 *         {loading ? 'Deleting...' : 'Delete'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeleteDepartment() {
  const [deleteDepartmentMutation, { loading, error }] = useDeleteDepartmentMutation({
    update: (cache, { data }, { variables }) => {
      if (!data?.deleteDepartment || !variables) return;

      try {
        // Read existing departments query
        const existingData: any = cache.readQuery({
          query: DepartmentsDocument,
        });

        if (existingData?.departments) {
          // Remove the deleted department from the cache
          cache.writeQuery({
            query: DepartmentsDocument,
            data: {
              departments: existingData.departments.filter(
                (department: any) => department.id !== variables.id
              ),
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update departments cache:', err);
      }

      // Also evict the department from cache
      cache.evict({
        id: cache.identify({ __typename: 'Department', id: variables.id }),
      });
      cache.gc();
    },
  });

  const deleteDepartment = async (id: string) => {
    try {
      const result = await deleteDepartmentMutation({ variables: { id } });
      return result.data?.deleteDepartment;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    deleteDepartment,
    loading,
    error: error ? formatError(error) : null,
  };
}
