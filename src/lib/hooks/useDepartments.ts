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
import { useQuery, useMutation } from '@apollo/client';
import type { ApolloError, ApolloCache } from '@apollo/client';
import { GET_DEPARTMENTS } from '@/graphql/queries/departments';
import {
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  ASSIGN_DEPARTMENT_MANAGER,
} from '@/graphql/mutations/departments';
import { updateDepartmentsCache, Department } from '@/lib/cache/cache-updaters';
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
  branchId?: string;
  managerId?: string;
}

export interface UpdateDepartmentInput {
  name?: string;
  branchId?: string;
  isActive?: boolean;
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
  assignDepartmentManager: (departmentId: string, managerId: string) => Promise<Department>;
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
  } = useQuery(GET_DEPARTMENTS, {
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

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
  const [createDepartmentMutation] = useMutation(CREATE_DEPARTMENT, {
    update: (cache, { data }) => {
      if (data?.createDepartment) {
        updateDepartmentsCache(cache, data.createDepartment);
      }
    },
  });

  // Mutation for updating department
  const [updateDepartmentMutation] = useMutation(UPDATE_DEPARTMENT, {
    update: (cache: ApolloCache<any>, { data }: any) => {
      if (data?.updateDepartment) {
        updateDepartmentsCache(cache, data.updateDepartment, false);
      }
    },
  });

  // Mutation for assigning department manager
  const [assignDepartmentManagerMutation] = useMutation(ASSIGN_DEPARTMENT_MANAGER, {
    update: (cache: ApolloCache<any>, { data }: any) => {
      if (data?.assignDepartmentManager) {
        updateDepartmentsCache(cache, data.assignDepartmentManager, false);
      }
    },
  });

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
              __typename: 'Department',
              id: `temp-${Date.now()}`,
              name: input.name,
              organizationId: '', // Will be filled by server
              branchId: input.branchId || null,
              managerId: input.managerId || null,
              isActive: true,
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
              __typename: 'Department',
              id: departmentId,
              ...input,
              // These fields won't change, but need to be included
              organizationId: '',
              managerId: null,
              branchId: input.branchId || null,
              isActive: input.isActive !== undefined ? input.isActive : true,
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
    async (departmentId: string, managerId: string): Promise<Department> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await assignDepartmentManagerMutation({
          variables: { departmentId, managerId },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            assignDepartmentManager: {
              __typename: 'Department',
              id: departmentId,
              managerId,
              // These fields won't change, but need to be included
              name: '',
              organizationId: '',
              branchId: null,
              isActive: true,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.assignDepartmentManager) {
          throw new Error('No data returned from assignDepartmentManager mutation');
        }

        return data.assignDepartmentManager;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [assignDepartmentManagerMutation]
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
