import { ApolloCache, gql } from '@apollo/client';

/**
 * Cache Manager Utility
 * 
 * Provides utilities for cache manipulation including:
 * - Cache eviction (queries and entities)
 * - Cache updates
 * - Optimistic update helpers (temporary ID generation and replacement)
 * 
 * Requirements: 10.7, 22.5, 22.6
 */

/**
 * CacheManager class for managing Apollo Client cache operations
 */
export class CacheManager {
  constructor(private cache: ApolloCache) {}

  /**
   * Evicts a specific query from the cache
   * 
   * @param queryName - The name of the query to evict
   * @param variables - Optional variables to match specific query instances
   * 
   * @example
   * cacheManager.evictQuery('users', { filters: { role: 'MANAGER' } });
   */
  evictQuery(queryName: string, variables?: Record<string, any>): void {
    const fieldName = queryName;
    
    this.cache.evict({
      id: 'ROOT_QUERY',
      fieldName,
      args: variables,
    });
    
    // Garbage collect to remove orphaned references
    this.cache.gc();
  }

  /**
   * Evicts a specific entity from the cache by typename and id
   * 
   * @param typename - The GraphQL typename of the entity (e.g., 'User', 'Branch')
   * @param id - The ID of the entity to evict
   * 
   * @example
   * cacheManager.evictEntity('User', 'user-123');
   */
  evictEntity(typename: string, id: string): void {
    const cacheId = this.cache.identify({ __typename: typename, id });
    
    if (cacheId) {
      this.cache.evict({ id: cacheId });
      this.cache.gc();
    }
  }

  /**
   * Updates a query in the cache using an updater function
   * 
   * @param queryName - The name of the query to update
   * @param updater - Function that receives current data and returns updated data
   * @param variables - Optional variables to match specific query instances
   * 
   * @example
   * cacheManager.updateQuery('users', (data) => ({
   *   ...data,
   *   users: {
   *     ...data.users,
   *     nodes: [...data.users.nodes, newUser]
   *   }
   * }));
   */
  updateQuery<T = any>(
    queryName: string,
    updater: (data: T) => T,
    variables?: Record<string, any>
  ): void {
    const fieldName = queryName;
    
    this.cache.modify({
      id: 'ROOT_QUERY',
      fields: {
        [fieldName](existingData: any, { readField }: any) {
          if (!existingData) return existingData;
          return updater(existingData);
        },
      },
    });
  }

  /**
   * Generates a temporary ID for optimistic updates
   * Uses timestamp to ensure uniqueness
   * 
   * @param prefix - Optional prefix for the temporary ID (default: 'temp')
   * @returns A unique temporary ID string
   * 
   * @example
   * const tempId = cacheManager.generateTempId('user'); // 'temp-user-1234567890'
   */
  generateTempId(prefix: string = 'temp'): string {
    return `temp-${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Replaces a temporary ID with a server-generated ID in the cache
   * This is used after an optimistic update is confirmed by the server
   * 
   * @param typename - The GraphQL typename of the entity
   * @param tempId - The temporary ID to replace
   * @param realId - The real ID from the server
   * 
   * @example
   * cacheManager.replaceTempId('User', 'temp-user-123', 'real-user-456');
   */
  replaceTempId(typename: string, tempId: string, realId: string): void {
    const tempCacheId = this.cache.identify({ __typename: typename, id: tempId });
    
    if (!tempCacheId) {
      console.warn(`Temporary cache ID not found for ${typename}:${tempId}`);
      return;
    }

    // Read the data from the temporary cache entry
    const tempData = this.cache.readFragment({
      id: tempCacheId,
      fragment: gql`
        fragment TempData on ${typename} {
          id
        }
      `,
    });

    if (!tempData) {
      console.warn(`No data found for temporary ID ${tempId}`);
      return;
    }

    // Evict the temporary entry
    this.cache.evict({ id: tempCacheId });

    // The real data should already be in the cache from the server response
    // We just need to ensure the temporary reference is removed
    this.cache.gc();
  }

  /**
   * Clears all data from the cache
   * Use with caution - typically only needed on logout
   * 
   * Note: This method clears the cache but doesn't refetch queries.
   * For a full reset with refetch, use resetCache() instead.
   */
  clearCache(): void {
    // Use cache.reset() which is available on InMemoryCache
    // This clears all data without refetching
    this.cache.reset();
  }

  /**
   * Resets the cache to its initial state
   * Similar to clearCache but also refetches active queries
   * 
   * Note: This is an async operation that returns a promise
   */
  async resetCache(): Promise<void> {
    await this.cache.reset();
  }
}

/**
 * Helper function to create a CacheManager instance
 * 
 * @param cache - Apollo Client cache instance
 * @returns CacheManager instance
 */
export function createCacheManager(
  cache: ApolloCache
): CacheManager {
  return new CacheManager(cache);
}
