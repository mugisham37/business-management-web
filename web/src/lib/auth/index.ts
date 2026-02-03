/**
 * Authentication Module Index
 * 
 * Centralized exports for all authentication-related utilities
 */

// Token Management
export { TokenManager } from './token-manager';

// Event System
export { AuthEventEmitter } from './auth-events';
export type { SecurityActivityData } from './auth-events';

// Social Authentication
export { socialAuthManager, SocialAuthManagerClass } from './social-auth';
export type { 
  SocialProvider,
  SocialAuthResult,
  SocialAuthState,
} from './social-auth';

// Error Handling
export * from './auth-errors';
