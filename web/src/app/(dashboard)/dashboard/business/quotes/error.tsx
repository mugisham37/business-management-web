"use client"

import { Button } from "@/components/ui/Button"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

export default function QuotesError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="business-error-container">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="business-error-icon-wrapper">
          <AlertCircle className="business-error-icon" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--business-error-text)]">
            Something went wrong
          </h2>
          <p className="text-sm text-[var(--business-error-description)]">
            We encountered an error while loading your quotes. Please try again.
          </p>
        </div>
        <Button onClick={reset} variant="secondary">
          Try again
        </Button>
      </div>
    </div>
  )
}
