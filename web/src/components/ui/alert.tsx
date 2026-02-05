"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertTriangle, AlertCircle, Info, Loader2 } from "lucide-react"

import { cx as cn, focusRing } from "@/lib/utils"

// =============================================================================
// ALERT VARIANTS
// =============================================================================

const alertVariants = cva(
  [
    // Base styles
    "relative w-full rounded-lg border text-sm transition-all duration-200",
    // Icon positioning
    "[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
    "[&>svg]:text-current [&>svg~*]:pl-7",
    // Focus styles for interactive alerts
    focusRing,
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-background text-foreground border-border",
          "[&>svg]:text-muted-foreground",
        ],
        destructive: [
          "border-destructive/50 text-destructive bg-destructive/5",
          "dark:border-destructive dark:bg-destructive/10",
          "[&>svg]:text-destructive",
        ],
        warning: [
          "border-yellow-500/50 text-yellow-800 bg-yellow-50",
          "dark:border-yellow-500/50 dark:text-yellow-200 dark:bg-yellow-950/20",
          "[&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400",
        ],
        success: [
          "border-green-500/50 text-green-800 bg-green-50",
          "dark:border-green-500/50 dark:text-green-200 dark:bg-green-950/20",
          "[&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        ],
        info: [
          "border-blue-500/50 text-blue-800 bg-blue-50",
          "dark:border-blue-500/50 dark:text-blue-200 dark:bg-blue-950/20",
          "[&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
        ],
      },
      size: {
        sm: "px-3 py-2 text-xs",
        default: "px-4 py-3",
        lg: "px-6 py-4 text-base",
      },
      rounded: {
        none: "rounded-none",
        sm: "rounded-sm",
        default: "rounded-lg",
        lg: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  }
)

const alertIconVariants = cva(
  [
    "flex-shrink-0 transition-colors duration-200",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-5 w-5",
        lg: "h-6 w-6",
      },
      variant: {
        default: "text-muted-foreground",
        destructive: "text-destructive",
        warning: "text-yellow-600 dark:text-yellow-400",
        success: "text-green-600 dark:text-green-400",
        info: "text-blue-600 dark:text-blue-400",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  /**
   * Whether the alert can be dismissed
   * @default false
   */
  dismissible?: boolean
  /**
   * Callback when the alert is dismissed
   */
  onDismiss?: () => void
  /**
   * Custom dismiss button aria label
   * @default "Dismiss alert"
   */
  dismissAriaLabel?: string
  /**
   * Whether to show a loading state
   * @default false
   */
  isLoading?: boolean
  /**
   * Custom icon to display
   */
  icon?: React.ReactNode
  /**
   * Whether to show the default variant icon
   * @default true
   */
  showIcon?: boolean
  /**
   * Animation type for entrance/exit
   * @default "fade"
   */
  animation?: "none" | "fade" | "slide" | "scale"
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Heading level for semantic HTML
   * @default "h5"
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to truncate long descriptions
   * @default false
   */
  truncate?: boolean
  /**
   * Maximum number of lines before truncation
   * @default 3
   */
  maxLines?: number
}

interface AlertIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertIconVariants> {
  /**
   * Icon element to display
   */
  icon?: React.ReactNode
  /**
   * Whether the icon should pulse (for loading states)
   * @default false
   */
  pulse?: boolean
}

interface AlertActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Layout direction for actions
   * @default "row"
   */
  direction?: "row" | "column"
  /**
   * Alignment of actions
   * @default "end"
   */
  align?: "start" | "center" | "end" | "between"
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get default icon for alert variant
 */
const getDefaultIcon = (variant: string, isLoading: boolean) => {
  if (isLoading) return <Loader2 className="animate-spin" />
  
  switch (variant) {
    case "destructive":
      return <AlertCircle />
    case "warning":
      return <AlertTriangle />
    case "success":
      return <CheckCircle />
    case "info":
      return <Info />
    default:
      return <Info />
  }
}

/**
 * Get animation classes based on animation type
 */
const getAnimationClasses = (animation: string) => {
  switch (animation) {
    case "fade":
      return "animate-in fade-in-0 duration-300"
    case "slide":
      return "animate-in slide-in-from-top-2 duration-300"
    case "scale":
      return "animate-in zoom-in-95 duration-300"
    default:
      return ""
  }
}

// =============================================================================
// ALERT COMPONENTS
// =============================================================================

/**
 * Alert Component
 * Displays important information to users with various styling options
 */
const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    className,
    variant = "default",
    size = "default",
    rounded = "default",
    dismissible = false,
    onDismiss,
    dismissAriaLabel = "Dismiss alert",
    isLoading = false,
    icon,
    showIcon = true,
    animation = "fade",
    children,
    ...props
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = React.useCallback(() => {
      setIsVisible(false)
      onDismiss?.()
    }, [onDismiss])

    if (!isVisible) return null

    const defaultIcon = showIcon ? getDefaultIcon(variant || "default", isLoading) : null
    const displayIcon = icon || defaultIcon
    const animationClasses = animation !== "none" ? getAnimationClasses(animation) : ""

    return (
      <div
        ref={ref}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          alertVariants({ variant, size, rounded }),
          animationClasses,
          className
        )}
        {...props}
      >
        {displayIcon && (
          <div className="absolute left-4 top-4">
            {React.isValidElement(displayIcon) 
              ? React.cloneElement(displayIcon, {
                  className: cn(
                    alertIconVariants({ variant, size }),
                    (displayIcon.props as any)?.className
                  ),
                } as any)
              : displayIcon
            }
          </div>
        )}
        
        <div className={cn("flex-1", displayIcon && "pl-7")}>
          {children}
        </div>

        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            aria-label={dismissAriaLabel}
            className={cn(
              "absolute right-2 top-2 rounded-sm p-1 opacity-70 transition-opacity",
              "hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2",
              "focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              "disabled:pointer-events-none"
            )}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

