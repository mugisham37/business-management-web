/**
 * Tenant Context Management
 * Central tenant system handling context, configuration, and feature flags
 * Requirements: 4.1, 4.3
 */

import { Tenant, TenantSettings, FeatureFlag, BusinessTier } from '@/types/core';
import { apolloClient } from '@/lib/apollo/client';
// Note: SWITCH_TENANT_MUTATION will be imported when auth mutations are updated
// import { SWITCH_TENANT_MUTATION } from '@/graphql/mutations/auth';
import { GET_CURRENT_TENANT_QUERY, GET_FEATURE_FLAGS_QUERY } from '@/graphql/queries/tenant';

export interface TenantContextState {
  currentTenant: Tenant | null;
  availableTenants: Tenant[];
  businessTier: BusinessTier;
  features: FeatureFlag[];
  isLoading: boolean;
  error: string | null;
}

export interface TenantContextConfig {
  onTenantChange?: (tenant: Tenant | null) => void;
  onFeatureChange?: (features: FeatureFlag[]) => void;
  onError?: (error: Error) => void;
}

export interface FeatureConfig {
  enabled: boolean;
  config: Record<string, unknown>;
  requiredTier: BusinessTier;
}

/**
 * Tenant Context Manager
 * Manages multi-tenant state, configuration, and feature flags
 */
export class TenantContextManager {
  private currentState: TenantContextState;
  private listeners: Set<(state: TenantContextState) => void> = new Set();
  private featureCache: Map<string, FeatureConfig> = new Map();

  constructor(private config: TenantContextConfig = {}) {
    this.currentState = {
      currentTenant: null,
      availableTenants: [],
      businessTier: 'MICRO',
      features: [],
      isLoading: false,
      error: null,
    };

    // Initialize tenant context
    this.initializeTenantContext();
  }

  /**
   * Get current tenant context state
   */
  getState(): TenantContextState {
    return { ...this.currentState };
  }

  /**
   * Get current tenant
   */
  getCurrentTenant(): Tenant | null {
    return this.currentState.currentTenant;
  }

  /**
   * Get current business tier
   */
  getBusinessTier(): BusinessTier {
    return this.currentState.businessTier;
  }

  /**
   * Get available tenants for current user
   */
  getAvailableTenants(): Tenant[] {
    return [...this.currentState.availableTenants];
  }

