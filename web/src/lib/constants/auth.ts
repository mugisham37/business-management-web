/**
 * Authentication Constants
 * 
 * Configuration for token management and authentication routes.
 */

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  TEAM_LOGIN: '/auth/team',
  VERIFY_EMAIL: '/auth/verify-email',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  UNAUTHORIZED: '/unauthorized',
} as const;

export const ROUTE_GROUPS = {
  PUBLIC: [
    '/auth/login',
    '/auth/register',
    '/auth/team',
    '/auth/verify-email',
    '/auth/reset-password',
  ],
  AUTH_ONLY: [
    '/auth/login',
    '/auth/register',
    '/auth/team',
  ],
  PROTECTED: [
    '/dashboard',
    '/settings',
    '/users',
    '/roles',
  ],
} as const;
