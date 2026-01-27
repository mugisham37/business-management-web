"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import {
    FileText,
    FileSpreadsheet,
    Download,
    Calendar,
    DollarSign,
    TrendingUp,
    PieChart,
    BarChart3,
} from "lucide-react";
import Link from "next/link";

// Report types
const reports = [
    {
        id: "profit-loss",
        name: "Profit & Loss Statement",
        description: "Income and expenses summary for a period",
        icon: TrendingUp,
        category: "Income Statement",
        lastGenerated: "2026-01-25",
        color: "green",
    },
    {
        id: "balance-sheet",
        name: "Balance Sheet",
        description: "Assets, liabilities, and equity snapshot",
        icon: DollarSign,
        category: "Financial Position",
        lastGenerated: "2026-01-25",
        color: "blue",
    },
    {
        id: "cash-flow",
        name: "Cash Flow Statement",
        description: "Cash inflows and outflows analysis",
        icon: BarChart3,
        category: "Cash Management",
        lastGenerated: "2026-01-24",
        color: "purple",
    },
    {
        id: "trial-balance",
        name: "Trial Balance",
        description: "All account balances at a point in time",
        icon: FileSpreadsheet,
        category: "Accounting",
        lastGenerated: "2026-01-25",
        color: "orange",
    },
    {
        id: "expense-report",
        name: "Expense Report",
        description: "Detailed breakdown of all expenses",
        icon: PieChart,
        category: "Expense Analysis",
        lastGenerated: "2026-01-23",
        color: "red",
    },
    {
        id: "revenue-report",
        name: "Revenue Report",
        description: "Sales and revenue by category/period",
        icon: TrendingUp,
        category: "Revenue Analysis",
        lastGenerated: "2026-01-24",
        color: "green",
    },
    {
        id: "ar-aging",
        name: "Accounts Receivable Aging",
        description: "Outstanding customer invoices by age",
        icon: Calendar,
        category: "Receivables",
        lastGenerated: "2026-01-22",
        color: "yellow",
    },
    {
        id: "ap-aging",
        name: "Accounts Payable Aging",
        description: "Outstanding vendor bills by age",
        icon: Calendar,
        category: "Payables",
        lastGenerated: "2026-01-22",
        color: "red",
    },
];

const colorClasses: Record<string, { bg: string; icon: string }> = {
    green: { bg: "bg-green-100 dark:bg-green-900/30", icon: "text-green-600 dark:text-green-400" },
    blue: { bg: "bg-blue-100 dark:bg-blue-900/30", icon: "text-blue-600 dark:text-blue-400" },
    purple: { bg: "bg-purple-100 dark:bg-purple-900/30", icon: "text-purple-600 dark:text-purple-400" },
    orange: { bg: "bg-orange-100 dark:bg-orange-900/30", icon: "text-orange-600 dark:text-orange-400" },
    red: { bg: "bg-red-100 dark:bg-red-900/30", icon: "text-red-600 dark:text-red-400" },
    yellow: { bg: "bg-yellow-100 dark:bg-yellow-900/30", icon: "text-yellow-600 dark:text-yellow-400" },
};

export default function FinancialReportsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Financial Reports"
                description="Generate and download financial statements and reports"
            />

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Reports Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reports.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Last Generated</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Today</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Fiscal Year</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2026</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Current Period</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">January</div>
                    </CardContent>
                </Card>
            </div>

            {/* Reports Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => {
                    const Icon = report.icon;
                    const colors = colorClasses[report.color]!;

                    return (
                        <Card key={report.id} className="group transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className={`rounded-lg p-3 ${colors.bg}`}>
                                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {report.category}
                                    </Badge>
                                </div>
                                <CardTitle className="mt-4">{report.name}</CardTitle>
                                <CardDescription>{report.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">
                                        Last generated: {report.lastGenerated}
                                    </span>
                                    <div className="flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                        <Button variant="outline" size="sm">
                                            <FileText className="mr-1 h-3 w-3" />
                                            View
                                        </Button>
                                        <Button variant="default" size="sm">
                                            <Download className="mr-1 h-3 w-3" />
                                            Export
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Custom Report Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Custom Reports</CardTitle>
                    <CardDescription>
                        Create custom reports with specific date ranges and filters
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline">
                            <Calendar className="mr-2 h-4 w-4" />
                            Select Date Range
                        </Button>
                        <Button variant="outline">
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export to Excel
                        </Button>
                        <Button variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Export to PDF
                        </Button>
                        <Button>
                            Generate Custom Report
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
