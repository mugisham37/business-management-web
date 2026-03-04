/**
 * Cache Update Functions
 * 
 * Provides utilities to update Apollo Client cache after mutations.
 * These functions ensure the cache stays synchronized with server state
 * after create, update, and delete operations.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { ApolloCache, gql, Reference } from '@apollo/client';
import { 
  GET_USERS, 
  GET_USER 
} from '@/graphql/queries/users';
import { 
  GET_USER_PERMISSIONS, 
  GET_PERMISSION_HISTORY 
} from '@/graphql/queries/permissions';
import { GET_BRANCHES } from '@/graphql/queries/branches';
import { GET_DEPARTMENTS } from '@/graphql/queries/departments';
import { GET_BUSINESS_RULES } from '@/graphql/queries/business-rules';
import { GET_ACTIVE_SESSIONS } from '@/graphql/queries/auth';

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

export interface Session {
  __typename?: 'Session';
  id: string;
  userId: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: string;
  expiresAt: string;
}

export interface UserPermissions {
  __typename?: 'UserPermissions';
  userId: string;
  fingerprint: string;
  permissions: Array<{
    module: string;
    actions: string[];
  }>;
}

/**
 * User Cache Update Functions
 * Requirements: 6.1, 6.2
 */

/**
 * Updates the users list cache after creating a new user
 * Adds the new user to the GET_USERS query result
 * 
 * @param cache - Apollo cache instance
 * @param newUser - The newly created user
 */
export const updateUsersCache = (
  cache: ApolloCache<any>,
  newUser: User
): void => {
  try {
    const existingData = cache.readQuery<{
      getUsers: { users: User[]; total: number };
    }>({ query: GET_USERS });

    if (existingData) {
      cache.writeQuery({
        query: GET_USERS,
        data: {
          getUsers: {
            users: [newUser, ...existingData.getUsers.users],
            total: existingData.getUsers.total + 1,
          },
        },
      });
    }
  } catch (error) {
    // Query not in cache yet, skip update
    console.debug('GET_USERS query not in cache, skipping update');
  }
};

/**
 * Updates a specific user in the cache
 * Updates both the GET_USER query and the user reference in GET_USERS
 * 
 * @param cache - Apollo cache instance
 * @param updatedUser - The updated user data
 */
export const updateUserCache = (
  cache: ApolloCache<any>,
  updatedUser: User
): void => {
  // Update the specific user query
  try {
    cache.writeQuery({
      query: GET_USER,
      variables: { userId: updatedUser.id },
      data: {
        getUser: updatedUser,
      },
    });
  } catch (error) {
    console.debug('GET_USER query not in cache, skipping update');
  }

  // Update the user in the users list
  try {
    const existingData = cache.readQuery<{
      getUsers: { users: User[]; total: number };
    }>({ query: GET_USERS });

    if (existingData) {
      cache.writeQuery({
        query: GET_USERS,
        data: {
          getUsers: {
            users: existingData.getUsers.users.map(user =>
              user.id === updatedUser.id ? updatedUser : user
            ),
            total: existingData.getUsers.total,
          },
        },
      });
    }
  } catch (error) {
    console.debug('GET_USERS query not in cache, skipping update');
  }

  // Also update the normalized cache entry
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
  cache: ApolloCache<any>,
  userId: string,
  typename: string = 'User'
): void => {
  cache.evict({ id: `${typename}:${userId}` });
  cache.gc(); // Garbage collect orphaned references
};

/**
 * Permission Cache Update Functions
 * Requirements: 6.3
 */

/**
 * Updates the user permissions cache after granting or revoking permissions
 * Updates the GET_USER_PERMISSIONS query result
 * 
 * @param cache - Apollo cache instance
 * @param userId - The user ID whose permissions were updated
 * @param permissions - The updated permissions data
 */
export const updateUserPermissionsCache = (
  cache: ApolloCache<any>,
  userId: string,
  permissions: UserPermissions
): void => {
  try {
    cache.writeQuery({
      query: GET_USER_PERMISSIONS,
      variables: { userId },
      data: {
        getUserPermissions: permissions,
      },
    });
  } catch (error) {
    console.debug('GET_USER_PERMISSIONS query not in cache, skipping update');
  }
};

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
 * Requirements: 6.4
 */

