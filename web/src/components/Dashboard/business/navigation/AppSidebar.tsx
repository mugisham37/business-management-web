"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarLink,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarSeparator,
  SidebarSubLink,
} from "@/components/ui/Sidebar"
import { siteConfig } from "@/app/siteConfig"
import { cx } from "@/lib/utils"
import { RiArrowDownSFill } from "@remixicon/react"
import { BookText, House, PackageSearch } from "lucide-react"
import { usePathname } from "next/navigation"
import * as React from "react"
import { DatabaseLogo } from "@/components/DatabaseLogo"
import { UserProfile } from "../../shared/UserProfile"

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
  
  return (
    <Sidebar {...props} className="bg-sidebar">
      <SidebarHeader className="px-3 py-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md bg-card p-1.5 shadow-sm ring-1 ring-border">
            <DatabaseLogo className="size-6 text-primary" />
          </span>
          <div>
            <span className="block text-sm font-semibold text-foreground">
              Innovex Systems
            </span>
            <span className="block text-xs text-foreground">
              Premium Starter Plan
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarInput
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
                    isActive={pathname === item.href}
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
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-4">
              {navigation2.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => toggleMenu(item.name)}
                    className={cx(
                      "flex w-full items-center justify-between gap-x-2.5 rounded-md p-2 text-base text-foreground transition-standard hover-bg-muted sm:text-sm",
                      "focus-ring",
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
                        "size-5 shrink-0 transform text-muted-foreground transition-transform-standard",
                      )}
                      aria-hidden="true"
                    />
                  </SidebarMenuButton>
                  {item.children && openMenus.includes(item.name) && (
                    <SidebarMenuSub>
                      <div className="absolute inset-y-0 left-4 w-px bg-border" />
                      {item.children.map((child) => (
                        <SidebarMenuSubItem key={child.name}>
                          <SidebarSubLink
                            href={child.href}
                            isActive={pathname === child.href || pathname.startsWith(child.href)}
                          >
                            {child.name}
                          </SidebarSubLink>
                        </SidebarMenuSubItem>
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
        <SidebarSeparator />
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  )
}
