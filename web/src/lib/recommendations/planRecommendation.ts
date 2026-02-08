// Plan Recommendation Engine
// Intelligent algorithm to match users with the right subscription plan

import type { OnboardingData, PlanRecommendation } from "@/types/onboarding"
import type { Plan } from "@/types/plan"
import { PLANS, getPlanByScore } from "@/config/plans.config"

interface ScoreWeights {
  teamSize: number
  features: number
  locations: number
  infrastructure: number
  integrations: number
  industry: number
}

const WEIGHTS: ScoreWeights = {
  teamSize: 25,
  features: 20,
  locations: 20,
  infrastructure: 15,
  integrations: 10,
  industry: 10,
}

/**
 * Calculate complexity score based on team size
 */
function calculateTeamSizeScore(data: OnboardingData): number {
  if (!data.teamSize) return 0

  const { current, growthProjection } = data.teamSize
  let score = 0

  // Base score from current team size
  if (current === 1) score = 5
  else if (current <= 5) score = 15
  else if (current <= 20) score = 30
  else if (current <= 100) score = 50
  else if (current <= 500) score = 75
  else score = 100

  // Growth multiplier
  const growthMultipliers: Record<string, number> = {
    None: 0,
    "2x": 10,
    "5x": 20,
    "10x+": 30,
  }

  score += growthMultipliers[growthProjection] || 0

  return Math.min(score, 100)
}

/**
 * Calculate complexity score based on selected features
 */
function calculateFeaturesScore(data: OnboardingData): number {
  if (!data.features?.selectedFeatures) return 0

  const features = data.features.selectedFeatures
  let score = 0

  // Basic features (3 points each)
  const basicFeatures = ["Inventory Management", "Point of Sale"]
  const basicCount = features.filter((f) => basicFeatures.includes(f)).length
  score += basicCount * 3

  // Intermediate features (5 points each)
  const intermediateFeatures = ["Customer Relations", "Financial Management"]
  const intermediateCount = features.filter((f) =>
    intermediateFeatures.includes(f)
  ).length
  score += intermediateCount * 5

  // Advanced features (8 points each)
  const advancedFeatures = ["Supplier Management", "Employee Management"]
  const advancedCount = features.filter((f) =>
    advancedFeatures.includes(f)
  ).length
  score += advancedCount * 8

  // Enterprise features (12 points each)
  const enterpriseFeatures = ["Security & Access"]
  const enterpriseCount = features.filter((f) =>
    enterpriseFeatures.includes(f)
  ).length
  score += enterpriseCount * 12

  return Math.min(score, 100)
}

/**
 * Calculate complexity score based on locations
 */
function calculateLocationsScore(data: OnboardingData): number {
  if (!data.locations?.multiLocation) return 5

  const { count, geographicSpread } = data.locations
  let score = 0

  // Base score from location count
  if (!count) score = 5
  else if (count <= 5) score = 25
  else if (count <= 20) score = 50
  else score = 80

  // Geographic spread bonus
  const spreadBonus: Record<string, number> = {
    "Single city": 0,
    "Multiple cities": 5,
    Regional: 10,
    National: 15,
    International: 20,
  }

  if (geographicSpread) {
    score += spreadBonus[geographicSpread] || 0
  }

  return Math.min(score, 100)
}

/**
 * Calculate complexity score based on infrastructure needs
 */
function calculateInfrastructureScore(data: OnboardingData): number {
  if (!data.infrastructure) return 0

  const { storage, compliance, transactionVolume } = data.infrastructure
  let score = 0

  // Storage score
  if (storage < 20) score += 5
  else if (storage < 50) score += 15
  else if (storage < 100) score += 30
  else score += 50

  // Compliance requirements (10 points each)
  score += compliance.length * 10

  // Transaction volume
  const volumeScores: Record<string, number> = {
    "Low (<1k/month)": 5,
    "Medium (1k-50k/month)": 15,
    "High (50k-500k/month)": 25,
    "Enterprise (500k+/month)": 40,
  }

  score += volumeScores[transactionVolume] || 0

  return Math.min(score, 100)
}

/**
 * Calculate complexity score based on integrations
 */
