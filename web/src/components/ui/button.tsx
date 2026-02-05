import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { RiLoader2Fill } from "@remixicon/react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        light: "bg-muted text-muted-foreground shadow-none hover:bg-muted/80",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading = false, loadingText, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <RiLoader2Fill className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
// Tremor Button [v0.2.0]

import { Slot } from "@radix-ui/react-slot"
import { RiLoader2Fill } from "@remixicon/react"
import React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusRing } from "@/lib/utils"

const buttonVariants = tv({
  base: [
    // base
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out",
    // disabled
    "disabled:pointer-events-none disabled:shadow-none",
    // focus
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        // border
        "border-transparent",
        // text color
        "text-white dark:text-white",
        // background color
        "bg-blue-500 dark:bg-blue-500",
        // hover color
        "hover:bg-blue-600 dark:hover:bg-blue-600",
        // disabled
        "disabled:bg-blue-300 disabled:text-white",
        "disabled:dark:bg-blue-800 disabled:dark:text-blue-400",
      ],
      secondary: [
        // border
        "border-gray-300 dark:border-gray-800",
        // text color
        "text-gray-900 dark:text-gray-50",
        // background color
        "bg-white dark:bg-gray-950",
        //hover color
        "hover:bg-gray-50 dark:hover:bg-gray-900/60",
        // disabled
        "disabled:text-gray-400",
        "disabled:dark:text-gray-600",
      ],
      light: [
        // base
        "shadow-none",
        // border
        "border-transparent",
        // text color
        "text-gray-900 dark:text-gray-50",
        // background color
        "bg-gray-200 dark:bg-gray-900",
        // hover color
        "hover:bg-gray-300/70 dark:hover:bg-gray-800/80",
        // disabled
        "disabled:bg-gray-100 disabled:text-gray-400",
        "disabled:dark:bg-gray-800 disabled:dark:text-gray-600",
      ],
      ghost: [
        // base
        "shadow-none",
        // border
        "border-transparent",
        // text color
        "text-gray-900 dark:text-gray-50",
        // hover color
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/80",
        // disabled
        "disabled:text-gray-400",
        "disabled:dark:text-gray-600",
      ],
      destructive: [
        // text color
        "text-white",
        // border
        "border-transparent",
        // background color
        "bg-red-600 dark:bg-red-700",
        // hover color
        "hover:bg-red-700 dark:hover:bg-red-600",
        // disabled
        "disabled:bg-red-300 disabled:text-white",
        "disabled:dark:bg-red-950 disabled:dark:text-red-400",
      ],
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      isLoading = false,
      loadingText,
      className,
      disabled,
      variant,
      children,
      ...props
    }: ButtonProps,
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), className)}
        disabled={disabled || isLoading}
        tremor-id="tremor-raw"
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
            <RiLoader2Fill
              className="animate-spin size-4 shrink-0"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Component>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
// Tremor Button [v0.2.0]

import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { RiLoader2Fill } from "@remixicon/react"
import { tv, type VariantProps } from "tailwind-variants"

import { cx, focusRing } from "@/lib/utils"

const buttonVariants = tv({
  base: [
    // base
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-md border px-3 py-2 text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out",
    // disabled
    "disabled:pointer-events-none disabled:shadow-none",
    // focus
    focusRing,
  ],
  variants: {
    variant: {
      primary: [
        // border
        "border-transparent",
        // text color
        "text-white dark:text-white",
        // background color
        "bg-blue-500 dark:bg-blue-500",
        // hover color
        "hover:bg-blue-600 dark:hover:bg-blue-600",
        // disabled
        "disabled:bg-blue-300 disabled:text-white",
        "disabled:dark:bg-blue-800 disabled:dark:text-blue-400",
      ],
      secondary: [
        // border
        "border-gray-300 dark:border-gray-800",
        // text color
        "text-gray-900 dark:text-gray-50",
        // background color
        "bg-white dark:bg-gray-950",
        //hover color
        "hover:bg-gray-50 dark:hover:bg-gray-900/60",
        // disabled
        "disabled:text-gray-400",
        "disabled:dark:text-gray-600",
      ],
      light: [
        // base
        "shadow-none",
        // border
        "border-transparent",
        // text color
        "text-gray-900 dark:text-gray-50",
        // background color
        "bg-gray-200 dark:bg-gray-900",
        // hover color
        "hover:bg-gray-300/70 dark:hover:bg-gray-800/80",
        // disabled
        "disabled:bg-gray-100 disabled:text-gray-400",
        "disabled:dark:bg-gray-800 disabled:dark:text-gray-600",
      ],
      ghost: [
        // base
        "shadow-none",
        // border
        "border-transparent",
        // text color
        "text-gray-900 dark:text-gray-50",
        // hover color
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/80",
        // disabled
        "disabled:text-gray-400",
        "disabled:dark:text-gray-600",
      ],
      destructive: [
        // text color
        "text-white",
        // border
        "border-transparent",
        // background color
        "bg-red-600 dark:bg-red-700",
        // hover color
        "hover:bg-red-700 dark:hover:bg-red-600",
        // disabled
        "disabled:bg-red-300 disabled:text-white",
        "disabled:dark:bg-red-950 disabled:dark:text-red-400",
      ],
    },
  },
  defaultVariants: {
    variant: "primary",
  },
})

interface ButtonProps
  extends React.ComponentPropsWithoutRef<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      asChild,
      isLoading = false,
      loadingText,
      className,
      disabled,
      variant,
      children,
      ...props
    }: ButtonProps,
    forwardedRef,
  ) => {
    const Component = asChild ? Slot : "button"
    return (
      <Component
        ref={forwardedRef}
        className={cx(buttonVariants({ variant }), className)}
        disabled={disabled || isLoading}
        tremor-id="tremor-raw"
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
            <RiLoader2Fill
              className="size-4 shrink-0 animate-spin"
              aria-hidden="true"
            />
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Component>
    )
  },
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
