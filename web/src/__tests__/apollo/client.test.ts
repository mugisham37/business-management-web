import { apolloClient } from '@/lib/apollo/client';
import { InMemoryCache } from '@apollo/client';

// Mock the config to avoid environment variable validation in tests
jest.mock('@/lib/config/env', () => ({
  config: {
    graphql: {
      uri: 'http://localhost:4000/graphql',
      wsUri: 'ws://localhost:4000/graphql',
    },
    development: {
      enableDevtools: false,
    },
  },
}));

describe('Apollo Client Configuration', () => {
  it('should be properly configured', () => {
    expect(apolloClient).toBeDefined();
    expect(apolloClient.cache).toBeInstanceOf(InMemoryCache);
  });

  it('should have correct default options', () => {
    const defaultOptions = apolloClient.defaultOptions;
    
    expect(defaultOptions?.watchQuery?.errorPolicy).toBe('all');
    expect(defaultOptions?.watchQuery?.fetchPolicy).toBe('cache-first');
    expect(defaultOptions?.query?.errorPolicy).toBe('all');
    expect(defaultOptions?.query?.fetchPolicy).toBe('cache-first');
    expect(defaultOptions?.mutate?.errorPolicy).toBe('all');
  });

  it('should have cache configured with type policies', () => {
    const cache = apolloClient.cache as InMemoryCache;
    const policies = cache.policies;
    
    expect(policies).toBeDefined();
    // Test that type policies are configured
    expect(policies.rootTypenamesById.ROOT_QUERY).toBe('Query');
  });

  it('should handle cache operations', () => {
    const cache = apolloClient.cache;
    
    // Test basic cache operations
    expect(() => cache.extract()).not.toThrow();
    expect(() => cache.gc()).not.toThrow();
  });
});