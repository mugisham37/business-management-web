"use client"
import { siteConfig } from "@/app/siteConfig"
import { Divider } from "@/components/ui/divider"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarSubLink,
} from "@/components/ui/sidebar"
import { cx, focusRing } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { ArrowLeft, BookText, House, PackageSearch } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as React from "react"
import { DatabaseLogo as Logo } from "../../../../../public/DatabaseLogo"
import { UserProfile } from "./UserProfile"

const navigation = [
  {
    name: "Home",
    href: siteConfig.baseLinks.quotes.overview,
    icon: House,
    notifications: false,
  },
  {
    name: "Inbox",
    href: "#",
    icon: PackageSearch,
    notifications: 2,
  },
] as const

const navigation2 = [
  {
    name: "Sales",
    href: "#",
    icon: BookText,
    children: [
      {
        name: "Quotes",
        href: siteConfig.baseLinks.quotes.overview,
      },
      {
        name: "Orders",
        href: "#",
      },
      {
        name: "Insights & Reports",
        href: "#",
      },
    ],
  },
  {
    name: "Products",
    href: "#",
    icon: PackageSearch,
    children: [
      {
        name: "Items",
        href: "#",
      },
      {
        name: "Variants",
        href: "#",
      },
      {
        name: "Suppliers",
        href: "#",
      },
    ],
  },
] as const

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = React.useState<string[]>([
    navigation2[0].name,
    navigation2[1].name,
  ])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev: string[]) =>
      prev.includes(name)
        ? prev.filter((item: string) => item !== name)
        : [...prev, name],
    )
  }

  const isActive = (href: string) => {
    if (href === "#") return false
    return pathname === href || pathname.startsWith(href)
  }

  return (
    <Sidebar {...props} className="bg-muted">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-background p-1.5 shadow-sm ring-1 ring-border">
            <Logo className="size-6 text-primary" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-sidebar-foreground">
              Innovex Systems
            </span>
            <span className="block text-xs text-sidebar-foreground/60">
              Premium Starter Plan
            </span>
          </div>
        </div>
        {/* Back to Dashboard Link */}
        <Link
          href={siteConfig.baseLinks.overview}
          className={cx(
            "mt-4 flex items-center gap-2 rounded-md p-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50",
            focusRing,
          )}
        >
          <ArrowLeft className="size-4 shrink-0" aria-hidden="true" />
          <span>Back to Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Input
              type="search"
              placeholder="Search items..."
              className="[&>input]:sm:py-1.5"
            />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="pt-0">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigation.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarLink
                    href={item.href}
                    isActive={isActive(item.href)}
                    icon={item.icon}
                    notifications={item.notifications}
                  >
                    {item.name}
                  </SidebarLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="px-3">
          <Divider className="my-0 py-0" />
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {navigation2.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cx(
                      "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base text-sidebar-foreground transition-colors hover:bg-sidebar-accent/50 sm:text-sm",
                      focusRing,
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon
                        className="size-[18px] shrink-0"
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                    <RiArrowDownSFill
                      className={cx(
                        openMenus.includes(item.name)
                          ? "rotate-0"
                          : "-rotate-90",
                        "size-5 shrink-0 transform text-muted-foreground transition-transform duration-150 ease-in-out",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {item.children && openMenus.includes(item.name) && (
                    <SidebarMenuSub>
                      <div className="absolute inset-y-0 left-4 w-px bg-sidebar-border" />
                      {item.children.map((child) => (
                        <SidebarMenuItem key={child.name}>
                          <SidebarSubLink
                            href={child.href}
                            isActive={isActive(child.href)}
                          >
                            {child.name}
                          </SidebarSubLink>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="border-t border-sidebar-border" />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
