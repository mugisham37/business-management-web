"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cx as cn, focusRing } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

// =============================================================================
// ALERT DIALOG VARIANTS
// =============================================================================

const alertDialogContentVariants = cva(
  [
    // Base styles
    "fixed left-[50%] top-[50%] z-50 grid translate-x-[-50%] translate-y-[-50%] gap-4",
    "border bg-background shadow-lg duration-200",
    // Focus styles
    focusRing,
    // Animation styles
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  ],
  {
    variants: {
      size: {
        sm: "w-full max-w-sm p-4 sm:rounded-md",
        default: "w-full max-w-lg p-6 sm:rounded-lg",
        lg: "w-full max-w-2xl p-6 sm:rounded-lg",
        xl: "w-full max-w-4xl p-8 sm:rounded-xl",
        full: "w-[95vw] max-w-none p-6 sm:rounded-lg",
      },
      variant: {
        default: "border-border",
        destructive: "border-destructive/50 bg-destructive/5",
        warning: "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20",
        success: "border-green-500/50 bg-green-50 dark:bg-green-950/20",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const alertDialogOverlayVariants = cva([
  "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm",
  "data-[state=open]:animate-in data-[state=closed]:animate-out",
  "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
])

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface AlertDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    VariantProps<typeof alertDialogContentVariants> {
  /**
   * Whether to show the close button
   * @default false
   */
  showCloseButton?: boolean
  /**
   * Custom close button aria label
   * @default "Close dialog"
   */
  closeButtonAriaLabel?: string
  /**
   * Callback when the close button is clicked
   */
  onCloseClick?: () => void
}

interface AlertDialogOverlayProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay> {
  /**
   * Whether clicking the overlay should close the dialog
   * @default true
   */
  closeOnOverlayClick?: boolean
}

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to center the header content
   * @default false
   */
  centered?: boolean
}

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Footer layout direction
   * @default "row"
   */
  direction?: "row" | "column" | "row-reverse" | "column-reverse"
  /**
   * Footer content alignment
   * @default "end"
   */
  align?: "start" | "center" | "end" | "between" | "around"
}

interface AlertDialogActionProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> {
  /**
   * Button variant
   * @default "default"
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  /**
   * Button size
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "icon"
  /**
   * Loading state
   * @default false
   */
  isLoading?: boolean
  /**
   * Loading text to display
   */
  loadingText?: string
}

interface AlertDialogCancelProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel> {
  /**
   * Button variant
   * @default "outline"
   */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  /**
   * Button size
   * @default "default"
   */
  size?: "default" | "sm" | "lg" | "icon"
}

// =============================================================================
// ALERT DIALOG COMPONENTS
// =============================================================================

/**
 * AlertDialog Root Component
 * Manages the open/closed state of the alert dialog
 */
const AlertDialog = AlertDialogPrimitive.Root

/**
 * AlertDialog Trigger Component
 * Button that opens the alert dialog
 */
const AlertDialogTrigger = AlertDialogPrimitive.Trigger

/**
 * AlertDialog Portal Component
 * Renders the dialog content in a portal
 */
const AlertDialogPortal = AlertDialogPrimitive.Portal

/**
 * AlertDialog Overlay Component
 * Semi-transparent backdrop behind the dialog
 */
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  AlertDialogOverlayProps
>(({ className, closeOnOverlayClick = true, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(alertDialogOverlayVariants(), className)}
    {...props}
    onClick={closeOnOverlayClick ? props.onClick : undefined}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

/**
 * AlertDialog Content Component
 * Main dialog container with content
 */
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(({ 
  className, 
  size, 
  variant, 
  showCloseButton = false,
  closeButtonAriaLabel = "Close dialog",
  onCloseClick,
  children,
  ...props 
}, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(alertDialogContentVariants({ size, variant }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <AlertDialogPrimitive.Cancel asChild>
          <button
            className={cn(
              "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background",
              "transition-opacity hover:opacity-100 focus:outline-none focus:ring-2",
              "focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
              "data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            )}
            aria-label={closeButtonAriaLabel}
            onClick={onCloseClick}
          >
            <X className="h-4 w-4" />
          </button>
        </AlertDialogPrimitive.Cancel>
      )}
    </AlertDialogPrimitive.Content>
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

/**
 * AlertDialog Header Component
 * Container for dialog title and description
 */
const AlertDialogHeader = React.forwardRef<
  HTMLDivElement,
  AlertDialogHeaderProps
>(({ className, centered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2",
      centered ? "text-center" : "text-center sm:text-left",
      className
    )}
    {...props}
  />
))
AlertDialogHeader.displayName = "AlertDialogHeader"

/**
 * AlertDialog Footer Component
 * Container for dialog action buttons
 */
const AlertDialogFooter = React.forwardRef<
  HTMLDivElement,
  AlertDialogFooterProps
>(({ className, direction = "row", align = "end", ...props }, ref) => {
  const directionClasses = {
    row: "flex-row",
    column: "flex-col",
    "row-reverse": "flex-row-reverse",
    "column-reverse": "flex-col-reverse",
  }

  const alignClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  }

  const gapClasses = {
    row: "space-x-2",
    column: "space-y-2",
    "row-reverse": "space-x-reverse space-x-2",
    "column-reverse": "space-y-reverse space-y-2",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        directionClasses[direction],
        alignClasses[align],
        direction.includes("column") ? "sm:flex-row sm:justify-end sm:space-y-0 sm:space-x-2" : "",
        gapClasses[direction],
        className
      )}
      {...props}
    />
  )
})
AlertDialogFooter.displayName = "AlertDialogFooter"

/**
 * AlertDialog Title Component
 * Main heading for the dialog
 */
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

/**
 * AlertDialog Description Component
 * Supporting text for the dialog
 */
const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName

/**
 * AlertDialog Action Component
 * Primary action button (usually destructive or confirmatory)
 */
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  AlertDialogActionProps
>(({ 
  className, 
  variant = "default", 
  size = "default", 
  isLoading = false,
  loadingText,
  children,
  disabled,
  ...props 
}, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(buttonVariants({ variant, size }), className)}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? (
      <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {loadingText || children}
      </>
    ) : (
      children
    )}
  </AlertDialogPrimitive.Action>
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

/**
 * AlertDialog Cancel Component
 * Secondary action button (usually cancels the action)
 */
const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  AlertDialogCancelProps
>(({ 
  className, 
  variant = "outline", 
  size = "default", 
  ...props 
}, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(
      buttonVariants({ variant, size }),
      "mt-2 sm:mt-0",
      className
    )}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

// =============================================================================
// COMPOUND COMPONENTS
// =============================================================================

/**
 * AlertDialog Body Component
 * Convenient wrapper for common dialog content structure
 */
const AlertDialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 space-y-4", className)}
    {...props}
  />
))
AlertDialogBody.displayName = "AlertDialogBody"

/**
 * AlertDialog Icon Component
 * Icon container for visual context
 */
const AlertDialogIcon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "destructive" | "warning" | "success" | "info"
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantClasses = {
    default: "text-muted-foreground",
    destructive: "text-destructive",
    warning: "text-yellow-600 dark:text-yellow-400",
    success: "text-green-600 dark:text-green-400",
    info: "text-blue-600 dark:text-blue-400",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full",
        "bg-muted/50 [&>svg]:h-6 [&>svg]:w-6",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
})
AlertDialogIcon.displayName = "AlertDialogIcon"

// =============================================================================
// EXPORTS
// =============================================================================

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogBody,
  AlertDialogIcon,
  alertDialogContentVariants,
  alertDialogOverlayVariants,
}

export type {
  AlertDialogContentProps,
  AlertDialogOverlayProps,
  AlertDialogHeaderProps,
  AlertDialogFooterProps,
  AlertDialogActionProps,
  AlertDialogCancelProps,
}