/**
 * Onboarding React Query Hooks
 * 
 * Provides cached, optimistic, and type-safe hooks for onboarding operations.
 * Integrates with React Query for automatic caching, refetching, and state management.
 * 
 * Features:
 * - Automatic caching for onboarding progress
 * - Optimistic updates for mutations
 * - Type-safe API calls
 * - Integration with Zustand store
 * 
 * Requirements: 11.1, 1.3, 5.5, 1.1, 13.1, 8.1
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/lib/api/services/onboarding.api';
import type {
  OnboardingData,
  OnboardingProgress,
  PlanTier,
} from '@/types/onboarding-api';

/**
 * Query key factory for onboarding-related queries
 * 
 * Provides standardized query keys for consistent cache management.
 */
export const onboardingQueryKeys = {
  all: ['onboarding'] as const,
  progress: () => [...onboardingQueryKeys.all, 'progress'] as const,
  recommendations: () => [...onboardingQueryKeys.all, 'recommendations'] as const,
} as const;

/**
 * Cache invalidation helpers for onboarding
 */
export const onboardingCacheInvalidation = {
  /**
   * Invalidate onboarding progress query
   */
  invalidateProgress: (queryClient: ReturnType<typeof useQueryClient>) => {
    return queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.progress() });
  },
  
  /**
   * Invalidate plan recommendations query
   */
  invalidateRecommendations: (queryClient: ReturnType<typeof useQueryClient>) => {
    return queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.recommendations() });
  },
  
  /**
   * Invalidate all onboarding queries
   */
  invalidateAll: (queryClient: ReturnType<typeof useQueryClient>) => {
    return queryClient.invalidateQueries({ queryKey: onboardingQueryKeys.all });
  },
};

/**
 * Query Hooks
 * 
 * These hooks fetch data from the backend and cache it using React Query.
 * They automatically handle loading states, errors, and refetching.
 */

/**
 * Fetch current onboarding progress with caching
 * 
 * Retrieves the user's current onboarding progress including all saved data,
 * completed steps, and completion status. Data is cached for 5 minutes.
 * 
 * @returns Query result with onboarding progress data
 * 
 * Requirements: 1.3
 * 
 * @example
 * ```tsx
 * const { data: progress, isLoading, error } = useOnboardingProgress();
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (progress) {
 *   // Use progress.data, progress.completedSteps, etc.
 * }
 * ```
 */
