"use client"

import * as React from "react"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import {
  BarChartBig,
  Building2,
  ExternalLink,
  FileText,
  PanelRightClose,
  PanelRightOpen,
  Receipt,
  Settings2,
  Table2,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import MobileSidebar from "./MobileSidebar"
import { UserProfileDesktop, UserProfileMobile } from "../shared/UserProfile"

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  isExternal?: boolean
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface SidebarProps {
  isCollapsed?: boolean
  toggleSidebar?: () => void
  navigation?: NavigationSection[]
  brandName?: string
  brandHref?: string
  isLoading?: boolean
  className?: string
  "aria-label"?: string
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

const defaultNavigation: NavigationSection[] = [
  {
    title: "Platform",
    items: [
      { name: "Overview", href: siteConfig.baseLinks.overview, icon: BarChartBig },
      { name: "Details", href: siteConfig.baseLinks.details, icon: Table2 },
      { name: "Transactions", href: siteConfig.baseLinks.transactions, icon: Receipt },
      { name: "Reports", href: siteConfig.baseLinks.reports, icon: FileText },
      { name: "Business Management", href: siteConfig.baseLinks.business, icon: Building2 },
      { name: "Customer", href: siteConfig.baseLinks.customer, icon: Users },
      { name: "Settings", href: siteConfig.baseLinks.settings.general, icon: Settings2 },
    ],
  },
  
] as const

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const useActiveNavigation = () => {
  const pathname = usePathname()
  
  return React.useCallback((itemHref: string) => {
    if (itemHref === siteConfig.baseLinks.settings.general) {
      return pathname.startsWith("/dashboard/settings")
    }
    if (itemHref.includes("/dashboard/onboarding")) {
      return pathname.startsWith("/dashboard/onboarding")
    }
    if (itemHref.includes("#")) {
      const baseHref = itemHref.split("#")[0]
      return pathname === baseHref || pathname.startsWith(baseHref)
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }, [pathname])
}

// =============================================================================
// NAVIGATION ITEM COMPONENT
// =============================================================================

interface NavigationItemProps {
  item: NavigationItem
  isActive: boolean
  isCollapsed: boolean
  className?: string
}

const NavigationItemComponent = React.memo(({ 
  item, 
  isActive, 
  isCollapsed,
  className 
}: NavigationItemProps) => {
  const linkContent = (
    <Link
      href={item.href}
      className={cx(
        isActive
          ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/50"
          : "text-gray-700 dark:text-gray-300",
        isCollapsed ? "inline-flex justify-center" : "flex",
        "items-center gap-x-2.5 rounded-md p-2 text-sm font-medium transition-all duration-200",
        "hover:bg-gray-200/50 hover:dark:bg-gray-900",
        "hover:text-gray-900 hover:dark:text-gray-50",
        focusRing,
        className,
      )}
      aria-label={`Navigate to ${item.name}`}
      target={item.isExternal ? "_blank" : undefined}
      rel={item.isExternal ? "noopener noreferrer" : undefined}
    >
      <item.icon
        className="size-5 shrink-0"
        aria-hidden="true"
      />
      {!isCollapsed && (
        <>
          <span className="truncate">{item.name}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              {item.badge}
            </span>
          )}
          {item.isExternal && (
            <ExternalLink className="size-3 shrink-0 opacity-50" aria-hidden="true" />
          )}
        </>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <Tooltip
        content={
          <div className="text-center">
            <div className="font-medium">{item.name}</div>
            {item.badge && (
              <div className="text-xs text-gray-400 mt-1">{item.badge}</div>
            )}
          </div>
        }
        side="right"
        sideOffset={8}
        delayDuration={300}
        variant="tremor"
      >
        {linkContent}
      </Tooltip>
    )
  }

  return linkContent
})

NavigationItemComponent.displayName = "NavigationItem"

// =============================================================================
// MAIN SIDEBAR COMPONENT
// =============================================================================

export function Sidebar({
  isCollapsed = false,
  toggleSidebar,
  navigation = defaultNavigation,
  brandName = "Acme Corp.",
  brandHref = "/",
  isLoading = false,
  className,
  "aria-label": ariaLabel = "Main navigation",
  ...props
}: SidebarProps) {
  const isActive = useActiveNavigation()
  
  const handleToggleSidebar = React.useCallback(() => {
    if (toggleSidebar) {
      toggleSidebar()
    }
  }, [toggleSidebar])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleToggleSidebar()
    }
  }, [handleToggleSidebar])

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className={cx(
          isCollapsed ? "lg:w-[60px]" : "lg:w-64",
          "hidden overflow-x-hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:flex lg:flex-col",
          "transform-gpu transition-all duration-200 ease-in-out will-change-transform",
          "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800",
          className,
        )}
        aria-label={ariaLabel}
        {...props}
      >
        <aside className="flex grow flex-col gap-y-4 overflow-y-auto whitespace-nowrap px-3 py-4">
          {/* Brand Header */}
          <div className="flex items-center gap-x-1.5 min-h-[40px]">
            {toggleSidebar && (
              <Button
                variant="ghost"
                size="icon"
                isLoading={isLoading}
                className={cx(
                  "group shrink-0 rounded-md p-2 transition-colors duration-200",
                  "hover:bg-gray-200/50 hover:dark:bg-gray-900",
                  focusRing,
                )}
                onClick={handleToggleSidebar}
                onKeyDown={handleKeyDown}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isCollapsed}
              >
                {isCollapsed ? (
                  <PanelRightOpen
                    className="size-5 shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                    aria-hidden="true"
                  />
                ) : (
                  <PanelRightClose
                    className="size-5 shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                    aria-hidden="true"
                  />
                )}
              </Button>
            )}
            
            {!isCollapsed && (
              <Link 
                href={brandHref}
                aria-label={`${brandName} home`}
                className={cx(
                  "text-sm font-semibold text-gray-900 dark:text-gray-50 truncate",
                  "transition-colors duration-200 hover:text-blue-600 hover:dark:text-blue-400",
                  focusRing,
                )}
              >
                {brandName}
              </Link>
            )}
          </div>
          
          {/* Navigation Sections */}
          <nav
            aria-label="Platform navigation"
            className="flex flex-1 flex-col space-y-8"
          >
            {navigation.map((section) => (
              <div key={section.title}>
                <span
                  aria-hidden={isCollapsed}
                  className={cx(
                    "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity duration-200 dark:text-gray-400",
                    isCollapsed ? "opacity-0 pointer-events-none" : "opacity-100",
                  )}
                >
                  {section.title}
                </span>
                <ul role="list" className="mt-1 space-y-1">
                  {section.items.map((item) => (
                    <li key={item.name}>
                      <NavigationItemComponent
                        item={item}
                        isActive={isActive(item.href)}
                        isCollapsed={isCollapsed}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          
          {/* User Profile */}
          <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-800">
            <UserProfileDesktop />
          </div>
        </aside>
      </nav>
      
      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <Link 
          href={brandHref}
          aria-label={`${brandName} home`}
          className={cx(
            "font-semibold text-gray-900 dark:text-gray-50 text-sm sm:text-base truncate",
            "transition-colors duration-200 hover:text-blue-600 hover:dark:text-blue-400",
            focusRing,
          )}
        >
          {brandName}
        </Link>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile />
          <MobileSidebar 
            title={brandName}
            sections={navigation}
          />
        </div>
      </div>
    </>
  )
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { 
  SidebarProps, 
  NavigationItem, 
  NavigationSection 
}
