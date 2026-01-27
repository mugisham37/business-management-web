"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, Truck, Package, CheckCircle, Plus } from "lucide-react";

interface Shipment {
    id: string;
    poNumber: string;
    supplier: string;
    items: number;
    expectedDate: string;
    status: "scheduled" | "in_transit" | "arrived" | "receiving" | "completed";
    dock: string;
}

const mockShipments: Shipment[] = [
    { id: "1", poNumber: "PO-12345", supplier: "Tech Supplies Inc", items: 45, expectedDate: "2026-01-27", status: "receiving", dock: "Dock A" },
    { id: "2", poNumber: "PO-12344", supplier: "Global Parts Ltd", items: 120, expectedDate: "2026-01-27", status: "arrived", dock: "Dock B" },
    { id: "3", poNumber: "PO-12343", supplier: "Quick Components", items: 28, expectedDate: "2026-01-28", status: "in_transit", dock: "Dock A" },
    { id: "4", poNumber: "PO-12342", supplier: "Premium Goods Co", items: 75, expectedDate: "2026-01-28", status: "scheduled", dock: "Dock C" },
    { id: "5", poNumber: "PO-12341", supplier: "Tech Supplies Inc", items: 32, expectedDate: "2026-01-26", status: "completed", dock: "Dock B" },
];

const columns: ColumnDef<Shipment>[] = [
    {
        accessorKey: "poNumber",
        header: ({ column }) => <DataTableColumnHeader column={column} title="PO Number" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("poNumber")}</span>,
    },
    {
        accessorKey: "supplier",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Supplier" />,
        cell: ({ row }) => <span className="font-medium">{row.getValue("supplier")}</span>,
    },
    {
        accessorKey: "items",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
        cell: ({ row }) => <Badge variant="outline">{row.getValue("items")}</Badge>,
    },
    {
        accessorKey: "expectedDate",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Expected" />,
    },
    {
        accessorKey: "dock",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Dock" />,
        cell: ({ row }) => <Badge variant="secondary">{row.getValue("dock")}</Badge>,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const colors: Record<string, string> = {
                scheduled: "bg-gray-100 text-gray-800",
                in_transit: "bg-blue-100 text-blue-800",
                arrived: "bg-yellow-100 text-yellow-800",
                receiving: "bg-purple-100 text-purple-800",
                completed: "bg-green-100 text-green-800",
            };
            return <Badge className={colors[status]}>{status.replace("_", " ")}</Badge>;
        },
    },
    {
        id: "actions",
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem><Package className="mr-2 h-4 w-4" />Start Receiving</DropdownMenuItem>
                    <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Mark Complete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function ReceivingPage() {
    const [shipments] = useState(mockShipments);
    const arriving = shipments.filter(s => s.status === "in_transit" || s.status === "scheduled").length;
    const inProgress = shipments.filter(s => s.status === "receiving" || s.status === "arrived").length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Receiving"
                description="Manage inbound shipments"
                actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Log Shipment</Button>}
            />
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Arriving Soon</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-blue-600" />
                        <div className="text-2xl font-bold">{arriving}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">At Dock</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-yellow-600" />
                        <div className="text-2xl font-bold">{inProgress}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed Today</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div className="text-2xl font-bold">12</div>
                    </CardContent>
                </Card>
            </div>
            <DataTable columns={columns} data={shipments} searchKey="poNumber" />
        </div>
    );
}
