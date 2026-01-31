/**
 * useOnboarding Hook
 * Manages user onboarding state and workflows
 */

import { useState, useCallback, useMemo } from 'react';

// Re-export all types from the centralized types file
export type {
  OnboardingData,
  WorkflowState,
  PlanFeatures,
  PlanLimits,
  OnboardingStepConfig,
} from '@/types/onboarding';

// Export enums as values (not just types)
export {
  OnboardingStep,
  BusinessTier,
  BusinessType,
  BusinessSize,
  OnboardingStatus,
  ONBOARDING_STEPS,
  getStepByIndex,
  getStepIndex,
  getAllTiers,
  getAllBusinessTypes,
} from '@/types/onboarding';

import {
  OnboardingStep,
  BusinessTier,
  ONBOARDING_STEPS,
  getStepByIndex,
  getStepIndex,
} from '@/types/onboarding';
import type {
  OnboardingData,
  PlanFeatures,
  OnboardingStepConfig,
} from '@/types/onboarding';

/**
 * Onboarding step item (used in hook state)
 */
export interface OnboardingStepItem {
  id: string;
  name: string;
  completed: boolean;
  data?: Record<string, unknown>;
}

/**
 * Onboarding state interface
 */
export interface OnboardingState {
  isOnboarding: boolean;
  currentStep: number;
  steps: OnboardingStepItem[];
  progress: number;
  currentStepEnum?: OnboardingStep;
  onboardingData?: OnboardingData;
}

/**
 * Default plans configuration
 */
const DEFAULT_PLANS: PlanFeatures[] = [
  {
    tier: BusinessTier.MICRO,
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ['Basic POS', 'Up to 100 products', '1 location', 'Email support'],
    limits: { employees: 2, locations: 1, transactions: 1000, storage: 1, apiCalls: 1000 },
  },
  {
    tier: BusinessTier.SMALL,
    name: 'Growth',
    description: 'For growing businesses',
    monthlyPrice: 29,
    yearlyPrice: 290,
    features: ['Everything in Free', 'Up to 1,000 products', '3 locations', 'Advanced analytics', 'Priority support'],
    limits: { employees: 10, locations: 3, transactions: 10000, storage: 10, apiCalls: 10000 },
    isPopular: true,
  },
  {
    tier: BusinessTier.MEDIUM,
    name: 'Business',
    description: 'For established businesses',
    monthlyPrice: 79,
    yearlyPrice: 790,
    features: ['Everything in Growth', 'Unlimited products', '10 locations', 'B2B features', 'Phone support'],
    limits: { employees: 50, locations: 10, transactions: 50000, storage: 100, apiCalls: 100000 },
    isRecommended: true,
  },
  {
    tier: BusinessTier.ENTERPRISE,
    name: 'Industry',
    description: 'For large enterprises',
    monthlyPrice: 199,
    yearlyPrice: 1990,
    features: ['Everything in Business', 'Unlimited everything', 'Custom integrations', 'Dedicated support', 'SLA'],
    limits: { employees: -1, locations: -1, transactions: -1, storage: -1, apiCalls: -1 },
  },
];

/**
 * Hook for managing onboarding flows
 */
export function useOnboarding() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = ONBOARDING_STEPS.length;
  const currentStep = getStepByIndex(currentStepIndex);
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const currentStepMeta = useMemo((): OnboardingStepConfig => {
    return ONBOARDING_STEPS[currentStepIndex] ?? ONBOARDING_STEPS[0]!;
  }, [currentStepIndex]);

  // Calculate recommended plan based on onboarding data
  const recommendedPlan: BusinessTier | null = useMemo(() => {
    const { expectedEmployees = 1, expectedLocations = 1, expectedMonthlyTransactions = 0 } = onboardingData;
    
    if (expectedEmployees > 50 || expectedLocations > 10 || expectedMonthlyTransactions > 50000) {
      return BusinessTier.ENTERPRISE;
    }
    if (expectedEmployees > 10 || expectedLocations > 3 || expectedMonthlyTransactions > 10000) {
      return BusinessTier.MEDIUM;
    }
    if (expectedEmployees > 2 || expectedLocations > 1 || expectedMonthlyTransactions > 1000) {
      return BusinessTier.SMALL;
    }
    return BusinessTier.MICRO;
  }, [onboardingData]);

  const plans: PlanFeatures[] = DEFAULT_PLANS;

  const updateStep = useCallback(async (step: OnboardingStep, data: Record<string, unknown>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Merge new data with existing
      setOnboardingData(prev => ({ ...prev, ...data }));
      
      // Move to next step
      const stepIndex = getStepIndex(step);
      if (stepIndex < totalSteps - 1) {
        setCurrentStepIndex(stepIndex + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update step');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [totalSteps]);

  const complete = useCallback(async (selectedPlan?: BusinessTier) => {
    setIsLoading(true);
    setError(null);
    try {
      const finalData = {
        ...onboardingData,
        selectedPlan: selectedPlan || recommendedPlan || BusinessTier.MICRO,
        completedAt: new Date().toISOString(),
      };
      setOnboardingData(finalData);
      // In real implementation, this would save to backend
      console.log('Onboarding completed:', finalData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onboardingData, recommendedPlan]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const startOnboarding = useCallback(() => {
    setCurrentStepIndex(0);
    setOnboardingData({});
    setError(null);
  }, []);

  const resetOnboarding = useCallback(() => {
    setCurrentStepIndex(0);
    setOnboardingData({});
    setError(null);
  }, []);

  return {
    // Step navigation
    currentStep,
    currentStepIndex,
    currentStepMeta,
    totalSteps,
    progress,
    isFirstStep,
    isLastStep,
    
    // State
    isLoading,
    error,
    onboardingData,
    
    // Plan recommendation
    recommendedPlan,
    plans,
    
    // Actions
    updateStep,
    complete,
    goBack,
    startOnboarding,
    resetOnboarding,
    
    // Legacy compatibility
    completeStep: (_stepId: string) => { void _stepId; },
    skipStep: (_stepId: string) => { void _stepId; },
    getOnboardingState: (): OnboardingState => ({
      isOnboarding: currentStepIndex > 0,
      currentStep: currentStepIndex,
      steps: [],
      progress,
      currentStepEnum: currentStep,
      onboardingData,
    }),
  };
}
