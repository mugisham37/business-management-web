/**
 * useAuditLogs Hook
 * 
 * React hook for audit log queries.
 * Provides access to audit log data with server-side pagination support.
 * 
 * Features:
 * - Fetch user audit logs
 * - Fetch organization audit logs
 * - Fetch resource audit logs
 * - Server-side pagination support (limit/offset)
 * - Centralized error handling
 * 
 * Requirements: 3.7, 3.10, 12.1
 */

import { useState, useCallback } from 'react';
import { useQuery as useApolloQuery } from '@apollo/client/react';

import {
  GET_USER_AUDIT_LOGS,
  GET_ORGANIZATION_AUDIT_LOGS,
  GET_RESOURCE_AUDIT_LOGS,
} from '@/graphql/queries/audit-logs';
import type {
  GetUserAuditLogsData,
  GetOrganizationAuditLogsData,
  GetResourceAuditLogsData,
} from '@/graphql/types/operations';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';
import type { PaginationParams, PaginationInfo } from '@/lib/types/pagination.types';
import { calculatePaginationInfo } from '@/lib/types/pagination.types';

// Re-export for convenience
export type { PaginationParams };

/**
 * Audit log type
 */
export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, unknown>;
  metadata: Record<string, unknown>;
  timestamp: string;
}

/**
 * Audit filters input (matches backend AuditFiltersInput)
 * Requirements: 12.1
 */
export interface AuditFilters {
  limit?: number;
  offset?: number;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Audit logs response
 */
export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

/**
 * Hook return type
 * Requirements: 3.10, 12.1
 */
export interface UseAuditLogsReturn {
  // Query data
  userAuditLogs: AuditLogsResponse | undefined;
  organizationAuditLogs: AuditLogsResponse | undefined;
  resourceAuditLogs: AuditLogsResponse | undefined;
  
  // Pagination info
  userLogsPagination: PaginationInfo | undefined;
  organizationLogsPagination: PaginationInfo | undefined;
  resourceLogsPagination: PaginationInfo | undefined;
  
