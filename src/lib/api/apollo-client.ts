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
 * Requirements: 2.1
 */
const defaultOptions: DefaultOptions = {
  /**
   * Watch Query Options (useQuery hook)
   * - cache-and-network: Return cached data immediately, then fetch from network
   * - errorPolicy: 'all' returns both data and errors
   */
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    nextFetchPolicy: 'cache-first', // After initial fetch, prefer cache
  },
  
  /**
   * Query Options (client.query)
   * - network-only: Always fetch from network, update cache
   * - errorPolicy: 'all' returns both data and errors
   */
  query: {
    fetchPolicy: 'network-only',
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
 * 
 * Requirements: 2.1
 */
export const apolloClient = new ApolloClient({
  link: apolloLink,
  cache,
  defaultOptions,
  
  /**
   * Connection to Redux DevTools
   * Enabled in development for debugging
   */
  // connectToDevTools: process.env.NODE_ENV === 'development',
  
  /**
   * Query deduplication
   * Automatically deduplicates identical queries within 10ms window
   * Default: true
   */
  // queryDeduplication: true,
  
  /**
   * Assume immutable cache
   * Improves performance by assuming cache data is immutable
   * Default: false
   */
  // assumeImmutableResults: true,
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
