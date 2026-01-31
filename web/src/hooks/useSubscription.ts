/**
 * useSubscription Hook
 * Manages subscription state and modal interactions for pricing plans
 */

import { useState, useCallback } from 'react';
import { BusinessTier } from '@/types/pricing';

interface SelectedPlanInfo {
  tier: BusinessTier;
  billingCycle: 'monthly' | 'annually';
}

interface SubscriptionState {
  isModalOpen: boolean;
  selectedPlan: SelectedPlanInfo | null;
  billingFrequency: 'monthly' | 'annually';
}

interface UseSubscriptionReturn {
  isModalOpen: boolean;
  selectedPlan: SelectedPlanInfo | null;
  hasSubscription: boolean;
  currentSubscription: SubscriptionInfo | null;
  isLoading: boolean;
  openSubscriptionModal: (tier: BusinessTier, billingFrequency: 'monthly' | 'annually') => void;
  closeSubscriptionModal: () => void;
  handleSubscriptionComplete: (subscriptionId: string) => void;
}

interface SubscriptionInfo {
  tier: BusinessTier;
  status: 'active' | 'trialing' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

/**
 * Hook to manage subscription state and interactions
 * @returns Subscription state and control functions
 */
export function useSubscription(): UseSubscriptionReturn {
  const [state, setState] = useState<SubscriptionState>({
    isModalOpen: false,
    selectedPlan: null,
    billingFrequency: 'monthly',
  });
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has an active subscription
  const hasSubscription = currentSubscription !== null && 
    (currentSubscription.status === 'active' || currentSubscription.status === 'trialing');

  const openSubscriptionModal = useCallback((tier: BusinessTier, billingFrequency: 'monthly' | 'annually') => {
    setState({
      isModalOpen: true,
      selectedPlan: { tier, billingCycle: billingFrequency },
      billingFrequency,
    });
  }, []);

  const closeSubscriptionModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      isModalOpen: false,
      selectedPlan: null,
    }));
  }, []);

  const handleSubscriptionComplete = useCallback((subscriptionId: string) => {
    // Get the tier from the current selected plan
    const tier = state.selectedPlan?.tier;
    if (!tier) {
      console.error('No selected plan tier found');
      return;
    }
    
    // Update local subscription state
    setCurrentSubscription({
      tier,
      status: 'trialing',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false,
    });

    closeSubscriptionModal();
    console.log('Subscription completed with ID:', subscriptionId);
  }, [state.selectedPlan, closeSubscriptionModal]);

  return {
    isModalOpen: state.isModalOpen,
    selectedPlan: state.selectedPlan,
    hasSubscription,
    currentSubscription,
    isLoading,
    openSubscriptionModal,
    closeSubscriptionModal,
    handleSubscriptionComplete,
  };
}

export default useSubscription;
