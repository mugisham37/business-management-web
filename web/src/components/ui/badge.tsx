import * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"
import { cx } from "@/lib/utils"

const badgeVariants = tv({
  base: cx(
    "inline-flex items-center gap-x-1 whitespace-nowrap rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  ),
  variants: {
    variant: {
      default: [
        "bg-primary text-primary-foreground shadow hover:bg-primary/80 border-transparent",
        "ring-primary/30"
      ],
      secondary: [
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border-transparent",
        "ring-secondary/30"
      ],
      destructive: [
        "bg-destructive text-destructive-foreground shadow hover:bg-destructive/80 border-transparent",
        "ring-destructive/30"
      ],
      outline: [
        "text-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        "ring-border/30"
      ],
      neutral: [
        "bg-gray-50 text-gray-900 ring-gray-500/30",
        "dark:bg-gray-400/10 dark:text-gray-400 dark:ring-gray-400/20"
      ],
      success: [
        "bg-emerald-50 text-emerald-900 ring-emerald-600/30",
        "dark:bg-emerald-400/10 dark:text-emerald-400 dark:ring-emerald-400/20"
      ],
      error: [
        "bg-red-50 text-red-900 ring-red-600/20",
        "dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
      ],
      warning: [
        "bg-yellow-50 text-yellow-900 ring-yellow-600/30",
        "dark:bg-yellow-400/10 dark:text-yellow-500 dark:ring-yellow-400/20"
      ],
      gradient: [
        "z-10 block w-fit rounded-lg border border-indigo-200/20 bg-indigo-50/50 px-3 py-1.5 font-semibold uppercase leading-4 tracking-tighter ring-0",
        "dark:border-indigo-800/30 dark:bg-indigo-900/20"
      ]
    },
    size: {
      sm: "px-1.5 py-0.5 text-xs",
      md: "px-2 py-1 text-xs",
      lg: "px-2.5 py-1.5 text-sm"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
})

export interface BadgeProps
  extends React.ComponentPropsWithoutRef<"span">,
    VariantProps<typeof badgeVariants> {
  "tremor-id"?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, children, "tremor-id": tremorId, ...props }, ref) => {
    const isGradient = variant === "gradient"
    
    return (
      <span
        ref={ref}
        className={cx(badgeVariants({ variant, size }), className)}
        tremor-id={tremorId}
        {...props}
      >
        {isGradient ? (
          <span className="bg-gradient-to-b from-indigo-500 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-200 dark:to-indigo-400">
            {children}
          </span>
        ) : (
          children
        )}
      </span>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants }
