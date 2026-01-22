/**
 * Property-Based Testing Generators
 * Fast-Check generators for GraphQL and multi-tenant scenarios
 * Requirements: 10.4
 */

import * as fc from 'fast-check';
import { gql, DocumentNode } from '@apollo/client';

// Basic data generators
export const stringArb = fc.string({ minLength: 1, maxLength: 100 });
export const emailArb = fc.emailAddress();
export const uuidArb = fc.uuid();
export const timestampArb = fc.date({ min: new Date('2020-01-01'), max: new Date('2030-01-01') });

// Business tier generator
export const businessTierArb = fc.constantFrom('MICRO', 'SMALL', 'MEDIUM', 'ENTERPRISE');

// Permission generator
export const permissionArb = fc.constantFrom('READ', 'WRITE', 'DELETE', 'ADMIN', 'MANAGE_USERS', 'MANAGE_SETTINGS');

// User generators
export const userArb = fc.record({
  id: uuidArb,
  email: emailArb,
  firstName: stringArb,
  lastName: stringArb,
  avatar: fc.option(fc.webUrl()),
  createdAt: timestampArb,
  updatedAt: timestampArb,
});

export const userTenantArb = fc.record({
  tenantId: uuidArb,
  role: fc.constantFrom('VIEWER', 'EDITOR', 'ADMIN', 'OWNER'),
  permissions: fc.array(permissionArb, { minLength: 1, maxLength: 6 }),
  isActive: fc.boolean(),
});

export const userWithTenantsArb = fc.record({
  ...userArb.constraints,
  tenants: fc.array(userTenantArb, { minLength: 1, maxLength: 5 }),
  permissions: fc.array(permissionArb, { minLength: 1, maxLength: 6 }),
});

// Tenant generators
export const tenantSettingsArb = fc.record({
  timezone: fc.constantFrom('UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'),
  currency: fc.constantFrom('USD', 'EUR', 'GBP', 'JPY'),
  dateFormat: fc.constantFrom('MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'),
  language: fc.constantFrom('en', 'es', 'fr', 'de', 'ja'),
  features: fc.record({
    analytics: fc.boolean(),
    reporting: fc.boolean(),
    integrations: fc.boolean(),
    advancedSecurity: fc.boolean(),
    customBranding: fc.boolean(),
  }),
});

export const tenantArb = fc.record({
  id: uuidArb,
  name: stringArb,
  subdomain: fc.string({ minLength: 3, maxLength: 20 }).filter(s => /^[a-z0-9-]+$/.test(s)),
  businessTier: businessTierArb,
  settings: tenantSettingsArb,
  createdAt: timestampArb,
  updatedAt: timestampArb,
});

// GraphQL operation generators
export const graphqlVariablesArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.float(),
    fc.constant(null)
  )
);

export const graphqlFieldArb: fc.Arbitrary<string> = fc.string({ minLength: 1, maxLength: 30 })
  .filter(s => /^[a-zA-Z][a-zA-Z0-9_]*$/.test(s));

export const graphqlQueryArb = fc.record({
  operationName: fc.option(graphqlFieldArb),
  fields: fc.array(graphqlFieldArb, { minLength: 1, maxLength: 10 }),
  variables: graphqlVariablesArb,
});

// Cache key generators
export const cacheKeyArb = fc.oneof(
  fc.string({ minLength: 1, maxLength: 50 }),
  fc.record({
    __typename: stringArb,
    id: uuidArb,
  }).map(obj => `${obj.__typename}:${obj.id}`)
);

// Network error generators
export const networkErrorArb = fc.record({
  name: fc.constantFrom('NetworkError', 'TimeoutError', 'ConnectionError'),
  message: stringArb,
  code: fc.option(fc.constantFrom('NETWORK_ERROR', 'TIMEOUT', 'CONNECTION_REFUSED')),
});

// GraphQL error generators
export const graphqlErrorArb = fc.record({
  message: stringArb,
  locations: fc.option(fc.array(fc.record({
    line: fc.integer({ min: 1, max: 100 }),
    column: fc.integer({ min: 1, max: 100 }),
  }))),
  path: fc.option(fc.array(fc.oneof(stringArb, fc.integer()))),
  extensions: fc.option(fc.record({
    code: fc.constantFrom('GRAPHQL_VALIDATION_FAILED', 'UNAUTHENTICATED', 'FORBIDDEN'),
    exception: fc.option(fc.record({
      stacktrace: fc.array(stringArb),
    })),
  })),
});

