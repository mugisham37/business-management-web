"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, Building2, Plus, Eye, FileText, Mail } from "lucide-react";
import Link from "next/link";

interface B2BCustomer { id: string; name: string; industry: string; tier: string; creditLimit: number; balance: number; ordersYTD: number; status: string; contact: string; }

const mockCustomers: B2BCustomer[] = [
    { id: "B2B-001", name: "Tech Solutions Inc", industry: "Technology", tier: "Enterprise", creditLimit: 500000, balance: 125000, ordersYTD: 45, status: "active", contact: "John Smith" },
    { id: "B2B-002", name: "Global Retail Corp", industry: "Retail", tier: "Premium", creditLimit: 250000, balance: 78000, ordersYTD: 32, status: "active", contact: "Sarah Johnson" },
    { id: "B2B-003", name: "Manufacturing Plus", industry: "Manufacturing", tier: "Standard", creditLimit: 100000, balance: 45000, ordersYTD: 18, status: "active", contact: "Mike Wilson" },
    { id: "B2B-004", name: "Hospitality Group", industry: "Hospitality", tier: "Premium", creditLimit: 150000, balance: 32000, ordersYTD: 24, status: "review", contact: "Lisa Brown" },
];

const columns: ColumnDef<B2BCustomer>[] = [
    {
        accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />, cell: ({ row }) => (
            <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{row.getValue<string>("name").split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                <div><div className="font-medium">{row.getValue("name")}</div><div className="text-sm text-muted-foreground">{row.original.industry}</div></div></div>
        )
    },
    {
        accessorKey: "tier", header: ({ column }) => <DataTableColumnHeader column={column} title="Tier" />, cell: ({ row }) => {
            const tier = row.getValue("tier") as string;
            const colors: Record<string, string> = { Enterprise: "bg-purple-100 text-purple-800", Premium: "bg-blue-100 text-blue-800", Standard: "bg-gray-100 text-gray-800" };
            return <Badge className={colors[tier]}>{tier}</Badge>;
        }
    },
    { accessorKey: "creditLimit", header: ({ column }) => <DataTableColumnHeader column={column} title="Credit Limit" />, cell: ({ row }) => `$${(row.getValue("creditLimit") as number).toLocaleString()}` },
    { accessorKey: "balance", header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />, cell: ({ row }) => <span className="text-orange-600">${(row.getValue("balance") as number).toLocaleString()}</span> },
    { accessorKey: "ordersYTD", header: ({ column }) => <DataTableColumnHeader column={column} title="Orders YTD" /> },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>{row.getValue("status")}</Badge> },
    {
        id: "actions", cell: ({ row }) => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem><DropdownMenuItem><FileText className="mr-2 h-4 w-4" />Contracts</DropdownMenuItem><DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Contact</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        )
    },
];

export default function B2BCustomersPage() {
    const [customers] = useState(mockCustomers);
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="B2B Customers" description="Manage business customers" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Customer</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customers.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Credit</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${(customers.reduce((s, c) => s + c.creditLimit, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Outstanding</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-orange-600">${(customers.reduce((s, c) => s + c.balance, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Orders YTD</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customers.reduce((s, c) => s + c.ordersYTD, 0)}</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={customers} searchKey="name" />
        </div>
    );
}
