/**
 * useUpgradeFlow Hook
 * Manages the upgrade flow and pricing calculations
 */

import { useState, useCallback } from 'react';

export interface UpgradeOptions {
  targetTier: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: string;
  featureId?: string;
}

export interface UpgradeRecommendation {
  tier: string;
  reason: string;
  savings?: number;
}

export interface UseUpgradeFlowReturn {
  processUpgrade: (options: UpgradeOptions) => Promise<boolean>;
  calculateUpgradePrice: (currentTier: string, targetTier: string, billingCycle: 'monthly' | 'yearly') => number;
  getUpgradeRecommendations: () => UpgradeRecommendation[];
  isLoading: boolean;
  error: string | null;
}

const TIER_PRICES: Record<string, { monthly: number; yearly: number }> = {
  micro: { monthly: 0, yearly: 0 },
  small: { monthly: 29, yearly: 290 },
  medium: { monthly: 79, yearly: 790 },
  enterprise: { monthly: 199, yearly: 1990 },
};

/**
 * Hook for managing upgrade flow
 */
export function useUpgradeFlow(): UseUpgradeFlowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processUpgrade = useCallback(async (options: UpgradeOptions): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Processing upgrade:', options);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const calculateUpgradePrice = useCallback((
    currentTier: string,
    targetTier: string,
    billingCycle: 'monthly' | 'yearly'
  ): number => {
    const currentPrice = TIER_PRICES[currentTier]?.[billingCycle] || 0;
    const targetPrice = TIER_PRICES[targetTier]?.[billingCycle] || 0;
    return Math.max(0, targetPrice - currentPrice);
  }, []);

  const getUpgradeRecommendations = useCallback((): UpgradeRecommendation[] => {
    return [
      { tier: 'small', reason: 'Best for growing businesses', savings: 50 },
      { tier: 'medium', reason: 'Recommended for your usage', savings: 100 },
    ];
  }, []);

  return {
    processUpgrade,
    calculateUpgradePrice,
    getUpgradeRecommendations,
    isLoading,
    error,
  };
}

export default useUpgradeFlow;
