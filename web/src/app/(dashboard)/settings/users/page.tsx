"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { Plus, MoreHorizontal, UserPlus } from "lucide-react";

interface User { id: string; name: string; email: string; role: string; status: string; lastActive: string; }

const users: User[] = [
    { id: "1", name: "John Doe", email: "john@company.com", role: "Admin", status: "active", lastActive: "2 min ago" },
    { id: "2", name: "Jane Smith", email: "jane@company.com", role: "Manager", status: "active", lastActive: "1 hour ago" },
    { id: "3", name: "Mike Wilson", email: "mike@company.com", role: "Staff", status: "active", lastActive: "3 hours ago" },
    { id: "4", name: "Lisa Brown", email: "lisa@company.com", role: "Staff", status: "inactive", lastActive: "2 days ago" },
];

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="User" />, cell: ({ row }) => (
            <div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback>{row.getValue<string>("name").split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                <div><div className="font-medium">{row.getValue("name")}</div><div className="text-sm text-muted-foreground">{row.original.email}</div></div></div>
        )
    },
    { accessorKey: "role", header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />, cell: ({ row }) => <Badge variant="outline">{row.getValue("role")}</Badge> },
    { accessorKey: "status", header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />, cell: ({ row }) => <Badge variant={row.getValue("status") === "active" ? "default" : "secondary"}>{row.getValue("status")}</Badge> },
    { accessorKey: "lastActive", header: ({ column }) => <DataTableColumnHeader column={column} title="Last Active" /> },
    { id: "actions", cell: () => <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button> },
];

export default function UsersPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="User Management" description="Manage system users" actions={<Button size="sm"><UserPlus className="mr-2 h-4 w-4" />Add User</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{users.filter(u => u.status === "active").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Admins</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{users.filter(u => u.role === "Admin").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Inactive</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-gray-600">{users.filter(u => u.status === "inactive").length}</div></CardContent></Card>
            </div>
            <DataTable columns={columns} data={users} searchKey="name" />
        </div>
    );
}
