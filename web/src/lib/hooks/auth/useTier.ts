import React, { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { AuthEventEmitter } from '../../auth/auth-events';
import {
  MY_TIER_INFO,
  GET_UPGRADE_OPTIONS,
  TEST_FEATURE_FLAG,
  SIMULATE_TIER_UPGRADE,
  BASIC_FEATURE,
  PREMIUM_FEATURE,
  ENTERPRISE_FEATURE,
  STANDARD_FEATURE,
} from '../../graphql/operations/tier';
import { BusinessTier } from '../../graphql/generated/types';

/**
 * Tier-based Feature Access Hook
 * 
 * Provides comprehensive tier and subscription management with:
 * - Current tier information
 * - Feature access checking
 * - Upgrade options and recommendations
 * - Usage limits tracking
 * - Feature flag testing
 * - Tier-based UI controls
 */

interface TierInfo {
  currentTier: BusinessTier;
  features: string[];
  limits: Record<string, any>;
  expiresAt?: Date;
  isActive: boolean;
  isTrialExpired?: boolean;
  daysUntilExpiration?: number;
}

interface UpgradeOption {
  tier: BusinessTier;
  features: string[];
  pricing: {
    monthly: number;
    yearly: number;
  };
  recommended?: boolean;
}

interface TierState {
  tierInfo: TierInfo | null;
  upgradeOptions: UpgradeOption[];
  isLoading: boolean;
  error: string | null;
  featureCache: Map<string, boolean>;
}

interface TierOperations {
  refreshTierInfo: () => Promise<void>;
  refreshUpgradeOptions: () => Promise<void>;
  testFeatureAccess: (featureName: string) => Promise<boolean>;
  simulateUpgrade: (targetTier: BusinessTier) => Promise<string>;
  clearError: () => void;
  clearFeatureCache: () => void;
}

interface UseTierReturn extends TierState, TierOperations {
  // Feature access utilities
  hasFeature: (feature: string) => boolean;
  canAccessTier: (tier: BusinessTier) => boolean;
  isFeatureLocked: (feature: string) => boolean;
  getFeatureLimit: (feature: string) => number | null;
  
  // Tier utilities
  getTierDisplayName: (tier: BusinessTier) => string;
  getTierColor: (tier: BusinessTier) => string;
  getTierIcon: (tier: BusinessTier) => string;
  isCurrentTier: (tier: BusinessTier) => boolean;
  canUpgradeTo: (tier: BusinessTier) => boolean;
  
  // Usage utilities
  getUsagePercentage: (feature: string) => number;
  isNearLimit: (feature: string) => boolean;
  isOverLimit: (feature: string) => boolean;
  
  // Computed properties
  isFreeTier: boolean;
  isPaidTier: boolean;
  isTrialActive: boolean;
  needsUpgrade: boolean;
  recommendedTier: BusinessTier | null;
}

export function useTier(): UseTierReturn {
  const [tierState, setTierState] = useState<TierState>({
    tierInfo: null,
    upgradeOptions: [],
    isLoading: false,
    error: null,
    featureCache: new Map(),
  });

  // Feature access utilities (defined early to avoid hoisting issues)
  const hasFeature = useCallback((feature: string): boolean => {
    return tierState.tierInfo?.features.includes(feature) || false;
  }, [tierState.tierInfo]);

  const canAccessTier = useCallback((tier: BusinessTier): boolean => {
    if (!tierState.tierInfo) return false;
    
    const tierHierarchy: BusinessTier[] = [BusinessTier.FREE, BusinessTier.BASIC, BusinessTier.STANDARD, BusinessTier.PREMIUM, BusinessTier.ENTERPRISE];
    const currentIndex = tierHierarchy.indexOf(tierState.tierInfo.currentTier);
    const requiredIndex = tierHierarchy.indexOf(tier);
    
    return currentIndex >= requiredIndex;
  }, [tierState.tierInfo]);

  // GraphQL operations
  const { data: tierInfoData, loading: tierInfoLoading, refetch: refetchTierInfo } = useQuery(
    MY_TIER_INFO,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: upgradeOptionsData, loading: upgradeOptionsLoading, refetch: refetchUpgradeOptions } = useQuery(
    GET_UPGRADE_OPTIONS,
    {
      errorPolicy: 'all',
    }
  );

  const [testFeatureFlagMutation] = useMutation(TEST_FEATURE_FLAG, {
    errorPolicy: 'all',
  });

  const [simulateUpgradeMutation, { loading: simulateLoading }] = useMutation(SIMULATE_TIER_UPGRADE, {
    errorPolicy: 'all',
  });

  // Feature access queries (for demonstration)
  useQuery(BASIC_FEATURE, {
    errorPolicy: 'all',
    skip: !tierState.tierInfo,
  });

  useQuery(PREMIUM_FEATURE, {
    errorPolicy: 'all',
    skip: !tierState.tierInfo || !canAccessTier(BusinessTier.PREMIUM),
  });

  useQuery(ENTERPRISE_FEATURE, {
    errorPolicy: 'all',
    skip: !tierState.tierInfo || !canAccessTier(BusinessTier.ENTERPRISE),
  });

  useQuery(STANDARD_FEATURE, {
    errorPolicy: 'all',
    skip: !tierState.tierInfo || !canAccessTier(BusinessTier.STANDARD),
  });

  // Refresh tier information
  const refreshTierInfo = useCallback(async (): Promise<void> => {
    try {
      setTierState(prev => ({ ...prev, isLoading: true, error: null }));
      await refetchTierInfo();
      setTierState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setTierState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh tier info',
        isLoading: false,
      }));
    }
  }, [refetchTierInfo]);

  // Refresh upgrade options
  const refreshUpgradeOptions = useCallback(async (): Promise<void> => {
    try {
      setTierState(prev => ({ ...prev, isLoading: true, error: null }));
      await refetchUpgradeOptions();
      setTierState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setTierState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh upgrade options',
        isLoading: false,
      }));
    }
  }, [refetchUpgradeOptions]);

  // Test feature access
  const testFeatureAccess = useCallback(async (featureName: string): Promise<boolean> => {
    // Check cache first
    if (tierState.featureCache.has(featureName)) {
      return tierState.featureCache.get(featureName)!;
    }

    try {
      const result = await testFeatureFlagMutation({
        variables: { featureName },
      });

      const response = result.data?.testFeatureFlag;
      if (response) {
        const parsed = JSON.parse(response);
        const hasAccess = parsed.hasAccess || false;
        
        // Cache the result
        setTierState(prev => ({
          ...prev,
          featureCache: new Map(prev.featureCache).set(featureName, hasAccess),
        }));

        return hasAccess;
      }

      return false;
    } catch (error) {
      console.error('Failed to test feature access:', error);
      return false;
    }
  }, [testFeatureFlagMutation, tierState.featureCache]);

  // Simulate tier upgrade
  const simulateUpgrade = useCallback(async (targetTier: BusinessTier): Promise<string> => {
    try {
      setTierState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await simulateUpgradeMutation({
        variables: { targetTier },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.simulateTierUpgrade;
      if (!response) {
        throw new Error('Failed to simulate upgrade');
      }

      setTierState(prev => ({ ...prev, isLoading: false }));

      // Emit tier upgrade event
      AuthEventEmitter.emit('tier:upgraded', targetTier);

      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to simulate upgrade';
      setTierState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [simulateUpgradeMutation]);

  // Clear error
  const clearError = useCallback(() => {
    setTierState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear feature cache
  const clearFeatureCache = useCallback(() => {
    setTierState(prev => ({ ...prev, featureCache: new Map() }));
  }, []);

  const isFeatureLocked = useCallback((feature: string): boolean => {
    return !hasFeature(feature);
  }, [hasFeature]);

  const getFeatureLimit = useCallback((feature: string): number | null => {
    if (!tierState.tierInfo?.limits) return null;
    return tierState.tierInfo.limits[feature] || null;
  }, [tierState.tierInfo]);

  // Tier utilities
  const getTierDisplayName = useCallback((tier: BusinessTier): string => {
    const displayNames: Record<BusinessTier, string> = {
      [BusinessTier.FREE]: 'Free',
      [BusinessTier.BASIC]: 'Basic',
      [BusinessTier.STANDARD]: 'Standard',
      [BusinessTier.PREMIUM]: 'Premium',
      [BusinessTier.ENTERPRISE]: 'Enterprise',
    };
    return displayNames[tier] || tier;
  }, []);

  const getTierColor = useCallback((tier: BusinessTier): string => {
    const colors: Record<BusinessTier, string> = {
      [BusinessTier.FREE]: 'gray',
      [BusinessTier.BASIC]: 'blue',
      [BusinessTier.STANDARD]: 'green',
      [BusinessTier.PREMIUM]: 'purple',
      [BusinessTier.ENTERPRISE]: 'gold',
    };
    return colors[tier] || 'gray';
  }, []);

  const getTierIcon = useCallback((tier: BusinessTier): string => {
    const icons: Record<BusinessTier, string> = {
      [BusinessTier.FREE]: '🆓',
      [BusinessTier.BASIC]: '📦',
      [BusinessTier.STANDARD]: '⭐',
      [BusinessTier.PREMIUM]: '💎',
      [BusinessTier.ENTERPRISE]: '👑',
    };
    return icons[tier] || '📦';
  }, []);

  const isCurrentTier = useCallback((tier: BusinessTier): boolean => {
    return tierState.tierInfo?.currentTier === tier;
  }, [tierState.tierInfo]);

  const canUpgradeTo = useCallback((tier: BusinessTier): boolean => {
    if (!tierState.tierInfo) return false;
    
    const tierHierarchy: BusinessTier[] = [BusinessTier.FREE, BusinessTier.BASIC, BusinessTier.STANDARD, BusinessTier.PREMIUM, BusinessTier.ENTERPRISE];
    const currentIndex = tierHierarchy.indexOf(tierState.tierInfo.currentTier);
    const targetIndex = tierHierarchy.indexOf(tier);
    
    return targetIndex > currentIndex;
  }, [tierState.tierInfo]);

  // Usage utilities
  const getUsagePercentage = useCallback((feature: string): number => {
    const limit = getFeatureLimit(feature);
    if (!limit || !tierState.tierInfo?.limits) return 0;
    
    const current = tierState.tierInfo.limits[`${feature}_current`] || 0;
    return Math.min(100, (current / limit) * 100);
  }, [getFeatureLimit, tierState.tierInfo]);

  const isNearLimit = useCallback((feature: string): boolean => {
    return getUsagePercentage(feature) >= 80;
  }, [getUsagePercentage]);

  const isOverLimit = useCallback((feature: string): boolean => {
    return getUsagePercentage(feature) >= 100;
  }, [getUsagePercentage]);

  // Computed properties
  const isFreeTier = tierState.tierInfo?.currentTier === BusinessTier.FREE;
  const isPaidTier = !isFreeTier && tierState.tierInfo?.currentTier !== undefined;
  const isTrialActive = tierState.tierInfo?.expiresAt ? new Date() < tierState.tierInfo.expiresAt : false;
  const needsUpgrade = isFreeTier || (tierState.tierInfo?.isTrialExpired || false);
  const recommendedTier = tierState.upgradeOptions.find(option => option.recommended)?.tier || null;

  // Update state when data changes
  React.useEffect(() => {
    if (tierInfoData?.myTierInfo) {
      try {
        const parsed = JSON.parse(tierInfoData.myTierInfo);
        const tierInfo: TierInfo = {
          currentTier: parsed.currentTier,
          features: parsed.features || [],
          limits: parsed.limits || {},
          ...(parsed.expiresAt && { expiresAt: new Date(parsed.expiresAt) }),
          isActive: parsed.isActive || false,
          isTrialExpired: parsed.isTrialExpired || false,
          daysUntilExpiration: parsed.daysUntilExpiration,
        };
        
        setTierState(prev => ({ ...prev, tierInfo }));
      } catch (error) {
        console.error('Failed to parse tier info:', error);
      }
    }
  }, [tierInfoData]);

  React.useEffect(() => {
    if (upgradeOptionsData?.getUpgradeOptions) {
      try {
        const parsed = JSON.parse(upgradeOptionsData.getUpgradeOptions);
        setTierState(prev => ({
          ...prev,
          upgradeOptions: parsed.availableUpgrades || [],
        }));
      } catch (error) {
        console.error('Failed to parse upgrade options:', error);
      }
    }
  }, [upgradeOptionsData]);

  return {
    // State
    ...tierState,
    isLoading: tierState.isLoading || 
               tierInfoLoading || 
               upgradeOptionsLoading || 
               simulateLoading,

    // Operations
    refreshTierInfo,
    refreshUpgradeOptions,
    testFeatureAccess,
    simulateUpgrade,
    clearError,
    clearFeatureCache,

    // Feature access utilities
    hasFeature,
    canAccessTier,
    isFeatureLocked,
    getFeatureLimit,

    // Tier utilities
    getTierDisplayName,
    getTierColor,
    getTierIcon,
    isCurrentTier,
    canUpgradeTo,

    // Usage utilities
    getUsagePercentage,
    isNearLimit,
    isOverLimit,

    // Computed properties
    isFreeTier,
    isPaidTier,
    isTrialActive,
    needsUpgrade,
    recommendedTier,
  };
}