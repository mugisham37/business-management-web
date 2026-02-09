/**
 * Users API Hooks with React Query
 * 
 * Provides cached, optimistic, and type-safe hooks for user operations.
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Type-safe API calls
 * - Cache invalidation strategies
 * - Loading and error states
 * 
 * Requirements: Cached API hooks with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/lib/api/services/users.api';
import { queryKeys, cacheInvalidation } from '@/lib/query/query-client';
import type {
  InviteUserRequest,
  RegisterInvitationRequest,
  UpdateUserRequest,
} from '@/types/api/requests';
import type { UserResponse } from '@/types/api/responses';

/**
 * Fetch user by ID with caching
 * 
 * @param id - User ID
 * @param options - Query options
 * @returns Query result with user data
 * 
 * @example
 * ```tsx
 * const { data: user, isLoading, error } = useUser(userId);
 * ```
 */
export function useUser(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: async () => {
      const response = await usersApi.getById(id);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!id,
  });
}

/**
 * Fetch user hierarchy with caching
 * 
 * @param id - User ID
 * @returns Query result with hierarchy data
 */
export function useUserHierarchy(id: string) {
  return useQuery({
    queryKey: queryKeys.users.hierarchy(id),
    queryFn: async () => {
      const response = await usersApi.getHierarchy(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Fetch users created by a user with caching
 * 
 * @param id - Creator user ID
 * @returns Query result with created users
 */
export function useCreatedUsers(id: string) {
  return useQuery({
    queryKey: queryKeys.users.createdUsers(id),
    queryFn: async () => {
      const response = await usersApi.getCreatedUsers(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

/**
 * Invite user mutation with optimistic updates
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const inviteUser = useInviteUser();
 * 
 * await inviteUser.mutateAsync({
 *   email: 'user@example.com',
 *   roleId: 'role-id',
 * });
 * ```
 */
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InviteUserRequest) => {
      const response = await usersApi.invite(data);
      return response.data.data;
    },
    onSuccess: () => {
      // Invalidate users list to refetch with new invitation
      cacheInvalidation.invalidateUsers();
    },
  });
}

/**
 * Register with invitation mutation
 * 
 * @returns Mutation object
 */
export function useRegisterInvitation() {
  return useMutation({
    mutationFn: async (data: RegisterInvitationRequest) => {
      const response = await usersApi.registerInvitation(data);
      return response.data.data;
    },
  });
}

/**
 * Update user mutation with optimistic updates
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const updateUser = useUpdateUser();
 * 
 * await updateUser.mutateAsync({
 *   id: userId,
 *   data: { firstName: 'John', lastName: 'Doe' },
 * });
 * ```
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }) => {
      const response = await usersApi.update(id, data);
      return response.data.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<UserResponse>(
        queryKeys.users.detail(id)
      );

      // Optimistically update cache
      if (previousUser) {
        queryClient.setQueryData<UserResponse>(queryKeys.users.detail(id), {
          ...previousUser,
          ...data,
        });
      }

      return { previousUser };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(id), context.previousUser);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      cacheInvalidation.invalidateUser(id);
      cacheInvalidation.invalidateUsers();
    },
  });
}

/**
 * Delete user mutation with optimistic updates
 * 
 * @returns Mutation object
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.delete(id);
      return response.data;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(id) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.users.detail(id));

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });

      return { previousUser };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.users.detail(id), context.previousUser);
      }
    },
    onSettled: () => {
      // Refetch users list
      cacheInvalidation.invalidateUsers();
    },
  });
}

/**
 * Suspend user mutation
 * 
 * @returns Mutation object
 */
export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.suspend(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate user detail and list
      cacheInvalidation.invalidateUser(id);
      cacheInvalidation.invalidateUsers();
    },
  });
}

/**
 * Reactivate user mutation
 * 
 * @returns Mutation object
 */
export function useReactivateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.reactivate(id);
      return response.data;
    },
    onSuccess: (data, id) => {
      // Invalidate user detail and list
      cacheInvalidation.invalidateUser(id);
      cacheInvalidation.invalidateUsers();
    },
  });
}