export function useOnboardingProgress() {
  return useQuery({
    queryKey: onboardingQueryKeys.progress(),
    queryFn: async () => {
      const response = await onboardingApi.getProgress();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - progress doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: true, // Refetch when component mounts
  });
}

/**
 * Fetch plan recommendations with caching
 * 
 * Analyzes the user's onboarding data and returns personalized plan
 * recommendations with confidence scores, reasoning, and alternatives.
 * Data is cached for 10 minutes since recommendations are computationally expensive.
 * 
 * @returns Query result with plan recommendations
 * 
 * Requirements: 5.5
 * 
 * @example
 * ```tsx
 * const { data: recommendations, isLoading, error } = usePlanRecommendations();
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 * if (recommendations) {
 *   const recommended = recommendations[0]; // First is the recommended plan
 *   const alternatives = recommendations.slice(1);
 * }
 * ```
 */
export function usePlanRecommendations() {
  return useQuery({
    queryKey: onboardingQueryKeys.recommendations(),
    queryFn: async () => {
      const response = await onboardingApi.recommendPlan();
      return response.data.recommendations;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - recommendations are expensive to compute
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false, // Don't refetch on focus (expensive operation)
    refetchOnMount: false, // Don't refetch on mount (expensive operation)
    enabled: true, // Can be controlled by caller if needed
  });
}

/**
 * Mutation Hooks
 * 
 * These hooks perform data mutations (create, update, delete) and automatically
 * update the cache with optimistic updates for better UX.
 */

/**
 * Save onboarding progress mutation
 * 
 * Saves partial onboarding data to the backend. The backend merges the new data
 * with existing data, preserving previously saved steps. Uses optimistic updates
 * to immediately reflect changes in the UI.
 * 
 * @returns Mutation object with mutate function and state
 * 
 * Requirements: 1.1
 * 
 * @example
 * ```tsx
 * const saveProgress = useSaveProgress();
 * 
 * const handleSubmit = async (data) => {
 *   try {
 *     await saveProgress.mutateAsync({ businessInfo: data });
 *     // Navigate to next step
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export function useSaveProgress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<OnboardingData>) => {
      const response = await onboardingApi.saveProgress(data);
      return response.data.data;
    },
    
    // Optimistic update: immediately update cache before server responds
    onMutate: async (newData) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: onboardingQueryKeys.progress() });

      // Snapshot the previous value
      const previousProgress = queryClient.getQueryData<OnboardingProgress | null>(
        onboardingQueryKeys.progress()
      );

      // Optimistically update the cache
      if (previousProgress) {
        queryClient.setQueryData<OnboardingProgress>(
          onboardingQueryKeys.progress(),
          {
            ...previousProgress,
            data: {
              ...previousProgress.data,
              ...newData,
            },
            lastUpdatedAt: new Date(),
          }
        );
      }

      // Return context with previous value for rollback
      return { previousProgress };
    },
    
    // On success, update cache with server response
    onSuccess: (_data) => {
      // Invalidate progress to refetch with latest data
      onboardingCacheInvalidation.invalidateProgress(queryClient);
      
      // Invalidate recommendations since data changed
      onboardingCacheInvalidation.invalidateRecommendations(queryClient);
    },
    
    // On error, rollback to previous value
    onError: (_error, _newData, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(
          onboardingQueryKeys.progress(),
          context.previousProgress
        );
      }
    },
  });
}

/**
 * Complete onboarding mutation
 * 
 * Marks the onboarding process as complete and sets the completion timestamp.
 * Invalidates all onboarding-related caches after completion.
 * 
 * @returns Mutation object with mutate function and state
 * 
 * Requirements: 13.1
 * 
 * @example
 * ```tsx
 * const completeOnboarding = useCompleteOnboarding();
 * 
 * const handleComplete = async () => {
 *   try {
 *     await completeOnboarding.mutateAsync();
 *     // Redirect to dashboard
 *     router.push('/dashboard');
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await onboardingApi.completeOnboarding();
      return response.data;
    },
    
    // Optimistic update: mark as complete immediately
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: onboardingQueryKeys.progress() });

      const previousProgress = queryClient.getQueryData<OnboardingProgress | null>(
        onboardingQueryKeys.progress()
      );

      if (previousProgress) {
        queryClient.setQueryData<OnboardingProgress>(
          onboardingQueryKeys.progress(),
          {
            ...previousProgress,
            onboardingCompleted: true,
            completedAt: new Date(),
          }
        );
      }

      return { previousProgress };
    },
    
    onSuccess: () => {
      // Invalidate all onboarding queries
      onboardingCacheInvalidation.invalidateAll(queryClient);
    },
    
    onError: (_error, _variables, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(
          onboardingQueryKeys.progress(),
          context.previousProgress
        );
      }
    },
  });
}

/**
 * Select plan mutation
 * 
 * Updates the organization's subscription plan and limits based on the selected tier.
 * Invalidates progress cache to reflect updated organization data.
 * 
 * @returns Mutation object with mutate function and state
 * 
 * Requirements: 8.1
 * 
 * @example
 * ```tsx
 * const selectPlan = useSelectPlan();
 * 
 * const handleSelectPlan = async (tier: PlanTier) => {
 *   try {
 *     await selectPlan.mutateAsync(tier);
 *     // Show success message and navigate
 *   } catch (error) {
 *     // Handle error
 *   }
 * };
 * ```
 */
export function useSelectPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planTier: PlanTier) => {
      const response = await onboardingApi.selectPlan(planTier);
      return response.data;
    },
    
    // Optimistic update: update recommended plan in cache
    onMutate: async (planTier) => {
      await queryClient.cancelQueries({ queryKey: onboardingQueryKeys.progress() });

      const previousProgress = queryClient.getQueryData<OnboardingProgress | null>(
        onboardingQueryKeys.progress()
      );

      if (previousProgress) {
        queryClient.setQueryData<OnboardingProgress>(
          onboardingQueryKeys.progress(),
          {
            ...previousProgress,
            data: {
              ...previousProgress.data,
              recommendedPlan: planTier,
            },
          }
        );
      }

      return { previousProgress };
    },
    
    onSuccess: () => {
      // Invalidate progress to get updated organization limits
      onboardingCacheInvalidation.invalidateProgress(queryClient);
    },
    
    onError: (_error, _variables, context) => {
      if (context?.previousProgress) {
        queryClient.setQueryData(
          onboardingQueryKeys.progress(),
          context.previousProgress
        );
      }
    },
  });
}
