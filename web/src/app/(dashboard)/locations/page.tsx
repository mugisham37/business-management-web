"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, MapPin, Plus, Eye, Settings, Warehouse } from "lucide-react";

interface Location { id: string; name: string; type: string; address: string; capacity: number; utilization: number; status: string; }

const mockLocations: Location[] = [
    { id: "LOC-001", name: "Main Warehouse", type: "Warehouse", address: "123 Industrial Blvd, SF", capacity: 50000, utilization: 78, status: "active" },
    { id: "LOC-002", name: "Downtown Store", type: "Retail", address: "456 Main St, SF", capacity: 2000, utilization: 85, status: "active" },
    { id: "LOC-003", name: "East Distribution", type: "Distribution", address: "789 Logistics Ave, Oakland", capacity: 25000, utilization: 62, status: "active" },
];

const columns: ColumnDef<Location>[] = [
    { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Location" /> },
    { accessorKey: "type", header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />, cell: ({ row }) => <Badge variant="outline">{row.getValue("type")}</Badge> },
    { accessorKey: "capacity", header: ({ column }) => <DataTableColumnHeader column={column} title="Capacity" />, cell: ({ row }) => `${(row.getValue("capacity") as number).toLocaleString()}` },
    { accessorKey: "utilization", header: ({ column }) => <DataTableColumnHeader column={column} title="Utilization" />, cell: ({ row }) => <Badge>{row.getValue("utilization")}%</Badge> },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => <Badge variant="default">{row.getValue("status")}</Badge> },
    { id: "actions", cell: () => <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button> },
];

export default function LocationsPage() {
    const [locations] = useState(mockLocations);
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Locations" description="Manage warehouses and stores" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Location</Button>} />
            <div className="grid gap-4 md:grid-cols-3">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{locations.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Warehouses</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{locations.filter(l => l.type !== "Retail").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg Util</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(locations.reduce((s, l) => s + l.utilization, 0) / locations.length)}%</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={locations} searchKey="name" />
        </div>
    );
}
