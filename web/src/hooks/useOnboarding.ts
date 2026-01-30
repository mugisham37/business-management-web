/**
 * useOnboarding Hook
 * Manages user onboarding state and workflows
 */

// Re-export all types from the centralized types file
export type {
  OnboardingStep,
  BusinessTier,
  BusinessType,
  BusinessSize,
  OnboardingData,
  WorkflowState,
  PlanFeatures,
  PlanLimits,
  OnboardingStepConfig,
} from '@/types/onboarding';

export {
  OnboardingStatus,
  ONBOARDING_STEPS,
  getStepByIndex,
  getStepIndex,
  getAllTiers,
  getAllBusinessTypes,
} from '@/types/onboarding';

import type {
  OnboardingStep as OnboardingStepEnum,
  OnboardingData,
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
  currentStepEnum?: OnboardingStepEnum;
  onboardingData?: OnboardingData;
}

/**
 * Hook for managing onboarding flows
 */
export function useOnboarding() {
  return {
    startOnboarding: () => {},
    completeStep: (_stepId: string) => { void _stepId; },
    skipStep: (_stepId: string) => { void _stepId; },
    resetOnboarding: () => {},
    getOnboardingState: (): OnboardingState => ({
      isOnboarding: false,
      currentStep: 0,
      steps: [],
      progress: 0,
    }),
  };
}
