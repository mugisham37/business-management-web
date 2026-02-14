/**
 * Department Update Hook
 * 
 * Provides React hook for updating departments with optimistic updates
 * and automatic cache management.
 */

import {
  useUpdateDepartmentMutation,
  DepartmentsDocument,
  type UpdateDepartmentInput,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to update a department
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic cache update
 * - Error handling with formatted messages
 * 
 * @returns updateDepartment function, loading state, and error
 * 
 * @example
 * ```tsx
 * function EditDepartmentForm({ department }: { department: Department }) {
 *   const { updateDepartment, loading, error } = useUpdateDepartment();
 *   
 *   const handleSubmit = async (data: UpdateDepartmentInput) => {
 *     try {
 *       await updateDepartment(department.id, data);
 *       toast.success('Department updated successfully');
 *     } catch (err) {
 *       toast.error(error?.message || 'Failed to update department');
 *     }
 *   };
 *   
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useUpdateDepartment() {
  const [updateDepartmentMutation, { loading, error }] = useUpdateDepartmentMutation({
    update: (cache, { data }) => {
      if (!data?.updateDepartment) return;

      try {
        // Read existing departments query
        const existingData: any = cache.readQuery({
          query: DepartmentsDocument,
        });

        if (existingData?.departments) {
          // Update the department in the cache
          cache.writeQuery({
            query: DepartmentsDocument,
            data: {
              departments: existingData.departments.map((department: any) =>
                department.id === data.updateDepartment.id
                  ? data.updateDepartment
                  : department
              ),
            },
          });
        }
      } catch (err) {
        // Cache read might fail if query hasn't been executed yet
        console.warn('Failed to update departments cache:', err);
      }
    },
    optimisticResponse: (variables) => ({
      __typename: 'Mutation',
      updateDepartment: {
        __typename: 'Department',
        id: variables.id,
        organizationId: '', // Will be filled by server
        name: variables.input.name ?? '',
        description: variables.input.description ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });

  const updateDepartment = async (id: string, input: UpdateDepartmentInput) => {
    try {
      const result = await updateDepartmentMutation({ variables: { id, input } });
      return result.data?.updateDepartment;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    updateDepartment,
    loading,
    error: error ? formatError(error) : null,
  };
}
