import { HttpLink, split, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createClient } from 'graphql-ws';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { config } from '@/lib/config/environment';
import { tokenManager } from '@/lib/auth/token-manager';
import { generateCorrelationId } from '@/lib/utils/correlation';
import { tokenRefreshLink } from './token-refresh-link';
import { apolloLoggingLink } from './apollo-logging-link';

/**
 * HTTP Link for GraphQL queries and mutations
 * Connects to backend GraphQL endpoint over HTTP
 * 
 * Requirements: 2.1
 */
export const httpLink = new HttpLink({
  uri: config.graphql.httpUrl,
  credentials: 'include', // Include cookies for refresh token
});

/**
 * WebSocket Link for GraphQL subscriptions
 * Establishes WSS connection for real-time updates
 * 
 * Requirements: 2.1, 5.1
 */
export const wsLink = new GraphQLWsLink(
  createClient({
    url: config.graphql.wsUrl,
    connectionParams: async () => {
      const token = tokenManager.getAccessToken();
      return {
        authorization: token ? `Bearer ${token}` : '',
        correlationId: generateCorrelationId(),
      };
    },
    // Reconnection configuration
    retryAttempts: 10,
    shouldRetry: () => true,
    retryWait: (retries) => {
      // Exponential backoff: 1s, 2s, 4s, 8s, ..., max 30s
      return new Promise((resolve) => {
        const delay = Math.min(1000 * 2 ** retries, 30000);
        setTimeout(resolve, delay);
      });
    },
  })
);

/**
 * Split Link
 * Routes operations to appropriate transport:
 * - Subscriptions → WebSocket Link
 * - Queries/Mutations → HTTP Link
 * 
 * Requirements: 2.1
 */
export const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

/**
 * Auth Link
 * Injects Bearer token and correlation ID into all requests
 * 
 * Requirements: 2.1, 8.3
 */
export const authLink = setContext(async (_, { headers }) => {
  const token = tokenManager.getAccessToken();
  const correlationId = generateCorrelationId();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'X-Correlation-Id': correlationId,
    },
  };
});

/**
 * Error Link
 * Handles GraphQL and network errors
 * - Note: Detailed logging is now handled by apolloLoggingLink
 * - This link is kept for backward compatibility and additional error handling
 * 
 * Requirements: 2.1, 6.1
 */
export const errorLink = onError((errorResponse) => {
  // Error logging is now handled by apolloLoggingLink
  // This link can be used for additional error handling if needed
});

/**
 * Retry Link
 * Implements exponential backoff retry logic
 * - Initial delay: 300ms
 * - Max delay: 1200ms
 * - Max attempts: 3
 * - Jitter enabled to prevent thundering herd
 * - No retry for client errors (4xx)
 * - Retry for server errors (5xx) and network errors
 * 
 * Requirements: 2.1, 6.3
 */
export const retryLink = new RetryLink({
  delay: {
    initial: config.retry.initialDelay,
    max: config.retry.maxDelay,
    jitter: true,
  },
  attempts: {
    max: config.retry.maxAttempts,
    retryIf: (error) => {
      // Don't retry if no error
      if (!error) return false;
      
      // Don't retry client errors (4xx)
      const statusCode = (error as unknown as Record<string, unknown>)?.statusCode;
      if (statusCode && typeof statusCode === 'number' && statusCode >= 400 && statusCode < 500) {
        return false;
      }
      
      // Retry server errors (5xx) and network errors
      return true;
    },
  },
});

/**
 * Complete Apollo Link Chain
 * Order matters: 
 * LoggingLink → RetryLink → TokenRefreshLink → ErrorLink → AuthLink → SplitLink → [HttpLink | WsLink]
 * 
 * Logging happens first to capture all operations with full context
 * Token refresh happens before error logging to allow retry with new token
 * 
 * Requirements: 2.1, 4.12, 7.6, 7.7, 8.3
 */
export const apolloLink = from([
  apolloLoggingLink,
  retryLink,
  tokenRefreshLink,
  errorLink,
  authLink,
  splitLink,
]);
