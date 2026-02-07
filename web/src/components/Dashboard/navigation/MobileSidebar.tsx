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
import { siteConfig } from "@/app/siteConfig"
import { cx, focusRing } from "@/lib/utils"
import { BarChartBig, Building2, FileText, Menu, Receipt, Settings2, Table2 } from "lucide-react"
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
  className?: string
}

const defaultNavigation: NavigationSection[] = [
  {
    title: "Platform",
    items: [
      { name: "Overview", href: siteConfig.baseLinks.overview, icon: BarChartBig },
      { name: "Details", href: siteConfig.baseLinks.details, icon: Table2 },
      { name: "Transactions", href: siteConfig.baseLinks.transactions, icon: Receipt },
      { name: "Reports", href: siteConfig.baseLinks.reports, icon: FileText },
      { name: "Business Management", href: siteConfig.baseLinks.business, icon: Building2 },
      { name: "Settings", href: siteConfig.baseLinks.settings.general, icon: Settings2 },
    ],
  },
] as const

export default function MobileSidebar({
  title = "Acme Corp.",
  description,
  sections = defaultNavigation,
  className,
}: MobileSidebarProps) {
  const pathname = usePathname()
  
  const isActive = (itemHref: string): boolean => {
    if (itemHref === siteConfig.baseLinks.settings.general) {
      return pathname.startsWith("/dashboard/settings")
    }
    if (itemHref.includes("#")) {
      const baseHref = itemHref.split("#")[0]
      return pathname === baseHref || pathname.startsWith(baseHref)
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  const renderNavigationItem = (item: NavigationItem) => (
    <li key={item.name}>
      <DrawerClose asChild>
        <Link
          href={item.href}
          className={cx(
            "nav-item-base",
            isActive(item.href) ? "nav-item-active" : "nav-item-inactive",
            focusRing,
          )}
        >
          <item.icon
            className="size-5 shrink-0"
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
                  className="nav-section-label"
                >
                  {section.title}
                </span>
                <ul role="list" className="mt-1 space-y-1.5">
                  {section.items.map((item) => renderNavigationItem(item))}
                </ul>
              </div>
            ))}
          </nav>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
