/**
 * Tenant Context React Hooks
 * React hooks for tenant context management and feature flags
 * Requirements: 4.1, 4.3
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TenantContextManager, 
  TenantContextState, 
  tenantContextManager 
} from './tenant-context';
import { BusinessTier, TenantSettings } from '@/types/core';

/**
 * Hook for accessing tenant context state
 */
export function useTenantContext(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const [state, setState] = useState<TenantContextState>(contextManager.getState());

  useEffect(() => {
    const unsubscribe = contextManager.onStateChange(setState);
    return unsubscribe;
  }, [contextManager]);

  const switchTenant = useCallback(async (tenantId: string) => {
    return await contextManager.switchTenant(tenantId);
  }, [contextManager]);

  const refreshContext = useCallback(async () => {
    await contextManager.refreshTenantContext();
  }, [contextManager]);

  return {
    ...state,
    switchTenant,
    refreshContext,
  };
}

/**
 * Hook for accessing current tenant information
 */
export function useCurrentTenant(manager?: TenantContextManager) {
  const { currentTenant, businessTier, isLoading } = useTenantContext(manager);

  const tenantSettings = useMemo(() => {
    return currentTenant?.settings || null;
  }, [currentTenant]);

  const tenantBranding = useMemo(() => {
    return currentTenant?.branding || null;
  }, [currentTenant]);

  return {
    tenant: currentTenant,
    businessTier,
    settings: tenantSettings,
    branding: tenantBranding,
    isLoading,
  };
}

/**
 * Hook for feature flag management
 */
export function useFeatureFlags(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { features, isLoading } = useTenantContext(manager);

  const hasFeature = useCallback((featureKey: string): boolean => {
    return contextManager.hasFeature(featureKey);
  }, [contextManager]);

  const getFeatureConfig = useCallback((featureKey: string) => {
    return contextManager.getFeatureConfig(featureKey);
  }, [contextManager]);

  const availableFeatures = useMemo(() => {
    return contextManager.getAvailableFeatures();
  }, [contextManager, features]);

  const enabledFeatures = useMemo(() => {
    return features.filter(f => f.isEnabled);
  }, [features]);

  return {
    features,
    availableFeatures,
    enabledFeatures,
    hasFeature,
    getFeatureConfig,
    isLoading,
  };
}

/**
 * Hook for tenant switching functionality
 */
export function useTenantSwitching(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { availableTenants, currentTenant, isLoading } = useTenantContext(manager);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isSwitchingTo, setIsSwitchingTo] = useState<string | null>(null);

  const canSwitchTo = useCallback((tenantId: string): boolean => {
    return contextManager.validateTenantAccess(tenantId);
  }, [contextManager]);

  const switchTenant = useCallback(async (tenantId: string): Promise<boolean> => {
    if (!canSwitchTo(tenantId)) {
      return false;
    }

    setIsSwitching(true);
    setIsSwitchingTo(tenantId);

    try {
      const success = await contextManager.switchTenant(tenantId);
      return success;
    } finally {
      setIsSwitching(false);
      setIsSwitchingTo(null);
    }
  }, [contextManager, canSwitchTo]);

  return {
    availableTenants,
    currentTenant,
    switchTenant,
    canSwitchTo,
    isSwitching,
    isSwitchingTo,
    isLoading,
  };
}

/**
 * Hook for business tier functionality
 */
export function useBusinessTier(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { businessTier, currentTenant, isLoading } = useTenantContext(manager);

  const isTierSufficient = useCallback((requiredTier: BusinessTier): boolean => {
    return contextManager.isTierSufficient(requiredTier);
  }, [contextManager]);

  const tierLimits = useMemo(() => {
    // Define tier limits based on business tier
    const limits = {
      MICRO: { maxEmployees: 5, maxLocations: 1, maxTransactions: 100, maxRevenue: 5000 },
      SMALL: { maxEmployees: 20, maxLocations: 2, maxTransactions: 1000, maxRevenue: 50000 },
      MEDIUM: { maxEmployees: 100, maxLocations: 5, maxTransactions: 10000, maxRevenue: 500000 },
      ENTERPRISE: { maxEmployees: Infinity, maxLocations: Infinity, maxTransactions: Infinity, maxRevenue: Infinity },
    };
    return limits[businessTier];
  }, [businessTier]);

  return {
    businessTier,
    tierLimits,
    isTierSufficient,
    currentTenant,
    isLoading,
  };
}

/**
 * Hook for tenant settings
 */
export function useTenantSettings(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { currentTenant, isLoading } = useTenantContext(manager);

  const settings = useMemo(() => {
    return contextManager.getTenantSettings();
  }, [contextManager, currentTenant]);

  return {
    settings,
    tenant: currentTenant,
    isLoading,
  };
}

/**
 * Hook for feature gating
 */
export function useFeatureGate(featureKey: string, manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { hasFeature } = useFeatureFlags(manager);

  const isEnabled = useMemo(() => {
    return hasFeature(featureKey);
  }, [hasFeature, featureKey]);

  const config = useMemo(() => {
    return contextManager.getFeatureConfig(featureKey);
  }, [contextManager, featureKey]);

  return {
    isEnabled,
    config,
    featureKey,
  };
}

/**
 * Hook for tier gating
 */
