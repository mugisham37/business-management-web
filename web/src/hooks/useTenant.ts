/**
 * useTenant Hook
 * Manages tenant context and tier-based access
 */

import { useState, useCallback, useMemo } from 'react';
import { BusinessTier } from '@/types/onboarding';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  businessTier: BusinessTier;
  isActive: boolean;
  settings?: Record<string, unknown>;
}

export interface TierGateResult {
  hasAccess: boolean;
  requiredTier: BusinessTier;
  currentTier: BusinessTier;
}

export interface FeatureGateResult {
  isEnabled: boolean;
  feature: string;
}

/**
 * Hook for accessing the current business tier
 */
export function useBusinessTier() {
  const [businessTier, setBusinessTier] = useState<BusinessTier>(BusinessTier.MICRO);
  const [isLoading, setIsLoading] = useState(false);

  const updateTier = useCallback(async (tier: BusinessTier) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setBusinessTier(tier);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    businessTier,
    isLoading,
    updateTier,
  };
}

/**
 * Hook for checking tier-based access
 */
export function useTierGate(requiredTier: BusinessTier): TierGateResult {
  const { businessTier } = useBusinessTier();

  const hasAccess = useMemo(() => {
    const tierOrder: BusinessTier[] = [
      BusinessTier.MICRO,
      BusinessTier.SMALL,
      BusinessTier.MEDIUM,
      BusinessTier.ENTERPRISE,
    ];
    const currentIndex = tierOrder.indexOf(businessTier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    return currentIndex >= requiredIndex;
  }, [businessTier, requiredTier]);

  return {
    hasAccess,
    requiredTier,
    currentTier: businessTier,
  };
}

/**
 * Hook for checking feature-based access
 */
export function useFeatureGate(feature: string): FeatureGateResult {
  const [enabledFeatures] = useState<string[]>([
    'basic_pos',
    'inventory_tracking',
    'reporting',
  ]);

  const isEnabled = useMemo(() => {
    if (!feature) return true;
    return enabledFeatures.includes(feature);
  }, [feature, enabledFeatures]);

  return {
    isEnabled,
    feature,
  };
}

/**
 * Main tenant hook
 */
export function useTenant() {
  const [tenant, setTenant] = useState<Tenant | null>({
    id: '1',
    name: 'Default Tenant',
    slug: 'default',
    businessTier: BusinessTier.MICRO,
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchTenant = useCallback(async (tenantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTenant(prev => prev ? { ...prev, id: tenantId } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch tenant');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTenantSettings = useCallback(async (settings: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setTenant(prev => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tenant,
    isLoading,
    error,
    switchTenant,
    updateTenantSettings,
  };
}

export default useTenant;
