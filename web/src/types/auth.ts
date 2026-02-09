// Authentication and JWT Types

import type { User } from './user';

/**
 * JWT Payload structure
 * Decoded from access tokens
 */
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  organizationId: string;
  roleId: string;
  permissions: string[];
  iat: number; // issued at timestamp
  exp: number; // expiration timestamp
}

/**
 * Authentication context state
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Token storage keys
 */
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;
