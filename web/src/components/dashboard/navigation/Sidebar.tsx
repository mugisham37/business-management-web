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
  { name: "Overview", href: siteConfig.baseLinks.overview, icon: Home },
  { name: "Details", href: siteConfig.baseLinks.details, icon: ListChecks },
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
            ? "text-sidebar-primary"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground",
          collapsed
            ? "inline-flex items-center rounded-md p-2"
            : "flex items-center gap-x-2.5 rounded-md p-2",
          "text-sm font-medium transition hover:bg-muted",
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
            "flex grow flex-col gap-y-4 overflow-y-auto border-r border-sidebar-border bg-sidebar whitespace-nowrap",
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
                    className="group inline-flex rounded-md p-2 hover:bg-muted"
                    onClick={toggleSidebar}
                  >
                    {isCollapsed ? (
                      <PanelRightClose
                        className="size-5 shrink-0 text-muted-foreground group-hover:text-sidebar-foreground"
                        aria-hidden="true"
                      />
                    ) : (
                      <PanelRightOpen
                        className="size-5 shrink-0 text-muted-foreground group-hover:text-sidebar-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                )}
                <span
                  className={cx(
                    "text-sm font-semibold text-sidebar-foreground transition-opacity",
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
                  "block h-6 text-xs font-medium leading-6 text-muted-foreground transition-opacity",
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


          </nav>

          {/* User Profile */}
          <div className="mt-auto border-t border-sidebar-border pt-3">
            <UserProfileDesktop isCollapsed={isCollapsed} />
          </div>
        </aside>
      </nav>

      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 shadow-sm sm:px-6 lg:hidden">
        {showWorkspaceDropdown ? (
          <WorkspacesDropdownMobile />
        ) : (
          <span className="text-sm font-semibold text-sidebar-foreground">
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
