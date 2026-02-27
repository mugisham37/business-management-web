"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 0,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={
        {
          "--toggle-group-gap": `${spacing * 0.25}rem`,
        } as React.CSSProperties
      }
      className={cn(
        "cn-toggle-group group/toggle-group flex w-fit items-center",
        orientation === "horizontal" ? "flex-row" : "flex-col items-stretch",
        spacing > 0 && "gap-[var(--toggle-group-gap)]",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  const effectiveVariant = context.variant || variant
  const effectiveSize = context.size || size
  const isOutline = effectiveVariant === "outline"
  const hasNoSpacing = context.spacing === 0
  const isHorizontal = context.orientation === "horizontal"

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={effectiveVariant}
      data-size={effectiveSize}
      data-spacing={context.spacing}
      className={cn(
        "cn-toggle-group-item shrink-0",
        // Focus handling
        "focus:z-10 focus-visible:z-10",
        // Border collapsing for outline variant with no spacing
        isOutline &&
          hasNoSpacing &&
          isHorizontal &&
          "border-l-0 first:border-l first:rounded-l-md last:rounded-r-md rounded-none",
        isOutline &&
          hasNoSpacing &&
          !isHorizontal &&
          "border-t-0 first:border-t first:rounded-t-md last:rounded-b-md rounded-none",
        toggleVariants({
          variant: effectiveVariant,
          size: effectiveSize,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
