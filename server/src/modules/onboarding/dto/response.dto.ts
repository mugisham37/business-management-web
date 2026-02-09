import {
  OnboardingData,
  OnboardingProgress,
  PlanRecommendation,
} from '../types/onboarding.types';

// ============================================================================
// Response DTOs for all onboarding endpoints
// ============================================================================

export interface SaveProgressResponse {
  success: boolean;
  data: OnboardingData;
  message: string;
}

export interface GetProgressResponse {
  success: boolean;
  data: OnboardingProgress | null;
}

export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
  completedAt: Date;
}

export interface RecommendPlanResponse {
  success: boolean;
  recommendations: PlanRecommendation[];
}

export interface SelectPlanResponse {
  success: boolean;
  message: string;
  selectedPlan: string;
}
