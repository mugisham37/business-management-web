"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import {
    Plus,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Mail,
    Phone,
    FileDown,
    Upload,
} from "lucide-react";
import Link from "next/link";

// Customer type
interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    type: "enterprise" | "smb" | "startup";
    totalSpent: number;
    ordersCount: number;
    status: "active" | "inactive" | "churned";
    createdAt: string;
}

// Mock data
const mockCustomers: Customer[] = [
    { id: "1", name: "Sarah Johnson", email: "sarah@techinnovations.com", phone: "+1 555-0101", company: "Tech Innovations Inc", type: "enterprise", totalSpent: 156000, ordersCount: 45, status: "active", createdAt: "2024-03-15" },
    { id: "2", name: "Michael Chen", email: "michael@digitalsolutions.com", phone: "+1 555-0102", company: "Digital Solutions LLC", type: "smb", totalSpent: 89000, ordersCount: 28, status: "active", createdAt: "2024-05-22" },
    { id: "3", name: "Emily Davis", email: "emily@growthpartners.co", phone: "+1 555-0103", company: "Growth Partners", type: "enterprise", totalSpent: 234000, ordersCount: 67, status: "active", createdAt: "2023-11-08" },
    { id: "4", name: "Robert Wilson", email: "robert@startuphub.io", phone: "+1 555-0104", company: "Startup Hub", type: "startup", totalSpent: 23000, ordersCount: 12, status: "active", createdAt: "2025-01-10" },
    { id: "5", name: "Lisa Thompson", email: "lisa@globaltech.com", phone: "+1 555-0105", company: "Global Tech Corp", type: "enterprise", totalSpent: 345000, ordersCount: 89, status: "active", createdAt: "2023-06-20" },
    { id: "6", name: "James Brown", email: "james@localshop.com", phone: "+1 555-0106", company: "Local Shop Inc", type: "smb", totalSpent: 45000, ordersCount: 18, status: "inactive", createdAt: "2024-08-12" },
];

// Column definitions
const columns: ColumnDef<Customer>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>
                        {row.original.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.getValue("name")}</div>
                    <div className="text-sm text-muted-foreground">{row.original.company}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "email",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Contact" />,
        cell: ({ row }) => (
            <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    {row.getValue("email")}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {row.original.phone}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            const colors: Record<string, string> = {
                enterprise: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                smb: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                startup: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
            };
            return (
                <Badge className={colors[type]}>
                    {type.toUpperCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "totalSpent",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total Spent" />,
        cell: ({ row }) => (
            <div className="font-semibold">${(row.getValue("totalSpent") as number).toLocaleString()}</div>
        ),
    },
    {
        accessorKey: "ordersCount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" />,
        cell: ({ row }) => <Badge variant="outline">{row.getValue("ordersCount")}</Badge>,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variants: Record<string, "default" | "secondary" | "destructive"> = {
                active: "default",
                inactive: "secondary",
                churned: "destructive",
            };
            return (
                <Badge variant={variants[status]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const customer = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                            <Link href={`/crm/customers/${customer.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function CustomersPage() {
    const [customers] = useState<Customer[]>(mockCustomers);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Customers"
                description="Manage your customer database"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/crm/customers/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Customer
                            </Link>
                        </Button>
                    </div>
                }
            />

            <DataTable
                columns={columns}
                data={customers}
                searchKey="name"
            />
        </div>
    );
}
