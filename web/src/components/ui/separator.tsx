"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import { tv, type VariantProps } from "tailwind-variants"

import { cx } from "@/lib/utils"

const separatorVariants = tv({
  base: "shrink-0",
  variants: {
    variant: {
      default: "bg-border",
      tremor: "bg-gray-200 dark:bg-gray-800",
    },
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "h-full w-[1px]",
    },
  },
  defaultVariants: {
    variant: "default",
    orientation: "horizontal",
  },
})

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {
  asChild?: boolean
}

const Separator = React.forwardRef<
  React.ComponentRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    { 
      className, 
      orientation = "horizontal", 
      decorative = true, 
      variant = "default",
      asChild = false,
      ...props 
    },
    ref
  ) => {
    const isTremor = variant === "tremor"
    
    return (
      <SeparatorPrimitive.Root
        ref={ref}
        decorative={decorative}
        orientation={orientation}
        asChild={asChild}
        className={cx(
          separatorVariants({ variant, orientation }),
          className
        )}
        {...(isTremor && { "tremor-id": "tremor-raw" })}
        {...props}
      />
    )
  }
)

Separator.displayName = SeparatorPrimitive.Root.displayName

export { Separator, separatorVariants }