/**
 * Application-wide constants
 */

/**
 * Permission modules
 */
export const PERMISSION_MODULES = [
  'users',
  'permissions',
  'organizations',
  'branches',
  'departments',
  'business_rules',
  'audit_logs',
  'reports',
] as const;

/**
 * Permission actions
 */
export const PERMISSION_ACTIONS = ['create', 'read', 'update', 'delete', 'manage'] as const;

/**
 * Session event types
 */
export const SESSION_EVENTS = ['login', 'logout', 'token_refresh', 'permission_change'] as const;

/**
 * WebSocket connection states
 */
export const WS_CONNECTION_STATES = ['connecting', 'connected', 'disconnected', 'reconnecting'] as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

/**
 * Cache TTL values (in milliseconds)
 */
export const CACHE_TTL = {
  PERMISSION: 60000, // 1 minute
  USER: 300000, // 5 minutes
  ORGANIZATION: 600000, // 10 minutes
} as const;

/**
 * Broadcast channel names
 */
export const BROADCAST_CHANNELS = {
  AUTH: 'auth_channel',
  PERMISSION: 'permission_channel',
} as const;
