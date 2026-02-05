"use client"

import * as React from "react"
import { Button } from "@/components/ui/Button"
import { Avatar } from "@/components/ui/Avatar"
import { cx, focusRing } from "@/lib/utils"
import { ChevronsUpDown } from "lucide-react"

import { DropdownUserProfile } from "./DropdownUserProfile"

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
  const getInitials = React.useCallback((name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }, [])

  return (
    <DropdownUserProfile
      user={user}
      showThemeSelector={showThemeSelector}
      showProfileActions={showProfileActions}
      showHelpResources={showHelpResources}
      onProfileClick={onProfileClick}
      onSettingsClick={onSettingsClick}
      onSignOut={onSignOut}
      align={align}
      disabled={disabled}
      widthMode="min"
      sideOffset={8}
      collisionPadding={8}
      loop={true}
    >
      <Button
        aria-label={`User menu for ${user.name || 'User'}`}
        variant="ghost"
        size="default"
        isLoading={isLoading}
        disabled={disabled}
        className={cx(
          "group flex w-full items-center justify-between rounded-md px-1 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200/50 data-[state=open]:bg-gray-200/50 hover:dark:bg-gray-800/50 data-[state=open]:dark:bg-gray-900",
          focusRing,
          className,
        )}
      >
        <span className="flex items-center gap-3 min-w-0">
          <Avatar
            size="sm"
            shape="circle"
            variant="outline"
            src={user.avatar}
            alt={user.name || 'User'}
            fallback={getInitials(user.name || 'User')}
            className="shrink-0 border-gray-300 bg-white text-xs text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          />
          <span className="truncate font-medium">
            {user.name || 'User'}
          </span>
        </span>
        <ChevronsUpDown
          className="size-4 shrink-0 text-gray-500 group-hover:text-gray-700 group-hover:dark:text-gray-400 transition-colors duration-200"
          aria-hidden="true"
        />
      </Button>
    </DropdownUserProfile>
  )
}
