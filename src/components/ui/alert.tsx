import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const alertVariants = cva(
  [
    // Base layout and structure
    "relative w-full text-sm border rounded-lg",
    "grid grid-cols-[0_1fr] gap-y-0.5 items-center",
    "px-4 py-3",
    // Icon handling
    "has-[>svg]:grid-cols-[1.5rem_1fr] has-[>svg]:gap-x-3",
    "[&>svg:not([class*=size-])]:size-4",
    // Multi-line content adjustments
    "has-[>[data-slot=alert-title]+[data-slot=alert-description]]:items-start",
    "has-[>[data-slot=alert-title]+[data-slot=alert-description]]:[&_svg]:translate-y-0.5",
    "has-[>[data-slot=alert-title]+[data-slot=alert-description]]:[&_[data-slot=alert-action]]:sm:row-end-3",
  ],
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        destructive:
          "border-destructive/30 bg-destructive/5 text-destructive-foreground [&>svg]:text-destructive",
        info: "border-info/30 bg-info/5 text-foreground [&>svg]:text-info",
        success: "border-success/30 bg-success/5 text-foreground [&>svg]:text-success",
        warning: "border-warning/30 bg-warning/5 text-foreground [&>svg]:text-warning",
        invert:
          "border-invert bg-invert text-invert-foreground [&_[data-slot=alert-description]]:text-invert-foreground/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface AlertProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert"
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Alert.displayName = "Alert"

interface AlertTitleProps extends React.ComponentProps<"h5"> {}

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        data-slot="alert-title"
        className={cn(
          "col-start-2 mb-1 font-medium leading-none tracking-tight",
          className
        )}
        {...props}
      />
    )
  }
)
AlertTitle.displayName = "AlertTitle"

interface AlertDescriptionProps extends React.ComponentProps<"div"> {}

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert-description"
        className={cn(
          "col-start-2 text-sm text-muted-foreground [&_p]:leading-relaxed",
          className
        )}
        {...props}
      />
    )
  }
)
AlertDescription.displayName = "AlertDescription"

interface AlertActionProps extends React.ComponentProps<"div"> {}

const AlertAction = React.forwardRef<HTMLDivElement, AlertActionProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="alert-action"
        className={cn(
          "flex gap-1.5 max-sm:col-start-2 max-sm:mt-2 max-sm:justify-start sm:col-start-3 sm:row-start-1 sm:justify-end sm:self-center",
          className
        )}
        {...props}
      />
    )
  }
)
AlertAction.displayName = "AlertAction"

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants }
export type { AlertProps, AlertTitleProps, AlertDescriptionProps, AlertActionProps }
