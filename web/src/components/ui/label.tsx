"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cx } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-900 dark:text-gray-50"
)

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  disabled?: boolean
}

const Label = React.forwardRef<
  React.ComponentRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, disabled, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cx(
      labelVariants(),
      {
        "text-gray-400 dark:text-gray-600 cursor-not-allowed": disabled,
      },
      className
    )}
    aria-disabled={disabled}
    tremor-id="tremor-raw"
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }