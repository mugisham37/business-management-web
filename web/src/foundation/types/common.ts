/**
 * Common Types
 * 
 * Utility types, filter types, and sort types used throughout the application.
 * These types provide reusable type definitions for common patterns.
 * For GraphQL-generated filter types like UserFilters, AuditLogFilters, import from './generated/graphql-types'
 */

/**
 * Makes all properties of T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Makes all properties of T optional
 */
export type Optional<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Makes specific properties K of T optional
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes specific properties K of T required
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Sort direction for queries
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * Generic sort configuration
 */
export interface SortConfig<T extends string = string> {
  field: T;
  direction: SortDirection;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  from?: string;
  to?: string;
}

/**
 * String filter with various matching options
 */
export interface StringFilter {
  equals?: string;
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  in?: string[];
  notIn?: string[];
}

/**
 * Number filter with comparison operators
 */
export interface NumberFilter {
  equals?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  in?: number[];
  notIn?: number[];
}

/**
 * Boolean filter
 */
export interface BooleanFilter {
  equals?: boolean;
}

/**
 * Generic filter configuration for list queries
 */
export interface FilterConfig {
  search?: string;
  dateRange?: DateRangeFilter;
  [key: string]: any;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  page?: number;
  limit?: number;
  cursor?: string;
}

/**
 * Generic list query options
 */
export interface ListQueryOptions<TFilter = FilterConfig, TSortField extends string = string> {
  filters?: TFilter;
  sort?: SortConfig<TSortField>;
  pagination?: PaginationConfig;
}
