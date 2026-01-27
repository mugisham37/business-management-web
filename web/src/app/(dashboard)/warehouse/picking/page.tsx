"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import {
    MoreHorizontal,
    Play,
    Pause,
    CheckCircle,
    ClipboardList,
    MapPin,
    Clock,
} from "lucide-react";

interface PickOrder {
    id: string;
    orderId: string;
    items: number;
    pickedItems: number;
    zone: string;
    priority: "urgent" | "high" | "normal";
    status: "pending" | "in_progress" | "completed";
    assignee: string;
    estimatedTime: string;
}

const mockOrders: PickOrder[] = [
    { id: "1", orderId: "ORD-5678", items: 12, pickedItems: 9, zone: "A-1", priority: "urgent", status: "in_progress", assignee: "John Doe", estimatedTime: "15 min" },
    { id: "2", orderId: "ORD-5677", items: 8, pickedItems: 0, zone: "B-2", priority: "high", status: "pending", assignee: "Jane Smith", estimatedTime: "20 min" },
    { id: "3", orderId: "ORD-5676", items: 5, pickedItems: 5, zone: "A-3", priority: "normal", status: "completed", assignee: "Mike Wilson", estimatedTime: "10 min" },
    { id: "4", orderId: "ORD-5675", items: 15, pickedItems: 7, zone: "C-1", priority: "normal", status: "in_progress", assignee: "Tom Harris", estimatedTime: "25 min" },
    { id: "5", orderId: "ORD-5674", items: 3, pickedItems: 0, zone: "B-1", priority: "high", status: "pending", assignee: "Lisa Brown", estimatedTime: "8 min" },
];

const columns: ColumnDef<PickOrder>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
            />
        ),
    },
    {
        accessorKey: "orderId",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
        cell: ({ row }) => <span className="font-mono font-medium">{row.getValue("orderId")}</span>,
    },
    {
        accessorKey: "zone",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Zone" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {row.getValue("zone")}
            </div>
        ),
    },
    {
        accessorKey: "items",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Progress" />,
        cell: ({ row }) => {
            const picked = row.original.pickedItems;
            const total = row.original.items;
            const percentage = (picked / total) * 100;
            return (
                <div className="w-32 space-y-1">
                    <div className="flex justify-between text-sm">
                        <span>{picked}/{total} items</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                </div>
            );
        },
    },
    {
        accessorKey: "priority",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Priority" />,
        cell: ({ row }) => {
            const priority = row.getValue("priority") as string;
            const colors: Record<string, string> = {
                urgent: "bg-red-100 text-red-800",
                high: "bg-orange-100 text-orange-800",
                normal: "bg-gray-100 text-gray-800",
            };
            return <Badge className={colors[priority]}>{priority.toUpperCase()}</Badge>;
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variants: Record<string, "default" | "secondary" | "outline"> = {
                completed: "default",
                in_progress: "secondary",
                pending: "outline",
            };
            return <Badge variant={variants[status]}>{status.replace("_", " ")}</Badge>;
        },
    },
    {
        accessorKey: "estimatedTime",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Est. Time" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {row.getValue("estimatedTime")}
            </div>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem><Play className="mr-2 h-4 w-4" />Start Picking</DropdownMenuItem>
                    <DropdownMenuItem><Pause className="mr-2 h-4 w-4" />Pause</DropdownMenuItem>
                    <DropdownMenuItem><CheckCircle className="mr-2 h-4 w-4" />Mark Complete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function PickingPage() {
    const [orders] = useState(mockOrders);
    const pending = orders.filter(o => o.status === "pending").length;
    const inProgress = orders.filter(o => o.status === "in_progress").length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Picking Orders"
                description="Process warehouse pick orders"
                actions={<Button size="sm"><ClipboardList className="mr-2 h-4 w-4" />New Pick List</Button>}
            />
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-blue-600">{inProgress}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Completed Today</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">47</div></CardContent>
                </Card>
            </div>
            <DataTable columns={columns} data={orders} searchKey="orderId" />
        </div>
    );
}
