/**
 * Session Renewal Service
 * Implements transparent session renewal without user disruption
 * Requirement 7.5 - Transparent session renewal without user disruption
 */

import { AuthGateway } from './auth-gateway';

export interface SessionRenewalConfig {
  renewalThreshold: number; // Minutes before expiry to renew
  maxRetries: number;
  retryDelay: number; // Milliseconds
}

export interface SessionInfo {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
  userId: string;
}

/**
 * Session Renewal Manager
 * Handles automatic token renewal and session management
 */
export class SessionRenewalManager {
  private static instance: SessionRenewalManager;
  private renewalTimer: NodeJS.Timeout | null = null;
  private isRenewing = false;
  private config: SessionRenewalConfig;
  private authGateway: AuthGateway;

  private constructor() {
    this.config = {
      renewalThreshold: 5, // Renew 5 minutes before expiry
      maxRetries: 3,
      retryDelay: 1000
    };
    this.authGateway = AuthGateway.getInstance();
  }

  static getInstance(): SessionRenewalManager {
    if (!SessionRenewalManager.instance) {
      SessionRenewalManager.instance = new SessionRenewalManager();
    }
    return SessionRenewalManager.instance;
  }

  /**
   * Start automatic session renewal monitoring
   */
  startRenewalMonitoring(): void {
    this.stopRenewalMonitoring(); // Clear any existing timer

    const checkInterval = 60 * 1000; // Check every minute
    this.renewalTimer = setInterval(() => {
      this.checkAndRenewSession();
    }, checkInterval);

    // Also check immediately
    this.checkAndRenewSession();
  }

  /**
   * Stop automatic session renewal monitoring
   */
  stopRenewalMonitoring(): void {
    if (this.renewalTimer) {
      clearInterval(this.renewalTimer);
      this.renewalTimer = null;
    }
  }

  /**
   * Check if session needs renewal and renew if necessary
   */
  private async checkAndRenewSession(): Promise<void> {
    if (this.isRenewing) {
      return; // Already renewing
    }

    try {
      const sessionInfo = this.getCurrentSessionInfo();
      if (!sessionInfo) {
        return; // No session to renew
      }

      const now = Date.now();
      const expiresAt = sessionInfo.expiresAt * 1000; // Convert to milliseconds
      const timeUntilExpiry = expiresAt - now;
      const renewalThreshold = this.config.renewalThreshold * 60 * 1000; // Convert to milliseconds

      if (timeUntilExpiry <= renewalThreshold && timeUntilExpiry > 0) {
        console.log('Session renewal needed, renewing...');
        await this.renewSession(sessionInfo);
      }
    } catch (error) {
      console.error('Session renewal check failed:', error);
    }
  }

  /**
   * Renew the current session
   */
  private async renewSession(sessionInfo: SessionInfo): Promise<void> {
    if (this.isRenewing) {
      return; // Already renewing
    }

    this.isRenewing = true;
    let retries = 0;

    while (retries < this.config.maxRetries) {
      try {
        const newTokens = await this.refreshTokens(sessionInfo.refreshToken);
        
        if (newTokens) {
          // Update stored tokens
          localStorage.setItem('access_token', newTokens.accessToken);
          localStorage.setItem('refresh_token', newTokens.refreshToken);
          
          // Update session info
          const newExpiresAt = this.extractTokenExpiry(newTokens.accessToken);
          if (newExpiresAt) {
            localStorage.setItem('token_expires_at', newExpiresAt.toString());
          }

          console.log('Session renewed successfully');
          this.broadcastSessionRenewal(newTokens);
          break;
        }
      } catch (error) {
        console.error(`Session renewal attempt ${retries + 1} failed:`, error);
        retries++;
        
        if (retries < this.config.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
        } else {
          console.error('Session renewal failed after all retries');
          this.handleRenewalFailure();
        }
      }
    }

    this.isRenewing = false;
  }

  /**
   * Refresh tokens using the refresh token
   */
  private async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      // TODO: Replace with actual GraphQL refresh mutation
      console.log('Refreshing tokens with refresh token:', refreshToken);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock successful token refresh
      const newTokens = {
        accessToken: 'new-access-token-' + Date.now(),
        refreshToken: 'new-refresh-token-' + Date.now()
      };

      return newTokens;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Get current session information from storage
   */
  private getCurrentSessionInfo(): SessionInfo | null {
    try {
      const accessToken = localStorage.getItem('access_token');
      const refreshToken = localStorage.getItem('refresh_token');
      const expiresAt = localStorage.getItem('token_expires_at');

      if (!accessToken || !refreshToken) {
        return null;
      }

      // Extract expiry from token or use stored value
      const tokenExpiry = expiresAt ? parseInt(expiresAt) : this.extractTokenExpiry(accessToken);
      
      if (!tokenExpiry) {
        return null;
      }

      return {
        accessToken,
        refreshToken,
        expiresAt: tokenExpiry,
        userId: this.extractUserIdFromToken(accessToken) || 'unknown'
      };
    } catch (error) {
      console.error('Failed to get session info:', error);
      return null;
    }
  }

  /**
   * Extract token expiry from JWT token
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractTokenExpiry(_token: string): number | null {
    try {
      // For mock tokens, return a future timestamp
      // In real implementation, decode JWT and extract 'exp' claim
      return Math.floor(Date.now() / 1000) + (30 * 60); // 30 minutes from now
    } catch (error) {
      console.error('Failed to extract token expiry:', error);
      return null;
    }
  }

  /**
   * Extract user ID from JWT token
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private extractUserIdFromToken(_token: string): string | null {
    try {
      // For mock tokens, return a mock user ID
      // In real implementation, decode JWT and extract user ID
      return 'user-123';
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return null;
    }
  }

  /**
   * Handle renewal failure by redirecting to login
   */
  private handleRenewalFailure(): void {
    console.log('Session renewal failed, redirecting to login...');
    
    // Clear invalid tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');

    // Store current location for post-auth redirect
    sessionStorage.setItem('intended_destination', window.location.pathname);

    // Redirect to login
    window.location.href = '/auth';
  }

  /**
   * Broadcast session renewal to other parts of the application
   */
  private broadcastSessionRenewal(tokens: { accessToken: string; refreshToken: string }): void {
    // Dispatch custom event for session renewal
    const event = new CustomEvent('sessionRenewed', {
      detail: { tokens }
    });
    window.dispatchEvent(event);
  }

  /**
   * Check if current session is valid
   */
  isSessionValid(): boolean {
    const sessionInfo = this.getCurrentSessionInfo();
    if (!sessionInfo) {
      return false;
    }

    const now = Date.now();
    const expiresAt = sessionInfo.expiresAt * 1000;
    return now < expiresAt;
  }

  /**
   * Force session renewal
   */
  async forceRenewal(): Promise<boolean> {
    const sessionInfo = this.getCurrentSessionInfo();
    if (!sessionInfo) {
      return false;
    }

    try {
      await this.renewSession(sessionInfo);
      return true;
    } catch (error) {
      console.error('Forced session renewal failed:', error);
      return false;
    }
  }
}

/**
 * Hook for using session renewal
 */
export function useSessionRenewal() {
  const manager = SessionRenewalManager.getInstance();

  const startMonitoring = () => manager.startRenewalMonitoring();
  const stopMonitoring = () => manager.stopRenewalMonitoring();
  const isValid = () => manager.isSessionValid();
  const forceRenewal = () => manager.forceRenewal();

  return {
    startMonitoring,
    stopMonitoring,
    isValid,
    forceRenewal
  };
}

export default SessionRenewalManager;