/**
 * Department Management Hooks
 * 
 * Provides React hooks for department operations with proper error handling,
 * loading states, and automatic cache management.
 */

import {
  useDepartmentsQuery,
  useCreateDepartmentMutation,
  useAssignDepartmentsMutation,
  DepartmentsDocument,
  type CreateDepartmentInput,
  type Department,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Hook to fetch all departments
 * 
 * @returns Array of departments, loading state, error, and refetch function
 */
export function useDepartments() {
  const { data, loading, error, refetch } = useDepartmentsQuery({
    fetchPolicy: 'cache-and-network',
  });

  return {
    departments: data?.departments ?? [],
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}

/**
 * Hook to create a new department
 * 
 * Features:
 * - Optimistic UI updates with temporary ID
 * - Automatic cache update to add new department to departments list
 * - Error handling with formatted messages
 * 
 * @returns createDepartment function, loading state, and error
 */
export function useCreateDepartment() {
  const [createDepartmentMutation, { loading, error }] = useCreateDepartmentMutation({
    update: (cache, { data }) => {
      if (!data?.createDepartment) return;

      try {
        // Read existing departments query
        const existingData: any = cache.readQuery({
          query: DepartmentsDocument,
        });

        if (existingData?.departments) {
          // Write updated departments query with new department
          cache.writeQuery({
            query: DepartmentsDocument,
            data: {
              departments: [...existingData.departments, data.createDepartment],
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
      createDepartment: {
        __typename: 'Department',
        id: `temp-${Date.now()}`,
        organizationId: '', // Will be filled by server
        name: variables.input.name,
        description: variables.input.description ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }),
  });

  const createDepartment = async (input: CreateDepartmentInput) => {
    try {
      const result = await createDepartmentMutation({ variables: { input } });
      return result.data?.createDepartment;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    createDepartment,
    loading,
    error: error ? formatError(error) : null,
  };
}

/**
 * Hook to assign departments to a user
 * 
 * Features:
 * - Refetches user data after assignment to reflect changes
 * - Error handling with formatted messages
 * 
 * @returns assignDepartments function, loading state, and error
 */
export function useAssignDepartments() {
  const [assignDepartmentsMutation, { loading, error }] = useAssignDepartmentsMutation();

  const assignDepartments = async (userId: string, departmentIds: string[]) => {
    try {
      const result = await assignDepartmentsMutation({
        variables: { userId, departmentIds },
      });
      return result.data?.assignDepartments;
    } catch (err) {
      throw formatError(err);
    }
  };

  return {
    assignDepartments,
    loading,
    error: error ? formatError(error) : null,
  };
}
