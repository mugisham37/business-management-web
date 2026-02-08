import React from "react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { cx } from "@/lib/utils"

interface StepContainerProps {
  children: React.ReactNode
  title: string
  description?: string
  onSubmit?: (e: React.FormEvent) => void
  onBack?: () => void
  backHref?: string
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
  nextLabel = "Continue",
  loading = false,
  disabled = false,
  showBack = true,
  className,
}: StepContainerProps) {
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
          {showBack ? (
            backHref ? (
              <Button type="button" variant="ghost" asChild>
                <Link href={backHref}>Back</Link>
              </Button>
            ) : onBack ? (
              <Button type="button" variant="ghost" onClick={onBack}>
                Back
              </Button>
            ) : (
              <div />
            )
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
