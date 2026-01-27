"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, DataTableColumnHeader } from "@/components/common";
import { MoreHorizontal, DollarSign, FileDown, Calculator, Eye, Send } from "lucide-react";

interface PayrollEntry {
    id: string;
    employeeName: string;
    department: string;
    baseSalary: number;
    overtime: number;
    deductions: number;
    netPay: number;
    status: "pending" | "processed" | "paid";
    payDate: string;
}

const mockPayroll: PayrollEntry[] = [
    { id: "1", employeeName: "John Doe", department: "Sales", baseSalary: 5000, overtime: 450, deductions: 825, netPay: 4625, status: "paid", payDate: "2026-01-25" },
    { id: "2", employeeName: "Jane Smith", department: "Engineering", baseSalary: 6500, overtime: 0, deductions: 975, netPay: 5525, status: "paid", payDate: "2026-01-25" },
    { id: "3", employeeName: "Mike Wilson", department: "Operations", baseSalary: 4200, overtime: 280, deductions: 672, netPay: 3808, status: "processed", payDate: "2026-01-31" },
    { id: "4", employeeName: "Lisa Brown", department: "Support", baseSalary: 3800, overtime: 150, deductions: 593, netPay: 3357, status: "processed", payDate: "2026-01-31" },
    { id: "5", employeeName: "Tom Harris", department: "Marketing", baseSalary: 4500, overtime: 0, deductions: 675, netPay: 3825, status: "pending", payDate: "2026-01-31" },
];

const columns: ColumnDef<PayrollEntry>[] = [
    {
        accessorKey: "employeeName",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Employee" />,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                    <AvatarFallback>{(row.getValue("employeeName") as string).split(" ").map(n => n[0]).join("")}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{row.getValue("employeeName")}</div>
                    <div className="text-sm text-muted-foreground">{row.original.department}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "baseSalary",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Base" />,
        cell: ({ row }) => `$${(row.getValue("baseSalary") as number).toLocaleString()}`,
    },
    {
        accessorKey: "overtime",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Overtime" />,
        cell: ({ row }) => {
            const overtime = row.getValue("overtime") as number;
            return overtime > 0 ? <span className="text-green-600">+${overtime}</span> : <span className="text-muted-foreground">$0</span>;
        },
    },
    {
        accessorKey: "deductions",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Deductions" />,
        cell: ({ row }) => <span className="text-red-600">-${(row.getValue("deductions") as number).toLocaleString()}</span>,
    },
    {
        accessorKey: "netPay",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Net Pay" />,
        cell: ({ row }) => <span className="font-bold">${(row.getValue("netPay") as number).toLocaleString()}</span>,
    },
    {
        accessorKey: "status",
        header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const variants: Record<string, "default" | "secondary" | "outline"> = {
                paid: "default",
                processed: "secondary",
                pending: "outline",
            };
            return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
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
                    <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View Details</DropdownMenuItem>
                    <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Send Payslip</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function PayrollPage() {
    const [payroll] = useState(mockPayroll);
    const totalPayroll = payroll.reduce((sum, p) => sum + p.netPay, 0);
    const pending = payroll.filter(p => p.status === "pending").length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Payroll"
                description="Manage employee compensation"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm"><FileDown className="mr-2 h-4 w-4" />Export</Button>
                        <Button size="sm"><Calculator className="mr-2 h-4 w-4" />Run Payroll</Button>
                    </div>
                }
            />
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Payroll</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div className="text-2xl font-bold">${totalPayroll.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Employees</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{payroll.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Next Pay Date</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">Jan 31</div></CardContent>
                </Card>
            </div>
            <DataTable columns={columns} data={payroll} searchKey="employeeName" />
        </div>
    );
}
