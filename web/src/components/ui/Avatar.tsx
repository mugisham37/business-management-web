"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cx } from "@/lib/utils"

// =============================================================================
// AVATAR VARIANTS
// =============================================================================

const avatarVariants = cva(
  [
    "relative flex shrink-0 overflow-hidden",
    "bg-muted text-muted-foreground",
    "select-none items-center justify-center",
  ],
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        default: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
        "2xl": "h-20 w-20 text-xl",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
        rounded: "rounded-md",
      },
      variant: {
        default: "bg-muted text-muted-foreground",
        primary: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border-2 border-border bg-background text-foreground",
        ghost: "bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      size: "default",
      shape: "circle",
      variant: "default",
    },
  }
)

const avatarImageVariants = cva([
  "aspect-square h-full w-full object-cover",
  "transition-opacity duration-200",
])

const avatarFallbackVariants = cva([
  "flex h-full w-full items-center justify-center",
  "font-medium uppercase tracking-wider",
  "transition-colors duration-200",
])

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  /**
   * Alternative text for screen readers when image fails to load
   */
  alt?: string
  /**
   * Source URL for the avatar image
   */
  src?: string
  /**
   * Fallback content when image fails to load
   */
  fallback?: React.ReactNode
  /**
   * Loading state indicator
   * @default false
   */
  isLoading?: boolean
  /**
   * Whether the avatar should have a status indicator
   * @default false
   */
  showStatus?: boolean
  /**
   * Status indicator variant
   * @default "online"
   */
  status?: "online" | "offline" | "away" | "busy" | "invisible"
  /**
   * Custom status color
   */
  statusColor?: string
  /**
   * Whether the avatar is interactive (clickable)
   * @default false
   */
  interactive?: boolean
  /**
   * Click handler for interactive avatars
   */
  onClick?: () => void
  /**
   * Whether to show a border
   * @default false
   */
  bordered?: boolean
  /**
   * Custom border color
   */
  borderColor?: string
}

interface AvatarImageProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  /**
   * Loading state for the image
   * @default false
   */
  isLoading?: boolean
  /**
   * Image fit behavior
   * @default "cover"
   */
  objectFit?: "cover" | "contain" | "fill" | "scale-down"
}

interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  /**
   * Whether to show a loading spinner
   * @default false
   */
  isLoading?: boolean
  /**
   * Custom loading component
   */
  loadingComponent?: React.ReactNode
  /**
   * Delay before showing fallback (in ms)
   * @default 600
   */
  delayMs?: number
}

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum number of avatars to show before showing count
   * @default 3
   */
  max?: number
  /**
   * Size for all avatars in the group
   * @default "default"
   */
  size?: VariantProps<typeof avatarVariants>["size"]
  /**
   * Shape for all avatars in the group
   * @default "circle"
   */
  shape?: VariantProps<typeof avatarVariants>["shape"]
  /**
   * Spacing between avatars
   * @default "default"
   */
  spacing?: "tight" | "default" | "loose"
  /**
   * Whether avatars should stack (overlap)
   * @default true
   */
  stacked?: boolean
  /**
   * Direction of the avatar stack
   * @default "left"
   */
  stackDirection?: "left" | "right"
}

interface AvatarStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Status variant
   * @default "online"
   */
  status?: "online" | "offline" | "away" | "busy" | "invisible"
  /**
   * Custom status color
   */
  color?: string
  /**
   * Size of the status indicator
   * @default "default"
   */
  size?: "sm" | "default" | "lg"
  /**
   * Whether the status should pulse
   * @default false
   */
  pulse?: boolean
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get status indicator color based on status type
 */
const getStatusColor = (status: string, customColor?: string) => {
  if (customColor) return customColor
  
  switch (status) {
    case "online":
      return "bg-green-500"
    case "offline":
      return "bg-gray-400"
    case "away":
      return "bg-yellow-500"
    case "busy":
      return "bg-red-500"
    case "invisible":
      return "bg-gray-300"
    default:
      return "bg-green-500"
  }
}

/**
 * Generate initials from a name string
 */
