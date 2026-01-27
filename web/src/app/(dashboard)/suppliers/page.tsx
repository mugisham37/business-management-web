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
import { MoreHorizontal, Building, Plus, Eye, ShoppingCart, Mail, Star } from "lucide-react";

interface Supplier { id: string; name: string; category: string; rating: number; ordersYTD: number; totalSpend: number; leadTime: string; status: string; contact: string; }

const mockSuppliers: Supplier[] = [
    { id: "SUP-001", name: "Premium Parts Co", category: "Electronics", rating: 4.8, ordersYTD: 45, totalSpend: 125000, leadTime: "3-5 days", status: "preferred", contact: "John Smith" },
    { id: "SUP-002", name: "Global Materials Ltd", category: "Raw Materials", rating: 4.5, ordersYTD: 32, totalSpend: 89000, leadTime: "5-7 days", status: "approved", contact: "Sarah Johnson" },
    { id: "SUP-003", name: "Quick Supply Inc", category: "Packaging", rating: 4.2, ordersYTD: 28, totalSpend: 45000, leadTime: "2-3 days", status: "approved", contact: "Mike Wilson" },
    { id: "SUP-004", name: "Tech Components", category: "Electronics", rating: 3.9, ordersYTD: 15, totalSpend: 32000, leadTime: "7-10 days", status: "probation", contact: "Lisa Brown" },
];

const columns: ColumnDef<Supplier>[] = [
    {
        accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />, cell: ({ row }) => (
            <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{row.getValue<string>("name").split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                <div><div className="font-medium">{row.getValue("name")}</div><div className="text-sm text-muted-foreground">{row.original.category}</div></div></div>
        )
    },
    {
        accessorKey: "rating", header: ({ column }) => <DataTableColumnHeader column={column} title="Rating" />, cell: ({ row }) => (
            <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-medium">{row.getValue("rating")}</span></div>
        )
    },
    { accessorKey: "ordersYTD", header: ({ column }) => <DataTableColumnHeader column={column} title="Orders" /> },
    { accessorKey: "totalSpend", header: ({ column }) => <DataTableColumnHeader column={column} title="Spend YTD" />, cell: ({ row }) => `$${(row.getValue("totalSpend") as number).toLocaleString()}` },
    { accessorKey: "leadTime", header: ({ column }) => <DataTableColumnHeader column={column} title="Lead Time" />, cell: ({ row }) => <Badge variant="outline">{row.getValue("leadTime")}</Badge> },
    {
        accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const colors: Record<string, string> = { preferred: "bg-purple-100 text-purple-800", approved: "bg-green-100 text-green-800", probation: "bg-yellow-100 text-yellow-800", inactive: "bg-gray-100 text-gray-800" };
            return <Badge className={colors[status]}>{status}</Badge>;
        }
    },
    {
        id: "actions", cell: () => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem><DropdownMenuItem><ShoppingCart className="mr-2 h-4 w-4" />Create PO</DropdownMenuItem><DropdownMenuItem><Mail className="mr-2 h-4 w-4" />Contact</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        )
    },
];

export default function SuppliersPage() {
    const [suppliers] = useState(mockSuppliers);
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Suppliers" description="Manage supplier relationships" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Supplier</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Suppliers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{suppliers.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Preferred</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{suppliers.filter(s => s.status === "preferred").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spend YTD</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${(suppliers.reduce((s, sp) => s + sp.totalSpend, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Rating</CardTitle></CardHeader><CardContent><div className="flex items-center gap-1 text-2xl font-bold"><Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />{(suppliers.reduce((s, sp) => s + sp.rating, 0) / suppliers.length).toFixed(1)}</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={suppliers} searchKey="name" />
        </div>
    );
}
