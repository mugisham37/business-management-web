import { gql } from '@apollo/client';

/**
 * Onboarding GraphQL Operations
 */

// Get onboarding status for current tenant
export const GET_ONBOARDING_STATUS = gql`
  query MyOnboardingStatus {
    myOnboardingStatus {
      tenantId
      completionPercentage
      currentStep
      completedSteps
      pendingSteps
      isComplete
      onboardingData {
        businessName
        businessIndustry
        businessSize
        businessType
        expectedEmployees
        expectedLocations
        expectedMonthlyTransactions
        expectedMonthlyRevenue
        selectedPlan
        recommendedPlan
      }
      recommendedPlan
      completedAt
    }
  }
`;

// Get all available plans
export const GET_AVAILABLE_PLANS = gql`
  query AvailablePlans {
    availablePlans {
      name
      description
      features
      limits {
        employees
        locations
        transactions
      }
      price {
        monthly
        annually
      }
    }
  }
`;

// Get features for a specific plan
export const GET_PLAN_FEATURES = gql`
  query PlanFeatures($tier: BusinessTier!) {
    planFeatures(tier: $tier) {
      name
      description
      features
      limits {
        employees
        locations
        transactions
      }
      price {
        monthly
        annually
      }
    }
  }
`;

// Update onboarding step with data
export const UPDATE_ONBOARDING_STEP = gql`
  mutation UpdateOnboardingStep($input: UpdateOnboardingStepInput!) {
    updateOnboardingStep(input: $input) {
      tenantId
      completionPercentage
      currentStep
      completedSteps
      pendingSteps
      isComplete
      onboardingData {
        businessName
        businessIndustry
        businessSize
        businessType
        expectedEmployees
        expectedLocations
        expectedMonthlyTransactions
        expectedMonthlyRevenue
        selectedPlan
        recommendedPlan
      }
      recommendedPlan
      completedAt
    }
  }
`;

// Complete onboarding with optional plan selection
export const COMPLETE_ONBOARDING = gql`
  mutation CompleteOnboarding($input: CompleteOnboardingInput) {
    completeOnboarding(input: $input) {
      tenantId
      completionPercentage
      currentStep
      completedSteps
      pendingSteps
      isComplete
      onboardingData {
        businessName
        businessIndustry
        businessSize
        businessType
        expectedEmployees
        expectedLocations
        expectedMonthlyTransactions
        expectedMonthlyRevenue
        selectedPlan
        recommendedPlan
      }
      recommendedPlan
      completedAt
    }
  }
`;