function calculateIntegrationsScore(data: OnboardingData): number {
  if (!data.integrations?.selectedIntegrations) return 0

  const integrations = data.integrations.selectedIntegrations
  let score = integrations.length * 5

  // Bonus for accounting/ERP integrations
  const accountingIntegrations = ["QuickBooks", "Xero", "FreshBooks"]
  const hasAccounting = integrations.some((i) =>
    accountingIntegrations.includes(i)
  )
  if (hasAccounting) score += 10

  return Math.min(score, 100)
}

/**
 * Calculate complexity score based on industry
 */
function calculateIndustryScore(data: OnboardingData): number {
  if (!data.businessInfo?.businessType) return 0

  const industryScores: Record<string, number> = {
    Service: 5,
    "E-commerce": 15,
    Retail: 15,
    Wholesale: 30,
    Manufacturing: 30,
    Hybrid: 25,
  }

  return industryScores[data.businessInfo.businessType] || 0
}

/**
 * Calculate overall complexity score
 */
export function calculateComplexityScore(data: OnboardingData): number {
  const teamSizeScore = calculateTeamSizeScore(data)
  const featuresScore = calculateFeaturesScore(data)
  const locationsScore = calculateLocationsScore(data)
  const infrastructureScore = calculateInfrastructureScore(data)
  const integrationsScore = calculateIntegrationsScore(data)
  const industryScore = calculateIndustryScore(data)

  const weightedScore =
    (teamSizeScore * WEIGHTS.teamSize +
      featuresScore * WEIGHTS.features +
      locationsScore * WEIGHTS.locations +
      infrastructureScore * WEIGHTS.infrastructure +
      integrationsScore * WEIGHTS.integrations +
      industryScore * WEIGHTS.industry) /
    100

  return Math.round(weightedScore)
}

/**
 * Generate personalized reasons for plan recommendation
 */
export function generateRecommendationReasons(
  data: OnboardingData,
  plan: Plan
): string[] {
  const reasons: string[] = []

  // Team size reason
  if (data.teamSize) {
    const { current, growthProjection } = data.teamSize
    if (current <= plan.limits.employees) {
      reasons.push(`Supports your team of ${current} employee${current !== 1 ? "s" : ""}`)
    }
    if (growthProjection !== "None") {
      reasons.push(`Room to scale with ${growthProjection} projected growth`)
    }
  }

  // Locations reason
  if (data.locations?.multiLocation && data.locations.count) {
    if (data.locations.count <= plan.limits.locations) {
      reasons.push(
        `Handles your ${data.locations.count} location${data.locations.count !== 1 ? "s" : ""} seamlessly`
      )
    }
  }

  // Features reason
  if (data.features?.selectedFeatures && data.features.selectedFeatures.length > 0) {
    const featureList = data.features.selectedFeatures.slice(0, 3).join(", ")
    reasons.push(`Includes features you selected: ${featureList}`)
  }

  // Compliance reason
  if (data.infrastructure?.compliance && data.infrastructure.compliance.length > 0) {
    reasons.push(
      `Meets your compliance requirements: ${data.infrastructure.compliance.join(", ")}`
    )
  }

  // Storage reason
  if (data.infrastructure?.storage && data.infrastructure.storage <= plan.limits.storage) {
    reasons.push(`Provides ${plan.limits.storage}GB storage for your needs`)
  }

  return reasons.slice(0, 5) // Return top 5 reasons
}

/**
 * Get plan recommendation based on onboarding data
 */
export function getRecommendedPlan(data: OnboardingData): PlanRecommendation {
  const score = calculateComplexityScore(data)
  const plan = getPlanByScore(score)
  const reasons = generateRecommendationReasons(data, plan)

  return {
    tier: plan.tier,
    score,
    reasons,
    monthlyPrice: plan.pricing.monthly,
    features: plan.features,
  }
}

/**
 * Get alternative plan suggestions
 */
export function getAlternativePlans(
  recommendedTier: string
): { lower?: Plan; higher?: Plan } {
  const planArray = Object.values(PLANS)
  const recommendedIndex = planArray.findIndex((p) => p.tier === recommendedTier)

  return {
    lower: recommendedIndex > 0 ? planArray[recommendedIndex - 1] : undefined,
    higher:
      recommendedIndex < planArray.length - 1
        ? planArray[recommendedIndex + 1]
        : undefined,
  }
}
