/**
 * Filters Hook
 * 
 * Provides comprehensive filtering and sorting state management with URL sync.
 * 
 * Features:
 * - Dynamic filter management
 * - Sort field and direction
 * - Search query handling
 * - URL query parameter sync
 * - Filter reset functionality
 * 
 * Requirements: Advanced filtering/sorting support for list endpoints
 */

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export type SortDirection = 'asc' | 'desc';

export interface FilterValue {
  [key: string]: any;
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

export interface FiltersConfig {
  initialFilters?: FilterValue;
  initialSort?: SortConfig;
  initialSearch?: string;
  syncWithUrl?: boolean;
  searchParam?: string;
  sortFieldParam?: string;
  sortDirectionParam?: string;
}

export interface FiltersState {
  filters: FilterValue;
  sort: SortConfig | null;
  search: string;
}

export interface FiltersActions {
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  setFilters: (filters: FilterValue) => void;
  setSort: (field: string, direction?: SortDirection) => void;
  toggleSortDirection: (field: string) => void;
  clearSort: () => void;
  setSearch: (query: string) => void;
  clearSearch: () => void;
  reset: () => void;
  hasActiveFilters: boolean;
}

export interface UseFiltersReturn extends FiltersState, FiltersActions {
  queryParams: Record<string, any>;
}

/**
 * Hook for managing filters, sorting, and search with optional URL synchronization
 * 
 * @param config - Filters configuration
 * @returns Filters state and actions
 * 
 * @example
 * ```tsx
 * const filters = useFilters({
 *   initialFilters: { status: 'active' },
 *   initialSort: { field: 'createdAt', direction: 'desc' },
 *   syncWithUrl: true,
 * });
 * 
 * // Use in API call
 * const { data } = useQuery(
 *   ['users', filters.queryParams],
 *   () => usersApi.getAll(filters.queryParams)
 * );
 * 
 * // Update filters
 * filters.setFilter('role', 'admin');
 * filters.setSort('name', 'asc');
 * filters.setSearch('john');
 * ```
 */
export function useFilters(config: FiltersConfig = {}): UseFiltersReturn {
  const {
    initialFilters = {},
    initialSort = null,
    initialSearch = '',
    syncWithUrl = false,
    searchParam = 'search',
    sortFieldParam = 'sortBy',
    sortDirectionParam = 'sortOrder',
  } = config;

  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL if sync is enabled
  const getInitialFilters = useCallback((): FilterValue => {
    if (syncWithUrl && searchParams) {
      const urlFilters: FilterValue = { ...initialFilters };
      searchParams.forEach((value, key) => {
        if (
          key !== searchParam &&
          key !== sortFieldParam &&
          key !== sortDirectionParam &&
          key !== 'page' &&
          key !== 'pageSize'
        ) {
          urlFilters[key] = value;
        }
      });
      return urlFilters;
    }
    return initialFilters;
  }, [syncWithUrl, searchParams, initialFilters, searchParam, sortFieldParam, sortDirectionParam]);

  const getInitialSort = useCallback((): SortConfig | null => {
    if (syncWithUrl && searchParams) {
      const field = searchParams.get(sortFieldParam);
      const direction = searchParams.get(sortDirectionParam) as SortDirection;
      if (field) {
        return { field, direction: direction || 'asc' };
      }
    }
    return initialSort;
  }, [syncWithUrl, searchParams, initialSort, sortFieldParam, sortDirectionParam]);

  const getInitialSearch = useCallback((): string => {
    if (syncWithUrl && searchParams) {
      return searchParams.get(searchParam) || initialSearch;
    }
    return initialSearch;
  }, [syncWithUrl, searchParams, initialSearch, searchParam]);

  const [filters, setFiltersState] = useState<FilterValue>(getInitialFilters);
  const [sort, setSortState] = useState<SortConfig | null>(getInitialSort);
  const [search, setSearchState] = useState<string>(getInitialSearch);

  // Sync with URL
  const updateUrl = useCallback(
    (newFilters: FilterValue, newSort: SortConfig | null, newSearch: string) => {
      if (!syncWithUrl || typeof window === 'undefined') return;

      const params = new URLSearchParams(searchParams?.toString() || '');

      // Remove old filter params
      Array.from(params.keys()).forEach((key) => {
        if (
          key !== 'page' &&
          key !== 'pageSize' &&
          key !== searchParam &&
          key !== sortFieldParam &&
          key !== sortDirectionParam
        ) {
          params.delete(key);
        }
      });

      // Add new filters
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });

      // Add sort
      if (newSort) {
        params.set(sortFieldParam, newSort.field);
        params.set(sortDirectionParam, newSort.direction);
      } else {
        params.delete(sortFieldParam);
        params.delete(sortDirectionParam);
      }

      // Add search
      if (newSearch) {
        params.set(searchParam, newSearch);
      } else {
        params.delete(searchParam);
      }

      router.push(`?${params.toString()}`, { scroll: false });
    },
    [syncWithUrl, searchParams, router, searchParam, sortFieldParam, sortDirectionParam]
  );

  // Set single filter
  const setFilter = useCallback(
    (key: string, value: any) => {
      const newFilters = { ...filters, [key]: value };
      setFiltersState(newFilters);
      updateUrl(newFilters, sort, search);
    },
    [filters, sort, search, updateUrl]
  );

  // Remove single filter
  const removeFilter = useCallback(
    (key: string) => {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFiltersState(newFilters);
      updateUrl(newFilters, sort, search);
    },
    [filters, sort, search, updateUrl]
  );

  // Set all filters
  const setFilters = useCallback(
    (newFilters: FilterValue) => {
      setFiltersState(newFilters);
      updateUrl(newFilters, sort, search);
    },
    [sort, search, updateUrl]
  );

  // Set sort
  const setSort = useCallback(
    (field: string, direction: SortDirection = 'asc') => {
      const newSort = { field, direction };
      setSortState(newSort);
      updateUrl(filters, newSort, search);
    },
    [filters, search, updateUrl]
  );

  // Toggle sort direction
  const toggleSortDirection = useCallback(
    (field: string) => {
      const newDirection: SortDirection =
        sort?.field === field && sort.direction === 'asc' ? 'desc' : 'asc';
      const newSort = { field, direction: newDirection };
      setSortState(newSort);
      updateUrl(filters, newSort, search);
    },
    [sort, filters, search, updateUrl]
  );

  // Clear sort
  const clearSort = useCallback(() => {
    setSortState(null);
    updateUrl(filters, null, search);
  }, [filters, search, updateUrl]);

  // Set search
  const setSearch = useCallback(
    (query: string) => {
      setSearchState(query);
      updateUrl(filters, sort, query);
    },
    [filters, sort, updateUrl]
  );

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchState('');
    updateUrl(filters, sort, '');
  }, [filters, sort, updateUrl]);

  // Reset all
  const reset = useCallback(() => {
    setFiltersState(initialFilters);
    setSortState(initialSort);
    setSearchState(initialSearch);
    if (syncWithUrl) {
      updateUrl(initialFilters, initialSort, initialSearch);
    }
  }, [initialFilters, initialSort, initialSearch, syncWithUrl, updateUrl]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || !!sort || !!search;
  }, [filters, sort, search]);

  // Build query params object for API calls
  const queryParams = useMemo(() => {
    const params: Record<string, any> = { ...filters };

    if (sort) {
      params.sortBy = sort.field;
      params.sortOrder = sort.direction;
    }

    if (search) {
      params.search = search;
    }

    return params;
  }, [filters, sort, search]);

  return {
    filters,
    sort,
    search,
    setFilter,
    removeFilter,
    setFilters,
    setSort,
    toggleSortDirection,
    clearSort,
    setSearch,
    clearSearch,
    reset,
    hasActiveFilters,
    queryParams,
  };
}
