/**
 * GraphQL Module Exports
 * 
 * Exports Apollo Client, cache configuration, cache manager, and Apollo links
 */

export { apolloClient, createApolloClient } from './client';
export type { ApolloClientConfig } from './client';
export { cache, createCache, typePolicies } from './cache';
export type { CacheManager } from './cache-manager';
export { createCacheManager } from './cache-manager';
export * from './links';
