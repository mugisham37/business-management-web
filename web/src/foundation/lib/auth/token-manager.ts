/**
 * Token Manager
 * 
 * Manages JWT tokens (access and refresh), handles token refresh,
 * and provides secure storage with automatic refresh timer.
 * 
 * Security:
 * - Access tokens stored in memory only (not localStorage/sessionStorage)
 * - Refresh tokens stored in HttpOnly cookies (set by backend)
 * - Tokens cleared on logout and tab close
 * - Token validation before use
 */

import { ApolloClient } from '@apollo/client';
import {
  RefreshTokensDocument,
  RefreshTokensMutation,
  RefreshTokensMutationVariables,
} from '@/foundation/types/generated/graphql';

export interface TokenManager {
  getAccessToken(): string | null;
  setAccessToken(token: string): void;
  clearAccessToken(): void;

  refreshTokens(): Promise<{ accessToken: string; refreshToken: string }>;
  isTokenExpired(token: string): boolean;
  getTokenExpiration(token: string): number;
  validateTokenFormat(token: string): boolean;

  startRefreshTimer(): void;
  stopRefreshTimer(): void;

  clearAllTokens(): void;
}

export class TokenManagerImpl implements TokenManager {
  private accessToken: string | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private lastRefreshTime: number = 0;
  private readonly REFRESH_RATE_LIMIT_MS = 60000; // 1 minute
  private readonly REFRESH_CHECK_INTERVAL_MS = 60000; // Check every 60 seconds
  private readonly REFRESH_THRESHOLD_SECONDS = 60; // Refresh if less than 60 seconds remaining

  constructor(private apolloClient: ApolloClient) {}

  /**
   * Get the current access token from memory
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set the access token in memory
   */
  setAccessToken(token: string): void {
    if (!this.validateTokenFormat(token)) {
      console.error('Invalid token format');
      return;
    }
    this.accessToken = token;
  }

  /**
   * Clear the access token from memory
   */
  clearAccessToken(): void {
    this.accessToken = null;
  }

  /**
   * Refresh tokens by calling the GraphQL mutation
   * Implements rate limiting to prevent excessive refresh requests
   */
  async refreshTokens(): Promise<{ accessToken: string; refreshToken: string }> {
    // Rate limiting: prevent refresh more than once per minute
    const now = Date.now();
    if (now - this.lastRefreshTime < this.REFRESH_RATE_LIMIT_MS) {
      throw new Error('Token refresh rate limit exceeded. Please wait before retrying.');
    }

    try {
      // Call refreshTokens mutation
      // Backend reads refresh token from HttpOnly cookie
      const response = await this.apolloClient.mutate<
        RefreshTokensMutation,
        RefreshTokensMutationVariables
      >({
        mutation: RefreshTokensDocument,
        variables: {
          refreshToken: '', // Backend reads from HttpOnly cookie
        },
      });

      if (!response.data?.refreshTokens) {
        throw new Error('Failed to refresh tokens: No data returned');
      }

      const { accessToken, refreshToken } = response.data.refreshTokens;

      // Update last refresh time
      this.lastRefreshTime = now;

      // Store new access token
      this.setAccessToken(accessToken);

      // Refresh token is automatically set by backend in HttpOnly cookie
      return { accessToken, refreshToken };
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear tokens on refresh failure
      this.clearAllTokens();
      throw error;
    }
  }

  /**
   * Check if a token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const expiration = this.getTokenExpiration(token);
      const now = Math.floor(Date.now() / 1000);
      return now >= expiration;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true; // Treat invalid tokens as expired
    }
  }

  /**
   * Get the expiration timestamp from a JWT token
   */
  getTokenExpiration(token: string): number {
    try {
      const payload = this.decodeJWT(token);
      if (!payload.exp) {
        throw new Error('Token does not contain expiration claim');
      }
      return payload.exp;
    } catch (error) {
      console.error('Error getting token expiration:', error);
      throw error;
    }
  }

  /**
   * Validate JWT token format (three base64-encoded parts separated by dots)
   */
  validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Validate each part is base64-encoded
    try {
      for (const part of parts) {
        if (!part || part.length === 0) {
          return false;
        }
        // Try to decode to verify it's valid base64
        atob(part.replace(/-/g, '+').replace(/_/g, '/'));
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Start the automatic token refresh timer
   * Checks every 60 seconds if token needs refresh
   */
  startRefreshTimer(): void {
    // Stop existing timer if any
    this.stopRefreshTimer();

    this.refreshTimer = setInterval(() => {
      const token = this.getAccessToken();
      if (!token) {
        return;
      }

      try {
        const expiration = this.getTokenExpiration(token);
        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiration - now;

        // Refresh if less than 60 seconds remaining
        if (timeUntilExpiry < this.REFRESH_THRESHOLD_SECONDS) {
          this.refreshTokens().catch((error) => {
            console.error('Automatic token refresh failed:', error);
            this.clearAllTokens();
            // In a real app, you would redirect to login here
            // For now, we just log the error
          });
        }
      } catch (error) {
        console.error('Error in refresh timer:', error);
      }
    }, this.REFRESH_CHECK_INTERVAL_MS);
  }

  /**
   * Stop the automatic token refresh timer
   */
  stopRefreshTimer(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Clear all tokens (access token from memory)
   * Note: Refresh token in HttpOnly cookie must be cleared by backend
   */
  clearAllTokens(): void {
    this.clearAccessToken();
    this.stopRefreshTimer();
    this.lastRefreshTime = 0;
  }

  /**
   * Decode JWT payload without verification
   * @private
   */
  private decodeJWT(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      throw new Error('Failed to decode JWT token');
    }
  }
}

// Singleton instance (will be initialized with Apollo Client)
let tokenManagerInstance: TokenManager | null = null;

/**
 * Initialize the token manager with Apollo Client
 */
export function initializeTokenManager(apolloClient: ApolloClient): TokenManager {
  if (!tokenManagerInstance) {
    tokenManagerInstance = new TokenManagerImpl(apolloClient);
  }
  return tokenManagerInstance;
}

/**
 * Get the token manager instance
 * Throws error if not initialized
 */
export function getTokenManager(): TokenManager {
  if (!tokenManagerInstance) {
    throw new Error(
      'TokenManager not initialized. Call initializeTokenManager first.'
    );
  }
  return tokenManagerInstance;
}
