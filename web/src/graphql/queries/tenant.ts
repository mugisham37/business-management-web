/**
 * Generated GraphQL queries for tenant operations
 * Auto-generated from tenant.graphql
 */

import { gql } from '@apollo/client';

export const GET_CURRENT_TENANT_QUERY = gql`
  query GetCurrentTenant {
    currentTenant {
      id
      name
      subdomain
      businessTier
      isActive
      settings {
        timezone
        currency
        dateFormat
        language
        features
        limits {
          maxUsers
          maxStorage
          maxApiCalls
          maxIntegrations
        }
      }
      branding {
        primaryColor
        secondaryColor
        logo
        favicon
        customCss
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TENANTS_QUERY = gql`
  query GetTenants {
    tenants {
      id
      name
      subdomain
      businessTier
      isActive
      settings {
        timezone
        currency
        dateFormat
        language
        features
        limits {
          maxUsers
          maxStorage
          maxApiCalls
          maxIntegrations
        }
      }
      branding {
        primaryColor
        secondaryColor
        logo
        favicon
        customCss
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_TENANT_QUERY = gql`
  query GetTenant($id: ID!) {
    tenant(id: $id) {
      id
      name
      subdomain
      businessTier
      isActive
      settings {
        timezone
        currency
        dateFormat
        language
        features
        limits {
          maxUsers
          maxStorage
          maxApiCalls
          maxIntegrations
        }
      }
      branding {
        primaryColor
        secondaryColor
        logo
        favicon
        customCss
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_FEATURE_FLAGS_QUERY = gql`
  query GetFeatureFlags($tenantId: ID) {
    featureFlags(tenantId: $tenantId) {
      key
      enabled
      config
      requiredTier
    }
  }
`;

export const GET_FEATURE_FLAG_QUERY = gql`
  query GetFeatureFlag($key: String!, $tenantId: ID) {
    featureFlag(key: $key, tenantId: $tenantId) {
      key
      enabled
      config
      requiredTier
    }
  }
`;