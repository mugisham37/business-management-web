/**
 * Cache Update Functions
 * 
 * Provides utilities to update Apollo Client cache after mutations.
 * These functions ensure the cache stays synchronized with server state
 * after create, update, and delete operations.
 * 
 * Requirements: 2.3
 */

import { ApolloCache, gql, Reference } from '@apollo/client';

/**
 * Type definitions for entities
 * These match the GraphQL schema types
 */
export interface User {
  __typename?: 'User' | 'AuthUserType';
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  hierarchyLevel?: number;
  organizationId?: string;
  branchId?: string;
  departmentId?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  __typename?: 'Permission';
  id: string;
  module: string;
  action: string;
  description?: string;
  hierarchyLevel?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Organization {
  __typename?: 'Organization';
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Branch {
  __typename?: 'Branch';
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Department {
  __typename?: 'Department';
  id: string;
  name: string;
  branchId: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessRule {
  __typename?: 'BusinessRule';
  id: string;
  name: string;
  organizationId: string;
  ruleType: string;
  conditions?: any;
  actions?: any;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  __typename?: 'AuditLog';
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

/**
 * User Cache Update Functions
 */

/**
 * Updates cache after creating a new user
 * Adds the new user to the users query result
 */
export const updateCacheAfterCreateUser = (
  cache: ApolloCache,
  newUser: User
): void => {
  cache.modify({
    fields: {
      users(existingUsers = { edges: [], pageInfo: {} }) {
        const newUserRef = cache.writeFragment({
          data: { ...newUser, __typename: newUser.__typename || 'User' },
          fragment: gql`
            fragment NewUser on User {
              id
              email
              firstName
              lastName
              hierarchyLevel
              organizationId
              branchId
              departmentId
              status
              isActive
              createdAt
              updatedAt
            }
          `,
        });

        return {
          ...existingUsers,
          edges: [newUserRef, ...(existingUsers.edges || [])],
        };
      },
    },
  });
};

/**
 * Updates cache after updating a user
 * Writes the updated user data to the cache
 */
export const updateCacheAfterUpdateUser = (
  cache: ApolloCache,
  updatedUser: User
): void => {
  const typename = updatedUser.__typename || 'User';
  cache.writeFragment({
    id: `${typename}:${updatedUser.id}`,
    fragment: gql`
      fragment UpdatedUser on ${typename} {
        id
        email
        firstName
        lastName
        hierarchyLevel
        organizationId
        branchId
        departmentId
        status
        isActive
        updatedAt
      }
    `,
    data: { ...updatedUser, __typename: typename },
  });
};

/**
 * Updates cache after deleting a user
 * Evicts the user from cache and runs garbage collection
 */
export const updateCacheAfterDeleteUser = (
  cache: ApolloCache,
  userId: string,
  typename: string = 'User'
): void => {
  cache.evict({ id: `${typename}:${userId}` });
  cache.gc(); // Garbage collect orphaned references
};

/**
 * Permission Cache Update Functions
 */

/**
 * Updates cache after creating a new permission
 */
export const updateCacheAfterCreatePermission = (
  cache: ApolloCache,
  newPermission: Permission
): void => {
  cache.modify({
    fields: {
      permissions(existingPermissions = []) {
        const newPermissionRef = cache.writeFragment({
          data: { ...newPermission, __typename: 'Permission' },
          fragment: gql`
            fragment NewPermission on Permission {
              id
              module
              action
              description
              hierarchyLevel
              createdAt
              updatedAt
            }
          `,
        });

        return [newPermissionRef, ...(existingPermissions || [])];
      },
    },
  });
};

/**
 * Updates cache after updating a permission
 */
export const updateCacheAfterUpdatePermission = (
  cache: ApolloCache,
  updatedPermission: Permission
): void => {
  cache.writeFragment({
    id: `Permission:${updatedPermission.id}`,
    fragment: gql`
      fragment UpdatedPermission on Permission {
        id
        module
        action
        description
        hierarchyLevel
        updatedAt
      }
    `,
    data: { ...updatedPermission, __typename: 'Permission' },
  });
};

/**
 * Updates cache after deleting a permission
 */
export const updateCacheAfterDeletePermission = (
  cache: ApolloCache,
  permissionId: string
): void => {
  cache.evict({ id: `Permission:${permissionId}` });
  cache.gc();
};

/**
 * Organization Cache Update Functions
 */

/**
 * Updates cache after creating a new organization
 */
export const updateCacheAfterCreateOrganization = (
  cache: ApolloCache,
  newOrganization: Organization
): void => {
  cache.modify({
    fields: {
      organizations(existingOrganizations = []) {
        const newOrgRef = cache.writeFragment({
          data: { ...newOrganization, __typename: 'Organization' },
          fragment: gql`
            fragment NewOrganization on Organization {
              id
              name
              description
              isActive
              createdAt
              updatedAt
            }
          `,
        });

        return [newOrgRef, ...(existingOrganizations || [])];
      },
    },
  });
};

/**
 * Updates cache after updating an organization
 */
export const updateCacheAfterUpdateOrganization = (
  cache: ApolloCache,
  updatedOrganization: Organization
): void => {
  cache.writeFragment({
    id: `Organization:${updatedOrganization.id}`,
    fragment: gql`
      fragment UpdatedOrganization on Organization {
        id
        name
        description
        isActive
        updatedAt
      }
    `,
    data: { ...updatedOrganization, __typename: 'Organization' },
  });
};

/**
 * Updates cache after deleting an organization
 */
export const updateCacheAfterDeleteOrganization = (
  cache: ApolloCache,
  organizationId: string
): void => {
  cache.evict({ id: `Organization:${organizationId}` });
  cache.gc();
};

/**
 * Branch Cache Update Functions
 */

/**
 * Updates cache after creating a new branch
 */
export const updateCacheAfterCreateBranch = (
  cache: ApolloCache,
  newBranch: Branch
): void => {
  cache.modify({
    fields: {
      branches(existingBranches = []) {
        const newBranchRef = cache.writeFragment({
          data: { ...newBranch, __typename: 'Branch' },
          fragment: gql`
            fragment NewBranch on Branch {
              id
              name
              organizationId
              description
              isActive
              createdAt
              updatedAt
            }
          `,
        });

        return [newBranchRef, ...(existingBranches || [])];
      },
    },
  });
};

/**
 * Updates cache after updating a branch
 */
export const updateCacheAfterUpdateBranch = (
  cache: ApolloCache,
  updatedBranch: Branch
): void => {
  cache.writeFragment({
    id: `Branch:${updatedBranch.id}`,
    fragment: gql`
      fragment UpdatedBranch on Branch {
        id
        name
        organizationId
        description
        isActive
        updatedAt
      }
    `,
    data: { ...updatedBranch, __typename: 'Branch' },
  });
};

/**
 * Updates cache after deleting a branch
 */
export const updateCacheAfterDeleteBranch = (
  cache: ApolloCache,
  branchId: string
): void => {
  cache.evict({ id: `Branch:${branchId}` });
  cache.gc();
};

/**
 * Department Cache Update Functions
 */

/**
 * Updates cache after creating a new department
 */
export const updateCacheAfterCreateDepartment = (
  cache: ApolloCache,
  newDepartment: Department
): void => {
  cache.modify({
    fields: {
      departments(existingDepartments = []) {
        const newDeptRef = cache.writeFragment({
          data: { ...newDepartment, __typename: 'Department' },
          fragment: gql`
            fragment NewDepartment on Department {
              id
              name
              branchId
              description
              isActive
              createdAt
              updatedAt
            }
          `,
        });

        return [newDeptRef, ...(existingDepartments || [])];
      },
    },
  });
};

/**
 * Updates cache after updating a department
 */
export const updateCacheAfterUpdateDepartment = (
  cache: ApolloCache,
  updatedDepartment: Department
): void => {
  cache.writeFragment({
    id: `Department:${updatedDepartment.id}`,
    fragment: gql`
      fragment UpdatedDepartment on Department {
        id
        name
        branchId
        description
        isActive
        updatedAt
      }
    `,
    data: { ...updatedDepartment, __typename: 'Department' },
  });
};

/**
 * Updates cache after deleting a department
 */
export const updateCacheAfterDeleteDepartment = (
  cache: ApolloCache,
  departmentId: string
): void => {
  cache.evict({ id: `Department:${departmentId}` });
  cache.gc();
};

/**
 * Business Rule Cache Update Functions
 */

/**
 * Updates cache after creating a new business rule
 */
export const updateCacheAfterCreateBusinessRule = (
  cache: ApolloCache,
  newBusinessRule: BusinessRule
): void => {
  cache.modify({
    fields: {
      businessRules(existingRules = []) {
        const newRuleRef = cache.writeFragment({
          data: { ...newBusinessRule, __typename: 'BusinessRule' },
          fragment: gql`
            fragment NewBusinessRule on BusinessRule {
              id
              name
              organizationId
              ruleType
              conditions
              actions
              isActive
              createdAt
              updatedAt
            }
          `,
        });

        return [newRuleRef, ...(existingRules || [])];
      },
    },
  });
};

/**
 * Updates cache after updating a business rule
 */
export const updateCacheAfterUpdateBusinessRule = (
  cache: ApolloCache,
  updatedBusinessRule: BusinessRule
): void => {
  cache.writeFragment({
    id: `BusinessRule:${updatedBusinessRule.id}`,
    fragment: gql`
      fragment UpdatedBusinessRule on BusinessRule {
        id
        name
        organizationId
        ruleType
        conditions
        actions
        isActive
        updatedAt
      }
    `,
    data: { ...updatedBusinessRule, __typename: 'BusinessRule' },
  });
};

/**
 * Updates cache after deleting a business rule
 */
export const updateCacheAfterDeleteBusinessRule = (
  cache: ApolloCache,
  businessRuleId: string
): void => {
  cache.evict({ id: `BusinessRule:${businessRuleId}` });
  cache.gc();
};

/**
 * Audit Log Cache Update Functions
 */

/**
 * Updates cache after creating a new audit log
 * Note: Audit logs are typically append-only, so we only have create
 */
export const updateCacheAfterCreateAuditLog = (
  cache: ApolloCache,
  newAuditLog: AuditLog
): void => {
  cache.modify({
    fields: {
      auditLogs(existingLogs = { logs: [], pageInfo: {} }) {
        const newLogRef = cache.writeFragment({
          data: { ...newAuditLog, __typename: 'AuditLog' },
          fragment: gql`
            fragment NewAuditLog on AuditLog {
              id
              userId
              action
              entityType
              entityId
              changes
              ipAddress
              userAgent
              timestamp
            }
          `,
        });

        return {
          ...existingLogs,
          logs: [newLogRef, ...(existingLogs.logs || [])],
        };
      },
    },
  });
};

/**
 * Generic cache invalidation utilities
 */

/**
 * Invalidates specific queries by name
 * Useful when you need to refetch data after complex operations
 */
export const invalidateQueries = (
  cache: ApolloCache,
  queryNames: string[]
): void => {
  queryNames.forEach(queryName => {
    cache.evict({ fieldName: queryName });
  });
  cache.gc();
};

/**
 * Clears the entire cache
 * Use sparingly - typically only on logout or critical errors
 */
export const clearCache = (cache: ApolloCache): void => {
  cache.evict({});
  cache.gc();
};

/**
 * Export all cache updater functions
 */
export const cacheUpdaters = {
  // User operations
  createUser: updateCacheAfterCreateUser,
  updateUser: updateCacheAfterUpdateUser,
  deleteUser: updateCacheAfterDeleteUser,
  
  // Permission operations
  createPermission: updateCacheAfterCreatePermission,
  updatePermission: updateCacheAfterUpdatePermission,
  deletePermission: updateCacheAfterDeletePermission,
  
  // Organization operations
  createOrganization: updateCacheAfterCreateOrganization,
  updateOrganization: updateCacheAfterUpdateOrganization,
  deleteOrganization: updateCacheAfterDeleteOrganization,
  
  // Branch operations
  createBranch: updateCacheAfterCreateBranch,
  updateBranch: updateCacheAfterUpdateBranch,
  deleteBranch: updateCacheAfterDeleteBranch,
  
  // Department operations
  createDepartment: updateCacheAfterCreateDepartment,
  updateDepartment: updateCacheAfterUpdateDepartment,
  deleteDepartment: updateCacheAfterDeleteDepartment,
  
  // Business Rule operations
  createBusinessRule: updateCacheAfterCreateBusinessRule,
  updateBusinessRule: updateCacheAfterUpdateBusinessRule,
  deleteBusinessRule: updateCacheAfterDeleteBusinessRule,
  
  // Audit Log operations
  createAuditLog: updateCacheAfterCreateAuditLog,
  
  // Utility operations
  invalidateQueries,
  clearCache,
};
