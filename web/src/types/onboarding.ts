/**
 * Onboarding Types
 * 
 * Centralized type definitions for the onboarding system.
 * These types are used across services for business profile setup,
 * tier assignment, and plan selection workflows.
 */

/**
 * Onboarding step enum - represents the 5-step onboarding process
 * Used as values in workflow logic
 */
export enum OnboardingStep {
  BUSINESS_PROFILE = 'business_profile',
  BUSINESS_TYPE = 'business_type',
  USAGE_EXPECTATIONS = 'usage_expectations',
  PLAN_SELECTION = 'plan_selection',
  WELCOME = 'welcome',
}

/**
 * Business tier enum - represents subscription tiers
 * Must match the tiers defined in the pricing system
 */
export enum BusinessTier {
  MICRO = 'MICRO',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  ENTERPRISE = 'ENTERPRISE',
}

/**
 * Business type enum - represents different business categories
 */
export enum BusinessType {
  FREE = 'free',
  RETAIL = 'retail',
  RENEWABLES = 'renewables',
  WHOLESALE = 'wholesale',
  SERVICE = 'service',
  MANUFACTURING = 'manufacturing',
  HOSPITALITY = 'hospitality',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  NONPROFIT = 'nonprofit',
  INDUSTRY = 'industry',
  OTHER = 'other',
}

/**
 * Business size enum
 */
export enum BusinessSize {
  SOLO = 'solo',
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  ENTERPRISE = 'enterprise',
}

/**
 * Onboarding status enum
 */
export enum OnboardingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  FAILED = 'failed',
}

/**
 * Onboarding data interface - stores all data collected during onboarding
 */
export interface OnboardingData {
  // Business profile (Step 1)
  businessName?: string;
  businessIndustry?: string;
  businessSize?: BusinessSize | string;
  
  // Business type (Step 2)
  businessType?: BusinessType;
  
  // Usage expectations (Step 3)
  expectedEmployees?: number;
  expectedLocations?: number;
  expectedMonthlyTransactions?: number;
  expectedMonthlyRevenue?: number;
  
  // Plan selection (Step 4)
  selectedPlan?: BusinessTier;
  recommendedPlan?: BusinessTier;
  
  // Additional metadata
  [key: string]: unknown;
}

/**
 * Workflow state interface - tracks onboarding progress
 */
export interface WorkflowState {
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  availableSteps: OnboardingStep[];
  canProceed: boolean;
  validationErrors: string[];
  lastUpdated: Date;
  sessionId: string;
}

/**
 * Plan features interface - describes features available in each plan
 */
export interface PlanFeatures {
  tier: BusinessTier;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  limits: PlanLimits;
  isPopular?: boolean;
  isRecommended?: boolean;
}

/**
 * Plan limits interface
 */
export interface PlanLimits {
  employees: number;
  locations: number;
  transactions: number;
  storage: number;
  apiCalls: number;
}

/**
 * Tier recommendation result interface
 */
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

/**
 * Onboarding step configuration
 */
export interface OnboardingStepConfig {
  id: OnboardingStep;
  title: string;
  description: string;
  isRequired: boolean;
  order: number;
  estimatedTime: number; // in minutes
}

/**
 * All onboarding steps configuration
 */
export const ONBOARDING_STEPS: OnboardingStepConfig[] = [
  {
    id: OnboardingStep.BUSINESS_PROFILE,
    title: 'Business Profile',
    description: 'Tell us about your business',
    isRequired: true,
    order: 1,
    estimatedTime: 3,
  },
  {
    id: OnboardingStep.BUSINESS_TYPE,
    title: 'Business Type',
    description: 'What type of business do you operate?',
    isRequired: true,
    order: 2,
    estimatedTime: 2,
  },
  {
    id: OnboardingStep.USAGE_EXPECTATIONS,
    title: 'Usage Expectations',
    description: 'Help us understand your expected usage',
    isRequired: true,
    order: 3,
    estimatedTime: 4,
  },
  {
    id: OnboardingStep.PLAN_SELECTION,
    title: 'Plan Selection',
    description: 'Choose your subscription plan',
    isRequired: true,
    order: 4,
    estimatedTime: 3,
  },
  {
    id: OnboardingStep.WELCOME,
    title: 'Welcome',
    description: 'Welcome to your new business platform',
    isRequired: false,
    order: 5,
    estimatedTime: 1,
  },
];

/**
 * Helper function to get step by index
 */
export function getStepByIndex(index: number): OnboardingStep {
  const steps = [
    OnboardingStep.BUSINESS_PROFILE,
    OnboardingStep.BUSINESS_TYPE,
    OnboardingStep.USAGE_EXPECTATIONS,
    OnboardingStep.PLAN_SELECTION,
    OnboardingStep.WELCOME,
  ];
  return steps[index] ?? OnboardingStep.BUSINESS_PROFILE;
}

/**
 * Helper function to get step index
 */
export function getStepIndex(step: OnboardingStep): number {
  const steps = [
    OnboardingStep.BUSINESS_PROFILE,
    OnboardingStep.BUSINESS_TYPE,
    OnboardingStep.USAGE_EXPECTATIONS,
    OnboardingStep.PLAN_SELECTION,
    OnboardingStep.WELCOME,
  ];
  return steps.indexOf(step);
}

/**
 * Helper function to get all tier values
 */
export function getAllTiers(): BusinessTier[] {
  return [
    BusinessTier.MICRO,
    BusinessTier.SMALL,
    BusinessTier.MEDIUM,
    BusinessTier.ENTERPRISE,
  ];
}

/**
 * Helper function to get all business types
 */
export function getAllBusinessTypes(): BusinessType[] {
  return Object.values(BusinessType);
}
