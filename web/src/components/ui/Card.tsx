import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cx } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
  variant?: "default" | "tremor" | "tremor-raw"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, variant = "default", ...props }, ref) => {
    const Component = asChild ? Slot : "div"
    
    const baseClasses = "relative w-full border text-left shadow"
    
    const variantClasses = {
      default: "rounded-xl bg-card text-card-foreground",
      tremor: "rounded-lg p-6 shadow-sm bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-800",
      "tremor-raw": "rounded-lg p-6 shadow-sm bg-white dark:bg-[#090E1A] border-gray-200 dark:border-gray-900"
    }
    
    const tremorProps = (variant === "tremor" || variant === "tremor-raw") ? { "tremor-id": "tremor-raw" } : {}
    
    return (
      <Component
        ref={ref}
        className={cx(baseClasses, variantClasses[variant], className)}
        {...tremorProps}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cx("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cx("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  type CardProps 
}
