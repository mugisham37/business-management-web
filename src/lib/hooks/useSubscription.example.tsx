/**
 * useSubscription Hook - Usage Examples
 * 
 * This file demonstrates various usage patterns for the useSubscription hook.
 * 
 * Requirements: 5.2
 */

import React from 'react';
import { useSubscription } from './useSubscription';
import { 
  ON_AUDIT_LOG_CREATED, 
  ON_PERMISSION_CHANGED, 
  ON_SESSION_REVOKED 
} from '@/graphql/subscriptions';
import { tokenManager } from '@/lib/auth/token-manager';
import { sessionManager } from '@/lib/auth/session-manager';
import { permissionChecker } from '@/lib/auth/permission-checker';

// Subscription data types matching GraphQL schema
interface AuditLogSubscriptionData {
  auditLogCreated: {
    id: string;
    action: string;
    resourceType: string;
    result: string;
    createdAt: string;
  };
}

interface PermissionChangedData {
  onPermissionChanged: {
    userId: string;
    permissions: { module: string; actions: string[] }[];
    fingerprint: string;
    fingerprintChanged: boolean;
    reason: string;
    changedAt: string;
    changedBy: string;
  };
}

interface SessionRevokedData {
  onSessionRevoked: {
    userId: string;
    sessionId: string;
    reason: string;
    revokedAt: string;
    revokedBy: string;
    affectedSessions: string[];
    message: string;
  };
}

/**
 * Example 1: Basic Audit Log Subscription
 * 
 * Subscribe to new audit logs and display them in real-time.
 */
export function AuditLogMonitor({ userId }: { userId: string }) {
  const { data, loading, error } = useSubscription<AuditLogSubscriptionData>({
    query: ON_AUDIT_LOG_CREATED,
    variables: { userId },
  });

  if (loading) {
    return <div>Connecting to audit log stream...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return <div>Waiting for audit logs...</div>;
  }

  const auditLog = data.auditLogCreated;

  return (
    <div className="audit-log-entry">
      <h3>New Audit Log</h3>
      <p>Action: {auditLog.action}</p>
      <p>Resource: {auditLog.resourceType}</p>
      <p>Result: {auditLog.result}</p>
      <p>Time: {new Date(auditLog.createdAt).toLocaleString()}</p>
    </div>
  );
}

/**
 * Example 2: Permission Change Subscription with Callbacks
 * 
 * Subscribe to permission changes and handle them with callbacks.
 * Clears permission cache and optionally refreshes token.
 */
