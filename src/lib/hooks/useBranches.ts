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
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.4, 3.10, 3.11
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import type { ApolloError, ApolloCache } from '@apollo/client';
import { GET_BRANCHES } from '@/graphql/queries/branches';
import {
  CREATE_BRANCH,
  UPDATE_BRANCH,
  ASSIGN_BRANCH_MANAGER,
} from '@/graphql/mutations/branches';
import { updateBranchesCache, Branch } from '@/lib/cache/cache-updaters';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Input types for branch operations
 */
export interface CreateBranchInput {
  name: string;
  address?: string;
  managerId?: string;
}

export interface UpdateBranchInput {
  name?: string;
  address?: string;
  isActive?: boolean;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseBranchesReturn {
  // Query data
  branches: Branch[] | undefined;
  
  // Loading states
  loading: boolean;
  branchesLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  createBranch: (input: CreateBranchInput) => Promise<Branch>;
  updateBranch: (branchId: string, input: UpdateBranchInput) => Promise<Branch>;
  assignBranchManager: (branchId: string, managerId: string) => Promise<Branch>;
  refetchBranches: () => Promise<void>;
}

/**
 * useBranches Hook
 * 
 * @returns Branch management operations and data
 * 
 * Requirements: 3.4, 3.10, 3.11
 */
export function useBranches(): UseBranchesReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Query for branches list
  const {
    data: branchesData,
    loading: branchesLoading,
    error: branchesError,
    refetch: refetchBranchesList,
  } = useQuery(GET_BRANCHES, {
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

  // Mutation for creating branch
  const [createBranchMutation] = useMutation(CREATE_BRANCH, {
    update: (cache, { data }) => {
      if (data?.createBranch) {
        updateBranchesCache(cache, data.createBranch);
      }
    },
  });

  // Mutation for updating branch
  const [updateBranchMutation] = useMutation(UPDATE_BRANCH, {
    update: (cache: ApolloCache<any>, { data }: any) => {
      if (data?.updateBranch) {
        updateBranchesCache(cache, data.updateBranch, false);
      }
    },
  });

  // Mutation for assigning branch manager
  const [assignBranchManagerMutation] = useMutation(ASSIGN_BRANCH_MANAGER, {
    update: (cache: ApolloCache<any>, { data }: any) => {
      if (data?.assignBranchManager) {
        updateBranchesCache(cache, data.assignBranchManager, false);
      }
    },
  });

  /**
   * Create a new branch
   * Requirements: 3.4, 3.11
   */
  const createBranch = useCallback(
    async (input: CreateBranchInput): Promise<Branch> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await createBranchMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            createBranch: {
              __typename: 'Branch',
              id: `temp-${Date.now()}`,
              name: input.name,
              organizationId: '', // Will be filled by server
              managerId: input.managerId || null,
              address: input.address || null,
              isActive: true,
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
    async (branchId: string, input: UpdateBranchInput): Promise<Branch> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await updateBranchMutation({
          variables: { branchId, input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            updateBranch: {
              __typename: 'Branch',
              id: branchId,
              ...input,
              // These fields won't change, but need to be included
              organizationId: '',
              managerId: null,
              address: input.address || null,
              isActive: input.isActive !== undefined ? input.isActive : true,
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
    async (branchId: string, managerId: string): Promise<Branch> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await assignBranchManagerMutation({
          variables: { branchId, managerId },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            assignBranchManager: {
              __typename: 'Branch',
              id: branchId,
              managerId,
              // These fields won't change, but need to be included
              name: '',
              organizationId: '',
              address: null,
              isActive: true,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.assignBranchManager) {
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
    
    // Loading states
    loading,
    branchesLoading,
    
    // Error state
    error,
    
    // Operations
    createBranch,
    updateBranch,
    assignBranchManager,
    refetchBranches,
  };
}
