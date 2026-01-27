"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, Plus, Eye, CheckCircle, Truck, FileText } from "lucide-react";

interface PurchaseOrder { id: string; supplier: string; date: string; items: number; total: number; status: string; expectedDate: string; }

const mockOrders: PurchaseOrder[] = [
    { id: "PO-12345", supplier: "Premium Parts Co", date: "2026-01-27", items: 45, total: 25000, status: "pending", expectedDate: "2026-02-01" },
    { id: "PO-12344", supplier: "Global Materials Ltd", date: "2026-01-26", items: 120, total: 18500, status: "approved", expectedDate: "2026-02-02" },
    { id: "PO-12343", supplier: "Quick Supply Inc", date: "2026-01-25", items: 32, total: 8200, status: "shipped", expectedDate: "2026-01-28" },
    { id: "PO-12342", supplier: "Tech Components", date: "2026-01-24", items: 18, total: 12800, status: "received", expectedDate: "2026-01-27" },
];

const columns: ColumnDef<PurchaseOrder>[] = [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="PO Number" />, cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("id")}</span> },
    { accessorKey: "supplier", header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" /> },
    { accessorKey: "date", header: ({ column }) => <DataTableColumnHeader column={column} title="Order Date" /> },
    { accessorKey: "items", header: ({ column }) => <DataTableColumnHeader column={column} title="Items" /> },
    { accessorKey: "total", header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />, cell: ({ row }) => <span className="font-semibold">${(row.getValue("total") as number).toLocaleString()}</span> },
    { accessorKey: "expectedDate", header: ({ column }) => <DataTableColumnHeader column={column} title="Expected" /> },
    {
        accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const colors: Record<string, string> = { pending: "bg-yellow-100 text-yellow-800", approved: "bg-blue-100 text-blue-800", shipped: "bg-purple-100 text-purple-800", received: "bg-green-100 text-green-800" };
            return <Badge className={colors[status]}>{status}</Badge>;
        }
    },
    {
        id: "actions", cell: () => (
            <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end"><DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem><DropdownMenuItem><Truck className="mr-2 h-4 w-4" />Track</DropdownMenuItem><DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Receive</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        )
    },
];

export default function ProcurementPage() {
    const [orders] = useState(mockOrders);
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Procurement" description="Manage purchase orders" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Create PO</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open POs</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{orders.filter(o => o.status !== "received").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">${(orders.filter(o => o.status !== "received").reduce((s, o) => s + o.total, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Transit</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{orders.filter(o => o.status === "shipped").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Received MTD</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === "received").length}</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={orders} searchKey="supplier" />
        </div>
    );
}