export function PermissionMonitor({ userId }: { userId: string }) {
  const [permissionHistory, setPermissionHistory] = React.useState<{ reason: string; changedAt: string; fingerprintChanged?: boolean }[]>([]);

  const { loading, error } = useSubscription<PermissionChangedData>({
    query: ON_PERMISSION_CHANGED,
    variables: { userId },
    onData: (data) => {
      const change = data.onPermissionChanged;
      
      console.log('Permissions changed:', change.reason);
      
      // Clear permission cache to force re-check
      permissionChecker.clearCache();
      
      // Add to history
      setPermissionHistory(prev => [...prev, change]);
      
      // Show notification
      alert(`Your permissions have been updated: ${change.reason}`);
      
      // If fingerprint changed, refresh token
      if (change.fingerprintChanged) {
        console.log('Permission fingerprint changed, refreshing token...');
        // In a real app, you would call refreshToken() here
      }
    },
    onError: (error) => {
      console.error('Permission subscription error:', error);
    },
  });

  if (loading) {
    return <div>Monitoring permissions...</div>;
  }

  if (error) {
    return <div>Error monitoring permissions: {error.message}</div>;
  }

  return (
    <div className="permission-monitor">
      <h3>Permission Changes</h3>
      {permissionHistory.length === 0 ? (
        <p>No permission changes yet</p>
      ) : (
        <ul>
          {permissionHistory.map((change, index) => (
            <li key={index}>
              {change.reason} at {new Date(change.changedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Example 3: Session Revocation Subscription
 * 
 * Subscribe to session revocations and handle forced logout.
 * Implements multi-tab synchronization.
 */
export function SessionMonitor({ userId }: { userId: string }) {
  useSubscription<SessionRevokedData>({
    query: ON_SESSION_REVOKED,
    variables: { userId },
    onData: (data) => {
      const revocation = data.onSessionRevoked;
      
      console.log('Session revoked:', revocation.reason);
      
      // Clear tokens
      tokenManager.clearTokens();
      
      // Broadcast logout to other tabs
      sessionManager.broadcastEvent('logout');
      
      // Redirect to login with reason
      const reason = encodeURIComponent(revocation.reason);
      window.location.href = `/login?reason=${reason}&message=${encodeURIComponent(revocation.message)}`;
    },
    onError: (error) => {
      console.error('Session subscription error:', error);
    },
  });

  // This component doesn't render anything visible
  // It just monitors for session revocations in the background
  return null;
}

/**
 * Example 4: Conditional Subscription with Skip
 * 
 * Only subscribe when user is authenticated.
 */
export function ConditionalAuditLogMonitor() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Check authentication status
    const token = tokenManager.decodeToken();
    if (token) {
      setIsAuthenticated(true);
      setUserId(token.sub);
    }
  }, []);

  const { data, loading, error } = useSubscription<AuditLogSubscriptionData>({
    query: ON_AUDIT_LOG_CREATED,
    variables: { userId: userId || '' },
    skip: !isAuthenticated || !userId, // Skip if not authenticated
  });

  if (!isAuthenticated) {
    return <div>Please log in to view audit logs</div>;
  }

  if (loading) {
    return <div>Connecting...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      {data ? (
        <div>Latest: {data.auditLogCreated.action}</div>
      ) : (
        <div>Waiting for audit logs...</div>
      )}
    </div>
  );
}

/**
 * Example 5: Multiple Subscriptions in One Component
 * 
 * Subscribe to multiple events simultaneously.
 */
export function MultiSubscriptionMonitor({ userId }: { userId: string }) {
  // Subscribe to audit logs
  const auditLogs = useSubscription<AuditLogSubscriptionData>({
    query: ON_AUDIT_LOG_CREATED,
    variables: { userId },
  });

  // Subscribe to permission changes
  const permissions = useSubscription<PermissionChangedData>({
    query: ON_PERMISSION_CHANGED,
    variables: { userId },
  });

  // Subscribe to session revocations
  const sessions = useSubscription<SessionRevokedData>({
    query: ON_SESSION_REVOKED,
    variables: { userId },
  });

  const isLoading = auditLogs.loading || permissions.loading || sessions.loading;
  const hasError = auditLogs.error || permissions.error || sessions.error;

  if (isLoading) {
    return <div>Connecting to real-time updates...</div>;
  }

  if (hasError) {
    return (
      <div>
        Errors:
        {auditLogs.error && <p>Audit logs: {auditLogs.error.message}</p>}
        {permissions.error && <p>Permissions: {permissions.error.message}</p>}
        {sessions.error && <p>Sessions: {sessions.error.message}</p>}
      </div>
    );
  }

  return (
    <div className="multi-subscription-monitor">
      <h2>Real-Time Monitoring Dashboard</h2>
      
      <section>
        <h3>Latest Audit Log</h3>
        {auditLogs.data ? (
          <p>{auditLogs.data.auditLogCreated.action}</p>
        ) : (
          <p>No audit logs yet</p>
        )}
      </section>

      <section>
        <h3>Permission Status</h3>
        {permissions.data ? (
          <p>Last change: {permissions.data.onPermissionChanged.reason}</p>
        ) : (
          <p>No permission changes</p>
        )}
      </section>

      <section>
        <h3>Session Status</h3>
        <p>Active and monitoring</p>
      </section>
    </div>
  );
}

/**
 * Example 6: Subscription with State Management
 * 
 * Accumulate subscription data over time.
 */
export function AuditLogHistory({ userId }: { userId: string }) {
  const [logs, setLogs] = React.useState<{ id: string; action: string; resourceType: string; result: string; createdAt: string }[]>([]);

  const { loading, error } = useSubscription<AuditLogSubscriptionData>({
    query: ON_AUDIT_LOG_CREATED,
    variables: { userId },
    onData: (data) => {
      // Add new log to the beginning of the array
      setLogs(prev => [data.auditLogCreated, ...prev].slice(0, 50)); // Keep last 50
    },
  });

  if (loading) {
    return <div>Loading audit log stream...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="audit-log-history">
      <h3>Audit Log History (Last 50)</h3>
      {logs.length === 0 ? (
        <p>No audit logs yet. Waiting for new entries...</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={`${log.id}-${index}`}>
              <strong>{log.action}</strong> on {log.resourceType} - {log.result}
              <br />
              <small>{new Date(log.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
