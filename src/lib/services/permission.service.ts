/**
 * PermissionService
 * 
 * Handles all permission management operations including granting and revoking
 * permissions, and fetching permission data and history.
 * 
 * Features:
 * - Request/response transformation
 * - Centralized error handling
 * - Cache updates after mutations
 * - Permission history tracking
 * 
 * Requirements: 4.3, 4.8, 4.9, 4.10
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GRANT_PERMISSIONS,
  REVOKE_PERMISSIONS,
} from '@/graphql/mutations/permissions';
import {
  GET_USER_PERMISSIONS,
  GET_PERMISSION_HISTORY,
} from '@/graphql/queries/permissions';
import { errorHandler } from '@/lib/errors/error-handler';
import {
  updateUserPermissionsCache,
  UserPermissions,
} from '@/lib/cache/cache-updaters';

/**
 * Input types for permission operations
 */
export interface GrantPermissionsInput {
  userId: string;
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
}

export interface RevokePermissionsInput {
  userId: string;
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
}

/**
 * Response types for permission operations
 */
export interface PermissionModule {
  module: string;
  actions: string[];
}

export interface UserPermissionsResponse {
  userId: string;
  fingerprint: string;
  permissions: PermissionModule[];
}

export interface PermissionSnapshot {
  id: string;
  userId: string;
  reason: string;
  snapshotData: unknown;
  fingerprintHash: string;
  createdAt: string;
}

export interface PermissionHistoryResponse {
  userId: string;
  total: number;
  snapshots: PermissionSnapshot[];
}

/**
 * PermissionService class
 * Provides methods for all permission management operations
 */
export class PermissionService {
  constructor(
    private apolloClient: ApolloClient<NormalizedCacheObject>
  ) {}

  /**
   * Grant permissions to a user
   * Adds new permissions to the user's permission set
   * 
   * @param input - Permissions to grant
   * @returns Success boolean
   * @throws AppError on failure
   * 
   * Requirements: 4.3, 4.8, 4.9, 4.10
   */
  async grantPermissions(input: GrantPermissionsInput): Promise<boolean> {
    try {
      // Transform input (Requirements: 4.8)
      const transformedInput = this.transformPermissionsInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: GRANT_PERMISSIONS,
        variables: { input: transformedInput },
        // Refetch user permissions after granting
        refetchQueries: [
          {
            query: GET_USER_PERMISSIONS,
            variables: { userId: input.userId },
          },
        ],
      });


      return data?.grantPermissions ?? false;
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Revoke permissions from a user
   * Removes specified permissions from the user's permission set
   * 
   * @param input - Permissions to revoke
   * @returns Success boolean
   * @throws AppError on failure
   * 
   * Requirements: 4.3, 4.8, 4.9, 4.10
   */
  async revokePermissions(input: RevokePermissionsInput): Promise<boolean> {
    try {
      const transformedInput = this.transformPermissionsInput(input);

      const { data } = await this.apolloClient.mutate({
        mutation: REVOKE_PERMISSIONS,
        variables: { input: transformedInput },
        // Refetch user permissions after revoking
        refetchQueries: [
          {
            query: GET_USER_PERMISSIONS,
            variables: { userId: input.userId },
          },
        ],
      });


      return data?.revokePermissions ?? false;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get user permissions
   * Fetches the current permission set for a user
   * 
   * @param userId - ID of user to fetch permissions for
   * @returns User permissions with fingerprint
   * @throws AppError on failure
   * 
   * Requirements: 4.3, 4.9, 4.10
   */
  async getUserPermissions(userId: string): Promise<UserPermissionsResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_USER_PERMISSIONS,
        variables: { userId },
        fetchPolicy: 'cache-first',
      });


      if (!data?.getUserPermissions) {
        throw new Error('No permissions data returned');
      }

      // Transform response (Requirements: 4.9)
      return this.transformUserPermissionsResponse(data.getUserPermissions);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Get permission history for a user
   * Fetches historical snapshots of permission changes
   * 
   * @param userId - ID of user to fetch permission history for
   * @returns Permission history with snapshots
   * @throws AppError on failure
   * 
   * Requirements: 4.3, 4.9, 4.10
   */
  async getPermissionHistory(userId: string): Promise<PermissionHistoryResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_PERMISSION_HISTORY,
        variables: { userId },
        fetchPolicy: 'network-only', // Always fetch fresh history
      });


      if (!data?.getPermissionHistory) {
        throw new Error('No permission history data returned');
      }

      return this.transformPermissionHistoryResponse(data.getPermissionHistory);
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Transform permissions input to GraphQL format
   * Validates and normalizes permission data
   * Requirements: 4.8
   */
  private transformPermissionsInput(
    input: GrantPermissionsInput | RevokePermissionsInput
  ): GrantPermissionsInput | RevokePermissionsInput {
    return {
      userId: input.userId,
      permissions: input.permissions.map(perm => ({
        module: perm.module.trim().toUpperCase(),
        actions: perm.actions.map(action => action.trim().toUpperCase()),
      })),
    };
  }

  /**
   * Transform user permissions response to application format
   * Requirements: 4.9
   */
  private transformUserPermissionsResponse(data: Record<string, unknown>): UserPermissionsResponse {
    return {
      userId: data.userId as string,
      fingerprint: data.fingerprint as string,
      permissions: (data.permissions as Record<string, unknown>[]).map((perm: Record<string, unknown>) => ({
        module: perm.module as string,
        actions: perm.actions as string[],
      })),
    };
  }

  /**
   * Transform permission history response to application format
   * Requirements: 4.9
   */
  private transformPermissionHistoryResponse(data: Record<string, unknown>): PermissionHistoryResponse {
    return {
      userId: data.userId as string,
      total: data.total as number,
      snapshots: (data.snapshots as Record<string, unknown>[]).map((snapshot: Record<string, unknown>) => ({
        id: snapshot.id as string,
        userId: snapshot.userId as string,
        reason: snapshot.reason as string,
        snapshotData: snapshot.snapshotData as unknown,
        fingerprintHash: snapshot.fingerprintHash as string,
        createdAt: snapshot.createdAt as string,
      })),
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let permissionServiceInstance: PermissionService | null = null;

export const getPermissionService = async (): Promise<PermissionService> => {
  if (!permissionServiceInstance) {
    const { apolloClient } = await import('@/lib/api/apollo-client');
    permissionServiceInstance = new PermissionService(apolloClient);
  }
  return permissionServiceInstance;
};
