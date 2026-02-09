/**
 * Onboarding Store
 * 
 * Centralized state management for the onboarding flow using Zustand.
 * Manages onboarding data, progress tracking, and API integration.
 * 
 * Features:
 * - Centralized state for all onboarding steps
 * - Automatic API persistence on state updates
 * - Progress tracking (current step, completed steps)
 * - Error handling and loading states
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4
 */

import { create } from 'zustand';
import { onboardingApi } from '@/lib/api/services/onboarding.api';
import { logError } from '@/lib/utils/error-logger';
import type {
  OnboardingData,
  OnboardingStep,
  BusinessInfo,
  ProductFeatures,
  TeamSize,
  LocationsData,
  InfrastructureData,
  IntegrationsData,
} from '@/types/onboarding-api';

/**
 * Onboarding Store State Interface
 */
interface OnboardingStore {
  // State
  data: OnboardingData;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  isLoading: boolean;
  error: string | null;

  // Actions - State Update
  setBusinessInfo: (info: BusinessInfo) => Promise<void>;
  setFeatures: (features: ProductFeatures) => Promise<void>;
  setTeamSize: (teamSize: TeamSize) => Promise<void>;
  setLocations: (locations: LocationsData) => Promise<void>;
  setInfrastructure: (infrastructure: InfrastructureData) => Promise<void>;
  setIntegrations: (integrations: IntegrationsData) => Promise<void>;

  // Actions - Progress Management
  loadProgress: () => Promise<void>;
  completeOnboarding: () => Promise<void>;

  // Actions - Step Tracking
  setCurrentStep: (step: OnboardingStep) => void;
  markStepComplete: (step: OnboardingStep) => void;

  // Actions - Utility
  reset: () => void;
}

/**
 * Initial state for the onboarding store
 */
const initialState = {
  data: {},
  currentStep: 'welcome' as OnboardingStep,
  completedSteps: [] as OnboardingStep[],
  isLoading: false,
  error: null,
};

/**
 * Onboarding Store
 * 
 * Requirements: 10.1
 */
export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  ...initialState,

  /**
   * Set business information and save to backend
   * Requirements: 10.2, 10.4
   */
  setBusinessInfo: async (info: BusinessInfo) => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.saveProgress({
        businessInfo: info,
      });
      set({
        data: { ...get().data, businessInfo: info },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save business info';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'business-info',
        metadata: { action: 'setBusinessInfo' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set product features and save to backend
   * Requirements: 10.2, 10.4
   */
  setFeatures: async (features: ProductFeatures) => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.saveProgress({
        features,
      });
      set({
        data: { ...get().data, features },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save features';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'products',
        metadata: { action: 'setFeatures' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set team size and save to backend
   * Requirements: 10.2, 10.4
   */
  setTeamSize: async (teamSize: TeamSize) => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.saveProgress({
        teamSize,
      });
      set({
        data: { ...get().data, teamSize },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save team size';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'employees',
        metadata: { action: 'setTeamSize' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set locations data and save to backend
   * Requirements: 10.2, 10.4
   */
  setLocations: async (locations: LocationsData) => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.saveProgress({
        locations,
      });
      set({
        data: { ...get().data, locations },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save locations';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'locations',
        metadata: { action: 'setLocations' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set infrastructure data and save to backend
   * Requirements: 10.2, 10.4
   */
  setInfrastructure: async (infrastructure: InfrastructureData) => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.saveProgress({
        infrastructure,
      });
      set({
        data: { ...get().data, infrastructure },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save infrastructure';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'infrastructure',
        metadata: { action: 'setInfrastructure' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set integrations data and save to backend
   * Requirements: 10.2, 10.4
   */
  setIntegrations: async (integrations: IntegrationsData) => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.saveProgress({
        integrations,
      });
      set({
        data: { ...get().data, integrations },
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save integrations';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'integrations',
        metadata: { action: 'setIntegrations' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Load onboarding progress from backend
   * Requirements: 1.3, 10.3
   */
  loadProgress: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await onboardingApi.getProgress();
      if (response.data.data) {
        set({
          data: response.data.data.data,
          currentStep: response.data.data.currentStep,
          completedSteps: response.data.data.completedSteps,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load progress';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        metadata: { action: 'loadProgress' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Mark onboarding as complete
   * Requirements: 13.1
   */
  completeOnboarding: async () => {
    set({ isLoading: true, error: null });
    try {
      await onboardingApi.completeOnboarding();
      set({ isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to complete onboarding';
      
      // Log error with context
      logError(error instanceof Error ? error : new Error(errorMessage), {
        step: 'completion',
        metadata: { action: 'completeOnboarding' }
      });
      
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Set current step
   * Requirements: 6.1
   */
  setCurrentStep: (step: OnboardingStep) => {
    set({ currentStep: step });
  },

  /**
   * Mark a step as complete
   * Requirements: 6.1
   */
  markStepComplete: (step: OnboardingStep) => {
    const { completedSteps } = get();
    if (!completedSteps.includes(step)) {
      set({ completedSteps: [...completedSteps, step] });
    }
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set(initialState);
  },
}));
