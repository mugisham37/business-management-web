import { useState, useEffect } from 'react';
import { sessionsApi } from '@/lib/api/services/sessions.api';
import { Session } from '@/types/session';
import { SessionResponse } from '@/types/api/responses';
import { useApi } from './useApi';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { execute: fetchSessions, isLoading } = useApi(sessionsApi.getAll);
  const { execute: deleteSession } = useApi(sessionsApi.delete);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      // Transform SessionResponse[] to Session[] by adding isCurrent field
      // Note: Backend should ideally provide isCurrent, but we'll set it to false for now
      const transformedSessions: Session[] = data.map((session: SessionResponse) => ({
        ...session,
        lastActivity: new Date(session.lastActivity),
        createdAt: new Date(session.createdAt),
        expiresAt: new Date(session.expiresAt),
        isCurrent: false, // Backend should provide this
      }));
      setSessions(transformedSessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      await loadSessions();
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    sessions,
    isLoading,
    refreshSessions: loadSessions,
    revokeSession,
  };
}
