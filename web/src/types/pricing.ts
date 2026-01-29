export interface BusinessTierConfig {
  tier: BusinessTier;
  displayName: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: TierFeature[];
  limits: TierLimits;
  trialDays: number;
  isRecommended?: boolean;
  isPopular?: boolean;
}

export interface TierFeature {
  id: string;
  name: string;
  description?: string;
  included: boolean;
  limit?: string | number;
  tooltip?: string;
}

export interface TierLimits {
  maxEmployees?: number;
  maxLocations?: number;
  maxTransactions?: number;
  maxApiCalls?: number;
  storageGB?: number;
}

export enum BusinessTier {
  MICRO = 'micro',
  SMALL = 'small', 
  MEDIUM = 'medium',
  ENTERPRISE = 'enterprise',
}

export interface TierRecommendation {
  recommendedTier: BusinessTier;
  confidence: number;
  reasoning: string[];
  alternatives: {
    tier: BusinessTier;
    reason: string;
    savings?: number;
  }[];
}

export interface PricingPageProps {
  showRecommendations?: boolean;
  onboardingData?: Record<string, unknown>;
  onPlanSelect?: (tier: BusinessTier) => void;
}