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
  Compass,
  Home,
  ListChecks,
  Menu,
  Settings2,
  Table2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const platformNavigation = [
  {
    name: "Reports",
    href: "/dashboard/reports",
    icon: BarChartBig,
  },
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
  {
    name: "Overview",
    href: siteConfig.baseLinks.overview,
    icon: Home,
  },
  {
    name: "Details",
    href: siteConfig.baseLinks.details,
    icon: ListChecks,
  },
] as const

export default function MobileSidebar() {
  const pathname = usePathname()
  const isActive = (itemHref: string) => {
    if (itemHref.includes("/settings")) {
      return pathname.startsWith("/dashboard/settings")
    }
    return pathname === itemHref || pathname.startsWith(itemHref)
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          aria-label="open sidebar"
          className="group flex items-center rounded-md p-1.5 text-sm font-medium hover:bg-muted data-[state=open]:bg-muted"
        >
          <Menu
            className="size-6 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="sm:max-w-lg">
        <DrawerHeader>
          <DrawerTitle>Business Management</DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <nav
            aria-label="core mobile navigation links"
            className="flex flex-1 flex-col space-y-8"
          >
            <div>
              <span className="block h-6 text-xs font-medium leading-6 text-muted-foreground">
                Platform
              </span>
              <ul role="list" className="mt-1 space-y-1.5">
                {platformNavigation.map((item) => (
                  <li key={item.name}>
                    <DrawerClose asChild>
                      <Link
                        href={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-primary"
                            : "text-foreground/70 hover:text-foreground",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-muted sm:text-sm",
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

            <div>
              <span className="block h-6 text-xs font-medium leading-6 text-muted-foreground">
                Analytics
              </span>
              <ul role="list" className="mt-1 space-y-1.5">
                {analyticsNavigation.map((item) => (
                  <li key={item.name}>
                    <DrawerClose asChild>
                      <Link
                        href={item.href}
                        className={cx(
                          isActive(item.href)
                            ? "text-primary"
                            : "text-foreground/70 hover:text-foreground",
                          "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-muted sm:text-sm",
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

            <div>
              <span className="block h-6 text-xs font-medium leading-6 text-muted-foreground">
                Setup
              </span>
              <ul role="list" className="mt-1 space-y-1.5">
                <li>
                  <DrawerClose asChild>
                    <Link
                      href="/auth/onboarding/products"
                      className={cx(
                        isActive("/auth/onboarding")
                          ? "text-primary"
                          : "text-foreground/70 hover:text-foreground",
                        "flex items-center gap-x-2.5 rounded-md px-2 py-1.5 text-base font-medium transition hover:bg-muted sm:text-sm",
                        focusRing,
                      )}
                    >
                      <Compass className="size-5 shrink-0" aria-hidden="true" />
                      Onboarding
                    </Link>
                  </DrawerClose>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
