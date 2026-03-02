import { gql } from '@apollo/client';

/**
 * Subscription: OnSessionRevoked
 * 
 * Subscribe to session revocation events.
 * Triggers when a user's session is revoked (logout, admin action, security event).
 * 
 * Features:
 * - Real-time session revocation notifications
 * - Multi-tab logout synchronization
 * - Security event handling
 * - Forced logout on session revocation
 * 
 * Use Cases:
 * - Force logout when admin revokes session
 * - Sync logout across multiple browser tabs
 * - Handle security events (password change, suspicious activity)
 * - Implement "logout everywhere" functionality
 * 
 * Requirements: 5.2
 * 
 * @example
 * ```typescript
 * const { data, loading, error } = useSubscription({
 *   query: ON_SESSION_REVOKED,
 *   variables: { userId: currentUser.id },
 *   onData: (data) => {
 *     const revocation = data.onSessionRevoked;
 *     
 *     console.log('Session revoked:', revocation.reason);
 *     
 *     // Clear tokens and redirect to login
 *     tokenManager.clearTokens();
 *     
 *     // Broadcast to other tabs
 *     sessionManager.broadcastEvent('logout');
 *     
 *     // Redirect with reason
 *     window.location.href = `/login?reason=${revocation.reason}`;
 *   },
 * });
 * ```
 */
export const ON_SESSION_REVOKED = gql`
  subscription OnSessionRevoked($userId: String, $sessionId: String) {
    onSessionRevoked(userId: $userId, sessionId: $sessionId) {
      userId
      sessionId
      reason
      revokedAt
      revokedBy
      affectedSessions
      message
    }
  }
`;
