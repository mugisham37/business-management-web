"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/components/reui/registry/bases/radix/lib/utils"

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "cn-label flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Label }
// Tremor Label [v0.0.2]

import * as LabelPrimitives from "@radix-ui/react-label"
import React from "react"

import { cx } from "@/lib/utils"

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitives.Root> {
  disabled?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitives.Root>,
  LabelProps
>(({ className, disabled, ...props }, forwardedRef) => (
  <LabelPrimitives.Root
    ref={forwardedRef}
    className={cx(
      // base
      "text-sm leading-none",
      // text color
      "text-gray-900 dark:text-gray-50",
      // disabled
      {
        "text-gray-400 dark:text-gray-600": disabled,
      },
      className,
    )}
    aria-disabled={disabled}
    tremor-id="tremor-raw"
    {...props}
  />
))

Label.displayName = "Label"

export { Label }
