// Shared TypeScript types for onboarding system API
// These types match the backend definitions to ensure type safety across the stack

// ============================================================================
// Type Aliases
// ============================================================================

export type PlanTier = 'Starter' | 'Professional' | 'Business' | 'Enterprise';

export type BusinessType = 
  | 'Retail' 
  | 'Wholesale' 
  | 'Manufacturing' 
  | 'Service' 
  | 'E-commerce' 
  | 'Hybrid';

export type CloudProvider = 'aws' | 'azure';

export type GrowthProjection = 'None' | '2x' | '5x' | '10x+';

export type GeographicSpread = 
  | 'Single city' 
  | 'Multiple cities' 
  | 'Regional' 
  | 'National' 
  | 'International';

export type LocationType = 
  | 'Retail stores' 
  | 'Warehouses' 
  | 'Offices' 
  | 'Manufacturing' 
  | 'Pop-up/Mobile';

export type ComplianceRequirement = 'GDPR' | 'HIPAA' | 'PCI-DSS' | 'SOC 2';

export type TransactionVolume = 
  | 'Low (<1k/month)' 
  | 'Medium (1k-50k/month)' 
  | 'High (50k-500k/month)' 
  | 'Enterprise (500k+/month)';

export type OnboardingStep = 
  | 'welcome' 
  | 'business-info' 
  | 'products' 
  | 'team-size' 
  | 'locations' 
  | 'infrastructure' 
  | 'integrations' 
  | 'plan-recommendation' 
  | 'payment';

// ============================================================================
// Core Data Interfaces
// ============================================================================

export interface BusinessInfo {
  businessName: string;
  industry: string;
  businessType: BusinessType;
  country: string;
  registrationNumber?: string;
  website?: string;
}

export interface ProductFeatures {
  selectedFeatures: string[];
}

export interface TeamSize {
  current: number;
  growthProjection: GrowthProjection;
}

export interface LocationsData {
  multiLocation: boolean;
  count?: number;
  types?: LocationType[];
  geographicSpread?: GeographicSpread;
}

export interface InfrastructureData {
  provider: CloudProvider;
  storage: number;
  region: string;
  compliance: ComplianceRequirement[];
  dataResidency?: string[];
  transactionVolume: TransactionVolume;
}

export interface IntegrationsData {
  selectedIntegrations: string[];
}

// ============================================================================
// Onboarding Data Structure
// ============================================================================

export interface OnboardingData {
  businessInfo?: BusinessInfo;
  features?: ProductFeatures;
  teamSize?: TeamSize;
  locations?: LocationsData;
  infrastructure?: InfrastructureData;
  integrations?: IntegrationsData;
  recommendedPlan?: PlanTier;
}

// ============================================================================
// Progress Tracking
// ============================================================================

export interface OnboardingProgress {
  organizationId: string;
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  data: OnboardingData;
  onboardingCompleted: boolean;
  startedAt: Date;
  lastUpdatedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// Plan Recommendation
// ============================================================================

export interface PlanRecommendation {
  tier: PlanTier;
  score: number;
  confidence: number;
  reasons: string[];
  monthlyPrice: number;
  features: string[];
  limits: {
    maxUsers: number;
    maxLocations: number;
  };
  alternatives?: {
    tier: PlanTier;
    reason: string;
  }[];
}

// ============================================================================
// Plan Definition (Backend Only - included for reference)
// ============================================================================

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  maxUsers: number;
  maxLocations: number;
  features: string[];
  targetSegments: {
    teamSizeMin: number;
    teamSizeMax: number;
    locationCountMin: number;
    locationCountMax: number;
    featureComplexity: 'basic' | 'intermediate' | 'advanced' | 'enterprise';
  };
}
