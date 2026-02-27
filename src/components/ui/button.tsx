import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    // base
    "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg border text-center text-sm font-medium shadow-sm transition-all duration-100 ease-in-out",
    // disabled
    "disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
    // focus
    "outline outline-offset-2 outline-0 focus-visible:outline-2 outline-ring",
    // svg handling
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    // group and selection
    "group/button select-none",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          // border
          "border-transparent",
          // colors using CSS variables
          "bg-primary text-primary-foreground",
          // hover
          "hover:bg-primary/90",
        ].join(" "),
        primary: [
          // border
          "border-transparent",
          // colors using CSS variables
          "bg-primary text-primary-foreground",
          // hover
          "hover:bg-primary/90",
        ].join(" "),
        secondary: [
          // border
          "border-border",
          // colors using CSS variables
          "bg-secondary text-secondary-foreground",
          // hover
          "hover:bg-secondary/80",
        ].join(" "),
        outline: [
          // border
          "border-border",
          // colors using CSS variables
          "bg-background text-foreground",
          // hover
          "hover:bg-accent hover:text-accent-foreground",
        ].join(" "),
        ghost: [
          // base
          "shadow-none",
          // border
          "border-transparent",
          // colors using CSS variables
          "bg-transparent text-foreground",
          // hover
          "hover:bg-accent hover:text-accent-foreground",
        ].join(" "),
        link: [
          // base
          "shadow-none",
          // border
          "border-transparent",
          // colors using CSS variables
          "bg-transparent text-primary",
          // hover
          "hover:underline",
        ].join(" "),
        destructive: [
          // border
          "border-transparent",
          // colors using CSS variables
          "bg-destructive text-destructive-foreground",
          // hover
          "hover:bg-destructive/90",
        ].join(" "),
      },
      size: {
        default: "h-10 px-4 py-2",
        xs: "h-7 px-2 text-xs",
        sm: "h-9 px-3 text-sm",
        lg: "h-11 px-8 text-base",
        icon: "h-10 w-10",
        "icon-xs": "h-7 w-7",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

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
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        {...props}
      >
        {isLoading ? (
          <span className="pointer-events-none flex shrink-0 items-center justify-center gap-1.5">
            <svg
              className="size-4 shrink-0 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">
              {loadingText ? loadingText : "Loading"}
            </span>
            {loadingText ? loadingText : children}
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants, type ButtonProps }
