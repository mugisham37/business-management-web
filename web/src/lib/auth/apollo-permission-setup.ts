/**
 * Apollo Client Permission Setup
 * Integrates permission validation with Apollo Client
 * Requirement 10.4: GraphQL operation permission validation
 */

import { ApolloClient, from, createHttpLink, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { createPermissionInterceptorLink } from './GraphQLPermissionInterceptor';
import type { ErrorPayload } from '@/types/auth';

/**
 * Create Apollo Client with permission validation
 */
export function createApolloClientWithPermissions(options: {
  uri: string;
  getAuthToken?: () => string | null;
  onPermissionError?: (error: ErrorPayload) => void;
  enablePermissionValidation?: boolean;
}) {
  const {
    uri,
    getAuthToken,
    onPermissionError,
    enablePermissionValidation = true,
  } = options;

  // HTTP Link
  const httpLink = createHttpLink({
    uri,
  });

  // Auth Link
  const authLink = setContext((_, { headers }) => {
    const token = getAuthToken?.();
    return {
      headers: {
        ...headers,
        ...(token && { authorization: `Bearer ${token}` }),
      },
    };
  });

  // Error Link
  const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, locations, path, extensions }) => {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

        // Handle permission errors
        if (extensions?.code === 'FORBIDDEN') {
          console.warn('Permission denied for operation:', operation.operationName);
          onPermissionError?.({
            type: 'permission',
            message,
            operationName: operation.operationName,
            extensions,
          });
        }
      });
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  });

  // Permission Interceptor Link
  const permissionLink = enablePermissionValidation 
    ? createPermissionInterceptorLink()
    : null;

  // Combine links
  const links = [
    errorLink,
    authLink,
    ...(permissionLink ? [permissionLink] : []),
    httpLink,
  ];

  // Create Apollo Client
  const client = new ApolloClient({
    link: from(links),
    cache: new InMemoryCache({
      typePolicies: {
        User: {
          fields: {
            permissions: {
              merge: false, // Replace permissions array completely
            },
          },
        },
      },
    }),
    defaultOptions: {
      watchQuery: {
        errorPolicy: 'all',
      },
      query: {
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });

  return client;
}

/**
 * Permission-aware query wrapper
 */
export function createPermissionAwareQuery<TData = Record<string, unknown>, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  client: ApolloClient<Record<string, unknown>>
) {
  return async (options: {
    query: unknown;
    variables?: TVariables;
    skipPermissionCheck?: boolean;
    userId?: string;
    context?: Record<string, unknown>;
  }) => {
    const { query, variables, skipPermissionCheck, userId, context = {} } = options;

    try {
      const result = await client.query<TData, TVariables>({
        query,
        variables,
        context: {
          ...context,
          ...(skipPermissionCheck && { skipPermissionCheck: true }),
          ...(userId && { userId }),
        },
        fetchPolicy: 'network-only',
      });

      return result;
    } catch (error: unknown) {
      // Handle permission errors gracefully
      const apolloError = error as ApolloClient<Record<string, unknown>> & { graphQLErrors?: Array<{ extensions?: Record<string, unknown> }> };
      if (apolloError.graphQLErrors?.some((e: Record<string, unknown>) => (e.extensions as Record<string, unknown>)?.code === 'FORBIDDEN')) {
        console.warn('Query blocked due to insufficient permissions');
        return {
          data: null,
          error,
          loading: false,
          networkStatus: 8, // Error
        };
      }
      throw error;
    }
  };
}

/**
 * Permission-aware mutation wrapper
 */
export function createPermissionAwareMutation<TData = Record<string, unknown>, TVariables extends Record<string, unknown> = Record<string, unknown>>(
  client: ApolloClient<Record<string, unknown>>
) {
  return async (options: {
    mutation: unknown;
    variables?: TVariables;
    skipPermissionCheck?: boolean;
    userId?: string;
    context?: Record<string, unknown>;
  }) => {
    const { mutation, variables, skipPermissionCheck, userId, context = {} } = options;

    try {
      const result = await client.mutate<TData, TVariables>({
        mutation,
        variables,
        context: {
          ...context,
          ...(skipPermissionCheck && { skipPermissionCheck: true }),
          ...(userId && { userId }),
        },
      });

      return result;
    } catch (error: unknown) {
      // Handle permission errors gracefully
      const apolloError = error as ApolloClient<Record<string, unknown>> & { graphQLErrors?: Array<{ extensions?: Record<string, unknown> }> };
      if (apolloError.graphQLErrors?.some((e: Record<string, unknown>) => (e.extensions as Record<string, unknown>)?.code === 'FORBIDDEN')) {
        console.warn('Mutation blocked due to insufficient permissions');
        return {
          data: null,
          error,
        };
      }
      throw error;
    }
  };
}

/**
 * Permission context helpers
 */
export const PermissionContext = {
  /**
   * Skip permission check for this operation
   */
  skipCheck: () => ({ skipPermissionCheck: true }),

  /**
   * Set user ID for permission check
   */
  withUser: (userId: string) => ({ userId }),

  /**
   * Combine multiple context options
   */
  combine: (...contexts: Record<string, unknown>[]) => Object.assign({}, ...contexts),
};

/**
 * Hook for permission-aware Apollo operations
 */
export function usePermissionAwareApollo(client: ApolloClient<Record<string, unknown>>) {
  const query = createPermissionAwareQuery(client);
  const mutate = createPermissionAwareMutation(client);

  return {
    query,
    mutate,
    client,
  };
}

/**
 * Default Apollo Client configuration with permissions
 */
export const defaultApolloConfig = {
  uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '/graphql',
  getAuthToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },
  onPermissionError: (error: ErrorPayload) => {
    console.warn('Permission error:', error);
    // You can add custom error handling here, such as:
    // - Redirecting to login page
    // - Showing upgrade prompts
    // - Logging to analytics
  },
  enablePermissionValidation: true,
};