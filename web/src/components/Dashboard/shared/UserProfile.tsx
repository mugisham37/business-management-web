"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import { ChevronsUpDown, Loader2 } from "lucide-react"

import { DropdownUserProfile, type DropdownUserProfileProps } from "./DropdownUserProfile"

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface UserData {
  name?: string
  email?: string
  avatar?: string
  initials?: string
  role?: string
  plan?: string
  status?: "online" | "offline" | "away" | "busy" | "invisible"
}

interface BaseUserProfileProps {
  user?: UserData
  isLoading?: boolean
  showStatus?: boolean
  showRole?: boolean
  interactive?: boolean
  onUserClick?: () => void
  className?: string
  dropdownProps?: Partial<DropdownUserProfileProps>
  variant?: "default" | "business" | "customer"
}

interface UserProfileDesktopProps extends BaseUserProfileProps {
  isCollapsed?: boolean
  showTooltipWhenCollapsed?: boolean
  tooltipSide?: "left" | "right" | "top" | "bottom"
  showChevron?: boolean
}

interface UserProfileMobileProps extends BaseUserProfileProps {
  showTooltip?: boolean
  tooltipSide?: "left" | "right" | "top" | "bottom"
  size?: "sm" | "default" | "lg"
}

// =============================================================================
// DEFAULT USER DATA
// =============================================================================

