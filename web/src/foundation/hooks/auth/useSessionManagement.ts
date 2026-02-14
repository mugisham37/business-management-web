/**
 * Session Management Hooks
 * 
 * Provides hooks for managing user sessions including listing active sessions,
 * revoking specific sessions, and logging out from all devices.
 * 
 * Features:
 * - List all active sessions with device info
 * - Revoke specific session by ID
 * - Logout from all devices
 * - User-friendly error messages
 * - Loading state management
 * 
 * Requirements: 12.1, 12.3, 12.4
 */

import { useState, useCallback } from 'react';
import { useAuth } from '@/foundation/providers/AuthProvider';
import { formatError, AppError } from '@/foundation/utils/errors';
import {
  useListActiveSessionsMutation,
  useRevokeSessionMutation,
  SessionInfo,
} from '@/foundation/types/generated/graphql';

/**
 * Return type for useActiveSessions hook
 */
export interface UseActiveSessionsReturn {
  /**
   * Fetch active sessions function
   * @returns Array of active sessions
   */
  fetchSessions: () => Promise<SessionInfo[]>;
  
  /**
   * Active sessions data
   */
  sessions: SessionInfo[];
  
  /**
   * Loading state - true while fetching sessions
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Return type for useRevokeSession hook
 */
export interface UseRevokeSessionReturn {
  /**
   * Revoke session function
   * @param sessionId - ID of the session to revoke
   */
  revokeSession: (sessionId: string) => Promise<void>;
  
  /**
   * Loading state - true while revoking session
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Return type for useLogoutAllDevices hook
 */
export interface UseLogoutAllDevicesReturn {
  /**
   * Logout from all devices function
   */
  logoutAllDevices: () => Promise<void>;
  
  /**
   * Loading state - true while logging out
   */
  loading: boolean;
  
  /**
   * Error state - contains formatted error if operation fails
   */
  error: AppError | null;
}

/**
 * Hook for fetching active sessions
 * 
 * Retrieves all active sessions for the current user.
 * Each session includes device info, IP address, location, and last active time.
 * 
 * @example
 * ```tsx
 * function ActiveSessionsList() {
 *   const { fetchSessions, sessions, loading, error } = useActiveSessions();
 *   
 *   useEffect(() => {
 *     fetchSessions();
 *   }, [fetchSessions]);
 *   
 *   if (loading) return <div>Loading sessions...</div>;
 *   if (error) return <div className="error">{error.message}</div>;
 *   
 *   return (
 *     <div>
 *       <h2>Active Sessions</h2>
 *       {sessions.map((session) => (
 *         <div key={session.sessionId}>
 *           <p>Device: {session.deviceInfo}</p>
 *           <p>IP: {session.ipAddress}</p>
 *           <p>Last Active: {new Date(session.lastActive).toLocaleString()}</p>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useActiveSessions(): UseActiveSessionsReturn {
  const [listActiveSessionsMutation, { loading: mutationLoading }] = useListActiveSessionsMutation();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const fetchSessions = useCallback(async (): Promise<SessionInfo[]> => {
    setLoading(true);
    setError(null);

    try {
      const result = await listActiveSessionsMutation();
      
      if (!result.data?.listActiveSessions) {
        throw new Error('Failed to fetch active sessions');
      }

      const fetchedSessions = result.data.listActiveSessions;
      setSessions(fetchedSessions);
      return fetchedSessions;
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError);
      throw formattedError;
    } finally {
      setLoading(false);
    }
  }, [listActiveSessionsMutation]);

  return {
    fetchSessions,
    sessions,
    loading: loading || mutationLoading,
    error,
  };
}

/**
 * Hook for revoking a specific session
 * 
 * Revokes access for a specific session by session ID.
 * The user will be logged out from that device.
 * 
 * @example
 * ```tsx
 * function SessionItem({ session }: { session: SessionInfo }) {
 *   const { revokeSession, loading, error } = useRevokeSession();
 *   const { fetchSessions } = useActiveSessions();
 *   
 *   const handleRevoke = async () => {
 *     if (confirm('Are you sure you want to revoke this session?')) {
 *       try {
 *         await revokeSession(session.sessionId);
 *         alert('Session revoked successfully');
 *         // Refresh the session list
 *         await fetchSessions();
 *       } catch (err) {
 *         // Error is already set in hook state
 *       }
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       {error && <div className="error">{error.message}</div>}
 *       <p>Device: {session.deviceInfo}</p>
 *       <p>IP: {session.ipAddress}</p>
 *       <button onClick={handleRevoke} disabled={loading}>
 *         {loading ? 'Revoking...' : 'Revoke Session'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRevokeSession(): UseRevokeSessionReturn {
  const [revokeSessionMutation, { loading: mutationLoading }] = useRevokeSessionMutation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const revokeSession = useCallback(
    async (sessionId: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const result = await revokeSessionMutation({
          variables: { sessionId },
        });

        if (!result.data?.revokeSession) {
          throw new Error('Failed to revoke session');
        }
      } catch (err) {
        const formattedError = formatError(err);
        setError(formattedError);
        throw formattedError;
      } finally {
        setLoading(false);
      }
    },
    [revokeSessionMutation]
  );

  return {
    revokeSession,
    loading: loading || mutationLoading,
    error,
  };
}

/**
 * Hook for logging out from all devices
 * 
 * Logs the user out from all active sessions across all devices.
 * This is useful for security purposes when a user suspects unauthorized access.
 * 
 * @example
 * ```tsx
 * function SecuritySettings() {
 *   const { logoutAllDevices, loading, error } = useLogoutAllDevices();
 *   
 *   const handleLogoutAll = async () => {
 *     if (confirm('Are you sure you want to logout from all devices? You will need to login again.')) {
 *       try {
 *         await logoutAllDevices();
 *         // User will be redirected to login page
 *       } catch (err) {
 *         // Error is already set in hook state
 *       }
 *     }
 *   };
 *   
 *   return (
 *     <div>
 *       <h2>Security</h2>
 *       {error && <div className="error">{error.message}</div>}
 *       <p>Logout from all devices to revoke access everywhere.</p>
 *       <button onClick={handleLogoutAll} disabled={loading}>
 *         {loading ? 'Logging out...' : 'Logout All Devices'}
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLogoutAllDevices(): UseLogoutAllDevicesReturn {
  const { logoutAllDevices: authLogoutAllDevices } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const logoutAllDevices = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await authLogoutAllDevices();
    } catch (err) {
      const formattedError = formatError(err);
      setError(formattedError);
      throw formattedError;
    } finally {
      setLoading(false);
    }
  }, [authLogoutAllDevices]);

  return {
    logoutAllDevices,
    loading,
    error,
  };
}