  // Loading states
  loading: boolean;
  userLogsLoading: boolean;
  organizationLogsLoading: boolean;
  resourceLogsLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations with pagination
  getUserAuditLogs: (userId: string, filters?: AuditFilters) => Promise<void>;
  getOrganizationAuditLogs: (organizationId: string, filters?: AuditFilters) => Promise<void>;
  getResourceAuditLogs: (resourceType: string, resourceId: string, filters?: AuditFilters) => Promise<void>;
  refetchUserLogs: () => Promise<void>;
  refetchOrganizationLogs: () => Promise<void>;
  refetchResourceLogs: () => Promise<void>;
}

/**
 * useAuditLogs Hook
 * 
 * @param userId - Optional user ID to fetch user audit logs
 * @param organizationId - Optional organization ID to fetch organization audit logs
 * @param resourceType - Optional resource type for resource audit logs
 * @param resourceId - Optional resource ID for resource audit logs
 * @param initialFilters - Optional initial filters including pagination
 * @returns Audit log queries and data
 * 
 * Requirements: 3.7, 3.10, 12.1
 */
export function useAuditLogs(
  userId?: string,
  organizationId?: string,
  resourceType?: string,
  resourceId?: string,
  initialFilters?: AuditFilters
): UseAuditLogsReturn {
  const [error, setError] = useState<AppError | null>(null);
  const [userFilters, setUserFilters] = useState<AuditFilters>(initialFilters || { limit: 100, offset: 0 });
  const [orgFilters, setOrgFilters] = useState<AuditFilters>(initialFilters || { limit: 100, offset: 0 });
  const [resourceFilters, setResourceFilters] = useState<AuditFilters>(initialFilters || { limit: 100, offset: 0 });

  // Query for user audit logs (Requirements: 12.1)
  const {
    data: userLogsData,
    loading: userLogsLoading,
    error: userLogsError,
    refetch: refetchUserLogsList,
  } = useApolloQuery<GetUserAuditLogsData>(GET_USER_AUDIT_LOGS, {
    variables: { userId, filters: userFilters },
    skip: !userId,
    fetchPolicy: 'cache-first',
  });

  // Query for organization audit logs (Requirements: 12.1)
  const {
    data: organizationLogsData,
    loading: organizationLogsLoading,
    error: organizationLogsError,
    refetch: refetchOrganizationLogsList,
  } = useApolloQuery<GetOrganizationAuditLogsData>(GET_ORGANIZATION_AUDIT_LOGS, {
    variables: { organizationId, filters: orgFilters },
    skip: !organizationId,
    fetchPolicy: 'cache-first',
  });

  // Query for resource audit logs
  const {
    data: resourceLogsData,
    loading: resourceLogsLoading,
    error: resourceLogsError,
    refetch: refetchResourceLogsList,
  } = useApolloQuery<GetResourceAuditLogsData>(GET_RESOURCE_AUDIT_LOGS, {
    variables: { resourceType, resourceId },
    skip: !resourceType || !resourceId,
    fetchPolicy: 'cache-first',
  });

  // Handle query errors
  if (userLogsError && !error) {
    setError(errorHandler.handle(userLogsError));
  }
  if (organizationLogsError && !error) {
    setError(errorHandler.handle(organizationLogsError));
  }
  if (resourceLogsError && !error) {
    setError(errorHandler.handle(resourceLogsError));
  }

  // Calculate pagination info for each query (Requirements: 12.1)
  const userLogsPagination = userLogsData?.getUserAuditLogs
    ? calculatePaginationInfo(
        userLogsData.getUserAuditLogs.total,
        Math.floor((userFilters.offset || 0) / (userFilters.limit || 100)) + 1,
        userFilters.limit || 100
      )
    : undefined;

  const organizationLogsPagination = organizationLogsData?.getOrganizationAuditLogs
    ? calculatePaginationInfo(
        organizationLogsData.getOrganizationAuditLogs.total,
        Math.floor((orgFilters.offset || 0) / (orgFilters.limit || 100)) + 1,
        orgFilters.limit || 100
      )
    : undefined;

  const resourceLogsPagination = resourceLogsData?.getResourceAuditLogs
    ? calculatePaginationInfo(
        resourceLogsData.getResourceAuditLogs.total,
        Math.floor((resourceFilters.offset || 0) / (resourceFilters.limit || 100)) + 1,
        resourceFilters.limit || 100
      )
    : undefined;

  /**
   * Fetch user audit logs with pagination
   * Requirements: 3.7, 12.1
   */
  const getUserAuditLogs = useCallback(
    async (userId: string, filters?: AuditFilters): Promise<void> => {
      setError(null);
      if (filters) {
        setUserFilters(filters);
      }
      try {
        await refetchUserLogsList({ userId, filters: filters || userFilters });
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      }
    },
    [refetchUserLogsList, userFilters]
  );

  /**
   * Fetch organization audit logs with pagination
   * Requirements: 3.7, 12.1
   */
  const getOrganizationAuditLogs = useCallback(
    async (organizationId: string, filters?: AuditFilters): Promise<void> => {
      setError(null);
      if (filters) {
        setOrgFilters(filters);
      }
      try {
        await refetchOrganizationLogsList({ organizationId, filters: filters || orgFilters });
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      }
    },
    [refetchOrganizationLogsList, orgFilters]
  );

  /**
   * Fetch resource audit logs
   * Requirements: 3.7
   */
  const getResourceAuditLogs = useCallback(
    async (
      resourceType: string,
      resourceId: string,
      filters?: AuditFilters
    ): Promise<void> => {
      setError(null);
      if (filters) {
        setResourceFilters(filters);
      }
      try {
        await refetchResourceLogsList({ resourceType, resourceId });
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      }
    },
    [refetchResourceLogsList]
  );

  /**
   * Refetch user audit logs
   * Requirements: 3.7
   */
  const refetchUserLogs = useCallback(async (): Promise<void> => {
    if (!userId) return;
    
    setError(null);
    try {
      await refetchUserLogsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [userId, refetchUserLogsList]);

  /**
   * Refetch organization audit logs
   * Requirements: 3.7
   */
  const refetchOrganizationLogs = useCallback(async (): Promise<void> => {
    if (!organizationId) return;
    
    setError(null);
    try {
      await refetchOrganizationLogsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [organizationId, refetchOrganizationLogsList]);

  /**
   * Refetch resource audit logs
   * Requirements: 3.7
   */
  const refetchResourceLogs = useCallback(async (): Promise<void> => {
    if (!resourceType || !resourceId) return;
    
    setError(null);
    try {
      await refetchResourceLogsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [resourceType, resourceId, refetchResourceLogsList]);

  // Combine loading states
  const loading = userLogsLoading || organizationLogsLoading || resourceLogsLoading;

  // Handle query errors
  if (userLogsError && !error) {
    setError(errorHandler.handle(userLogsError));
  }
  if (organizationLogsError && !error) {
    setError(errorHandler.handle(organizationLogsError));
  }
  if (resourceLogsError && !error) {
    setError(errorHandler.handle(resourceLogsError));
  }

  return {
    // Data
    userAuditLogs: userLogsData?.getUserAuditLogs as AuditLogsResponse | undefined,
    organizationAuditLogs: organizationLogsData?.getOrganizationAuditLogs as AuditLogsResponse | undefined,
    resourceAuditLogs: resourceLogsData?.getResourceAuditLogs as AuditLogsResponse | undefined,
    
    // Pagination info
    userLogsPagination,
    organizationLogsPagination,
    resourceLogsPagination,
    
    // Loading states
    loading,
    userLogsLoading,
    organizationLogsLoading,
    resourceLogsLoading,
    
    // Error state
    error,
    
    // Operations
    getUserAuditLogs,
    getOrganizationAuditLogs,
    getResourceAuditLogs,
    refetchUserLogs,
    refetchOrganizationLogs,
    refetchResourceLogs,
  };
}
