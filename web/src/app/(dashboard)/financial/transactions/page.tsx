"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
    ArrowUpRight,
    ArrowDownRight,
    FileDown,
    Upload,
    Filter,
} from "lucide-react";
import Link from "next/link";

// Transaction type definition
interface Transaction {
    id: string;
    date: string;
    reference: string;
    description: string;
    account: string;
    type: "income" | "expense" | "transfer";
    amount: number;
    status: "posted" | "pending" | "void";
    createdBy: string;
}

// Mock data
const mockTransactions: Transaction[] = [
    { id: "1", date: "2026-01-27", reference: "INV-001234", description: "Sale - Order #1234", account: "Sales Revenue", type: "income", amount: 1250, status: "posted", createdBy: "John Doe" },
    { id: "2", date: "2026-01-26", reference: "PO-005678", description: "Supplier Payment - Tech Corp", account: "Accounts Payable", type: "expense", amount: 3500, status: "posted", createdBy: "Jane Smith" },
    { id: "3", date: "2026-01-26", reference: "INV-001233", description: "Sale - Order #1233", account: "Sales Revenue", type: "income", amount: 890, status: "posted", createdBy: "John Doe" },
    { id: "4", date: "2026-01-25", reference: "EXP-000123", description: "Monthly Rent Payment", account: "Rent Expense", type: "expense", amount: 4000, status: "posted", createdBy: "Jane Smith" },
    { id: "5", date: "2026-01-25", reference: "INV-001232", description: "Sale - Order #1232", account: "Sales Revenue", type: "income", amount: 2100, status: "posted", createdBy: "John Doe" },
    { id: "6", date: "2026-01-24", reference: "TRF-000045", description: "Transfer to Savings", account: "Cash", type: "transfer", amount: 5000, status: "posted", createdBy: "Admin" },
    { id: "7", date: "2026-01-24", reference: "EXP-000122", description: "Office Supplies", account: "Supplies Expense", type: "expense", amount: 450, status: "pending", createdBy: "Jane Smith" },
    { id: "8", date: "2026-01-23", reference: "INV-001231", description: "Sale - Order #1231", account: "Sales Revenue", type: "income", amount: 3200, status: "posted", createdBy: "John Doe" },
];

// Column definitions
const columns: ColumnDef<Transaction>[] = [
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
        accessorKey: "date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("date")}</span>,
    },
    {
        accessorKey: "reference",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Reference" />,
        cell: ({ row }) => (
            <Badge variant="outline" className="font-mono text-xs">
                {row.getValue("reference")}
            </Badge>
        ),
    },
    {
        accessorKey: "description",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Description" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <div className={`rounded-full p-1 ${row.original.type === "income"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : row.original.type === "expense"
                            ? "bg-red-100 dark:bg-red-900/30"
                            : "bg-blue-100 dark:bg-blue-900/30"
                    }`}>
                    {row.original.type === "income" ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                    ) : row.original.type === "expense" ? (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                    ) : (
                        <ArrowUpRight className="h-3 w-3 text-blue-600" />
                    )}
                </div>
                <span className="font-medium">{row.getValue("description")}</span>
            </div>
        ),
    },
    {
        accessorKey: "account",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Account" />,
        cell: ({ row }) => <span className="text-muted-foreground">{row.getValue("account")}</span>,
    },
    {
        accessorKey: "amount",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
        cell: ({ row }) => {
            const amount = row.getValue("amount") as number;
            const type = row.original.type;
            return (
                <div className={`font-semibold ${type === "income" ? "text-green-600" : type === "expense" ? "text-red-600" : "text-blue-600"
                    }`}>
                    {type === "expense" ? "-" : type === "income" ? "+" : ""}${amount.toLocaleString()}
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variants: Record<string, "default" | "secondary" | "destructive"> = {
                posted: "default",
                pending: "secondary",
                void: "destructive",
            };
            return (
                <Badge variant={variants[status]}>
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
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Void
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function TransactionsPage() {
    const [transactions] = useState<Transaction[]>(mockTransactions);

    // Calculate totals
    const totalIncome = transactions.filter(t => t.type === "income" && t.status === "posted").reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === "expense" && t.status === "posted").reduce((sum, t) => sum + t.amount, 0);
    const pendingCount = transactions.filter(t => t.status === "pending").length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Transactions"
                description="View and manage all financial transactions"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            Import
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/financial/transactions/new">
                                <Plus className="mr-2 h-4 w-4" />
                                New Transaction
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">+${totalIncome.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-${totalExpenses.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">transactions awaiting approval</p>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={transactions}
                searchKey="description"
            />
        </div>
    );
}