const defaultUser: UserData = {
  name: "Emma Stone",
  email: "emma.stone@acme.com",
  initials: "ES",
  role: "Admin",
  plan: "Pro",
  status: "online",
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getInitials = (name?: string): string => {
  if (!name) return "U"
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

const getAvatarSize = (size?: string, isCollapsed?: boolean) => {
  if (size === "lg") return "default"
  if (size === "sm" || isCollapsed) return "sm"
  return "sm"
}

// =============================================================================
// DESKTOP COMPONENT
// =============================================================================

export const UserProfileDesktop = React.forwardRef<
  HTMLButtonElement,
  UserProfileDesktopProps
>(({
  isCollapsed = false,
  user,
  isLoading = false,
  showStatus = true,
  showRole = true,
  showTooltipWhenCollapsed = true,
  tooltipSide = "right",
  showChevron = true,
  interactive = false,
  onUserClick,
  className,
  dropdownProps,
  variant = "default",
  ...props
}, ref) => {
  // Use provided user or fall back to default only if no user is provided
  const userData = React.useMemo(() => {
    if (!user) return defaultUser
    return { ...defaultUser, ...user }
  }, [user])
  
  const initials = userData.initials || getInitials(userData.name)
  
  const handleUserClick = React.useCallback(() => {
    if (interactive && onUserClick) {
      onUserClick()
    }
  }, [interactive, onUserClick])

  const avatarSize = getAvatarSize("default", isCollapsed)

  // Get button className using global utility classes
  const getButtonClassName = () => {
    if (variant === "business") {
      return cx(
        "user-profile-button-base",
        "user-profile-button-business",
        focusRing,
        className,
      )
    }
    
    return cx(
      "user-profile-button-base",
      "user-profile-button-default",
      isCollapsed && "user-profile-button-collapsed",
      focusRing,
      interactive && "cursor-pointer",
      className,
    )
  }

  const buttonContent = (
    <Button
      ref={ref}
      aria-label={`User settings for ${userData.name || 'User'}`}
      variant="ghost"
      size="default"
      isLoading={isLoading}
      loadingText="Loading profile..."
      className={getButtonClassName()}
      onClick={interactive ? handleUserClick : undefined}
      {...props}
    >
      {isLoading ? (
        <div className="user-profile-loading">
          <Loader2 className="user-profile-loading-spinner" />
        </div>
      ) : isCollapsed ? (
        <Avatar
          size={avatarSize}
          src={userData.avatar}
          alt={userData.name}
          fallback={initials}
          showStatus={showStatus}
          status={userData.status}
          interactive={interactive}
          variant="default"
          className="transition-transform duration-200 group-hover:scale-105"
        />
      ) : (
        <>
          <div className="user-profile-content">
            <Avatar
              size={avatarSize}
              src={userData.avatar}
              alt={userData.name}
              fallback={initials}
              showStatus={showStatus}
              status={userData.status}
              interactive={interactive}
              variant={variant === "business" ? "outline" : "default"}
              className={cx(
                "transition-transform duration-200 group-hover:scale-105",
                variant === "business" && "shrink-0 border-[var(--user-profile-avatar-border)] bg-[var(--user-profile-avatar-bg)] text-xs text-muted-foreground dark:border-[var(--user-profile-avatar-border-dark)] dark:bg-[var(--user-profile-avatar-bg-dark)]"
              )}
            />
            <div className="user-profile-text">
              <span className={cx(
                "user-profile-name",
                variant === "business" && "text-sm"
              )}>
                {userData.name || 'User'}
              </span>
              {showRole && userData.role && variant !== "business" && (
                <Badge
                  variant="neutral"
                  size="sm"
                  className="mt-0.5"
                >
                  {userData.role}
                </Badge>
              )}
            </div>
          </div>
          {showChevron && (
            <ChevronsUpDown
              className="user-profile-chevron"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </Button>
  )

  const dropdownContent = (
    <DropdownUserProfile
      user={userData}
      variant={variant === "customer" ? "customer" : "default"}
      {...dropdownProps}
    >
      {buttonContent}
    </DropdownUserProfile>
  )

  if (isCollapsed && showTooltipWhenCollapsed && !isLoading) {
    return (
      <Tooltip
        content={
          <div className="text-center">
            <div className="font-medium">{userData.name || 'User'}</div>
            <div className="text-xs text-muted-foreground">{userData.email || 'No email'}</div>
            {showRole && userData.role && (
              <div className="text-xs text-muted-foreground mt-1">{userData.role}</div>
            )}
          </div>
        }
        side={tooltipSide}
        delayDuration={300}
        triggerAsChild
      >
        {dropdownContent}
      </Tooltip>
    )
  }

  return dropdownContent
})

UserProfileDesktop.displayName = "UserProfileDesktop"

// =============================================================================
// MOBILE COMPONENT
// =============================================================================

export const UserProfileMobile = React.forwardRef<
  HTMLButtonElement,
  UserProfileMobileProps
>(({
  user,
  isLoading = false,
  showStatus = true,
  showTooltip = true,
  tooltipSide = "bottom",
  size = "default",
  interactive = false,
  onUserClick,
  className,
  dropdownProps,
  variant = "default",
  ...props
}, ref) => {
  // Use provided user or fall back to default only if no user is provided
  const userData = React.useMemo(() => {
    if (!user) return defaultUser
    return { ...defaultUser, ...user }
  }, [user])
  
  const initials = userData.initials || getInitials(userData.name)
  
  const handleUserClick = React.useCallback(() => {
    if (interactive && onUserClick) {
      onUserClick()
    }
  }, [interactive, onUserClick])

  const avatarSize = getAvatarSize(size)

  const buttonContent = (
    <Button
      ref={ref}
      aria-label={`User settings for ${userData.name || 'User'}`}
      variant="ghost"
      size="icon"
      isLoading={isLoading}
      loadingText="Loading..."
      className={cx(
        "group flex items-center justify-center rounded-md transition-all duration-200",
        size === "sm" ? "p-0.5" : size === "lg" ? "p-2" : "p-1",
        "text-foreground",
        "hover:bg-[var(--user-profile-hover-bg)] data-[state=open]:bg-[var(--user-profile-active-bg)]",
        "dark:hover:bg-[var(--user-profile-hover-bg-dark)] dark:data-[state=open]:bg-[var(--user-profile-active-bg-dark)]",
        focusRing,
        interactive && "cursor-pointer",
        className,
      )}
      onClick={interactive ? handleUserClick : undefined}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="user-profile-loading-spinner" />
      ) : (
        <Avatar
          size={avatarSize}
          src={userData.avatar}
          alt={userData.name}
          fallback={initials}
          showStatus={showStatus}
          status={userData.status}
          interactive={interactive}
          variant="default"
          className={cx(
            "transition-transform duration-200 group-hover:scale-105",
            size === "sm" ? "size-6" : size === "lg" ? "size-10" : "size-8"
          )}
        />
      )}
    </Button>
  )

  const dropdownContent = (
    <DropdownUserProfile
      align="end"
      user={userData}
      variant={variant === "customer" ? "customer" : "default"}
      {...dropdownProps}
    >
      {buttonContent}
    </DropdownUserProfile>
  )

  if (showTooltip && !isLoading) {
    return (
      <Tooltip
        content={
          <div className="text-center">
            <div className="font-medium">{userData.name || 'User'}</div>
            <div className="text-xs text-muted-foreground">{userData.email || 'No email'}</div>
            {userData.role && (
              <div className="text-xs text-muted-foreground mt-1">{userData.role}</div>
            )}
          </div>
        }
        side={tooltipSide}
        delayDuration={300}
        triggerAsChild
      >
        {dropdownContent}
      </Tooltip>
    )
  }

  return dropdownContent
})

UserProfileMobile.displayName = "UserProfileMobile"

// =============================================================================
// BUSINESS VARIANT (Simple wrapper for business use case)
// =============================================================================

export interface UserProfileProps {
  user?: {
    name?: string
    email?: string
    role?: string
    plan?: string
    avatar?: string
  }
  isLoading?: boolean
  disabled?: boolean
  showThemeSelector?: boolean
  showProfileActions?: boolean
  showHelpResources?: boolean
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onSignOut?: () => void
  align?: "center" | "start" | "end"
  className?: string
}

export function UserProfile({
  user = {
    name: "Emma Stone",
    email: "emma.stone@acme.com",
    role: "Admin",
    plan: "Pro"
  },
  isLoading = false,
  disabled = false,
  showThemeSelector = true,
  showProfileActions = true,
  showHelpResources = true,
  onProfileClick,
  onSettingsClick,
  onSignOut,
  align = "start",
  className,
}: UserProfileProps) {
  return (
    <UserProfileDesktop
      user={user}
      isLoading={isLoading}
      showRole={false}
      showChevron={true}
      variant="business"
      className={className}
      dropdownProps={{
        showThemeSelector,
        showProfileActions,
        showHelpResources,
        onProfileClick,
        onSettingsClick,
        onSignOut,
        align,
        disabled,
        widthMode: "min",
        sideOffset: 8,
        collisionPadding: 8,
        loop: true,
        showKeyboardShortcuts: false,
      }}
    />
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { 
  UserData, 
  UserProfileDesktopProps, 
  UserProfileMobileProps,
  BaseUserProfileProps
}