/**
 * Updates the branches list cache after creating or updating a branch
 * Updates the GET_BRANCHES query result
 * 
 * @param cache - Apollo cache instance
 * @param branch - The branch data (new or updated)
 * @param isNew - Whether this is a new branch (true) or an update (false)
 */
export const updateBranchesCache = (
  cache: ApolloCache<any>,
  branch: Branch,
  isNew: boolean = true
): void => {
  try {
    const existingData = cache.readQuery<{
      getBranches: { branches: Branch[]; total: number };
    }>({ query: GET_BRANCHES });

    if (existingData) {
      const updatedBranches = isNew
        ? [branch, ...existingData.getBranches.branches]
        : existingData.getBranches.branches.map(b =>
            b.id === branch.id ? branch : b
          );

      cache.writeQuery({
        query: GET_BRANCHES,
        data: {
          getBranches: {
            branches: updatedBranches,
            total: isNew
              ? existingData.getBranches.total + 1
              : existingData.getBranches.total,
          },
        },
      });
    }
  } catch (error) {
    console.debug('GET_BRANCHES query not in cache, skipping update');
  }

  // Also update the normalized cache entry
  cache.writeFragment({
    id: `Branch:${branch.id}`,
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
    data: { ...branch, __typename: 'Branch' },
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
 * Requirements: 6.5
 */

/**
 * Updates the departments list cache after creating or updating a department
 * Updates the GET_DEPARTMENTS query result
 * 
 * @param cache - Apollo cache instance
 * @param department - The department data (new or updated)
 * @param isNew - Whether this is a new department (true) or an update (false)
 */
export const updateDepartmentsCache = (
  cache: ApolloCache<any>,
  department: Department,
  isNew: boolean = true
): void => {
  try {
    const existingData = cache.readQuery<{
      getDepartments: { departments: Department[]; total: number };
    }>({ query: GET_DEPARTMENTS });

    if (existingData) {
      const updatedDepartments = isNew
        ? [department, ...existingData.getDepartments.departments]
        : existingData.getDepartments.departments.map(d =>
            d.id === department.id ? department : d
          );

      cache.writeQuery({
        query: GET_DEPARTMENTS,
        data: {
          getDepartments: {
            departments: updatedDepartments,
            total: isNew
              ? existingData.getDepartments.total + 1
              : existingData.getDepartments.total,
          },
        },
      });
    }
  } catch (error) {
    console.debug('GET_DEPARTMENTS query not in cache, skipping update');
  }

  // Also update the normalized cache entry
  cache.writeFragment({
    id: `Department:${department.id}`,
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
    data: { ...department, __typename: 'Department' },
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
 * Requirements: 6.6
 */

/**
 * Updates the business rules list cache after creating or updating a business rule
 * Updates the GET_BUSINESS_RULES query result
 * 
 * @param cache - Apollo cache instance
 * @param businessRule - The business rule data (new or updated)
 * @param isNew - Whether this is a new business rule (true) or an update (false)
 * @param transactionType - Optional transaction type filter used in the query
 */
export const updateBusinessRulesCache = (
  cache: ApolloCache<any>,
  businessRule: BusinessRule,
  isNew: boolean = true,
  transactionType?: string
): void => {
  try {
    const existingData = cache.readQuery<{
      getBusinessRules: { rules: BusinessRule[]; total: number };
    }>({ 
      query: GET_BUSINESS_RULES,
      variables: transactionType ? { transactionType } : undefined
    });

    if (existingData) {
      const updatedRules = isNew
        ? [businessRule, ...existingData.getBusinessRules.rules]
        : existingData.getBusinessRules.rules.map(r =>
            r.id === businessRule.id ? businessRule : r
          );

      cache.writeQuery({
        query: GET_BUSINESS_RULES,
        variables: transactionType ? { transactionType } : undefined,
        data: {
          getBusinessRules: {
            rules: updatedRules,
            total: isNew
              ? existingData.getBusinessRules.total + 1
              : existingData.getBusinessRules.total,
          },
        },
      });
    }
  } catch (error) {
    console.debug('GET_BUSINESS_RULES query not in cache, skipping update');
  }

  // Also update the normalized cache entry
  cache.writeFragment({
    id: `BusinessRule:${businessRule.id}`,
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
    data: { ...businessRule, __typename: 'BusinessRule' },
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
  cache: ApolloCache<any>,
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
 * Session Cache Update Functions
 * Requirements: 6.7
 */

/**
 * Updates the active sessions cache after revoking a session
 * Removes the revoked session from the GET_ACTIVE_SESSIONS query result
 * 
 * @param cache - Apollo cache instance
 * @param sessionId - The ID of the revoked session
 */
export const updateSessionsCache = (
  cache: ApolloCache<any>,
  sessionId: string
): void => {
  try {
    const existingData = cache.readQuery<{
      getActiveSessions: Session[];
    }>({ query: GET_ACTIVE_SESSIONS });

    if (existingData) {
      cache.writeQuery({
        query: GET_ACTIVE_SESSIONS,
        data: {
          getActiveSessions: existingData.getActiveSessions.filter(
            session => session.id !== sessionId
          ),
        },
      });
    }
  } catch (error) {
    console.debug('GET_ACTIVE_SESSIONS query not in cache, skipping update');
  }

  // Also evict the session from cache
  cache.evict({ id: `Session:${sessionId}` });
  cache.gc();
};

/**
 * Clears all sessions from the cache
 * Used when revoking all sessions
 * 
 * @param cache - Apollo cache instance
 */
export const clearSessionsCache = (cache: ApolloCache<any>): void => {
  try {
    cache.writeQuery({
      query: GET_ACTIVE_SESSIONS,
      data: {
        getActiveSessions: [],
      },
    });
  } catch (error) {
    console.debug('GET_ACTIVE_SESSIONS query not in cache, skipping update');
  }

  // Evict all sessions
  cache.evict({ fieldName: 'getActiveSessions' });
  cache.gc();
};

/**
 * Generic cache invalidation utilities
 * Requirements: 6.8
 */

/**
 * Invalidates specific queries by name
 * Useful when you need to refetch data after complex operations
 */
export const invalidateQueries = (
  cache: ApolloCache<any>,
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
export const clearCache = (cache: ApolloCache<any>): void => {
  cache.evict({});
  cache.gc();
};

/**
 * Export all cache updater functions
 * These functions are used by the service layer to keep the cache synchronized
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */
export const cacheUpdaters = {
  // User operations (Requirements: 6.1, 6.2)
  updateUsersCache,
  updateUserCache,
  deleteUser: updateCacheAfterDeleteUser,
  
  // Permission operations (Requirements: 6.3)
  updateUserPermissionsCache,
  createPermission: updateCacheAfterCreatePermission,
  updatePermission: updateCacheAfterUpdatePermission,
  deletePermission: updateCacheAfterDeletePermission,
  
  // Organization operations
  createOrganization: updateCacheAfterCreateOrganization,
  updateOrganization: updateCacheAfterUpdateOrganization,
  deleteOrganization: updateCacheAfterDeleteOrganization,
  
  // Branch operations (Requirements: 6.4)
  updateBranchesCache,
  deleteBranch: updateCacheAfterDeleteBranch,
  
  // Department operations (Requirements: 6.5)
  updateDepartmentsCache,
  deleteDepartment: updateCacheAfterDeleteDepartment,
  
  // Business Rule operations (Requirements: 6.6)
  updateBusinessRulesCache,
  deleteBusinessRule: updateCacheAfterDeleteBusinessRule,
  
  // Session operations (Requirements: 6.7)
  updateSessionsCache,
  clearSessionsCache,
  
  // Audit Log operations
  createAuditLog: updateCacheAfterCreateAuditLog,
  
  // Utility operations (Requirements: 6.8)
  invalidateQueries,
  clearCache,
};
