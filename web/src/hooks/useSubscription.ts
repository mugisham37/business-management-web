/**
 * useSubscription Hook
 * Manages subscription state and upgrade modals
 */

import { useState, useCallback } from 'react';
import { BusinessTier } from '@/types/onboarding';

export interface SubscriptionState {
  currentTier: BusinessTier;
  isActive: boolean;
  expiresAt?: Date;
  features: string[];
}

export interface UseSubscriptionReturn {
  subscription: SubscriptionState | null;
  isLoading: boolean;
  error: string | null;
  openSubscriptionModal: (targetTier?: BusinessTier) => void;
  closeSubscriptionModal: () => void;
  isModalOpen: boolean;
  targetTier: BusinessTier | null;
  upgradeTo: (tier: BusinessTier) => Promise<boolean>;
  refreshSubscription: () => Promise<void>;
}

/**
 * Hook for managing subscription state and upgrade flows
 */
export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<SubscriptionState | null>({
    currentTier: BusinessTier.MICRO,
    isActive: true,
    features: ['basic_pos', 'inventory_tracking'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTier, setTargetTier] = useState<BusinessTier | null>(null);

  const openSubscriptionModal = useCallback((tier?: BusinessTier) => {
    setTargetTier(tier || BusinessTier.SMALL);
    setIsModalOpen(true);
  }, []);

  const closeSubscriptionModal = useCallback(() => {
    setIsModalOpen(false);
    setTargetTier(null);
  }, []);

  const upgradeTo = useCallback(async (tier: BusinessTier): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubscription(prev => prev ? { ...prev, currentTier: tier } : null);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upgrade');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      // In real implementation, fetch subscription from API
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    subscription,
    isLoading,
    error,
    openSubscriptionModal,
    closeSubscriptionModal,
    isModalOpen,
    targetTier,
    upgradeTo,
    refreshSubscription,
  };
}

export default useSubscription;
