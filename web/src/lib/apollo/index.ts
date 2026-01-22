// Apollo Client exports
export { apolloClient as default, apolloClient } from './client';
export { ApolloProvider } from './provider';
export {
  updateCacheAfterMutation,
  cacheInvalidation,
  optimisticUpdates,
  cacheDebug,
} from './cache-utils';

// Re-export commonly used Apollo Client types and utilities
export {
  gql,
  useQuery,
  useMutation,
  useSubscription,
  useLazyQuery,
  useApolloClient,
  type QueryResult,
  type MutationResult,
  type SubscriptionResult,
  type LazyQueryResult,
  type ApolloError,
  type FetchPolicy,
  type ErrorPolicy,
} from '@apollo/client';