"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, Plus, Eye, Truck, FileText, DollarSign } from "lucide-react";

interface B2BOrder { id: string; customer: string; date: string; items: number; total: number; status: string; paymentStatus: string; shipDate: string; }

const mockOrders: B2BOrder[] = [
    { id: "B2B-ORD-001", customer: "Tech Solutions Inc", date: "2026-01-27", items: 45, total: 125000, status: "processing", paymentStatus: "net30", shipDate: "2026-01-30" },
    { id: "B2B-ORD-002", customer: "Global Retail Corp", date: "2026-01-26", items: 120, total: 78500, status: "shipped", paymentStatus: "paid", shipDate: "2026-01-27" },
    { id: "B2B-ORD-003", customer: "Manufacturing Plus", date: "2026-01-25", items: 32, total: 45200, status: "delivered", paymentStatus: "net30", shipDate: "2026-01-26" },
    { id: "B2B-ORD-004", customer: "Hospitality Group", date: "2026-01-24", items: 18, total: 32800, status: "pending", paymentStatus: "pending", shipDate: "2026-01-28" },
];

const columns: ColumnDef<B2BOrder>[] = [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Order ID" />, cell: ({ row }) => <span className="font-mono">{row.getValue("id")}</span> },
    { accessorKey: "customer", header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> },
    { accessorKey: "date", header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" /> },
    { accessorKey: "items", header: ({ column }) => <DataTableColumnHeader column={column} title="Items" /> },
    { accessorKey: "total", header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />, cell: ({ row }) => <span className="font-semibold">${(row.getValue("total") as number).toLocaleString()}</span> },
    {
        accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const colors: Record<string, string> = { pending: "bg-gray-100 text-gray-800", processing: "bg-blue-100 text-blue-800", shipped: "bg-purple-100 text-purple-800", delivered: "bg-green-100 text-green-800" };
            return <Badge className={colors[status]}>{status}</Badge>;
        }
    },
    {
        accessorKey: "paymentStatus", header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />, cell: ({ row }) => {
            const ps = row.getValue("paymentStatus") as string;
            return <Badge variant={ps === "paid" ? "default" : "outline"}>{ps}</Badge>;
        }
    },
    {
        id: "actions", cell: () => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem><DropdownMenuItem><Truck className="mr-2 h-4 w-4" />Track</DropdownMenuItem><DropdownMenuItem><FileText className="mr-2 h-4 w-4" />Invoice</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        )
    },
];

export default function B2BOrdersPage() {
    const [orders] = useState(mockOrders);
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="B2B Orders" description="Manage wholesale orders" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />New Order</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${(orders.reduce((s, o) => s + o.total, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Processing</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === "processing").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Payment</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.paymentStatus !== "paid").length}</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={orders} searchKey="customer" />
        </div>
    );
}
