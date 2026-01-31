/**
 * usePricingRecommendations Hook
 * Provides personalized pricing tier recommendations based on user's business profile
 */

import { useState, useEffect } from 'react';
import { BusinessTier, TierRecommendation } from '@/types/pricing';

interface UsePricingRecommendationsReturn {
  recommendation: TierRecommendation | null;
  hasPersonalizedRecommendation: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshRecommendation: () => Promise<void>;
}

/**
 * Hook to get personalized pricing recommendations
 * @returns Recommendation data and loading state
 */
export function usePricingRecommendations(): UsePricingRecommendationsReturn {
  const [recommendation, setRecommendation] = useState<TierRecommendation | null>(null);
  const [hasPersonalizedRecommendation, setHasPersonalizedRecommendation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchRecommendation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if user is authenticated and has business profile
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      
      if (!token) {
        // Not authenticated - return default recommendation
        setRecommendation({
          recommendedTier: BusinessTier.SMALL,
          confidence: 0.5,
          reasoning: ['Default recommendation for new businesses'],
          alternatives: [
            {
              tier: BusinessTier.MICRO,
              reason: 'Great for getting started with basic features'
            },
            {
              tier: BusinessTier.MEDIUM,
              reason: 'Better for growing businesses with more employees'
            }
          ]
        });
        setHasPersonalizedRecommendation(false);
        return;
      }

      // TODO: Replace with actual GraphQL query for recommendations
      // For now, return a mock personalized recommendation
      await new Promise(resolve => setTimeout(resolve, 500));

      setRecommendation({
        recommendedTier: BusinessTier.SMALL,
        confidence: 0.85,
        reasoning: [
          'Based on your team size',
          'Matches your feature requirements',
          'Fits your budget range'
        ],
        alternatives: [
          {
            tier: BusinessTier.MICRO,
            reason: 'Save money if you need fewer features',
            savings: 29
          },
          {
            tier: BusinessTier.MEDIUM,
            reason: 'Upgrade for more locations and advanced features'
          }
        ]
      });
      setHasPersonalizedRecommendation(true);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
      setHasPersonalizedRecommendation(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  return {
    recommendation,
    hasPersonalizedRecommendation,
    isLoading,
    error,
    refreshRecommendation: fetchRecommendation
  };
}

export default usePricingRecommendations;
