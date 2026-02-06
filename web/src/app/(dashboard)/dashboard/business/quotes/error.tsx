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
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4 sm:p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20">
          <AlertCircle className="size-6 text-red-600 dark:text-red-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Something went wrong
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
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
