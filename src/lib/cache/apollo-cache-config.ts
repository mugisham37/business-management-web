import { InMemoryCache, TypePolicies } from '@apollo/client';

/**
 * Apollo Cache Type Policies
 * 
 * Defines how Apollo Client normalizes and caches data:
 * - Entity identification (keyFields)
 * - Field merge strategies
 * - Pagination handling
 * 
 * Requirements: 6.9
 */
const typePolicies: TypePolicies = {
  Query: {
    fields: {
      /**
       * Users query with pagination support
       * Merges paginated results for infinite scroll
       */
      getUsers: {
        keyArgs: false, // Don't use any args for cache key
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // If offset/page is provided, append to existing results (pagination)
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              users: [...(existing.users || []), ...(incoming.users || [])],
            };
          }
          
          // Otherwise, replace with new results
          return incoming;
        },
      },

      /**
       * Single user query
       * Keyed by userId to cache individual user lookups
       */
      getUser: {
        keyArgs: ['userId'],
        merge: false,
      },
      
      /**
       * Permissions query
       * Always replace (no merge) to ensure fresh permission data
       * Keyed by userId since permissions are user-specific
       */
      getUserPermissions: {
        keyArgs: ['userId'],
        merge: false,
      },

      /**
       * Permission history query
       * Keyed by userId
       */
      getPermissionHistory: {
        keyArgs: ['userId'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Append new snapshots for pagination
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              snapshots: [...(existing.snapshots || []), ...(incoming.snapshots || [])],
            };
          }
          
          return incoming;
        },
      },
      
      /**
       * Audit logs query with pagination support
       * Appends new logs for infinite scroll
       */
      getUserAuditLogs: {
        keyArgs: ['userId'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Append new logs for pagination
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              logs: [...(existing.logs || []), ...(incoming.logs || [])],
            };
          }
          
          return incoming;
        },
      },

      getOrganizationAuditLogs: {
        keyArgs: ['organizationId'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              logs: [...(existing.logs || []), ...(incoming.logs || [])],
            };
          }
          
          return incoming;
        },
      },

      getResourceAuditLogs: {
        keyArgs: ['resourceType', 'resourceId'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              logs: [...(existing.logs || []), ...(incoming.logs || [])],
            };
          }
          
          return incoming;
        },
      },
      
      /**
       * Organization query
       * Simple replacement strategy
       */
      getOrganization: {
        keyArgs: false,
        merge: false,
      },
      
      /**
       * Branches query
       * Simple replacement strategy
       */
      getBranches: {
        keyArgs: false,
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Support pagination if needed
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              branches: [...(existing.branches || []), ...(incoming.branches || [])],
            };
          }
          
          return incoming;
        },
      },
      
      /**
       * Departments query
       * Simple replacement strategy
       */
      getDepartments: {
        keyArgs: false,
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Support pagination if needed
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              departments: [...(existing.departments || []), ...(incoming.departments || [])],
            };
          }
          
          return incoming;
        },
      },
      
      /**
       * Business rules query
       * Keyed by transactionType filter
       */
      getBusinessRules: {
        keyArgs: ['transactionType'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Support pagination if needed
          if (args?.page && args.page > 1) {
            return {
              ...incoming,
              rules: [...(existing.rules || []), ...(incoming.rules || [])],
            };
          }
          
          return incoming;
        },
      },

      /**
       * Active sessions query
       * Simple replacement strategy
       */
      getActiveSessions: {
        keyArgs: false,
        merge: false,
      },

      /**
       * Health check query
       * Always fetch fresh data
       */
      health: {
        keyArgs: false,
        merge: false,
      },
    },
  },
  
  /**
   * User entity normalization
   * Identified by 'id' field
   */
  User: {
    keyFields: ['id'],
    fields: {
      /**
       * Permissions array
       * Always replace to ensure consistency
       */
      permissions: {
        merge: false,
      },
      
      /**
       * Roles array
       * Always replace to ensure consistency
       */
      roles: {
        merge: false,
      },
    },
  },
  
  /**
   * Permission entity normalization
   * Identified by 'id' field
   */
  Permission: {
    keyFields: ['id'],
  },
  
  /**
   * Organization entity normalization
   * Identified by 'id' field
   */
  Organization: {
    keyFields: ['id'],
    fields: {
      /**
       * Branches relationship
       * Merge by reference
       */
      branches: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        merge(_existing: unknown[] = [], incoming: unknown[]) {
          return incoming;
        },
      },
    },
  },
  
  /**
   * Branch entity normalization
   * Identified by 'id' field
   */
  Branch: {
    keyFields: ['id'],
    fields: {
      /**
       * Departments relationship
       * Merge by reference
       */
      departments: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        merge(_existing: unknown[] = [], incoming: unknown[]) {
          return incoming;
        },
      },
    },
  },
  
  /**
   * Department entity normalization
   * Identified by 'id' field
   */
  Department: {
    keyFields: ['id'],
    fields: {
      /**
       * Users relationship
       * Merge by reference
       */
      users: {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        merge(_existing: unknown[] = [], incoming: unknown[]) {
          return incoming;
        },
      },
    },
  },
  
  /**
   * Business Rule entity normalization
   * Identified by 'id' field
   */
  BusinessRule: {
    keyFields: ['id'],
  },
  
  /**
   * Audit Log entity normalization
   * Identified by 'id' field
   */
  AuditLog: {
    keyFields: ['id'],
  },

  /**
   * Session entity normalization
   * Identified by 'id' field
   */
  Session: {
    keyFields: ['id'],
  },

  /**
   * Permission Snapshot entity normalization
   * Identified by 'id' field
   */
  PermissionSnapshot: {
    keyFields: ['id'],
  },

  /**
   * Staff Profile entity normalization
   * Identified by 'id' field
   */
  StaffProfile: {
    keyFields: ['id'],
  },
};

