/**
 * AuditService
 * 
 * Handles all audit log query operations for tracking user actions,
 * organization activities, and resource changes.
 * 
 * Features:
 * - User audit logs
 * - Organization audit logs
 * - Resource audit logs
 * - Response transformation
 * - Centralized error handling
 * 
 * Requirements: 4.6, 4.9, 4.10
 */

import { ApolloClient } from '@apollo/client';
import {
  GET_USER_AUDIT_LOGS,
  GET_ORGANIZATION_AUDIT_LOGS,
  GET_RESOURCE_AUDIT_LOGS,
} from '@/graphql/queries/audit-logs';
import { errorHandler } from '@/lib/errors/error-handler';
import { AppError } from '@/lib/errors/error-types';
import { AuditLog } from '@/lib/cache/cache-updaters';

/**
 * Input types for audit log operations
 */
export interface AuditFiltersInput {
  startDate?: string;
  endDate?: string;
  action?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response types for audit log operations
 */
export interface AuditLogsResponse {
  logs: AuditLog[];
  total: number;
}

/**
 * AuditService class
 * Provides methods for querying audit logs
 */
export class AuditService {
  constructor(
    private apolloClient: ApolloClient
  ) {}

  /**
   * Get audit logs for a specific user
   * Fetches all actions performed by or on a user
   * 
   * @param userId - ID of user to fetch audit logs for
   * @param filters - Optional filters for date range, action type, pagination
   * @returns List of audit logs with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.6, 4.9, 4.10
   */
  async getUserAuditLogs(
    userId: string,
    filters?: AuditFiltersInput
  ): Promise<AuditLogsResponse> {
    try {
      const { data, errors } = await this.apolloClient.query({
        query: GET_USER_AUDIT_LOGS,
        variables: { userId, filters },
        fetchPolicy: 'network-only', // Always fetch fresh audit logs
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.getUserAuditLogs) {
        throw new Error('No audit logs data returned');
      }

      // Transform response (Requirements: 4.9)
      return this.transformAuditLogsResponse(data.getUserAuditLogs);
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get audit logs for an organization
   * Fetches all actions performed within an organization
   * 
   * @param organizationId - ID of organization to fetch audit logs for
   * @param filters - Optional filters for date range, action type, pagination
   * @returns List of audit logs with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.6, 4.9, 4.10
   */
  async getOrganizationAuditLogs(
    organizationId: string,
    filters?: AuditFiltersInput
  ): Promise<AuditLogsResponse> {
    try {
      const { data, errors } = await this.apolloClient.query({
        query: GET_ORGANIZATION_AUDIT_LOGS,
        variables: { organizationId, filters },
        fetchPolicy: 'network-only',
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.getOrganizationAuditLogs) {
        throw new Error('No audit logs data returned');
      }

      return this.transformAuditLogsResponse(data.getOrganizationAuditLogs);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get audit logs for a specific resource
   * Fetches all actions performed on a specific resource
   * 
   * @param resourceId - ID of resource to fetch audit logs for
   * @param resourceType - Type of resource (e.g., 'USER', 'BRANCH', 'DEPARTMENT')
   * @returns List of audit logs with total count
   * @throws AppError on failure
   * 
   * Requirements: 4.6, 4.9, 4.10
   */
  async getResourceAuditLogs(
    resourceId: string,
    resourceType: string
  ): Promise<AuditLogsResponse> {
    try {
      const { data, errors } = await this.apolloClient.query({
        query: GET_RESOURCE_AUDIT_LOGS,
        variables: { resourceId, resourceType: resourceType.toUpperCase() },
        fetchPolicy: 'network-only',
      });

      if (errors && errors.length > 0) {
        throw errors[0];
      }

      if (!data?.getResourceAuditLogs) {
        throw new Error('No audit logs data returned');
      }

      return this.transformAuditLogsResponse(data.getResourceAuditLogs);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Transform audit logs response to application format
   * Requirements: 4.9
   */
  private transformAuditLogsResponse(data: any): AuditLogsResponse {
    return {
      logs: data.logs.map((log: any) => this.transformAuditLogResponse(log)),
      total: data.total,
    };
  }

  /**
   * Transform single audit log response to application format
   * Requirements: 4.9
   */
  private transformAuditLogResponse(data: any): AuditLog {
    return {
      __typename: data.__typename || 'AuditLog',
      id: data.id,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      changes: data.changes,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      timestamp: data.timestamp,
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let auditServiceInstance: AuditService | null = null;

export const getAuditService = (): AuditService => {
  if (!auditServiceInstance) {
    const { apolloClient } = require('@/lib/api/apollo-client');
    auditServiceInstance = new AuditService(apolloClient);
  }
  return auditServiceInstance;
};

export const auditService = getAuditService();
