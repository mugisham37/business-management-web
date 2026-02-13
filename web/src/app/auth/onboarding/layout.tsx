"use client"
import { Button } from "@/components/ui/button"
import { DatabaseLogo } from "../../../../public/DatabaseLogo"
import useScroll from "@/lib/useScroll"
import { cx } from "@/lib/utils"
import { usePathname } from "next/navigation"
import React from "react"

interface Step {
  name: string
  href: string
}

const steps: Step[] = [
  { name: "Product selection", href: "/onboarding/product" },
  { name: "Employees", href: "/onboarding/employees" },
  { name: "Infrastructure", href: "/onboarding/infrastructure" },
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
              "h-1 w-12 rounded-full",
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
    </div>
  )
}

const Layout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const scrolled = useScroll(15)

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 isolate z-50 flex items-center justify-between border-b bg-card px-4 transition-all md:grid md:grid-cols-[200px_auto_200px] md:px-6 border-border",
          scrolled ? "h-12" : "h-20",
        )}
      >
        <div
          className="hidden flex-nowrap items-center gap-0.5 md:flex"
          aria-hidden="true"
        >
          <DatabaseLogo
            className="w-7 p-px text-primary"
            aria-hidden="true"
          />
          <span className="mt-0.5 text-lg font-semibold text-foreground">
            Insights
          </span>
        </div>
        <StepProgress steps={steps} />
        <Button variant="ghost" className="ml-auto w-fit" asChild>
          <a href="/reports">Skip to dashboard</a>
        </Button>
      </header>
      <main id="main-content" className="mx-auto mb-20 mt-28 max-w-lg">
        {children}
      </main>
    </>
  )
}

export default Layout
