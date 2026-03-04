/**
 * Cache Eviction Strategies
 * 
 * Provides utilities for cache eviction and TTL-based invalidation.
 * These strategies help maintain cache freshness and prevent stale data.
 * 
 * Requirements: 6.8
 */

import { ApolloCache } from '@apollo/client';

/**
 * Cache entry metadata for TTL tracking
 */
interface CacheEntryMetadata {
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * TTL configuration for different query types
 * Defines how long different types of data should be cached
 */
export const TTL_CONFIG = {
  // User data - 5 minutes
  users: 5 * 60 * 1000,
  user: 5 * 60 * 1000,
  
  // Permission data - 2 minutes (more sensitive)
  permissions: 2 * 60 * 1000,
  permissionHistory: 10 * 60 * 1000,
  
  // Organization data - 10 minutes (changes less frequently)
  organization: 10 * 60 * 1000,
  branches: 10 * 60 * 1000,
  departments: 10 * 60 * 1000,
  
  // Business rules - 15 minutes
  businessRules: 15 * 60 * 1000,
  
  // Audit logs - 30 minutes (historical data)
  auditLogs: 30 * 60 * 1000,
  
  // Sessions - 1 minute (very dynamic)
  sessions: 1 * 60 * 1000,
  
  // Health check - 30 seconds
  health: 30 * 1000,
} as const;

/**
 * Cache metadata storage
 * Tracks when cache entries were last updated
 */
const cacheMetadata = new Map<string, CacheEntryMetadata>();

/**
 * Records when a cache entry was last updated
 * 
 * @param queryName - The name of the query
 * @param ttl - Time to live in milliseconds
 */
export const recordCacheEntry = (queryName: string, ttl: number): void => {
  cacheMetadata.set(queryName, {
    timestamp: Date.now(),
    ttl,
  });
};

/**
 * Checks if a cache entry has expired based on its TTL
 * 
 * @param queryName - The name of the query to check
 * @returns true if the entry has expired, false otherwise
 */
export const isCacheEntryExpired = (queryName: string): boolean => {
  const metadata = cacheMetadata.get(queryName);
  
  if (!metadata) {
    return true; // No metadata means it should be refetched
  }
  
  const age = Date.now() - metadata.timestamp;
  return age > metadata.ttl;
};

/**
 * Evicts expired cache entries based on TTL
 * Should be called periodically to clean up stale data
 * 
 * @param cache - Apollo cache instance
 */
export const evictExpiredEntries = (cache: ApolloCache<any>): void => {
  const expiredQueries: string[] = [];
  
  cacheMetadata.forEach((metadata, queryName) => {
    if (isCacheEntryExpired(queryName)) {
      expiredQueries.push(queryName);
    }
  });
  
  // Evict expired queries
  expiredQueries.forEach(queryName => {
    cache.evict({ fieldName: queryName });
    cacheMetadata.delete(queryName);
  });
  
  if (expiredQueries.length > 0) {
    cache.gc(); // Run garbage collection
    console.debug(`Evicted ${expiredQueries.length} expired cache entries:`, expiredQueries);
  }
};

/**
 * Evicts all cache entries for a specific entity type
 * Useful when you know an entity type has been updated
 * 
 * @param cache - Apollo cache instance
 * @param entityType - The entity type to evict (e.g., 'User', 'Branch')
 */
export const evictEntityType = (
  cache: ApolloCache<any>,
  entityType: string
): void => {
  // Evict all entities of this type
  cache.evict({ id: `${entityType}:*` });
  
  // Also evict related queries
  const relatedQueries = getRelatedQueries(entityType);
  relatedQueries.forEach(queryName => {
    cache.evict({ fieldName: queryName });
    cacheMetadata.delete(queryName);
  });
  
  cache.gc();
  console.debug(`Evicted all ${entityType} entities and related queries`);
};

/**
 * Gets the list of queries related to an entity type
 * 
 * @param entityType - The entity type
 * @returns Array of related query names
 */
const getRelatedQueries = (entityType: string): string[] => {
  const queryMap: Record<string, string[]> = {
    User: ['getUsers', 'getUser'],
    Permission: ['getUserPermissions', 'getPermissionHistory'],
    Organization: ['getOrganization'],
    Branch: ['getBranches'],
    Department: ['getDepartments'],
    BusinessRule: ['getBusinessRules'],
    Session: ['getActiveSessions'],
    AuditLog: ['getUserAuditLogs', 'getOrganizationAuditLogs', 'getResourceAuditLogs'],
  };
  
  return queryMap[entityType] || [];
};

/**
 * Evicts cache entries by query name pattern
 * Useful for evicting multiple related queries at once
 * 
 * @param cache - Apollo cache instance
 * @param pattern - Regex pattern to match query names
 */
export const evictByPattern = (
  cache: ApolloCache<any>,
  pattern: RegExp
): void => {
  const matchingQueries: string[] = [];
  
  cacheMetadata.forEach((_, queryName) => {
    if (pattern.test(queryName)) {
      matchingQueries.push(queryName);
    }
  });
  
  matchingQueries.forEach(queryName => {
    cache.evict({ fieldName: queryName });
    cacheMetadata.delete(queryName);
  });
  
  if (matchingQueries.length > 0) {
    cache.gc();
    console.debug(`Evicted ${matchingQueries.length} cache entries matching pattern:`, pattern);
  }
};

/**
 * Evicts all user-related cache entries
 * Useful after user updates or permission changes
 * 
 * @param cache - Apollo cache instance
 * @param userId - Optional user ID to evict specific user data
 */
export const evictUserData = (
  cache: ApolloCache<any>,
  userId?: string
): void => {
  if (userId) {
    // Evict specific user
    cache.evict({ id: `User:${userId}` });
    cache.evict({ id: `AuthUserType:${userId}` });
    
    // Evict user-specific queries
    cache.evict({ fieldName: 'getUser', args: { userId } });
    cache.evict({ fieldName: 'getUserPermissions', args: { userId } });
    cache.evict({ fieldName: 'getPermissionHistory', args: { userId } });
    cache.evict({ fieldName: 'getUserAuditLogs', args: { userId } });
  } else {
    // Evict all user data
    evictEntityType(cache, 'User');
  }
  
  cache.gc();
};

/**
 * Evicts all organization-related cache entries
 * Useful after organization structure changes
 * 
 * @param cache - Apollo cache instance
 */
export const evictOrganizationData = (cache: ApolloCache<any>): void => {
  evictEntityType(cache, 'Organization');
  evictEntityType(cache, 'Branch');
  evictEntityType(cache, 'Department');
  
  cache.gc();
};

/**
 * Starts a periodic cache cleanup process
 * Runs eviction checks at regular intervals
 * 
 * @param cache - Apollo cache instance
 * @param intervalMs - Interval in milliseconds (default: 5 minutes)
 * @returns Cleanup function to stop the interval
 */
export const startCacheCleanup = (
  cache: ApolloCache<any>,
  intervalMs: number = 5 * 60 * 1000
): (() => void) => {
  const intervalId = setInterval(() => {
    evictExpiredEntries(cache);
  }, intervalMs);
  
  console.debug(`Started cache cleanup with ${intervalMs}ms interval`);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
    console.debug('Stopped cache cleanup');
  };
};

/**
 * Clears all cache metadata
 * Useful for testing or when resetting the application state
 */
export const clearCacheMetadata = (): void => {
  cacheMetadata.clear();
  console.debug('Cleared all cache metadata');
};

/**
 * Gets cache statistics for monitoring
 * 
 * @returns Object with cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  const stats = {
    totalEntries: cacheMetadata.size,
    expiredEntries: 0,
    validEntries: 0,
    entriesByType: {} as Record<string, number>,
  };
  
  cacheMetadata.forEach((metadata, queryName) => {
    const age = now - metadata.timestamp;
    const isExpired = age > metadata.ttl;
    
    if (isExpired) {
      stats.expiredEntries++;
    } else {
      stats.validEntries++;
    }
    
    // Count by query type
    const queryType = queryName.split('_')[0];
    stats.entriesByType[queryType] = (stats.entriesByType[queryType] || 0) + 1;
  });
  
  return stats;
};

/**
 * Export all eviction utilities
 */
export const cacheEviction = {
  recordCacheEntry,
  isCacheEntryExpired,
  evictExpiredEntries,
  evictEntityType,
  evictByPattern,
  evictUserData,
  evictOrganizationData,
  startCacheCleanup,
  clearCacheMetadata,
  getCacheStats,
};
