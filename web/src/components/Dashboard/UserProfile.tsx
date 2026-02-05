"use client"

import * as React from "react"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { cx } from "@/lib/utils"
import { ChevronsUpDown, Loader2 } from "lucide-react"

import { DropdownUserProfile } from "./DropdownUserProfile"

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface UserData {
  name: string
  email: string
  avatar?: string
  initials?: string
  role?: string
  status?: "online" | "offline" | "away" | "busy" | "invisible"
  isLoading?: boolean
}

interface UserProfileDesktopProps {
  isCollapsed?: boolean
  user?: UserData
  isLoading?: boolean
  showStatus?: boolean
  showRole?: boolean
  interactive?: boolean
  onUserClick?: () => void
  className?: string
}

interface UserProfileMobileProps {
  user?: UserData
  isLoading?: boolean
  showStatus?: boolean
  showTooltip?: boolean
  interactive?: boolean
  onUserClick?: () => void
  className?: string
}

// =============================================================================
// DEFAULT USER DATA
// =============================================================================

const defaultUser: UserData = {
  name: "Emma Stone",
  email: "emma.stone@acme.com",
  initials: "ES",
  role: "Admin",
  status: "online",
  isLoading: false,
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
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
  interactive = false,
  onUserClick,
  className,
  ...props
}, ref) => {
  const userData = { ...defaultUser, ...user }
  const initials = userData.initials || getInitials(userData.name)
  
  const handleUserClick = React.useCallback(() => {
    if (interactive && onUserClick) {
      onUserClick()
    }
  }, [interactive, onUserClick])

  const buttonContent = (
    <Button
      ref={ref}
      aria-label={`User settings for ${userData.name}`}
      variant="ghost"
      size="default"
      isLoading={isLoading}
      loadingText="Loading profile..."
      className={cx(
        isCollapsed ? "justify-center" : "justify-between",
        "group flex w-full items-center rounded-md px-1 py-2 text-sm font-medium transition-all duration-200",
        "text-gray-900 dark:text-gray-50",
        "hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50",
        "hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-900",
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
        <div className="flex h-8 items-center">
          <Avatar
            size="sm"
            src={userData.avatar}
            alt={userData.name}
            fallback={initials}
            showStatus={showStatus}
            status={userData.status}
            interactive={interactive}
            className="transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Avatar
            size="sm"
            src={userData.avatar}
            alt={userData.name}
            fallback={initials}
            showStatus={showStatus}
            status={userData.status}
            interactive={interactive}
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
                className="mt-0.5 text-xs"
              >
                {userData.role}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      {!isCollapsed && !isLoading && (
        <ChevronsUpDown
          className="size-4 shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-gray-700 group-hover:dark:text-gray-400"
          aria-hidden="true"
        />
      )}
    </Button>
  )

  if (isCollapsed && !isLoading) {
    return (
      <DropdownUserProfile>
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
          side="right"
          delayDuration={300}
        >
          {buttonContent}
        </Tooltip>
      </DropdownUserProfile>
    )
  }

  return (
    <DropdownUserProfile>
      {buttonContent}
    </DropdownUserProfile>
  )
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
  interactive = false,
  onUserClick,
  className,
  ...props
}, ref) => {
  const userData = { ...defaultUser, ...user }
  const initials = userData.initials || getInitials(userData.name)
  
  const handleUserClick = React.useCallback(() => {
    if (interactive && onUserClick) {
      onUserClick()
    }
  }, [interactive, onUserClick])

  const buttonContent = (
    <Button
      ref={ref}
      aria-label={`User settings for ${userData.name}`}
      variant="ghost"
      size="icon"
      isLoading={isLoading}
      className={cx(
        "group flex items-center justify-center rounded-md p-0.5 sm:p-1 transition-all duration-200",
        "text-gray-900 dark:text-gray-50",
        "hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50",
        "hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-800/50",
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
          size="sm"
          src={userData.avatar}
          alt={userData.name}
          fallback={initials}
          showStatus={showStatus}
          status={userData.status}
          interactive={interactive}
          className="size-8 sm:size-7 transition-transform duration-200 group-hover:scale-105"
        />
      )}
    </Button>
  )

  const wrappedButton = (
    <DropdownUserProfile align="end">
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
        side="bottom"
        delayDuration={300}
      >
        {wrappedButton}
      </Tooltip>
    )
  }

  return wrappedButton
})

UserProfileMobile.displayName = "UserProfileMobile"

// =============================================================================
// EXPORTS
// =============================================================================

export type { UserData, UserProfileDesktopProps, UserProfileMobileProps }
