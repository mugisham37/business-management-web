/**
 * useBranches Hook
 * 
 * React hook for branch management operations.
 * Provides access to branch CRUD operations with loading/error states.
 * 
 * Features:
 * - Create and update branches
 * - Assign branch managers
 * - Fetch branches list
 * - Client-side pagination and sorting
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.4, 3.10, 3.11, 12.1
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation } from '@apollo/client/react';

import { GET_BRANCHES } from '@/graphql/queries/branches';
import {
  CREATE_BRANCH,
  UPDATE_BRANCH,
  ASSIGN_BRANCH_MANAGER,
} from '@/graphql/mutations/branches';
import { updateBranchesCache } from '@/lib/cache/cache-updaters';
import type { BranchType } from '@/lib/types/generated/graphql';
import type {
  GetBranchesData,
  CreateBranchData,
  UpdateBranchData,
  AssignBranchManagerData,
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
 * Input types for branch operations
 */
export interface CreateBranchInput {
  name: string;
  code: string;
  organizationId: string;
  address?: string;
  managerId?: string;
}

export interface UpdateBranchInput {
  name?: string;
  code?: string;
  address?: string;
}

/**
 * Hook return type
 * Requirements: 3.10, 12.1
 */
export interface UseBranchesReturn {
  // Query data
  branches: BranchType[] | undefined;
  paginatedBranches: BranchType[] | undefined;
  pagination: PaginationInfo | undefined;
  
  // Loading states
  loading: boolean;
  branchesLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Pagination controls
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  
  // Operations
  createBranch: (input: CreateBranchInput) => Promise<BranchType>;
  updateBranch: (branchId: string, input: UpdateBranchInput) => Promise<BranchType>;
  assignBranchManager: (branchId: string, managerId: string) => Promise<boolean>;
  refetchBranches: () => Promise<void>;
}

/**
 * useBranches Hook
 * 
 * @param initialPagination - Optional initial pagination params
 * @returns Branch management operations and data
 * 
 * Requirements: 3.4, 3.10, 3.11, 12.1
 */
export function useBranches(initialPagination?: Partial<PaginationParams>): UseBranchesReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state (Requirements: 12.1)
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: initialPagination?.page || 1,
    limit: initialPagination?.limit || 10,
    sortBy: initialPagination?.sortBy,
    sortOrder: initialPagination?.sortOrder || 'asc',
  });

  // Query for branches list
  const {
    data: branchesData,
    loading: branchesLoading,
    error: branchesError,
    refetch: refetchBranchesList,
  } = useApolloQuery<GetBranchesData>(GET_BRANCHES, {
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (branchesError && !error) {
    setError(errorHandler.handle(branchesError));
  }

  // Apply client-side pagination and sorting (Requirements: 12.1)
  const { paginatedBranches, pagination } = useMemo(() => {
    const allBranches = branchesData?.getBranches?.branches || [];
    const total = branchesData?.getBranches?.total || 0;

    // Apply sorting
    const sortedBranches = sortArray(
      allBranches,
      paginationParams.sortBy,
      paginationParams.sortOrder
    );

    // Apply pagination
    const paginated = paginateArray(
      sortedBranches,
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
      paginatedBranches: paginated,
      pagination: paginationInfo,
    };
  }, [branchesData, paginationParams]);

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

  // Mutation for creating branch
  const [createBranchMutation] = useApolloMutation<CreateBranchData>(CREATE_BRANCH, {
    update: (cache, { data }) => {
      if (data?.createBranch) {
        updateBranchesCache(cache, data.createBranch);
      }
    },
  });

  // Mutation for updating branch
  const [updateBranchMutation] = useApolloMutation<UpdateBranchData>(UPDATE_BRANCH, {
    update: (cache, { data }) => {
      if (data?.updateBranch) {
        updateBranchesCache(cache, data.updateBranch, false);
      }
    },
  });

  // Mutation for assigning branch manager
  const [assignBranchManagerMutation] = useApolloMutation<AssignBranchManagerData>(ASSIGN_BRANCH_MANAGER, {
    refetchQueries: [{ query: GET_BRANCHES }],
  });

  /**
   * Create a new branch
   * Requirements: 3.4, 3.11
   */
  const createBranch = useCallback(
    async (input: CreateBranchInput): Promise<BranchType> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await createBranchMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            createBranch: {
              __typename: 'BranchType',
              id: `temp-${Date.now()}`,
              name: input.name,
              code: input.code,
              organizationId: input.organizationId,
              managerId: input.managerId || null,
              address: input.address || null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.createBranch) {
          throw new Error('No data returned from createBranch mutation');
        }

        return data.createBranch;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [createBranchMutation]
  );

  /**
   * Update an existing branch
   * Requirements: 3.4, 3.11
   */
  const updateBranch = useCallback(
    async (branchId: string, input: UpdateBranchInput): Promise<BranchType> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await updateBranchMutation({
          variables: { branchId, input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            updateBranch: {
              __typename: 'BranchType',
              id: branchId,
              name: input.name || '',
              code: input.code || '',
              address: input.address || null,
              // These fields won't change, but need to be included
              organizationId: '',
              managerId: null,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.updateBranch) {
          throw new Error('No data returned from updateBranch mutation');
        }

        return data.updateBranch;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [updateBranchMutation]
  );

  /**
   * Assign a manager to a branch
   * Requirements: 3.4, 3.11
   */
  const assignBranchManager = useCallback(
    async (branchId: string, managerId: string): Promise<boolean> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await assignBranchManagerMutation({
          variables: { branchId, managerId },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            assignBranchManager: true,
          },
        });

        if (data?.assignBranchManager === undefined) {
          throw new Error('No data returned from assignBranchManager mutation');
        }

        return data.assignBranchManager;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [assignBranchManagerMutation]
  );

  /**
   * Refetch branches list
   * Requirements: 3.4
   */
  const refetchBranches = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetchBranchesList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchBranchesList]);

  // Combine loading states
  const loading = operationLoading || branchesLoading;

  // Handle query errors
  if (branchesError && !error) {
    setError(errorHandler.handle(branchesError));
  }

  return {
    // Data
    branches: branchesData?.getBranches?.branches,
    paginatedBranches: paginatedBranches as BranchType[],
    pagination,
    
    // Loading states
    loading,
    branchesLoading,
    
    // Error state
    error,
    
    // Pagination controls
    setPage,
    setPageSize,
    setSorting,
    
    // Operations
    createBranch,
    updateBranch,
    assignBranchManager,
    refetchBranches,
  };
}
