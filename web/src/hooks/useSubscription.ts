/**
 * Subscription Hook
 * 
 * Provides subscription management functionality:
 * - Modal state management
 * - Subscription operations
 * - Billing cycle handling
 */

import { useState, useCallback } from 'react';
import { BusinessTier, SubscriptionState } from '@/types/pricing';

interface UseSubscriptionReturn {
  isModalOpen: boolean;
  selectedPlan: BusinessTier | null;
  billingCycle: 'monthly' | 'annually';
  isLoading: boolean;
  error: string | null;
  openSubscriptionModal: (tier: BusinessTier, billingCycle: 'monthly' | 'annually') => void;
  closeSubscriptionModal: () => void;
  handleSubscriptionComplete: (subscription: SubscriptionState) => void;
  setBillingCycle: (cycle: 'monthly' | 'annually') => void;
}

export function useSubscription(): UseSubscriptionReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BusinessTier | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openSubscriptionModal = useCallback((tier: BusinessTier, cycle: 'monthly' | 'annually') => {
    setSelectedPlan(tier);
    setBillingCycle(cycle);
    setIsModalOpen(true);
    setError(null);
  }, []);

  const closeSubscriptionModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlan(null);
    setError(null);
  }, []);

  const handleSubscriptionComplete = useCallback((subscription: SubscriptionState) => {
    setIsLoading(false);
    closeSubscriptionModal();
    
    // TODO: Update global state or trigger a refetch of user data
    console.log('Subscription completed:', subscription);
  }, [closeSubscriptionModal]);

  return {
    isModalOpen,
    selectedPlan,
    billingCycle,
    isLoading,
    error,
    openSubscriptionModal,
    closeSubscriptionModal,
    handleSubscriptionComplete,
    setBillingCycle,
  };
}
