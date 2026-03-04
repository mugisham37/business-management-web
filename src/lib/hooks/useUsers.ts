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
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.1, 3.10, 3.11
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import type { ApolloError, ApolloCache } from '@apollo/client';
import { GET_USERS, GET_USER } from '@/graphql/queries/users';
import { CREATE_MANAGER, CREATE_WORKER, UPDATE_USER } from '@/graphql/mutations/users';
import { updateUsersCache, updateUserCache, User } from '@/lib/cache/cache-updaters';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Input types for user operations
 */
export interface CreateManagerInput {
  email: string;
  firstName: string;
  lastName: string;
  branchId?: string;
  departmentId?: string;
  phoneNumber?: string;
  credentialType?: 'PASSWORD' | 'PIN';
}

export interface CreateWorkerInput {
  email: string;
  firstName: string;
  lastName: string;
  branchId?: string;
  departmentId?: string;
  phoneNumber?: string;
  credentialType?: 'PASSWORD' | 'PIN';
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
  credentialType: 'PASSWORD' | 'PIN';
  temporaryCredential: string;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseUsersReturn {
  // Query data
  users: User[] | undefined;
  user: User | undefined;
  
  // Loading states
  loading: boolean;
  usersLoading: boolean;
  userLoading: boolean;
  
  // Error states
  error: AppError | null;
  
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
 * @returns User management operations and data
 * 
 * Requirements: 3.1, 3.10, 3.11
 */
export function useUsers(userId?: string): UseUsersReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Query for users list
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsersList,
  } = useQuery(GET_USERS, {
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

  // Query for single user (only if userId provided)
  const {
    data: userData,
    loading: userLoading,
    error: userError,
    refetch: refetchSingleUser,
  } = useQuery(GET_USER, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

  // Mutation for creating manager
  const [createManagerMutation] = useMutation(CREATE_MANAGER, {
    update: (cache: ApolloCache<any>, { data }: any) => {
      if (data?.createManager?.user) {
        updateUsersCache(cache, data.createManager.user);
      }
    },
  });

  // Mutation for creating worker
  const [createWorkerMutation] = useMutation(CREATE_WORKER, {
    update: (cache: ApolloCache<any>, { data }: any) => {
      if (data?.createWorker?.user) {
        updateUsersCache(cache, data.createWorker.user);
      }
    },
  });

  // Mutation for updating user
  const [updateUserMutation] = useMutation(UPDATE_USER, {
    update: (cache: ApolloCache<any>, { data }: any) => {
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
                __typename: 'User',
                id: `temp-${Date.now()}`,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                hierarchyLevel: 2, // Manager level
                organizationId: '', // Will be filled by server
                branchId: input.branchId || null,
                departmentId: input.departmentId || null,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              credentialType: input.credentialType || 'PASSWORD',
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
                __typename: 'User',
                id: `temp-${Date.now()}`,
                email: input.email,
                firstName: input.firstName,
                lastName: input.lastName,
                hierarchyLevel: 3, // Worker level
                organizationId: '', // Will be filled by server
                branchId: input.branchId || null,
                departmentId: input.departmentId || null,
                status: 'ACTIVE',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              credentialType: input.credentialType || 'PASSWORD',
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
              __typename: 'User',
              id: userId,
              ...input,
              // These fields won't change, but need to be included
              email: '', // Will be filled from cache
              organizationId: '',
              hierarchyLevel: 0,
              status: input.status || 'ACTIVE',
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
    user: userData?.getUser,
    
    // Loading states
    loading,
    usersLoading,
    userLoading,
    
    // Error state
    error,
    
    // Operations
    createManager,
    createWorker,
    updateUser,
    getUser,
    refetchUsers,
  };
}
