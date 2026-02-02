"use client";

import {
  Home,
  BarChart3,
  Package,
  DollarSign,
  Warehouse,
  ShoppingCart,
  Users,
  Handshake,
  Truck,
  UserCheck,
  MapPin,
  MessageSquare,
  Shield,
  Settings,
  ChevronUp,
  ChevronDown,
  Boxes,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAuth } from "@/hooks/authentication/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

// Type definitions for navigation
interface NavSubItem {
  title: string;
  url: string;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  subItems?: NavSubItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// Navigation structure for all 24 modules
const navigationGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        subItems: [
          { title: "Products", url: "/inventory/products" },
          { title: "Categories", url: "/inventory/categories" },
          { title: "Brands", url: "/inventory/brands" },
          { title: "Stock Levels", url: "/inventory/stock" },
          { title: "Adjustments", url: "/inventory/adjustments" },
        ],
      },
      {
        title: "Warehouse",
        url: "/warehouse",
        icon: Warehouse,
        subItems: [
          { title: "Overview", url: "/warehouse" },
          { title: "Picking", url: "/warehouse/picking" },
          { title: "Shipping", url: "/warehouse/shipping" },
          { title: "Zones", url: "/warehouse/zones" },
          { title: "Kitting", url: "/warehouse/kitting" },
        ],
      },
      {
        title: "POS",
        url: "/pos",
        icon: ShoppingCart,
        subItems: [
          { title: "Terminal", url: "/pos/terminal" },
          { title: "Transactions", url: "/pos/transactions" },
          { title: "Configuration", url: "/pos/config" },
        ],
      },
    ],
  },
  {
    label: "Finance",
    items: [
      {
        title: "Financial",
        url: "/financial",
        icon: DollarSign,
        subItems: [
          { title: "Dashboard", url: "/financial/dashboard" },
          { title: "Chart of Accounts", url: "/financial/accounts" },
          { title: "Journal Entries", url: "/financial/journal" },
          { title: "Transactions", url: "/financial/transactions" },
          { title: "Reconciliation", url: "/financial/reconciliation" },
          { title: "Reports", url: "/financial/reports" },
        ],
      },
    ],
  },
  {
    label: "Business",
    items: [
      {
        title: "CRM",
        url: "/crm",
        icon: Users,
        subItems: [
          { title: "Customers", url: "/crm/customers" },
          { title: "Leads", url: "/crm/leads" },
          { title: "Campaigns", url: "/crm/campaigns" },
          { title: "Loyalty", url: "/crm/loyalty" },
        ],
      },
      {
        title: "B2B",
        url: "/b2b",
        icon: Handshake,
        subItems: [
          { title: "Customers", url: "/b2b/customers" },
          { title: "Orders", url: "/b2b/orders" },
          { title: "Pricing", url: "/b2b/pricing" },
          { title: "Contracts", url: "/b2b/contracts" },
        ],
      },
      {
        title: "Suppliers",
        url: "/suppliers",
        icon: Truck,
        subItems: [
          { title: "All Suppliers", url: "/suppliers" },
          { title: "Evaluations", url: "/suppliers/evaluations" },
          { title: "Procurement", url: "/suppliers/procurement" },
        ],
      },
    ],
  },
  {
    label: "People & Places",
    items: [
      {
        title: "Employees",
        url: "/employees",
        icon: UserCheck,
        subItems: [
          { title: "Directory", url: "/employees" },
          { title: "Time Tracking", url: "/employees/time-tracking" },
          { title: "Schedules", url: "/employees/schedules" },
        ],
      },
      {
        title: "Locations",
        url: "/locations",
        icon: MapPin,
        subItems: [
          { title: "All Locations", url: "/locations" },
          { title: "Franchises", url: "/locations/franchises" },
          { title: "Pricing", url: "/locations/pricing" },
          { title: "Inventory Policies", url: "/locations/inventory-policies" },
        ],
      },
    ],
  },
  {
    label: "Communication",
    items: [
      {
        title: "Communication Hub",
        url: "/communications",
        icon: MessageSquare,
        subItems: [
          { title: "Email", url: "/communications/email" },
          { title: "SMS", url: "/communications/sms" },
          { title: "Notifications", url: "/communications/notifications" },
          { title: "Campaigns", url: "/communications/campaigns" },
        ],
      },
    ],
  },
  {
    label: "System",
    items: [
      {
        title: "Security",
        url: "/security",
        icon: Shield,
        subItems: [
          { title: "Authentication", url: "/security/auth" },
          { title: "Sessions", url: "/security/sessions" },
          { title: "Roles & Permissions", url: "/security/roles" },
          { title: "Audit Logs", url: "/security/audit" },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        subItems: [
          { title: "Account", url: "/settings/account" },
          { title: "Tenant", url: "/settings/tenant" },
          { title: "Integrations", url: "/settings/integrations" },
          { title: "Backup", url: "/settings/backup" },
        ],
      },
    ],
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Helper to check if path is active
  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname?.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Boxes className="h-4 w-4" />
                </div>
                <span className="font-semibold">Business Manager</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        {navigationGroups.map((group) => (
          <Collapsible key={group.label} defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="w-full">
                  {group.label}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        {item.subItems ? (
                          <Collapsible
                            defaultOpen={isActive(item.url)}
                            className="group/subitem"
                          >
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                tooltip={item.title}
                                isActive={isActive(item.url)}
                              >
                                <item.icon />
                                <span>{item.title}</span>
                                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/subitem:rotate-180" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub>
                                {item.subItems.map((subItem) => (
                                  <SidebarMenuSubItem key={subItem.url}>
                                    <SidebarMenuSubButton
                                      asChild
                                      isActive={pathname === subItem.url}
                                    >
                                      <Link href={subItem.url}>
                                        <span>{subItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </Collapsible>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            tooltip={item.title}
                            isActive={isActive(item.url)}
                          >
                            <Link href={item.url}>
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        )}
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {(user?.displayName || user?.firstName)
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user?.displayName || user?.firstName || "User"}</span>
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings/account">Account Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Preferences</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/security/audit">Activity Log</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {/* Handle logout */ }}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