// Authentication token generators
export const jwtPayloadArb = fc.record({
  sub: uuidArb,
  email: emailArb,
  iat: fc.integer({ min: 1600000000, max: 2000000000 }),
  exp: fc.integer({ min: 1600000000, max: 2000000000 }),
  tenantId: fc.option(uuidArb),
  permissions: fc.array(permissionArb),
});

export const tokenPairArb = fc.record({
  accessToken: fc.string({ minLength: 100, maxLength: 200 }),
  refreshToken: fc.string({ minLength: 100, maxLength: 200 }),
  expiresAt: timestampArb,
  tokenType: fc.constant('Bearer' as const),
});

// Subscription event generators
export const subscriptionEventArb = fc.record({
  id: uuidArb,
  type: fc.constantFrom('CREATED', 'UPDATED', 'DELETED'),
  entityType: fc.constantFrom('USER', 'TENANT', 'ORDER', 'PRODUCT'),
  entityId: uuidArb,
  tenantId: uuidArb,
  data: fc.anything(),
  timestamp: timestampArb,
});

// Cache operation generators
export const cacheOperationArb = fc.record({
  type: fc.constantFrom('READ', 'write', 'delete', 'clear'),
  key: cacheKeyArb,
  value: fc.option(fc.anything()),
  ttl: fc.option(fc.integer({ min: 1, max: 86400 })),
});

// Performance metrics generators
export const performanceMetricsArb = fc.record({
  operationName: stringArb,
  duration: fc.integer({ min: 1, max: 10000 }),
  cacheHit: fc.boolean(),
  networkTime: fc.option(fc.integer({ min: 1, max: 5000 })),
  parseTime: fc.option(fc.integer({ min: 1, max: 100 })),
  validationTime: fc.option(fc.integer({ min: 1, max: 100 })),
});

// Multi-tenant scenario generators
export const multiTenantScenarioArb = fc.record({
  user: userWithTenantsArb,
  currentTenant: tenantArb,
  availableTenants: fc.array(tenantArb, { minLength: 1, maxLength: 5 }),
  switchToTenant: fc.option(uuidArb),
});

// Feature flag generators
export const featureFlagArb = fc.record({
  key: stringArb,
  enabled: fc.boolean(),
  config: fc.dictionary(stringArb, fc.anything()),
  requiredTier: businessTierArb,
});

// State change generators
export const stateChangeArb = fc.record({
  type: fc.constantFrom('AUTH_LOGIN', 'AUTH_LOGOUT', 'TENANT_SWITCH', 'FEATURE_TOGGLE'),
  payload: fc.anything(),
  timestamp: timestampArb,
  source: fc.constantFrom('user', 'system', 'network'),
});

// Helper functions for creating complex scenarios
export function createAuthenticationScenario() {
  return fc.record({
    initialUser: fc.option(userWithTenantsArb),
    loginCredentials: fc.record({
      email: emailArb,
      password: fc.string({ minLength: 8, maxLength: 50 }),
      mfaCode: fc.option(fc.string({ minLength: 6, maxLength: 6 })),
    }),
    expectedResult: fc.oneof(
      fc.record({ success: fc.constant(true), user: userWithTenantsArb, tokens: tokenPairArb }),
      fc.record({ success: fc.constant(false), error: stringArb })
    ),
  });
}

export function createCacheConsistencyScenario() {
  return fc.record({
    initialCache: fc.dictionary(cacheKeyArb, fc.anything()),
    operations: fc.array(cacheOperationArb, { minLength: 1, maxLength: 10 }),
    expectedFinalState: fc.dictionary(cacheKeyArb, fc.anything()),
  });
}

export function createPermissionScenario() {
  return fc.record({
    user: userWithTenantsArb,
    tenant: tenantArb,
    requiredPermissions: fc.array(permissionArb, { minLength: 1, maxLength: 3 }),
    action: stringArb,
    expectedAccess: fc.boolean(),
  });
}

// Property test configuration
export const defaultPropertyConfig = {
  numRuns: 100,
  timeout: 5000,
  seed: 42, // For reproducible tests
  path: [], // For shrinking
  endOnFailure: false,
};

// Custom property test runner
export function runPropertyTest<T>(
  name: string,
  arbitrary: fc.Arbitrary<T>,
  predicate: (value: T) => boolean | Promise<boolean>,
  config: Partial<typeof defaultPropertyConfig> = {}
) {
  const finalConfig = { ...defaultPropertyConfig, ...config };
  
  return fc.assert(
    fc.property(arbitrary, predicate),
    finalConfig
  );
}