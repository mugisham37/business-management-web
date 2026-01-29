/**
 * OnboardingService - Complete integration with GraphQL backend
 * Implements 5-step onboarding process with backend persistence
 */

import { ApolloClient, gql } from '@apollo/client';
import { 
  GET_ONBOARDING_STATUS,
  GET_AVAILABLE_PLANS,
  GET_PLAN_FEATURES,
  UPDATE_ONBOARDING_STEP,
  COMPLETE_ONBOARDING
} from '@/lib/graphql/mutations/onboarding';
import { 
  OnboardingStep, 
  BusinessType, 
  BusinessTier, 
  OnboardingData,
  OnboardingStatus,
  PlanFeatures,
  WorkflowState
} from '@/hooks/useOnboarding';
import { getTierAssignmentService, TierAssignmentResult } from './tier-assignment.service';
import { getOnboardingRecoveryService, RecoverySession, RecoveryResult } from './onboarding-recovery.service';

// Additional GraphQL operations
const ANALYZE_BUSINESS_PROFILE = gql`
  query AnalyzeBusinessProfile {
    analyzeBusinessProfile {
      recommendedTier
      confidence
      reasoning
      alternatives {
        tier
        reason
      }
    }
  }
`;

const RESUME_ONBOARDING = gql`
  mutation ResumeOnboarding {
    resumeOnboarding {
      tenantId
      completionPercentage
      currentStep
      completedSteps
      pendingSteps
      isComplete
      onboardingData {
        businessName
        businessIndustry
        businessSize
        businessType
        expectedEmployees
        expectedLocations
        expectedMonthlyTransactions
        expectedMonthlyRevenue
        selectedPlan
        recommendedPlan
      }
      recommendedPlan
      completedAt
      workflowState {
        currentStep
        completedSteps
        availableSteps
        canProceed
        validationErrors
        lastUpdated
        sessionId
      }
      canResume
      sessionId
    }
  }
`;

const VALIDATE_STEP_DATA = gql`
  query ValidateStepData($input: ValidateStepDataInput!) {
    validateOnboardingStepData(input: $input) {
      isValid
      errors
    }
  }
`;

/**
 * Onboarding session for tracking progress
 */
export interface OnboardingSession {
  sessionId: string;
  userId: string;
  currentStep: number;
  completedSteps: OnboardingStep[];
  onboardingData: OnboardingData;
  recommendedTier: BusinessTier | null;
  expiresAt: Date;
  workflowState: WorkflowState;
}

/**
 * Step validation result
 */
export interface StepResult {
  success: boolean;
  errors?: Record<string, string[]>;
  nextStep?: OnboardingStep | undefined;
  recommendedTier?: BusinessTier | undefined;
}

/**
 * Onboarding completion result
 */
export interface OnboardingResult {
  success: boolean;
  selectedTier: BusinessTier;
  redirectUrl: string;
  completedAt: Date;
}

/**
 * Tier recommendation with reasoning
 */
export interface TierRecommendation {
  recommendedTier: BusinessTier;
  confidence: number;
  reasoning: string[];
  alternatives: Array<{
    tier: BusinessTier;
    reason: string;
  }>;
}

/**
 * Business profile for tier calculation
 */
export interface BusinessProfile {
  businessName: string;
  businessIndustry: string;
  businessSize: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  businessType: BusinessType;
  expectedEmployees: number;
  expectedLocations: number;
  expectedMonthlyTransactions: number;
  expectedMonthlyRevenue: number;
  description?: string;
  website?: string;
  currentSoftware?: string[];
  businessGoals?: string[];
}

/**
 * Step data for each onboarding step
 */
export interface StepData {
  step: OnboardingStep;
  data: Partial<OnboardingData>;
  isValid: boolean;
  errors?: Record<string, string[]>;
}

export class OnboardingService {
  private apolloClient: ApolloClient<any>;
  private currentSession: OnboardingSession | null = null;
  private tierAssignmentService: ReturnType<typeof getTierAssignmentService>;
  private recoveryService: ReturnType<typeof getOnboardingRecoveryService>;

  constructor(apolloClient: ApolloClient<any>) {
    this.apolloClient = apolloClient;
    this.tierAssignmentService = getTierAssignmentService(apolloClient);
    this.recoveryService = getOnboardingRecoveryService(apolloClient);
  }

