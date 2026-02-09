"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { StepContainer } from "@/components/onboarding/StepContainer"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/Alert"
import { usePlanRecommendations, useSelectPlan } from "@/hooks/useOnboarding"
import { Loader2, CheckCircle, TrendingUp, Users, MapPin, Sparkles } from "lucide-react"
import type { PlanRecommendation, PlanTier } from "@/types/onboarding-api"
import { cx } from "@/lib/utils"

/**
 * Plan Recommendation Page
 * 
 * Displays personalized plan recommendations based on onboarding data.
 * Shows the recommended plan prominently with reasoning, and displays
 * alternative plans for comparison.
 * 
 * Requirements: 5.5, 5.6, 5.7, 5.8, 8.1, 8.2, 8.3, 8.4
 */
export default function PlanRecommendationPage() {
  const router = useRouter()
  const { data: recommendations, isLoading, error, refetch } = usePlanRecommendations()
  const selectPlan = useSelectPlan()
  const [selectedPlanTier, setSelectedPlanTier] = React.useState<PlanTier | null>(null)

  // Extract recommended and alternative plans
  const recommendedPlan = recommendations?.[0]
  const alternativePlans = recommendations?.slice(1) || []

  /**
   * Handle plan selection
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  const handleSelectPlan = async (planTier: PlanTier) => {
    setSelectedPlanTier(planTier)
    
    try {
      await selectPlan.mutateAsync(planTier)
      // Navigate to next step on success
      router.push("/dashboard/overview")
    } catch (err) {
      // Error is handled by the mutation and displayed below
      console.error('Failed to select plan:', err)
      setSelectedPlanTier(null)
    }
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <StepContainer
        title="Analyzing your needs..."
        description="We're calculating the perfect plan for your business."
        showBack={false}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            This will only take a moment
          </p>
        </div>
      </StepContainer>
    )
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <StepContainer
        title="Unable to load recommendations"
        description="We encountered an issue while generating your plan recommendations."
        showBack={false}
      >
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load plan recommendations'}
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Try Again
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push("/auth/onboarding/infrastructure")}
          >
            Go Back
          </Button>
        </div>
      </StepContainer>
    )
  }

  /**
   * Render empty state (no recommendations)
   */
  if (!recommendations || recommendations.length === 0) {
    return (
      <StepContainer
        title="No recommendations available"
        description="Please complete all onboarding steps to receive plan recommendations."
        showBack={false}
      >
        <Button
          variant="primary"
          onClick={() => router.push("/auth/onboarding/business-info")}
        >
          Complete Onboarding
        </Button>
      </StepContainer>
    )
  }

  return (
    <StepContainer
      title="Your recommended plan"
      description="Based on your business needs, we've selected the perfect plan for you."
      backHref="/auth/onboarding/infrastructure"
      showBack={true}
    >
      <div className="space-y-6">
        {/* Mutation error */}
        {selectPlan.isError && (
          <Alert variant="destructive">
            <AlertTitle>Failed to select plan</AlertTitle>
            <AlertDescription>
              {selectPlan.error instanceof Error 
                ? selectPlan.error.message 
                : 'An error occurred while selecting your plan. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Recommended Plan */}
        {recommendedPlan && (
          <RecommendedPlanCard
            plan={recommendedPlan}
            onSelect={handleSelectPlan}
            isSelecting={selectPlan.isPending && selectedPlanTier === recommendedPlan.tier}
          />
        )}

        {/* Alternative Plans */}
        {alternativePlans.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                Other plans
              </h2>
              <Badge variant="neutral" size="sm">
                {alternativePlans.length}
              </Badge>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              {alternativePlans.map((plan) => (
                <AlternativePlanCard
                  key={plan.tier}
                  plan={plan}
                  onSelect={handleSelectPlan}
                  isSelecting={selectPlan.isPending && selectedPlanTier === plan.tier}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  )
}

/**
 * Recommended Plan Card Component
 * Displays the recommended plan prominently with reasoning
 * Requirements: 5.5, 5.6, 5.7, 5.8
 */
interface RecommendedPlanCardProps {
  plan: PlanRecommendation
  onSelect: (tier: PlanTier) => void
  isSelecting: boolean
}

function RecommendedPlanCard({ plan, onSelect, isSelecting }: RecommendedPlanCardProps) {
  return (
    <Card
      className={cx(
        "relative overflow-hidden border-2 border-primary shadow-lg",
        "motion-safe:animate-revealBottom"
      )}
      style={{
        animationDuration: "600ms",
        animationDelay: "200ms",
        animationFillMode: "backwards",
      }}
    >
      {/* Recommended Badge */}
      <div className="absolute right-4 top-4">
        <Badge variant="gradient" size="sm" className="gap-1">
          <Sparkles className="h-3 w-3" />
          Recommended
        </Badge>
      </div>

      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">{plan.tier} Plan</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold text-foreground">
            ${plan.monthlyPrice}
          </span>
          <span className="text-muted-foreground">/month</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Confidence Score */}
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {plan.confidence}% match for your business
            </p>
            <p className="text-xs text-muted-foreground">
              Based on your onboarding responses
            </p>
          </div>
        </div>

        {/* Why this plan */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Why we recommend this plan:
          </h3>
          <ul className="space-y-2">
            {plan.reasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                <span className="text-muted-foreground">{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plan Limits */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Max Users</p>
              <p className="text-sm font-semibold text-foreground">
                {plan.limits.maxUsers}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Max Locations</p>
              <p className="text-sm font-semibold text-foreground">
                {plan.limits.maxLocations}
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            What's included:
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {plan.features.slice(0, 6).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          {plan.features.length > 6 && (
            <p className="text-xs text-muted-foreground">
              + {plan.features.length - 6} more features
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => onSelect(plan.tier)}
          disabled={isSelecting}
          isLoading={isSelecting}
          loadingText="Selecting..."
        >
          Select {plan.tier} Plan
        </Button>
      </CardFooter>
    </Card>
  )
}

/**
 * Alternative Plan Card Component
 * Displays alternative plans in a compact format
 * Requirements: 5.7, 5.8
 */
interface AlternativePlanCardProps {
  plan: PlanRecommendation
  onSelect: (tier: PlanTier) => void
  isSelecting: boolean
}

function AlternativePlanCard({ plan, onSelect, isSelecting }: AlternativePlanCardProps) {
  return (
    <Card
      className={cx(
        "motion-safe:animate-revealBottom"
      )}
      style={{
        animationDuration: "600ms",
        animationDelay: "300ms",
        animationFillMode: "backwards",
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{plan.tier} Plan</CardTitle>
        <CardDescription>
          <span className="text-xl font-bold text-foreground">
            ${plan.monthlyPrice}
          </span>
          <span className="text-muted-foreground">/month</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Score */}
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${plan.confidence}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {plan.confidence}%
          </span>
        </div>

        {/* Limits */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{plan.limits.maxUsers} users</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{plan.limits.maxLocations} locations</span>
          </div>
        </div>

        {/* Top Features */}
        <ul className="space-y-1">
          {plan.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-xs">
              <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-muted-foreground" />
              <span className="text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onSelect(plan.tier)}
          disabled={isSelecting}
          isLoading={isSelecting}
          loadingText="Selecting..."
        >
          Select {plan.tier}
        </Button>
      </CardFooter>
    </Card>
  )
}
