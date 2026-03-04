import { ApolloClient, DefaultOptions } from '@apollo/client';
import { apolloLink } from './apollo-links';
import { cache } from '@/lib/cache/apollo-cache-config';

/**
 * Apollo Client Default Options
 * 
 * Configures default behavior for queries, mutations, and subscriptions:
 * - fetchPolicy: How to interact with cache
 * - errorPolicy: How to handle errors
 * 
 * Performance Optimizations (Requirements: 12.4, 12.8):
 * - cache-first: Serve from cache before network request
 * - Request deduplication enabled by default
 * 
 * Requirements: 2.1, 12.4, 12.8
 */
const defaultOptions: DefaultOptions = {
  /**
   * Watch Query Options (useQuery hook)
   * - cache-first: Return cached data if available, only fetch if not in cache
   * - errorPolicy: 'all' returns both data and errors
   * 
   * This provides optimal performance by serving cached data immediately
   * and only making network requests when necessary.
   * 
   * Requirements: 12.4, 12.8
   */
  watchQuery: {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
    nextFetchPolicy: 'cache-first', // Continue using cache-first for subsequent fetches
  },
  
  /**
   * Query Options (client.query)
   * - cache-first: Check cache before network
   * - errorPolicy: 'all' returns both data and errors
   * 
   * Requirements: 12.4, 12.8
   */
  query: {
    fetchPolicy: 'cache-first',
    errorPolicy: 'all',
  },
  
  /**
   * Mutation Options
   * - errorPolicy: 'all' returns both data and errors
   */
  mutate: {
    errorPolicy: 'all',
  },
};

/**
 * Apollo Client Instance
 * 
 * Configured with:
 * - Complete link chain (retry, error handling, auth, transport)
 * - Normalized InMemoryCache with type policies
 * - Default options for optimal performance
 * - Request deduplication enabled (default)
 * - Cache-first fetch policy for performance (Requirements: 12.4, 12.8)
 * 
 * Link Chain Order:
 * RetryLink → ErrorLink → AuthLink → SplitLink → [HttpLink | WsLink]
 * 
 * Features:
 * - Automatic token injection
 * - Correlation ID tracking
 * - Token refresh on authentication errors
 * - Exponential backoff retry
 * - WebSocket subscriptions
 * - Normalized caching
 * - Optimistic updates support
 * - Cache-first queries for performance
 * - Automatic request deduplication
 * 
 * Requirements: 2.1, 12.4, 12.5, 12.8
 */
export const apolloClient = new ApolloClient({
  link: apolloLink,
  cache,
  defaultOptions,
  
  /**
   * Connection to Redux DevTools
   * Enabled in development for debugging
   */
  connectToDevTools: process.env.NODE_ENV === 'development',
  
  /**
   * Query deduplication (Requirements: 12.5)
   * Automatically deduplicates identical queries within 10ms window
   * This prevents multiple identical requests from being sent concurrently
   * Default: true
   */
  queryDeduplication: true,
  
  /**
   * Assume immutable cache
   * Improves performance by assuming cache data is immutable
   * Enables faster change detection
   * Default: false
   */
  assumeImmutableResults: true,
});

/**
 * Export Apollo Client singleton
 * Use this instance throughout the application
 * 
 * Usage:
 * ```typescript
 * import { apolloClient } from '@/lib/api/apollo-client';
 * 
 * // Direct query
 * const result = await apolloClient.query({
 *   query: GET_USERS,
 *   variables: { organizationId: '123' },
 * });
 * 
 * // Direct mutation
 * const result = await apolloClient.mutate({
 *   mutation: CREATE_USER,
 *   variables: { input: { ... } },
 * });
 * 
 * // Cache operations
 * apolloClient.cache.readQuery({ query: GET_USERS });
 * apolloClient.cache.writeQuery({ query: GET_USERS, data: { ... } });
 * apolloClient.refetchQueries({ include: ['GetUsers'] });
 * apolloClient.clearStore();
 * ```
 */
export default apolloClient;
