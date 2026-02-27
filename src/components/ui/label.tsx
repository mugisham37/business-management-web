"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  disabled?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, disabled, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    aria-disabled={disabled}
    className={cn(
      // base
      "text-sm leading-none select-none",
      // layout
      "flex items-center",
      // text color using CSS variables
      "text-foreground",
      // disabled state
      disabled && "text-muted-foreground pointer-events-none",
      // peer and group disabled support
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-70",
      className
    )}
    {...props}
  />
))

Label.displayName = "Label"

export { Label }
