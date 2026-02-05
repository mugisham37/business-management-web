"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { cx } from "@/lib/utils"
import { ChevronsUpDown, Loader2 } from "lucide-react"

import { DropdownUserProfile, type DropdownUserProfileProps } from "./DropdownUserProfile"

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface UserData {
  name: string
  email: string
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

const getInitials = (name: string): string => {
  if (!name) return ""
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
  user = defaultUser,
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
  ...props
}, ref) => {
  const userData = React.useMemo(() => ({ ...defaultUser, ...user }), [user])
  const initials = userData.initials || getInitials(userData.name)
  
  const handleUserClick = React.useCallback(() => {
    if (interactive && onUserClick) {
      onUserClick()
    }
  }, [interactive, onUserClick])

  const avatarSize = getAvatarSize("default", isCollapsed)

  const buttonContent = (
    <Button
      ref={ref}
      aria-label={`User settings for ${userData.name}`}
      variant="ghost"
      size="default"
      isLoading={isLoading}
      loadingText="Loading profile..."
      className={cx(
        "group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium transition-all duration-200",
        isCollapsed ? "justify-center" : "justify-between",
        "text-gray-900 dark:text-gray-50",
        "hover:bg-gray-100 data-[state=open]:bg-gray-100",
        "hover:dark:bg-gray-800/80 data-[state=open]:dark:bg-gray-800/80",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        interactive && "cursor-pointer",
        className,
      )}
      onClick={interactive ? handleUserClick : undefined}
      {...props}
    >
      {isLoading ? (
        <div className="flex h-8 items-center justify-center">
          <Loader2 className="size-5 animate-spin text-gray-500" />
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
          <div className="flex items-center gap-3 min-w-0 flex-1">
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
            <div className="flex flex-col items-start min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate max-w-full">
                {userData.name}
              </span>
              {showRole && userData.role && (
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
              className="size-4 shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-gray-700 group-hover:dark:text-gray-400"
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
            <div className="font-medium">{userData.name}</div>
            <div className="text-xs text-gray-400">{userData.email}</div>
            {showRole && userData.role && (
              <div className="text-xs text-gray-400 mt-1">{userData.role}</div>
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
  user = defaultUser,
  isLoading = false,
  showStatus = true,
  showTooltip = true,
  tooltipSide = "bottom",
  size = "default",
  interactive = false,
  onUserClick,
  className,
  dropdownProps,
  ...props
}, ref) => {
  const userData = React.useMemo(() => ({ ...defaultUser, ...user }), [user])
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
      aria-label={`User settings for ${userData.name}`}
      variant="ghost"
      size="icon"
      isLoading={isLoading}
      loadingText="Loading..."
      className={cx(
        "group flex items-center justify-center rounded-md transition-all duration-200",
        size === "sm" ? "p-0.5" : size === "lg" ? "p-2" : "p-1",
        "text-gray-900 dark:text-gray-50",
        "hover:bg-gray-100 data-[state=open]:bg-gray-100",
        "hover:dark:bg-gray-800/80 data-[state=open]:dark:bg-gray-800/80",
        "focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
        interactive && "cursor-pointer",
        className,
      )}
      onClick={interactive ? handleUserClick : undefined}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="size-6 animate-spin text-gray-500" />
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
            <div className="font-medium">{userData.name}</div>
            <div className="text-xs text-gray-400">{userData.email}</div>
            {userData.role && (
              <div className="text-xs text-gray-400 mt-1">{userData.role}</div>
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
// EXPORTS
// =============================================================================

export type { 
  UserData, 
  UserProfileDesktopProps, 
  UserProfileMobileProps,
  BaseUserProfileProps
}
