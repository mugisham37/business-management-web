"use client"

import * as React from "react"
import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/ui/Button"
import { Tooltip } from "@/components/ui/Tooltip"
import { cx, focusRing } from "@/lib/utils"
import {
  BarChartBig,
  Compass,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  Table2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"

const navigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: BarChartBig },
  {
    name: "Details",
    href: siteConfig.baseLinks.details,
    icon: Table2,
  },
  {
    name: "Settings",
    href: siteConfig.baseLinks.settings.general,
    icon: Settings2,
  },
] as const

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
  className?: string
  "aria-label"?: string
}

export function Sidebar({ 
  isCollapsed, 
  toggleSidebar, 
  className,
  "aria-label": ariaLabel = "Main navigation",
  ...props 
}: SidebarProps) {
  const pathname = usePathname()
  
  const isActive = React.useCallback((itemHref: string) => {
    if (itemHref === siteConfig.baseLinks.settings.general) {
      return pathname.startsWith("/dashboard/settings")
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }, [pathname])

  const handleToggleSidebar = React.useCallback(() => {
    toggleSidebar()
  }, [toggleSidebar])

  const handleKeyDown = React.useCallback((event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleToggleSidebar()
    }
  }, [handleToggleSidebar])
  return (
    <>
      <nav
        className={cx(
          isCollapsed ? "lg:w-[60px]" : "lg:w-64",
          "hidden overflow-x-hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          "ease transform-gpu transition-all duration-200 will-change-transform",
          "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800",
          className,
        )}
        aria-label={ariaLabel}
        {...props}
      >
        <aside className="flex grow flex-col gap-y-4 overflow-y-auto whitespace-nowrap px-3 py-4">
          <div className="flex items-center gap-x-1.5">
            <Button
              variant="ghost"
              size="icon"
              className={cx(
                "group inline-flex rounded-md p-2 transition-colors duration-200",
                "hover:bg-gray-200/50 hover:dark:bg-gray-900",
                focusRing,
              )}
              onClick={handleToggleSidebar}
              onKeyDown={handleKeyDown}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <PanelRightClose
                  className="size-5 shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                  aria-hidden="true"
                />
              ) : (
                <PanelRightOpen
                  className="size-5 shrink-0 text-gray-500 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                  aria-hidden="true"
                />
              )}
            </Button>
            <span
              className={cx(
                "text-sm font-semibold text-gray-900 transition-opacity duration-200 dark:text-gray-50",
                isCollapsed ? "opacity-0" : "opacity-100",
              )}
            >
              <Link 
                href="/" 
                aria-label="Home Link"
                className={cx(
                  "transition-colors duration-200 hover:text-blue-600 hover:dark:text-blue-400",
                  focusRing,
                )}
              >
                Acme Corp.
              </Link>
            </span>
          </div>
          
          <nav
            aria-label="Platform navigation"
            className="flex flex-1 flex-col space-y-10"
          >
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity duration-200 dark:text-gray-500",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Platform
              </span>
              <ul role="list" className="mt-1 space-y-2">
                {navigation.map((item) => (
                  <li key={item.name}>
                    {isCollapsed ? (
                      <Tooltip
                        content={item.name}
                        side="right"
                        sideOffset={6}
                        showArrow={true}
                        delayDuration={300}
                        className="z-[999]"
                      >
                        <Link
                          href={item.href}
                          className={cx(
                            isActive(item.href)
                              ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/50"
                              : "text-gray-700 dark:text-gray-300",
                            "inline-flex items-center rounded-md p-2 text-sm font-medium transition-all duration-200",
                            "hover:bg-gray-200/50 hover:dark:bg-gray-900",
                            "hover:text-gray-900 hover:dark:text-gray-50",
                            focusRing,
                          )}
                          aria-label={`Navigate to ${item.name}`}
                        >
                          <item.icon
                            className="size-5 shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      </Tooltip>
                    ) : (
                      <Link
                        href={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/50"
                            : "text-gray-700 dark:text-gray-300",
                          "flex items-center gap-x-2.5 rounded-md p-2 text-sm font-medium transition-all duration-200",
                          "hover:bg-gray-200/50 hover:dark:bg-gray-900",
                          "hover:text-gray-900 hover:dark:text-gray-50",
                          focusRing,
                        )}
                        aria-label={`Navigate to ${item.name}`}
                      >
                        <item.icon
                          className="size-5 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity duration-200 dark:text-gray-500",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Setup
              </span>
              <ul role="list" className="mt-1 space-y-2">
                <li>
                  {isCollapsed ? (
                    <Tooltip
                      content="Onboarding"
                      side="right"
                      sideOffset={6}
                      showArrow={true}
                      delayDuration={300}
                      className="z-[999]"
                    >
                      <Link
                        href="/dashboard/onboarding/products"
                        className={cx(
                          isActive("/dashboard/onboarding")
                            ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/50"
                            : "text-gray-700 dark:text-gray-300",
                          "inline-flex items-center rounded-md p-2 text-sm font-medium transition-all duration-200",
                          "hover:bg-gray-200/50 hover:dark:bg-gray-900",
                          "hover:text-gray-900 hover:dark:text-gray-50",
                          focusRing,
                        )}
                        aria-label="Navigate to Onboarding"
                      >
                        <Compass
                          className="size-5 shrink-0"
                          aria-hidden="true"
                        />
                      </Link>
                    </Tooltip>
                  ) : (
                    <Link
                      href="/dashboard/onboarding/products"
                      className={cx(
                        isActive("/dashboard/onboarding")
                          ? "text-blue-600 dark:text-blue-500 bg-blue-50 dark:bg-blue-950/50"
                          : "text-gray-700 dark:text-gray-300",
                        "flex items-center gap-x-2.5 rounded-md p-2 text-sm font-medium transition-all duration-200",
                        "hover:bg-gray-200/50 hover:dark:bg-gray-900",
                        "hover:text-gray-900 hover:dark:text-gray-50",
                        focusRing,
                      )}
                      aria-label="Navigate to Onboarding"
                    >
                      <Compass className="size-5 shrink-0" aria-hidden="true" />
                      <span className="truncate">Onboarding</span>
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </nav>
          
          <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-800">
            <UserProfileDesktop 
              isCollapsed={isCollapsed}
              interactive={true}
              showStatus={true}
              showRole={true}
            />
          </div>
        </aside>
      </nav>
      
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        <Link 
          href="/" 
          aria-label="Home Link"
          className={cx(
            "font-semibold text-gray-900 sm:text-sm dark:text-gray-50",
            "transition-colors duration-200 hover:text-blue-600 hover:dark:text-blue-400",
            focusRing,
          )}
        >
          Acme Corp.
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile 
            interactive={true}
            showStatus={true}
            showTooltip={true}
          />
          <MobileSidebar />
        </div>
      </div>
    </>
  )
}
