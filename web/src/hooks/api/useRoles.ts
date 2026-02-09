/**
 * Roles API Hooks with React Query
 * 
 * Provides cached, optimistic, and type-safe hooks for role operations.
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Type-safe API calls
 * - Cache invalidation strategies
 * 
 * Requirements: Cached API hooks with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '@/lib/api/services/roles.api';
import { queryKeys, cacheInvalidation } from '@/lib/query/query-client';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  AssignRoleRequest,
} from '@/types/api/requests';
import type { RoleResponse } from '@/types/api/responses';

/**
 * Fetch role by ID with caching
 * 
 * @param id - Role ID
 * @param options - Query options
 * @returns Query result with role data
 * 
 * @example
 * ```tsx
 * const { data: role, isLoading } = useRole(roleId);
 * ```
 */
export function useRole(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: async () => {
      const response = await rolesApi.getById(id);
      return response.data.data;
    },
    enabled: options?.enabled !== false && !!id,
  });
}

/**
 * Create role mutation with cache updates
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const createRole = useCreateRole();
 * 
 * await createRole.mutateAsync({
 *   name: 'Manager',
 *   description: 'Department manager',
 *   permissions: ['users:read', 'users:create'],
 * });
 * ```
 */
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateRoleRequest) => {
      const response = await rolesApi.create(data);
      return response.data.data;
    },
    onSuccess: (newRole) => {
      // Add to cache
      queryClient.setQueryData(queryKeys.roles.detail(newRole.id), newRole);
      
      // Invalidate roles list
      cacheInvalidation.invalidateRoles();
    },
  });
}

/**
 * Update role mutation with optimistic updates
 * 
 * @returns Mutation object
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateRoleRequest }) => {
      const response = await rolesApi.update(id, data);
      return response.data.data;
    },
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.roles.detail(id) });

      // Snapshot previous value
      const previousRole = queryClient.getQueryData<RoleResponse>(
        queryKeys.roles.detail(id)
      );

      // Optimistically update cache
      if (previousRole) {
        queryClient.setQueryData<RoleResponse>(queryKeys.roles.detail(id), {
          ...previousRole,
          ...data,
        });
      }

      return { previousRole };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousRole) {
        queryClient.setQueryData(queryKeys.roles.detail(id), context.previousRole);
      }
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      cacheInvalidation.invalidateRole(id);
      cacheInvalidation.invalidateRoles();
    },
  });
}

/**
 * Delete role mutation with optimistic updates
 * 
 * @returns Mutation object
 */
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rolesApi.delete(id);
      return response.data;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.roles.detail(id) });

      // Snapshot previous value
      const previousRole = queryClient.getQueryData(queryKeys.roles.detail(id));

      // Optimistically remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.roles.detail(id) });

      return { previousRole };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousRole) {
        queryClient.setQueryData(queryKeys.roles.detail(id), context.previousRole);
      }
    },
    onSettled: () => {
      // Refetch roles list
      cacheInvalidation.invalidateRoles();
    },
  });
}

/**
 * Assign permissions to role mutation
 * 
 * @returns Mutation object
 */
export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssignPermissionsRequest }) => {
      const response = await rolesApi.assignPermissions(id, data);
      return response.data.data;
    },
    onSuccess: (data, { id }) => {
      // Update role in cache
      queryClient.setQueryData(queryKeys.roles.detail(id), data);
      
      // Invalidate roles list
      cacheInvalidation.invalidateRoles();
      
      // Invalidate users as their permissions may have changed
      cacheInvalidation.invalidateUsers();
    },
  });
}

/**
 * Assign role to user mutation
 * 
 * @returns Mutation object
 */
export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssignRoleRequest }) => {
      const response = await rolesApi.assignRole(id, data);
      return response.data;
    },
    onSuccess: (data, { data: { userId } }) => {
      // Invalidate user to refetch with new role
      cacheInvalidation.invalidateUser(userId);
      cacheInvalidation.invalidateUsers();
    },
  });
}
