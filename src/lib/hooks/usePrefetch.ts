/**
 * usePrefetch Hook
 * 
 * Provides data prefetching capabilities for improved UX.
 * Prefetches data before user needs it (on hover, scroll, etc.)
 * 
 * Features:
 * - Prefetch on hover
 * - Prefetch on scroll
 * - Prefetch next page
 * - Debounced prefetching
 * - Automatic cleanup
 * 
 * Requirements: 12.7
 */

import { useCallback, useRef } from 'react';
import { useApolloClient, DocumentNode, OperationVariables } from '@apollo/client';

export interface PrefetchOptions {
  /** Delay before prefetching (ms) */
  delay?: number;
  /** Whether to prefetch only if not in cache */
  skipIfCached?: boolean;
}

export interface UsePrefetchReturn {
  /** Prefetch a query */
  prefetch: (query: DocumentNode, variables?: OperationVariables) => void;
  /** Prefetch on hover handler */
  onHoverPrefetch: (query: DocumentNode, variables?: OperationVariables) => {
    onMouseEnter: () => void;
    onFocus: () => void;
  };
  /** Cancel pending prefetch */
  cancelPrefetch: () => void;
}

/**
 * usePrefetch Hook
 * 
 * @param options - Prefetch options
 * @returns Prefetch utilities
 * 
 * @example
 * ```tsx
 * const { prefetch, onHoverPrefetch } = usePrefetch({ delay: 100 });
 * 
 * // Prefetch on hover
 * <button {...onHoverPrefetch(GET_USER, { userId: '123' })}>
 *   View User
 * </button>
 * 
 * // Manual prefetch
 * useEffect(() => {
 *   if (shouldPrefetch) {
 *     prefetch(GET_USERS);
 *   }
 * }, [shouldPrefetch]);
 * ```
 * 
 * Requirements: 12.7
 */
export function usePrefetch(options: PrefetchOptions = {}): UsePrefetchReturn {
  const { delay = 100, skipIfCached = true } = options;
  const client = useApolloClient();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prefetchedRef = useRef<Set<string>>(new Set());

  /**
   * Cancel pending prefetch
   */
  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Prefetch a query
   */
  const prefetch = useCallback(
    (query: DocumentNode, variables?: OperationVariables) => {
      // Cancel any pending prefetch
      cancelPrefetch();

      // Create cache key
      const cacheKey = JSON.stringify({ query: query.loc?.source.body, variables });

      // Skip if already prefetched
      if (prefetchedRef.current.has(cacheKey)) {
        return;
      }

      // Check if data is in cache
      if (skipIfCached) {
        try {
          const cached = client.cache.readQuery({ query, variables });
          if (cached) {
            prefetchedRef.current.add(cacheKey);
            return;
          }
        } catch {
          // Not in cache, proceed with prefetch
        }
      }

      // Schedule prefetch
      timeoutRef.current = setTimeout(() => {
        client
          .query({
            query,
            variables,
            fetchPolicy: 'cache-first',
          })
          .then(() => {
            prefetchedRef.current.add(cacheKey);
          })
          .catch((error) => {
            console.error('Prefetch failed:', error);
          });
      }, delay);
    },
    [client, delay, skipIfCached, cancelPrefetch]
  );

  /**
   * Create hover prefetch handlers
   */
  const onHoverPrefetch = useCallback(
    (query: DocumentNode, variables?: OperationVariables) => ({
      onMouseEnter: () => prefetch(query, variables),
      onFocus: () => prefetch(query, variables),
    }),
    [prefetch]
  );

  return {
    prefetch,
    onHoverPrefetch,
    cancelPrefetch,
  };
}

/**
 * usePrefetchNextPage Hook
 * 
 * Automatically prefetches the next page when user scrolls near bottom.
 * 
 * @param query - Query to prefetch
 * @param currentPage - Current page number
 * @param hasNextPage - Whether there is a next page
 * @param variables - Query variables (page will be incremented)
 * 
 * @example
 * ```tsx
 * const { pagination } = useUsers();
 * usePrefetchNextPage(
 *   GET_USERS,
 *   pagination.currentPage,
 *   pagination.hasNextPage,
 *   { limit: 10 }
 * );
 * ```
 * 
 * Requirements: 12.7
 */
export function usePrefetchNextPage(
  query: DocumentNode,
  currentPage: number,
  hasNextPage: boolean,
  variables?: OperationVariables
): void {
  const { prefetch } = usePrefetch({ delay: 500 });

  // Prefetch next page when current page changes
  useCallback(() => {
    if (hasNextPage) {
      const nextPageVariables = {
        ...variables,
        page: currentPage + 1,
      };
      prefetch(query, nextPageVariables);
    }
  }, [query, currentPage, hasNextPage, variables, prefetch])();
}

/**
 * usePrefetchOnScroll Hook
 * 
 * Prefetches data when user scrolls past a threshold.
 * 
 * @param query - Query to prefetch
 * @param variables - Query variables
 * @param threshold - Scroll threshold (0-1, where 1 is bottom)
 * 
 * @example
 * ```tsx
 * usePrefetchOnScroll(GET_USERS, { limit: 20 }, 0.8);
 * ```
 * 
 * Requirements: 12.7
 */
export function usePrefetchOnScroll(
  query: DocumentNode,
  variables?: OperationVariables,
  threshold: number = 0.8
): void {
  const { prefetch } = usePrefetch({ delay: 200 });
  const hasPrefetchedRef = useRef(false);

  useCallback(() => {
    const handleScroll = () => {
      if (hasPrefetchedRef.current) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

      if (scrollPercentage >= threshold) {
        prefetch(query, variables);
        hasPrefetchedRef.current = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [query, variables, threshold, prefetch])();
}
