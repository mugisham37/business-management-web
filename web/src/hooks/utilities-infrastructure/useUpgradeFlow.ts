/**
 * Upgrade Flow Hook
 * Manages tier upgrade process with payment integration
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  UPDATE_TIER_MUTATION,
  PROCESS_PAYMENT_MUTATION,
} from '@/graphql/mutations/auth-complete';
import {
  GET_UPGRADE_RECOMMENDATIONS_QUERY,
  GET_SUBSCRIPTION_STATUS_QUERY,
} from '@/graphql/queries/auth-complete';
import { useAuth } from '@/hooks/authentication/useAuth';
import { useTenantStore } from '@/lib/stores/tenant-store';

export interface UpgradeRequest {
  targetTier: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethod: 'card' | 'paypal';
  featureId?: string;
  promoCode?: string;
}

export interface UpgradeRecommendation {
  tier: string;
  reason: string;
  features: string[];
  savings?: number;
  priority: 'low' | 'medium' | 'high';
}

export interface PricingInfo {
  basePrice: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
}

export interface UseUpgradeFlowReturn {
  isLoading: boolean;
  error: string | null;
  
  // Modal control
  isUpgradeModalOpen: boolean;
  openUpgradeModal: (targetTier?: string, featureId?: string) => void;
  closeUpgradeModal: () => void;
  
  // Upgrade process
  processUpgrade: (request: UpgradeRequest) => Promise<boolean>;
  calculateUpgradePrice: (currentTier: string, targetTier: string, billingCycle: 'monthly' | 'yearly') => number;
  
  // Recommendations
  getUpgradeRecommendations: () => UpgradeRecommendation[];
  shouldRecommendUpgrade: (featureId: string) => boolean;
  
  // Pricing
  getPricingInfo: (tier: string, billingCycle: 'monthly' | 'yearly', promoCode?: string) => Promise<PricingInfo | null>;
  validatePromoCode: (code: string) => Promise<boolean>;
  
  // Utility
  canDowngrade: (targetTier: string) => boolean;
  getFeatureRequiredTier: (featureId: string) => string | null;
}

const TIER_PRICING = {
  micro: { monthly: 0, yearly: 0 },
  small: { monthly: 29, yearly: 290 },
  medium: { monthly: 79, yearly: 790 },
  enterprise: { monthly: 199, yearly: 1990 },
};

const TIER_ORDER = ['micro', 'small', 'medium', 'enterprise'];

const FEATURE_TIER_REQUIREMENTS: Record<string, string> = {
  'advanced-analytics': 'medium',
  'multi-location': 'small',
  'api-access': 'medium',
  'custom-integrations': 'enterprise',
  'dedicated-support': 'enterprise',
  'advanced-reporting': 'medium',
  'inventory-forecasting': 'medium',
  'crm-integration': 'small',
  'employee-management': 'small',
  'loyalty-programs': 'medium',
  'advanced-pos': 'small',
  'warehouse-management': 'medium',
  'b2b-features': 'enterprise',
  'white-labeling': 'enterprise',
};

export function useUpgradeFlow(): UseUpgradeFlowReturn {
  const { user } = useAuth();
  const { businessTier } = useTenantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [_selectedTargetTier, setSelectedTargetTier] = useState<string | null>(null);
  const [_selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null);

  // GraphQL operations
  const [updateTierMutation] = useMutation(UPDATE_TIER_MUTATION);
  const [processPaymentMutation] = useMutation(PROCESS_PAYMENT_MUTATION);

  const { data: recommendationsData } = useQuery(GET_UPGRADE_RECOMMENDATIONS_QUERY, {
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  // Subscription status query - available for future use
  useQuery(GET_SUBSCRIPTION_STATUS_QUERY, {
    skip: !user?.id,
    fetchPolicy: 'cache-and-network',
  });

  const getPricingInfo = useCallback(async (
    tier: string,
    billingCycle: 'monthly' | 'yearly',
    promoCode?: string
  ): Promise<PricingInfo | null> => {
    try {
      const basePrice = TIER_PRICING[tier as keyof typeof TIER_PRICING]?.[billingCycle] || 0;
      
      // Calculate discount (simplified - in production, this would be server-side)
      let discount = 0;
      if (promoCode) {
        // Mock promo code validation
        if (promoCode === 'SAVE10') {
          discount = basePrice * 0.1;
        } else if (promoCode === 'SAVE20') {
          discount = basePrice * 0.2;
        }
      }

      // Calculate tax (simplified - in production, this would be based on location)
      const tax = (basePrice - discount) * 0.08; // 8% tax rate

      const total = basePrice - discount + tax;

      return {
        basePrice,
        discount,
        tax,
        total,
        currency: 'USD',
      };
    } catch (error) {
      console.error('Failed to calculate pricing:', error);
      return null;
    }
  }, []);

  const processUpgrade = useCallback(async (request: UpgradeRequest): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Calculate pricing
      const pricing = await getPricingInfo(request.targetTier, request.billingCycle, request.promoCode);
      if (!pricing) {
        throw new Error('Failed to calculate pricing');
      }

      // Process payment if required
      if (pricing.total > 0) {
        const paymentResult = await processPaymentMutation({
          variables: {
            input: {
              amount: pricing.total,
              currency: pricing.currency,
              paymentMethod: request.paymentMethod,
              description: `Upgrade to ${request.targetTier} (${request.billingCycle})`,
              metadata: {
                userId: user.id,
                targetTier: request.targetTier,
                billingCycle: request.billingCycle,
                featureId: request.featureId,
              },
            },
          },
        });

        if (!paymentResult.data?.processPayment?.success) {
          throw new Error(paymentResult.data?.processPayment?.message || 'Payment failed');
        }
      }

      // Update user tier
      const tierResult = await updateTierMutation({
        variables: {
          input: {
            targetTier: request.targetTier,
            billingCycle: request.billingCycle,
            paymentId: pricing.total > 0 ? 'payment_id_from_above' : undefined,
          },
        },
      });

      if (!tierResult.data?.updateTier?.success) {
        throw new Error(tierResult.data?.updateTier?.message || 'Tier update failed');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upgrade failed';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, processPaymentMutation, updateTierMutation, getPricingInfo]);

  const calculateUpgradePrice = useCallback((
    currentTier: string,
    targetTier: string,
    billingCycle: 'monthly' | 'yearly'
  ): number => {
    const currentPrice = TIER_PRICING[currentTier as keyof typeof TIER_PRICING]?.[billingCycle] || 0;
    const targetPrice = TIER_PRICING[targetTier as keyof typeof TIER_PRICING]?.[billingCycle] || 0;
    
    return Math.max(0, targetPrice - currentPrice);
  }, []);

  const getUpgradeRecommendations = useCallback((): UpgradeRecommendation[] => {
    if (!user || !recommendationsData?.getUpgradeRecommendations) {
      return [];
    }

    return recommendationsData.getUpgradeRecommendations;
  }, [user, recommendationsData]);

  const shouldRecommendUpgrade = useCallback((featureId: string): boolean => {
    const requiredTier = FEATURE_TIER_REQUIREMENTS[featureId];
    if (!requiredTier || !businessTier) {
      return false;
    }

    const currentTierIndex = TIER_ORDER.indexOf(businessTier);
    const requiredTierIndex = TIER_ORDER.indexOf(requiredTier);

    return requiredTierIndex > currentTierIndex;
  }, [businessTier]);

  const validatePromoCode = useCallback(async (code: string): Promise<boolean> => {
    // Mock validation - in production, this would be a server call
    const validCodes = ['SAVE10', 'SAVE20', 'WELCOME', 'UPGRADE50'];
    return validCodes.includes(code.toUpperCase());
  }, []);

  const canDowngrade = useCallback((targetTier: string): boolean => {
    if (!businessTier) return false;

    const currentTierIndex = TIER_ORDER.indexOf(businessTier);
    const targetTierIndex = TIER_ORDER.indexOf(targetTier);

    // Allow downgrade only if not in a contract or if contract allows it
    // This is simplified - in production, you'd check subscription terms
    return targetTierIndex < currentTierIndex;
  }, [businessTier]);

  const getFeatureRequiredTier = useCallback((featureId: string): string | null => {
    return FEATURE_TIER_REQUIREMENTS[featureId] || null;
  }, []);

  const openUpgradeModal = useCallback((targetTier?: string, featureId?: string) => {
    setSelectedTargetTier(targetTier || null);
    setSelectedFeatureId(featureId || null);
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
    setSelectedTargetTier(null);
    setSelectedFeatureId(null);
  }, []);

  return {
    isLoading,
    error,
    isUpgradeModalOpen,
    openUpgradeModal,
    closeUpgradeModal,
    processUpgrade,
    calculateUpgradePrice,
    getUpgradeRecommendations,
    shouldRecommendUpgrade,
    getPricingInfo,
    validatePromoCode,
    canDowngrade,
    getFeatureRequiredTier,
  };
}