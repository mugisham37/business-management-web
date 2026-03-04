/**
 * useDepartments Hook
 * 
 * React hook for department management operations.
 * Provides access to department CRUD operations with loading/error states.
 * 
 * Features:
 * - Create and update departments
 * - Assign department managers
 * - Fetch departments list
 * - Client-side pagination and sorting
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.5, 3.10, 3.11, 12.1
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation, useApolloClient } from '@apollo/client/react';

import { GET_DEPARTMENTS } from '@/graphql/queries/departments';
import {
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  ASSIGN_DEPARTMENT_MANAGER,
} from '@/graphql/mutations/departments';
import { updateDepartmentsCache, Department } from '@/lib/cache/cache-updaters';
import type {
  GetDepartmentsData,
  CreateDepartmentData,
  UpdateDepartmentData,
  AssignDepartmentManagerData,
} from '@/graphql/types/operations';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';
import {
  PaginationParams,
  PaginationInfo,
  calculatePaginationInfo,
  paginateArray,
  sortArray,
} from '@/lib/types/pagination.types';

/**
 * Input types for department operations
 */
export interface CreateDepartmentInput {
  name: string;
  code: string;
  organizationId: string;
  branchId?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  code?: string;
  branchId?: string;
}

/**
 * Hook return type
 * Requirements: 3.10, 12.1
 */
export interface UseDepartmentsReturn {
  // Query data
  departments: Department[] | undefined;
  paginatedDepartments: Department[] | undefined;
  pagination: PaginationInfo | undefined;
  
  // Loading states
  loading: boolean;
  departmentsLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Pagination controls
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  
  // Operations
  createDepartment: (input: CreateDepartmentInput) => Promise<Department>;
  updateDepartment: (departmentId: string, input: UpdateDepartmentInput) => Promise<Department>;
  assignDepartmentManager: (departmentId: string, managerId: string) => Promise<boolean>;
  refetchDepartments: () => Promise<void>;
}

/**
 * useDepartments Hook
 * 
 * @param initialPagination - Optional initial pagination params
 * @returns Department management operations and data
 * 
 * Requirements: 3.5, 3.10, 3.11, 12.1
 */
export function useDepartments(initialPagination?: Partial<PaginationParams>): UseDepartmentsReturn {
  const client = useApolloClient();
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state (Requirements: 12.1)
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: initialPagination?.page || 1,
    limit: initialPagination?.limit || 10,
    sortBy: initialPagination?.sortBy,
    sortOrder: initialPagination?.sortOrder || 'asc',
  });

  // Query for departments list
  const {
    data: departmentsData,
    loading: departmentsLoading,
    error: departmentsError,
    refetch: refetchDepartmentsList,
  } = useApolloQuery<GetDepartmentsData>(GET_DEPARTMENTS, {
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (departmentsError && !error) {
    setError(errorHandler.handle(departmentsError));
  }

  // Apply client-side pagination and sorting (Requirements: 12.1)
  const { paginatedDepartments, pagination } = useMemo(() => {
    const allDepartments = departmentsData?.getDepartments?.departments || [];
    const total = departmentsData?.getDepartments?.total || 0;

    // Apply sorting
    const sortedDepartments = sortArray(
      allDepartments,
      paginationParams.sortBy,
      paginationParams.sortOrder
    );

    // Apply pagination
    const paginated = paginateArray(
      sortedDepartments,
      paginationParams.page,
      paginationParams.limit
    );

    // Calculate pagination info
    const paginationInfo = calculatePaginationInfo(
      total,
      paginationParams.page,
      paginationParams.limit
    );

    return {
      paginatedDepartments: paginated,
      pagination: paginationInfo,
    };
  }, [departmentsData, paginationParams]);

  // Pagination controls (Requirements: 12.1)
  const setPage = useCallback((page: number) => {
    setPaginationParams((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((limit: number) => {
    setPaginationParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const setSorting = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setPaginationParams((prev) => ({ ...prev, sortBy, sortOrder }));
  }, []);

  // Mutation for creating department
  const [createDepartmentMutation] = useApolloMutation<CreateDepartmentData>(CREATE_DEPARTMENT, {
    update: (cache, { data }) => {
      if (data?.createDepartment) {
        updateDepartmentsCache(cache, data.createDepartment);
      }
    },
  });

  // Mutation for updating department
  const [updateDepartmentMutation] = useApolloMutation<UpdateDepartmentData>(UPDATE_DEPARTMENT, {
    update: (cache, { data }) => {
      if (data?.updateDepartment) {
        updateDepartmentsCache(cache, data.updateDepartment, false);
      }
    },
  });

  // Mutation for assigning department manager
  const [assignDepartmentManagerMutation] = useApolloMutation<AssignDepartmentManagerData>(ASSIGN_DEPARTMENT_MANAGER);

  /**
   * Create a new department
   * Requirements: 3.5, 3.11
   */
  const createDepartment = useCallback(
    async (input: CreateDepartmentInput): Promise<Department> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await createDepartmentMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            createDepartment: {
              __typename: 'DepartmentType',
              id: `temp-${Date.now()}`,
              name: input.name,
              code: input.code,
              organizationId: input.organizationId,
              branchId: input.branchId || null,
              managerId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.createDepartment) {
          throw new Error('No data returned from createDepartment mutation');
        }

        return data.createDepartment;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [createDepartmentMutation]
  );

  /**
   * Update an existing department
   * Requirements: 3.5, 3.11
   */
  const updateDepartment = useCallback(
    async (departmentId: string, input: UpdateDepartmentInput): Promise<Department> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await updateDepartmentMutation({
          variables: { departmentId, input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            updateDepartment: {
              __typename: 'DepartmentType',
              id: departmentId,
              name: input.name || '',
              code: input.code || '',
              organizationId: '',
              managerId: null,
              branchId: input.branchId || null,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.updateDepartment) {
          throw new Error('No data returned from updateDepartment mutation');
        }

        return data.updateDepartment;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [updateDepartmentMutation]
  );

  /**
   * Assign a manager to a department
   * Requirements: 3.5, 3.11
   */
  const assignDepartmentManager = useCallback(
    async (departmentId: string, managerId: string): Promise<boolean> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await assignDepartmentManagerMutation({
          variables: { departmentId, managerId },
        });

        if (data?.assignDepartmentManager) {
          // Update the department in cache with new manager
          updateDepartmentsCache(
            client.cache,
            {
              __typename: 'DepartmentType',
              id: departmentId,
              managerId,
              name: '',
              code: '',
              organizationId: '',
              branchId: null,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
            false // isNew = false (update existing)
          );
        }

        return data?.assignDepartmentManager || false;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [assignDepartmentManagerMutation, client]
  );

  /**
   * Refetch departments list
   * Requirements: 3.5
   */
  const refetchDepartments = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetchDepartmentsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchDepartmentsList]);

  // Combine loading states
  const loading = operationLoading || departmentsLoading;

  // Handle query errors
  if (departmentsError && !error) {
    setError(errorHandler.handle(departmentsError));
  }

  return {
    // Data
    departments: departmentsData?.getDepartments?.departments,
    paginatedDepartments,
    pagination,
    
    // Loading states
    loading,
    departmentsLoading,
    
    // Error state
    error,
    
    // Pagination controls
    setPage,
    setPageSize,
    setSorting,
    
    // Operations
    createDepartment,
    updateDepartment,
    assignDepartmentManager,
    refetchDepartments,
  };
}
