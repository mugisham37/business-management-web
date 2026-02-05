import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx } from "@/lib/utils"

const progressBarVariants = tv({
  slots: {
    root: "flex w-full items-center",
    track: "relative flex h-2 w-full items-center rounded-full overflow-hidden",
    indicator: "h-full rounded-full transition-all duration-300 ease-in-out",
    label: "ml-2 whitespace-nowrap text-sm font-medium leading-none text-gray-900 dark:text-gray-50",
  },
  variants: {
    variant: {
      default: {
        track: "bg-blue-200 dark:bg-blue-500/30",
        indicator: "bg-blue-500 dark:bg-blue-500",
      },
      neutral: {
        track: "bg-gray-200 dark:bg-gray-500/40",
        indicator: "bg-gray-500 dark:bg-gray-500",
      },
      warning: {
        track: "bg-yellow-200 dark:bg-yellow-500/30",
        indicator: "bg-yellow-500 dark:bg-yellow-500",
      },
      error: {
        track: "bg-red-200 dark:bg-red-500/30",
        indicator: "bg-red-500 dark:bg-red-500",
      },
      success: {
        track: "bg-emerald-200 dark:bg-emerald-500/30",
        indicator: "bg-emerald-500 dark:bg-emerald-500",
      },
    },
    size: {
      sm: {
        track: "h-1",
      },
      md: {
        track: "h-2",
      },
      lg: {
        track: "h-3",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
})

interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof progressBarVariants> {
  value?: number
  max?: number
  showAnimation?: boolean
  label?: string
  showPercentage?: boolean
  formatLabel?: (value: number, max: number) => string
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  (
    {
      value = 0,
      max = 100,
      label,
      showAnimation = true,
      showPercentage = false,
      formatLabel,
      variant,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const normalizedValue = Math.min(max, Math.max(value, 0))
    const percentage = max > 0 ? (normalizedValue / max) * 100 : 0
    
    const { root, track, indicator, label: labelClass } = progressBarVariants({
      variant,
      size,
    })

    const displayLabel = React.useMemo(() => {
      if (formatLabel) {
        return formatLabel(normalizedValue, max)
      }
      if (showPercentage) {
        return `${Math.round(percentage)}%`
      }
      return label
    }, [formatLabel, normalizedValue, max, showPercentage, percentage, label])

    return (
      <div
        ref={ref}
        className={cx(root(), className)}
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={typeof displayLabel === "string" ? displayLabel : "Progress"}
        {...props}
      >
        <div className={track()}>
          <div
            className={cx(
              indicator(),
              !showAnimation && "transition-none",
            )}
            style={{
              width: `${percentage}%`,
              transform: "translateZ(0)",
            }}
          />
        </div>
        {displayLabel && (
          <span className={labelClass()}>
            {displayLabel}
          </span>
        )}
      </div>
    )
  },
)

ProgressBar.displayName = "ProgressBar"

export { ProgressBar, progressBarVariants, type ProgressBarProps }