const getInitials = (name: string): string => {
  if (!name) return ""
  
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Get spacing classes for avatar groups
 */
const getGroupSpacing = (spacing: string, stacked: boolean) => {
  if (!stacked) {
    switch (spacing) {
      case "tight":
        return "space-x-1"
      case "loose":
        return "space-x-4"
      default:
        return "space-x-2"
    }
  }
  
  switch (spacing) {
    case "tight":
      return "-space-x-1"
    case "loose":
      return "-space-x-2"
    default:
      return "-space-x-1.5"
  }
}

// =============================================================================
// AVATAR COMPONENTS
// =============================================================================

/**
 * Avatar Root Component
 * Main container for avatar with comprehensive styling options
 */
const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({
  className,
  size = "default",
  shape = "circle",
  variant = "default",
  alt,
  src,
  fallback,
  isLoading = false,
  showStatus = false,
  status = "online",
  statusColor,
  interactive = false,
  onClick,
  bordered = false,
  borderColor,
  children,
  ...props
}, ref) => {
  const handleClick = React.useCallback(() => {
    if (interactive && onClick) {
      onClick()
    }
  }, [interactive, onClick])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (interactive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault()
      onClick?.()
    }
  }, [interactive, onClick])

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        ref={ref}
        className={cx(
          avatarVariants({ size, shape, variant }),
          interactive && [
            "cursor-pointer transition-transform duration-200",
            "hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2",
            "focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
          ],
          bordered && [
            "ring-2 ring-offset-2 ring-offset-background",
            borderColor ? `ring-[${borderColor}]` : "ring-border",
          ],
          className
        )}
        onClick={interactive ? handleClick : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
        tabIndex={interactive ? 0 : undefined}
        role={interactive ? "button" : undefined}
        aria-label={interactive ? alt : undefined}
        {...props}
      >
        {src && (
          <AvatarImage
            src={src}
            alt={alt}
            isLoading={isLoading}
          />
        )}
        <AvatarFallback isLoading={isLoading}>
          {fallback || (alt ? getInitials(alt) : null)}
        </AvatarFallback>
        {children}
      </AvatarPrimitive.Root>
      
      {showStatus && (
        <AvatarStatus
          status={status}
          color={statusColor}
          size={size === "xs" || size === "sm" ? "sm" : "default"}
        />
      )}
    </div>
  )
})
Avatar.displayName = "Avatar"

/**
 * Avatar Image Component
 * Handles image loading and display with enhanced features
 */
const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({
  className,
  isLoading = false,
  objectFit = "cover",
  ...props
}, ref) => {
  const objectFitClasses = {
    cover: "object-cover",
    contain: "object-contain",
    fill: "object-fill",
    "scale-down": "object-scale-down",
  }

  return (
    <AvatarPrimitive.Image
      ref={ref}
      className={cx(
        avatarImageVariants(),
        objectFitClasses[objectFit],
        isLoading && "opacity-0",
        className
      )}
      {...props}
    />
  )
})
AvatarImage.displayName = "AvatarImage"

/**
 * Avatar Fallback Component
 * Displays fallback content when image fails to load
 */
const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({
  className,
  isLoading = false,
  loadingComponent,
  delayMs = 600,
  children,
  ...props
}, ref) => {
  const defaultLoadingComponent = (
    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  )

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      delayMs={delayMs}
      className={cx(avatarFallbackVariants(), className)}
      {...props}
    >
      {isLoading ? (loadingComponent || defaultLoadingComponent) : children}
    </AvatarPrimitive.Fallback>
  )
})
AvatarFallback.displayName = "AvatarFallback"

/**
 * Avatar Status Component
 * Status indicator for avatar presence/availability
 */
const AvatarStatus = React.forwardRef<HTMLDivElement, AvatarStatusProps>(({
  className,
  status = "online",
  color,
  size = "default",
  pulse = false,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-3 w-3",
    lg: "h-4 w-4",
  }

  const positionClasses = {
    sm: "bottom-0 right-0",
    default: "bottom-0.5 right-0.5",
    lg: "bottom-1 right-1",
  }

  return (
    <div
      ref={ref}
      className={cx(
        "absolute rounded-full border-2 border-background",
        sizeClasses[size],
        positionClasses[size],
        getStatusColor(status, color),
        pulse && "animate-pulse",
        className
      )}
      aria-label={`Status: ${status}`}
      {...props}
    />
  )
})
AvatarStatus.displayName = "AvatarStatus"

/**
 * Avatar Group Component
 * Container for multiple avatars with stacking and overflow handling
 */
const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(({
  className,
  max = 3,
  size = "default",
  shape = "circle",
  spacing = "default",
  stacked = true,
  stackDirection = "left",
  children,
  ...props
}, ref) => {
  const childrenArray = React.Children.toArray(children)
  const visibleChildren = childrenArray.slice(0, max)
  const remainingCount = Math.max(0, childrenArray.length - max)

  const spacingClasses = getGroupSpacing(spacing, stacked)
  const directionClasses = stackDirection === "right" ? "flex-row-reverse" : "flex-row"

  return (
    <div
      ref={ref}
      className={cx(
        "flex items-center",
        directionClasses,
        spacingClasses,
        className
      )}
      {...props}
    >
      {visibleChildren.map((child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<AvatarProps>, {
            key: index,
            size: (child.props as AvatarProps).size || size,
            shape: (child.props as AvatarProps).shape || shape,
            className: cx(
              stacked && "ring-2 ring-background",
              (child.props as AvatarProps).className
            ),
          })
        }
        return child
      })}
      
      {remainingCount > 0 && (
        <Avatar
          size={size}
          shape={shape}
          variant="secondary"
          className={cx(stacked && "ring-2 ring-background")}
        >
          <AvatarFallback>+{remainingCount}</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
})
AvatarGroup.displayName = "AvatarGroup"

// =============================================================================
// EXPORTS
// =============================================================================

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarStatus,
  AvatarGroup,
  avatarVariants,
  avatarImageVariants,
  avatarFallbackVariants,
}

export type {
  AvatarProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarGroupProps,
  AvatarStatusProps,
}
