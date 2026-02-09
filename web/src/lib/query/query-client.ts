/**
 * React Query Client Configuration
 * 
 * Configures the QueryClient with optimized defaults for caching,
 * retry logic, and error handling.
 * 
 * Features:
 * - Intelligent cache management
 * - Automatic background refetching
 * - Retry logic with exponential backoff
 * - Error handling integration
 * - Development tools support
 * 
 * Requirements: Client-side caching layer for improved performance
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { API_CONFIG } from '@/lib/constants/api';

/**
 * Default options for React Query
 * 
 * Queries:
 * - staleTime: 5 minutes - Data is considered fresh for 5 minutes
 * - cacheTime: 10 minutes - Unused data is garbage collected after 10 minutes
 * - refetchOnWindowFocus: true - Refetch when user returns to tab
 * - refetchOnReconnect: true - Refetch when network reconnects
 * - retry: 3 attempts with exponential backoff
 * 
 * Mutations:
 * - retry: 1 attempt - Only retry once for mutations
 */
const queryConfig: DefaultOptions = {
  queries: {
    // Cache configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    
    // Refetch configuration
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
    
    // Retry configuration
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors (client errors)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for network errors and 5xx errors
      return failureCount < API_CONFIG.RETRY.MAX_RETRIES;
    },
    retryDelay: (attemptIndex) => {
      // Exponential backoff: 1s, 2s, 4s
      return Math.min(
        API_CONFIG.RETRY.INITIAL_DELAY * Math.pow(API_CONFIG.RETRY.BACKOFF_MULTIPLIER, attemptIndex),
        API_CONFIG.RETRY.MAX_DELAY
      );
    },
  },
  mutations: {
    // Mutations should retry less aggressively
    retry: 1,
    retryDelay: API_CONFIG.RETRY.INITIAL_DELAY,
  },
};

/**
 * Create and configure the QueryClient instance
 * 
 * This client is used throughout the application for data fetching,
 * caching, and synchronization.
 */
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

/**
 * Query key factory for consistent cache key generation
 * 
 * Provides standardized query keys for different resource types.
 * This ensures cache invalidation works correctly across the app.
 * 
 * @example
 * ```tsx
 * // Get all users
 * useQuery(queryKeys.users.all, () => usersApi.getAll());
 * 
 * // Get user by ID
 * useQuery(queryKeys.users.detail(userId), () => usersApi.getById(userId));
 * 
 * // Get users with filters
 * useQuery(queryKeys.users.list(filters), () => usersApi.getAll(filters));
 * ```
 */
export const queryKeys = {
  // Authentication
  auth: {
    all: ['auth'] as const,
    currentUser: () => [...queryKeys.auth.all, 'current-user'] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    hierarchy: (id: string) => [...queryKeys.users.detail(id), 'hierarchy'] as const,
    createdUsers: (id: string) => [...queryKeys.users.detail(id), 'created-users'] as const,
  },
  
  // Roles
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.roles.lists(), filters] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
  
  // Sessions
  sessions: {
    all: ['sessions'] as const,
    lists: () => [...queryKeys.sessions.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.sessions.lists(), filters] as const,
  },
  
  // MFA
  mfa: {
    all: ['mfa'] as const,
    status: () => [...queryKeys.mfa.all, 'status'] as const,
  },
} as const;

/**
 * Cache invalidation helpers
 * 
 * Provides convenient functions for invalidating related caches
 * after mutations.
 */
export const cacheInvalidation = {
  /**
   * Invalidate all user-related queries
   */
  invalidateUsers: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  },
  
  /**
   * Invalidate specific user detail
   */
  invalidateUser: (id: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
  },
  
  /**
   * Invalidate all role-related queries
   */
  invalidateRoles: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
  },
  
  /**
   * Invalidate specific role detail
   */
  invalidateRole: (id: string) => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.roles.detail(id) });
  },
  
  /**
   * Invalidate all session-related queries
   */
  invalidateSessions: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.sessions.all });
  },
  
  /**
   * Invalidate current user data
   */
  invalidateCurrentUser: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser() });
  },
  
  /**
   * Invalidate MFA status
   */
  invalidateMfaStatus: () => {
    return queryClient.invalidateQueries({ queryKey: queryKeys.mfa.status() });
  },
};
