/**
 * Cache TTL (Time-To-Live) Management
 * 
 * Manages cache expiration and automatic refresh for different data types.
 * Implements TTL strategies to ensure data freshness.
 * 
 * Features:
 * - Configurable TTL per query type
 * - Automatic cache invalidation on expiry
 * - Background refresh for stale data
 * - Manual cache refresh
 * 
 * Requirements: 12.9
 */

import { ApolloClient, DocumentNode, OperationVariables } from '@apollo/client';

/**
 * TTL configuration for different query types (in milliseconds)
 * 
 * Requirements: 12.9
 */
export const TTL_CONFIG = {
  // Frequently changing data - short TTL
  HEALTH_CHECK: 30 * 1000, // 30 seconds
  ACTIVE_SESSIONS: 60 * 1000, // 1 minute
  
  // User data - medium TTL
  USERS: 5 * 60 * 1000, // 5 minutes
  USER_DETAILS: 5 * 60 * 1000, // 5 minutes
  USER_PERMISSIONS: 5 * 60 * 1000, // 5 minutes
  
  // Organization data - medium TTL
  ORGANIZATION: 10 * 60 * 1000, // 10 minutes
  BRANCHES: 10 * 60 * 1000, // 10 minutes
  DEPARTMENTS: 10 * 60 * 1000, // 10 minutes
  
  // Rarely changing data - long TTL
  BUSINESS_RULES: 30 * 60 * 1000, // 30 minutes
  PERMISSION_HISTORY: 30 * 60 * 1000, // 30 minutes
  
  // Audit logs - very long TTL (historical data)
  AUDIT_LOGS: 60 * 60 * 1000, // 1 hour
} as const;

/**
 * Cache entry with TTL metadata
 */
interface CacheEntry {
  query: DocumentNode;
  variables?: OperationVariables;
  timestamp: number;
  ttl: number;
}

/**
 * Cache TTL Manager
 * 
 * Manages TTL for cached queries and handles automatic refresh.
 * 
 * Requirements: 12.9
 */
export class CacheTTLManager {
  private client: ApolloClient;
  private entries: Map<string, CacheEntry>;
  private refreshIntervals: Map<string, NodeJS.Timeout>;

  constructor(client: ApolloClient) {
    this.client = client;
    this.entries = new Map();
    this.refreshIntervals = new Map();
  }

  /**
   * Generate cache key from query and variables
   */
  private getCacheKey(query: DocumentNode, variables?: OperationVariables): string {
    return JSON.stringify({
      query: query.loc?.source.body,
      variables,
    });
  }

  /**
   * Register a query with TTL
   * 
   * @param query - GraphQL query
   * @param variables - Query variables
   * @param ttl - Time to live in milliseconds
   * 
   * Requirements: 12.9
   */
  register(
    query: DocumentNode,
    variables?: OperationVariables,
    ttl: number = TTL_CONFIG.USERS
  ): void {
    const key = this.getCacheKey(query, variables);
    
    this.entries.set(key, {
      query,
      variables,
      timestamp: Date.now(),
      ttl,
    });

    // Set up automatic refresh
    this.scheduleRefresh(key, ttl);
  }

  /**
   * Schedule automatic refresh for a cache entry
   */
  private scheduleRefresh(key: string, ttl: number): void {
    // Clear existing interval if any
    const existingInterval = this.refreshIntervals.get(key);
    if (existingInterval) {
      clearTimeout(existingInterval);
    }

    // Schedule refresh
    const interval = setTimeout(() => {
      this.refresh(key);
    }, ttl);

    this.refreshIntervals.set(key, interval);
  }

  /**
   * Check if a cache entry is stale
   * 
   * @param query - GraphQL query
   * @param variables - Query variables
   * @returns Whether the cache entry is stale
   * 
   * Requirements: 12.9
   */
  isStale(query: DocumentNode, variables?: OperationVariables): boolean {
    const key = this.getCacheKey(query, variables);
    const entry = this.entries.get(key);

    if (!entry) {
      return true; // Not registered, consider stale
    }

    const age = Date.now() - entry.timestamp;
    return age > entry.ttl;
  }

  /**
   * Refresh a cache entry
   * 
   * @param key - Cache key
   * 
   * Requirements: 12.9
   */
  private async refresh(key: string): Promise<void> {
    const entry = this.entries.get(key);
    if (!entry) return;

    try {
      // Refetch from network
      await this.client.query({
        query: entry.query,
        variables: entry.variables,
        fetchPolicy: 'network-only',
      });

      // Update timestamp
      entry.timestamp = Date.now();
      this.entries.set(key, entry);

      // Schedule next refresh
      this.scheduleRefresh(key, entry.ttl);
    } catch (error) {
      console.error('Cache refresh failed:', error);
      
      // Retry after a shorter interval on error
      this.scheduleRefresh(key, Math.min(entry.ttl, 60000)); // Max 1 minute retry
    }
  }

  /**
   * Manually refresh a query
   * 
   * @param query - GraphQL query
   * @param variables - Query variables
   * 
   * Requirements: 12.9
   */
  async refreshQuery(
    query: DocumentNode,
    variables?: OperationVariables
  ): Promise<void> {
    const key = this.getCacheKey(query, variables);
    await this.refresh(key);
  }

  /**
   * Invalidate a cache entry (force refresh on next access)
   * 
   * @param query - GraphQL query
   * @param variables - Query variables
   * 
   * Requirements: 12.9
   */
  invalidate(query: DocumentNode, variables?: OperationVariables): void {
    const key = this.getCacheKey(query, variables);
    const entry = this.entries.get(key);

    if (entry) {
      // Set timestamp to 0 to force stale
      entry.timestamp = 0;
      this.entries.set(key, entry);
    }
  }

  /**
   * Clear all TTL entries and intervals
   */
  clear(): void {
    // Clear all intervals
    this.refreshIntervals.forEach((interval) => clearTimeout(interval));
    this.refreshIntervals.clear();
    
    // Clear entries
    this.entries.clear();
  }

  /**
   * Get TTL info for a query
   * 
   * @param query - GraphQL query
   * @param variables - Query variables
   * @returns TTL info or null if not registered
   */
  getTTLInfo(query: DocumentNode, variables?: OperationVariables): {
    age: number;
    ttl: number;
    isStale: boolean;
    timeUntilStale: number;
  } | null {
    const key = this.getCacheKey(query, variables);
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttl;
    const timeUntilStale = Math.max(0, entry.ttl - age);

    return {
      age,
      ttl: entry.ttl,
      isStale,
      timeUntilStale,
    };
  }
}

/**
 * Create a singleton TTL manager instance
 * This will be initialized with the Apollo Client in the provider
 */
let ttlManagerInstance: CacheTTLManager | null = null;

/**
 * Initialize the TTL manager with Apollo Client
 * 
 * @param client - Apollo Client instance
 * @returns TTL manager instance
 */
export function initializeTTLManager(client: ApolloClient): CacheTTLManager {
  if (!ttlManagerInstance) {
    ttlManagerInstance = new CacheTTLManager(client);
  }
  return ttlManagerInstance;
}

/**
 * Get the TTL manager instance
 * 
 * @returns TTL manager instance
 * @throws Error if not initialized
 */
export function getTTLManager(): CacheTTLManager {
  if (!ttlManagerInstance) {
    throw new Error('TTL Manager not initialized. Call initializeTTLManager first.');
  }
  return ttlManagerInstance;
}
