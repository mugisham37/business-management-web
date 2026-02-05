"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cx } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  max?: number
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, max = 100, ...props }, ref) => {
  const normalizedValue = value != null ? Math.min(Math.max(value, 0), max) : 0
  const percentage = max > 0 ? (normalizedValue / max) * 100 : 0

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cx(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      value={normalizedValue}
      max={max}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
export type { ProgressProps }
