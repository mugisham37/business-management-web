import { Button } from "@/components/ui/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/Drawer"
import { cx, focusRing } from "@/lib/utils"
import { BarChartBig, Compass, Menu, Settings2, Table2, ExternalLink } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { type LucideIcon } from "lucide-react"

interface NavigationItem {
  name: string
  href: string
  icon: LucideIcon
}

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface MobileSidebarProps {
  title?: string
  description?: string
  sections?: NavigationSection[]
  shortcuts?: NavigationItem[]
  className?: string
}

const defaultNavigation: NavigationSection[] = [
  {
    title: "Platform",
    items: [
      { name: "Reports", href: "/dashboard/reports", icon: BarChartBig },
      { name: "Transactions", href: "/dashboard/transactions", icon: Table2 },
      { name: "Settings", href: "/dashboard/settings/audit", icon: Settings2 },
    ],
  },
  {
    title: "Setup",
    items: [
      { name: "Onboarding", href: "/dashboard/onboarding/products", icon: Compass },
    ],
  },
] as const

const defaultShortcuts: NavigationItem[] = [
  { name: "Add new user", href: "/dashboard/settings/users", icon: ExternalLink },
  { name: "Workspace usage", href: "/dashboard/settings/billing#billing-overview", icon: ExternalLink },
  { name: "Cost spend control", href: "/dashboard/settings/billing#cost-spend-control", icon: ExternalLink },
  { name: "Overview – Rows written", href: "/dashboard/overview#usage-overview", icon: ExternalLink },
] as const

export default function MobileSidebar({
  title = "Acme Corp.",
  description,
  sections = defaultNavigation,
  shortcuts = defaultShortcuts,
  className,
}: MobileSidebarProps) {
  const pathname = usePathname()
  
  const isActive = (itemHref: string): boolean => {
    if (itemHref.includes("/dashboard/settings")) {
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
  }

  const renderNavigationItem = (item: NavigationItem, isShortcut = false) => (
    <li key={item.name}>
      <DrawerClose asChild>
        <Link
          href={item.href}
          className={cx(
            isActive(item.href)
              ? "text-blue-600 dark:text-blue-500"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 hover:dark:text-gray-50",
            "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-gray-100 sm:text-sm hover:dark:bg-gray-900",
            focusRing,
          )}
        >
          <item.icon
            className={cx(
              "shrink-0",
              isShortcut ? "size-4" : "size-5"
            )}
            aria-hidden="true"
          />
          {item.name}
        </Link>
      </DrawerClose>
    </li>
  )

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          className={cx(
            "group flex items-center rounded-md p-1.5 text-sm font-medium transition-colors",
            "hover:bg-gray-100 data-[state=open]:bg-gray-100 data-[state=open]:bg-gray-400/10 hover:dark:bg-gray-400/10",
            className
          )}
        >
          <Menu 
            className="size-6 shrink-0 text-gray-600 dark:text-gray-400" 
            aria-hidden="true" 
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader withCloseButton={true}>
          <DrawerTitle>{title}</DrawerTitle>
          {description && (
            <DrawerDescription>{description}</DrawerDescription>
          )}
        </DrawerHeader>
        <DrawerBody className="px-4">
          <nav
            aria-label="Mobile navigation"
            className="flex flex-1 flex-col space-y-8"
          >
            {sections.map((section) => (
              <div key={section.title}>
                <span
                  className={cx(
                    "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-400",
                  )}
                >
                  {section.title}
                </span>
                <ul role="list" className="mt-1 space-y-1.5">
                  {section.items.map((item) => renderNavigationItem(item))}
                </ul>
              </div>
            ))}
            
            {shortcuts && shortcuts.length > 0 && (
              <div>
                <span
                  className={cx(
                    "block h-6 text-xs font-medium leading-6 text-gray-500 transition-opacity dark:text-gray-400",
                  )}
                >
                  Shortcuts
                </span>
                <ul role="list" className="mt-1 space-y-1">
                  {shortcuts.map((item) => renderNavigationItem(item, true))}
                </ul>
              </div>
            )}
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
