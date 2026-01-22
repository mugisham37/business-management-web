import { useApolloClient, FetchPolicy, WatchQueryFetchPolicy } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { cacheInvalidation } from '@/lib/apollo/cache-utils';

export type CacheStrategy = 
  | 'cache-first'
  | 'cache-and-network'
  | 'network-only'
  | 'cache-only'
  | 'no-cache'
  | 'standby';

interface CacheStrategyOptions {
  defaultStrategy?: CacheStrategy;
  enableOfflineMode?: boolean;
  cacheTimeout?: number;
}

/**
 * Hook for managing cache strategies and policies
 */
export function useCacheStrategy(options: CacheStrategyOptions = {}) {
  const client = useApolloClient();
  const {
    defaultStrategy = 'cache-first',
    enableOfflineMode = false,
    cacheTimeout = 300000, // 5 minutes
  } = options;

  // Determine optimal fetch policy based on network status and data freshness
  const getOptimalFetchPolicy = useCallback((
    lastFetch?: Date,
    isOffline?: boolean
  ): WatchQueryFetchPolicy => {
    if (isOffline && enableOfflineMode) {
      return 'cache-only';
    }

    if (lastFetch) {
      const timeSinceLastFetch = Date.now() - lastFetch.getTime();
      if (timeSinceLastFetch < cacheTimeout) {
        return 'cache-first';
      }
    }

    return defaultStrategy as WatchQueryFetchPolicy;
  }, [defaultStrategy, enableOfflineMode, cacheTimeout]);

  // Cache warming for critical data
  const warmCache = useCallback(async (queries: Array<{
    query: any;
    variables?: any;
  }>) => {
    const promises = queries.map(({ query, variables }) =>
      client.query({
        query,
        variables,
        fetchPolicy: 'network-only',
        errorPolicy: 'ignore',
      })
    );

    try {
      await Promise.allSettled(promises);
      console.log('Cache warming completed');
    } catch (error) {
      console.warn('Cache warming failed:', error);
    }
  }, [client]);

  // Intelligent cache invalidation based on mutation impact
  const invalidateRelatedData = useCallback((
    mutationType: string,
    affectedEntityTypes: string[]
  ) => {
    // Invalidate related queries based on mutation type
    const invalidationMap: Record<string, string[]> = {
      'createUser': ['users', 'userStats'],
      'updateUser': ['users', 'currentUser'],
      'deleteUser': ['users', 'userStats'],
      'createTenant': ['tenants', 'tenantStats'],
      'updateTenant': ['tenants', 'currentTenant'],
      'deleteTenant': ['tenants', 'tenantStats'],
    };

    const fieldsToInvalidate = invalidationMap[mutationType] || affectedEntityTypes;
    
    if (fieldsToInvalidate.length > 0) {
      cacheInvalidation.invalidateFields(fieldsToInvalidate);
    }
  }, []);

  // Cache size monitoring and cleanup
  const monitorCacheSize = useCallback(() => {
    const cacheData = client.cache.extract();
    const cacheSize = JSON.stringify(cacheData).length;
    const maxCacheSize = 10 * 1024 * 1024; // 10MB

    if (cacheSize > maxCacheSize) {
      console.warn(`Cache size (${(cacheSize / 1024 / 1024).toFixed(2)}MB) exceeds limit`);
      
      // Perform selective cache cleanup
      const oldestEntries = Object.keys(cacheData)
        .filter(key => key.startsWith('ROOT_QUERY'))
        .slice(0, Math.floor(Object.keys(cacheData).length * 0.3));

      oldestEntries.forEach(key => {
        client.cache.evict({ id: key });
      });
      
      client.cache.gc();
    }

    return cacheSize;
  }, [client]);

  // Periodic cache cleanup
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      monitorCacheSize();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [monitorCacheSize]);

  // Network status aware caching
  const getNetworkAwareFetchPolicy = useCallback((
    isOnline: boolean = navigator?.onLine ?? true
  ): FetchPolicy => {
    if (!isOnline && enableOfflineMode) {
      return 'cache-only';
    }

    if (!isOnline) {
      return 'cache-first';
    }

    return defaultStrategy as FetchPolicy;
  }, [defaultStrategy, enableOfflineMode]);

  // Cache preloading for anticipated user actions
  const preloadData = useCallback(async (
    preloadQueries: Array<{
      query: any;
      variables?: any;
      priority?: 'high' | 'medium' | 'low';
    }>
  ) => {
    // Sort by priority
    const sortedQueries = preloadQueries.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
    });

    // Execute high priority queries immediately
    const highPriorityQueries = sortedQueries.filter(q => q.priority === 'high');
    if (highPriorityQueries.length > 0) {
      await warmCache(highPriorityQueries);
    }

    // Execute medium and low priority queries with delay
    const otherQueries = sortedQueries.filter(q => q.priority !== 'high');
    if (otherQueries.length > 0) {
      setTimeout(() => {
        warmCache(otherQueries);
      }, 1000);
    }
  }, [warmCache]);

  return {
    getOptimalFetchPolicy,
    getNetworkAwareFetchPolicy,
    warmCache,
    preloadData,
    invalidateRelatedData,
    monitorCacheSize,
    
    // Cache utilities
    clearCache: () => client.cache.reset(),
    evictEntity: (id: string) => {
      client.cache.evict({ id });
      client.cache.gc();
    },
    
    // Cache inspection (development)
    inspectCache: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Cache contents:', client.cache.extract());
        console.log('Cache size:', monitorCacheSize(), 'bytes');
      }
    },
  };
}