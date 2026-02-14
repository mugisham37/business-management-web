/**
 * Foundation Layer - Next.js 14 Frontend Infrastructure
 * 
 * This module provides core utilities, hooks, providers, and middleware
 * for communicating with the NestJS GraphQL backend.
 * 
 * @module foundation
 */

// Configuration
export { env, isDevelopment, isProduction, isTest } from './config/env';
export type { EnvConfig } from './config/env';
export * from './config/routes';

// Types
export * from './types/generated/graphql';

// Hooks will be exported as they are implemented
// export * from './hooks';

// Providers
export * from './providers';

// Utilities
export * from './utils';

// Middleware will be exported as it is implemented
// export * from './middleware';
