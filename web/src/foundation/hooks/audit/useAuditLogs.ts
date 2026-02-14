/**
 * Audit Logging Hooks
 * 
 * Provides React hooks for fetching audit logs with pagination, filtering, and sorting.
 * Wraps generated GraphQL query hooks with formatted errors and convenient return values.
 */

import {
  useAuditLogsQuery,
  type AuditLogFilters,
  type AuditLog,
} from '@/foundation/types/generated/graphql';
import { formatError } from '@/foundation/utils/errors';

/**
 * Formatted audit log with human-readable action description
 */
export interface FormattedAuditLog extends AuditLog {
  formattedAction: string;
  formattedTimestamp: string;
}

/**
 * Format audit log action for display
 * 
 * Converts action codes to human-readable descriptions
 * 
 * @param action - Action code from backend
 * @returns Human-readable action description
 */
function formatAuditLogAction(action: string): string {
  const actionMap: Record<string, string> = {
    'user.created': 'User Created',
    'user.updated': 'User Updated',
    'user.deleted': 'User Deleted',
    'user.login': 'User Login',
    'user.logout': 'User Logout',
    'user.password_changed': 'Password Changed',
    'user.mfa_enabled': 'MFA Enabled',
    'user.mfa_disabled': 'MFA Disabled',
    'permission.assigned': 'Permission Assigned',
    'permission.revoked': 'Permission Revoked',
    'branch.created': 'Branch Created',
    'branch.updated': 'Branch Updated',
    'branch.assigned': 'Branch Assigned',
    'department.created': 'Department Created',
    'department.updated': 'Department Updated',
    'department.assigned': 'Department Assigned',
    'organization.created': 'Organization Created',
    'organization.updated': 'Organization Updated',
  };

  return actionMap[action] || action;
}

/**
 * Format timestamp for display
 * 
 * Converts ISO timestamp to human-readable format
 * 
 * @param timestamp - ISO timestamp string
 * @returns Formatted timestamp
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

/**
 * Format audit log data for display
 * 
 * @param auditLog - Raw audit log from backend
 * @returns Formatted audit log with human-readable fields
 */
function formatAuditLog(auditLog: AuditLog): FormattedAuditLog {
  return {
    ...auditLog,
    formattedAction: formatAuditLogAction(auditLog.action),
    formattedTimestamp: formatTimestamp(auditLog.createdAt),
  };
}

/**
 * Hook to fetch audit logs with pagination, filtering, and sorting
 * 
 * Supports filtering by:
 * - Date range (startDate, endDate)
 * - User ID (userId)
 * - Action type (action)
 * - Entity type (entityType)
 * 
 * @param filters - Optional filters for audit logs
 * @returns Array of formatted audit logs, loading state, error, and refetch function
 * 
 * @example
 * ```tsx
 * // Fetch all audit logs
 * const { auditLogs, loading, error } = useAuditLogs();
 * 
 * // Fetch audit logs with filters
 * const { auditLogs, loading, error } = useAuditLogs({
 *   userId: 'user-123',
 *   action: 'user.login',
 *   startDate: '2024-01-01',
 *   endDate: '2024-12-31',
 * });
 * ```
 */
export function useAuditLogs(filters?: AuditLogFilters) {
  const { data, loading, error, refetch } = useAuditLogsQuery({
    variables: { filters },
    fetchPolicy: 'cache-and-network',
  });

  // Format audit logs for display
  const formattedAuditLogs = data?.auditLogs.map(formatAuditLog) ?? [];

  return {
    auditLogs: formattedAuditLogs,
    loading,
    error: error ? formatError(error) : null,
    refetch,
  };
}
