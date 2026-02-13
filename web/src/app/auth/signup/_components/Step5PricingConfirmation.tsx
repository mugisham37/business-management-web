"use client"

import React, { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { SignupFormData } from "../page"
import { Check, Edit2, Sparkles } from "lucide-react"
import { cx } from "@/lib/utils"

interface Step5Props {
  formData: SignupFormData
  updateFormData: (data: Partial<SignupFormData>) => void
  onBack: () => void
  onSubmit: () => void
  loading: boolean
  onEditStep: (step: number) => void
}

interface PricingTier {
  id: "starter" | "professional" | "enterprise"
  name: string
  description: string
  basePrice: number
  features: string[]
  recommended?: boolean
}

const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for solopreneurs and small teams",
    basePrice: 29,
    features: [
      "Up to 5 users",
      "Basic modules",
      "Email support",
      "5GB storage",
      "Monthly reports",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing businesses",
    basePrice: 79,
    features: [
      "Up to 50 users",
      "All modules included",
      "Priority support",
      "50GB storage",
      "Advanced analytics",
      "Custom integrations",
      "API access",
    ],
    recommended: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations",
    basePrice: 199,
    features: [
      "Unlimited users",
      "All modules + custom",
      "24/7 dedicated support",
      "Unlimited storage",
      "Advanced security",
      "Custom workflows",
      "SLA guarantee",
      "Dedicated account manager",
    ],
  },
]

export default function Step5PricingConfirmation({
  formData,
  updateFormData,
  onBack,
  onSubmit,
  loading,
  onEditStep,
}: Step5Props) {
  const calculatePricing = useMemo(() => {
    // Base price multipliers by business type
    const businessTypeMultipliers = {
      solopreneur: 1.0,
      small: 1.2,
      retail: 1.5,
      wholesale: 1.8,
      industry: 2.2,
    }

    // Employee count multipliers
    const employeeMultipliers: Record<string, number> = {
      "1": 1.0,
      "2-5": 1.2,
      "6-20": 1.5,
      "21-50": 2.0,
      "51-100": 2.5,
      "101-500": 3.5,
      "501+": 5.0,
    }

    const selectedTier = pricingTiers.find((t) => t.id === formData.selectedPlan)
    if (!selectedTier) return null

    const basePrice = selectedTier.basePrice
    const businessMultiplier = businessTypeMultipliers[formData.businessType || "small"]
    const employeeMultiplier = employeeMultipliers[formData.employeeCount] || 1.0

    // Module pricing (additional cost per module beyond base)
    const moduleCount = formData.selectedModules.length
    const modulePrice = Math.max(0, moduleCount - 3) * 15

    // Infrastructure costs (if configured)
    let infraCost = 0
    if (formData.cloudProvider && formData.region) {
      const basePrices = { aws: 0.023, azure: 0.025 }
      const baseInfraPrice = basePrices[formData.cloudProvider]
      const storagePrice = baseInfraPrice * formData.storageVolume
      const compressionMultiplier = formData.compression === "true" ? 0.7 : 1.0
      const activeHoursPrice = formData.activeHours[0] * 0.05
      infraCost = (storagePrice * compressionMultiplier + activeHoursPrice) * 30
    }

    const monthlyTotal =
      basePrice * businessMultiplier * employeeMultiplier + modulePrice + infraCost
    const annualTotal = monthlyTotal * 12 * 0.85 // 15% discount

    return {
      basePrice,
      businessMultiplier,
      employeeMultiplier,
      modulePrice,
      infraCost,
      monthlyTotal: Math.round(monthlyTotal),
      annualTotal: Math.round(annualTotal),
      monthlySavings: Math.round(monthlyTotal * 12 - annualTotal),
    }
  }, [formData])

  // Auto-select recommended plan if none selected
  React.useEffect(() => {
    if (!formData.selectedPlan) {
      const recommended = pricingTiers.find((t) => t.recommended)
      if (recommended) {
        updateFormData({ selectedPlan: recommended.id })
      }
    }
  }, [formData.selectedPlan, updateFormData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.selectedPlan) {
      onSubmit()
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-4 py-12">
      <div
        className="motion-safe:animate-revealBottom text-center"
        style={{ animationDuration: "500ms" }}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-semibold text-foreground sm:text-2xl">
          Choose your plan
        </h1>
        <p className="mt-4 text-muted-foreground sm:text-sm">
          Based on your selections, here's our recommended pricing
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10">
        <div className="space-y-8">
          {/* Billing Cycle Toggle */}
          <div
            className="flex justify-center motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "100ms",
              animationFillMode: "backwards",
            }}
          >
            <RadioGroup
              value={formData.billingCycle}
              onValueChange={(value: string) =>
                updateFormData({ billingCycle: value as "monthly" | "annual" })
              }
              className="inline-flex rounded-lg border border-border bg-muted p-1"
            >
              <div className="flex items-center">
                <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                <Label
                  htmlFor="monthly"
                  className={cx(
                    "cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    formData.billingCycle === "monthly"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Monthly
                </Label>
              </div>
              <div className="flex items-center">
                <RadioGroupItem value="annual" id="annual" className="sr-only" />
                <Label
                  htmlFor="annual"
                  className={cx(
                    "cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors",
                    formData.billingCycle === "annual"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Annual
                  <span className="ml-1.5 text-xs text-secondary">(Save 15%)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Pricing Cards */}
          <div
            className="grid gap-6 motion-safe:animate-revealBottom lg:grid-cols-3"
            style={{
              animationDuration: "600ms",
              animationDelay: "200ms",
              animationFillMode: "backwards",
            }}
          >
            {pricingTiers.map((tier) => {
              const isSelected = formData.selectedPlan === tier.id
              const pricing = calculatePricing

              return (
                <Card
                  key={tier.id}
                  className={cx(
                    "relative cursor-pointer transition-all hover:shadow-lg",
                    isSelected && "border-primary ring-2 ring-primary/20",
                    tier.recommended && "border-primary/50"
                  )}
                  onClick={() => updateFormData({ selectedPlan: tier.id })}
                >
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                        <Sparkles className="h-3 w-3" />
                        Recommended
                      </span>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold text-foreground">
                        {tier.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tier.description}
                      </p>
                    </div>

                    {pricing && isSelected && (
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-foreground">
                            $
                            {formData.billingCycle === "monthly"
                              ? pricing.monthlyTotal
                              : Math.round(pricing.annualTotal / 12)}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {formData.billingCycle === "annual" && (
                          <p className="mt-1 text-xs text-secondary">
                            ${pricing.annualTotal}/year (save ${pricing.monthlySavings})
                          </p>
                        )}
                      </div>
                    )}

                    {(!pricing || !isSelected) && (
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-foreground">
                            ${tier.basePrice}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Starting price</p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <ul className="space-y-2.5">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      type="button"
                      variant={isSelected ? "primary" : "outline"}
                      className="mt-6 w-full"
                      onClick={() => updateFormData({ selectedPlan: tier.id })}
                    >
                      {isSelected ? "Selected" : "Select Plan"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Summary Section */}
          {calculatePricing && formData.selectedPlan && (
            <Card
              className="motion-safe:animate-revealBottom"
              style={{
                animationDuration: "600ms",
                animationDelay: "300ms",
                animationFillMode: "backwards",
              }}
            >
              <CardContent className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Your Configuration Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Business Type</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formData.businessType
                          ? formData.businessType.charAt(0).toUpperCase() +
                            formData.businessType.slice(1)
                          : ""}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStep(2)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Employees</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formData.employeeCount}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStep(2)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Modules Selected</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {formData.selectedModules.length}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditStep(3)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {formData.cloudProvider && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Infrastructure
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {formData.cloudProvider.toUpperCase()}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditStep(4)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">
                      $
                      {formData.billingCycle === "monthly"
                        ? calculatePricing.monthlyTotal
                        : Math.round(calculatePricing.annualTotal / 12)}
                      /month
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div
            className="flex justify-between gap-4 pt-4 motion-safe:animate-revealBottom"
            style={{
              animationDuration: "600ms",
              animationDelay: "400ms",
              animationFillMode: "backwards",
            }}
          >
            <Button type="button" variant="ghost" onClick={onBack}>
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={!formData.selectedPlan || loading}
              className="min-w-[200px]"
            >
              {loading ? "Creating Account..." : "Create Account & Start Trial"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </form>
    </main>
  )
}
