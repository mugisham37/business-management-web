"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import {
    Plus,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Phone,
    Mail,
    ArrowRight,
    Target,
    DollarSign,
    Clock,
} from "lucide-react";

// Lead type
interface Lead {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    source: "website" | "referral" | "cold_call" | "event" | "social";
    stage: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
    value: number;
    probability: number;
    assignee: string;
    nextAction: string;
    nextActionDate: string;
    createdAt: string;
}

// Mock data
const mockLeads: Lead[] = [
    { id: "1", name: "Alex Morgan", email: "alex@futuretech.io", phone: "+1 555-0201", company: "Future Tech", source: "website", stage: "qualified", value: 85000, probability: 60, assignee: "John Doe", nextAction: "Send proposal", nextActionDate: "2026-01-28", createdAt: "2026-01-20" },
    { id: "2", name: "Jordan Lee", email: "jordan@innovate.co", phone: "+1 555-0202", company: "Innovate Co", source: "referral", stage: "proposal", value: 120000, probability: 75, assignee: "Jane Smith", nextAction: "Follow up call", nextActionDate: "2026-01-27", createdAt: "2026-01-15" },
    { id: "3", name: "Casey River", email: "casey@startup.io", phone: "+1 555-0203", company: "Startup.io", source: "event", stage: "negotiation", value: 45000, probability: 85, assignee: "John Doe", nextAction: "Final meeting", nextActionDate: "2026-01-29", createdAt: "2026-01-10" },
    { id: "4", name: "Taylor Swift", email: "taylor@bigcorp.com", phone: "+1 555-0204", company: "Big Corp", source: "cold_call", stage: "new", value: 200000, probability: 20, assignee: "Mike Wilson", nextAction: "Initial call", nextActionDate: "2026-01-28", createdAt: "2026-01-25" },
    { id: "5", name: "Morgan Freeman", email: "morgan@enterprise.net", phone: "+1 555-0205", company: "Enterprise Net", source: "social", stage: "contacted", value: 67000, probability: 40, assignee: "Jane Smith", nextAction: "Demo scheduled", nextActionDate: "2026-01-30", createdAt: "2026-01-22" },
];

// Stage colors
const stageColors: Record<string, string> = {
    new: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    contacted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    qualified: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    proposal: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    negotiation: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    won: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    lost: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

// Column definitions
const columns: ColumnDef<Lead>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Lead" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarFallback>
                        {row.original.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.getValue("name")}</div>
                    <div className="text-sm text-muted-foreground">{row.original.company}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "stage",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Stage" />,
        cell: ({ row }) => {
            const stage = row.getValue("stage") as string;
            return (
                <Badge className={stageColors[stage]}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "value",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Value" />,
        cell: ({ row }) => (
            <div className="font-semibold">${(row.getValue("value") as number).toLocaleString()}</div>
        ),
    },
    {
        accessorKey: "probability",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Probability" />,
        cell: ({ row }) => {
            const prob = row.getValue("probability") as number;
            return (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className={`h-full ${prob >= 70 ? "bg-green-500" : prob >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${prob}%` }}
                        />
                    </div>
                    <span className="text-sm">{prob}%</span>
                </div>
            );
        },
    },
    {
        accessorKey: "nextAction",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Next Action" />,
        cell: ({ row }) => (
            <div>
                <div className="font-medium text-sm">{row.getValue("nextAction")}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {row.original.nextActionDate}
                </div>
            </div>
        ),
    },
    {
        accessorKey: "assignee",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Assignee" />,
        cell: ({ row }) => (
            <Badge variant="outline">{row.getValue("assignee")}</Badge>
        ),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Move to Next Stage
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Phone className="mr-2 h-4 w-4" />
                        Log Call
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function LeadsPage() {
    const [leads] = useState<Lead[]>(mockLeads);

    // Calculate stats
    const totalValue = leads.reduce((sum, l) => sum + l.value, 0);
    const weightedValue = leads.reduce((sum, l) => sum + (l.value * l.probability / 100), 0);
    const avgProbability = Math.round(leads.reduce((sum, l) => sum + l.probability, 0) / leads.length);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Leads"
                description="Track and manage sales opportunities"
                actions={
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lead
                    </Button>
                }
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Pipeline</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{leads.length} active leads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Weighted Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${Math.round(weightedValue).toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Expected revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Probability</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgProbability}%</div>
                        <p className="text-xs text-muted-foreground">Close rate estimate</p>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={leads}
                searchKey="name"
            />
        </div>
    );
}