  /**
   * Switch to a different tenant
   */
  async switchTenant(tenantId: string): Promise<boolean> {
    this.setLoading(true);
    this.clearError();

    try {
      // Validate tenant access
      const hasAccess = this.validateTenantAccess(tenantId);
      if (!hasAccess) {
        throw new Error('Access denied to the specified tenant');
      }

      // Call switch tenant mutation
      // TODO: Implement SWITCH_TENANT_MUTATION when auth mutations are updated
      const result = { data: { switchTenant: { success: true, message: 'Tenant switched successfully' } } };
      /*
      const result = await apolloClient.mutate({
        mutation: SWITCH_TENANT_MUTATION,
        variables: { tenantId },
        errorPolicy: 'all',
      });
      */

      const switchResult = result.data?.switchTenant;
      
      if (!switchResult?.success) {
        throw new Error(switchResult?.message || 'Failed to switch tenant');
      }

      // Clear tenant-specific cache
      await this.clearTenantCache();

      // Refresh tenant context
      await this.refreshTenantContext();

      // Notify listeners
      this.config.onTenantChange?.(this.currentState.currentTenant);

      return true;
    } catch (error) {
      console.error('Tenant switch failed:', error);
      this.handleError(error as Error);
      return false;
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Check if a feature is enabled for current tenant
   */
  hasFeature(featureKey: string): boolean {
    const feature = this.getFeatureConfig(featureKey);
    return Boolean(feature?.enabled && this.isTierSufficient(feature.requiredTier));
  }

  /**
   * Get feature configuration
   */
  getFeatureConfig(featureKey: string): FeatureConfig | null {
    // Check cache first
    if (this.featureCache.has(featureKey)) {
      return this.featureCache.get(featureKey)!;
    }

    // Find feature in current state
    const feature = this.currentState.features.find(f => f.key === featureKey);
    if (!feature) {
      return null;
    }

    const config: FeatureConfig = {
      enabled: feature.enabled,
      config: feature.config,
      requiredTier: feature.requiredTier,
    };

    // Cache the result
    this.featureCache.set(featureKey, config);
    return config;
  }

  /**
   * Get features available for current business tier
   */
  getAvailableFeatures(): FeatureFlag[] {
    return this.currentState.features.filter(feature => 
      this.isTierSufficient(feature.requiredTier)
    );
  }

  /**
   * Get tenant-specific settings
   */
  getTenantSettings(): TenantSettings | null {
    return this.currentState.currentTenant?.settings || null;
  }

  /**
   * Check if current tenant has access to specific business tier features
   */
  isTierSufficient(requiredTier: BusinessTier): boolean {
    const tierHierarchy: Record<BusinessTier, number> = {
      'MICRO': 1,
      'SMALL': 2,
      'MEDIUM': 3,
      'ENTERPRISE': 4,
    };

    const currentTierLevel = tierHierarchy[this.currentState.businessTier];
    const requiredTierLevel = tierHierarchy[requiredTier];

    return currentTierLevel >= requiredTierLevel;
  }

  /**
   * Validate tenant access for current user
   */
  validateTenantAccess(tenantId: string): boolean {
    return this.currentState.availableTenants.some(tenant => 
      tenant.id === tenantId
    );
  }

  /**
   * Subscribe to tenant context changes
   */
  onStateChange(listener: (state: TenantContextState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);
    
    return () => this.listeners.delete(listener);
  }

  /**
   * Refresh tenant context from server
   */
  async refreshTenantContext(): Promise<void> {
    this.setLoading(true);

    try {
      // Fetch current tenant
      const tenantResult = await apolloClient.query({
        query: GET_CURRENT_TENANT_QUERY,
        fetchPolicy: 'network-only',
      });

      const currentTenant = tenantResult.data?.currentTenant;

      // Fetch feature flags
      const featuresResult = await apolloClient.query({
        query: GET_FEATURE_FLAGS_QUERY,
        variables: { tenantId: currentTenant?.id },
        fetchPolicy: 'network-only',
      });

      const features = featuresResult.data?.featureFlags || [];

      // Update state
      this.updateState({
        currentTenant,
        businessTier: currentTenant?.businessTier || 'MICRO',
        features,
      });

      // Clear feature cache
      this.featureCache.clear();

      // Notify config callback
      this.config.onFeatureChange?.(features);
    } catch (error) {
      console.error('Failed to refresh tenant context:', error);
      this.handleError(error as Error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Initialize tenant context from current authentication state
   */
  private async initializeTenantContext(): Promise<void> {
    this.setLoading(true);

    try {
      await this.refreshTenantContext();
    } catch (error) {
      console.error('Failed to initialize tenant context:', error);
      this.handleError(error as Error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Clear tenant-specific cache data
   */
  private async clearTenantCache(): Promise<void> {
    try {
      // Clear Apollo cache for tenant-specific data
      await apolloClient.cache.evict({ 
        fieldName: 'currentTenant' 
      });
      
      // Clear feature cache
      this.featureCache.clear();

      // Clear any other tenant-specific cached data
      // This would include clearing localStorage, sessionStorage, etc.
      const tenantCacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('tenant_') || key.includes('_tenant_')
      );
      
      tenantCacheKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log('Tenant cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear tenant cache:', error);
    }
  }

  /**
   * Update tenant context state and notify listeners
   */
  private updateState(updates: Partial<TenantContextState>): void {
    this.currentState = {
      ...this.currentState,
      ...updates,
    };

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState);
      } catch (error) {
        console.error('Error in tenant context listener:', error);
      }
    });
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    this.updateState({ error: error.message });
    this.config.onError?.(error);
  }

  /**
   * Clear error state
   */
  private clearError(): void {
    this.updateState({ error: null });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.listeners.clear();
    this.featureCache.clear();
  }
}

// Default tenant context manager instance
let defaultTenantManager: TenantContextManager | null = null;

export function createTenantContextManager(config?: TenantContextConfig): TenantContextManager {
  return new TenantContextManager(config);
}

export function getDefaultTenantManager(): TenantContextManager | null {
  return defaultTenantManager;
}

export function setDefaultTenantManager(manager: TenantContextManager): void {
  defaultTenantManager = manager;
}

// Export singleton instance
export const tenantContextManager = new TenantContextManager();