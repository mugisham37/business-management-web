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
  DropdownMenuIconWrapper,
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

export interface DropdownUserProfileProps {
  children: React.ReactNode
  align?: "center" | "start" | "end"
  widthMode?: "trigger" | "min" | "auto"
  sideOffset?: number
  collisionPadding?: number
  loop?: boolean
  user?: {
    name?: string
    email?: string
    role?: string
    plan?: string
    avatar?: string
  }
  links?: {
    profile?: string
    settings?: string
    changelog?: string
    documentation?: string
    community?: string
    keyboardShortcuts?: string
  }
  showKeyboardShortcuts?: boolean
  showThemeSelector?: boolean
  showProfileActions?: boolean
  showHelpResources?: boolean
  onProfileClick?: () => void
  onSettingsClick?: () => void
  onKeyboardShortcutsClick?: () => void
  onSignOut?: () => void
  disabled?: boolean
}

export function DropdownUserProfile({
  children,
  align = "start",
  widthMode = "min",
  sideOffset = 8,
  collisionPadding = 8,
  loop = true,
  user = {
    name: "Emma Stone",
    email: "emma.stone@acme.com",
    role: "Admin",
    plan: "Pro"
  },
  links = {
    profile: "/profile",
    settings: "/settings",
    changelog: siteConfig.baseLinks.changelog,
    documentation: "/docs",
    community: "#",
    keyboardShortcuts: "#"
  },
  showKeyboardShortcuts = true,
  showThemeSelector = true,
  showProfileActions = true,
  showHelpResources = true,
  onProfileClick,
  onSettingsClick,
  onKeyboardShortcutsClick,
  onSignOut,
  disabled = false,
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
      window.location.href = siteConfig.baseLinks.login
    }
  }, [onSignOut])

  const handleProfileClick = React.useCallback(() => {
    if (onProfileClick) {
      onProfileClick()
    } else if (links.profile) {
      window.location.href = links.profile
    }
  }, [onProfileClick, links.profile])

  const handleSettingsClick = React.useCallback(() => {
    if (onSettingsClick) {
      onSettingsClick()
    } else if (links.settings) {
      window.location.href = links.settings
    }
  }, [onSettingsClick, links.settings])

  const handleKeyboardShortcutsClick = React.useCallback(() => {
    if (onKeyboardShortcutsClick) {
      onKeyboardShortcutsClick()
    } else if (links.keyboardShortcuts && links.keyboardShortcuts !== "#") {
      window.location.href = links.keyboardShortcuts
    }
  }, [onKeyboardShortcutsClick, links.keyboardShortcuts])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        widthMode={widthMode}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        loop={loop}
        className="min-w-[280px]"
      >
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

        {showProfileActions && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                onClick={handleProfileClick}
                shortcut={showKeyboardShortcuts ? "⌘P" : undefined}
              >
                <DropdownMenuIconWrapper>
                  <User className="size-4 shrink-0" aria-hidden="true" />
                </DropdownMenuIconWrapper>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                shortcut={showKeyboardShortcuts ? "⌘," : undefined}
              >
                <DropdownMenuIconWrapper>
                  <Settings className="size-4 shrink-0" aria-hidden="true" />
                </DropdownMenuIconWrapper>
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}

        {showThemeSelector && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSubMenu>
                <DropdownMenuSubMenuTrigger iconType="lucide">
                  <DropdownMenuIconWrapper>
                    <Monitor className="size-4 shrink-0" aria-hidden="true" />
                  </DropdownMenuIconWrapper>
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
                      iconLibrary="lucide"
                      aria-label="Switch to Light Mode"
                    >
                      <DropdownMenuIconWrapper>
                        <Sun className="size-4 shrink-0" aria-hidden="true" />
                      </DropdownMenuIconWrapper>
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="dark"
                      iconType="check"
                      iconLibrary="lucide"
                      aria-label="Switch to Dark Mode"
                    >
                      <DropdownMenuIconWrapper>
                        <Moon className="size-4 shrink-0" aria-hidden="true" />
                      </DropdownMenuIconWrapper>
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="system"
                      iconType="check"
                      iconLibrary="lucide"
                      aria-label="Switch to System Mode"
                    >
                      <DropdownMenuIconWrapper>
                        <Monitor className="size-4 shrink-0" aria-hidden="true" />
                      </DropdownMenuIconWrapper>
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubMenuContent>
              </DropdownMenuSubMenu>
            </DropdownMenuGroup>
          </>
        )}

        {showHelpResources && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {links.changelog && (
                <DropdownMenuItem asChild>
                  <a 
                    href={links.changelog} 
                    className="flex items-center w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DropdownMenuIconWrapper>
                      <FileText className="size-4 shrink-0" aria-hidden="true" />
                    </DropdownMenuIconWrapper>
                    Changelog
                    <ArrowUpRight
                      className="ml-auto size-3 shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                </DropdownMenuItem>
              )}
              {links.documentation && (
                <DropdownMenuItem asChild>
                  <a 
                    href={links.documentation} 
                    className="flex items-center w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DropdownMenuIconWrapper>
                      <HelpCircle className="size-4 shrink-0" aria-hidden="true" />
                    </DropdownMenuIconWrapper>
                    Documentation
                    <ArrowUpRight
                      className="ml-auto size-3 shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                </DropdownMenuItem>
              )}
              {links.community && (
                <DropdownMenuItem asChild>
                  <a 
                    href={links.community} 
                    className="flex items-center w-full"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <DropdownMenuIconWrapper>
                      <MessageSquare className="size-4 shrink-0" aria-hidden="true" />
                    </DropdownMenuIconWrapper>
                    Join Slack community
                    <ArrowUpRight
                      className="ml-auto size-3 shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                  </a>
                </DropdownMenuItem>
              )}
              {showKeyboardShortcuts && (
                <DropdownMenuItem 
                  onClick={handleKeyboardShortcutsClick}
                  shortcut="⌘K"
                >
                  <DropdownMenuIconWrapper>
                    <Keyboard className="size-4 shrink-0" aria-hidden="true" />
                  </DropdownMenuIconWrapper>
                  Keyboard shortcuts
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            onClick={handleSignOut}
            className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-950/50 dark:focus:text-red-300"
            shortcut={showKeyboardShortcuts ? "⌘Q" : undefined}
          >
            <DropdownMenuIconWrapper>
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
            </DropdownMenuIconWrapper>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
