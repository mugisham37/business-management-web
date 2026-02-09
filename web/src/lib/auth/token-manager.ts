/**
 * Token Manager
 * 
 * Manages secure storage and operations for JWT access and refresh tokens.
 * 
 * Security Design:
 * - Access tokens: Stored in memory + sessionStorage for persistence
 * - Refresh tokens: Stored in httpOnly-like cookies for security
 * 
 * This design balances security with functionality:
 * - Memory storage prevents XSS in most cases
 * - SessionStorage allows page reload recovery
 * - Refresh tokens in cookies enable automatic session restoration
 */

import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '@/types/auth';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const REFRESH_TOKEN_COOKIE = 'refresh_token';
const ACCESS_TOKEN_STORAGE_KEY = 'access_token_temp';

class TokenManagerClass {
  private accessToken: string | null = null;
  private isInitialized: boolean = false;

  /**
   * Get the current access token from memory or sessionStorage
   * @returns The access token or null if not set
   */
  getAccessToken(): string | null {
    // First check memory
    if (this.accessToken) {
      return this.accessToken;
    }

    // Fallback to sessionStorage for page reload recovery
    if (typeof window !== 'undefined') {
      try {
        const stored = sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (stored) {
          // Validate token before using
          if (!this.isTokenExpired(stored)) {
            this.accessToken = stored;
            return stored;
          } else {
            // Clean up expired token
            sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error('Failed to read access token from storage:', error);
      }
    }

    return null;
  }

  /**
   * Set the access token in memory and sessionStorage
   * @param token - The JWT access token to store
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    
    // Also store in sessionStorage for page reload recovery
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
      } catch (error) {
        console.error('Failed to store access token:', error);
      }
    }
  }

  /**
   * Get the refresh token from cookies
   * @returns The refresh token or null if not set
   */
  getRefreshToken(): string | null {
    return Cookies.get(REFRESH_TOKEN_COOKIE) || null;
  }

  /**
   * Set the refresh token in cookies
   * @param token - The refresh token to store
   */
  setRefreshToken(token: string): void {
    // Store for 7 days (matching backend expiry)
    Cookies.set(REFRESH_TOKEN_COOKIE, token, {
      expires: 7,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  /**
   * Clear all tokens (access token from memory/storage and refresh token cookie)
   */
  clearTokens(): void {
    this.accessToken = null;
    this.isInitialized = false;
    
    // Clear sessionStorage
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      } catch (error) {
        console.error('Failed to clear access token from storage:', error);
      }
    }
    
    // Clear cookie
    Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
  }

  /**
   * Decode a JWT token without validation
   * Note: Token validation happens on the backend. This is only for extracting payload.
   * @param token - The JWT token to decode
   * @returns The decoded payload or null if decoding fails
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if a token is expired based on its exp claim
   * Includes 30 second buffer to prevent edge cases
   * @param token - The JWT token to check
   * @returns true if the token is expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000; // Convert to seconds
    const bufferTime = 30; // 30 second buffer
    return decoded.exp < (currentTime + bufferTime);
  }

  /**
   * Get user information from the current access token
   * @returns The decoded JWT payload or null if no token is set
   */
  getUserFromToken(): JwtPayload | null {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  /**
   * Check if we have a valid session (either access token or refresh token)
   * @returns true if session exists, false otherwise
   */
  hasSession(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    // Valid if we have a non-expired access token
    if (accessToken && !this.isTokenExpired(accessToken)) {
      return true;
    }
    
    // Or if we have a refresh token (can restore session)
    return !!refreshToken;
  }

  /**
   * Refresh the access token using the refresh token
   * This method makes a direct fetch call to avoid circular dependencies with the API client
   * @returns Promise resolving to the new access token
   * @throws Error if refresh fails
   */
  async refreshAccessToken(): Promise<string> {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    
    if (!apiBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
    }

    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${apiBaseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;
      
      this.setAccessToken(newAccessToken);
      if (newRefreshToken) {
        this.setRefreshToken(newRefreshToken);
      }
      
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      // Clear tokens on refresh failure
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Initialize the session by attempting to refresh the access token
   * This should be called when the application loads to restore the session
   * @returns Promise resolving to true if session was restored, false otherwise
   */
  async initializeSession(): Promise<boolean> {
    // Prevent multiple simultaneous initializations
    if (this.isInitialized) {
      return this.hasSession();
    }

    // Check if we already have a valid access token
    const existingToken = this.getAccessToken();
    if (existingToken && !this.isTokenExpired(existingToken)) {
      this.isInitialized = true;
      return true;
    }

    // Try to restore session using refresh token
    const refreshToken = this.getRefreshToken();
    
    // If no refresh token exists, user is not logged in
    if (!refreshToken) {
      this.isInitialized = true;
      return false;
    }

    try {
      await this.refreshAccessToken();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.clearTokens();
      this.isInitialized = true;
      return false;
    }
  }

  /**
   * Validate current session and refresh if needed
   * @returns Promise resolving to true if session is valid
   */
  async validateSession(): Promise<boolean> {
    const accessToken = this.getAccessToken();
    
    // If we have a valid access token, we're good
    if (accessToken && !this.isTokenExpired(accessToken)) {
      return true;
    }

    // Try to refresh
    try {
      await this.refreshAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Reset initialization state (useful for testing or forced re-initialization)
   */
  resetInitialization(): void {
    this.isInitialized = false;
  }
}

// Export a singleton instance
export const TokenManager = new TokenManagerClass();
