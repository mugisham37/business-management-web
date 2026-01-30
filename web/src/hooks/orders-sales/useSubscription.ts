'use client';

import { useState, useCallback, useEffect } from 'react';
import { BusinessTier } from '@/types/pricing';
import { SubscriptionService } from '@/lib/services/subscription-service';

interface SubscriptionState {
  hasSubscription: boolean;
  tier?: BusinessTier;
  isTrialActive?: boolean;
  trialEndsAt?: Date;
  isLoading: boolean;
}

/**
 * Hook for managing subscription state and operations
 */
export function useSubscription() {
  const [state, setState] = useState<SubscriptionState>({
    hasSubscription: false,
    isLoading: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    tier: BusinessTier;
    billingCycle: 'monthly' | 'annually';
  } | null>(null);

  // Define loadSubscriptionStatus before using it in useEffect
  const loadSubscriptionStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const subscription = await SubscriptionService.getActiveSubscription();
      setState(prev => ({
        ...prev,
        ...subscription,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Failed to load subscription status:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  // Load subscription status on mount - using async IIFE pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading initial data
    void loadSubscriptionStatus();
  }, [loadSubscriptionStatus]);

  const openSubscriptionModal = useCallback((tier: BusinessTier, billingCycle: 'monthly' | 'annually' = 'monthly') => {
    setSelectedPlan({ tier, billingCycle });
    setIsModalOpen(true);
  }, []);

  const closeSubscriptionModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  }, []);

  const handleSubscriptionComplete = useCallback(() => {
    // Refresh subscription status after successful subscription
    void loadSubscriptionStatus();
    
    // Close modal after a delay to show success state
    setTimeout(() => {
      closeSubscriptionModal();
    }, 2000);
  }, [loadSubscriptionStatus, closeSubscriptionModal]);

  const generateSubscriptionUrl = useCallback((tier: BusinessTier, billingCycle: 'monthly' | 'annually' = 'monthly') => {
    return SubscriptionService.generateSubscriptionUrl({ tier, billingCycle });
  }, []);

  return {
    // State
    ...state,
    
    // Modal state
    isModalOpen,
    selectedPlan,
    
    // Actions
    openSubscriptionModal,
    closeSubscriptionModal,
    handleSubscriptionComplete,
    generateSubscriptionUrl,
    refreshSubscription: loadSubscriptionStatus,
  };
}

export default useSubscription;