"use client"

import * as React from "react"
import { siteConfig } from "@/app/siteConfig"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSubMenu,
  DropdownMenuSubMenuContent,
  DropdownMenuSubMenuTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"
import { Badge } from "@/components/ui/Badge"
import { 
  ArrowUpRight, 
  Monitor, 
  Moon, 
  Sun, 
  Settings, 
  User, 
  LogOut,
  HelpCircle,
  MessageSquare,
  FileText,
  Keyboard
} from "lucide-react"
import { useTheme } from "next-themes"

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface DropdownUserProfileProps {
  children: React.ReactNode
  align?: "center" | "start" | "end"
  user?: {
    name?: string
    email?: string
    role?: string
    plan?: string
  }
  showKeyboardShortcuts?: boolean
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onSignOut?: () => void
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DropdownUserProfile({
  children,
  align = "start",
  user = {
    name: "Emma Stone",
    email: "emma.stone@acme.com",
    role: "Admin",
    plan: "Pro"
  },
  showKeyboardShortcuts = true,
  onProfileClick,
  onSettingsClick,
  onSignOut,
}: DropdownUserProfileProps) {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = React.useCallback(() => {
    if (onSignOut) {
      onSignOut()
    } else {
      // Default behavior - navigate to login
      window.location.href = siteConfig.baseLinks.login
    }
  }, [onSignOut])

  const handleProfileClick = React.useCallback(() => {
    if (onProfileClick) {
      onProfileClick()
    }
  }, [onProfileClick])

  const handleSettingsClick = React.useCallback(() => {
    if (onSettingsClick) {
      onSettingsClick()
    }
  }, [onSettingsClick])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-[280px]"
        sideOffset={8}
      >
        {/* User Info Header */}
        <DropdownMenuLabel className="flex flex-col gap-1 p-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 dark:text-gray-50">
                {user.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </span>
            </div>
            {user.plan && (
              <Badge variant="gradient" size="sm">
                {user.plan}
              </Badge>
            )}
          </div>
          {user.role && (
            <Badge variant="neutral" size="sm" className="w-fit">
              {user.role}
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile Actions */}
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={handleProfileClick}
            shortcut={showKeyboardShortcuts ? "⌘P" : undefined}
          >
            <User className="size-4 shrink-0" aria-hidden="true" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleSettingsClick}
            shortcut={showKeyboardShortcuts ? "⌘," : undefined}
          >
            <Settings className="size-4 shrink-0" aria-hidden="true" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Theme Selection */}
        <DropdownMenuGroup>
          <DropdownMenuSubMenu>
            <DropdownMenuSubMenuTrigger>
              <Monitor className="size-4 shrink-0" aria-hidden="true" />
              Theme
              <span className="ml-auto text-xs text-gray-500 capitalize">
                {theme}
              </span>
            </DropdownMenuSubMenuTrigger>
            <DropdownMenuSubMenuContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={setTheme}
              >
                <DropdownMenuRadioItem
                  value="light"
                  iconType="check"
                  aria-label="Switch to Light Mode"
                >
                  <Sun className="size-4 shrink-0" aria-hidden="true" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="dark"
                  iconType="check"
                  aria-label="Switch to Dark Mode"
                >
                  <Moon className="size-4 shrink-0" aria-hidden="true" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem
                  value="system"
                  iconType="check"
                  aria-label="Switch to System Mode"
                >
                  <Monitor className="size-4 shrink-0" aria-hidden="true" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubMenuContent>
          </DropdownMenuSubMenu>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Help & Resources */}
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <a 
              href="/changelog" 
              className="flex items-center w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FileText className="size-4 shrink-0" aria-hidden="true" />
              Changelog
              <ArrowUpRight
                className="ml-auto size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="/docs" 
              className="flex items-center w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <HelpCircle className="size-4 shrink-0" aria-hidden="true" />
              Documentation
              <ArrowUpRight
                className="ml-auto size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a 
              href="#" 
              className="flex items-center w-full"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
              Join Slack community
              <ArrowUpRight
                className="ml-auto size-3 shrink-0 text-gray-500"
                aria-hidden="true"
              />
            </a>
          </DropdownMenuItem>
          {showKeyboardShortcuts && (
            <DropdownMenuItem shortcut="⌘K">
              <Keyboard className="size-4 shrink-0" aria-hidden="true" />
              Keyboard shortcuts
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/50 dark:focus:text-red-300"
            shortcut={showKeyboardShortcuts ? "⌘Q" : undefined}
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
