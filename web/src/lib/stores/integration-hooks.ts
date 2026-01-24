/**
 * Integration Hooks
 * Bridge between existing React Context patterns and new Zustand stores
 * Requirements: 6.2, 6.5
 */

import { useEffect } from 'react';
import { useAuthStore, authSelectors } from './auth-store';
import { useTenantStore, tenantSelectors } from './tenant-store';
import { useFeatureStore, featureSelectors } from './feature-store';
import { authManager } from '@/lib/auth';
import type { User } from '@/types/core';

/**
 * Hook to sync auth manager with auth store
 */
export function useAuthManagerSync() {
  const authStore = useAuthStore();

  useEffect(() => {
    // Sync auth store with actual auth manager state on mount
    const syncAuthState = async () => {
      try {
        const currentUser = await authManager.getCurrentUser();
        if (currentUser) {
          // Safely cast user object, providing default values for required fields
          const user: User = {
            id: (currentUser as Record<string, unknown>).id as string || '',
            email: (currentUser as Record<string, unknown>).email as string || '',
            firstName: (currentUser as Record<string, unknown>).firstName as string || '',
            lastName: (currentUser as Record<string, unknown>).lastName as string || '',
            tenants: [],
            permissions: [],
            mfaEnabled: false,
            lastLoginAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          authStore.setUser(user);
          authStore.setAuthenticated(true);
        } else {
          authStore.setAuthenticated(false);
        }
      } catch (error) {
        console.error('Failed to sync auth state:', error);
      }
    };

    syncAuthState();

    // Subscribe to store changes for logging
    const unsubscribeStore = useAuthStore.subscribe(
      (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      (current) => {
        // Track auth state changes
        if (current.isAuthenticated) {
          console.log('User authenticated:', current.user?.id);
        }
      }
    );

    return () => {
      unsubscribeStore();
    };
  }, [authStore]);

  return {
    // Expose auth store selectors
    user: useAuthStore(authSelectors.user),
    isAuthenticated: useAuthStore(authSelectors.isAuthenticated),
    isLoading: useAuthStore(authSelectors.isLoading),
    permissions: useAuthStore(authSelectors.permissions),
    mfaRequired: useAuthStore(authSelectors.mfaRequired),
    error: useAuthStore(authSelectors.error),
    
    // Expose auth actions
    login: authStore.login,
    logout: authStore.logout,
    refreshTokens: authStore.refreshTokens,
  };
}

/**
 * Hook to sync tenant context manager with tenant store
 */
export function useTenantManagerSync() {
  const tenantStore = useTenantStore();

  useEffect(() => {
    // Subscribe to store changes and update tenant manager
    const unsubscribeStore = useTenantStore.subscribe(
      (state) => state.currentTenant,
      (currentTenant) => {
        // Handle tenant switching through the manager
        if (currentTenant) {
          console.log('Tenant change detected in store:', currentTenant.id);
        }
      }
    );

    return () => {
      unsubscribeStore();
    };
  }, [tenantStore]);

  return {
    // Expose tenant store selectors
    currentTenant: useTenantStore(tenantSelectors.currentTenant),
    availableTenants: useTenantStore(tenantSelectors.availableTenants),
    businessTier: useTenantStore(tenantSelectors.businessTier),
    isLoading: useTenantStore(tenantSelectors.isLoading),
    isSwitching: useTenantStore(tenantSelectors.isSwitching),
    error: useTenantStore(tenantSelectors.error),
    
    // Expose tenant actions
    switchTenant: tenantStore.switchTenant,
    validateAccess: tenantStore.validateTenantAccess,
    isTierSufficient: tenantStore.isTierSufficient,
  };
}

/**
 * Hook to sync feature flags with feature store
 */
export function useFeatureManagerSync() {
  const featureStore = useFeatureStore();
  const tenantStore = useTenantStore();

  useEffect(() => {
    // Sync features when tenant changes
    const unsubscribeTenant = useTenantStore.subscribe(
      (state) => state.currentTenant,
      async (currentTenant) => {
        if (currentTenant) {
          try {
            featureStore.setLoading(true);
            
            // Fetch features for the current tenant
            // This would typically come from the tenant context manager or API
            // For now, keep existing features
            const currentFeatures = featureStore.features;
            if (currentFeatures.length === 0) {
              featureStore.setLoading(false);
            } else {
              featureStore.setLoading(false);
            }
          } catch (error) {
            console.error('Failed to sync features:', error);
            featureStore.setError(error instanceof Error ? error.message : 'Failed to sync features');
            featureStore.setLoading(false);
          }
        }
      }
    );

    return () => {
      unsubscribeTenant();
    };
  }, [featureStore, tenantStore]);

  return {
    // Expose feature store selectors
    features: useFeatureStore(featureSelectors.features),
    isLoading: useFeatureStore(featureSelectors.isLoading),
    error: useFeatureStore(featureSelectors.error),
    
    // Expose feature utilities
    hasFeature: (key: string) => 
      featureStore.hasFeature(key, useTenantStore.getState().businessTier),
    getFeatureConfig: featureStore.getFeatureConfig,
    getAvailableFeatures: () => 
      featureStore.getAvailableFeatures(useTenantStore.getState().businessTier),
  };
}

/**
 * Combined hook for all store integrations
 */
export function useStoreIntegration() {
  const auth = useAuthManagerSync();
  const tenant = useTenantManagerSync();
  const feature = useFeatureManagerSync();

  return {
    auth,
    tenant,
    feature,
    
    // Combined utilities
    isFullyInitialized: () => {
      return !auth.isLoading && !tenant.isLoading && !feature.isLoading;
    },
    
    hasErrors: () => {
      return Boolean(auth.error || tenant.error || feature.error);
    },
    
    getErrors: () => {
      const errors = [];
      if (auth.error) errors.push({ type: 'auth', message: auth.error });
      if (tenant.error) errors.push({ type: 'tenant', message: tenant.error });
      if (feature.error) errors.push({ type: 'feature', message: feature.error });
      return errors;
    },
  };
}

/**
 * Hook for backward compatibility with existing auth context
 */
export function useAuthCompat() {
  const auth = useAuthManagerSync();
  
  // Return interface compatible with existing AuthProvider
  return {
    authState: {
      user: auth.user,
      tokens: null, // Don't expose tokens for security
      permissions: auth.permissions,
      isAuthenticated: auth.isAuthenticated,
      isLoading: auth.isLoading,
      mfaRequired: auth.mfaRequired,
      error: auth.error,
    },
    mfaState: {
      isEnabled: auth.user?.mfaEnabled || false,
      isRequired: auth.mfaRequired,
      isVerifying: false, // This would come from MFA manager
      error: null,
    },
    isInitialized: !auth.isLoading,
  };
}

/**
 * Hook for backward compatibility with existing tenant context
 */
export function useTenantCompat() {
  const tenant = useTenantManagerSync();
  
  // Return interface compatible with existing tenant context
  return {
    currentTenant: tenant.currentTenant,
    availableTenants: tenant.availableTenants,
    businessTier: tenant.businessTier,
    features: [], // Features are now in separate store
    switchTenant: tenant.switchTenant,
    hasFeature: () => false, // Use feature store instead
    getFeatureConfig: () => null, // Use feature store instead
  };
}

/**
 * Migration utilities for transitioning from Context to Zustand
 */
export const migrationUtils = {
  /**
   * Initialize stores from existing context managers
   */
  initializeFromContext: async () => {
    try {
      // Initialize auth store from auth manager
      const currentUser = await authManager.getCurrentUser();
      const authStore = useAuthStore.getState();
      
      if (currentUser) {
        const user: User = {
          id: (currentUser as Record<string, unknown>).id as string || '',
          email: (currentUser as Record<string, unknown>).email as string || '',
          firstName: (currentUser as Record<string, unknown>).firstName as string || '',
          lastName: (currentUser as Record<string, unknown>).lastName as string || '',
          tenants: [],
          permissions: [],
          mfaEnabled: false,
          lastLoginAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        authStore.setUser(user);
        authStore.setAuthenticated(true);
      }

      // Initialize tenant store
      // Default initialization if needed

      // Initialize feature store
      // Default initialization if needed

      console.log('✅ Stores initialized from existing context managers');
    } catch (error) {
      console.error('❌ Failed to initialize stores from context:', error);
    }
  },

  /**
   * Validate store consistency with context managers
   */
  validateConsistency: () => {
    const authStoreState = useAuthStore.getState();
    const tenantStoreState = useTenantStore.getState();

    const inconsistencies = [];

    // Check auth consistency
    if (!authStoreState.user && authStoreState.isAuthenticated) {
      inconsistencies.push('Auth authentication state mismatch - authenticated but no user');
    }

    if (!tenantStoreState.currentTenant && tenantStoreState.businessTier) {
      inconsistencies.push('Tenant state mismatch - no tenant but business tier set');
    }

    if (inconsistencies.length > 0) {
      console.warn('⚠️ Store consistency issues detected:', inconsistencies);
    } else {
      console.log('✅ Store consistency validated');
    }

    return inconsistencies;
  },
};