/**
 * Alert Title Component
 * Semantic heading for the alert content
 */
const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, as: Component = "h5", ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        "mb-1 font-medium leading-none tracking-tight",
        "text-current",
        className
      )}
      {...props}
    />
  )
)
AlertTitle.displayName = "AlertTitle"

/**
 * Alert Description Component
 * Supporting text content for the alert
 */
const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, truncate = false, maxLines = 3, ...props }, ref) => {
    const truncateClasses = truncate
      ? `line-clamp-${maxLines} overflow-hidden`
      : ""

    return (
      <div
        ref={ref}
        className={cn(
          "text-sm leading-relaxed [&_p]:leading-relaxed",
          "text-current/90",
          truncateClasses,
          className
        )}
        {...props}
      />
    )
  }
)
AlertDescription.displayName = "AlertDescription"

/**
 * Alert Icon Component
 * Customizable icon container for alerts
 */
const AlertIcon = React.forwardRef<HTMLDivElement, AlertIconProps>(
  ({ className, variant, size, icon, pulse = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute left-4 top-4",
        alertIconVariants({ variant, size }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      {icon}
    </div>
  )
)
AlertIcon.displayName = "AlertIcon"

/**
 * Alert Actions Component
 * Container for action buttons within alerts
 */
const AlertActions = React.forwardRef<HTMLDivElement, AlertActionsProps>(
  ({ className, direction = "row", align = "end", ...props }, ref) => {
    const directionClasses = {
      row: "flex-row space-x-2",
      column: "flex-col space-y-2",
    }

    const alignClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex mt-3",
          directionClasses[direction],
          alignClasses[align],
          className
        )}
        {...props}
      />
    )
  }
)
AlertActions.displayName = "AlertActions"

/**
 * Alert Body Component
 * Wrapper for alert content with consistent spacing
 */
const AlertBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
)
AlertBody.displayName = "AlertBody"

// =============================================================================
// COMPOUND COMPONENTS
// =============================================================================

/**
 * Alert List Component
 * Container for multiple alerts with proper spacing
 */
const AlertList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    />
  )
)
AlertList.displayName = "AlertList"

/**
 * Alert Group Component
 * Groups related alerts with shared styling
 */
const AlertGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /**
     * Shared variant for all alerts in the group
     */
    variant?: VariantProps<typeof alertVariants>["variant"]
    /**
     * Shared size for all alerts in the group
     */
    size?: VariantProps<typeof alertVariants>["size"]
  }
>(({ className, variant, size, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-2", className)}
    {...props}
  >
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child) && child.type === Alert) {
        return React.cloneElement(child as React.ReactElement<AlertProps>, {
          variant: (child.props as AlertProps).variant || variant,
          size: (child.props as AlertProps).size || size,
        })
      }
      return child
    })}
  </div>
))
AlertGroup.displayName = "AlertGroup"

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
  AlertActions,
  AlertBody,
  AlertList,
  AlertGroup,
  alertVariants,
  alertIconVariants,
}

export type {
  AlertProps,
  AlertTitleProps,
  AlertDescriptionProps,
  AlertIconProps,
  AlertActionsProps,
}
