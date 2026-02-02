import React, { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { AuthEventEmitter } from '../../auth/auth-events';
import {
  MY_PERMISSIONS,
  GET_PERMISSIONS,
  GET_ROLES,
  GET_AVAILABLE_PERMISSIONS,
  CHECK_PERMISSION,
  GRANT_PERMISSION,
  REVOKE_PERMISSION,
  ASSIGN_ROLE,
  BULK_GRANT_PERMISSIONS,
  BULK_REVOKE_PERMISSIONS,
  USER_PERMISSION_EVENTS,
  TENANT_ROLE_EVENTS,
} from '../../graphql/operations/permissions';
import type {
  Role,
  AvailablePermissionsResponse,
  GrantPermissionInput,
  RevokePermissionInput,
  AssignRoleInput,
  BulkPermissionInput,
  CheckPermissionInput,
  AuthEvent,
} from '../../graphql/generated/types';

/**
 * Permissions & Roles Hook
 * 
 * Provides comprehensive permission and role management with:
 * - User permissions checking
 * - Role management
 * - Permission granting/revoking
 * - Bulk operations
 * - Real-time permission events
 * - Permission caching and optimization
 */

interface PermissionsState {
  userPermissions: string[];
  availableRoles: Role[];
  availablePermissions: AvailablePermissionsResponse | null;
  isLoading: boolean;
  error: string | null;
  permissionCache: Map<string, boolean>;
}

interface PermissionsOperations {
  checkPermission: (userId: string, permission: string, resource?: string, resourceId?: string) => Promise<boolean>;
  grantPermission: (input: GrantPermissionInput) => Promise<boolean>;
  revokePermission: (input: RevokePermissionInput) => Promise<boolean>;
  assignRole: (input: AssignRoleInput) => Promise<boolean>;
  bulkGrantPermissions: (input: BulkPermissionInput) => Promise<boolean>;
  bulkRevokePermissions: (input: BulkPermissionInput) => Promise<boolean>;
  refreshPermissions: () => Promise<void>;
  clearError: () => void;
  clearCache: () => void;
}

interface UsePermissionsReturn extends PermissionsState, PermissionsOperations {
  // Permission checking utilities
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasWildcardPermission: (resource: string) => boolean;
  
  // Role utilities
  getRolePermissions: (roleName: string) => string[];
  isRoleAvailable: (roleName: string) => boolean;
  
  // Permission utilities
  getResourcePermissions: (resource: string) => string[];
  getAvailableActions: (resource: string) => string[];
  
  // Computed properties
  permissionCount: number;
  roleCount: number;
  hasAdminPermissions: boolean;
}

export function usePermissions(): UsePermissionsReturn {
  const [permissionsState, setPermissionsState] = useState<PermissionsState>({
    userPermissions: [],
    availableRoles: [],
    availablePermissions: null,
    isLoading: false,
    error: null,
    permissionCache: new Map(),
  });

  // GraphQL operations
  const { data: permissionsData, loading: permissionsLoading, refetch: refetchPermissions } = useQuery(
    MY_PERMISSIONS,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: rolesData, loading: rolesLoading, refetch: refetchRoles } = useQuery(GET_ROLES, {
    errorPolicy: 'all',
  });

  const { data: availablePermissionsData, loading: availableLoading } = useQuery(
    GET_AVAILABLE_PERMISSIONS,
    {
      errorPolicy: 'all',
    }
  );

  const [checkPermissionMutation] = useMutation(CHECK_PERMISSION, {
    errorPolicy: 'all',
  });

  const [grantPermissionMutation, { loading: grantLoading }] = useMutation(GRANT_PERMISSION, {
    errorPolicy: 'all',
  });

  const [revokePermissionMutation, { loading: revokeLoading }] = useMutation(REVOKE_PERMISSION, {
    errorPolicy: 'all',
  });

  const [assignRoleMutation, { loading: assignLoading }] = useMutation(ASSIGN_ROLE, {
    errorPolicy: 'all',
  });

  const [bulkGrantMutation, { loading: bulkGrantLoading }] = useMutation(BULK_GRANT_PERMISSIONS, {
    errorPolicy: 'all',
  });

  const [bulkRevokeMutation, { loading: bulkRevokeLoading }] = useMutation(BULK_REVOKE_PERMISSIONS, {
    errorPolicy: 'all',
  });

  // Real-time permission events
  useSubscription(USER_PERMISSION_EVENTS, {
    onData: ({ data }) => {
      if (data.data?.userPermissionEvents) {
        handlePermissionEvent(data.data.userPermissionEvents);
      }
    },
  });

  useSubscription(TENANT_ROLE_EVENTS, {
    onData: ({ data }) => {
      if (data.data?.tenantRoleEvents) {
        handleRoleEvent(data.data.tenantRoleEvents);
      }
    },
  });

  // Handle permission events
  const handlePermissionEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case 'PERMISSION_GRANTED':
        AuthEventEmitter.emit('permissions:granted', event.metadata?.permission);
        setPermissionsState(prev => ({ ...prev, permissionCache: new Map() })); // Clear cache
        refetchPermissions();
        break;
      case 'PERMISSION_REVOKED':
        AuthEventEmitter.emit('permissions:revoked', event.metadata?.permission);
        setPermissionsState(prev => ({ ...prev, permissionCache: new Map() })); // Clear cache
        refetchPermissions();
        break;
      default:
        console.log('Received permission event:', event);
    }
  }, [refetchPermissions]);

  // Handle role events
  const handleRoleEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case 'ROLE_ASSIGNED':
        AuthEventEmitter.emit('role:assigned', event.metadata?.role);
        setPermissionsState(prev => ({ ...prev, permissionCache: new Map() })); // Clear cache
        refetchPermissions();
        refetchRoles();
        break;
      default:
        console.log('Received role event:', event);
    }
  }, [refetchPermissions, refetchRoles]);

  // Check permission (with caching)
  const checkPermission = useCallback(async (
    userId: string,
    permission: string,
    resource?: string,
    resourceId?: string
  ): Promise<boolean> => {
    const cacheKey = `${userId}:${permission}:${resource || ''}:${resourceId || ''}`;
    
    // Check cache first
    if (permissionsState.permissionCache.has(cacheKey)) {
      return permissionsState.permissionCache.get(cacheKey)!;
    }

    try {
      const result = await checkPermissionMutation({
        variables: {
          input: { userId, permission, resource, resourceId },
        },
      });

      const hasPermission = result.data?.checkPermission?.hasPermission || false;
      
      // Cache the result
      setPermissionsState(prev => ({
        ...prev,
        permissionCache: new Map(prev.permissionCache).set(cacheKey, hasPermission),
      }));

      return hasPermission;
    } catch (error) {
      console.error('Failed to check permission:', error);
      return false;
    }
  }, [checkPermissionMutation, permissionsState.permissionCache]);

  // Grant permission
  const grantPermission = useCallback(async (input: GrantPermissionInput): Promise<boolean> => {
    try {
      setPermissionsState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await grantPermissionMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.grantPermission;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to grant permission');
      }

      setPermissionsState(prev => ({
        ...prev,
        isLoading: false,
        permissionCache: new Map(), // Clear cache
      }));

      // Refresh permissions if it's for current user
      await refetchPermissions();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to grant permission';
      setPermissionsState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [grantPermissionMutation, refetchPermissions]);

  // Revoke permission
  const revokePermission = useCallback(async (input: RevokePermissionInput): Promise<boolean> => {
    try {
      setPermissionsState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await revokePermissionMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.revokePermission;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to revoke permission');
      }

      setPermissionsState(prev => ({
        ...prev,
        isLoading: false,
        permissionCache: new Map(), // Clear cache
      }));

      // Refresh permissions if it's for current user
      await refetchPermissions();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to revoke permission';
      setPermissionsState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [revokePermissionMutation, refetchPermissions]);

  // Assign role
  const assignRole = useCallback(async (input: AssignRoleInput): Promise<boolean> => {
    try {
      setPermissionsState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await assignRoleMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.assignRole;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to assign role');
      }

      setPermissionsState(prev => ({
        ...prev,
        isLoading: false,
        permissionCache: new Map(), // Clear cache
      }));

      // Refresh permissions and roles
      await Promise.all([refetchPermissions(), refetchRoles()]);

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to assign role';
      setPermissionsState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [assignRoleMutation, refetchPermissions, refetchRoles]);

  // Bulk grant permissions
  const bulkGrantPermissions = useCallback(async (input: BulkPermissionInput): Promise<boolean> => {
    try {
      setPermissionsState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await bulkGrantMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.bulkGrantPermissions;
      if (!response || response.failedUsers.length > 0) {
        const errorMessage = response?.errors.join(', ') || 'Some bulk operations failed';
        throw new Error(errorMessage);
      }

      setPermissionsState(prev => ({
        ...prev,
        isLoading: false,
        permissionCache: new Map(), // Clear cache
      }));

      // Refresh permissions
      await refetchPermissions();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to bulk grant permissions';
      setPermissionsState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [bulkGrantMutation, refetchPermissions]);

  // Bulk revoke permissions
  const bulkRevokePermissions = useCallback(async (input: BulkPermissionInput): Promise<boolean> => {
    try {
      setPermissionsState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await bulkRevokeMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.bulkRevokePermissions;
      if (!response || response.failedUsers.length > 0) {
        const errorMessage = response?.errors.join(', ') || 'Some bulk operations failed';
        throw new Error(errorMessage);
      }

      setPermissionsState(prev => ({
        ...prev,
        isLoading: false,
        permissionCache: new Map(), // Clear cache
      }));

      // Refresh permissions
      await refetchPermissions();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to bulk revoke permissions';
      setPermissionsState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [bulkRevokeMutation, refetchPermissions]);

  // Refresh permissions
  const refreshPermissions = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([refetchPermissions(), refetchRoles()]);
      setPermissionsState(prev => ({ ...prev, permissionCache: new Map() })); // Clear cache
    } catch (error) {
      console.error('Failed to refresh permissions:', error);
    }
  }, [refetchPermissions, refetchRoles]);

  // Clear error
  const clearError = useCallback(() => {
    setPermissionsState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear cache
  const clearCache = useCallback(() => {
    setPermissionsState(prev => ({ ...prev, permissionCache: new Map() }));
  }, []);

  // Permission checking utilities
  const hasPermission = useCallback((permission: string): boolean => {
    if (!permissionsState.userPermissions.length) return false;
    
    // Check exact match
    if (permissionsState.userPermissions.includes(permission)) return true;
    
    // Check wildcard permissions
    const parts = permission.split(':');
    if (parts.length >= 2) {
      const wildcardPermission = `${parts[0]}:*`;
      if (permissionsState.userPermissions.includes(wildcardPermission)) return true;
    }
    
    return false;
  }, [permissionsState.userPermissions]);

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  }, [hasPermission]);

  const hasWildcardPermission = useCallback((resource: string): boolean => {
    return hasPermission(`${resource}:*`);
  }, [hasPermission]);

  // Role utilities
  const getRolePermissions = useCallback((roleName: string): string[] => {
    const role = permissionsState.availableRoles.find(r => r.name === roleName);
    return role?.permissions || [];
  }, [permissionsState.availableRoles]);

  const isRoleAvailable = useCallback((roleName: string): boolean => {
    return permissionsState.availableRoles.some(r => r.name === roleName);
  }, [permissionsState.availableRoles]);

  // Permission utilities
  const getResourcePermissions = useCallback((resource: string): string[] => {
    if (!permissionsState.availablePermissions) return [];
    
    return permissionsState.availablePermissions.permissions.filter(
      permission => permission.startsWith(`${resource}:`)
    );
  }, [permissionsState.availablePermissions]);

  const getAvailableActions = useCallback((resource: string): string[] => {
    if (!permissionsState.availablePermissions) return [];
    
    const resourcePermissions = getResourcePermissions(resource);
    return resourcePermissions.map(permission => {
      const parts = permission.split(':');
      return parts[1] || '';
    }).filter(Boolean);
  }, [permissionsState.availablePermissions, getResourcePermissions]);

  // Computed properties
  const permissionCount = permissionsState.userPermissions.length;
  const roleCount = permissionsState.availableRoles.length;
  const hasAdminPermissions = hasAnyPermission(['platform:*', 'tenant:*', 'users:*']);

  // Update state when data changes
  React.useEffect(() => {
    if (permissionsData?.myPermissions) {
      setPermissionsState(prev => ({
        ...prev,
        userPermissions: permissionsData.myPermissions,
      }));
      
      // Emit permissions updated event
      AuthEventEmitter.emit('permissions:updated', permissionsData.myPermissions);
    }
  }, [permissionsData]);

  React.useEffect(() => {
    if (rolesData?.getRoles) {
      setPermissionsState(prev => ({
        ...prev,
        availableRoles: rolesData.getRoles,
      }));
    }
  }, [rolesData]);

  React.useEffect(() => {
    if (availablePermissionsData?.getAvailablePermissions) {
      setPermissionsState(prev => ({
        ...prev,
        availablePermissions: availablePermissionsData.getAvailablePermissions,
      }));
    }
  }, [availablePermissionsData]);

  return {
    // State
    ...permissionsState,
    isLoading: permissionsState.isLoading || 
               permissionsLoading || 
               rolesLoading || 
               availableLoading || 
               grantLoading || 
               revokeLoading || 
               assignLoading || 
               bulkGrantLoading || 
               bulkRevokeLoading,

    // Operations
    checkPermission,
    grantPermission,
    revokePermission,
    assignRole,
    bulkGrantPermissions,
    bulkRevokePermissions,
    refreshPermissions,
    clearError,
    clearCache,

    // Utilities
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasWildcardPermission,
    getRolePermissions,
    isRoleAvailable,
    getResourcePermissions,
    getAvailableActions,

    // Computed properties
    permissionCount,
    roleCount,
    hasAdminPermissions,
  };
}