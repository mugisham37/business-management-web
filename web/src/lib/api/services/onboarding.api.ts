/**
 * Onboarding API Service
 * 
 * Provides typed functions for all onboarding endpoints with retry logic,
 * timeout configuration, and error handling.
 * 
 * Endpoints:
 * - POST /onboarding/progress - Save onboarding step progress
 * - GET /onboarding/progress - Get current onboarding progress
 * - POST /onboarding/complete - Mark onboarding as complete
 * - POST /onboarding/recommend-plan - Get plan recommendations
 * - POST /onboarding/select-plan - Select a subscription plan
 * 
 * Features:
 * - Automatic authentication token attachment via interceptors
 * - Retry logic for transient failures (network errors, 5xx responses)
 * - 10-second timeout for all requests
 * - Type-safe request/response handling
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  OnboardingData,
  OnboardingProgress,
  PlanRecommendation,
  PlanTier,
} from '@/types/onboarding-api';
import type { ApiResponse } from '@/types/api/responses';

/**
 * Request/Response types for onboarding endpoints
 */

export interface SaveProgressRequest {
  data: Partial<OnboardingData>;
}

export interface SaveProgressResponse {
  success: boolean;
  data: OnboardingData;
  message?: string;
}

export interface GetProgressResponse {
  success: boolean;
  data: OnboardingProgress | null;
}

export interface CompleteOnboardingResponse {
  success: boolean;
  message: string;
}

export interface RecommendPlanResponse {
  success: boolean;
  recommendations: PlanRecommendation[];
}

export interface SelectPlanRequest {
  planTier: PlanTier;
}

export interface SelectPlanResponse {
  success: boolean;
  message: string;
}

/**
 * Onboarding API client
 * 
 * All methods automatically include:
 * - Authentication token (via request interceptor)
 * - Retry logic for transient failures (via response interceptor)
 * - 10-second timeout (configured in apiClient)
 * - Error handling and transformation
 */
export const onboardingApi = {
  /**
   * Save progress for current onboarding step
   * POST /onboarding/progress
   * 
   * Saves partial onboarding data to the backend. The backend merges
   * the new data with existing data, preserving previously saved steps.
   * 
   * @param data - Partial onboarding data to save
   * @returns Promise resolving to the complete updated onboarding data
   * 
   * Requirements: 1.1, 11.2
   */
  saveProgress: (data: Partial<OnboardingData>) =>
    apiClient.post<SaveProgressResponse>(
      API_ENDPOINTS.ONBOARDING.SAVE_PROGRESS,
      { data }
    ),

  /**
   * Get current onboarding progress
   * GET /onboarding/progress
   * 
   * Retrieves the user's current onboarding progress including all
   * saved data, completed steps, and completion status.
   * 
   * @returns Promise resolving to onboarding progress or null if not started
   * 
   * Requirements: 1.3, 11.2
   */
  getProgress: () =>
    apiClient.get<GetProgressResponse>(
      API_ENDPOINTS.ONBOARDING.GET_PROGRESS
    ),

  /**
   * Mark onboarding as complete
   * POST /onboarding/complete
   * 
   * Marks the onboarding process as complete and sets the completion
   * timestamp in the database.
   * 
   * @returns Promise resolving to success confirmation
   * 
   * Requirements: 13.1, 11.2
   */
  completeOnboarding: () =>
    apiClient.post<CompleteOnboardingResponse>(
      API_ENDPOINTS.ONBOARDING.COMPLETE
    ),

  /**
   * Get plan recommendations based on onboarding data
   * POST /onboarding/recommend-plan
   * 
   * Analyzes the user's onboarding data and returns personalized
   * plan recommendations with confidence scores, reasoning, and
   * alternative options.
   * 
   * @returns Promise resolving to array of plan recommendations
   * 
   * Requirements: 5.5, 11.2
   */
  recommendPlan: () =>
    apiClient.post<RecommendPlanResponse>(
      API_ENDPOINTS.ONBOARDING.RECOMMEND_PLAN
    ),

  /**
   * Select a subscription plan
   * POST /onboarding/select-plan
   * 
   * Updates the organization's subscription plan and limits based
   * on the selected tier.
   * 
   * @param planTier - The plan tier to select
   * @returns Promise resolving to success confirmation
   * 
   * Requirements: 8.1, 11.2
   */
  selectPlan: (planTier: PlanTier) =>
    apiClient.post<SelectPlanResponse>(
      API_ENDPOINTS.ONBOARDING.SELECT_PLAN,
      { planTier }
    ),
};
