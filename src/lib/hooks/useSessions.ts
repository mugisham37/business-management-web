/**
 * useSessions Hook
 * 
 * React hook for session management operations.
 * Provides access to session queries and revocation operations.
 * 
 * Features:
 * - Fetch active sessions
 * - Revoke single session
 * - Revoke all sessions
 * - Optimistic updates for mutations
 * - Automatic cache management
 * - Centralized error handling
 * 
 * Requirements: 3.8, 3.10, 3.11
 */

import { useState, useCallback } from 'react';
import { useQuery as useApolloQuery, useMutation as useApolloMutation } from '@apollo/client/react';

import { GET_ACTIVE_SESSIONS } from '@/graphql/queries/auth';
import { REVOKE_SESSION, REVOKE_ALL_SESSIONS } from '@/graphql/mutations/sessions';
import { updateSessionsCache, clearSessionsCache } from '@/lib/cache/cache-updaters';
import type {
  GetActiveSessionsData,
  RevokeSessionData,
  RevokeAllSessionsData,
} from '@/graphql/types/operations';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

/**
 * Session type
 */
export interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  expiresAt: string;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseSessionsReturn {
  // Query data
  sessions: Session[] | undefined;
  
  // Loading states
  loading: boolean;
  sessionsLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  revokeSession: (sessionId: string) => Promise<boolean>;
  revokeAllSessions: () => Promise<boolean>;
  refetchSessions: () => Promise<void>;
}

/**
 * useSessions Hook
 * 
 * @returns Session management operations and data
 * 
 * Requirements: 3.8, 3.10, 3.11
 */
export function useSessions(): UseSessionsReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [operationLoading, setOperationLoading] = useState(false);

  // Query for active sessions
  const {
    data: sessionsData,
    loading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessionsList,
  } = useApolloQuery<GetActiveSessionsData>(GET_ACTIVE_SESSIONS, {
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (sessionsError && !error) {
    setError(errorHandler.handle(sessionsError));
  }

  // Mutation for revoking single session
  const [revokeSessionMutation] = useApolloMutation<RevokeSessionData>(REVOKE_SESSION, {
    update: (cache, { data }, { variables }) => {
      if (data?.revokeSession && variables?.sessionId) {
        // Remove session from cache
        updateSessionsCache(cache, variables.sessionId as string);
      }
    },
  });

  // Mutation for revoking all sessions
  const [revokeAllSessionsMutation] = useApolloMutation<RevokeAllSessionsData>(REVOKE_ALL_SESSIONS, {
    update: (cache, { data }) => {
      if (data?.revokeAllSessions) {
        // Clear all sessions from cache
        clearSessionsCache(cache);
      }
    },
  });

  /**
   * Revoke a single session
   * Requirements: 3.8, 3.11
   */
  const revokeSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      setOperationLoading(true);
      setError(null);

      try {
        const { data } = await revokeSessionMutation({
          variables: { sessionId },
          // Optimistic update (Requirements: 3.11)
          optimisticResponse: {
            revokeSession: true,
          },
        });

        if (data?.revokeSession === undefined) {
          throw new Error('No data returned from revokeSession mutation');
        }

        return data.revokeSession;
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      } finally {
        setOperationLoading(false);
      }
    },
    [revokeSessionMutation]
  );

  /**
   * Revoke all sessions for current user
   * Requirements: 3.8, 3.11
   */
  const revokeAllSessions = useCallback(async (): Promise<boolean> => {
    setOperationLoading(true);
    setError(null);

    try {
      const { data } = await revokeAllSessionsMutation({
        // Optimistic update (Requirements: 3.11)
        optimisticResponse: {
          revokeAllSessions: true,
        },
      });

      if (data?.revokeAllSessions === undefined) {
        throw new Error('No data returned from revokeAllSessions mutation');
      }

      return data.revokeAllSessions;
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    } finally {
      setOperationLoading(false);
    }
  }, [revokeAllSessionsMutation]);

  /**
   * Refetch active sessions
   * Requirements: 3.8
   */
  const refetchSessions = useCallback(async (): Promise<void> => {
    setError(null);
    try {
      await refetchSessionsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchSessionsList]);

  // Combine loading states
  const loading = operationLoading || sessionsLoading;

  // Handle query errors
  if (sessionsError && !error) {
    setError(errorHandler.handle(sessionsError));
  }

  return {
    // Data
    sessions: sessionsData?.getActiveSessions,
    
    // Loading states
    loading,
    sessionsLoading,
    
    // Error state
    error,
    
    // Operations
    revokeSession,
    revokeAllSessions,
    refetchSessions,
  };
}
