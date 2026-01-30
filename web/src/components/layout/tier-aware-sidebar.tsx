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
  Lock,
  Crown,
  Zap,
  Menu,
  X,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
import { useTierAccess, BusinessTier } from "@/hooks/utilities-infrastructure/useTierAccess";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

// Type definitions for navigation with tier requirements
interface NavSubItem {
  title: string;
  url: string;
  requiredTier?: BusinessTier;
}

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  requiredTier: BusinessTier;
  subItems?: NavSubItem[];
  isCore?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
  requiredTier?: BusinessTier;
}

// Tier-based navigation structure
const tierBasedNavigationGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: Home, requiredTier: BusinessTier.MICRO, isCore: true },
      { title: "Analytics", url: "/analytics", icon: BarChart3, requiredTier: BusinessTier.SMALL },
    ],
  },
  {
    label: "Operations",
    requiredTier: BusinessTier.MICRO,
    items: [
      {
        title: "Inventory",
        url: "/inventory",
        icon: Package,
        requiredTier: BusinessTier.MICRO,
        isCore: true,
        subItems: [
          { title: "Products", url: "/inventory/products", requiredTier: BusinessTier.MICRO },
          { title: "Categories", url: "/inventory/categories", requiredTier: BusinessTier.MICRO },
          { title: "Brands", url: "/inventory/brands", requiredTier: BusinessTier.SMALL },
          { title: "Stock Levels", url: "/inventory/stock", requiredTier: BusinessTier.MICRO },
          { title: "Adjustments", url: "/inventory/adjustments", requiredTier: BusinessTier.SMALL },
        ],
      },
      {
        title: "Warehouse",
        url: "/warehouse",
        icon: Warehouse,
        requiredTier: BusinessTier.MEDIUM,
        subItems: [
          { title: "Overview", url: "/warehouse", requiredTier: BusinessTier.MEDIUM },
          { title: "Picking", url: "/warehouse/picking", requiredTier: BusinessTier.MEDIUM },
          { title: "Shipping", url: "/warehouse/shipping", requiredTier: BusinessTier.MEDIUM },
          { title: "Zones", url: "/warehouse/zones", requiredTier: BusinessTier.ENTERPRISE },
          { title: "Kitting", url: "/warehouse/kitting", requiredTier: BusinessTier.ENTERPRISE },
        ],
      },
      {
        title: "POS",
        url: "/pos",
        icon: ShoppingCart,
        requiredTier: BusinessTier.MICRO,
        isCore: true,
        subItems: [
          { title: "Terminal", url: "/pos/terminal", requiredTier: BusinessTier.MICRO },
          { title: "Transactions", url: "/pos/transactions", requiredTier: BusinessTier.MICRO },
          { title: "Configuration", url: "/pos/config", requiredTier: BusinessTier.SMALL },
        ],
      },
    ],
  },
  {
    label: "Finance",
    requiredTier: BusinessTier.SMALL,
    items: [
      {
        title: "Financial",
        url: "/financial",
        icon: DollarSign,
        requiredTier: BusinessTier.SMALL,
        subItems: [
          { title: "Dashboard", url: "/financial/dashboard", requiredTier: BusinessTier.SMALL },
          { title: "Chart of Accounts", url: "/financial/accounts", requiredTier: BusinessTier.MEDIUM },
          { title: "Journal Entries", url: "/financial/journal", requiredTier: BusinessTier.MEDIUM },
          { title: "Transactions", url: "/financial/transactions", requiredTier: BusinessTier.SMALL },
          { title: "Reconciliation", url: "/financial/reconciliation", requiredTier: BusinessTier.MEDIUM },
          { title: "Reports", url: "/financial/reports", requiredTier: BusinessTier.SMALL },
        ],
      },
    ],
  },
  {
    label: "Business",
    requiredTier: BusinessTier.SMALL,
    items: [
      {
        title: "CRM",
        url: "/crm",
        icon: Users,
        requiredTier: BusinessTier.SMALL,
        subItems: [
          { title: "Customers", url: "/crm/customers", requiredTier: BusinessTier.SMALL },
          { title: "Leads", url: "/crm/leads", requiredTier: BusinessTier.MEDIUM },
          { title: "Campaigns", url: "/crm/campaigns", requiredTier: BusinessTier.MEDIUM },
          { title: "Loyalty", url: "/crm/loyalty", requiredTier: BusinessTier.SMALL },
        ],
      },
      {
        title: "B2B",
        url: "/b2b",
        icon: Handshake,
        requiredTier: BusinessTier.MEDIUM,
        subItems: [
          { title: "Customers", url: "/b2b/customers", requiredTier: BusinessTier.MEDIUM },
          { title: "Orders", url: "/b2b/orders", requiredTier: BusinessTier.MEDIUM },
          { title: "Pricing", url: "/b2b/pricing", requiredTier: BusinessTier.ENTERPRISE },
          { title: "Contracts", url: "/b2b/contracts", requiredTier: BusinessTier.ENTERPRISE },
        ],
      },
      {
        title: "Suppliers",
        url: "/suppliers",
        icon: Truck,
        requiredTier: BusinessTier.MEDIUM,
        subItems: [
          { title: "All Suppliers", url: "/suppliers", requiredTier: BusinessTier.MEDIUM },
          { title: "Evaluations", url: "/suppliers/evaluations", requiredTier: BusinessTier.ENTERPRISE },
          { title: "Procurement", url: "/suppliers/procurement", requiredTier: BusinessTier.MEDIUM },
        ],
      },
    ],
  },
  {
    label: "People & Places",
    requiredTier: BusinessTier.SMALL,
    items: [
      {
        title: "Employees",
        url: "/employees",
        icon: UserCheck,
        requiredTier: BusinessTier.SMALL,
        subItems: [
          { title: "Directory", url: "/employees", requiredTier: BusinessTier.SMALL },
          { title: "Time Tracking", url: "/employees/time-tracking", requiredTier: BusinessTier.MEDIUM },
          { title: "Schedules", url: "/employees/schedules", requiredTier: BusinessTier.MEDIUM },
        ],
      },
      {
        title: "Locations",
        url: "/locations",
        icon: MapPin,
        requiredTier: BusinessTier.MEDIUM,
        subItems: [
          { title: "All Locations", url: "/locations", requiredTier: BusinessTier.MEDIUM },
          { title: "Franchises", url: "/locations/franchises", requiredTier: BusinessTier.ENTERPRISE },
          { title: "Pricing", url: "/locations/pricing", requiredTier: BusinessTier.ENTERPRISE },
          { title: "Inventory Policies", url: "/locations/inventory-policies", requiredTier: BusinessTier.ENTERPRISE },
        ],
      },
    ],
  },
  {
    label: "Communication",
    requiredTier: BusinessTier.MEDIUM,
    items: [
      {
        title: "Communication Hub",
        url: "/communications",
        icon: MessageSquare,
        requiredTier: BusinessTier.MEDIUM,
        subItems: [
          { title: "Email", url: "/communications/email", requiredTier: BusinessTier.MEDIUM },
          { title: "SMS", url: "/communications/sms", requiredTier: BusinessTier.ENTERPRISE },
          { title: "Notifications", url: "/communications/notifications", requiredTier: BusinessTier.MEDIUM },
          { title: "Campaigns", url: "/communications/campaigns", requiredTier: BusinessTier.ENTERPRISE },
        ],
      },
    ],
  },
  {
    label: "System",
    requiredTier: BusinessTier.SMALL,
    items: [
      {
        title: "Security",
        url: "/security",
        icon: Shield,
        requiredTier: BusinessTier.SMALL,
        subItems: [
          { title: "Authentication", url: "/security/auth", requiredTier: BusinessTier.SMALL },
          { title: "Sessions", url: "/security/sessions", requiredTier: BusinessTier.SMALL },
          { title: "Roles & Permissions", url: "/security/roles", requiredTier: BusinessTier.MEDIUM },
          { title: "Audit Logs", url: "/security/audit", requiredTier: BusinessTier.MEDIUM },
        ],
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        requiredTier: BusinessTier.MICRO,
        isCore: true,
        subItems: [
          { title: "Account", url: "/settings/account", requiredTier: BusinessTier.MICRO },
          { title: "Tenant", url: "/settings/tenant", requiredTier: BusinessTier.SMALL },
          { title: "Integrations", url: "/settings/integrations", requiredTier: BusinessTier.MEDIUM },
          { title: "Backup", url: "/settings/backup", requiredTier: BusinessTier.ENTERPRISE },
        ],
      },
    ],
  },
];

