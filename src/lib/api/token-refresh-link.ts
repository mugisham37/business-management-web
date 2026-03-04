/**
 * Token Refresh Link
 * 
 * Apollo Link that handles automatic token refresh and operation retry
 * when authentication errors occur.
 * 
 * Features:
 * - Detects token expiry errors
 * - Automatically refreshes access token
 * Retries failed operation with new token
 * - Prevents multiple concurrent refresh requests
 * - Redirects to login on refresh failure
 * 
 * Requirements: 4.12, 7.6, 7.7
 */

import { Observable } from '@apollo/client';
import { onError, ErrorResponse } from '@apollo/client/link/error';
import { GraphQLError } from 'graphql';
import { tokenManager } from '@/lib/auth/token-manager';
import { REFRESH_TOKEN } from '@/graphql/mutations/auth';

/**
 * Flag to prevent multiple concurrent token refresh requests
 */
let isRefreshing = false;

/**
 * Queue of pending requests waiting for token refresh
 */
let pendingRequests: Array<() => void> = [];

/**
 * Process all pending requests after token refresh completes
 */
function processPendingRequests(): void {
  pendingRequests.forEach(callback => callback());
  pendingRequests = [];
}

/**
 * Refresh the access token using the refresh token
 * 
 * @returns Promise that resolves with new access token or rejects on failure
 * 
 * Requirements: 4.12, 7.6
 */
async function refreshAccessToken(): Promise<string> {
  const refreshToken = tokenManager.getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // Call the refresh token mutation
    const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: REFRESH_TOKEN.loc?.source.body,
        variables: {
          input: { refreshToken },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Token refresh request failed');
    }

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Token refresh failed');
    }

    const { accessToken, refreshToken: newRefreshToken } = result.data.refreshToken;
    
    // Update tokens in token manager
    tokenManager.setTokens(accessToken, newRefreshToken);
    
    return accessToken;
  } catch (error) {
    // Clear tokens on refresh failure (Requirements: 7.7)
    tokenManager.clearTokens();
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    throw error;
  }
}

/**
 * Token Refresh Error Link
 * 
 * Intercepts authentication errors and attempts to refresh the token
 * before retrying the failed operation.
 * 
 * Requirements: 4.12, 7.6, 7.7
 */
export const tokenRefreshLink = onError((errorResponse: ErrorResponse) => {
  const { graphQLErrors, operation, forward } = errorResponse;
  
  if (!graphQLErrors) return;

  // Check if any error is an authentication error
  const hasAuthError = graphQLErrors.some(
    (err: GraphQLError) => err.extensions?.code === 'UNAUTHENTICATED'
  );

  if (!hasAuthError) return;

  // Return an observable that handles token refresh and retry
  return new Observable((observer) => {
    // If already refreshing, queue this request
    if (isRefreshing) {
      pendingRequests.push(() => {
        // Retry the operation after token refresh completes
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      });
      return;
    }

    // Start token refresh process
    isRefreshing = true;

    refreshAccessToken()
      .then(newAccessToken => {
        // Update the operation context with new token
        const oldHeaders = operation.getContext().headers;
        operation.setContext({
          headers: {
            ...oldHeaders,
            authorization: `Bearer ${newAccessToken}`,
          },
        });

        // Process all pending requests
        processPendingRequests();

        // Retry the current operation
        forward(operation).subscribe({
          next: observer.next.bind(observer),
          error: observer.error.bind(observer),
          complete: observer.complete.bind(observer),
        });
      })
      .catch(error => {
        // Token refresh failed, clear pending requests and propagate error
        pendingRequests = [];
        observer.error(error);
      })
      .finally(() => {
        isRefreshing = false;
      });
  });
});

/**
 * Create a combined link that includes token refresh logic
 * This should be added to the Apollo link chain before the error link
 * 
 * Usage:
 * ```typescript
 * const apolloLink = from([
 *   retryLink,
 *   tokenRefreshLink,
 *   errorLink,
 *   authLink,
 *   splitLink,
 * ]);
 * ```
 */
export default tokenRefreshLink;
