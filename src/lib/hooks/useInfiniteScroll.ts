/**
 * useInfiniteScroll Hook
 * 
 * Provides infinite scroll functionality for paginated data.
 * Manages loading more data and tracking pagination state.
 * 
 * Features:
 * - Automatic page increment
 * - Accumulated data management
 * - Loading state tracking
 * - Has more detection
 * 
 * Requirements: 12.2
 */

import { useState, useCallback, useMemo } from 'react';
import { PaginationInfo } from '@/lib/types/pagination.types';

export interface UseInfiniteScrollOptions<T> {
  /** Initial data */
  initialData?: T[];
  /** Current pagination info */
  pagination?: PaginationInfo;
  /** Function to load next page */
  onLoadMore: (page: number) => Promise<void> | void;
  /** Whether data is currently loading */
  loading?: boolean;
}

export interface UseInfiniteScrollReturn<T> {
  /** All accumulated data */
  data: T[];
  /** Whether more data is available */
  hasMore: boolean;
  /** Whether currently loading */
  loading: boolean;
  /** Load next page */
  loadMore: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
}

/**
 * useInfiniteScroll Hook
 * 
 * @example
 * ```tsx
 * const { pagination, paginatedUsers, setPage } = useUsers();
 * const { data, hasMore, loading, loadMore } = useInfiniteScroll({
 *   initialData: paginatedUsers,
 *   pagination,
 *   onLoadMore: (page) => setPage(page),
 *   loading: usersLoading,
 * });
 * ```
 * 
 * Requirements: 12.2
 */
export function useInfiniteScroll<T>({
  initialData = [],
  pagination,
  onLoadMore,
  loading = false,
}: UseInfiniteScrollOptions<T>): UseInfiniteScrollReturn<T> {
  const [accumulatedData, setAccumulatedData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Accumulate data when new data arrives
  useMemo(() => {
    if (initialData && initialData.length > 0) {
      setAccumulatedData((prev) => {
        // If we're on page 1, replace all data
        if (currentPage === 1) {
          return initialData;
        }
        
        // Otherwise, append new data
        // Filter out duplicates based on id if items have id property
        const newItems = initialData.filter((item) => {
          const rec = item as Record<string, unknown>;
          if (!rec.id) return true;
          return !prev.some((existing) => (existing as Record<string, unknown>).id === rec.id);
        });
        
        return [...prev, ...newItems];
      });
    }
  }, [initialData, currentPage]);

  // Determine if more data is available
  const hasMore = useMemo(() => {
    if (!pagination) return false;
    return pagination.currentPage < pagination.totalPages;
  }, [pagination]);

  /**
   * Load next page of data
   */
  const loadMore = useCallback(async () => {
    if (isLoadingMore || loading || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    const nextPage = currentPage + 1;
    
    try {
      await Promise.resolve(onLoadMore(nextPage));
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Error loading more data:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, loading, hasMore, currentPage, onLoadMore]);

  /**
   * Reset to initial state
   */
  const reset = useCallback(() => {
    setAccumulatedData([]);
    setCurrentPage(1);
    setIsLoadingMore(false);
  }, []);

  return {
    data: accumulatedData,
    hasMore,
    loading: loading || isLoadingMore,
    loadMore,
    reset,
  };
}
