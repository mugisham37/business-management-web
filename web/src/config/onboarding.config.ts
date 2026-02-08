// Onboarding Configuration
// Defines the onboarding flow, steps, and conditional logic

import type { OnboardingStep, OnboardingData } from "@/types/onboarding"

export interface StepConfig {
  id: OnboardingStep
  path: string
  title: string
  description: string
  required: boolean
  skipCondition?: (data: OnboardingData) => boolean
}

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "welcome",
    path: "/auth/onboarding/welcome",
    title: "Welcome",
    description: "Let's get started with your business setup",
    required: false,
    skipCondition: undefined,
  },
  {
    id: "business-info",
    path: "/auth/onboarding/business-info",
    title: "Business Information",
    description: "Tell us about your business",
    required: true,
    skipCondition: undefined,
  },
  {
    id: "products",
    path: "/auth/onboarding/products",
    title: "Product Selection",
    description: "Choose the features you need",
    required: true,
    skipCondition: undefined,
  },
  {
    id: "team-size",
    path: "/auth/onboarding/team-size",
    title: "Team Size",
    description: "How many people work with you?",
    required: true,
    skipCondition: undefined,
  },
  {
    id: "locations",
    path: "/auth/onboarding/locations",
    title: "Locations",
    description: "Where do you operate?",
    required: false,
    skipCondition: (data) => {
      // Skip if single employee or e-commerce only
      return (
        data.teamSize?.current === 1 ||
        data.businessInfo?.businessType === "E-commerce"
      )
    },
  },
  {
    id: "infrastructure",
    path: "/auth/onboarding/infrastructure",
    title: "Infrastructure",
    description: "Configure your technical setup",
    required: true,
    skipCondition: undefined,
  },
  {
    id: "integrations",
    path: "/auth/onboarding/integrations",
    title: "Integrations",
    description: "Connect your existing tools",
    required: false,
    skipCondition: undefined,
  },
  {
    id: "plan-recommendation",
    path: "/auth/onboarding/plan-recommendation",
    title: "Plan Recommendation",
    description: "Find the perfect plan for your needs",
    required: true,
    skipCondition: undefined,
  },
  {
    id: "payment",
    path: "/auth/onboarding/payment",
    title: "Payment",
    description: "Start your free trial",
    required: true,
    skipCondition: undefined,
  },
]

export const getStepByPath = (path: string): StepConfig | undefined => {
  return ONBOARDING_STEPS.find((step) => step.path === path)
}

export const getStepIndex = (stepId: OnboardingStep): number => {
  return ONBOARDING_STEPS.findIndex((step) => step.id === stepId)
}

export const getNextStep = (
  currentStep: OnboardingStep,
  data: OnboardingData
): OnboardingStep | null => {
  const currentIndex = getStepIndex(currentStep)
  const remainingSteps = ONBOARDING_STEPS.slice(currentIndex + 1)

  for (const step of remainingSteps) {
    if (step.skipCondition && step.skipCondition(data)) {
      continue // Skip this step
    }
    return step.id
  }

  return null // All steps completed
}

export const getPreviousStep = (
  currentStep: OnboardingStep,
  data: OnboardingData
): OnboardingStep | null => {
  const currentIndex = getStepIndex(currentStep)
  const previousSteps = ONBOARDING_STEPS.slice(0, currentIndex).reverse()

  for (const step of previousSteps) {
    if (step.skipCondition && step.skipCondition(data)) {
      continue // Skip this step
    }
    return step.id
  }

  return null // No previous step
}

export const getCompletedStepsCount = (
  completedSteps: OnboardingStep[]
): number => {
  return completedSteps.length
}

export const getTotalStepsCount = (data: OnboardingData): number => {
  return ONBOARDING_STEPS.filter(
    (step) => !step.skipCondition || !step.skipCondition(data)
  ).length
}

export const getProgressPercentage = (
  completedSteps: OnboardingStep[],
  data: OnboardingData
): number => {
  const total = getTotalStepsCount(data)
  const completed = getCompletedStepsCount(completedSteps)
  return Math.round((completed / total) * 100)
}
