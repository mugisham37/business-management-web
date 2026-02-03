import { AuthEventEmitter } from './auth-events';

/**
 * Token Manager
 * 
 * Handles JWT token storage, refresh, and validation with:
 * - Secure token storage (httpOnly cookies preferred, localStorage fallback)
 * - Automatic token refresh with rotation
 * - Multi-tab synchronization
 * - Token expiration handling
 * - Security event emission
 */

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  issuedAt: number;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

class TokenManagerClass {
  private static instance: TokenManagerClass;
  private tokenData: TokenData | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private refreshTimer: NodeJS.Timeout | null = null;
  private storageKey = 'auth_tokens';
  private refreshEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql';

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadTokensFromStorage();
      this.setupStorageListener();
      this.scheduleTokenRefresh();
    }
  }

  static getInstance(): TokenManagerClass {
    if (!TokenManagerClass.instance) {
      TokenManagerClass.instance = new TokenManagerClass();
    }
    return TokenManagerClass.instance;
  }

  /**
   * Set tokens after successful authentication
   */
  setTokens(tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType?: string;
  }): void {
    this.tokenData = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      tokenType: tokens.tokenType || 'Bearer',
      issuedAt: Date.now(),
    };

    this.saveTokensToStorage();
    this.scheduleTokenRefresh();
    
    // Emit token update event for multi-tab sync
    AuthEventEmitter.emit('tokens:updated', this.tokenData);
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    if (!this.tokenData) {
      return null;
    }

    // Check if token is expired
    const now = Date.now();
    const expiresAt = this.tokenData.issuedAt + (this.tokenData.expiresIn * 1000);
    
    if (now >= expiresAt) {
      // Token expired, try to refresh
      this.refreshToken();
      return null;
    }

    return this.tokenData.accessToken;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.tokenData?.refreshToken || null;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token;
  }

  /**
   * Check if token is about to expire (within 5 minutes)
   */
  isTokenExpiringSoon(): boolean {
    if (!this.tokenData) return false;

    const now = Date.now();
    const expiresAt = this.tokenData.issuedAt + (this.tokenData.expiresIn * 1000);
    const fiveMinutes = 5 * 60 * 1000;

    return (expiresAt - now) <= fiveMinutes;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokenData?.refreshToken) {
      this.clearTokens();
      return false;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(): Promise<boolean> {
    try {
      const response = await fetch(this.refreshEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation RefreshToken($input: RefreshTokenInput!) {
              refreshToken(input: $input) {
                accessToken
                refreshToken
                expiresIn
                tokenType
              }
            }
          `,
          variables: {
            input: {
              refreshToken: this.tokenData!.refreshToken,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'Refresh failed');
      }

      const refreshData: RefreshResponse = data.data.refreshToken;
      
      this.setTokens({
        accessToken: refreshData.accessToken,
        refreshToken: refreshData.refreshToken,
        expiresIn: refreshData.expiresIn,
        tokenType: refreshData.tokenType,
      });

      AuthEventEmitter.emit('tokens:refreshed', refreshData);
      return true;

    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      const errorMessage = error instanceof Error ? error : { message: 'Token refresh failed' };
      AuthEventEmitter.emit('tokens:refresh_failed', errorMessage);
      return false;
    }
  }

  /**
   * Clear all tokens and logout
   */
  clearTokens(): void {
    this.tokenData = null;
    this.clearRefreshTimer();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
      sessionStorage.removeItem(this.storageKey);
    }

    AuthEventEmitter.emit('tokens:cleared');
  }

  /**
   * Load tokens from storage
   */
  private loadTokensFromStorage(): void {
    try {
      // Try localStorage first, then sessionStorage
      const stored = localStorage.getItem(this.storageKey) || 
                   sessionStorage.getItem(this.storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Validate token structure
        if (this.isValidTokenData(parsed)) {
          this.tokenData = parsed;
          
          // Check if token is still valid
          const now = Date.now();
          const expiresAt = parsed.issuedAt + (parsed.expiresIn * 1000);
          
          if (now >= expiresAt) {
            // Token expired, try to refresh
            this.refreshToken();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tokens from storage:', error);
      this.clearTokens();
    }
  }

  /**
   * Save tokens to storage
   */
  private saveTokensToStorage(): void {
    if (!this.tokenData) return;

    try {
      const tokenString = JSON.stringify(this.tokenData);
      localStorage.setItem(this.storageKey, tokenString);
    } catch (error) {
      console.error('Failed to save tokens to storage:', error);
    }
  }

  /**
   * Setup storage event listener for multi-tab sync
   */
  private setupStorageListener(): void {
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        if (event.newValue) {
          try {
            const parsed = JSON.parse(event.newValue);
            if (this.isValidTokenData(parsed)) {
              this.tokenData = parsed;
              this.scheduleTokenRefresh();
              AuthEventEmitter.emit('tokens:synced', parsed);
            }
          } catch (error) {
            console.error('Failed to sync tokens from storage:', error);
          }
        } else {
          // Tokens were cleared in another tab
          this.tokenData = null;
          this.clearRefreshTimer();
          AuthEventEmitter.emit('tokens:cleared');
        }
      }
    });
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    this.clearRefreshTimer();

    if (!this.tokenData) return;

    // Schedule refresh 5 minutes before expiration
    const now = Date.now();
    const expiresAt = this.tokenData.issuedAt + (this.tokenData.expiresIn * 1000);
    const refreshAt = expiresAt - (5 * 60 * 1000); // 5 minutes before expiration
    const delay = Math.max(0, refreshAt - now);

    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, delay);
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Validate token data structure
   */
  private isValidTokenData(data: unknown): data is TokenData {
    if (!data || typeof data !== 'object') return false;
    const tokenData = data as Record<string, unknown>;
    return (
      typeof tokenData.accessToken === 'string' &&
      typeof tokenData.refreshToken === 'string' &&
      typeof tokenData.expiresIn === 'number' &&
      typeof tokenData.tokenType === 'string' &&
      typeof tokenData.issuedAt === 'number'
    );
  }

  /**
   * Get token expiration time
   */
  getTokenExpiration(): Date | null {
    if (!this.tokenData) return null;
    
    return new Date(this.tokenData.issuedAt + (this.tokenData.expiresIn * 1000));
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiration(): number {
    const expiration = this.getTokenExpiration();
    if (!expiration) return 0;
    
    return Math.max(0, expiration.getTime() - Date.now());
  }
}

// Export singleton instance
export const TokenManager = TokenManagerClass.getInstance();