/**
 * useTierAccess Hook
 *
 * Manages tier-based feature access for the mobile application.
 * Provides utilities to check if the current user has access to 
 * specific features based on their subscription tier.
 */
import { useMemo } from "react";
import { useAuth } from "@/hooks/auth";

// Tier hierarchy (higher index = higher tier)
const TIER_HIERARCHY = ['free', 'micro', 'small', 'medium', 'enterprise'] as const;

export type TierName = (typeof TIER_HIERARCHY)[number];

interface TierConfig {
  name: TierName;
  displayName: string;
  features: string[];
  maxEmployees: number;
  maxLocations: number;
}

const TIER_CONFIGS: Record<TierName, TierConfig> = {
  free: {
    name: 'free',
    displayName: 'Free Trial',
    features: ['basic_pos', 'basic_inventory', 'basic_reports'],
    maxEmployees: 2,
    maxLocations: 1,
  },
  micro: {
    name: 'micro',
    displayName: 'Micro',
    features: ['basic_pos', 'basic_inventory', 'basic_reports', 'email_support'],
    maxEmployees: 5,
    maxLocations: 1,
  },
  small: {
    name: 'small',
    displayName: 'Small',
    features: [
      'basic_pos', 'basic_inventory', 'basic_reports', 'email_support',
      'advanced_inventory', 'multi_location', 'crm', 'financial_reports', 'priority_support'
    ],
    maxEmployees: 25,
    maxLocations: 3,
  },
  medium: {
    name: 'medium',
    displayName: 'Medium',
    features: [
      'basic_pos', 'basic_inventory', 'basic_reports', 'email_support',
      'advanced_inventory', 'multi_location', 'crm', 'financial_reports', 'priority_support',
      'warehouse', 'b2b', 'advanced_analytics', 'api_access', 'custom_integrations', 'phone_support'
    ],
    maxEmployees: 100,
    maxLocations: 10,
  },
  enterprise: {
    name: 'enterprise',
    displayName: 'Enterprise',
    features: [
      'basic_pos', 'basic_inventory', 'basic_reports', 'email_support',
      'advanced_inventory', 'multi_location', 'crm', 'financial_reports', 'priority_support',
      'warehouse', 'b2b', 'advanced_analytics', 'api_access', 'custom_integrations', 'phone_support',
      'multi_tenant', 'advanced_security', 'custom_workflows', 'dedicated_support', 'sla', 'on_premise'
    ],
    maxEmployees: -1, // Unlimited
    maxLocations: -1, // Unlimited
  },
};

export interface TierAccessResult {
  /** Current user's tier */
  currentTier: TierName;
  /** Display name for the current tier */
  currentTierDisplayName: string;
  /** Check if user has access to a specific tier or higher */
  hasAccess: (requiredTier: TierName | string) => boolean;
  /** Check if user has access to a specific feature */
  hasFeature: (feature: string) => boolean;
  /** Get the tier config for current user */
  tierConfig: TierConfig;
  /** Check if an upgrade is available */
  canUpgrade: boolean;
  /** Get the next tier available for upgrade */
  nextTier: TierName | null;
  /** Loading state */
  isLoading: boolean;
}

/**
 * Hook to manage tier-based access control
 */
export function useTierAccess(): TierAccessResult {
  const { user, isLoading } = useAuth();

  const result = useMemo((): TierAccessResult => {
    // Default to 'free' tier if user is not authenticated or tier is not set
    const userTier = ((user as any)?.tier as TierName) || 'free';
    const currentTier = TIER_HIERARCHY.includes(userTier) ? userTier : 'free';
    const currentTierIndex = TIER_HIERARCHY.indexOf(currentTier);
    const tierConfig = TIER_CONFIGS[currentTier];

    const hasAccess = (requiredTier: TierName | string): boolean => {
      const requiredTierName = requiredTier as TierName;
      if (!TIER_HIERARCHY.includes(requiredTierName)) {
        // If tier name is not recognized, default to checking feature
        return tierConfig.features.includes(requiredTier);
      }
      const requiredIndex = TIER_HIERARCHY.indexOf(requiredTierName);
      return currentTierIndex >= requiredIndex;
    };

    const hasFeature = (feature: string): boolean => {
      return tierConfig.features.includes(feature);
    };

    const canUpgrade = currentTierIndex < TIER_HIERARCHY.length - 1;
    const nextTier = canUpgrade ? TIER_HIERARCHY[currentTierIndex + 1] : null;

    return {
      currentTier,
      currentTierDisplayName: tierConfig.displayName,
      hasAccess,
      hasFeature,
      tierConfig,
      canUpgrade,
      nextTier,
      isLoading,
    };
  }, [user, isLoading]);

  return result;
}

export default useTierAccess;
