import { decodeJwt } from 'jose';
import { config } from '@/lib/config/environment';

/**
 * JWT Token Payload Structure
 * Decoded from access token
 */
export interface TokenPayload {
  sub: string; // user ID
  email: string;
  organizationId: string;
  hierarchyLevel: number;
  permissions: string[];
  fingerprint: string;
  iat: number; // issued at
  exp: number; // expiration
}

/**
 * Token Manager
 * 
 * Manages JWT access and refresh tokens with security best practices:
 * - Access tokens stored in memory only (never localStorage)
 * - Automatic token refresh scheduling
 * - Token expiry detection
 * - JWT decoding and validation
 * 
 * Requirements: 4.1
 */
class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  /**
   * Store tokens in memory
   * Schedules automatic refresh before expiry
   * 
   * @param access - JWT access token
   * @param refresh - Optional refresh token
   */
  setTokens(access: string, refresh?: string): void {
    this.accessToken = access;
    if (refresh) {
      this.refreshToken = refresh;
    }
    
    this.scheduleTokenRefresh();
  }

  /**
   * Get current access token
   * 
   * @returns Access token or null if not set
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current refresh token
   * 
   * @returns Refresh token or null if not set
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Clear all tokens from memory
   * Cancels any scheduled refresh
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Decode JWT token to extract payload
   * 
   * @returns Decoded token payload or null if invalid
   */
  decodeToken(): TokenPayload | null {
    if (!this.accessToken) return null;
    
    try {
      return decodeJwt(this.accessToken) as TokenPayload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if current token is expired
   * 
   * @returns true if token is expired or invalid
   */
  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Get time until token expiry in milliseconds
   * 
   * @returns Milliseconds until expiry, or 0 if expired/invalid
   */
  getTimeUntilExpiry(): number {
    const payload = this.decodeToken();
    if (!payload) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now) * 1000;
  }

  /**
   * Schedule automatic token refresh
   * Refreshes 5 minutes before expiry (configurable via environment)
   * 
   * @private
   */
  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const timeUntilExpiry = this.getTimeUntilExpiry();
    const refreshThreshold = config.auth.tokenRefreshThreshold;
    const refreshTime = Math.max(0, timeUntilExpiry - refreshThreshold);

    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  /**
   * Refresh access token using refresh token
   * Called automatically before token expiry
   * 
   * @private
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch(`${config.api.url}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (response.ok) {
        const { accessToken, refreshToken } = await response.json();
        this.setTokens(accessToken, refreshToken);
      } else {
        this.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
    }
  }
}

/**
 * Singleton instance of TokenManager
 * Use this instance throughout the application
 */
export const tokenManager = new TokenManager();
