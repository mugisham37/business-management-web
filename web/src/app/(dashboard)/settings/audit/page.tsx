"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { Download, FileText, User, Settings, ShoppingCart, DollarSign } from "lucide-react";

interface AuditLog { id: string; action: string; user: string; entity: string; timestamp: string; ip: string; }

const logs: AuditLog[] = [
    { id: "1", action: "User Login", user: "john@company.com", entity: "Authentication", timestamp: "2026-01-27 14:32:15", ip: "192.168.1.100" },
    { id: "2", action: "Order Created", user: "jane@company.com", entity: "Order #12456", timestamp: "2026-01-27 14:28:42", ip: "192.168.1.101" },
    { id: "3", action: "Product Updated", user: "mike@company.com", entity: "SKU: PROD-001", timestamp: "2026-01-27 14:15:30", ip: "192.168.1.102" },
    { id: "4", action: "Settings Changed", user: "admin@company.com", entity: "Security Settings", timestamp: "2026-01-27 13:45:00", ip: "192.168.1.100" },
    { id: "5", action: "Payment Processed", user: "system", entity: "Payment #8765", timestamp: "2026-01-27 13:30:22", ip: "API" },
];

const columns: ColumnDef<AuditLog>[] = [
    { accessorKey: "timestamp", header: ({ column }) => <DataTableColumnHeader column={column} title="Time" />, cell: ({ row }) => <span className="font-mono text-sm">{row.getValue("timestamp")}</span> },
    { accessorKey: "action", header: ({ column }) => <DataTableColumnHeader column={column} title="Action" />, cell: ({ row }) => <Badge variant="outline">{row.getValue("action")}</Badge> },
    { accessorKey: "user", header: ({ column }) => <DataTableColumnHeader column={column} title="User" /> },
    { accessorKey: "entity", header: ({ column }) => <DataTableColumnHeader column={column} title="Entity" /> },
    { accessorKey: "ip", header: ({ column }) => <DataTableColumnHeader column={column} title="IP" />, cell: ({ row }) => <span className="font-mono text-sm text-muted-foreground">{row.getValue("ip")}</span> },
];

export default function AuditLogsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Audit Logs" description="System activity history" actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1,247</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">This Week</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">8,542</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Users Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">24</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">API Calls</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">3,891</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={logs} searchKey="action" />
        </div>
    );
}
