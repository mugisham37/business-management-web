import { InMemoryCache, TypePolicies } from '@apollo/client';

/**
 * Apollo Cache Type Policies
 * 
 * Defines how Apollo Client normalizes and caches data:
 * - Entity identification (keyFields)
 * - Field merge strategies
 * - Pagination handling
 * 
 * Requirements: 2.1, 2.3
 */
const typePolicies: TypePolicies = {
  Query: {
    fields: {
      /**
       * Users query with pagination support
       * Merges paginated results for infinite scroll
       */
      users: {
        keyArgs: ['filter', 'organizationId'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // If offset is provided, append to existing results (pagination)
          if (args?.offset) {
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...(incoming.edges || [])],
            };
          }
          
          // Otherwise, replace with new results
          return incoming;
        },
      },
      
      /**
       * Permissions query
       * Always replace (no merge) to ensure fresh permission data
       */
      permissions: {
        keyArgs: ['userId'],
        merge: false,
      },
      
      /**
       * Audit logs query with pagination support
       * Appends new logs for infinite scroll
       */
      auditLogs: {
        keyArgs: ['filter'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Append new logs for pagination
          if (args?.offset) {
            return {
              ...incoming,
              logs: [...(existing.logs || []), ...(incoming.logs || [])],
            };
          }
          
          return incoming;
        },
      },
      
      /**
       * Organizations query
       * Simple replacement strategy
       */
      organizations: {
        keyArgs: false,
        merge: false,
      },
      
      /**
       * Branches query
       * Filtered by organization
       */
      branches: {
        keyArgs: ['organizationId'],
        merge: false,
      },
      
      /**
       * Departments query
       * Filtered by branch
       */
      departments: {
        keyArgs: ['branchId'],
        merge: false,
      },
      
      /**
       * Business rules query
       * Filtered by organization
       */
      businessRules: {
        keyArgs: ['organizationId'],
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
        merge(existing = [], incoming) {
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
        merge(existing = [], incoming) {
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
        merge(existing = [], incoming) {
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
 * Requirements: 2.1, 2.3
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
   * Custom function to generate cache IDs
   * Default uses __typename:id
   */
  dataIdFromObject(responseObject) {
    // Use default behavior: __typename:id
    // Can be customized if needed
    return undefined;
  },
});

/**
 * Export type policies for testing and reference
 */
export { typePolicies };
