/**
 * Testing Utilities
 * Comprehensive testing utilities for GraphQL and multi-tenant scenarios
 * Requirements: 10.4
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { InMemoryCache } from '@apollo/client';
import { StoreProvider } from '@/lib/stores';
import { AuthProvider } from '@/components/auth';
import { TenantProvider } from '@/components/tenant';

// Mock data types
export interface MockUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  tenants: MockUserTenant[];
  permissions: string[];
}

export interface MockUserTenant {
  tenantId: string;
  role: string;
  permissions: string[];
  isActive: boolean;
}

export interface MockTenant {
  id: string;
  name: string;
  subdomain: string;
  businessTier: 'MICRO' | 'SMALL' | 'MEDIUM' | 'ENTERPRISE';
  settings: {
    timezone: string;
    currency: string;
    dateFormat: string;
    language: string;
    features: Record<string, boolean>;
  };
}

// Default mock data
export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  tenants: [
    {
      tenantId: 'tenant-1',
      role: 'ADMIN',
      permissions: ['READ', 'WRITE', 'DELETE'],
      isActive: true,
    },
  ],
  permissions: ['READ', 'WRITE'],
  ...overrides,
});

export const createMockTenant = (overrides: Partial<MockTenant> = {}): MockTenant => ({
  id: 'tenant-1',
  name: 'Test Tenant',
  subdomain: 'test',
  businessTier: 'SMALL',
  settings: {
    timezone: 'UTC',
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    language: 'en',
    features: {
      analytics: true,
      reporting: true,
      integrations: false,
    },
  },
  ...overrides,
});

// Test wrapper component
interface TestWrapperProps {
  children: React.ReactNode;
  mocks?: MockedResponse[];
  initialUser?: MockUser | null;
  initialTenant?: MockTenant | null;
  cacheConfig?: any;
}

function TestWrapper({
  children,
  mocks = [],
  initialUser = null,
  initialTenant = null,
  cacheConfig = {},
}: TestWrapperProps) {
  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Add cache policies for testing
        },
      },
    },
    ...cacheConfig,
  });

  return (
    <MockedProvider mocks={mocks} cache={cache} addTypename={false}>
      <StoreProvider enableDebug={false}>
        <AuthProvider initialUser={initialUser}>
          <TenantProvider initialTenant={initialTenant}>
            {children}
          </TenantProvider>
        </AuthProvider>
      </StoreProvider>
    </MockedProvider>
  );
}

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mocks?: MockedResponse[];
  initialUser?: MockUser | null;
  initialTenant?: MockTenant | null;
  cacheConfig?: any;
}

export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    mocks,
    initialUser,
    initialTenant,
    cacheConfig,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <TestWrapper
      mocks={mocks}
      initialUser={initialUser}
      initialTenant={initialTenant}
      cacheConfig={cacheConfig}
    >
      {children}
    </TestWrapper>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// GraphQL mock helpers
export function createGraphQLMock(
  query: any,
  variables: any = {},
  result: any = {},
  error?: Error
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: error ? undefined : { data: result },
    error,
  };
}

// Multi-tenant test scenarios
export const createMultiTenantScenarios = () => {
  const microTenant = createMockTenant({
    id: 'micro-tenant',
    businessTier: 'MICRO',
    settings: {
      ...createMockTenant().settings,
      features: {
        analytics: false,
        reporting: false,
        integrations: false,
      },
    },
  });

  const smallTenant = createMockTenant({
    id: 'small-tenant',
    businessTier: 'SMALL',
    settings: {
      ...createMockTenant().settings,
      features: {
        analytics: true,
        reporting: false,
        integrations: false,
      },
    },
  });

  const mediumTenant = createMockTenant({
    id: 'medium-tenant',
    businessTier: 'MEDIUM',
    settings: {
      ...createMockTenant().settings,
      features: {
        analytics: true,
        reporting: true,
        integrations: true,
      },
    },
  });

  const enterpriseTenant = createMockTenant({
    id: 'enterprise-tenant',
    businessTier: 'ENTERPRISE',
    settings: {
      ...createMockTenant().settings,
      features: {
        analytics: true,
        reporting: true,
        integrations: true,
      },
    },
  });

  return {
    microTenant,
    smallTenant,
    mediumTenant,
    enterpriseTenant,
  };
};

// Permission test helpers
export const createPermissionScenarios = () => {
  const readOnlyUser = createMockUser({
    id: 'readonly-user',
    permissions: ['READ'],
    tenants: [
      {
        tenantId: 'tenant-1',
        role: 'VIEWER',
        permissions: ['READ'],
        isActive: true,
      },
    ],
  });

  const editorUser = createMockUser({
    id: 'editor-user',
    permissions: ['READ', 'WRITE'],
    tenants: [
      {
        tenantId: 'tenant-1',
        role: 'EDITOR',
        permissions: ['READ', 'WRITE'],
        isActive: true,
      },
    ],
  });

  const adminUser = createMockUser({
    id: 'admin-user',
    permissions: ['READ', 'WRITE', 'DELETE', 'ADMIN'],
    tenants: [
      {
        tenantId: 'tenant-1',
        role: 'ADMIN',
        permissions: ['READ', 'WRITE', 'DELETE', 'ADMIN'],
        isActive: true,
      },
    ],
  });

  return {
    readOnlyUser,
    editorUser,
    adminUser,
  };
};

// Async testing helpers
export const waitForGraphQL = () => new Promise(resolve => setTimeout(resolve, 0));

export const waitForNextTick = () => new Promise(resolve => process.nextTick(resolve));

// Mock localStorage for testing
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Mock sessionStorage for testing
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';