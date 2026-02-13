import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

/**
 * Token utility functions for JWT generation and validation
 * Implements requirements 4.1, 4.2, 3.8
 */

export interface TokenPayload {
  user_id: string;
  organization_id: string;
  role: 'OWNER' | 'MANAGER' | 'WORKER';
}

export interface AccessTokenPayload extends TokenPayload {
  type: 'access';
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
  family_id: string;
}

export interface VerifiedToken<T extends TokenPayload> {
  payload: T;
  iat: number;
  exp: number;
}

/**
 * Generate an Access Token (JWT) with 15-minute expiration
 * @param payload - Token payload containing user_id, organization_id, and role
 * @param secret - JWT secret from configuration
 * @returns string - Signed JWT access token
 */
export function generateAccessToken(
  payload: TokenPayload,
  secret: string,
): string {
  const accessPayload: AccessTokenPayload = {
    ...payload,
    type: 'access',
  };

  return sign(accessPayload, secret, {
    expiresIn: '15m',
  });
}

/**
 * Generate a Refresh Token (JWT) with 7-day expiration
 * @param payload - Token payload containing user_id, organization_id, and role
 * @param familyId - Token family ID for rotation tracking
 * @param secret - JWT refresh secret from configuration
 * @returns string - Signed JWT refresh token
 */
export function generateRefreshToken(
  payload: TokenPayload,
  familyId: string,
  secret: string,
): string {
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    type: 'refresh',
    family_id: familyId,
  };

  return sign(refreshPayload, secret, {
    expiresIn: '7d',
  });
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @param secret - JWT secret for verification
 * @returns VerifiedToken<T> - Decoded and verified token payload
 * @throws Error if token is invalid, expired, or malformed
 */
export function verifyToken<T extends TokenPayload>(
  token: string,
  secret: string,
): VerifiedToken<T> {
  try {
    const decoded = verify(token, secret) as JwtPayload & T;

    return {
      payload: {
        user_id: decoded.user_id,
        organization_id: decoded.organization_id,
        role: decoded.role,
        ...(decoded as any),
      } as T,
      iat: decoded.iat!,
      exp: decoded.exp!,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error('Token verification failed: Unknown error');
  }
}

/**
 * Extract token expiration time in seconds
 * @param token - JWT token
 * @param secret - JWT secret for verification
 * @returns number - Expiration timestamp in seconds
 */
export function getTokenExpiration(token: string, secret: string): number {
  const verified = verifyToken(token, secret);
  return verified.exp;
}

/**
 * Check if a token is expired
 * @param token - JWT token
 * @param secret - JWT secret for verification
 * @returns boolean - True if token is expired, false otherwise
 */
export function isTokenExpired(token: string, secret: string): boolean {
  try {
    const verified = verifyToken(token, secret);
    const now = Math.floor(Date.now() / 1000);
    return verified.exp < now;
  } catch {
    return true; // If verification fails, consider it expired
  }
}
