"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, checked, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
      className
    )}
    checked={checked}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("grid place-content-center text-current")}
    >
      {checked === "indeterminate" ? (
        <Minus className="h-4 w-4" />
      ) : (
        <Check className="h-4 w-4" />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
// Tremor Checkbox [v0.0.3]

import * as CheckboxPrimitives from "@radix-ui/react-checkbox"
import React from "react"

import { cx, focusRing } from "@/lib/utils"

const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitives.Root>
>(({ className, checked, ...props }, forwardedRef) => {
  return (
    <CheckboxPrimitives.Root
      ref={forwardedRef}
      {...props}
      checked={checked}
      className={cx(
        // base
        "relative inline-flex size-4 shrink-0 appearance-none items-center justify-center rounded shadow-sm outline-none ring-1 ring-inset transition duration-100 enabled:cursor-pointer",
        // text color
        "text-white dark:text-gray-50",
        // background color
        "bg-white dark:bg-gray-950",
        // ring color
        "ring-gray-300 dark:ring-gray-800",
        // disabled
        "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400 data-[disabled]:ring-gray-300",
        "data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500 data-[disabled]:dark:ring-gray-700",
        // checked and enabled
        "enabled:data-[state=checked]:bg-blue-500 enabled:data-[state=checked]:ring-0 enabled:data-[state=checked]:ring-transparent",
        // indeterminate
        "enabled:data-[state=indeterminate]:bg-blue-500 enabled:data-[state=indeterminate]:ring-0 enabled:data-[state=indeterminate]:ring-transparent",
        // focus
        focusRing,
        className,
      )}
      tremor-id="tremor-raw"
    >
      <CheckboxPrimitives.Indicator
        asChild
        className="flex size-full items-center justify-center"
      >
        {checked === "indeterminate" ? (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              x1="4"
              x2="12"
              y1="8"
              y2="8"
            ></line>
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.2 5.59998L6.79999 9.99998L4.79999 7.99998"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            ></path>
          </svg>
        )}
      </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
  )
})

Checkbox.displayName = "Checkbox"
const CheckboxExclude = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitives.Root>
>(({ className, checked, ...props }, forwardedRef) => {
  return (
    <CheckboxPrimitives.Root
      ref={forwardedRef}
      {...props}
      checked={checked}
      className={cx(
        // base
        "relative inline-flex size-4 shrink-0 appearance-none items-center justify-center rounded shadow-sm outline-none ring-1 ring-inset transition duration-100 enabled:cursor-pointer",
        // text color
        "text-white dark:text-gray-50",
        // background color
        "bg-white dark:bg-gray-950",
        // ring color
        "ring-gray-300 dark:ring-gray-800",
        // disabled
        "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400 data-[disabled]:ring-gray-300",
        "data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500 data-[disabled]:dark:ring-gray-700",
        // checked and enabled
        "enabled:data-[state=checked]:bg-blue-500 enabled:data-[state=checked]:ring-0 enabled:data-[state=checked]:ring-transparent",
        // indeterminate
        "enabled:data-[state=indeterminate]:bg-blue-500 enabled:data-[state=indeterminate]:ring-0 enabled:data-[state=indeterminate]:ring-transparent",
        // focus
        focusRing,
        className,
      )}
      tremor-id="tremor-raw"
    >
      <CheckboxPrimitives.Indicator
        asChild
        className="flex size-full items-center justify-center"
      >
        {checked === "indeterminate" ? (
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              x1="4"
              x2="12"
              y1="8"
              y2="8"
            ></line>
          </svg>
        ) : (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 5.5L5.5 10.5M10.5 10.5L5.50003 5.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        )}
      </CheckboxPrimitives.Indicator>
    </CheckboxPrimitives.Root>
  )
})

CheckboxExclude.displayName = "CheckboxExclude"

export { Checkbox, CheckboxExclude }
