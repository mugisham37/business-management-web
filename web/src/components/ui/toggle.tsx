"use client"

import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { Slot } from "@radix-ui/react-slot"
import { tv, type VariantProps } from "tailwind-variants"
import { RiLoader2Fill } from "@remixicon/react"

import { cx, focusRing } from "@/lib/utils"

const toggleVariants = tv({
  base: [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-100 ease-in-out",
    "disabled:pointer-events-none disabled:shadow-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ...focusRing,
  ],
  variants: {
    variant: {
      default: [
        "border border-transparent bg-transparent",
        "text-foreground",
        "hover:bg-muted hover:text-muted-foreground",
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      ],
      outline: [
        "border border-input bg-transparent shadow-sm",
        "text-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      ],
      ghost: [
        "border border-transparent shadow-none bg-transparent",
        "text-foreground",
        "hover:bg-accent hover:text-accent-foreground",
        "data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
      ],
      primary: [
        "border border-transparent shadow-sm",
        "text-primary-foreground bg-primary",
        "hover:bg-primary/90",
        "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        "data-[state=off]:bg-primary/80 data-[state=off]:text-primary-foreground/80",
      ],
      secondary: [
        "border border-gray-300 dark:border-gray-800 shadow-sm",
        "text-gray-900 dark:text-gray-50 bg-white dark:bg-gray-950",
        "hover:bg-gray-50 dark:hover:bg-gray-900/60",
        "data-[state=on]:bg-gray-100 dark:data-[state=on]:bg-gray-800",
        "data-[state=on]:text-gray-900 dark:data-[state=on]:text-gray-50",
      ],
      destructive: [
        "border border-transparent shadow-sm",
        "text-destructive-foreground bg-destructive",
        "hover:bg-destructive/90",
        "data-[state=on]:bg-destructive data-[state=on]:text-destructive-foreground",
        "data-[state=off]:bg-destructive/80 data-[state=off]:text-destructive-foreground/80",
      ],
    },
    size: {
      default: "h-9 px-2 min-w-9",
      sm: "h-8 px-1.5 min-w-8 text-xs",
      lg: "h-10 px-2.5 min-w-10",
      icon: "h-9 w-9 p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ToggleProps
  extends React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root>,
    VariantProps<typeof toggleVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  ToggleProps
>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : TogglePrimitive.Root

    return (
      <Comp
        className={cx(toggleVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-2">
            <RiLoader2Fill
              className="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText || "Loading"}
            </span>
            {loadingText || children}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  },
)

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
