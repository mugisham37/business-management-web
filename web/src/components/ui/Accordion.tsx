"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"
import { RiAddLine, RiArrowDownSLine } from "@remixicon/react"
import { cx } from "@/lib/utils"

// =============================================================================
// ACCORDION COMPONENT VARIANTS
// =============================================================================

/**
 * Icon variants for accordion triggers
 */
type AccordionIconVariant = "chevron" | "plus" | "arrow"

/**
 * Style variants for accordion components
 */
type AccordionStyleVariant = "default" | "tremor" | "minimal"

/**
 * Animation variants for accordion content
 */
type AccordionAnimationVariant = "slide" | "fade" | "scale"

// =============================================================================
// ACCORDION ROOT
// =============================================================================

const Accordion = AccordionPrimitive.Root

Accordion.displayName = "Accordion"

// =============================================================================
// ACCORDION ITEM
// =============================================================================

interface AccordionItemProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {
  variant?: AccordionStyleVariant
  noBorder?: boolean
}

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, variant = "default", noBorder = false, ...props }, ref) => {
  const baseStyles = "overflow-hidden first:mt-0"
  
  const variantStyles = {
    default: "border-b border-border",
    tremor: "border-b border-gray-200 dark:border-gray-800",
    minimal: "border-b border-gray-100 dark:border-gray-900"
  }

  const borderStyles = noBorder ? "" : variantStyles[variant]

  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cx(baseStyles, borderStyles, className)}
      tremor-id={variant === "tremor" ? "tremor-raw" : undefined}
      {...props}
    />
  )
})
AccordionItem.displayName = "AccordionItem"

// =============================================================================
// ACCORDION TRIGGER
// =============================================================================

interface AccordionTriggerProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {
  variant?: AccordionStyleVariant
  iconVariant?: AccordionIconVariant
  hideIcon?: boolean
  iconPosition?: "left" | "right"
}

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ 
  className, 
  children, 
  variant = "default", 
  iconVariant = "chevron",
  hideIcon = false,
  iconPosition = "right",
  ...props 
}, ref) => {
  const baseStyles = cx(
    // Layout
    "group flex flex-1 cursor-pointer items-center text-left font-medium leading-none",
    // Spacing based on variant
    variant === "default" ? "justify-between py-4 text-sm" : "justify-between py-3 text-sm",
    // Focus states
    "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset",
    variant === "default" 
      ? "focus-visible:ring-ring" 
      : "focus-visible:ring-blue-500",
    // Hover states
    variant === "default" ? "transition-all hover:underline" : "",
    // Text colors
    variant === "default" 
      ? "text-foreground" 
      : "text-gray-900 dark:text-gray-50",
    // Disabled states
    "data-[disabled]:cursor-default",
    variant === "default"
      ? "data-[disabled]:opacity-50"
      : "data-[disabled]:text-gray-400 dark:data-[disabled]:text-gray-600"
  )

  const getIcon = () => {
    if (hideIcon) return null

    const iconBaseStyles = cx(
      "size-4 shrink-0 transition-transform duration-200",
      variant === "default" 
        ? "text-muted-foreground" 
        : "text-gray-400 dark:text-gray-600",
      // Disabled icon states
      variant === "default"
        ? "group-data-[disabled]:opacity-50"
        : "group-data-[disabled]:text-gray-300 group-data-[disabled]:dark:text-gray-700"
    )

    const iconProps = {
      className: iconBaseStyles,
      "aria-hidden": "true" as const,
      focusable: "false" as const
    }

    switch (iconVariant) {
      case "plus":
        return (
          <RiAddLine
            {...iconProps}
            className={cx(
              iconBaseStyles,
              "size-5 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:-rotate-45"
            )}
          />
        )
      case "arrow":
        return (
          <RiArrowDownSLine
            {...iconProps}
            className={cx(
              iconBaseStyles,
              "size-5 ease-[cubic-bezier(0.87,_0,_0.13,_1)] group-data-[state=open]:rotate-180"
            )}
          />
        )
      case "chevron":
      default:
        return (
          <ChevronDown
            {...iconProps}
            className={cx(
              iconBaseStyles,
              variant === "default"
                ? "[&[data-state=open]>svg]:rotate-180 group-data-[state=open]:rotate-180"
                : "group-data-[state=open]:rotate-180"
            )}
          />
        )
    }
  }

  const icon = getIcon()

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cx(baseStyles, className)}
        {...props}
      >
        {iconPosition === "left" && icon}
        <span className={cx("flex-1", iconPosition === "left" && !hideIcon ? "ml-3" : "")}>
          {children}
        </span>
        {iconPosition === "right" && icon}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

