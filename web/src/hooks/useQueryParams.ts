/**
 * Query Parameters Hook
 * 
 * Combines pagination and filters into a single hook for list endpoints.
 * 
 * Features:
 * - Integrated pagination + filters + sorting
 * - Single query params object for API calls
 * - URL synchronization
 * - Reset all functionality
 * 
 * Requirements: Unified query parameter management
 */

import { useMemo } from 'react';
import { usePagination, PaginationConfig } from './usePagination';
import { useFilters, FiltersConfig } from './useFilters';

export interface QueryParamsConfig {
  pagination?: PaginationConfig;
  filters?: FiltersConfig;
}

export interface UseQueryParamsReturn {
  // Pagination
  pagination: ReturnType<typeof usePagination>;
  // Filters
  filters: ReturnType<typeof useFilters>;
  // Combined query params
  queryParams: Record<string, any>;
  // Reset all
  resetAll: () => void;
}

/**
 * Hook that combines pagination and filters for comprehensive query management
 * 
 * @param config - Configuration for pagination and filters
 * @returns Combined pagination, filters, and query params
 * 
 * @example
 * ```tsx
 * const { pagination, filters, queryParams } = useQueryParams({
 *   pagination: { initialPageSize: 25, syncWithUrl: true },
 *   filters: { initialSort: { field: 'createdAt', direction: 'desc' }, syncWithUrl: true },
 * });
 * 
 * // Use in API call
 * const { data } = useQuery(
 *   ['users', queryParams],
 *   () => usersApi.getAll(queryParams)
 * );
 * 
 * // Update from response
 * useEffect(() => {
 *   if (data?.meta?.total) {
 *     pagination.setTotalItems(data.meta.total);
 *   }
 * }, [data]);
 * ```
 */
export function useQueryParams(config: QueryParamsConfig = {}): UseQueryParamsReturn {
  const pagination = usePagination(config.pagination);
  const filters = useFilters(config.filters);

  // Combine all query params
  const queryParams = useMemo(() => {
    return {
      page: pagination.page,
      limit: pagination.pageSize,
      ...filters.queryParams,
    };
  }, [pagination.page, pagination.pageSize, filters.queryParams]);

  // Reset all
  const resetAll = () => {
    pagination.reset();
    filters.reset();
  };

  return {
    pagination,
    filters,
    queryParams,
    resetAll,
  };
}
