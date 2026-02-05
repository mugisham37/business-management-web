"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
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
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
// Tremor Raw Slider [v0.0.0]

"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ariaLabelThumb?: string
}

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ariaLabelThumb, ...props }, forwardedRef) => {
  const value = props.value || props.defaultValue
  return (
    <SliderPrimitive.Root
      ref={forwardedRef}
      className={cx(
        // base
        "relative flex cursor-pointer touch-none select-none",
        // orientation
        "data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
        "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-fit data-[orientation='vertical']:justify-center",
        // disabled
        "data-[disabled]:pointer-events-none",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <SliderPrimitive.Track
        className={cx(
          // base
          "relative grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          // orientation
          "data-[orientation='horizontal']:h-1.5 data-[orientation='horizontal']:w-full",
          "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          className={cx(
            // base
            "absolute rounded-full bg-blue-500 dark:bg-blue-500",
            // orientation
            "data-[orientation='horizontal']:h-full",
            "data-[orientation='vertical']:w-full",
            // disabled
            "data-[disabled]:bg-gray-300 dark:data-[disabled]:bg-gray-700",
          )}
        />
      </SliderPrimitive.Track>
      {value?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cx(
            // base
            "block size-[17px] shrink-0 rounded-full border shadow transition-all",
            // boder color
            "border-gray-400 dark:border-gray-500",
            // background color
            "bg-white",
            // disabled
            "data-[disabled]:pointer-events-none data-[disabled]:bg-gray-200 dark:data-[disabled]:border-gray-800 dark:data-[disabled]:bg-gray-600",
            focusRing,
            "outline-offset-0",
          )}
          aria-label={ariaLabelThumb}
        />
      ))}
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
// Tremor Slider [v0.1.0]

"use client"

import * as SliderPrimitive from "@radix-ui/react-slider"
import * as React from "react"

import { cx, focusRing } from "@/lib/utils"

interface SliderProps
  extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  ariaLabelThumb?: string
}

const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  SliderProps
>(({ className, ariaLabelThumb, ...props }, forwardedRef) => {
  const value = props.value || props.defaultValue
  return (
    <SliderPrimitive.Root
      ref={forwardedRef}
      className={cx(
        // base
        "relative flex cursor-pointer touch-none select-none",
        // orientation
        "data-[orientation='horizontal']:w-full data-[orientation='horizontal']:items-center",
        "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-fit data-[orientation='vertical']:justify-center",
        // disabled
        "data-[disabled]:pointer-events-none",
        className,
      )}
      tremor-id="tremor-raw"
      {...props}
    >
      <SliderPrimitive.Track
        className={cx(
          // base
          "relative grow overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
          // orientation
          "data-[orientation='horizontal']:h-1.5 data-[orientation='horizontal']:w-full",
          "data-[orientation='vertical']:h-full data-[orientation='vertical']:w-1.5",
        )}
      >
        <SliderPrimitive.Range
          className={cx(
            // base
            "absolute rounded-full bg-blue-500 dark:bg-blue-500",
            // orientation
            "data-[orientation='horizontal']:h-full",
            "data-[orientation='vertical']:w-full",
            // disabled
            "data-[disabled]:bg-gray-300 dark:data-[disabled]:bg-gray-700",
          )}
        />
      </SliderPrimitive.Track>
      {value?.map((_, index) => (
        <SliderPrimitive.Thumb
          key={index}
          className={cx(
            // base
            "block size-[17px] shrink-0 rounded-full border shadow transition-all",
            // boder color
            "border-gray-400 dark:border-gray-500",
            // background color
            "bg-white",
            // disabled
            "data-[disabled]:pointer-events-none data-[disabled]:bg-gray-200 dark:data-[disabled]:border-gray-800 dark:data-[disabled]:bg-gray-600",
            focusRing,
            "outline-offset-0",
          )}
          aria-label={ariaLabelThumb}
        />
      ))}
    </SliderPrimitive.Root>
  )
})

Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
