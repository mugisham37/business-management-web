import React from "react"
import { Button } from "@/components/ui/Button"
import { cx } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { getPreviousStep, ONBOARDING_STEPS } from "@/config/onboarding.config"
import type { OnboardingStep } from "@/types/onboarding-api"

interface StepContainerProps {
  children: React.ReactNode
  title: string
  description?: string
  onSubmit?: (e: React.FormEvent) => void
  onBack?: () => void
  backHref?: string
  currentStep?: OnboardingStep
  nextLabel?: string
  loading?: boolean
  disabled?: boolean
  showBack?: boolean
  className?: string
}

export function StepContainer({
  children,
  title,
  description,
  onSubmit,
  onBack,
  backHref,
  currentStep,
  nextLabel = "Continue",
  loading = false,
  disabled = false,
  showBack = true,
  className,
}: StepContainerProps) {
  const router = useRouter()
  const { data } = useOnboardingStore()

  // Calculate dynamic back navigation based on onboarding config
  // Requirements: 6.4, 10.3
  const handleBackNavigation = () => {
    if (onBack) {
      onBack()
      return
    }

    if (backHref) {
      router.push(backHref)
      return
    }

    // Use config to determine previous step
    if (currentStep) {
      const previousStep = getPreviousStep(currentStep, data)
      if (previousStep) {
        const stepConfig = ONBOARDING_STEPS.find(s => s.id === previousStep)
        if (stepConfig) {
          router.push(stepConfig.path)
        }
      }
    }
  }

  const hasBackNavigation = showBack && (onBack || backHref || currentStep)

  return (
    <div className={cx("mx-auto p-4", className)}>
      {/* Header */}
      <div
        className="motion-safe:animate-revealBottom"
        style={{
          animationDuration: "600ms",
          animationDelay: "100ms",
          animationFillMode: "backwards",
        }}
      >
        <h1 className="text-2xl font-semibold text-foreground sm:text-xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 text-muted-foreground sm:text-sm">{description}</p>
        )}
      </div>

      {/* Content */}
      <form onSubmit={onSubmit} className="mt-8">
        {children}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          {hasBackNavigation ? (
            <Button 
              type="button" 
              variant="ghost" 
              onClick={handleBackNavigation}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            type="submit"
            variant="primary"
            disabled={disabled || loading}
            isLoading={loading}
            loadingText="Saving..."
          >
            {nextLabel}
          </Button>
        </div>
      </form>
    </div>
  )
}
