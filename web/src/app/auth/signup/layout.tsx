"use client"

import React from "react"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import useScroll from "@/lib/useScroll"
import { cx } from "@/lib/utils"
import { usePathname } from "next/navigation"

interface Step {
  name: string
  number: number
}

const steps: Step[] = [
  { name: "Account", number: 1 },
  { name: "Profile", number: 2 },
  { name: "Needs", number: 3 },
  { name: "Technical", number: 4 },
  { name: "Pricing", number: 5 },
]

interface StepProgressProps {
  steps: Step[]
  currentStep: number
}

const StepProgress = ({ steps, currentStep }: StepProgressProps) => {
  return (
    <div aria-label="Signup progress" className="w-full max-w-2xl">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number
          const isCurrent = currentStep === step.number
          const isUpcoming = currentStep < step.number

          return (
            <li key={step.number} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all",
                    isCompleted && "bg-primary text-primary-foreground",
                    isCurrent && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    isUpcoming && "bg-muted text-muted-foreground"
                  )}
                >
                  {step.number}
                </div>
                <span
                  className={cx(
                    "hidden text-xs font-medium transition-colors sm:block",
                    (isCompleted || isCurrent) && "text-foreground",
                    isUpcoming && "text-muted-foreground"
                  )}
                >
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cx(
                    "h-0.5 w-8 transition-colors sm:w-12",
                    isCompleted ? "bg-primary" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const scrolled = useScroll(15)
  const pathname = usePathname()

  // Determine current step from URL or default to 1
  const getCurrentStep = () => {
    // Since we're using a single page with client-side routing,
    // we'll need to pass this via context or state
    // For now, default to 1
    return 1
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-background">
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm transition-all md:px-6",
          scrolled ? "h-14" : "h-20"
        )}
      >
        <div className="flex items-center gap-1" aria-label="Insights Logo">
          <DatabaseLogo className="w-7 text-primary" aria-hidden="true" />
          <span className="text-lg font-semibold text-foreground">Insights</span>
        </div>

        <div className="hidden md:block">
          <StepProgress steps={steps} currentStep={currentStep} />
        </div>

        <div className="w-24" /> {/* Spacer for alignment */}
      </header>

      {/* Mobile Progress */}
      <div className="fixed inset-x-0 top-14 z-40 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm md:hidden">
        <StepProgress steps={steps} currentStep={currentStep} />
      </div>

      <main className="pt-20 md:pt-20">{children}</main>
    </div>
  )
}

export default Layout
