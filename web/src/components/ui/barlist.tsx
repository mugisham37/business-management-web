import React from "react"

import { cx, focusRing } from "@/lib/utils"

type Bar<T = Record<string, unknown>> = T & {
  key?: string
  href?: string
  value: number
  name: string
}

interface BarListProps<T = Record<string, unknown>>
  extends React.HTMLAttributes<HTMLDivElement> {
  data: Bar<T>[]
  valueFormatter?: (value: number) => string
  showAnimation?: boolean
  onValueChange?: (payload: Bar<T>) => void
  sortOrder?: "ascending" | "descending" | "none"
  color?: "blue" | "emerald" | "violet" | "amber" | "gray" | "cyan" | "pink" | "lime" | "fuchsia"
  showValues?: boolean
  maxValue?: number
  minBarWidth?: number
  barHeight?: "sm" | "md" | "lg"
}

const colorVariants = {
  blue: {
    bg: "bg-blue-200 dark:bg-blue-900",
    hoverBg: "group-hover:bg-blue-300 group-hover:dark:bg-blue-800",
  },
  emerald: {
    bg: "bg-emerald-200 dark:bg-emerald-900",
    hoverBg: "group-hover:bg-emerald-300 group-hover:dark:bg-emerald-800",
  },
  violet: {
    bg: "bg-violet-200 dark:bg-violet-900",
    hoverBg: "group-hover:bg-violet-300 group-hover:dark:bg-violet-800",
  },
  amber: {
    bg: "bg-amber-200 dark:bg-amber-900",
    hoverBg: "group-hover:bg-amber-300 group-hover:dark:bg-amber-800",
  },
  gray: {
    bg: "bg-gray-200 dark:bg-gray-700",
    hoverBg: "group-hover:bg-gray-300 group-hover:dark:bg-gray-600",
  },
  cyan: {
    bg: "bg-cyan-200 dark:bg-cyan-900",
    hoverBg: "group-hover:bg-cyan-300 group-hover:dark:bg-cyan-800",
  },
  pink: {
    bg: "bg-pink-200 dark:bg-pink-900",
    hoverBg: "group-hover:bg-pink-300 group-hover:dark:bg-pink-800",
  },
  lime: {
    bg: "bg-lime-200 dark:bg-lime-900",
    hoverBg: "group-hover:bg-lime-300 group-hover:dark:bg-lime-800",
  },
  fuchsia: {
    bg: "bg-fuchsia-200 dark:bg-fuchsia-900",
    hoverBg: "group-hover:bg-fuchsia-300 group-hover:dark:bg-fuchsia-800",
  },
} as const

const heightVariants = {
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
} as const

function BarListInner<T = Record<string, unknown>>(
  {
    data = [],
    valueFormatter = (value) => value.toString(),
    showAnimation = false,
    onValueChange,
    sortOrder = "descending",
    color = "blue",
    showValues = true,
    maxValue,
    minBarWidth = 2,
    barHeight = "md",
    className,
    ...props
  }: BarListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const Component = onValueChange ? "button" : "div"
  
  const sortedData = React.useMemo(() => {
    if (sortOrder === "none") {
      return data
    }
    return [...data].sort((a, b) => {
      return sortOrder === "ascending" ? a.value - b.value : b.value - a.value
    })
  }, [data, sortOrder])

  const widths = React.useMemo(() => {
    const calculatedMaxValue = maxValue ?? Math.max(...sortedData.map((item) => item.value), 0)
    if (calculatedMaxValue === 0) return sortedData.map(() => 0)
    
    return sortedData.map((item) =>
      item.value === 0 ? 0 : Math.max((item.value / calculatedMaxValue) * 100, minBarWidth),
    )
  }, [sortedData, maxValue, minBarWidth])

  const colorClasses = colorVariants[color]
  const rowHeight = heightVariants[barHeight]

  const handleItemClick = React.useCallback((item: Bar<T>) => {
    onValueChange?.(item)
  }, [onValueChange])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent, item: Bar<T>) => {
    if (onValueChange && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault()
      handleItemClick(item)
    }
  }, [onValueChange, handleItemClick])

  const handleLinkClick = React.useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  if (!data.length) {
    return (
      <div
        ref={forwardedRef}
        className={cx("flex items-center justify-center py-8", className)}
        {...props}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <div
      ref={forwardedRef}
      className={cx("flex justify-between", showValues ? "space-x-6" : "", className)}
      aria-sort={sortOrder}
      role={onValueChange ? "listbox" : "list"}
      tremor-id="tremor-raw"
      {...props}
    >
      <div className="relative w-full space-y-1.5">
        {sortedData.map((item, index) => (
          <Component
            key={item.key ?? `${item.name}-${index}`}
            onClick={onValueChange ? () => handleItemClick(item) : undefined}
            onKeyDown={onValueChange ? (event) => handleKeyDown(event, item) : undefined}
            tabIndex={onValueChange ? 0 : undefined}
            role={onValueChange ? "option" : "listitem"}
            aria-selected={false}
            className={cx(
              "group w-full rounded",
              focusRing,
              onValueChange && [
                "!-m-0 cursor-pointer",
                "hover:bg-gray-50 hover:dark:bg-gray-900",
              ],
            )}
          >
            <div
              className={cx(
                "flex items-center rounded transition-all",
                rowHeight,
                colorClasses.bg,
                onValueChange && colorClasses.hoverBg,
                {
                  "mb-0": index === sortedData.length - 1,
                  "duration-800": showAnimation,
                },
              )}
              style={{ width: `${widths[index]}%` }}
            >
              <div className="absolute left-2 flex max-w-full pr-2">
                {item.href ? (
                  <a
                    href={item.href}
                    className={cx(
                      "truncate whitespace-nowrap rounded text-sm",
                      "text-gray-900 dark:text-gray-50",
                      "hover:underline hover:underline-offset-2",
                      focusRing,
                    )}
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleLinkClick}
                  >
                    {item.name}
                  </a>
                ) : (
                  <p className={cx(
                    "truncate whitespace-nowrap text-sm",
                    "text-gray-900 dark:text-gray-50",
                  )}>
                    {item.name}
                  </p>
                )}
              </div>
            </div>
          </Component>
        ))}
      </div>
      {showValues && (
        <div>
          {sortedData.map((item, index) => (
            <div
              key={item.key ?? `${item.name}-value-${index}`}
              className={cx(
                "flex items-center justify-end",
                rowHeight,
                index === sortedData.length - 1 ? "mb-0" : "mb-1.5",
              )}
            >
              <p className={cx(
                "truncate whitespace-nowrap text-sm leading-none",
                "text-gray-900 dark:text-gray-50",
              )}>
                {valueFormatter(item.value)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

BarListInner.displayName = "BarList"

const BarList = React.forwardRef(BarListInner) as <T = Record<string, unknown>>(
  p: BarListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof BarListInner>

export { BarList, type BarListProps, type Bar }
