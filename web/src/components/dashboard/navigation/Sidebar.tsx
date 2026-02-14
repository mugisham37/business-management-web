"use client"
import { siteConfig } from "@/app/siteConfig"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { cx, focusRing } from "@/lib/utils"
import {
  BarChartBig,
  Briefcase,
  FileText,
  LayoutDashboard,
  PanelRightClose,
  PanelRightOpen,
  Settings2,
  Table2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import MobileSidebar from "./MobileSidebar"
import { UserProfileDesktop, UserProfileMobile } from "./UserProfile"
import { WorkspacesDropdownDesktop, WorkspacesDropdownMobile } from "./SidebarWorkspacesDropdown"
import { AuthUser } from "@/foundation/lib/auth/auth-manager"

const navigation = [
  {
    name: "Overview",
    href: siteConfig.baseLinks.overview,
    icon: LayoutDashboard,
  },
  {
    name: "Details",
    href: siteConfig.baseLinks.details,
    icon: FileText,
  },
  {
    name: "Reports",
    href: siteConfig.baseLinks.reports,
    icon: BarChartBig,
  },
  {
    name: "Transactions",
    href: siteConfig.baseLinks.transactions,
    icon: Table2,
  },
  {
    name: "Business Management",
    href: siteConfig.baseLinks.quotes.overview,
    icon: Briefcase,
  },
  {
    name: "Settings",
    href: siteConfig.baseLinks.settings.audit,
    icon: Settings2,
  },
] as const

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
  user: AuthUser | null
}

export function Sidebar({ isCollapsed, toggleSidebar, user }: SidebarProps) {
  const pathname = usePathname()
  
  const isActive = (itemHref: string) => {
    if (itemHref === siteConfig.baseLinks.settings.audit) {
      return pathname.startsWith("/dashboard/settings")
    }
    if (itemHref === siteConfig.baseLinks.quotes.overview) {
      return pathname.startsWith("/dashboard/business")
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  return (
    <>
      {/* sidebar (lg+) */}
      <nav
        className={cx(
          isCollapsed ? "lg:w-[60px]" : "lg:w-64",
          "hidden overflow-x-hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
          "bg-sidebar border-r border-sidebar-border",
          "ease transform-gpu transition-all duration-100 will-change-transform",
        )}
      >
        <aside className="flex grow flex-col gap-y-4 overflow-y-auto whitespace-nowrap px-3 py-4">
          <div className="space-y-3">
            <div className="flex items-center gap-x-1.5">
              <button
                className={cx(
                  "group inline-flex rounded-md p-2 transition-colors hover:bg-sidebar-accent/50",
                  focusRing,
                )}
                onClick={toggleSidebar}
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? (
                  <PanelRightClose
                    className="size-5 shrink-0 text-sidebar-foreground/60 transition-colors group-hover:text-sidebar-foreground"
                    aria-hidden="true"
                  />
                ) : (
                  <PanelRightOpen
                    className="size-5 shrink-0 text-sidebar-foreground/60 transition-colors group-hover:text-sidebar-foreground"
                    aria-hidden="true"
                  />
                )}
              </button>
              {!isCollapsed && (
                <span className="text-sm font-semibold text-sidebar-foreground">
                  <a aria-label="Home Link" href="/">
                    Acme Corp.
                  </a>
                </span>
              )}
            </div>
            <WorkspacesDropdownDesktop isCollapsed={isCollapsed} />
          </div>
          <nav
            aria-label="core navigation links"
            className="flex flex-1 flex-col"
          >
            <div>
              <span
                aria-hidden={isCollapsed}
                className={cx(
                  "block h-6 text-xs font-medium leading-6 text-sidebar-foreground/60 transition-opacity duration-100",
                  isCollapsed ? "opacity-0" : "opacity-100",
                )}
              >
                Platform
              </span>
              <ul role="list" className="mt-1 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    {isCollapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Link
                            href={item.href}
                            className={cx(
                              isActive(item.href)
                                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                              "inline-flex items-center rounded-md p-2 text-sm font-medium transition-colors",
                              focusRing,
                            )}
                          >
                            <item.icon
                              className="size-5 shrink-0"
                              aria-hidden="true"
                            />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={6} className="z-[999]">
                          {item.name}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Link
                        href={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                          "flex items-center gap-x-2.5 rounded-md p-2 text-sm font-medium transition-colors",
                          focusRing,
                        )}
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
          </nav>
          <div className="mt-auto border-t border-sidebar-border pt-3">
            <UserProfileDesktop isCollapsed={isCollapsed} user={user} />
          </div>
        </aside>
      </nav>
      {/* top navbar (xs-lg) */}
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 shadow-sm sm:px-6 lg:hidden">
        <div className="flex items-center gap-2">
          <WorkspacesDropdownMobile />
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <UserProfileMobile user={user} />
          <MobileSidebar />
        </div>
      </div>
    </>
  )
}
