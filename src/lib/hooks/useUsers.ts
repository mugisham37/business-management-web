/**
 * useUsers Hook
 * 
 * React hook for user management operations.
 * Provides access to user CRUD operations with loading/error states.
 * 
 * Features:
 * - Create manager and worker users
 * - Update user information
 * - Fetch single user or list of users
 * - Client-side pagination and sorting
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.1, 3.10, 3.11, 12.1
 */

import { useState, useCallback, useMemo } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation } from '@apollo/client/react';

import { GET_USERS, GET_USER } from '@/graphql/queries/users';
import { CREATE_MANAGER, CREATE_WORKER, UPDATE_USER } from '@/graphql/mutations/users';
import { updateUsersCache, updateUserCache, User } from '@/lib/cache/cache-updaters';
import type {
  GetUsersData,
  GetUserData,
  CreateManagerData,
  CreateWorkerData,
  UpdateUserData,
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
 * Input types for user operations
 */
export interface CreateManagerInput {
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  staffProfile: Record<string, unknown>;
  branchId?: string;
  departmentId?: string;
}

export interface CreateWorkerInput {
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  staffProfile: Record<string, unknown>;
  usePIN?: boolean;
  branchId?: string;
  departmentId?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  branchId?: string;
  departmentId?: string;
  phoneNumber?: string;
  status?: string;
}

/**
 * Response types
 */
export interface CreateUserResponse {
  user: User;
  credentialType: string;
  temporaryCredential: string;
}

/**
 * Hook return type
 * Requirements: 3.10, 12.1
 */
export interface UseUsersReturn {
  // Query data
  users: User[] | undefined;
  paginatedUsers: User[] | undefined;
  user: User | undefined;
  pagination: PaginationInfo | undefined;
  
  // Loading states
  loading: boolean;
  usersLoading: boolean;
  userLoading: boolean;
  
  // Error states
  error: AppError | null;
  
  // Pagination controls
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  
  // Operations
  createManager: (input: CreateManagerInput) => Promise<CreateUserResponse>;
  createWorker: (input: CreateWorkerInput) => Promise<CreateUserResponse>;
  updateUser: (userId: string, input: UpdateUserInput) => Promise<User>;
  getUser: (userId: string) => Promise<void>;
  refetchUsers: () => Promise<void>;
}

/**
 * useUsers Hook
 * 
 * @param userId - Optional user ID to fetch specific user
 * @param initialPagination - Optional initial pagination params
 * @returns User management operations and data
 * 
 * Requirements: 3.1, 3.10, 3.11, 12.1
 */
export function useUsers(
  userId?: string,
  initialPagination?: Partial<PaginationParams>
): UseUsersReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);
  
  // Pagination state (Requirements: 12.1)
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({
    page: initialPagination?.page || 1,
    limit: initialPagination?.limit || 10,
    sortBy: initialPagination?.sortBy,
    sortOrder: initialPagination?.sortOrder || 'asc',
  });

  // Query for users list
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsersList,
  } = useApolloQuery<GetUsersData>(GET_USERS, {
    fetchPolicy: 'cache-first',
  });

  // Query for single user (only if userId provided)
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchSingleUser,
  } = useApolloQuery<GetUserData>(GET_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (usersError && !error) {
    setError(errorHandler.handle(usersError));
  }
  if (userError && !error) {
    setError(errorHandler.handle(userError));
  }

  // Apply client-side pagination and sorting (Requirements: 12.1)
  const { paginatedUsers, pagination } = useMemo(() => {
    const allUsers = usersData?.getUsers?.users || [];
    const total = usersData?.getUsers?.total || 0;

    // Apply sorting
    const sortedUsers = sortArray(
      allUsers,
      paginationParams.sortBy,
      paginationParams.sortOrder
    );

    // Apply pagination
    const paginated = paginateArray(
      sortedUsers,
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
      paginatedUsers: paginated,
      pagination: paginationInfo,
    };
  }, [usersData, paginationParams]);

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

  // Mutation for creating manager
  const [createManagerMutation] = useApolloMutation<CreateManagerData>(CREATE_MANAGER, {
    update: (cache, { data }) => {
      if (data?.createManager?.user) {
        updateUsersCache(cache, data.createManager.user);
      }
    },
  });

  // Mutation for creating worker
  const [createWorkerMutation] = useApolloMutation<CreateWorkerData>(CREATE_WORKER, {
    update: (cache, { data }) => {
      if (data?.createWorker?.user) {
        updateUsersCache(cache, data.createWorker.user);
      }
    },
  });

  // Mutation for updating user
  const [updateUserMutation] = useApolloMutation<UpdateUserData>(UPDATE_USER, {
    update: (cache, { data }) => {
      if (data?.updateUser) {
        updateUserCache(cache, data.updateUser);
      }
    },
  });

  /**
   * Create a new manager user
   * Requirements: 3.1, 3.11
   */
  const createManager = useCallback(
    async (input: CreateManagerInput): Promise<CreateUserResponse> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await createManagerMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            createManager: {
              __typename: 'CreateUserResponse',
              user: {
                __typename: 'UserManagementType',
                id: `temp-${Date.now()}`,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                hierarchyLevel: '2', // Manager level as string
                organizationId: input.organizationId,
                branchId: input.branchId || null,
                departmentId: input.departmentId || null,
                status: 'ACTIVE',
                createdById: null,
                staffProfile: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              credentialType: 'PASSWORD',
              temporaryCredential: '****',
            },
          },
        });

        if (!data?.createManager) {
          throw new Error('No data returned from createManager mutation');
        }

        return data.createManager;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [createManagerMutation]
  );

  /**
   * Create a new worker user
   * Requirements: 3.1, 3.11
   */
  const createWorker = useCallback(
    async (input: CreateWorkerInput): Promise<CreateUserResponse> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await createWorkerMutation({
          variables: { input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            createWorker: {
              __typename: 'CreateUserResponse',
              user: {
                __typename: 'UserManagementType',
                id: `temp-${Date.now()}`,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                hierarchyLevel: '3', // Worker level
                organizationId: input.organizationId,
                branchId: input.branchId || null,
                departmentId: input.departmentId || null,
                status: 'ACTIVE',
                createdById: null,
                staffProfile: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              credentialType: input.usePIN ? 'PIN' : 'PASSWORD',
              temporaryCredential: '****',
            },
          },
        });

        if (!data?.createWorker) {
          throw new Error('No data returned from createWorker mutation');
        }

        return data.createWorker;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [createWorkerMutation]
  );

  /**
   * Update an existing user
   * Requirements: 3.1, 3.11
   */
  const updateUser = useCallback(
    async (userId: string, input: UpdateUserInput): Promise<User> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await updateUserMutation({
          variables: { userId, input },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            updateUser: {
              __typename: 'UserManagementType',
              id: userId,
              ...input,
              // These fields won't change, but need to be included
              email: '', // Will be filled from cache
              organizationId: '',
              hierarchyLevel: '',
              firstName: input.firstName || '',
              lastName: input.lastName || '',
              status: input.status || 'ACTIVE',
              createdById: null,
              staffProfile: null,
              branchId: input.branchId || null,
              departmentId: input.departmentId || null,
              createdAt: '',
              updatedAt: new Date().toISOString(),
            },
          },
        });

        if (!data?.updateUser) {
          throw new Error('No data returned from updateUser mutation');
        }

        return data.updateUser;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [updateUserMutation]
  );

  /**
   * Fetch a specific user
   * Requirements: 3.1
   */
  const getUser = useCallback(
    async (userId: string): Promise<void> => {
      setError(null);
      try {
        await refetchSingleUser({ userId });
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      }
    },
    [refetchSingleUser]
  );

  /**
   * Refetch users list
   * Requirements: 3.1
   */
  const refetchUsers = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetchUsersList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchUsersList]);

  // Combine loading states
  const loading = operationLoading || usersLoading || userLoading;

  // Handle query errors
  if (usersError && !error) {
    setError(errorHandler.handle(usersError));
  }
  if (userError && !error) {
    setError(errorHandler.handle(userError));
  }

  return {
    // Data
    users: usersData?.getUsers?.users,
    paginatedUsers,
    user: userData?.getUser ?? undefined,
    pagination,
    
    // Loading states
    loading,
    usersLoading,
    userLoading,
    
    // Error state
    error,
    
    // Pagination controls
    setPage,
    setPageSize,
    setSorting,
    
    // Operations
    createManager,
    createWorker,
    updateUser,
    getUser,
    refetchUsers,
  };
}