// =============================================================================
// ACCORDION CONTENT
// =============================================================================

interface AccordionContentProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {
  variant?: AccordionStyleVariant
  animationVariant?: AccordionAnimationVariant
  padding?: "none" | "sm" | "md" | "lg"
}

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ 
  className, 
  children, 
  variant = "default", 
  animationVariant = "slide",
  padding = "md",
  ...props 
}, ref) => {
  const getAnimationClasses = () => {
    switch (animationVariant) {
      case "fade":
        return "data-[state=closed]:animate-fadeOut data-[state=open]:animate-fadeIn"
      case "scale":
        return "data-[state=closed]:animate-scaleOut data-[state=open]:animate-scaleIn"
      case "slide":
      default:
        return variant === "default"
          ? "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
          : "data-[state=closed]:animate-accordionClose data-[state=open]:animate-accordionOpen"
    }
  }

  const getPaddingClasses = () => {
    switch (padding) {
      case "none":
        return ""
      case "sm":
        return "pb-2 pt-0"
      case "lg":
        return "pb-6 pt-0"
      case "md":
      default:
        return "pb-4 pt-0"
    }
  }

  const contentStyles = cx(
    "overflow-hidden text-sm",
    // Performance optimization
    animationVariant === "slide" ? "transform-gpu" : "",
    getAnimationClasses()
  )

  const innerStyles = cx(
    getPaddingClasses(),
    // Text colors based on variant
    variant === "default" 
      ? "text-muted-foreground" 
      : "text-gray-700 dark:text-gray-200",
    className
  )

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={contentStyles}
      {...props}
    >
      <div className={innerStyles}>
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
})
AccordionContent.displayName = "AccordionContent"

// =============================================================================
// COMPOUND ACCORDION COMPONENTS
// =============================================================================

/**
 * Pre-configured Tremor-style accordion
 */
const TremorAccordion = {
  Root: (props: React.ComponentPropsWithoutRef<typeof Accordion>) => (
    <Accordion {...props} />
  ),
  Item: (props: Omit<AccordionItemProps, 'variant'>) => (
    <AccordionItem variant="tremor" {...props} />
  ),
  Trigger: (props: Omit<AccordionTriggerProps, 'variant'>) => (
    <AccordionTrigger variant="tremor" iconVariant="plus" {...props} />
  ),
  Content: (props: Omit<AccordionContentProps, 'variant'>) => (
    <AccordionContent variant="tremor" {...props} />
  )
}

/**
 * Pre-configured minimal accordion
 */
const MinimalAccordion = {
  Root: (props: React.ComponentPropsWithoutRef<typeof Accordion>) => (
    <Accordion {...props} />
  ),
  Item: (props: Omit<AccordionItemProps, 'variant'>) => (
    <AccordionItem variant="minimal" noBorder {...props} />
  ),
  Trigger: (props: Omit<AccordionTriggerProps, 'variant'>) => (
    <AccordionTrigger variant="minimal" iconVariant="arrow" {...props} />
  ),
  Content: (props: Omit<AccordionContentProps, 'variant'>) => (
    <AccordionContent variant="minimal" padding="sm" {...props} />
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  TremorAccordion,
  MinimalAccordion,
}

export type {
  AccordionIconVariant,
  AccordionStyleVariant,
  AccordionAnimationVariant,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
}

