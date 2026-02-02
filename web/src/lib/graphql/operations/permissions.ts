import { gql } from '@apollo/client';

/**
 * Permissions & Roles GraphQL Operations
 * 
 * All permission and role management queries and mutations
 * for comprehensive authorization control.
 */

// Fragments
export const PERMISSION_FRAGMENT = gql`
  fragment PermissionFragment on Permission {
    id
    userId
    permission
    resource
    resourceId
    grantedBy
    grantedAt
    expiresAt
    isInherited
  }
`;

export const ROLE_FRAGMENT = gql`
  fragment RoleFragment on Role {
    name
    permissions
  }
`;

export const USER_PERMISSIONS_RESPONSE_FRAGMENT = gql`
  fragment UserPermissionsResponseFragment on UserPermissionsResponse {
    permissions
    role
    detailedPermissions {
      ...PermissionFragment
    }
    includesInherited
  }
  ${PERMISSION_FRAGMENT}
`;

export const PERMISSION_CHECK_RESPONSE_FRAGMENT = gql`
  fragment PermissionCheckResponseFragment on PermissionCheckResponse {
    hasPermission
    source
    expiresAt
  }
`;

export const BULK_PERMISSION_RESPONSE_FRAGMENT = gql`
  fragment BulkPermissionResponseFragment on BulkPermissionResponse {
    affectedUsers
    processedPermissions
    failedUsers
    errors
  }
`;

export const AVAILABLE_PERMISSIONS_RESPONSE_FRAGMENT = gql`
  fragment AvailablePermissionsResponseFragment on AvailablePermissionsResponse {
    permissions
    resources
    actions
  }
`;

// Queries
export const GET_PERMISSIONS = gql`
  query GetPermissions($userId: String!) {
    getPermissions(userId: $userId)
  }
`;

export const MY_PERMISSIONS = gql`
  query MyPermissions {
    myPermissions
  }
`;

export const GET_ROLES = gql`
  query GetRoles {
    getRoles {
      ...RoleFragment
    }
  }
  ${ROLE_FRAGMENT}
`;

export const GET_ROLE_PERMISSIONS = gql`
  query GetRolePermissions($role: String!) {
    getRolePermissions(role: $role)
  }
`;

export const HAS_PERMISSION = gql`
  query HasPermission(
    $userId: String!
    $permission: String!
    $resource: String
    $resourceId: String
  ) {
    hasPermission(
      userId: $userId
      permission: $permission
      resource: $resource
      resourceId: $resourceId
    )
  }
`;

export const GET_ALL_PERMISSIONS = gql`
  query GetAllPermissions {
    getAllPermissions
  }
`;

export const GET_DETAILED_PERMISSIONS = gql`
  query GetDetailedPermissions($userId: String!) {
    getDetailedPermissions(userId: $userId) {
      ...UserPermissionsResponseFragment
    }
  }
  ${USER_PERMISSIONS_RESPONSE_FRAGMENT}
`;

export const CHECK_PERMISSION = gql`
  query CheckPermission($input: CheckPermissionInput!) {
    checkPermission(input: $input) {
      ...PermissionCheckResponseFragment
    }
  }
  ${PERMISSION_CHECK_RESPONSE_FRAGMENT}
`;

export const GET_AVAILABLE_PERMISSIONS = gql`
  query GetAvailablePermissions {
    getAvailablePermissions {
      ...AvailablePermissionsResponseFragment
    }
  }
  ${AVAILABLE_PERMISSIONS_RESPONSE_FRAGMENT}
`;

// Mutations
export const GRANT_PERMISSION = gql`
  mutation GrantPermission($input: GrantPermissionInput!) {
    grantPermission(input: $input) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

export const REVOKE_PERMISSION = gql`
  mutation RevokePermission($input: RevokePermissionInput!) {
    revokePermission(input: $input) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

export const ASSIGN_ROLE = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input) {
      success
      message
      errors {
        message
        timestamp
      }
    }
  }
`;

export const BULK_GRANT_PERMISSIONS = gql`
  mutation BulkGrantPermissions($input: BulkPermissionInput!) {
    bulkGrantPermissions(input: $input) {
      ...BulkPermissionResponseFragment
    }
  }
  ${BULK_PERMISSION_RESPONSE_FRAGMENT}
`;

export const BULK_REVOKE_PERMISSIONS = gql`
  mutation BulkRevokePermissions($input: BulkPermissionInput!) {
    bulkRevokePermissions(input: $input) {
      ...BulkPermissionResponseFragment
    }
  }
  ${BULK_PERMISSION_RESPONSE_FRAGMENT}
`;

// Subscriptions
export const USER_PERMISSION_EVENTS = gql`
  subscription UserPermissionEvents {
    userPermissionEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
  }
`;

export const TENANT_ROLE_EVENTS = gql`
  subscription TenantRoleEvents {
    tenantRoleEvents {
      type
      userId
      tenantId
      timestamp
      metadata
      description
      severity
    }
  }
`;