import { siteConfig } from "@/app/siteConfig"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { cx, focusRing } from "@/lib/utils"

import {
  BarChartBig,
  Briefcase,
  FileText,
  LayoutDashboard,
  Menu,
  Settings2,
  Table2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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
    name: "Business",
    href: siteConfig.baseLinks.quotes.overview,
    icon: Briefcase,
  },
  {
    name: "Settings",
    href: siteConfig.baseLinks.settings.audit,
    icon: Settings2,
  },
] as const

export default function MobileSidebar() {
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
      <Drawer>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            aria-label="open sidebar"
            className="group flex items-center rounded-md p-1.5 text-sm font-medium hover:bg-muted data-[state=open]:bg-muted"
          >
            <Menu className="size-6 shrink-0 text-muted-foreground" aria-hidden="true" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Acme Corp.</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4">
            <nav
              aria-label="core mobile navigation links"
              className="flex flex-1 flex-col"
            >
              <div>
                <span className="block h-6 text-xs font-medium leading-6 text-muted-foreground">
                  Platform
                </span>
                <ul role="list" className="mt-1 space-y-1.5">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <DrawerClose asChild>
                        <Link
                          href={item.href}
                          className={cx(
                            isActive(item.href)
                              ? "bg-accent text-accent-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition-colors sm:text-sm",
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
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
