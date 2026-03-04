/**
 * useAuditLogs Hook
 * 
 * React hook for audit log queries.
 * Provides access to audit log data with pagination support.
 * 
 * Features:
 * - Fetch user audit logs
 * - Fetch organization audit logs
 * - Fetch resource audit logs
 * - Pagination support
 * - Centralized error handling
 * 
 * Requirements: 3.7, 3.10
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@apollo/client';
import type { ApolloError } from '@apollo/client';
import {
  GET_USER_AUDIT_LOGS,
  GET_ORGANIZATION_AUDIT_LOGS,
  GET_RESOURCE_AUDIT_LOGS,
} from '@/graphql/queries/audit-logs';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';

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
  changes: Record<string, any>;
  metadata: Record<string, any>;
  timestamp: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Audit logs response
 */
export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Hook return type
 * Requirements: 3.10
 */
export interface UseAuditLogsReturn {
  // Query data
  userAuditLogs: AuditLogsResponse | undefined;
  organizationAuditLogs: AuditLogsResponse | undefined;
  resourceAuditLogs: AuditLogsResponse | undefined;
  
  // Loading states
  loading: boolean;
  userLogsLoading: boolean;
  organizationLogsLoading: boolean;
  resourceLogsLoading: boolean;
  
  // Error state
  error: AppError | null;
  
  // Operations
  getUserAuditLogs: (userId: string, params?: PaginationParams) => Promise<void>;
  getOrganizationAuditLogs: (params?: PaginationParams) => Promise<void>;
  getResourceAuditLogs: (resourceType: string, resourceId: string, params?: PaginationParams) => Promise<void>;
  refetchUserLogs: () => Promise<void>;
  refetchOrganizationLogs: () => Promise<void>;
  refetchResourceLogs: () => Promise<void>;
}

/**
 * useAuditLogs Hook
 * 
 * @param userId - Optional user ID to fetch user audit logs
 * @param resourceType - Optional resource type for resource audit logs
 * @param resourceId - Optional resource ID for resource audit logs
 * @returns Audit log queries and data
 * 
 * Requirements: 3.7, 3.10
 */
export function useAuditLogs(
  userId?: string,
  resourceType?: string,
  resourceId?: string
): UseAuditLogsReturn {
  const [error, setError] = useState<AppError | null>(null);

  // Query for user audit logs
  const {
    data: userLogsData,
    loading: userLogsLoading,
    error: userLogsError,
    refetch: refetchUserLogsList,
  } = useQuery(GET_USER_AUDIT_LOGS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

  // Query for organization audit logs
  const {
    data: organizationLogsData,
    loading: organizationLogsLoading,
    error: organizationLogsError,
    refetch: refetchOrganizationLogsList,
  } = useQuery(GET_ORGANIZATION_AUDIT_LOGS, {
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

  // Query for resource audit logs
  const {
    data: resourceLogsData,
    loading: resourceLogsLoading,
    error: resourceLogsError,
    refetch: refetchResourceLogsList,
  } = useQuery(GET_RESOURCE_AUDIT_LOGS, {
    variables: { resourceType, resourceId },
    skip: !resourceType || !resourceId,
    fetchPolicy: 'cache-first',
    onError: (err: ApolloError) => {
      const appError = errorHandler.handle(err);
      setError(appError);
    },
  });

  /**
   * Fetch user audit logs with pagination
   * Requirements: 3.7
   */
  const getUserAuditLogs = useCallback(
    async (userId: string, params?: PaginationParams): Promise<void> => {
      setError(null);
      try {
        await refetchUserLogsList({ userId, ...params });
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      }
    },
    [refetchUserLogsList]
  );

  /**
   * Fetch organization audit logs with pagination
   * Requirements: 3.7
   */
  const getOrganizationAuditLogs = useCallback(
    async (params?: PaginationParams): Promise<void> => {
      setError(null);
      try {
        await refetchOrganizationLogsList(params);
      } catch (err) {
        const appError = errorHandler.handle(err);
        setError(appError);
        throw appError;
      }
    },
    [refetchOrganizationLogsList]
  );

  /**
   * Fetch resource audit logs with pagination
   * Requirements: 3.7
   */
  const getResourceAuditLogs = useCallback(
    async (
      resourceType: string,
      resourceId: string,
      params?: PaginationParams
    ): Promise<void> => {
      setError(null);
      try {
        await refetchResourceLogsList({ resourceType, resourceId, ...params });
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
    setError(null);
    try {
      await refetchOrganizationLogsList();
    } catch (err) {
      const appError = errorHandler.handle(err);
      setError(appError);
      throw appError;
    }
  }, [refetchOrganizationLogsList]);

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
    userAuditLogs: userLogsData?.getUserAuditLogs,
    organizationAuditLogs: organizationLogsData?.getOrganizationAuditLogs,
    resourceAuditLogs: resourceLogsData?.getResourceAuditLogs,
    
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
