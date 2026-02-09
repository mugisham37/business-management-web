"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { useAuth } from "@/hooks/useAuth"
import { useLogout } from "@/hooks/api/useAuth"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/Avatar"
import { Badge } from "@/components/ui/Badge"
import { Divider } from "@/components/ui/Divider"
import { cx, focusRing } from "@/lib/utils"
import {
  RiUser3Line,
  RiSettings3Line,
  RiLogoutBoxLine,
  RiShieldKeyholeLine,
  RiComputerLine,
} from "@remixicon/react"

export interface DropdownUserProfileProps {
  children: React.ReactNode
  align?: "start" | "center" | "end"
  sideOffset?: number
  collisionPadding?: number
  loop?: boolean
  disabled?: boolean
  widthMode?: "trigger" | "min" | "full"
  showThemeSelector?: boolean
  showProfileActions?: boolean
  showHelpResources?: boolean
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onSignOut?: () => void
  variant?: "default" | "customer"
}

export function DropdownUserProfile({
  children,
  align = "end",
  sideOffset = 8,
  collisionPadding = 8,
  loop = true,
  disabled = false,
  widthMode = "min",
  showProfileActions = true,
  onProfileClick,
  onSettingsClick,
  onSignOut,
}: DropdownUserProfileProps) {
  const { user } = useAuth()
  const logout = useLogout()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick()
    } else {
      router.push('/dashboard/settings/general')
    }
    setOpen(false)
  }

  const handleSettingsClick = () => {
    if (onSettingsClick) {
      onSettingsClick()
    } else {
      router.push('/dashboard/settings/general')
    }
    setOpen(false)
  }

  const handleSecurityClick = () => {
    router.push('/dashboard/settings/security')
    setOpen(false)
  }

  const handleSessionsClick = () => {
    router.push('/dashboard/settings/sessions')
    setOpen(false)
  }

  const handleSignOut = async () => {
    try {
      if (onSignOut) {
        onSignOut()
      } else {
        await logout.mutateAsync()
        router.push('/auth/login')
      }
    } catch (err) {
      console.error('Logout failed:', err)
    }
    setOpen(false)
  }

  if (!user) {
    return <>{children}</>
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U'
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
  }

  const initials = getInitials(user.firstName, user.lastName)
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'

  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        {children}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          collisionPadding={collisionPadding}
          loop={loop}
          className={cx(
            "z-50 min-w-[16rem] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
            "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            widthMode === "trigger" && "w-[var(--radix-dropdown-menu-trigger-width)]",
            widthMode === "full" && "w-full",
          )}
        >
          {/* User Info Header */}
          <div className="px-3 py-3">
            <div className="flex items-center gap-3">
              <Avatar
                size="default"
                fallback={initials}
                alt={fullName}
                variant="default"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {fullName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
                {user.role && (
                  <Badge variant="neutral" size="sm" className="mt-1">
                    {user.role.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Divider className="my-1" />

          {/* Menu Items */}
          {showProfileActions && (
            <>
              <DropdownMenuPrimitive.Item
                className={cx(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
                  "text-foreground hover:bg-muted focus:bg-muted",
                  "transition-colors duration-150",
                  focusRing,
                )}
                onSelect={handleProfileClick}
              >
                <RiUser3Line className="h-4 w-4 text-muted-foreground" />
                <span>Profile</span>
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Item
                className={cx(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
                  "text-foreground hover:bg-muted focus:bg-muted",
                  "transition-colors duration-150",
                  focusRing,
                )}
                onSelect={handleSettingsClick}
              >
                <RiSettings3Line className="h-4 w-4 text-muted-foreground" />
                <span>Settings</span>
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Item
                className={cx(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
                  "text-foreground hover:bg-muted focus:bg-muted",
                  "transition-colors duration-150",
                  focusRing,
                )}
                onSelect={handleSecurityClick}
              >
                <RiShieldKeyholeLine className="h-4 w-4 text-muted-foreground" />
                <span>Security</span>
              </DropdownMenuPrimitive.Item>

              <DropdownMenuPrimitive.Item
                className={cx(
                  "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
                  "text-foreground hover:bg-muted focus:bg-muted",
                  "transition-colors duration-150",
                  focusRing,
                )}
                onSelect={handleSessionsClick}
              >
                <RiComputerLine className="h-4 w-4 text-muted-foreground" />
                <span>Active sessions</span>
              </DropdownMenuPrimitive.Item>

              <Divider className="my-1" />
            </>
          )}

          {/* Sign Out */}
          <DropdownMenuPrimitive.Item
            className={cx(
              "relative flex cursor-pointer select-none items-center gap-2 rounded-md px-3 py-2 text-sm outline-none",
              "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
              "transition-colors duration-150",
              focusRing,
            )}
            onSelect={handleSignOut}
            disabled={logout.isPending}
          >
            <RiLogoutBoxLine className="h-4 w-4" />
            <span>{logout.isPending ? 'Signing out...' : 'Sign out'}</span>
          </DropdownMenuPrimitive.Item>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
