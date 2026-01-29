'use client';

import { useMemo } from 'react';
import { TierRecommendation } from '@/types/pricing';
import { RecommendationEngine } from '@/lib/services/recommendation-engine';
import { useOnboardingStatus } from '@/hooks/useOnboarding';

/**
 * Hook for getting AI-powered pricing recommendations
 */
export function usePricingRecommendations() {
  const { isComplete, loading: onboardingLoading } = useOnboardingStatus();

  // Get onboarding data (this would typically come from a separate hook or context)
  // For now, we'll simulate this data
  const onboardingData = useMemo(() => {
    // In a real implementation, this would come from the onboarding service
    // For demo purposes, we'll return null to trigger fallback recommendation
    return null;
  }, []);

  const recommendation: TierRecommendation = useMemo(() => {
    if (onboardingData) {
      return RecommendationEngine.calculateRecommendation(onboardingData);
    }
    return RecommendationEngine.getFallbackRecommendation();
  }, [onboardingData]);

  const hasPersonalizedRecommendation = useMemo(() => {
    return onboardingData !== null && isComplete;
  }, [onboardingData, isComplete]);

  return {
    recommendation,
    hasPersonalizedRecommendation,
    isLoading: onboardingLoading,
    onboardingCompleted: isComplete,
  };
}

export default usePricingRecommendations;