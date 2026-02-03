/**
 * Library Index
 * 
 * Main entry point for the authentication foundation layer.
 * Exports all core functionality for easy importing.
 */

// GraphQL Client and Operations
export { apolloClient, cache } from './graphql/client';
export * from './graphql/operations/auth';
export * from './graphql/operations/mfa';
export * from './graphql/operations/social-auth';
export * from './graphql/operations/permissions';
export * from './graphql/operations/security';
export * from './graphql/operations/tier';
export * from './graphql/operations/subscriptions';

// Generated Types
export * from './graphql/generated/types';

// Authentication Core
export { TokenManager } from './auth/token-manager';
export { AuthEventEmitter } from './auth/auth-events';
export { socialAuthManager } from './auth/social-auth';
export type { SocialProvider, SocialAuthResult } from './auth/social-auth';

// Hooks
export * from './hooks/auth';

// Providers
export * from './providers';

// Utilities
export * from './utils';