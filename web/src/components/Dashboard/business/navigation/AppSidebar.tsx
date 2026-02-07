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
      <SidebarHeader style={{ padding: 'var(--spacing-md)' }}>
        <div className="flex items-center" style={{ gap: 'var(--spacing-md)' }}>
          <span 
            className="flex items-center justify-center rounded-md bg-card shadow-sm ring-1 ring-border"
            style={{
              width: 'var(--avatar-size-settings-default)',
              height: 'var(--avatar-size-settings-default)',
              padding: 'var(--spacing-xs)'
            }}
          >
            <DatabaseLogo 
              className="text-primary"
              style={{
                width: 'var(--nav-item-icon-size)',
                height: 'var(--nav-item-icon-size)'
              }}
            />
          </span>
          <div>
            <span 
              className="block text-foreground"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)'
              }}
            >
              Innovex Systems
            </span>
            <span 
              className="block text-foreground"
              style={{ fontSize: 'var(--text-xs)' }}
            >
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
            <SidebarMenu style={{ gap: 'var(--nav-list-item-gap-desktop)' }}>
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
            <SidebarMenu style={{ gap: 'var(--spacing-md)' }}>
              {navigation2.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    onClick={() => toggleMenu(item.name)}
                    className={cx(
                      "flex w-full items-center justify-between rounded-md text-foreground transition-standard hover-bg-muted",
                      "focus-ring",
                    )}
                    style={{
                      padding: 'var(--nav-item-padding-y) var(--nav-item-padding-x)',
                      gap: 'var(--nav-item-gap)',
                      fontSize: 'var(--nav-item-font-size)'
                    }}
                  >
                    <div className="flex items-center" style={{ gap: 'var(--nav-item-gap)' }}>
                      <item.icon
                        className="shrink-0"
                        style={{
                          width: 'var(--nav-item-icon-size)',
                          height: 'var(--nav-item-icon-size)'
                        }}
                        aria-hidden="true"
                      />
                      {item.name}
                    </div>
                    <RiArrowDownSFill
                      className={cx(
                        openMenus.includes(item.name)
                          ? "rotate-0"
                          : "-rotate-90",
                        "shrink-0 transform text-muted-foreground transition-transform-standard",
                      )}
                      style={{
                        width: 'var(--nav-item-icon-size)',
                        height: 'var(--nav-item-icon-size)'
                      }}
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
