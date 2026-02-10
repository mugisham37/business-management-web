"use client"
import { siteConfig } from "@/app/siteConfig"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cx, focusRing } from "@/lib/utils"
import {
  BarChartBig,
  Compass,
  Home,
  Link as LinkIcon,
  ListChecks,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  Table2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import {
  WorkspacesDropdownDesktop,
  WorkspacesDropdownMobile,
} from "./SidebarWorkspacesDropdown"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"

const platformNavigation = [
  { name: "Reports", href: "/dashboard/reports", icon: BarChartBig },
  {
    name: "Transactions",
    href: "/dashboard/transactions",
    icon: Table2,
  },
  {
    name: "Settings",
    href: siteConfig.baseLinks.settings.general,
    icon: Settings2,
  },
] as const

const analyticsNavigation = [
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: Home },
  { name: "Details", href: siteConfig.baseLinks.details, icon: ListChecks },
] as const

const shortcuts = [
  {
    name: "Add new user",
    href: "/dashboard/settings/users",
    icon: LinkIcon,
  },
  {
    name: "Workspace usage",
    href: "/dashboard/settings/billing#billing-overview",
    icon: LinkIcon,
  },
  {
    name: "Cost spend control",
    href: "/dashboard/settings/billing#cost-spend-control",
    icon: LinkIcon,
  },
  {
    name: "Overview – Rows written",
    href: "/dashboard/overview#usage-overview",
    icon: LinkIcon,
  },
] as const

interface SidebarProps {
  isCollapsed?: boolean
  toggleSidebar?: () => void
  showWorkspaceDropdown?: boolean
}

export function Sidebar({
  isCollapsed = false,
  toggleSidebar,
  showWorkspaceDropdown = false,
}: SidebarProps) {
  const pathname = usePathname()
  const isActive = (itemHref: string) => {
    if (
      itemHref === siteConfig.baseLinks.settings.general ||
      itemHref.includes("/settings")
    ) {
      return pathname.startsWith("/dashboard/settings")
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  const renderNavLink = (
    item: { name: string; href: string; icon: any },
    collapsed: boolean,
  ) => {
    const linkContent = (
      <Link
        href={item.href}
        className={cx(
          isActive(item.href)
            ? "text-blue-600 dark:text-blue-500"
            : "text-gray-700 hover:text-gray-900 dark:text-gray-300 hover:dark:text-gray-50",
          collapsed
            ? "inline-flex items-center rounded-md p-2"
            : "flex items-center gap-x-2.5 rounded-md p-2",
          "text-sm font-medium transition hover:bg-gray-200/50 hover:dark:bg-gray-900",
          focusRing,
        )}
      >
        <item.icon className="size-5 shrink-0" aria-hidden="true" />
        {!collapsed && item.name}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={6}>
            {item.name}
          </TooltipContent>
        </Tooltip>
      )
    }

    return linkContent
  }

  return (
    <>
      {/* sidebar (lg+) */}
      <nav
        className={cx(
          isCollapsed ? "lg:w-[60px]" : "lg:w-72",
          "hidden overflow-x-hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          "ease transform-gpu transition-all duration-100 will-change-transform",
        )}
      >
        <aside
          className={cx(
            "flex grow flex-col gap-y-4 overflow-y-auto border-r border-gray-200 bg-white whitespace-nowrap dark:border-gray-800 dark:bg-gray-950",
            isCollapsed ? "px-3 py-4" : "p-4",
          )}
        >
          {/* Header Section */}
          <div>
            {showWorkspaceDropdown && !isCollapsed ? (
              <WorkspacesDropdownDesktop />
            ) : (
              <div className="flex items-center gap-x-1.5">
                {toggleSidebar && (
                  <button
                    aria-label={
                      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                    }
                    className="group inline-flex rounded-md p-2 hover:bg-gray-200/50 hover:dark:bg-gray-900"
                    onClick={toggleSidebar}
                  >
                    {isCollapsed ? (
                      <PanelRightClose
                        className="size-5 shrink-0 text-gray-500 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                        aria-hidden="true"
                      />
                    ) : (
                      <PanelRightOpen
                        className="size-5 shrink-0 text-gray-500 group-hover:text-gray-700 dark:text-gray-500 group-hover:dark:text-gray-300"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )}
                <span
                  className={cx(
                    "text-sm font-semibold text-gray-900 transition-opacity dark:text-gray-50",
                    isCollapsed ? "opacity-0" : "opacity-100",
                  )}
                >
                  <a aria-label="Home Link" href="/">
                    Acme Corp.
                  </a>
                </span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col space-y-10"
          >
            {/* Platform Section */}
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-500",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Platform
              </span>
              <ul role="list" className={cx(isCollapsed ? "mt-1" : "mt-1", "space-y-2")}>
                {platformNavigation.map((item) => (
                  <li key={item.name}>{renderNavLink(item, isCollapsed)}</li>
                ))}
              </ul>
            </div>

            {/* Analytics Section */}
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-500",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Analytics
              </span>
              <ul role="list" className="mt-1 space-y-2">
                {analyticsNavigation.map((item) => (
                  <li key={item.name}>{renderNavLink(item, isCollapsed)}</li>
                ))}
              </ul>
            </div>

            {/* Shortcuts Section */}
            {!isCollapsed && (
              <div>
                <span className="block h-6 text-xs font-medium leading-6 text-gray-500 dark:text-gray-500">
                  Shortcuts
                </span>
                <ul aria-label="shortcuts" role="list" className="mt-1 space-y-2">
                  {shortcuts.map((item) => (
                    <li key={item.name}>{renderNavLink(item, false)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Setup Section */}
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-500",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Setup
              </span>
              <ul role="list" className="mt-1 space-y-2">
                <li>
                  {isCollapsed ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href="/auth/onboarding/products"
                          className={cx(
                            isActive("/auth/onboarding")
                              ? "text-blue-600 dark:text-blue-500"
                              : "text-gray-700 dark:text-gray-300",
                            "inline-flex items-center rounded-md p-2 text-sm font-medium transition hover:bg-gray-200/50 hover:dark:bg-gray-900",
                            focusRing,
                          )}
                        >
                          <Compass
                            className="size-5 shrink-0"
                            aria-hidden="true"
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" sideOffset={6}>
                        Onboarding
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Link
                      href="/auth/onboarding/products"
                      className={cx(
                        isActive("/auth/onboarding")
                          ? "text-blue-600 dark:text-blue-500"
                          : "text-gray-700 dark:text-gray-300",
                        "flex items-center gap-x-2.5 rounded-md p-2 text-sm font-medium transition hover:bg-gray-200/50 hover:dark:bg-gray-900",
                        focusRing,
                      )}
                    >
                      <Compass className="size-5 shrink-0" aria-hidden="true" />
                      Onboarding
                    </Link>
                  )}
                </li>
              </ul>
            </div>
          </nav>

          {/* User Profile */}
          <div className="mt-auto border-t border-gray-200 pt-3 dark:border-gray-800">
            <UserProfileDesktop isCollapsed={isCollapsed} />
          </div>
        </aside>
      </nav>

      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm sm:px-6 lg:hidden dark:border-gray-800 dark:bg-gray-950">
        {showWorkspaceDropdown ? (
          <WorkspacesDropdownMobile />
        ) : (
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-50">
            <a aria-label="Home Link" href="/">
              Acme Corp.
            </a>
          </span>
        )}
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile />
          <MobileSidebar />
        </div>
      </div>
    </>
  )
}
