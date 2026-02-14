/**
 * Error Link
 * 
 * Apollo Link that handles GraphQL and network errors.
 * Implements automatic token refresh on authentication errors.
 * 
 * Requirements: 4.2, 3.5
 */

import { ErrorLink } from '@apollo/client/link/error';
import { Observable } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { getTokenManager } from '@/foundation/lib/auth/token-manager';

/**
 * Create the error handling link
 * 
 * Handles two types of errors:
 * 1. GraphQL errors - errors returned by the GraphQL server
 * 2. Network errors - connection failures, timeouts, etc.
 * 
 * For UNAUTHENTICATED errors:
 * - Attempts to refresh the access token
 * - Retries the original request with the new token
 * - If refresh fails, clears tokens and redirects to login
 * 
 * For other errors:
 * - Logs the error for debugging
 * - Allows the error to propagate to the caller
 */
export const createErrorLink = () => {
  return new ErrorLink(({ error, operation, forward }) => {
    // Handle GraphQL errors
    if (CombinedGraphQLErrors.is(error)) {
      for (const gqlError of error.errors) {
        const errorCode = gqlError.extensions?.code;
        
        console.error(
          `[GraphQL error]: Message: ${gqlError.message}, Code: ${errorCode}, Path: ${gqlError.path}`
        );
        
        // Handle UNAUTHENTICATED errors with token refresh
        if (errorCode === 'UNAUTHENTICATED') {
          try {
            const tokenManager = getTokenManager();
            
            // Return a new observable that handles token refresh
            return new Observable((observer) => {
              tokenManager
                .refreshTokens()
                .then(({ accessToken }) => {
                  console.log('Token refreshed successfully, retrying request');
                  
                  // Update the operation context with new token
                  const oldHeaders = operation.getContext().headers;
                  operation.setContext({
                    headers: {
                      ...oldHeaders,
                      authorization: `Bearer ${accessToken}`,
                    },
                  });
                  
                  // Retry the request with new token
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };
                  
                  forward(operation).subscribe(subscriber);
                })
                .catch((refreshError) => {
                  console.error('Token refresh failed:', refreshError);
                  
                  // Clear all tokens
                  tokenManager.clearAllTokens();
                  
                  // Redirect to login page
                  // In a Next.js app, we use window.location for client-side redirect
                  if (typeof window !== 'undefined') {
                    const currentPath = window.location.pathname;
                    // Save current path for redirect after login
                    if (currentPath !== '/login') {
                      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
                    } else {
                      window.location.href = '/login';
                    }
                  }
                  
                  // Complete the observable
                  observer.error(refreshError);
                });
            });
          } catch (err) {
            console.error('Error handling UNAUTHENTICATED error:', err);
          }
        }
        
        // Log other GraphQL errors
        if (errorCode === 'UNAUTHORIZED') {
          console.error('Authorization error: User lacks required permissions');
        } else if (errorCode === 'VALIDATION_ERROR') {
          console.error('Validation error:', gqlError.message);
        } else if (errorCode === 'NOT_FOUND') {
          console.error('Resource not found:', gqlError.message);
        } else if (errorCode === 'RATE_LIMIT') {
          console.error('Rate limit exceeded:', gqlError.message);
        }
      }
    } else {
      // Handle network errors
      console.error(`[Network error]: ${error.message}`);
      
      // Log additional details if available
      if ('statusCode' in error) {
        console.error(`Status code: ${(error as any).statusCode}`);
      }
      if ('result' in error) {
        console.error('Result:', (error as any).result);
      }
    }
  });
};
