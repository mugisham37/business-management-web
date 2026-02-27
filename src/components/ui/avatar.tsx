"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: "default" | "sm" | "lg"
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="avatar"
        data-size={size}
        className={cn(
          "cn-avatar group/avatar relative inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-muted",
          "after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten",
          {
            "size-10": size === "default",
            "size-8": size === "sm",
            "size-12": size === "lg",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ComponentPropsWithoutRef<"img"> {
  src: string
  alt: string
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        data-slot="avatar-image"
        className={cn(
          "cn-avatar-image aspect-square size-full object-cover",
          imageLoaded && !imageError ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = "AvatarImage"

interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<"div"> {}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="avatar-fallback"
        className={cn(
          "cn-avatar-fallback flex size-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium",
          "text-sm group-data-[size=sm]/avatar:text-xs group-data-[size=lg]/avatar:text-base",
          className
        )}
        {...props}
      />
    )
  }
)
AvatarFallback.displayName = "AvatarFallback"

interface AvatarBadgeProps extends React.ComponentPropsWithoutRef<"span"> {}

const AvatarBadge = React.forwardRef<HTMLSpanElement, AvatarBadgeProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        data-slot="avatar-badge"
        className={cn(
          "cn-avatar-badge absolute bottom-0 right-0 z-10 inline-flex select-none items-center justify-center rounded-full bg-background ring-2 ring-background",
          "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
          "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
          "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
          className
        )}
        {...props}
      />
    )
  }
)
AvatarBadge.displayName = "AvatarBadge"

interface AvatarGroupProps extends React.ComponentPropsWithoutRef<"div"> {}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-slot="avatar-group"
        className={cn(
          "cn-avatar-group group/avatar-group flex -space-x-2",
          "*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
          className
        )}
        {...props}
      />
    )
  }
)
AvatarGroup.displayName = "AvatarGroup"

interface AvatarGroupCountProps extends React.ComponentPropsWithoutRef<"div"> {
  size?: "default" | "sm" | "lg"
}

const AvatarGroupCount = React.forwardRef<
  HTMLDivElement,
  AvatarGroupCountProps
>(({ className, size = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="avatar-group-count"
      data-size={size}
      className={cn(
        "cn-avatar-group-count relative inline-flex shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground font-medium ring-2 ring-background",
        {
          "size-10 text-sm": size === "default",
          "size-8 text-xs": size === "sm",
          "size-12 text-base": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
})
AvatarGroupCount.displayName = "AvatarGroupCount"

export {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarBadge,
}
