"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cx, focusRing } from "@/lib/utils"

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ariaLabelThumb?: string
  variant?: "default" | "primary"
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ariaLabelThumb, variant = "default", ...props }, ref) => {
  const value = props.value || props.defaultValue
  const hasMultipleValues = Array.isArray(value) && value.length > 1

  if (variant === "primary") {
    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cx(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
    )
  }

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cx(
        "relative flex cursor-pointer touch-none select-none",
        "data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
        "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-fit data-[orientation='vertical']:justify-center",
        "data-[disabled]:pointer-events-none",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <SliderPrimitive.Track
        className={cx(
          "relative grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          "data-[orientation='horizontal']:h-1.5 data-[orientation='horizontal']:w-full",
          "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          className={cx(
            "absolute rounded-full bg-blue-500 dark:bg-blue-500",
            "data-[orientation='horizontal']:h-full",
            "data-[orientation='vertical']:w-full",
            "data-[disabled]:bg-gray-300 dark:data-[disabled]:bg-gray-700",
          )}
        />
      </SliderPrimitive.Track>
      {hasMultipleValues ? (
        value?.map((_, index) => (
          <SliderPrimitive.Thumb
            key={index}
            className={cx(
              "block size-[17px] shrink-0 rounded-full border shadow transition-all",
              "border-gray-400 dark:border-gray-500",
              "bg-white",
              "data-[disabled]:pointer-events-none data-[disabled]:bg-gray-200 dark:data-[disabled]:border-gray-800 dark:data-[disabled]:bg-gray-600",
              focusRing,
              "outline-offset-0",
            )}
            aria-label={ariaLabelThumb}
          />
        ))
      ) : (
        <SliderPrimitive.Thumb
          className={cx(
            "block size-[17px] shrink-0 rounded-full border shadow transition-all",
            "border-gray-400 dark:border-gray-500",
            "bg-white",
            "data-[disabled]:pointer-events-none data-[disabled]:bg-gray-200 dark:data-[disabled]:border-gray-800 dark:data-[disabled]:bg-gray-600",
            focusRing,
            "outline-offset-0",
          )}
          aria-label={ariaLabelThumb}
        />
      )}
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }