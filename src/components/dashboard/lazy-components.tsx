/**
 * Lazy Loaded Dashboard Components
 * 
 * Heavy components that are lazy loaded for better performance.
 * These components are only loaded when needed.
 * 
 * Components:
 * - AuditLogsTable: Heavy audit logs table with filtering
 * - BusinessRulesManager: Complex business rules management UI
 * - PermissionHistoryViewer: Permission history with timeline
 * - SessionsManager: Active sessions management
 * 
 * Requirements: 12.6
 */

import {
  lazyLoad,
  TableSkeletonFallback,
  CardSkeletonFallback,
} from '@/lib/utils/lazy-load';

/**
 * Lazy loaded Audit Logs Table
 * Heavy component with filtering, sorting, and pagination
 * 
 * Requirements: 12.6
 */
export const LazyAuditLogsTable = lazyLoad(
  () => import('./audit-logs/audit-logs-table').catch(() => ({
    default: () => <div>Failed to load Audit Logs</div>,
  })),
  <TableSkeletonFallback />
);

/**
 * Lazy loaded Business Rules Manager
 * Complex UI for managing business rules
 * 
 * Requirements: 12.6
 */
export const LazyBusinessRulesManager = lazyLoad(
  () => import('./business-rules/business-rules-manager').catch(() => ({
    default: () => <div>Failed to load Business Rules Manager</div>,
  })),
  <CardSkeletonFallback />
);

/**
 * Lazy loaded Permission History Viewer
 * Timeline view of permission changes
 * 
 * Requirements: 12.6
 */
export const LazyPermissionHistoryViewer = lazyLoad(
  () => import('./permissions/permission-history-viewer').catch(() => ({
    default: () => <div>Failed to load Permission History</div>,
  })),
  <TableSkeletonFallback />
);

/**
 * Lazy loaded Sessions Manager
 * Active sessions management with revoke capabilities
 * 
 * Requirements: 12.6
 */
export const LazySessionsManager = lazyLoad(
  () => import('./sessions/sessions-manager').catch(() => ({
    default: () => <div>Failed to load Sessions Manager</div>,
  })),
  <CardSkeletonFallback />
);

/**
 * Lazy loaded User Details Panel
 * Detailed user information with edit capabilities
 * 
 * Requirements: 12.6
 */
export const LazyUserDetailsPanel = lazyLoad(
  () => import('./users/user-details-panel').catch(() => ({
    default: () => <div>Failed to load User Details</div>,
  })),
  <CardSkeletonFallback />
);

/**
 * Lazy loaded Organization Settings
 * Complex organization settings UI
 * 
 * Requirements: 12.6
 */
export const LazyOrganizationSettings = lazyLoad(
  () => import('./settings/organization-settings').catch(() => ({
    default: () => <div>Failed to load Organization Settings</div>,
  })),
  <CardSkeletonFallback />
);