/**
 * Apollo InMemoryCache Configuration
 * 
 * Features:
 * - Normalized entity cache (User:123, Organization:456)
 * - Type policies for all entities
 * - Pagination support for list queries
 * - Automatic cache updates on mutations
 * 
 * Requirements: 6.9
 */
export const cache = new InMemoryCache({
  typePolicies,
  
  /**
   * Possible types for union/interface types
   * Add here if GraphQL schema uses unions or interfaces
   */
  possibleTypes: {
    // Example:
    // Node: ['User', 'Organization', 'Permission'],
  },
  
  /**
   * Data ID from object
   * Custom function to generate cache IDs for normalization
   * 
   * This ensures consistent cache keys across the application:
   * - Uses __typename:id format for entities with id field
   * - Handles special cases like AuthUserType
   * 
   * Requirements: 6.9
   */
  dataIdFromObject(responseObject) {
    // Handle different typename variations
    switch (responseObject.__typename) {
      case 'User':
      case 'AuthUserType':
        return `User:${responseObject.id}`;
      case 'Organization':
        return `Organization:${responseObject.id}`;
      case 'Branch':
        return `Branch:${responseObject.id}`;
      case 'Department':
        return `Department:${responseObject.id}`;
      case 'Permission':
        return `Permission:${responseObject.id}`;
      case 'BusinessRule':
        return `BusinessRule:${responseObject.id}`;
      case 'AuditLog':
        return `AuditLog:${responseObject.id}`;
      case 'Session':
        return `Session:${responseObject.id}`;
      case 'PermissionSnapshot':
        return `PermissionSnapshot:${responseObject.id}`;
      case 'StaffProfile':
        return `StaffProfile:${responseObject.id}`;
      default:
        // Use default behavior for other types
        return undefined;
    }
  },
});

/**
 * Export type policies for testing and reference
 */
export { typePolicies };
