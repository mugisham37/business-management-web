"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Home,
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
    BarChart3,
    FileText,
    Search,
} from "lucide-react";

interface CommandItem {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    group: string;
    keywords?: string[];
}

const navigationItems: CommandItem[] = [
    // Main
    { title: "Dashboard", url: "/", icon: Home, group: "Main" },
    { title: "Analytics", url: "/analytics", icon: BarChart3, group: "Main" },

    // Operations
    { title: "Inventory", url: "/inventory", icon: Package, group: "Operations", keywords: ["products", "stock"] },
    { title: "Products", url: "/inventory/products", icon: Package, group: "Operations" },
    { title: "Categories", url: "/inventory/categories", icon: Package, group: "Operations" },
    { title: "Stock Levels", url: "/inventory/stock", icon: Package, group: "Operations" },
    { title: "Warehouse", url: "/warehouse", icon: Warehouse, group: "Operations", keywords: ["picking", "shipping"] },
    { title: "POS Terminal", url: "/pos/terminal", icon: ShoppingCart, group: "Operations", keywords: ["point of sale", "sales"] },

    // Finance
    { title: "Financial Dashboard", url: "/financial/dashboard", icon: DollarSign, group: "Finance", keywords: ["accounting", "money"] },
    { title: "Chart of Accounts", url: "/financial/accounts", icon: DollarSign, group: "Finance" },
    { title: "Transactions", url: "/financial/transactions", icon: DollarSign, group: "Finance" },
    { title: "Reports", url: "/financial/reports", icon: FileText, group: "Finance" },

    // Business
    { title: "CRM", url: "/crm", icon: Users, group: "Business", keywords: ["customers", "leads"] },
    { title: "Customers", url: "/crm/customers", icon: Users, group: "Business" },
    { title: "B2B", url: "/b2b", icon: Handshake, group: "Business", keywords: ["business", "wholesale"] },
    { title: "Suppliers", url: "/suppliers", icon: Truck, group: "Business", keywords: ["vendors"] },

    // People & Places
    { title: "Employees", url: "/employees", icon: UserCheck, group: "People & Places", keywords: ["staff", "team"] },
    { title: "Locations", url: "/locations", icon: MapPin, group: "People & Places", keywords: ["stores", "branches"] },

    // Communication
    { title: "Communications", url: "/communications", icon: MessageSquare, group: "Communication", keywords: ["email", "sms", "notifications"] },

    // System
    { title: "Security", url: "/security", icon: Shield, group: "System", keywords: ["auth", "permissions"] },
    { title: "Settings", url: "/settings", icon: Settings, group: "System" },
];

export function CommandMenu() {
    const router = useRouter();
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    // Group items by category
    const groupedItems = React.useMemo(() => {
        const groups: Record<string, CommandItem[]> = {};
        navigationItems.forEach((item) => {
            const groupName = item.group || "Other";
            if (!groups[groupName]) {
                groups[groupName] = [];
            }
            groups[groupName].push(item);
        });
        return groups;
    }, []);

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                {Object.entries(groupedItems).map(([group, items], index) => (
                    <React.Fragment key={group}>
                        {index > 0 && <CommandSeparator />}
                        <CommandGroup heading={group}>
                            {items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <CommandItem
                                        key={item.url}
                                        value={`${item.title} ${item.keywords?.join(" ") || ""}`}
                                        onSelect={() => {
                                            runCommand(() => router.push(item.url));
                                        }}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        <span>{item.title}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </React.Fragment>
                ))}
            </CommandList>
        </CommandDialog>
    );
}
