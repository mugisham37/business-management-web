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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import {
    Plus,
    MoreHorizontal,
    Pencil,
    Trash2,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Wallet,
} from "lucide-react";

// Account type definition
interface Account {
    id: string;
    code: string;
    name: string;
    type: "asset" | "liability" | "equity" | "revenue" | "expense";
    subType: string;
    balance: number;
    status: "active" | "inactive";
}

// Mock data
const mockAccounts: Account[] = [
    { id: "1", code: "1000", name: "Cash", type: "asset", subType: "Current Asset", balance: 156000, status: "active" },
    { id: "2", code: "1100", name: "Accounts Receivable", type: "asset", subType: "Current Asset", balance: 45000, status: "active" },
    { id: "3", code: "1200", name: "Inventory", type: "asset", subType: "Current Asset", balance: 234000, status: "active" },
    { id: "4", code: "1500", name: "Equipment", type: "asset", subType: "Fixed Asset", balance: 89000, status: "active" },
    { id: "5", code: "2000", name: "Accounts Payable", type: "liability", subType: "Current Liability", balance: 32000, status: "active" },
    { id: "6", code: "2100", name: "Accrued Expenses", type: "liability", subType: "Current Liability", balance: 8500, status: "active" },
    { id: "7", code: "3000", name: "Owner's Equity", type: "equity", subType: "Equity", balance: 350000, status: "active" },
    { id: "8", code: "4000", name: "Sales Revenue", type: "revenue", subType: "Operating Revenue", balance: 328000, status: "active" },
    { id: "9", code: "5000", name: "Cost of Goods Sold", type: "expense", subType: "Direct Cost", balance: 45000, status: "active" },
    { id: "10", code: "6000", name: "Rent Expense", type: "expense", subType: "Operating Expense", balance: 12000, status: "active" },
];

// Column definitions
const columns: ColumnDef<Account>[] = [
    {
        accessorKey: "code",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Code" />,
        cell: ({ row }) => (
            <Badge variant="outline" className="font-mono">
                {row.getValue("code")}
            </Badge>
        ),
    },
    {
        accessorKey: "name",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Account Name" />,
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
        accessorKey: "type",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Type" />,
        cell: ({ row }) => {
            const type = row.getValue("type") as string;
            const colors: Record<string, string> = {
                asset: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                liability: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                equity: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
                revenue: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                expense: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            };
            return (
                <Badge className={colors[type]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                </Badge>
            );
        },
    },
    {
        accessorKey: "subType",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Sub-Type" />,
        cell: ({ row }) => (
            <span className="text-muted-foreground">{row.getValue("subType")}</span>
        ),
    },
    {
        accessorKey: "balance",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Balance" />,
        cell: ({ row }) => {
            const balance = row.getValue("balance") as number;
            const type = row.original.type;
            const isDebit = ["asset", "expense"].includes(type);
            return (
                <div className={`font-medium ${balance < 0 ? "text-red-600" : ""}`}>
                    ${balance.toLocaleString()}
                    <span className="ml-1 text-xs text-muted-foreground">
                        {isDebit ? "DR" : "CR"}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === "active" ? "default" : "secondary"}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
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
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Transactions</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deactivate
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function ChartOfAccountsPage() {
    const [accounts] = useState<Account[]>(mockAccounts);

    // Calculate totals by type
    const totalAssets = accounts.filter(a => a.type === "asset").reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === "liability").reduce((sum, a) => sum + a.balance, 0);
    const totalEquity = accounts.filter(a => a.type === "equity").reduce((sum, a) => sum + a.balance, 0);
    const totalRevenue = accounts.filter(a => a.type === "revenue").reduce((sum, a) => sum + a.balance, 0);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Chart of Accounts"
                description="Manage your accounting structure and account balances"
                actions={
                    <Button size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">${totalAssets.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">${totalLiabilities.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Equity</CardTitle>
                        <DollarSign className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">${totalEquity.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={accounts}
                searchKey="name"
            />
        </div>
    );
}
