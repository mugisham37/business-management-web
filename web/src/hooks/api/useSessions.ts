/**
 * Sessions API Hooks with React Query
 * 
 * Provides cached, optimistic, and type-safe hooks for session operations.
 * 
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Type-safe API calls
 * 
 * Requirements: Cached API hooks with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '@/lib/api/services/sessions.api';
import { queryKeys, cacheInvalidation } from '@/lib/query/query-client';
import type { SessionResponse } from '@/types/api/responses';

/**
 * Fetch all active sessions with caching
 * 
 * @returns Query result with sessions data
 * 
 * @example
 * ```tsx
 * const { data: sessions, isLoading } = useSessions();
 * ```
 */
export function useSessions() {
  return useQuery({
    queryKey: queryKeys.sessions.list(),
    queryFn: async () => {
      const response = await sessionsApi.getAll();
      return response.data.data;
    },
    // Refetch sessions more frequently as they can change
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Revoke session mutation with optimistic updates
 * 
 * @returns Mutation object
 * 
 * @example
 * ```tsx
 * const revokeSession = useRevokeSession();
 * 
 * await revokeSession.mutateAsync(sessionId);
 * ```
 */
export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await sessionsApi.delete(id);
      return response.data;
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.sessions.list() });

      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<SessionResponse[]>(
        queryKeys.sessions.list()
      );

      // Optimistically remove session from cache
      if (previousSessions) {
        queryClient.setQueryData<SessionResponse[]>(
          queryKeys.sessions.list(),
          previousSessions.filter((session) => session.id !== id)
        );
      }

      return { previousSessions };
    },
    onError: (err, id, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(queryKeys.sessions.list(), context.previousSessions);
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      cacheInvalidation.invalidateSessions();
    },
  });
}
