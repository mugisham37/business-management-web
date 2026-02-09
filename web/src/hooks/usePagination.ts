/**
 * Pagination Hook
 * 
 * Provides comprehensive pagination state management with URL sync.
 * 
 * Features:
 * - Page navigation (next, prev, goto)
 * - Page size management
 * - Total pages calculation
 * - URL query parameter sync
 * - Reset functionality
 * 
 * Requirements: Advanced pagination support for list endpoints
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface PaginationConfig {
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  syncWithUrl?: boolean;
  pageParam?: string;
  pageSizeParam?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  canNextPage: boolean;
  canPrevPage: boolean;
  reset: () => void;
}

export interface UsePaginationReturn extends PaginationState, PaginationActions {
  pageSizeOptions: number[];
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * Hook for managing pagination state with optional URL synchronization
 * 
 * @param config - Pagination configuration
 * @returns Pagination state and actions
 * 
 * @example
 * ```tsx
 * const pagination = usePagination({
 *   initialPageSize: 25,
 *   syncWithUrl: true,
 * });
 * 
 * // Use in API call
 * const { data } = useQuery(['users', pagination.page, pagination.pageSize], () =>
 *   usersApi.getAll({ page: pagination.page, limit: pagination.pageSize })
 * );
 * 
 * // Update total from response
 * useEffect(() => {
 *   if (data?.meta?.total) {
 *     pagination.setTotalItems(data.meta.total);
 *   }
 * }, [data]);
 * ```
 */
export function usePagination(config: PaginationConfig = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 25,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    syncWithUrl = false,
    pageParam = 'page',
    pageSizeParam = 'pageSize',
  } = config;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL if sync is enabled
  const getInitialPage = useCallback(() => {
    if (syncWithUrl && searchParams) {
      const urlPage = searchParams.get(pageParam);
      return urlPage ? parseInt(urlPage, 10) : initialPage;
    }
    return initialPage;
  }, [syncWithUrl, searchParams, pageParam, initialPage]);

  const getInitialPageSize = useCallback(() => {
    if (syncWithUrl && searchParams) {
      const urlPageSize = searchParams.get(pageSizeParam);
      return urlPageSize ? parseInt(urlPageSize, 10) : initialPageSize;
    }
    return initialPageSize;
  }, [syncWithUrl, searchParams, pageSizeParam, initialPageSize]);

  const [page, setPageState] = useState(getInitialPage);
  const [pageSize, setPageSizeState] = useState(getInitialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1;
  }, [totalItems, pageSize]);

  // Sync with URL
  const updateUrl = useCallback(
    (newPage: number, newPageSize: number) => {
      if (!syncWithUrl || typeof window === 'undefined') return;

      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set(pageParam, newPage.toString());
      params.set(pageSizeParam, newPageSize.toString());

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [syncWithUrl, searchParams, router, pageParam, pageSizeParam]
  );

  // Set page with URL sync
  const setPage = useCallback(
    (newPage: number) => {
      const validPage = Math.max(1, Math.min(newPage, totalPages));
      setPageState(validPage);
      updateUrl(validPage, pageSize);
    },
    [totalPages, pageSize, updateUrl]
  );

  // Set page size with URL sync and reset to page 1
  const setPageSize = useCallback(
    (newPageSize: number) => {
      setPageSizeState(newPageSize);
      setPageState(1);
      updateUrl(1, newPageSize);
    },
    [updateUrl]
  );

  // Navigation actions
  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages, setPage]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page, setPage]);

  const firstPage = useCallback(() => {
    setPage(1);
  }, [setPage]);

  const lastPage = useCallback(() => {
    setPage(totalPages);
  }, [totalPages, setPage]);

  const canNextPage = page < totalPages;
  const canPrevPage = page > 1;

  // Reset to initial state
  const reset = useCallback(() => {
    setPageState(initialPage);
    setPageSizeState(initialPageSize);
    setTotalItems(0);
    if (syncWithUrl) {
      updateUrl(initialPage, initialPageSize);
    }
  }, [initialPage, initialPageSize, syncWithUrl, updateUrl]);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    pageSizeOptions,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    canNextPage,
    canPrevPage,
    reset,
  };
}
