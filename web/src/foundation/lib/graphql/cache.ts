import { InMemoryCache, TypePolicies } from '@apollo/client';

/**
 * Cache configuration for Apollo Client
 * 
 * Implements:
 * - Normalization using __typename and id fields
 * - Merge functions for paginated queries
 * - Type policies for different entity types
 * 
 * Requirements: 4.5, 10.1
 */

/**
 * Type policies for Apollo Client cache
 * Defines how different types should be cached and merged
 */
export const typePolicies: TypePolicies = {
  Query: {
    fields: {
      // Users query with pagination support
      users: {
        keyArgs: ['filters', 'sort'],
        merge(existing = { nodes: [], totalCount: 0 }, incoming) {
          return {
            nodes: [...existing.nodes, ...incoming.nodes],
            totalCount: incoming.totalCount,
          };
        },
      },
      
      // Audit logs query with pagination support
      auditLogs: {
        keyArgs: ['filters'],
        merge(existing = { nodes: [], totalCount: 0 }, incoming) {
          return {
            nodes: [...existing.nodes, ...incoming.nodes],
            totalCount: incoming.totalCount,
          };
        },
      },
    },
  },
  
  // User entity normalization
  User: {
    keyFields: ['id'],
  },
  
  // Branch entity normalization
  Branch: {
    keyFields: ['id'],
  },
  
  // Department entity normalization
  Department: {
    keyFields: ['id'],
  },
  
  // Permission entity normalization
  Permission: {
    keyFields: ['id'],
  },
  
  // Session entity normalization
  Session: {
    keyFields: ['id'],
  },
  
  // AuditLog entity normalization
  AuditLog: {
    keyFields: ['id'],
  },
};

/**
 * Creates and configures the Apollo Client InMemoryCache
 * 
 * @returns Configured InMemoryCache instance
 */
export function createCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies,
  });
}

/**
 * Default cache instance
 * Can be used directly or created via createCache()
 */
export const cache = createCache();
