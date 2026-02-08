// Subscription Plans Configuration
// Defines all available subscription plans with features, limits, and pricing

import type { Plan } from "@/types/plan"

export const PLANS: Record<string, Plan> = {
  starter: {
    id: "starter",
    tier: "Starter",
    name: "Starter",
    description: "Perfect for solo entrepreneurs and small teams getting started",
    pricing: {
      monthly: 49,
      annual: 470, // ~20% discount
    },
    limits: {
      employees: 5,
      locations: 1,
      storage: 10,
      apiCalls: 1000,
    },
    features: [
      "Basic inventory management",
      "Point of sale system",
      "Customer relationship management",
      "Standard support",
      "Mobile app access",
      "Basic reporting",
    ],
    scoreRange: [0, 30],
  },
  professional: {
    id: "professional",
    tier: "Professional",
    name: "Professional",
    description: "For growing businesses that need advanced features",
    pricing: {
      monthly: 149,
      annual: 1430, // ~20% discount
    },
    limits: {
      employees: 20,
      locations: 3,
      storage: 50,
      apiCalls: 10000,
    },
    features: [
      "Everything in Starter",
      "Advanced inventory tracking",
      "Multi-location support",
      "Priority support",
      "API access (limited)",
      "Advanced analytics",
      "Custom workflows",
      "Team collaboration tools",
    ],
    scoreRange: [31, 50],
    popular: true,
  },
  business: {
    id: "business",
    tier: "Business",
    name: "Business",
    description: "For established companies with complex operations",
    pricing: {
      monthly: 499,
      annual: 4790, // ~20% discount
    },
    limits: {
      employees: 100,
      locations: 999, // Unlimited
      storage: 500,
      apiCalls: 100000,
    },
    features: [
      "Everything in Professional",
      "Unlimited locations",
      "Dedicated support",
      "Full API access",
      "Advanced security features",
      "Custom integrations",
      "White-label options",
      "Advanced compliance tools",
      "Custom reporting",
    ],
    scoreRange: [51, 75],
  },
  enterprise: {
    id: "enterprise",
    tier: "Enterprise",
    name: "Enterprise",
    description: "Custom solutions for large organizations",
    pricing: {
      monthly: 0, // Custom pricing
      annual: 0, // Custom pricing
    },
    limits: {
      employees: 999999, // Unlimited
      locations: 999999, // Unlimited
      storage: 999999, // Unlimited
      apiCalls: 999999, // Unlimited
    },
    features: [
      "Everything in Business",
      "Unlimited everything",
      "Custom SLAs",
      "Dedicated infrastructure",
      "24/7 premium support",
      "Custom development",
      "On-premise deployment option",
      "Advanced security & compliance",
      "Dedicated account manager",
    ],
    scoreRange: [76, 100],
  },
}

export const getPlanByTier = (tier: string): Plan | undefined => {
  return Object.values(PLANS).find((plan) => plan.tier === tier)
}

export const getPlanByScore = (score: number): Plan => {
  const plan = Object.values(PLANS).find(
    (p) => score >= p.scoreRange[0] && score <= p.scoreRange[1]
  )
  return plan || PLANS.starter
}