  /**
   * Start onboarding process for a user
   */
  async startOnboarding(userId: string): Promise<OnboardingSession> {
    try {
      // Get current onboarding status from backend
      const { data } = await this.apolloClient.query({
        query: GET_ONBOARDING_STATUS,
        fetchPolicy: 'network-only', // Always get fresh data
      });

      const status: OnboardingStatus = data.myOnboardingStatus;

      // Create session from backend data
      const session: OnboardingSession = {
        sessionId: status.sessionId || this.generateSessionId(),
        userId,
        currentStep: status.currentStep,
        completedSteps: status.completedSteps,
        onboardingData: status.onboardingData,
        recommendedTier: status.recommendedPlan,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        workflowState: status.workflowState,
      };

      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Failed to start onboarding:', error);
      throw new Error('Failed to initialize onboarding session');
    }
  }

  /**
   * Submit data for a specific step with failure recovery
   */
  async submitStep(
    sessionId: string, 
    step: OnboardingStep, 
    data: Partial<OnboardingData>
  ): Promise<StepResult> {
    try {
      // Validate session
      if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
        throw new Error('Invalid or expired session');
      }

      // Submit step data to backend
      const { data: result } = await this.apolloClient.mutate({
        mutation: UPDATE_ONBOARDING_STEP,
        variables: {
          input: {
            step,
            ...data,
          },
        },
      });

      const updatedStatus: OnboardingStatus = result.updateOnboardingStep;

      // Update current session
      this.currentSession = {
        ...this.currentSession,
        currentStep: updatedStatus.currentStep,
        completedSteps: updatedStatus.completedSteps,
        onboardingData: updatedStatus.onboardingData,
        recommendedTier: updatedStatus.recommendedPlan,
        workflowState: updatedStatus.workflowState,
      };

      // Determine next step
      const nextStepIndex = updatedStatus.currentStep + 1;
      const allSteps = [
        OnboardingStep.BUSINESS_PROFILE,
        OnboardingStep.BUSINESS_TYPE,
        OnboardingStep.USAGE_EXPECTATIONS,
        OnboardingStep.PLAN_SELECTION,
        OnboardingStep.WELCOME,
      ];
      const nextStep = allSteps[nextStepIndex];

      return {
        success: true,
        nextStep,
        recommendedTier: updatedStatus.recommendedPlan || undefined,
      };
    } catch (error: any) {
      console.error('Failed to submit step:', error);
      
      // Create recovery session for failure
      if (this.currentSession) {
        await this.createRecoverySession(
          this.currentSession.userId,
          step,
          error.message || 'Unknown error',
          { ...this.currentSession.onboardingData, ...data }
        );
      }
      
      // Handle validation errors from backend
      if (error.graphQLErrors?.[0]?.extensions?.errors) {
        return {
          success: false,
          errors: error.graphQLErrors[0].extensions.errors,
        };
      }

      return {
        success: false,
        errors: {
          general: ['Failed to save step data. Please try again.'],
        },
      };
    }
  }

  /**
   * Calculate tier recommendation based on business profile
   */
  async calculateTierRecommendation(businessData: BusinessProfile): Promise<TierRecommendation> {
    try {
      // Use the backend's business profile analysis
      const { data } = await this.apolloClient.query({
        query: ANALYZE_BUSINESS_PROFILE,
      });

      return data.analyzeBusinessProfile;
    } catch (error) {
      console.error('Failed to calculate tier recommendation:', error);
      
      // Fallback to client-side calculation
      return this.calculateTierRecommendationFallback(businessData);
    }
  }

  /**
   * Complete onboarding process with tier assignment
   */
  async completeOnboarding(
    sessionId: string, 
    selectedTier: BusinessTier
  ): Promise<OnboardingResult> {
    try {
      // Validate session
      if (!this.currentSession || this.currentSession.sessionId !== sessionId) {
        throw new Error('Invalid or expired session');
      }

      // Validate tier eligibility
      const eligibility = await this.tierAssignmentService.validateTierEligibility(
        this.currentSession.userId,
        selectedTier,
        this.currentSession.onboardingData
      );

      if (!eligibility.eligible) {
        throw new Error(`Tier not eligible: ${eligibility.reasons.join(', ')}`);
      }

      // Complete onboarding via backend
      const { data } = await this.apolloClient.mutate({
        mutation: COMPLETE_ONBOARDING,
        variables: {
          input: {
            selectedPlan: selectedTier,
          },
        },
      });

      const completedStatus: OnboardingStatus = data.completeOnboarding;

      // Assign tier with permissions
      const tierAssignmentResult: TierAssignmentResult = await this.tierAssignmentService.assignTier(
        this.currentSession.userId,
        selectedTier,
        'Onboarding completion'
      );

      if (!tierAssignmentResult.success) {
        console.warn('Tier assignment failed:', tierAssignmentResult.error);
        // Continue with onboarding completion even if tier assignment fails
      }

      // Clear current session
      this.currentSession = null;

      return {
        success: true,
        selectedTier,
        redirectUrl: '/dashboard',
        completedAt: completedStatus.completedAt || new Date(),
      };
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      
      // Create recovery session for completion failure
      if (this.currentSession) {
        await this.createRecoverySession(
          this.currentSession.userId,
          OnboardingStep.PLAN_SELECTION,
          error instanceof Error ? error.message : 'Completion failed',
          { ...this.currentSession.onboardingData, selectedPlan: selectedTier }
        );
      }
      
      throw new Error('Failed to complete onboarding process');
    }
  }

  /**
   * Resume onboarding from where user left off
   */
  async resumeOnboarding(userId: string): Promise<OnboardingSession> {
    try {
      // Resume via backend
      const { data } = await this.apolloClient.mutate({
        mutation: RESUME_ONBOARDING,
      });

      const status: OnboardingStatus = data.resumeOnboarding;

      const session: OnboardingSession = {
        sessionId: status.sessionId,
        userId,
        currentStep: status.currentStep,
        completedSteps: status.completedSteps,
        onboardingData: status.onboardingData,
        recommendedTier: status.recommendedPlan,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        workflowState: status.workflowState,
      };

      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Failed to resume onboarding:', error);
      throw new Error('Failed to resume onboarding session');
    }
  }

  /**
   * Get available plans for selection
   */
  async getAvailablePlans(): Promise<PlanFeatures[]> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_AVAILABLE_PLANS,
        fetchPolicy: 'cache-first', // Plans don't change often
      });

      return data.availablePlans;
    } catch (error) {
      console.error('Failed to get available plans:', error);
      throw new Error('Failed to load available plans');
    }
  }

  /**
   * Get features for a specific plan
   */
  async getPlanFeatures(tier: BusinessTier): Promise<PlanFeatures> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_PLAN_FEATURES,
        variables: { tier },
        fetchPolicy: 'cache-first',
      });

      return data.planFeatures;
    } catch (error) {
      console.error('Failed to get plan features:', error);
      throw new Error('Failed to load plan features');
    }
  }

  /**
   * Validate step data without saving
   */
  async validateStepData(step: OnboardingStep, data: Partial<OnboardingData>): Promise<StepResult> {
    try {
      const { data: result } = await this.apolloClient.query({
        query: VALIDATE_STEP_DATA,
        variables: {
          input: {
            step,
            data,
          },
        },
      });

      const validation = result.validateOnboardingStepData;

      return {
        success: validation.isValid,
        errors: validation.isValid ? undefined : validation.errors,
      };
    } catch (error) {
      console.error('Failed to validate step data:', error);
      return {
        success: false,
        errors: {
          general: ['Validation failed. Please check your input.'],
        },
      };
    }
  }

  /**
   * Get current session
   */
  getCurrentSession(): OnboardingSession | null {
    return this.currentSession;
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSession = null;
  }

  /**
   * Create recovery session for onboarding failure
   */
  async createRecoverySession(
    userId: string,
    failurePoint: OnboardingStep,
    failureReason: string,
    preservedData: OnboardingData
  ): Promise<RecoverySession> {
    return this.recoveryService.createRecoverySession(
      userId,
      failurePoint,
      failureReason,
      preservedData
    );
  }

  /**
   * Attempt recovery from onboarding failure
   */
  async attemptRecovery(sessionId: string): Promise<RecoveryResult> {
    const result = await this.recoveryService.attemptRecovery(sessionId);
    
    if (result.success) {
      // Update current session with recovered data
      this.currentSession = {
        sessionId: result.sessionId,
        userId: this.currentSession?.userId || 'current-user',
        currentStep: this.getStepIndex(result.resumedStep),
        completedSteps: this.getCompletedStepsForStep(result.resumedStep),
        onboardingData: result.preservedData,
        recommendedTier: result.preservedData.recommendedPlan || null,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        workflowState: {
          currentStep: result.resumedStep,
          completedSteps: this.getCompletedStepsForStep(result.resumedStep),
          availableSteps: [result.resumedStep],
          canProceed: true,
          validationErrors: {},
          lastUpdated: new Date(),
          sessionId: result.sessionId,
        },
      };
    }
    
    return result;
  }

  /**
   * Resume onboarding from failure point
   */
  async resumeFromFailure(
    sessionId: string,
    additionalData?: Partial<OnboardingData>
  ): Promise<RecoveryResult> {
    return this.recoveryService.resumeFromFailure(sessionId, additionalData);
  }

  /**
   * Get active recovery sessions for user
   */
  async getActiveRecoverySessions(userId: string): Promise<RecoverySession[]> {
    return this.recoveryService.getActiveRecoverySessions(userId);
  }

  /**
   * Get tier assignment service for external use
   */
  getTierAssignmentService() {
    return this.tierAssignmentService;
  }

  /**
   * Get recovery service for external use
   */
  getRecoveryService() {
    return this.recoveryService;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get step index for a given step
   */
  private getStepIndex(step: OnboardingStep): number {
    const allSteps = [
      OnboardingStep.BUSINESS_PROFILE,
      OnboardingStep.BUSINESS_TYPE,
      OnboardingStep.USAGE_EXPECTATIONS,
      OnboardingStep.PLAN_SELECTION,
      OnboardingStep.WELCOME,
    ];
    return allSteps.indexOf(step);
  }

  /**
   * Get completed steps up to a given step
   */
  private getCompletedStepsForStep(step: OnboardingStep): OnboardingStep[] {
    const allSteps = [
      OnboardingStep.BUSINESS_PROFILE,
      OnboardingStep.BUSINESS_TYPE,
      OnboardingStep.USAGE_EXPECTATIONS,
      OnboardingStep.PLAN_SELECTION,
      OnboardingStep.WELCOME,
    ];
    const stepIndex = allSteps.indexOf(step);
    return allSteps.slice(0, stepIndex);
  }

  /**
   * Fallback tier recommendation calculation (client-side)
   */
  private calculateTierRecommendationFallback(businessData: BusinessProfile): TierRecommendation {
    const { 
      businessType, 
      expectedEmployees, 
      expectedLocations, 
      expectedMonthlyTransactions, 
      expectedMonthlyRevenue 
    } = businessData;

    let recommendedTier: BusinessTier;
    let confidence = 0.8;
    const reasoning: string[] = [];
    const alternatives: Array<{ tier: BusinessTier; reason: string }> = [];

    // Business type-based recommendation
    if (businessType === BusinessType.FREE) {
      recommendedTier = BusinessTier.MICRO;
      reasoning.push('Free business type suggests starting with Micro tier');
    } else if (businessType === BusinessType.INDUSTRY) {
      recommendedTier = BusinessTier.ENTERPRISE;
      reasoning.push('Industrial operations typically require Enterprise features');
    } else if (businessType === BusinessType.WHOLESALE) {
      recommendedTier = BusinessTier.MEDIUM;
      reasoning.push('Wholesale operations benefit from Medium tier B2B features');
    } else {
      recommendedTier = BusinessTier.SMALL;
      reasoning.push('Retail and renewable businesses typically start with Small tier');
    }

    // Scale-based adjustments
    if (expectedEmployees > 100 || expectedLocations > 10 || expectedMonthlyRevenue > 1000000) {
      if (recommendedTier !== BusinessTier.ENTERPRISE) {
        alternatives.push({
          tier: BusinessTier.ENTERPRISE,
          reason: 'Large scale operations may benefit from Enterprise features',
        });
      }
      recommendedTier = BusinessTier.ENTERPRISE;
      reasoning.push('Large scale operations require Enterprise tier');
      confidence = 0.9;
    } else if (expectedEmployees > 25 || expectedLocations > 3 || expectedMonthlyRevenue > 100000) {
      if (recommendedTier === BusinessTier.MICRO || recommendedTier === BusinessTier.SMALL) {
        recommendedTier = BusinessTier.MEDIUM;
        reasoning.push('Medium-scale operations benefit from Medium tier features');
      }
    } else if (expectedEmployees <= 5 && expectedLocations <= 1 && expectedMonthlyRevenue <= 10000) {
      if (recommendedTier !== BusinessTier.MICRO) {
        alternatives.push({
          tier: BusinessTier.MICRO,
          reason: 'Small operations could start with free Micro tier',
        });
      }
    }

    // Transaction volume consideration
    if (expectedMonthlyTransactions > 50000) {
      if (recommendedTier !== BusinessTier.ENTERPRISE) {
        alternatives.push({
          tier: BusinessTier.ENTERPRISE,
          reason: 'High transaction volume benefits from Enterprise performance',
        });
      }
    }

    return {
      recommendedTier,
      confidence,
      reasoning,
      alternatives,
    };
  }
}

// Export singleton instance
let onboardingServiceInstance: OnboardingService | null = null;

export const getOnboardingService = (apolloClient: ApolloClient<any>): OnboardingService => {
  if (!onboardingServiceInstance) {
    onboardingServiceInstance = new OnboardingService(apolloClient);
  }
  return onboardingServiceInstance;
};

export default OnboardingService;