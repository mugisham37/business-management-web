/**
 * Pricing Types
 * 
 * Type definitions for pricing and subscription management
 */

export enum BusinessTier {
  MICRO = 'MICRO',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
  CUSTOM = 'CUSTOM',
}

export interface TierFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: number | string;
}

export interface TierLimits {
  maxEmployees: number;
  maxLocations: number;
  storageGB: number;
  apiCallsPerMonth?: number;
  maxProducts?: number;
  maxCustomers?: number;
}

export interface TierConfig {
  tier: BusinessTier;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: TierFeature[];
  limits: TierLimits;
  isRecommended?: boolean;
  isPopular?: boolean;
  trialDays?: number;
}

export interface SubscriptionPlan {
  name: string;
  tier: BusinessTier;
  price: string | { monthly: string; annually: string };
  description: string;
  capacity: string[];
  features: string[];
  allFeatures: TierFeature[];
  isStarter: boolean;
  isRecommended: boolean;
  isPopular: boolean;
  buttonText: string;
  buttonLink: string;
  trialDays?: number;
  limits: TierLimits;
}

export interface SubscriptionState {
  currentTier: BusinessTier;
  billingCycle: 'monthly' | 'annually';
  expiresAt?: Date | undefined;
  trialEndsAt?: Date | undefined;
  isActive: boolean;
  isTrial: boolean;
  autoRenew: boolean;
}

export interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTier: BusinessTier;
  billingCycle: 'monthly' | 'annually';
  onComplete: (subscription: SubscriptionState) => void;
}
