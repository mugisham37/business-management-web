"use client"

import { TabNavigation, TabNavigationLink } from "@/components/ui/TabNavigation"
import Link from "next/link"
import { Notifications } from "./Notifications"
import { usePathname } from "next/navigation"
import { DatabaseLogo } from "@/components/DatabaseLogo"
import { DropdownUserProfile } from "@/components/Dashboard/shared/DropdownUserProfile"
import { cx, focusRing } from "@/lib/utils"

function Navigation() {
  const pathname = usePathname()
  
  const navigationItems = [
    { href: "/agents/support", label: "Support", path: "/agents/support" },
    { href: "/agents/retention", label: "Retention", path: "/agents/retention" },
    { href: "/agents/workflow", label: "Workflow", path: "/agents/workflow" },
    { href: "/agents/agents", label: "Agents", path: "/agents/agents" },
  ]

  return (
    <div className="sticky-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 pt-3">
        <div>
          <Link href="/" aria-label="Navigate to homepage">
            <span className="sr-only">Your Company</span>
            <DatabaseLogo className="h-6" />
          </Link>
        </div>
        <div className="flex h-[42px] flex-nowrap gap-1">
          <Notifications />
          <DropdownUserProfile variant="customer" iconLibrary="remix">
            <button
              aria-label="open settings"
              className={cx(
                focusRing,
                "interactive-button-base group data-[state=open]:bg-[var(--interactive-active-bg)]",
              )}
            >
              <span
                className="avatar-circle size-8 shrink-0 text-xs font-medium"
                aria-hidden="true"
              >
                ES
              </span>
            </button>
          </DropdownUserProfile>
        </div>
      </div>
      <TabNavigation className="mt-5">
        <div className="mx-auto flex w-full max-w-7xl items-center px-6">
          {navigationItems.map((item) => (
            <TabNavigationLink
              key={item.href}
              className="inline-flex gap-2"
              asChild
              data-active={pathname === item.path ? "true" : undefined}
            >
              <Link href={item.href} aria-current={pathname === item.path ? "page" : undefined}>
                {item.label}
              </Link>
            </TabNavigationLink>
          ))}
        </div>
      </TabNavigation>
    </div>
  )
}

export { Navigation }
