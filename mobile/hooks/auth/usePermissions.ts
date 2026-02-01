/**
 * Mobile Permissions Hook
 * Complete permission management with caching and real-time updates
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useLazyQuery, useMutation, useSubscription, ApolloError } from '@apollo/client';
import {
  GET_MY_PERMISSIONS_QUERY,
  CHECK_PERMISSION_QUERY,
  GET_AVAILABLE_PERMISSIONS_QUERY,
  GET_USER_PERMISSIONS_QUERY,
} from '@/graphql/queries/auth-queries';
import {
  GRANT_PERMISSION_MUTATION,
  REVOKE_PERMISSION_MUTATION,
  ASSIGN_ROLE_MUTATION,
  BULK_GRANT_PERMISSIONS_MUTATION,
  BULK_REVOKE_PERMISSIONS_MUTATION,
} from '@/graphql/mutations/auth-mutations';
import { USER_PERMISSION_EVENTS_SUBSCRIPTION } from '@/graphql/subscriptions/auth-subscriptions';
import { appStorage, STORAGE_KEYS } from '@/lib/storage';
import { useAuth } from './useAuth';

// Internal type definitions for permission data
interface PermissionsQueryData {
  getMyPermissions?: PermissionsResponseData;
}

interface PermissionsResponseData {
  permissions: string[];
  detailedPermissions: Permission[];
}

interface PermissionEvent {
  type: string;
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  grantedBy?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Permission {
  id: string;
  userId: string;
  permission: string;
  resource?: string;
  resourceId?: string;
  grantedBy?: string;
  grantedAt: Date;
  expiresAt?: Date;
  isInherited: boolean;
}

export interface Role {
  name: string;
  permissions: string[];
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  source: 'role' | 'custom' | 'none';
  grantedAt?: Date;
  expiresAt?: Date;
}

export interface PermissionsState {
  permissions: string[];
  detailedPermissions: Permission[];
  availablePermissions: string[];
  roles: Role[];
  isLoading: boolean;
  error: string | null;
  lastUpdated?: Date;
}

export interface UsePermissionsReturn {
  state: PermissionsState;
  
  // Permission checking
  hasPermission: (permission: string, resource?: string, resourceId?: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  checkPermission: (permission: string, resource?: string, resourceId?: string) => Promise<PermissionCheckResult>;
  
  // Permission management (admin only)
  grantPermission: (userId: string, permission: string, resource?: string, resourceId?: string, expiresAt?: Date) => Promise<boolean>;
  revokePermission: (userId: string, permission: string, resource?: string, resourceId?: string) => Promise<boolean>;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  bulkGrantPermissions: (userIds: string[], permissions: string[], resource?: string, resourceId?: string) => Promise<boolean>;
  bulkRevokePermissions: (userIds: string[], permissions: string[], resource?: string, resourceId?: string) => Promise<boolean>;
  
  // Utility functions
  refreshPermissions: () => Promise<void>;
  clearCache: () => Promise<void>;
  getPermissionsByResource: (resource: string) => string[];
  isPermissionExpired: (permission: Permission) => boolean;
}

const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const CACHE_KEY_PREFIX = 'permissions_cache_';

export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth();
  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    detailedPermissions: [],
    availablePermissions: [],
    roles: [],
    isLoading: false,
    error: null,
  });

  // GraphQL operations
  const [getMyPermissions, { loading: loadingMyPermissions }] = useLazyQuery(GET_MY_PERMISSIONS_QUERY, {
    fetchPolicy: 'cache-first',
    onCompleted: (data: PermissionsQueryData) => {
      if (data?.getMyPermissions) {
        updatePermissionsState(data.getMyPermissions);
        cachePermissions(data.getMyPermissions);
      }
    },
    onError: (error: ApolloError) => {
      setState(prev => ({ ...prev, error: error.message }));
    },
  });

  const [checkPermissionQuery] = useLazyQuery(CHECK_PERMISSION_QUERY);
  const [getAvailablePermissions] = useLazyQuery(GET_AVAILABLE_PERMISSIONS_QUERY);

  const [grantPermissionMutation] = useMutation(GRANT_PERMISSION_MUTATION);
  const [revokePermissionMutation] = useMutation(REVOKE_PERMISSION_MUTATION);
  const [assignRoleMutation] = useMutation(ASSIGN_ROLE_MUTATION);
  const [bulkGrantPermissionsMutation] = useMutation(BULK_GRANT_PERMISSIONS_MUTATION);
  const [bulkRevokePermissionsMutation] = useMutation(BULK_REVOKE_PERMISSIONS_MUTATION);

  // Real-time permission updates
  useSubscription(USER_PERMISSION_EVENTS_SUBSCRIPTION, {
    skip: !user?.id,
    onData: ({ data: subscriptionData }: { data: { data?: { userPermissionEvents: PermissionEvent } } }) => {
      if (subscriptionData.data?.userPermissionEvents) {
        const event = subscriptionData.data.userPermissionEvents;
        handlePermissionEvent(event);
      }
    },
  });

  // Load permissions on mount and when user changes
  useEffect(() => {
    if (user?.id) {
      loadPermissions();
    }
  }, [user?.id]);

  const updatePermissionsState = useCallback((permissionsData: PermissionsResponseData) => {
    setState(prev => ({
      ...prev,
      permissions: permissionsData.permissions || [],
      detailedPermissions: permissionsData.detailedPermissions || [],
      lastUpdated: new Date(),
      error: null,
    }));
  }, []);

  const loadPermissions = useCallback(async () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try to load from cache first
      const cached = await loadCachedPermissions();
      if (cached && isCacheValid(cached.timestamp)) {
        updatePermissionsState(cached.data);
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Load from server
      await getMyPermissions();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to load permissions',
        isLoading: false,
      }));
    }
  }, [user?.id, getMyPermissions, updatePermissionsState]);

  const cachePermissions = useCallback(async (permissionsData: any) => {
    if (!user?.id) return;

    try {
      const cacheData = {
        data: permissionsData,
        timestamp: Date.now(),
        userId: user.id,
      };
      await appStorage.setItem(`${CACHE_KEY_PREFIX}${user.id}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache permissions:', error);
    }
  }, [user?.id]);

  const loadCachedPermissions = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const cached = await appStorage.getItem(`${CACHE_KEY_PREFIX}${user.id}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Failed to load cached permissions:', error);
      return null;
    }
  }, [user?.id]);

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < CACHE_TTL;
  }, []);

  const handlePermissionEvent = useCallback((event: any) => {
    // Handle real-time permission updates
    switch (event.type) {
      case 'PERMISSION_GRANTED':
      case 'PERMISSION_REVOKED':
      case 'ROLE_ASSIGNED':
        // Refresh permissions when changes occur
        refreshPermissions();
        break;
    }
  }, []);

  // Permission checking functions
  const hasPermission = useCallback((permission: string, resource?: string, resourceId?: string): boolean => {
    if (!state.permissions.length) return false;

    // Check exact permission
    const exactPermission = resource && resourceId 
      ? `${permission}:${resource}:${resourceId}`
      : resource 
        ? `${permission}:${resource}`
        : permission;

    if (state.permissions.includes(exactPermission)) return true;

    // Check wildcard permissions
    const wildcardChecks = [
      `${permission}:*`,
      resource ? `*:${resource}` : null,
      '*',
    ].filter(Boolean);

    return wildcardChecks.some(wildcard => state.permissions.includes(wildcard!));
  }, [state.permissions]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const checkPermission = useCallback(async (
    permission: string, 
    resource?: string, 
    resourceId?: string
  ): Promise<PermissionCheckResult> => {
    try {
      const result = await checkPermissionQuery({
        variables: {
          input: {
            permission,
            resource,
            resourceId,
          }
        }
      });

      return result.data?.checkPermission || {
        hasPermission: false,
        source: 'none',
      };
    } catch (error) {
      console.error('Permission check failed:', error);
      return {
        hasPermission: false,
        source: 'none',
      };
    }
  }, [checkPermissionQuery]);

  // Permission management functions (admin only)
  const grantPermission = useCallback(async (
    userId: string,
    permission: string,
    resource?: string,
    resourceId?: string,
    expiresAt?: Date
  ): Promise<boolean> => {
    try {
      const result = await grantPermissionMutation({
        variables: {
          input: {
            userId,
            permission,
            resource,
            resourceId,
            expiresAt: expiresAt?.toISOString(),
          }
        }
      });

      return result.data?.grantPermission?.success || false;
    } catch (error) {
      console.error('Failed to grant permission:', error);
      return false;
    }
  }, [grantPermissionMutation]);

  const revokePermission = useCallback(async (
    userId: string,
    permission: string,
    resource?: string,
    resourceId?: string
  ): Promise<boolean> => {
    try {
      const result = await revokePermissionMutation({
        variables: {
          input: {
            userId,
            permission,
            resource,
            resourceId,
          }
        }
      });

      return result.data?.revokePermission?.success || false;
    } catch (error) {
      console.error('Failed to revoke permission:', error);
      return false;
    }
  }, [revokePermissionMutation]);

  const assignRole = useCallback(async (userId: string, role: string): Promise<boolean> => {
    try {
      const result = await assignRoleMutation({
        variables: {
          input: {
            userId,
            role,
          }
        }
      });

      return result.data?.assignRole?.success || false;
    } catch (error) {
      console.error('Failed to assign role:', error);
      return false;
    }
  }, [assignRoleMutation]);

  const bulkGrantPermissions = useCallback(async (
    userIds: string[],
    permissions: string[],
    resource?: string,
    resourceId?: string
  ): Promise<boolean> => {
    try {
      const result = await bulkGrantPermissionsMutation({
        variables: {
          input: {
            userIds,
            permissions,
            resource,
            resourceId,
          }
        }
      });

      return result.data?.bulkGrantPermissions?.success || false;
    } catch (error) {
      console.error('Failed to bulk grant permissions:', error);
      return false;
    }
  }, [bulkGrantPermissionsMutation]);

  const bulkRevokePermissions = useCallback(async (
    userIds: string[],
    permissions: string[],
    resource?: string,
    resourceId?: string
  ): Promise<boolean> => {
    try {
      const result = await bulkRevokePermissionsMutation({
        variables: {
          input: {
            userIds,
            permissions,
            resource,
            resourceId,
          }
        }
      });

      return result.data?.bulkRevokePermissions?.success || false;
    } catch (error) {
      console.error('Failed to bulk revoke permissions:', error);
      return false;
    }
  }, [bulkRevokePermissionsMutation]);

  // Utility functions
  const refreshPermissions = useCallback(async (): Promise<void> => {
    await clearCache();
    await loadPermissions();
  }, [loadPermissions]);

  const clearCache = useCallback(async (): Promise<void> => {
    if (!user?.id) return;

    try {
      await appStorage.removeItem(`${CACHE_KEY_PREFIX}${user.id}`);
    } catch (error) {
      console.error('Failed to clear permissions cache:', error);
    }
  }, [user?.id]);

  const getPermissionsByResource = useCallback((resource: string): string[] => {
    return state.permissions.filter(permission => 
      permission.includes(`:${resource}:`) || permission.includes(`:${resource}`)
    );
  }, [state.permissions]);

  const isPermissionExpired = useCallback((permission: Permission): boolean => {
    if (!permission.expiresAt) return false;
    return new Date(permission.expiresAt) < new Date();
  }, []);

  // Update loading state
  const isLoading = useMemo(() => {
    return state.isLoading || loadingMyPermissions;
  }, [state.isLoading, loadingMyPermissions]);

  return {
    state: {
      ...state,
      isLoading,
    },
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    checkPermission,
    grantPermission,
    revokePermission,
    assignRole,
    bulkGrantPermissions,
    bulkRevokePermissions,
    refreshPermissions,
    clearCache,
    getPermissionsByResource,
    isPermissionExpired,
  };
}