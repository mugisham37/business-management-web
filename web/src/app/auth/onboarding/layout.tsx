"use client"
import { Button } from "@/components/ui/Button"
import Logo from "@/components/ui/Logo"
import { useScrollPosition } from "@/hooks/useScroll"
import { cx } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import React from "react"
import { useOnboardingStore } from "@/stores/onboarding.store"
import { getProgressPercentage } from "@/config/onboarding.config"
import type { OnboardingStep } from "@/types/onboarding-api"

interface Step {
  name: string
  href: string
  id: OnboardingStep
}

const steps: Step[] = [
  { name: "Welcome", href: "/auth/onboarding/welcome", id: "welcome" },
  { name: "Business Info", href: "/auth/onboarding/business-info", id: "business-info" },
  { name: "Products", href: "/auth/onboarding/products", id: "products" },
  { name: "Employees", href: "/auth/onboarding/employees", id: "team-size" },
  { name: "Infrastructure", href: "/auth/onboarding/infrastructure", id: "infrastructure" },
  { name: "Plan", href: "/auth/onboarding/plan-recommendation", id: "plan-recommendation" },
]

interface StepProgressProps {
  steps: Step[]
}

const StepProgress = ({ steps }: StepProgressProps) => {
  const pathname = usePathname()
  const { completedSteps, data } = useOnboardingStore()
  
  const currentStepIndex = steps.findIndex((step) =>
    pathname.startsWith(step.href),
  )

  // Calculate completion percentage based on completed steps
  // Requirements: 6.1, 6.2
  const completionPercentage = getProgressPercentage(completedSteps, data)

  return (
    <div aria-label="Onboarding progress" className="flex flex-col items-center">
      {/* Progress bar with step indicators */}
      <ol className="mx-auto flex w-24 flex-nowrap gap-1 md:w-fit">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = index === currentStepIndex
          
          return (
            <li
              key={step.name}
              className={cx(
                "h-1 w-12 rounded-full transition-colors-standard",
                isCompleted
                  ? "bg-primary"
                  : isCurrent
                    ? "bg-primary/60"
                    : "bg-muted",
              )}
            >
              <span className="sr-only">
                {step.name}{" "}
                {isCompleted
                  ? "completed"
                  : isCurrent
                    ? "current"
                    : ""}
              </span>
            </li>
          )
        })}
      </ol>
      
      {/* Step counter and completion percentage */}
      {/* Requirements: 6.1, 6.2, 6.3 */}
      <div className="mt-2 flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground">
          Step {Math.max(0, currentStepIndex) + 1} of {steps.length}
        </span>
        <span className="text-xs font-medium text-primary">
          {completionPercentage}% complete
        </span>
      </div>
    </div>
  )
}

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const { y: scrollY } = useScrollPosition()
  const scrolled = scrollY > 15

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 isolate flex items-center justify-between border-b border-border bg-background/80 backdrop-blur-sm px-4 transition-standard md:grid md:grid-cols-[200px_auto_200px] md:px-6",
          scrolled ? "h-12 shadow-sm" : "h-20",
        )}
        style={{ zIndex: 'var(--z-fixed)' }}
      >
        <div
          className="hidden flex-nowrap items-center gap-0.5 md:flex"
          aria-hidden="true"
        >
          <Logo
            className="w-7 p-px text-primary"
            aria-hidden="true"
          />
          <span className="mt-0.5 text-lg font-semibold text-foreground">
            Insights
          </span>
        </div>
        <StepProgress steps={steps} />
        <Button 
          variant="ghost" 
          className="ml-auto w-fit" 
          size="sm"
          asChild
        >
          <Link href="/dashboard/overview">Skip to dashboard</Link>
        </Button>
      </header>
      <main id="main-content" className="mx-auto mb-20 mt-28 max-w-lg px-4">
        {children}
      </main>
    </>
  )
}

export default Layout
