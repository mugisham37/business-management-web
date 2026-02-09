/**
 * Token Manager
 * 
 * Manages secure storage and operations for JWT access and refresh tokens.
 * 
 * Security Design:
 * - Access tokens: Stored in memory only (not in localStorage/sessionStorage)
 * - Refresh tokens: Stored in cookies for persistence across page reloads
 * 
 * This design protects against XSS attacks by keeping tokens out of localStorage/sessionStorage.
 */

import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import { JwtPayload } from '@/types/auth';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

class TokenManagerClass {
  private accessToken: string | null = null;

  /**
   * Get the current access token from memory
   * @returns The access token or null if not set
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set the access token in memory
   * @param token - The JWT access token to store
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
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
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  /**
   * Clear all tokens (access token from memory and refresh token cookie)
   */
  clearTokens(): void {
    this.accessToken = null;
    Cookies.remove(REFRESH_TOKEN_COOKIE);
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
   * @param token - The JWT token to check
   * @returns true if the token is expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Date.now() / 1000; // Convert to seconds
    return decoded.exp < currentTime;
  }

  /**
   * Get user information from the current access token
   * @returns The decoded JWT payload or null if no token is set
   */
  getUserFromToken(): JwtPayload | null {
    if (!this.accessToken) {
      return null;
    }
    return this.decodeToken(this.accessToken);
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
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const newAccessToken = data.data.accessToken;
      const newRefreshToken = data.data.refreshToken;
      
      this.setAccessToken(newAccessToken);
      this.setRefreshToken(newRefreshToken);
      
      return newAccessToken;
    } catch (error) {
      console.error('Failed to refresh access token:', error);
      throw error;
    }
  }

  /**
   * Initialize the session by attempting to refresh the access token
   * This should be called when the application loads to restore the session
   * @returns Promise resolving to true if session was restored, false otherwise
   */
  async initializeSession(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    
    // If no refresh token exists, silently return false (user not logged in)
    if (!refreshToken) {
      return false;
    }

    try {
      await this.refreshAccessToken();
      return true;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.clearTokens();
      return false;
    }
  }
}

// Export a singleton instance
export const TokenManager = new TokenManagerClass();
