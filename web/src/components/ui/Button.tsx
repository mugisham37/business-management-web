import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { tv, type VariantProps } from "tailwind-variants"
import { RiLoader2Fill } from "@remixicon/react"

import { cx, focusRing } from "@/lib/utils"

const buttonVariants = tv({
  base: [
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-100 ease-in-out",
    "disabled:pointer-events-none disabled:shadow-none",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    focusRing,
  ],
  variants: {
    variant: {
      default: [
        "border border-transparent",
        "bg-primary text-primary-foreground shadow",
        "hover:bg-primary/90",
        "disabled:opacity-50",
      ],
      primary: [
        "border border-transparent",
        "text-white dark:text-white",
        "bg-blue-500 dark:bg-blue-500 shadow-sm",
        "hover:bg-blue-600 dark:hover:bg-blue-600",
        "disabled:bg-blue-300 disabled:text-white",
        "disabled:dark:bg-blue-800 disabled:dark:text-blue-400",
      ],
      destructive: [
        "border border-transparent",
        "text-white shadow-sm",
        "bg-red-600 dark:bg-red-700",
        "hover:bg-red-700 dark:hover:bg-red-600",
        "disabled:bg-red-300 disabled:text-white",
        "disabled:dark:bg-red-950 disabled:dark:text-red-400",
      ],
      outline: [
        "border border-input bg-background shadow-sm",
        "hover:bg-accent hover:text-accent-foreground",
        "disabled:opacity-50",
      ],
      secondary: [
        "border border-gray-300 dark:border-gray-800",
        "text-gray-900 dark:text-gray-50",
        "bg-white dark:bg-gray-950 shadow-sm",
        "hover:bg-gray-50 dark:hover:bg-gray-900/60",
        "disabled:text-gray-400",
        "disabled:dark:text-gray-600",
      ],
      ghost: [
        "border border-transparent shadow-none",
        "text-gray-900 dark:text-gray-50",
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/80",
        "disabled:text-gray-400",
        "disabled:dark:text-gray-600",
      ],
      link: [
        "border border-transparent shadow-none",
        "text-primary underline-offset-4 hover:underline",
        "disabled:opacity-50",
      ],
      light: [
        "border border-transparent shadow-none",
        "text-gray-900 dark:text-gray-50",
        "bg-gray-200 dark:bg-gray-900",
        "hover:bg-gray-300/70 dark:hover:bg-gray-800/80",
        "disabled:bg-gray-100 disabled:text-gray-400",
        "disabled:dark:bg-gray-800 disabled:dark:text-gray-600",
      ],
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 px-3 text-xs",
      lg: "h-10 px-8",
      icon: "h-9 w-9 p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
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
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cx(buttonVariants({ variant, size }), className)}
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

Button.displayName = "Button"

export { Button, buttonVariants }
