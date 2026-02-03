import { gql } from '@apollo/client';

/**
 * Permissions & Roles GraphQL Operations
 * 
 * Queries and mutations for permission checking, role management, and access control.
 */

// Fragments
export const ROLE_FRAGMENT = gql`
  fragment RoleFragment on Role {
    id
    name
    displayName
    description
    permissions
    hierarchy
    isSystem
    createdAt
    updatedAt
  }
`;

export const PERMISSION_FRAGMENT = gql`
  fragment PermissionFragment on Permission {
    id
    name
    resource
    action
    description
    category
    isSystem
  }
`;

export const USER_PERMISSIONS_FRAGMENT = gql`
  fragment UserPermissionsFragment on UserPermissions {
    userId
    permissions
    roles
    effectivePermissions
    lastUpdated
  }
`;

// Queries
export const MY_PERMISSIONS = gql`
  query MyPermissions {
    myPermissions {
      ...UserPermissionsFragment
    }
  }
  ${USER_PERMISSIONS_FRAGMENT}
`;

export const GET_PERMISSIONS = gql`
  query GetPermissions($userId: String!) {
    userPermissions(userId: $userId) {
      ...UserPermissionsFragment
    }
  }
  ${USER_PERMISSIONS_FRAGMENT}
`;

export const GET_ROLES = gql`
  query GetRoles($input: GetRolesInput) {
    roles(input: $input) {
      roles {
        ...RoleFragment
      }
      totalCount
      hasMore
    }
  }
  ${ROLE_FRAGMENT}
`;

export const GET_AVAILABLE_PERMISSIONS = gql`
  query GetAvailablePermissions($input: GetAvailablePermissionsInput) {
    availablePermissions(input: $input) {
      permissions {
        ...PermissionFragment
      }
      categories
      resources
      totalCount
    }
  }
  ${PERMISSION_FRAGMENT}
`;

export const GET_ROLE_PERMISSIONS = gql`
  query GetRolePermissions($roleName: String!) {
    rolePermissions(roleName: $roleName) {
      role {
        ...RoleFragment
      }
      permissions {
        ...PermissionFragment
      }
    }
  }
  ${ROLE_FRAGMENT}
  ${PERMISSION_FRAGMENT}
`;

export const GET_USER_ROLES = gql`
  query GetUserRoles($userId: String!) {
    userRoles(userId: $userId) {
      userId
      roles {
        ...RoleFragment
      }
      assignedAt
      assignedBy
    }
  }
  ${ROLE_FRAGMENT}
`;

// Mutations
export const CHECK_PERMISSION = gql`
  mutation CheckPermission($input: CheckPermissionInput!) {
    checkPermission(input: $input) {
      hasPermission
      reason
      requiredRole
      requiredTier
    }
  }
`;

export const GRANT_PERMISSION = gql`
  mutation GrantPermission($input: GrantPermissionInput!) {
    grantPermission(input: $input) {
      success
      message
      permission {
        ...PermissionFragment
      }
    }
  }
  ${PERMISSION_FRAGMENT}
`;

export const REVOKE_PERMISSION = gql`
  mutation RevokePermission($input: RevokePermissionInput!) {
    revokePermission(input: $input) {
      success
      message
    }
  }
`;

export const ASSIGN_ROLE = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input) {
      success
      message
      role {
        ...RoleFragment
      }
    }
  }
  ${ROLE_FRAGMENT}
`;

export const UNASSIGN_ROLE = gql`
  mutation UnassignRole($input: UnassignRoleInput!) {
    unassignRole(input: $input) {
      success
      message
    }
  }
`;

export const BULK_GRANT_PERMISSIONS = gql`
  mutation BulkGrantPermissions($input: BulkPermissionInput!) {
    bulkGrantPermissions(input: $input) {
      success
      message
      grantedCount
      failedCount
      errors
    }
  }
`;

export const BULK_REVOKE_PERMISSIONS = gql`
  mutation BulkRevokePermissions($input: BulkPermissionInput!) {
    bulkRevokePermissions(input: $input) {
      success
      message
      revokedCount
      failedCount
      errors
    }
  }
`;

export const CREATE_ROLE = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      success
      message
      role {
        ...RoleFragment
      }
    }
  }
  ${ROLE_FRAGMENT}
`;

export const UPDATE_ROLE = gql`
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
      success
      message
      role {
        ...RoleFragment
      }
    }
  }
  ${ROLE_FRAGMENT}
`;

export const DELETE_ROLE = gql`
  mutation DeleteRole($roleId: String!) {
    deleteRole(roleId: $roleId) {
      success
      message
    }
  }
`;

export const SYNC_PERMISSIONS = gql`
  mutation SyncPermissions($userId: String!) {
    syncPermissions(userId: $userId) {
      success
      message
      permissions {
        ...UserPermissionsFragment
      }
    }
  }
  ${USER_PERMISSIONS_FRAGMENT}
`;

// Subscriptions
export const USER_PERMISSION_EVENTS = gql`
  subscription UserPermissionEvents($userId: String) {
    userPermissionEvents(userId: $userId) {
      type
      userId
      permission
      role
      timestamp
      metadata
    }
  }
`;

export const TENANT_ROLE_EVENTS = gql`
  subscription TenantRoleEvents {
    tenantRoleEvents {
      type
      roleId
      roleName
      userId
      timestamp
      metadata
    }
  }
`;

export const PERMISSION_CHANGES = gql`
  subscription PermissionChanges {
    permissionChanges {
      type
      userId
      permissions
      roles
      timestamp
      reason
    }
  }
`;