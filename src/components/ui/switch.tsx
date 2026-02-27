"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@/lib/utils"

interface SwitchProps extends React.ComponentProps<typeof SwitchPrimitive.Root> {
  size?: "sm" | "default"
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ className, size = "default", ...props }, ref) => {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      data-size={size}
      className={cn(
        // Base styles
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-all outline-none",
        // Focus ring using global CSS variables
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        // Background colors using CSS variables
        "bg-muted",
        // Checked state
        "data-[state=checked]:bg-primary",
        // Disabled state
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        // Size variants
        size === "default" && "h-5 w-9 p-0.5",
        size === "sm" && "h-4 w-7 p-0.5",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Base styles
          "pointer-events-none block rounded-full transition-transform duration-150 ease-in-out",
          // Background using CSS variables
          "bg-background shadow-sm",
          // Size variants
          size === "default" && "h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0",
          size === "sm" && "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
})

Switch.displayName = "Switch"

export { Switch }
