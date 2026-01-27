"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, Truck, Package, Printer, Eye, MapPin } from "lucide-react";

interface Shipment {
    id: string;
    orderId: string;
    customer: string;
    carrier: string;
    trackingNumber: string;
    weight: string;
    status: "pending" | "packed" | "shipped" | "delivered";
    shipDate: string;
}

const mockShipments: Shipment[] = [
    { id: "SHP-001", orderId: "ORD-5678", customer: "John Smith", carrier: "FedEx", trackingNumber: "FX123456789", weight: "2.5 kg", status: "shipped", shipDate: "2026-01-27" },
    { id: "SHP-002", orderId: "ORD-5677", customer: "Jane Doe", carrier: "UPS", trackingNumber: "1Z999AA10123456784", weight: "1.2 kg", status: "packed", shipDate: "2026-01-27" },
    { id: "SHP-003", orderId: "ORD-5676", customer: "Bob Wilson", carrier: "DHL", trackingNumber: "DHL1234567890", weight: "4.8 kg", status: "pending", shipDate: "2026-01-27" },
    { id: "SHP-004", orderId: "ORD-5675", customer: "Alice Brown", carrier: "FedEx", trackingNumber: "FX987654321", weight: "0.8 kg", status: "delivered", shipDate: "2026-01-26" },
];

const columns: ColumnDef<Shipment>[] = [
    { accessorKey: "id", header: ({ column }) => <DataTableColumnHeader column={column} title="Shipment" />, cell: ({ row }) => <span className="font-mono">{row.getValue("id")}</span> },
    { accessorKey: "orderId", header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />, cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.getValue("orderId")}</span> },
    { accessorKey: "customer", header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" /> },
    { accessorKey: "carrier", header: ({ column }) => <DataTableColumnHeader column={column} title="Carrier" />, cell: ({ row }) => <Badge variant="outline">{row.getValue("carrier")}</Badge> },
    { accessorKey: "trackingNumber", header: ({ column }) => <DataTableColumnHeader column={column} title="Tracking" />, cell: ({ row }) => <span className="font-mono text-xs">{row.getValue("trackingNumber")}</span> },
    {
        accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const colors: Record<string, string> = { pending: "bg-gray-100 text-gray-800", packed: "bg-yellow-100 text-yellow-800", shipped: "bg-blue-100 text-blue-800", delivered: "bg-green-100 text-green-800" };
            return <Badge className={colors[status]}>{status}</Badge>;
        }
    },
    {
        id: "actions", cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                    <DropdownMenuItem><Printer className="mr-2 h-4 w-4" />Print Label</DropdownMenuItem>
                    <DropdownMenuItem><MapPin className="mr-2 h-4 w-4" />Track Package</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    },
];

export default function ShippingPage() {
    const [shipments] = useState(mockShipments);
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Shipping" description="Manage outbound shipments" actions={<Button size="sm"><Truck className="mr-2 h-4 w-4" />Create Shipment</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{shipments.filter(s => s.status === "pending").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Packed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{shipments.filter(s => s.status === "packed").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Shipped</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-purple-600">{shipments.filter(s => s.status === "shipped").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{shipments.filter(s => s.status === "delivered").length}</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={shipments} searchKey="customer" />
        </div>
    );
}
