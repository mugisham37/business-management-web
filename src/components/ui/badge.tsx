import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center w-fit rounded-md border border-transparent font-medium whitespace-nowrap outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border bg-transparent dark:bg-input/30",
        secondary: "bg-secondary text-secondary-foreground",
        muted: "bg-muted text-muted-foreground",
        accent: "bg-accent text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        "primary-light":
          "bg-primary/10 border-none text-primary dark:bg-primary/20",
        "secondary-light":
          "bg-secondary/10 border-none text-secondary dark:bg-secondary/20",
        "muted-light":
          "bg-muted/50 border-none text-muted-foreground dark:bg-muted/30",
        "accent-light":
          "bg-accent/10 border-none text-accent-foreground dark:bg-accent/20",
        "destructive-light":
          "bg-destructive/10 border-none text-destructive-foreground dark:bg-destructive/20",
        "primary-outline":
          "bg-background border-border text-primary dark:bg-input/30",
        "secondary-outline":
          "bg-background border-border text-secondary dark:bg-input/30",
        "accent-outline":
          "bg-background border-border text-accent-foreground dark:bg-input/30",
        "destructive-outline":
          "bg-background border-border text-destructive-foreground dark:bg-input/30",
        gradient:
          "z-10 w-fit rounded-lg border border-indigo-200/20 bg-indigo-50/50 px-3 py-1.5 font-semibold uppercase leading-4 tracking-tighter dark:border-indigo-800/30 dark:bg-indigo-900/20",
      },
      size: {
        xs: "px-1 py-0.25 text-[0.6rem] leading-none h-4 min-w-4 gap-1",
        sm: "px-1 py-0.25 text-[0.625rem] leading-none h-4.5 min-w-4.5 gap-1",
        default: "px-1.25 py-0.5 text-xs h-5 min-w-5 gap-1",
        lg: "px-1.5 py-0.5 text-xs h-5.5 min-w-5.5 gap-1",
        xl: "px-2 py-0.75 text-sm h-6 min-w-6 gap-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"

    // Special handling for gradient variant
    if (variant === "gradient") {
      return (
        <Comp
          ref={ref}
          data-slot="badge"
          className={cn(badgeVariants({ variant, size, className }))}
          {...props}
        >
          <span className="bg-gradient-to-b from-indigo-500 to-indigo-600 bg-clip-text text-transparent dark:from-indigo-200 dark:to-indigo-400">
            {children}
          </span>
        </Comp>
      )
    }

    return (
      <Comp
        ref={ref}
        data-slot="badge"
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

Badge.displayName = "Badge"

export { Badge, badgeVariants, type BadgeProps }
