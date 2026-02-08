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
    { href: "/dashboard/customer/support", label: "Support", path: "/dashboard/customer/support" },
    { href: "/dashboard/customer/retention", label: "Retention", path: "/dashboard/customer/retention" },
    { href: "/dashboard/customer/workflow", label: "Workflow", path: "/dashboard/customer/workflow" },
    { href: "/dashboard/customer/agents", label: "Agents", path: "/dashboard/customer/agents" },
  ]

  return (
    <div 
      className="sticky-header"
      style={{ height: 'var(--customer-header-height)' }}
    >
      <div 
        className="mx-auto flex items-center justify-between"
        style={{ 
          maxWidth: 'var(--customer-content-max-width)',
          padding: 'var(--spacing-xs) var(--spacing-md)'
        }}
      >
        <div>
          <Link href="/" aria-label="Navigate to homepage" className={cx(focusRing, "rounded-sm")}>
            <span className="sr-only">Your Company</span>
            <DatabaseLogo className="h-6" />
          </Link>
        </div>
        <div 
          className="flex flex-nowrap"
          style={{ 
            height: 'var(--customer-header-height)',
            gap: 'var(--spacing-xs)'
          }}
        >
          <Notifications />
          <DropdownUserProfile variant="customer" iconLibrary="remix">
            <button
              aria-label="open settings"
              className={cx(
                focusRing,
                "interactive-button-base group",
              )}
              data-state="closed"
            >
              <span
                className="avatar-circle shrink-0"
                style={{
                  width: 'var(--avatar-size-sm)',
                  height: 'var(--avatar-size-sm)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--font-medium)'
                }}
                aria-hidden="true"
              >
                ES
              </span>
            </button>
          </DropdownUserProfile>
        </div>
      </div>
      <TabNavigation 
        style={{ 
          marginTop: 'var(--spacing-md)',
          height: 'var(--customer-tab-nav-height)'
        }}
      >
        <div 
          className="mx-auto flex w-full items-center"
          style={{ 
            maxWidth: 'var(--customer-content-max-width)',
            padding: '0 var(--spacing-lg)'
          }}
        >
          {navigationItems.map((item) => (
            <TabNavigationLink
              key={item.href}
              className="inline-flex"
              style={{ gap: 'var(--spacing-xs)' }}
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
