'use client';

import { BusinessTier } from '@/types/pricing';

export interface SubscriptionPlan {
  tier: BusinessTier;
  billingCycle: 'monthly' | 'annually';
  trialDays?: number;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  trialEndsAt?: Date;
  error?: string;
}

/**
 * Service for handling subscription operations
 */
export class SubscriptionService {
  /**
   * Initiate subscription process for a selected plan
   */
  static async initializeSubscription(plan: SubscriptionPlan): Promise<SubscriptionResult> {
    try {
      // In a real implementation, this would call the backend API
      // For now, we'll simulate the subscription process
      
      console.log('Initializing subscription for:', plan);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful subscription creation
      const subscriptionId = `sub_${Date.now()}`;
      const trialEndsAt = plan.trialDays ? 
        new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000) : 
        undefined;
      
      const result: SubscriptionResult = {
        success: true,
        subscriptionId,
      };

      if (trialEndsAt) {
        result.trialEndsAt = trialEndsAt;
      }
      
      return result;
    } catch (error) {
      console.error('Subscription initialization failed:', error);
      return {
        success: false,
        error: 'Failed to initialize subscription. Please try again.',
      };
    }
  }

  /**
   * Check if user has an active subscription
   */
  static async getActiveSubscription(): Promise<{
    hasSubscription: boolean;
    tier?: BusinessTier;
    isTrialActive?: boolean;
    trialEndsAt?: Date;
  }> {
    try {
      // In a real implementation, this would fetch from the backend
      // For now, we'll return a default state
      return {
        hasSubscription: false,
      };
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
      return {
        hasSubscription: false,
      };
    }
  }

  /**
   * Generate subscription URL for external payment processing
   */
  static generateSubscriptionUrl(plan: SubscriptionPlan): string {
    // In a real implementation, this would generate a URL to your payment processor
    // (Stripe, PayPal, etc.) with the appropriate plan parameters
    
    const baseUrl = '/subscribe';
    const params = new URLSearchParams({
      tier: plan.tier,
      billing: plan.billingCycle,
      ...(plan.trialDays && { trial: plan.trialDays.toString() }),
    });
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Calculate prorated pricing for plan changes
   */
  static calculateProratedPrice(
    currentTier: BusinessTier,
    newTier: BusinessTier,
    billingCycle: 'monthly' | 'annually',
    daysRemaining: number
  ): {
    proratedAmount: number;
    nextBillingAmount: number;
    description: string;
  } {
    const prices = {
      [BusinessTier.MICRO]: { monthly: 0, annually: 0 },
      [BusinessTier.SMALL]: { monthly: 49, annually: 39 },
      [BusinessTier.MEDIUM]: { monthly: 99, annually: 79 },
      [BusinessTier.ENTERPRISE]: { monthly: 199, annually: 159 },
    };

    const currentPrice = prices[currentTier][billingCycle];
    const newPrice = prices[newTier][billingCycle];
    const priceDifference = newPrice - currentPrice;
    
    // Calculate prorated amount based on days remaining in current billing cycle
    const daysInCycle = billingCycle === 'monthly' ? 30 : 365;
    const proratedAmount = Math.max(0, (priceDifference * daysRemaining) / daysInCycle);
    
    let description = '';
    if (proratedAmount > 0) {
      description = `Prorated charge of $${proratedAmount.toFixed(2)} for the remaining ${daysRemaining} days`;
    } else {
      description = 'No additional charge for the current billing period';
    }

    return {
      proratedAmount: Math.round(proratedAmount * 100) / 100,
      nextBillingAmount: newPrice,
      description,
    };
  }
}