import { HttpLink, split, from, ApolloLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError, ErrorLink } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { createClient } from 'graphql-ws';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { config } from '@/lib/config/environment';
import { tokenManager } from '@/lib/auth/token-manager';
import { generateCorrelationId } from '@/lib/utils/correlation';

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
 * - Detects UNAUTHENTICATED errors and triggers token refresh
 * - Logs errors with correlation ID
 * - Redirects to login on authentication failure
 * 
 * Requirements: 2.1, 6.1
 */
export const errorLink = onError((errorResponse) => {
  const { error, result, operation } = errorResponse;
  
  // Check if it's a GraphQL error
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      const code = err.extensions?.code;
      
      // Handle authentication errors
      if (code === 'UNAUTHENTICATED') {
        // Clear tokens and redirect to login
        // Token refresh will be handled by the token manager's automatic refresh
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      // Log GraphQL errors
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`,
        {
          correlationId: err.extensions?.correlationId,
          code: err.extensions?.code,
        }
      );
    }
  } else {
    // Network or other errors
    console.error('[Network error]:', error, {
      operation: operation.operationName,
    });
  }
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
    retryIf: (error, _operation) => {
      // Don't retry if no error
      if (!error) return false;
      
      // Don't retry client errors (4xx)
      const statusCode = (error as any)?.statusCode;
      if (statusCode && statusCode >= 400 && statusCode < 500) {
        return false;
      }
      
      // Retry server errors (5xx) and network errors
      return true;
    },
  },
});

/**
 * Complete Apollo Link Chain
 * Order matters: RetryLink → ErrorLink → AuthLink → SplitLink → [HttpLink | WsLink]
 * 
 * Requirements: 2.1
 */
export const apolloLink = from([
  retryLink,
  errorLink,
  authLink,
  splitLink,
]);
