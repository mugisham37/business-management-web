import { StoreObject, DocumentNode } from '@apollo/client';
import { apolloClient } from './client';

/**
 * Cache utilities for managing Apollo Client cache
 */

interface CacheListData {
  [key: string]: StoreObject[];
}

/**
 * Update cache after mutations
 */
export const updateCacheAfterMutation = {
  /**
   * Add item to a list in cache
   */
  addToList: <T extends StoreObject>(
    listQuery: DocumentNode,
    listField: string,
    newItem: T,
    variables?: Record<string, unknown>
  ) => {
    const cache = apolloClient.cache;
    
    try {
      const existingData = cache.readQuery({
        query: listQuery,
        variables,
      }) as CacheListData | null;

      if (existingData && existingData[listField] && Array.isArray(existingData[listField])) {
        cache.writeQuery({
          query: listQuery,
          variables,
          data: {
            ...existingData,
            [listField]: [newItem, ...(existingData[listField] || [])],
          },
        });
      }
    } catch (error) {
      console.warn('Failed to update cache after adding item:', error);
    }
  },

  /**
   * Remove item from a list in cache
   */
  removeFromList: (
    listQuery: DocumentNode,
    listField: string,
    itemId: string,
    variables?: Record<string, unknown>
  ) => {
    const cache = apolloClient.cache;
    
    try {
      const existingData = cache.readQuery({
        query: listQuery,
        variables,
      }) as CacheListData | null;

      if (existingData && existingData[listField] && Array.isArray(existingData[listField])) {
        cache.writeQuery({
          query: listQuery,
          variables,
          data: {
            ...existingData,
            [listField]: existingData[listField]!.filter(
              (item: StoreObject) => item.id !== itemId
            ),
          },
        });
      }
    } catch (error) {
      console.warn('Failed to update cache after removing item:', error);
    }
  },

  /**
   * Update item in a list in cache
   */
  updateInList: <T extends StoreObject>(
    listQuery: DocumentNode,
    listField: string,
    updatedItem: T,
    variables?: Record<string, unknown>
  ) => {
    const cache = apolloClient.cache;
    
    try {
      const existingData = cache.readQuery({
        query: listQuery,
        variables,
      }) as CacheListData | null;

      if (existingData && existingData[listField] && Array.isArray(existingData[listField])) {
        cache.writeQuery({
          query: listQuery,
          variables,
          data: {
            ...existingData,
            [listField]: existingData[listField]!.map((item: StoreObject) =>
              item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            ),
          },
        });
      }
    } catch (error) {
      console.warn('Failed to update cache after updating item:', error);
    }
  },
};

/**
 * Cache invalidation utilities
 */
export const cacheInvalidation = {
  /**
   * Invalidate specific fields in cache
   */
  invalidateFields: (fieldNames: string[]) => {
    const cache = apolloClient.cache;
    
    fieldNames.forEach((fieldName) => {
      cache.evict({ fieldName });
    });
    
    cache.gc();
  },

  /**
   * Invalidate cache entries by type
   */
  invalidateByType: (typeName: string) => {
    const cache = apolloClient.cache;
    
    cache.evict({ id: `ROOT_QUERY`, fieldName: typeName });
    cache.gc();
  },

  /**
   * Invalidate specific entity
   */
  invalidateEntity: (typeName: string, id: string) => {
    const cache = apolloClient.cache;
    
    cache.evict({ id: `${typeName}:${id}` });
    cache.gc();
  },

  /**
   * Clear entire cache
   */
  clearAll: () => {
    apolloClient.cache.reset();
  },

  /**
   * Clear tenant-specific cache
   */
  clearTenantCache: () => {
    const cache = apolloClient.cache;
    
    // Evict all cached data that might be tenant-specific
    cache.evict({ fieldName: 'users' });
    cache.evict({ fieldName: 'tenants' });
    cache.evict({ fieldName: 'currentUser' });
    
    cache.gc();
  },
};

/**
 * Optimistic update utilities
 */
export const optimisticUpdates = {
  /**
   * Create optimistic response for mutations
   */
  createOptimisticResponse: <T extends StoreObject>(
    mutationType: string,
    optimisticData: Partial<T> & { __typename?: string },
    tempId?: string
  ) => {
    return {
      __typename: 'Mutation',
      [mutationType]: {
        __typename: optimisticData.__typename || 'Unknown',
        id: tempId || `temp-${Date.now()}`,
        ...optimisticData,
      },
    };
  },

  /**
   * Handle optimistic update rollback
   */
  handleOptimisticError: (error: Error, operation: string) => {
    console.error(`Optimistic update failed for ${operation}:`, error);
    
    // The cache will automatically rollback optimistic updates on error
    // Additional error handling can be added here
  },
};

/**
 * Cache debugging utilities (development only)
 */
export const cacheDebug = {
  /**
   * Log current cache state
   */
  logCacheState: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Apollo Cache State:', apolloClient.cache.extract());
    }
  },

  /**
   * Log cache size
   */
  logCacheSize: () => {
    if (process.env.NODE_ENV === 'development') {
      const cacheData = apolloClient.cache.extract();
      const size = JSON.stringify(cacheData).length;
      console.log(`Cache size: ${(size / 1024).toFixed(2)} KB`);
    }
  },

  /**
   * Monitor cache changes (development only)
   */
  watchCacheChanges: (callback?: (data: unknown) => void) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Cache monitoring enabled in development mode');
      if (callback) {
        callback(apolloClient.cache.extract());
      }
    }
  },
};

const cacheUtils = {
  updateCacheAfterMutation,
  cacheInvalidation,
  optimisticUpdates,
  cacheDebug,
};

export default cacheUtils;