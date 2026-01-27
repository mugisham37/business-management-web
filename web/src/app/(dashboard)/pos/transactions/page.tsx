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
    MoreHorizontal,
    Eye,
    Receipt,
    RotateCcw,
    FileDown,
    CreditCard,
    Wallet,
    Smartphone,
    Filter,
    DollarSign,
    TrendingUp,
} from "lucide-react";

// Transaction type
interface Transaction {
    id: string;
    date: string;
    time: string;
    register: string;
    cashier: string;
    items: number;
    subtotal: number;
    tax: number;
    total: number;
    paymentMethod: "card" | "cash" | "mobile" | "gift";
    status: "completed" | "refunded" | "voided";
}

// Mock data
const mockTransactions: Transaction[] = [
    { id: "TXN-001234", date: "2026-01-27", time: "14:32:15", register: "POS-01", cashier: "John Doe", items: 4, subtotal: 145.00, tax: 11.60, total: 156.60, paymentMethod: "card", status: "completed" },
    { id: "TXN-001233", date: "2026-01-27", time: "14:18:42", register: "POS-02", cashier: "Jane Smith", items: 2, subtotal: 83.33, tax: 6.67, total: 89.99, paymentMethod: "cash", status: "completed" },
    { id: "TXN-001232", date: "2026-01-27", time: "14:05:28", register: "POS-01", cashier: "John Doe", items: 6, subtotal: 216.67, tax: 17.33, total: 234.00, paymentMethod: "card", status: "completed" },
    { id: "TXN-001231", date: "2026-01-27", time: "13:48:55", register: "POS-03", cashier: "Mike Wilson", items: 1, subtotal: 42.13, tax: 3.37, total: 45.50, paymentMethod: "mobile", status: "completed" },
    { id: "TXN-001230", date: "2026-01-27", time: "13:32:11", register: "POS-01", cashier: "John Doe", items: 3, subtotal: 165.05, tax: 13.20, total: 178.25, paymentMethod: "card", status: "refunded" },
    { id: "TXN-001229", date: "2026-01-27", time: "13:15:33", register: "POS-02", cashier: "Jane Smith", items: 5, subtotal: 287.96, tax: 23.04, total: 311.00, paymentMethod: "card", status: "completed" },
    { id: "TXN-001228", date: "2026-01-27", time: "12:58:20", register: "POS-04", cashier: "Self-Service", items: 2, subtotal: 55.56, tax: 4.44, total: 60.00, paymentMethod: "card", status: "voided" },
];

// Payment method icons
const paymentIcons = {
    card: CreditCard,
    cash: Wallet,
    mobile: Smartphone,
    gift: Receipt,
};

// Column definitions
const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Transaction ID" />,
        cell: ({ row }) => (
            <span className="font-mono text-sm font-medium">{row.getValue("id")}</span>
        ),
    },
    {
        accessorKey: "date",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Date & Time" />,
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.getValue("date")}</div>
                <div className="text-sm text-muted-foreground">{row.original.time}</div>
            </div>
        ),
    },
    {
        accessorKey: "register",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Register" />,
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.getValue("register")}</div>
                <div className="text-sm text-muted-foreground">{row.original.cashier}</div>
            </div>
        ),
    },
    {
        accessorKey: "items",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Items" />,
        cell: ({ row }) => <Badge variant="outline">{row.getValue("items")}</Badge>,
    },
    {
        accessorKey: "total",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
        cell: ({ row }) => {
            const total = row.getValue("total") as number;
            const status = row.original.status;
            return (
                <span className={`font-semibold ${status === "refunded" || status === "voided" ? "text-red-600 line-through" : ""}`}>
                    ${total.toFixed(2)}
                </span>
            );
        },
    },
    {
        accessorKey: "paymentMethod",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
        cell: ({ row }) => {
            const method = row.getValue("paymentMethod") as keyof typeof paymentIcons;
            const Icon = paymentIcons[method];
            return (
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{method}</span>
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
                completed: "default",
                refunded: "destructive",
                voided: "secondary",
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
                        <Receipt className="mr-2 h-4 w-4" />
                        Print Receipt
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {row.original.status === "completed" && (
                        <DropdownMenuItem className="text-red-600">
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Process Refund
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function POSTransactionsPage() {
    const [transactions] = useState<Transaction[]>(mockTransactions);

    // Calculate stats
    const completedTxns = transactions.filter(t => t.status === "completed");
    const totalSales = completedTxns.reduce((sum, t) => sum + t.total, 0);
    const avgTransaction = totalSales / completedTxns.length;
    const refundedTotal = transactions.filter(t => t.status === "refunded").reduce((sum, t) => sum + t.total, 0);

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="POS Transactions"
                description="View and manage all point of sale transactions"
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
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">${totalSales.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">{completedTxns.length} transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Transaction</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${avgTransaction.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Refunds</CardTitle>
                        <RotateCcw className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">-${refundedTotal.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Net Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(totalSales - refundedTotal).toFixed(2)}</div>
                    </CardContent>
                </Card>
            </div>

            <DataTable
                columns={columns}
                data={transactions}
                searchKey="id"
            />
        </div>
    );
}
