/**
 * Auth Link
 * 
 * Apollo Link that adds the access token to request headers.
 * Integrates with TokenManager to retrieve the current access token.
 * 
 * Requirements: 4.1, 8.6
 */

import { setContext } from '@apollo/client/link/context';
import { getTokenManager } from '@/foundation/lib/auth/token-manager';

/**
 * Create the authentication link that adds access token to request headers
 * 
 * The link uses setContext to modify the request context before it's sent.
 * It retrieves the access token from TokenManager and adds it to the
 * Authorization header using the Bearer scheme.
 * 
 * Security:
 * - Token is added to headers, not query parameters (prevents token leakage in logs)
 * - Only adds token if one exists (allows unauthenticated requests)
 * - Uses Bearer authentication scheme (standard for JWT tokens)
 */
export const createAuthLink = () => {
  return setContext(async (_, { headers }) => {
    try {
      // Get token manager instance
      const tokenManager = getTokenManager();
      
      // Get current access token from memory
      const token = tokenManager.getAccessToken();
      
      // Return headers with or without authorization
      return {
        headers: {
          ...headers,
          // Only add authorization header if token exists
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
      };
    } catch (error) {
      // If token manager not initialized, continue without token
      console.warn('TokenManager not initialized, continuing without authentication');
      return {
        headers: {
          ...headers,
        },
      };
    }
  });
};
