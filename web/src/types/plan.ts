// Subscription Plan Types
// Comprehensive type definitions for subscription plans

export type PlanTier = "Starter" | "Professional" | "Business" | "Enterprise"

export type BillingPeriod = "monthly" | "annual"

export interface PlanLimits {
  employees: number
  locations: number
  storage: number // in GB
  apiCalls: number // per month
}

export interface PlanPricing {
  monthly: number
  annual: number
}

export interface Plan {
  id: string
  tier: PlanTier
  name: string
  description: string
  pricing: PlanPricing
  limits: PlanLimits
  features: string[]
  scoreRange: [number, number] // [min, max] complexity score
  popular?: boolean
}

export interface Subscription {
  id: string
  organizationId: string
  plan: PlanTier
  billingPeriod: BillingPeriod
  status: "trial" | "active" | "expired" | "cancelled"
  trialEndsAt?: Date
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}
