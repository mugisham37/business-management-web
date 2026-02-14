/**
 * Token Utilities
 * 
 * Provides utility functions for JWT token operations including:
 * - Parsing JWT payload
 * - Extracting token expiration
 * - Checking token expiration status
 * - Validating token format
 * 
 * Requirements: 3.1, 8.7
 */

/**
 * Parses a JWT token and returns the decoded payload
 * @param token - JWT token string
 * @returns Decoded payload object or null if invalid
 */
export function parseJWT(token: string): Record<string, any> | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return null;
  }
}

/**
 * Extracts the expiration timestamp from a JWT token
 * @param token - JWT token string
 * @returns Expiration timestamp in seconds since epoch, or 0 if invalid
 */
export function getTokenExpiration(token: string): number {
  const payload = parseJWT(token);
  if (!payload || typeof payload.exp !== 'number') {
    return 0;
  }
  return payload.exp;
}

/**
 * Checks if a JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (expiration === 0) {
    return true; // Invalid token is considered expired
  }
  
  const now = Date.now() / 1000; // Convert to seconds
  return now >= expiration;
}

/**
 * Validates the format of a JWT token
 * Checks that the token has three base64-encoded parts separated by dots
 * @param token - JWT token string
 * @returns true if token format is valid, false otherwise
 */
export function validateTokenFormat(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  // JWT must have exactly 3 parts separated by dots
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }

  // Each part should be non-empty and base64url encoded
  // Base64url uses: A-Z, a-z, 0-9, -, _
  const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
  
  for (const part of parts) {
    if (!part || !base64UrlPattern.test(part)) {
      return false;
    }
  }

  // Try to parse the payload to ensure it's valid JSON
  try {
    const payload = parseJWT(token);
    return payload !== null;
  } catch {
    return false;
  }
}
