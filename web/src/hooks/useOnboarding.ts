'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useQuery, useMutation, ApolloError, useApolloClient } from '@apollo/client';
import {
    GET_ONBOARDING_STATUS,
    GET_AVAILABLE_PLANS,
    UPDATE_ONBOARDING_STEP,
    COMPLETE_ONBOARDING,
} from '@/lib/graphql/mutations/onboarding';
import { getOnboardingService, OnboardingSession, StepResult, OnboardingResult, TierRecommendation } from '@/lib/services/onboarding.service';

/**
 * Business tier enum
 */
export enum BusinessTier {
    MICRO = 'micro',
    SMALL = 'small',
    MEDIUM = 'medium',
    ENTERPRISE = 'enterprise',
}

/**
 * Onboarding step identifiers
 */
export enum OnboardingStep {
    BUSINESS_PROFILE = 'business_profile',
    BUSINESS_TYPE = 'business_type',
    USAGE_EXPECTATIONS = 'usage_expectations',
    PLAN_SELECTION = 'plan_selection',
    WELCOME = 'welcome',
}

/**
 * Business type categories
 */
export enum BusinessType {
    FREE = 'free',
    RENEWABLES = 'renewables',
    RETAIL = 'retail',
    WHOLESALE = 'wholesale',
    INDUSTRY = 'industry',
}

/**
 * Onboarding data collected during the process
 */
export interface OnboardingData {
    businessName?: string;
    businessIndustry?: string;
    businessSize?: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
    businessType?: BusinessType;
    expectedEmployees?: number;
    expectedLocations?: number;
    expectedMonthlyTransactions?: number;
    expectedMonthlyRevenue?: number;
    selectedPlan?: BusinessTier;
    recommendedPlan?: BusinessTier;
}

/**
 * Onboarding status
 */
export interface OnboardingStatus {
    tenantId: string;
    completionPercentage: number;
    currentStep: number;
    completedSteps: OnboardingStep[];
    pendingSteps: OnboardingStep[];
    isComplete: boolean;
    onboardingData: OnboardingData;
    recommendedPlan: BusinessTier | null;
    completedAt: Date | null;
    workflowState: WorkflowState;
    canResume: boolean;
    sessionId: string;
}

/**
 * Workflow state for tracking progress
 */
export interface WorkflowState {
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    availableSteps: OnboardingStep[];
    canProceed: boolean;
    validationErrors: Record<string, string[]>;
    lastUpdated: Date;
    sessionId: string;
}

/**
 * Plan limits
 */
export interface PlanLimits {
    employees: number;
    locations: number;
    transactions: number;
}

/**
 * Plan price
 */
export interface PlanPrice {
    monthly: number;
    annually: number;
}

/**
 * Plan features
 */
export interface PlanFeatures {
    name: string;
    description: string;
    features: string[];
    limits: PlanLimits;
    price: PlanPrice;
}

/**
 * All onboarding steps in order
 */
const ALL_STEPS: OnboardingStep[] = [
    OnboardingStep.BUSINESS_PROFILE,
    OnboardingStep.BUSINESS_TYPE,
    OnboardingStep.USAGE_EXPECTATIONS,
    OnboardingStep.PLAN_SELECTION,
    OnboardingStep.WELCOME,
];

/**
 * Step metadata
 */
const STEP_METADATA = {
    [OnboardingStep.BUSINESS_PROFILE]: {
        title: 'Business Profile',
        description: 'Tell us about your business',
    },
    [OnboardingStep.BUSINESS_TYPE]: {
        title: 'Business Type',
        description: 'What type of business do you run?',
    },
    [OnboardingStep.USAGE_EXPECTATIONS]: {
        title: 'Usage Expectations',
        description: 'Help us understand your needs',
    },
    [OnboardingStep.PLAN_SELECTION]: {
        title: 'Select Plan',
        description: 'Choose the best plan for your business',
    },
    [OnboardingStep.WELCOME]: {
        title: 'Welcome',
        description: "You're all set!",
    },
};

/**
 * Hook for managing onboarding flow with complete backend integration
 */