// Tier display configuration
const TIER_CONFIG = {
  [BusinessTier.MICRO]: {
    name: "Free",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    icon: Home,
  },
  [BusinessTier.SMALL]: {
    name: "Growth",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    icon: Zap,
  },
  [BusinessTier.MEDIUM]: {
    name: "Business",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    icon: Crown,
  },
  [BusinessTier.ENTERPRISE]: {
    name: "Industry",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    icon: Crown,
  },
};

interface TierAwareSidebarProps {
  currentTier?: BusinessTier;
  onUpgradeClick?: (requiredTier: BusinessTier) => void;
}

// Mobile Bottom Navigation Component
function MobileBottomNav({ 
  currentTier, 
  onUpgradeClick 
}: { 
  currentTier: BusinessTier; 
  onUpgradeClick?: (requiredTier: BusinessTier) => void; 
}) {
  const pathname = usePathname();
  const { tierMeetsRequirement } = useTierAccess();

  // Core navigation items for mobile bottom nav
  const mobileNavItems = [
    { title: "Dashboard", url: "/", icon: Home, requiredTier: BusinessTier.MICRO },
    { title: "Inventory", url: "/inventory", icon: Package, requiredTier: BusinessTier.MICRO },
    { title: "POS", url: "/pos", icon: ShoppingCart, requiredTier: BusinessTier.MICRO },
    { title: "Analytics", url: "/analytics", icon: BarChart3, requiredTier: BusinessTier.SMALL },
  ];

  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname?.startsWith(url);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const hasItemAccess = hasAccess(currentTier, item.requiredTier);
          const ItemIcon = item.icon;
          
          return (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                isActive(item.url) ? 'text-primary' : 'text-muted-foreground'
              } ${!hasItemAccess ? 'opacity-50' : ''}`}
              onClick={() => {
                if (hasItemAccess) {
                  window.location.href = item.url;
                } else {
                  onUpgradeClick?.(item.requiredTier);
                }
              }}
              asChild={hasItemAccess}
            >
              {hasItemAccess ? (
                <Link href={item.url}>
                  <ItemIcon className="h-4 w-4" />
                  <span className="text-xs">{item.title}</span>
                </Link>
              ) : (
                <>
                  <div className="relative">
                    <ItemIcon className="h-4 w-4" />
                    <Lock className="h-2 w-2 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-xs">{item.title}</span>
                </>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// Mobile Sidebar Sheet Component
function MobileSidebarSheet({ 
  children, 
  currentTier 
}: { 
  children: React.ReactNode; 
  currentTier: BusinessTier; 
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden fixed top-4 left-4 z-50 bg-background/80 backdrop-blur-sm border"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-80">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Boxes className="h-4 w-4" />
              </div>
              <span className="font-semibold">Business Manager</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Current Tier Display */}
          <div className="p-4 border-b">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${TIER_CONFIG[currentTier].color}`}>
              {(() => {
                const TierIcon = TIER_CONFIG[currentTier].icon;
                return <TierIcon className="h-4 w-4" />;
              })()}
              <span className="font-medium">{TIER_CONFIG[currentTier].name} Plan</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {children}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function TierAwareSidebar({ 
  currentTier = BusinessTier.MICRO, 
  onUpgradeClick 
}: TierAwareSidebarProps) {
  const { user } = useAuth();
  const { tierMeetsRequirement } = useTierAccess();
  const pathname = usePathname();
  const [showLockedItems, setShowLockedItems] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Helper to check if path is active
  const isActive = (url: string) => {
    if (url === "/") return pathname === "/";
    return pathname?.startsWith(url);
  };

  // Helper to check if user has access to a tier
  const hasAccess = (requiredTier: BusinessTier) => {
    return tierMeetsRequirement(currentTier, requiredTier);
  };

  // Filter navigation groups and items based on tier
  const filteredNavigationGroups = useMemo(() => {
    return tierBasedNavigationGroups
      .map((group) => {
        // Filter items in the group
        const accessibleItems = group.items.filter((item) => 
          showLockedItems || hasAccess(item.requiredTier)
        );
        
        const lockedItems = group.items.filter((item) => 
          !hasAccess(item.requiredTier)
        );

        return {
          ...group,
          items: accessibleItems,
          lockedItems: showLockedItems ? [] : lockedItems,
        };
      })
      .filter((group) => 
        group.items.length > 0 || (showLockedItems && group.lockedItems.length > 0)
      );
  // Using tierMeetsRequirement and currentTier instead of hasAccess function for proper dependency tracking
  }, [showLockedItems, tierMeetsRequirement, currentTier]);

  // Render upgrade indicator for locked items
  const renderUpgradeIndicator = (requiredTier: BusinessTier) => (
    <div className="flex items-center gap-2">
      <Lock className="h-3 w-3 text-muted-foreground" />
      <Badge 
        variant="secondary" 
        className={`text-xs ${TIER_CONFIG[requiredTier].color}`}
      >
        {TIER_CONFIG[requiredTier].name}
      </Badge>
    </div>
  );

  // Render locked item with upgrade prompt
  const renderLockedItem = (item: NavItem) => (
    <SidebarMenuItem key={`locked-${item.title}`}>
      <SidebarMenuButton
        tooltip={`Upgrade to ${TIER_CONFIG[item.requiredTier].name} to access ${item.title}`}
        className="opacity-60 cursor-pointer hover:opacity-80"
        onClick={() => onUpgradeClick?.(item.requiredTier)}
      >
        <item.icon className="opacity-50" />
        <span className="opacity-75">{item.title}</span>
        {renderUpgradeIndicator(item.requiredTier)}
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  // Mobile upgrade prompt component
  const MobileUpgradePrompt = ({ requiredTier }: { requiredTier: BusinessTier }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg p-6 max-w-sm w-full">
        <div className="text-center">
          <Crown className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Upgrade Required</h3>
          <p className="text-muted-foreground mb-4">
            This feature requires the {TIER_CONFIG[requiredTier].name} plan.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => {}}>
              Learn More
            </Button>
            <Button className="flex-1" onClick={() => onUpgradeClick?.(requiredTier)}>
              Upgrade Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const sidebarContent = (
    <>
      {/* Toggle for showing locked items */}
      <div className="px-2 py-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs"
          onClick={() => setShowLockedItems(!showLockedItems)}
        >
          {showLockedItems ? "Hide" : "Show"} locked features
        </Button>
      </div>

      {filteredNavigationGroups.map((group) => (
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
                  {/* Accessible items */}
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
                              {item.isCore && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  Core
                                </Badge>
                              )}
                              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/subitem:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.subItems
                                .filter((subItem) => 
                                  !subItem.requiredTier || hasAccess(subItem.requiredTier)
                                )
                                .map((subItem) => (
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
                              
                              {/* Locked sub-items */}
                              {showLockedItems && item.subItems
                                .filter((subItem) => 
                                  subItem.requiredTier && !hasAccess(subItem.requiredTier)
                                )
                                .map((subItem) => (
                                  <SidebarMenuSubItem key={`locked-${subItem.url}`}>
                                    <SidebarMenuSubButton
                                      className="opacity-60 cursor-pointer hover:opacity-80"
                                      onClick={() => onUpgradeClick?.(subItem.requiredTier!)}
                                    >
                                      <span className="opacity-75">{subItem.title}</span>
                                      {renderUpgradeIndicator(subItem.requiredTier!)}
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
                            {item.isCore && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                Core
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarMenuItem>
                  ))}

                  {/* Locked items */}
                  {showLockedItems && group.lockedItems.map(renderLockedItem)}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      ))}
    </>
  );

  // Mobile layout
  if (isMobile) {
    return (
      <>
        <MobileSidebarSheet currentTier={currentTier}>
          <SidebarContent>
            {sidebarContent}
          </SidebarContent>
          
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {user?.firstName
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {user?.firstName || "User"}
                      </span>
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
                    <DropdownMenuItem onClick={() => onUpgradeClick?.(BusinessTier.SMALL)}>
                      Upgrade Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {/* Handle logout */ }}>
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </MobileSidebarSheet>
        
        <MobileBottomNav 
          currentTier={currentTier} 
          onUpgradeClick={onUpgradeClick} 
        />
      </>
    );
  }

  // Desktop layout
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
        
        {/* Current Tier Display */}
        <div className="px-2 py-2">
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${TIER_CONFIG[currentTier].color}`}>
            {(() => {
              const TierIcon = TIER_CONFIG[currentTier].icon;
              return <TierIcon className="h-4 w-4" />;
            })()}
            <span className="font-medium">{TIER_CONFIG[currentTier].name} Plan</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarSeparator />
      
      <SidebarContent>
        {sidebarContent}
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback>
                      {user?.firstName
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">
                    {user?.firstName || "User"}
                  </span>
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
                <DropdownMenuItem onClick={() => onUpgradeClick?.(BusinessTier.SMALL)}>
                  Upgrade Plan
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