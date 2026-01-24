/**
 * Tenant Switching Service
 * Handles tenant switching logic and validation
 * Requirements: 4.1, 4.3
 */

import { apolloClient } from '@/lib/apollo/client';
import { gql } from '@apollo/client';
import { Tenant } from '@/types/core';

export interface TenantSwitchResult {
  success: boolean;
  message: string;
  tenant?: Tenant;
  error?: string | undefined;
}

export interface TenantAccessValidation {
  hasAccess: boolean;
  reason?: string;
  tenant?: Tenant;
}

export interface TenantSwitchOptions {
  clearCache?: boolean;
  refreshContext?: boolean;
  validateAccess?: boolean;
}

/**
 * Tenant Switching Service
 * Manages tenant switching operations with validation and caching
 */
export class TenantSwitchingService {
  private switchingInProgress = false;
  private currentSwitchPromise: Promise<TenantSwitchResult> | null = null;

  /**
   * Switch to a different tenant
   */
  async switchTenant(
    tenantId: string, 
    options: TenantSwitchOptions = {}
  ): Promise<TenantSwitchResult> {
    const {
      clearCache = true,
      refreshContext = true,
      validateAccess = true,
    } = options;

    // Prevent concurrent switches
    if (this.switchingInProgress && this.currentSwitchPromise) {
      return await this.currentSwitchPromise;
    }

    this.switchingInProgress = true;
    this.currentSwitchPromise = this.performTenantSwitch(
      tenantId, 
      { clearCache, refreshContext, validateAccess }
    );

    try {
      const result = await this.currentSwitchPromise;
      return result;
    } finally {
      this.switchingInProgress = false;
      this.currentSwitchPromise = null;
    }
  }

  /**
   * Validate tenant access for current user
   */
  async validateTenantAccess(tenantId: string): Promise<TenantAccessValidation> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query ValidateTenantAccess($tenantId: ID!) {
            isValidTenant(tenantId: $tenantId)
            tenant(id: $tenantId) {
              id
              name
              slug
              businessTier
              subscriptionStatus
              isActive
            }
          }
        `,
        variables: { tenantId },
        fetchPolicy: 'network-only',
      });

      if (!data.isValidTenant) {
        return {
          hasAccess: false,
          reason: 'Tenant not found or access denied',
        };
      }

      if (!data.tenant.isActive) {
        return {
          hasAccess: false,
          reason: 'Tenant is inactive',
          tenant: data.tenant,
        };
      }

      return {
        hasAccess: true,
        tenant: data.tenant,
      };
    } catch (error) {
      return {
        hasAccess: false,
        reason: error instanceof Error ? error.message : 'Validation failed',
      };
    }
  }

  /**
   * Get available tenants for current user
   */
  async getAvailableTenants(): Promise<Tenant[]> {
    try {
      const { data } = await apolloClient.query({
        query: gql`
          query GetAvailableTenants {
            tenants {
              id
              name
              slug
              businessTier
              subscriptionStatus
              isActive
              healthStatus
              createdAt
            }
          }
        `,
        fetchPolicy: 'cache-first',
      });

      return data.tenants.filter((tenant: Tenant) => tenant.isActive);
    } catch (error) {
      console.error('Failed to fetch available tenants:', error);
      return [];
    }
  }

  /**
   * Check if switching is currently in progress
   */
  isSwitching(): boolean {
    return this.switchingInProgress;
  }

  /**
   * Cancel current switch operation (if possible)
   */
  cancelSwitch(): void {
    if (this.switchingInProgress) {
      this.switchingInProgress = false;
      this.currentSwitchPromise = null;
    }
  }

  /**
   * Perform the actual tenant switch operation
   */
  private async performTenantSwitch(
    tenantId: string,
    options: Required<TenantSwitchOptions>
  ): Promise<TenantSwitchResult> {
    try {
      // Validate access if requested
      if (options.validateAccess) {
        const validation = await this.validateTenantAccess(tenantId);
        if (!validation.hasAccess) {
          return {
            success: false,
            message: validation.reason || 'Access denied',
            error: validation.reason,
          };
        }
      }

      // Perform the switch mutation
      const { data } = await apolloClient.mutate({
        mutation: gql`
          mutation SwitchTenant($tenantId: ID!) {
            switchTenant(tenantId: $tenantId) {
              success
              message
              user {
                id
                email
                tenantId
                role
                permissions
              }
            }
          }
        `,
        variables: { tenantId },
      });

      if (!data?.switchTenant?.success) {
        return {
          success: false,
          message: data?.switchTenant?.message || 'Switch failed',
          error: data?.switchTenant?.message,
        };
      }

      // Clear Apollo cache if requested
      if (options.clearCache) {
        await apolloClient.clearStore();
      }

      // Refresh tenant context if requested
      if (options.refreshContext) {
        await this.refreshTenantContext();
      }

      return {
        success: true,
        message: 'Tenant switched successfully',
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        success: false,
        message: `Failed to switch tenant: ${errorMessage}`,
        error: errorMessage,
      };
    }
  }

  /**
   * Refresh tenant context after switch
   */
  private async refreshTenantContext(): Promise<void> {
    try {
      await apolloClient.query({
        query: gql`
          query RefreshTenantContext {
            tenantContext {
              tenant {
                id
                name
                slug
                businessTier
                subscriptionStatus
                settings {
                  timezone
                  locale
                  currency
                  logoUrl
                  primaryColor
                }
                isActive
              }
              businessTier
              isActive
            }
          }
        `,
        fetchPolicy: 'network-only',
      });
    } catch (error) {
      console.error('Failed to refresh tenant context:', error);
    }
  }
}

/**
 * Default tenant switching service instance
 */
export const tenantSwitchingService = new TenantSwitchingService();

/**
 * Hook for tenant switching functionality
 */
export function useTenantSwitchingService() {
  return tenantSwitchingService;
}