export function useOnboarding() {
    const apolloClient = useApolloClient();
    const [onboardingService] = useState(() => getOnboardingService(apolloClient));
    const [currentSession, setCurrentSession] = useState<OnboardingSession | null>(null);
    const [isInitializing, setIsInitializing] = useState(false);

    // Query onboarding status
    const {
        data: statusData,
        loading: statusLoading,
        error: statusError,
        refetch: refetchStatus,
    } = useQuery(GET_ONBOARDING_STATUS);

    // Query available plans
    const {
        data: plansData,
        loading: plansLoading,
        error: plansError,
    } = useQuery(GET_AVAILABLE_PLANS);

    // Mutation for updating onboarding step
    const [updateStepMutation, { loading: updateLoading }] = useMutation(
        UPDATE_ONBOARDING_STEP,
        {
            refetchQueries: [GET_ONBOARDING_STATUS],
        }
    );

    // Mutation for completing onboarding
    const [completeOnboardingMutation, { loading: completeLoading }] = useMutation(
        COMPLETE_ONBOARDING,
        {
            refetchQueries: [GET_ONBOARDING_STATUS],
        }
    );

    // Initialize onboarding session when status is loaded
    useEffect(() => {
        if (statusData?.myOnboardingStatus && !currentSession && !isInitializing) {
            setIsInitializing(true);
            onboardingService.startOnboarding('current-user') // In real app, get from auth context
                .then(session => {
                    setCurrentSession(session);
                })
                .catch(error => {
                    console.error('Failed to initialize onboarding session:', error);
                })
                .finally(() => {
                    setIsInitializing(false);
                });
        }
    }, [statusData, currentSession, isInitializing, onboardingService]);

    // Current onboarding status
    const status: OnboardingStatus | null = useMemo(() => {
        if (!statusData?.myOnboardingStatus) return null;
        return statusData.myOnboardingStatus;
    }, [statusData]);

    // Available plans
    const plans: PlanFeatures[] = useMemo(() => {
        if (!plansData?.availablePlans) return [];
        return plansData.availablePlans;
    }, [plansData]);

    // Current step index (0-based)
    const currentStepIndex = useMemo(() => {
        return currentSession?.currentStep ?? status?.currentStep ?? 0;
    }, [currentSession, status]);

    // Current step
    const currentStep = useMemo(() => {
        return ALL_STEPS[currentStepIndex] ?? OnboardingStep.BUSINESS_PROFILE;
    }, [currentStepIndex]);

    // Step metadata
    const currentStepMeta = useMemo(() => {
        return STEP_METADATA[currentStep];
    }, [currentStep]);

    // Progress percentage
    const progress = useMemo(() => {
        return currentSession?.completedSteps.length 
            ? Math.round((currentSession.completedSteps.length / ALL_STEPS.length) * 100)
            : status?.completionPercentage ?? 0;
    }, [currentSession, status]);

    // Is last step
    const isLastStep = useMemo(() => {
        return currentStepIndex >= ALL_STEPS.length - 1;
    }, [currentStepIndex]);

    // Is first step
    const isFirstStep = useMemo(() => {
        return currentStepIndex === 0;
    }, [currentStepIndex]);

    // Update step with data using the service
    const updateStep = useCallback(
        async (step: OnboardingStep, data: Partial<OnboardingData>) => {
            if (!currentSession) {
                throw new Error('No active onboarding session');
            }

            try {
                const result: StepResult = await onboardingService.submitStep(
                    currentSession.sessionId,
                    step,
                    data
                );

                if (!result.success) {
                    throw new Error('Step validation failed');
                }

                // Update session state
                const updatedSession = onboardingService.getCurrentSession();
                if (updatedSession) {
                    setCurrentSession(updatedSession);
                }

                // Refetch to ensure UI is in sync
                await refetchStatus();

                return true;
            } catch (error) {
                console.error('Failed to update onboarding step:', error);
                throw error;
            }
        },
        [currentSession, onboardingService, refetchStatus]
    );

    // Go to next step
    const nextStep = useCallback(
        async (data?: Partial<OnboardingData>) => {
            if (data) {
                await updateStep(currentStep, data);
            }
            // The step progression is handled by the backend
        },
        [currentStep, updateStep]
    );

    // Go to previous step
    const prevStep = useCallback(() => {
        // Previous step navigation is usually just UI state
        // The actual step data is managed by refetching
        refetchStatus();
    }, [refetchStatus]);

    // Complete onboarding using the service
    const complete = useCallback(
        async (selectedPlan?: BusinessTier) => {
            if (!currentSession) {
                throw new Error('No active onboarding session');
            }

            try {
                const result: OnboardingResult = await onboardingService.completeOnboarding(
                    currentSession.sessionId,
                    selectedPlan || BusinessTier.MICRO
                );

                if (result.success) {
                    setCurrentSession(null);
                    await refetchStatus();
                }

                return result.success;
            } catch (error) {
                console.error('Failed to complete onboarding:', error);
                throw error;
            }
        },
        [currentSession, onboardingService, refetchStatus]
    );

    // Resume onboarding
    const resumeOnboarding = useCallback(
        async () => {
            try {
                setIsInitializing(true);
                const session = await onboardingService.resumeOnboarding('current-user');
                setCurrentSession(session);
                await refetchStatus();
                return session;
            } catch (error) {
                console.error('Failed to resume onboarding:', error);
                throw error;
            } finally {
                setIsInitializing(false);
            }
        },
        [onboardingService, refetchStatus]
    );

    // Calculate tier recommendation
    const calculateTierRecommendation = useCallback(
        async (businessData: Partial<OnboardingData>) => {
            try {
                const businessProfile = {
                    businessName: businessData.businessName || '',
                    businessIndustry: businessData.businessIndustry || '',
                    businessSize: businessData.businessSize || 'small',
                    businessType: businessData.businessType || BusinessType.RETAIL,
                    expectedEmployees: businessData.expectedEmployees || 1,
                    expectedLocations: businessData.expectedLocations || 1,
                    expectedMonthlyTransactions: businessData.expectedMonthlyTransactions || 0,
                    expectedMonthlyRevenue: businessData.expectedMonthlyRevenue || 0,
                    description: businessData.description,
                    website: businessData.website,
                };

                const recommendation: TierRecommendation = await onboardingService.calculateTierRecommendation(businessProfile);
                return recommendation;
            } catch (error) {
                console.error('Failed to calculate tier recommendation:', error);
                throw error;
            }
        },
        [onboardingService]
    );

    // Get step by index
    const getStep = useCallback((index: number) => {
        return ALL_STEPS[index] ?? null;
    }, []);

    // Get step metadata
    const getStepMeta = useCallback((step: OnboardingStep) => {
        return STEP_METADATA[step];
    }, []);

    // Loading state
    const isLoading = statusLoading || plansLoading || updateLoading || completeLoading || isInitializing;

    // Error state
    const error: ApolloError | undefined = statusError || plansError;

    return {
        // State
        status,
        plans,
        currentStep,
        currentStepIndex,
        currentStepMeta,
        progress,
        isLoading,
        error,
        isComplete: status?.isComplete ?? false,
        recommendedPlan: currentSession?.recommendedTier ?? status?.recommendedPlan ?? null,
        onboardingData: currentSession?.onboardingData ?? status?.onboardingData ?? {},
        currentSession,

        // Navigation
        isFirstStep,
        isLastStep,
        nextStep,
        prevStep,
        totalSteps: ALL_STEPS.length,
        allSteps: ALL_STEPS,

        // Actions
        updateStep,
        complete,
        resumeOnboarding,
        calculateTierRecommendation,
        refetch: refetchStatus,
        getStep,
        getStepMeta,

        // Service access
        onboardingService,
    };
}

/**
 * Hook for getting just onboarding status (lightweight)
 */
export function useOnboardingStatus() {
    const { data, loading, error, refetch } = useQuery(GET_ONBOARDING_STATUS);

    return {
        isComplete: data?.myOnboardingStatus?.isComplete ?? false,
        completionPercentage: data?.myOnboardingStatus?.completionPercentage ?? 0,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook for available plans
 */
export function useAvailablePlans() {
    const { data, loading, error } = useQuery(GET_AVAILABLE_PLANS);

    return {
        plans: data?.availablePlans ?? [],
        loading,
        error,
    };
}

export default useOnboarding;