export function useTierGate(requiredTier: BusinessTier, manager?: TenantContextManager) {
  const { isTierSufficient, businessTier } = useBusinessTier(manager);

  const hasAccess = useMemo(() => {
    return isTierSufficient(requiredTier);
  }, [isTierSufficient, requiredTier]);

  return {
    hasAccess,
    currentTier: businessTier,
    requiredTier,
  };
}

/**
 * Hook for combined feature and tier gating
 */
export function useFeatureAndTierGate(
  featureKey: string, 
  requiredTier: BusinessTier, 
  manager?: TenantContextManager
) {
  const { isEnabled: hasFeature, config } = useFeatureGate(featureKey, manager);
  const { hasAccess: hasTier } = useTierGate(requiredTier, manager);

  const hasAccess = useMemo(() => {
    return hasFeature && hasTier;
  }, [hasFeature, hasTier]);

  return {
    hasAccess,
    hasFeature,
    hasTier,
    config,
    featureKey,
    requiredTier,
  };
}
    return contextManager.getAvailableFeatures();
  }, [contextManager]);

  const enabledFeatures = useMemo(() => {
    return features.filter(feature => 
      feature.enabled && contextManager.isTierSufficient(feature.requiredTier)
    );
  }, [features, contextManager]);

  return {
    features,
    availableFeatures,
    enabledFeatures,
    hasFeature,
    getFeatureConfig,
    isLoading,
  };
}

/**
 * Hook for tenant switching functionality
 */
export function useTenantSwitching(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { availableTenants, currentTenant, isLoading } = useTenantContext(manager);
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const switchTenant = useCallback(async (tenantId: string) => {
    if (switchingTo || isLoading) {
      return false; // Prevent concurrent switches
    }

    setSwitchingTo(tenantId);
    try {
      const success = await contextManager.switchTenant(tenantId);
      return success;
    } finally {
      setSwitchingTo(null);
    }
  }, [contextManager, switchingTo, isLoading]);

  const canSwitchTo = useCallback((tenantId: string): boolean => {
    return contextManager.validateTenantAccess(tenantId);
  }, [contextManager]);

  const isSwitching = switchingTo !== null;
  const isSwitchingTo = useCallback((tenantId: string) => {
    return switchingTo === tenantId;
  }, [switchingTo]);

  return {
    availableTenants,
    currentTenant,
    switchTenant,
    canSwitchTo,
    isSwitching,
    isSwitchingTo,
    isLoading: isLoading || isSwitching,
  };
}

/**
 * Hook for business tier functionality
 */
export function useBusinessTier(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const { businessTier } = useTenantContext(manager);

  const isTierSufficient = useCallback((requiredTier: BusinessTier): boolean => {
    return contextManager.isTierSufficient(requiredTier);
  }, [contextManager]);

  const getTierFeatures = useCallback(() => {
    return contextManager.getAvailableFeatures();
  }, [contextManager]);

  const tierLimits = useMemo(() => {
    const settings = contextManager.getTenantSettings();
    return settings?.limits || null;
  }, [contextManager]);

  return {
    businessTier,
    isTierSufficient,
    getTierFeatures,
    tierLimits,
  };
}

/**
 * Hook for tenant settings management
 */
export function useTenantSettings(manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;

  const settings = useMemo(() => {
    return contextManager.getTenantSettings();
  }, [contextManager]);

  const getSetting = useCallback(<T = unknown>(key: keyof TenantSettings): T | null => {
    return settings?.[key] as T || null;
  }, [settings]);

  const getFeatureSetting = useCallback((featureKey: string, settingKey: string) => {
    const featureConfig = contextManager.getFeatureConfig(featureKey);
    return featureConfig?.config?.[settingKey] || null;
  }, [contextManager]);

  return {
    settings,
    getSetting,
    getFeatureSetting,
    timezone: settings?.timezone || 'UTC',
    currency: settings?.currency || 'USD',
    dateFormat: settings?.dateFormat || 'MM/dd/yyyy',
    language: settings?.language || 'en',
  };
}

/**
 * Hook for conditional feature rendering
 */
export function useFeatureGate(featureKey: string, manager?: TenantContextManager) {
  const contextManager = manager || tenantContextManager;
  const hasFeature = contextManager.hasFeature(featureKey);
  const featureConfig = contextManager.getFeatureConfig(featureKey);

  return {
    hasFeature,
    featureConfig,
    isEnabled: hasFeature,
  };
}

/**
 * Hook for progressive feature disclosure based on business tier
 */
export function useTierGate(requiredTier: BusinessTier, manager?: TenantContextManager) {
  const { isTierSufficient, businessTier } = useBusinessTier(manager);
  const hasAccess = isTierSufficient(requiredTier);

  return {
    hasAccess,
    currentTier: businessTier,
    requiredTier,
    isUpgradeRequired: !hasAccess,
  };
}

/**
 * Combined hook for feature and tier gating
 */
export function useFeatureAndTierGate(
  featureKey: string, 
  requiredTier?: BusinessTier,
  manager?: TenantContextManager
) {
  const { hasFeature, featureConfig } = useFeatureGate(featureKey, manager);
  const tierGate = useTierGate(
    requiredTier || featureConfig?.requiredTier || 'MICRO', 
    manager
  );

  const isAvailable = hasFeature && tierGate.hasAccess;

  return {
    isAvailable,
    hasFeature,
    hasTierAccess: tierGate.hasAccess,
    featureConfig,
    ...tierGate,
  };
}