"use client"
import { Button } from "@/components/ui/Button"
import Logo from "@/components/ui/Logo"
import { useScrollPosition } from "@/hooks/useScroll"
import { cx } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Link from "next/link"
import React from "react"

interface Step {
  name: string
  href: string
}

const steps: Step[] = [
  { name: "Product selection", href: "/dashboard/onboarding/products" },
  { name: "Infrastructure", href: "/dashboard/onboarding/infrastructure" },
  { name: "Employees", href: "/dashboard/onboarding/employees" },
]

interface StepProgressProps {
  steps: Step[]
}

const StepProgress = ({ steps }: StepProgressProps) => {
  const pathname = usePathname()
  const currentStepIndex = steps.findIndex((step) =>
    pathname.startsWith(step.href),
  )

  return (
    <div aria-label="Onboarding progress">
      <ol className="mx-auto flex w-24 flex-nowrap gap-1 md:w-fit">
        {steps.map((step, index) => (
          <li
            key={step.name}
            className={cx(
              "h-1 w-12 rounded-full transition-colors-standard",
              index <= currentStepIndex
                ? "bg-primary"
                : "bg-muted",
            )}
          >
            <span className="sr-only">
              {step.name}{" "}
              {index < currentStepIndex
                ? "completed"
                : index === currentStepIndex
                  ? "current"
                  : ""}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-2 text-center">
        <span className="text-xs text-muted-foreground">
          Step {Math.max(0, currentStepIndex) + 1} of {steps.length}
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
