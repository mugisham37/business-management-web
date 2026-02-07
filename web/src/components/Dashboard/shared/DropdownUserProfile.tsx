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
import { cx } from "@/lib/utils"
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
import { 
  RiArrowRightUpLine,
  RiComputerLine,
  RiMoonLine,
  RiSunLine,
} from "@remixicon/react"
import { useTheme } from "next-themes"

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

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
  variant?: "default" | "customer"
  iconLibrary?: "lucide" | "remix"
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

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
  variant = "default",
  iconLibrary = "lucide",
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

  // Icon components based on library preference
  const SunIcon = iconLibrary === "remix" ? RiSunLine : Sun
  const MoonIcon = iconLibrary === "remix" ? RiMoonLine : Moon
  const MonitorIcon = iconLibrary === "remix" ? RiComputerLine : Monitor
  const ExternalLinkIcon = iconLibrary === "remix" ? RiArrowRightUpLine : ArrowUpRight

  // Customer variant uses simpler layout
  if (variant === "customer") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild disabled={disabled}>
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="!min-w-[calc(var(--radix-dropdown-menu-trigger-width))]"
        >
          <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
          {showThemeSelector && (
            <DropdownMenuGroup>
              <DropdownMenuSubMenu>
                <DropdownMenuSubMenuTrigger>Theme</DropdownMenuSubMenuTrigger>
                <DropdownMenuSubMenuContent>
                  <DropdownMenuRadioGroup
                    value={theme}
                    onValueChange={(value) => {
                      setTheme(value)
                    }}
                  >
                    <DropdownMenuRadioItem
                      aria-label="Switch to Light Mode"
                      value="light"
                      iconType="check"
                    >
                      <SunIcon className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      aria-label="Switch to Dark Mode"
                      value="dark"
                      iconType="check"
                    >
                      <MoonIcon
                        className="size-[var(--dropdown-icon-wrapper-size)] shrink-0"
                        aria-hidden="true"
                      />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      aria-label="Switch to System Mode"
                      value="system"
                      iconType="check"
                    >
                      <MonitorIcon
                        className="size-[var(--dropdown-icon-wrapper-size)] shrink-0"
                        aria-hidden="true"
                      />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubMenuContent>
              </DropdownMenuSubMenu>
            </DropdownMenuGroup>
          )}
          {showHelpResources && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  Changelog
                  <ExternalLinkIcon
                    className="external-link-icon"
                    aria-hidden="true"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Documentation
                  <ExternalLinkIcon
                    className="external-link-icon"
                    aria-hidden="true"
                  />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Join Slack community
                  <ExternalLinkIcon
                    className="external-link-icon"
                    aria-hidden="true"
                  />
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <a href={siteConfig.baseLinks.login} className="w-full">
                Sign out
              </a>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // Default variant with full features
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
        <DropdownMenuLabel className="dropdown-user-label">
          <div className="dropdown-user-label-header">
            <div className="dropdown-user-label-text">
              <span className="font-medium text-foreground">
                {user.name}
              </span>
              <span className="text-sm text-muted-foreground">
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
                  <User className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
                </DropdownMenuIconWrapper>
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleSettingsClick}
                shortcut={showKeyboardShortcuts ? "⌘," : undefined}
              >
                <DropdownMenuIconWrapper>
                  <Settings className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
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
                    <Monitor className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
                  </DropdownMenuIconWrapper>
                  Theme
                  <span className="ml-auto text-xs text-muted-foreground capitalize">
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
                        <Sun className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
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
                        <Moon className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
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
                        <Monitor className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
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
                      <FileText className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
                    </DropdownMenuIconWrapper>
                    Changelog
                    <ArrowUpRight
                      className="external-link-icon"
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
                      <HelpCircle className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
                    </DropdownMenuIconWrapper>
                    Documentation
                    <ArrowUpRight
                      className="external-link-icon"
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
                      <MessageSquare className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
                    </DropdownMenuIconWrapper>
                    Join Slack community
                    <ArrowUpRight
                      className="external-link-icon"
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
                    <Keyboard className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
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
            className={cx(
              "dropdown-item-destructive"
            )}
            shortcut={showKeyboardShortcuts ? "⌘Q" : undefined}
          >
            <DropdownMenuIconWrapper>
              <LogOut className="size-[var(--dropdown-icon-wrapper-size)] shrink-0" aria-hidden="true" />
            </DropdownMenuIconWrapper>
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
