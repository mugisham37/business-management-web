/**
 * useCacheTTL Hook
 * 
 * Hook for managing cache TTL in components.
 * Automatically registers queries and handles refresh.
 * 
 * Features:
 * - Automatic query registration
 * - TTL-based refresh
 * - Manual refresh capability
 * - Stale data detection
 * 
 * Requirements: 12.9
 */

import { useEffect, useCallback } from 'react';
import { DocumentNode, OperationVariables } from '@apollo/client';
import { getTTLManager, TTL_CONFIG } from '@/lib/cache/cache-ttl';

export interface UseCacheTTLOptions {
  /** Query to manage */
  query: DocumentNode;
  /** Query variables */
  variables?: OperationVariables;
  /** TTL in milliseconds */
  ttl?: number;
  /** Whether to enable TTL management */
  enabled?: boolean;
}

export interface UseCacheTTLReturn {
  /** Whether the cache is stale */
  isStale: boolean;
  /** Manually refresh the cache */
  refresh: () => Promise<void>;
  /** Invalidate the cache */
  invalidate: () => void;
  /** TTL info */
  ttlInfo: {
    age: number;
    ttl: number;
    isStale: boolean;
    timeUntilStale: number;
  } | null;
}

/**
 * useCacheTTL Hook
 * 
 * @param options - TTL options
 * @returns TTL utilities
 * 
 * @example
 * ```tsx
 * const { isStale, refresh } = useCacheTTL({
 *   query: GET_USERS,
 *   ttl: TTL_CONFIG.USERS,
 *   enabled: true,
 * });
 * 
 * // Show refresh button if stale
 * {isStale && <button onClick={refresh}>Refresh</button>}
 * ```
 * 
 * Requirements: 12.9
 */
export function useCacheTTL(options: UseCacheTTLOptions): UseCacheTTLReturn {
  const {
    query,
    variables,
    ttl = TTL_CONFIG.USERS,
    enabled = true,
  } = options;

  const ttlManager = getTTLManager();

  // Register query on mount
  useEffect(() => {
    if (enabled) {
      ttlManager.register(query, variables, ttl);
    }
  }, [query, variables, ttl, enabled, ttlManager]);

  // Check if stale
  const isStale = enabled ? ttlManager.isStale(query, variables) : false;

  // Get TTL info
  const ttlInfo = enabled ? ttlManager.getTTLInfo(query, variables) : null;

  // Refresh callback
  const refresh = useCallback(async () => {
    if (enabled) {
      await ttlManager.refreshQuery(query, variables);
    }
  }, [query, variables, enabled, ttlManager]);

  // Invalidate callback
  const invalidate = useCallback(() => {
    if (enabled) {
      ttlManager.invalidate(query, variables);
    }
  }, [query, variables, enabled, ttlManager]);

  return {
    isStale,
    refresh,
    invalidate,
    ttlInfo,
  };
}
