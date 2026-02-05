"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus, X } from "lucide-react"

import { cx, focusRing } from "@/lib/utils"

// Alias cx as cn for compatibility
const cn = cx

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: "default" | "tremor"
}

interface CheckboxExcludeProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: "default" | "tremor"
}

const CheckIcon = ({ variant = "default" }: { variant?: "default" | "tremor" }) => {
  if (variant === "tremor") {
    return (
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
        />
      </svg>
    )
  }
  return <Check className="h-4 w-4" />
}

const MinusIcon = ({ variant = "default" }: { variant?: "default" | "tremor" }) => {
  if (variant === "tremor") {
    return (
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
        />
      </svg>
    )
  }
  return <Minus className="h-4 w-4" />
}

const XIcon = ({ variant = "default" }: { variant?: "default" | "tremor" }) => {
  if (variant === "tremor") {
    return (
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
    )
  }
  return <X className="h-4 w-4" />
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, checked, variant = "default", ...props }, ref) => {
  const baseClasses = variant === "tremor" 
    ? cx(
        "relative inline-flex size-4 shrink-0 appearance-none items-center justify-center rounded shadow-sm outline-none ring-1 ring-inset transition duration-100 enabled:cursor-pointer",
        "text-white dark:text-gray-50",
        "bg-white dark:bg-gray-950",
        "ring-gray-300 dark:ring-gray-800",
        "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400 data-[disabled]:ring-gray-300",
        "data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500 data-[disabled]:dark:ring-gray-700",
        "enabled:data-[state=checked]:bg-blue-500 enabled:data-[state=checked]:ring-0 enabled:data-[state=checked]:ring-transparent",
        "enabled:data-[state=indeterminate]:bg-blue-500 enabled:data-[state=indeterminate]:ring-0 enabled:data-[state=indeterminate]:ring-transparent",
        focusRing,
        className
      )
    : cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className
      )

  const indicatorClasses = variant === "tremor" 
    ? "flex size-full items-center justify-center"
    : cn("grid place-content-center text-current")

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={baseClasses}
      checked={checked}
      {...(variant === "tremor" && { "tremor-id": "tremor-raw" })}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        {...(variant === "tremor" && { asChild: true })}
        className={indicatorClasses}
      >
        {checked === "indeterminate" ? (
          <MinusIcon variant={variant} />
        ) : (
          <CheckIcon variant={variant} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

const CheckboxExclude = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxExcludeProps
>(({ className, checked, variant = "default", ...props }, ref) => {
  const baseClasses = variant === "tremor" 
    ? cx(
        "relative inline-flex size-4 shrink-0 appearance-none items-center justify-center rounded shadow-sm outline-none ring-1 ring-inset transition duration-100 enabled:cursor-pointer",
        "text-white dark:text-gray-50",
        "bg-white dark:bg-gray-950",
        "ring-gray-300 dark:ring-gray-800",
        "data-[disabled]:bg-gray-100 data-[disabled]:text-gray-400 data-[disabled]:ring-gray-300",
        "data-[disabled]:dark:bg-gray-800 data-[disabled]:dark:text-gray-500 data-[disabled]:dark:ring-gray-700",
        "enabled:data-[state=checked]:bg-blue-500 enabled:data-[state=checked]:ring-0 enabled:data-[state=checked]:ring-transparent",
        "enabled:data-[state=indeterminate]:bg-blue-500 enabled:data-[state=indeterminate]:ring-0 enabled:data-[state=indeterminate]:ring-transparent",
        focusRing,
        className
      )
    : cn(
        "grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className
      )

  const indicatorClasses = variant === "tremor" 
    ? "flex size-full items-center justify-center"
    : cn("grid place-content-center text-current")

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={baseClasses}
      checked={checked}
      {...(variant === "tremor" && { "tremor-id": "tremor-raw" })}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        {...(variant === "tremor" && { asChild: true })}
        className={indicatorClasses}
      >
        {checked === "indeterminate" ? (
          <MinusIcon variant={variant} />
        ) : (
          <XIcon variant={variant} />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})

Checkbox.displayName = CheckboxPrimitive.Root.displayName
CheckboxExclude.displayName = "CheckboxExclude"

export { Checkbox, CheckboxExclude }
