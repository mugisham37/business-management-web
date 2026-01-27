"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { AreaChartComponent } from "@/components/common/charts/area-chart";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { PieChartComponent } from "@/components/common/charts/pie-chart";
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    FileDown,
    RefreshCw,
    PlusCircle,
} from "lucide-react";
import Link from "next/link";

// Mock data for cash flow chart
const cashFlowData = [
    { month: "Jan", income: 45000, expenses: 32000 },
    { month: "Feb", income: 52000, expenses: 38000 },
    { month: "Mar", income: 48000, expenses: 35000 },
    { month: "Apr", income: 61000, expenses: 42000 },
    { month: "May", income: 55000, expenses: 39000 },
    { month: "Jun", income: 67000, expenses: 45000 },
];

// Mock data for expense breakdown
const expenseBreakdownData = [
    { name: "Salaries", value: 45000, color: "hsl(217, 91%, 60%)" },
    { name: "Rent", value: 12000, color: "hsl(142, 76%, 36%)" },
    { name: "Utilities", value: 3500, color: "hsl(45, 93%, 47%)" },
    { name: "Marketing", value: 8000, color: "hsl(0, 84%, 60%)" },
    { name: "Supplies", value: 5500, color: "hsl(280, 87%, 65%)" },
    { name: "Other", value: 4000, color: "hsl(180, 65%, 45%)" },
];

// Mock data for revenue by category
const revenueByCategoryData = [
    { category: "Electronics", revenue: 125000, profit: 35000 },
    { category: "Clothing", revenue: 89000, profit: 28000 },
    { category: "Food & Bev", revenue: 67000, profit: 18000 },
    { category: "Home & Garden", revenue: 45000, profit: 12000 },
    { category: "Sports", revenue: 38000, profit: 9500 },
];

// Recent transactions
const recentTransactions = [
    { id: "1", description: "Sale - Order #1234", amount: 1250, type: "income", date: "2026-01-27", account: "Sales" },
    { id: "2", description: "Supplier Payment - Tech Corp", amount: -3500, type: "expense", date: "2026-01-26", account: "Accounts Payable" },
    { id: "3", description: "Sale - Order #1233", amount: 890, type: "income", date: "2026-01-26", account: "Sales" },
    { id: "4", description: "Rent Payment", amount: -4000, type: "expense", date: "2026-01-25", account: "Rent Expense" },
    { id: "5", description: "Sale - Order #1232", amount: 2100, type: "income", date: "2026-01-25", account: "Sales" },
];

export default function FinancialDashboardPage() {
    const totalRevenue = 328000;
    const totalExpenses = 78000;
    const netIncome = totalRevenue - totalExpenses;
    const cashOnHand = 156000;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Financial Dashboard"
                description="Monitor your business finances, revenue, and expenses"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/financial/transactions/new">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Transaction
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={`$${(totalRevenue / 1000).toFixed(0)}K`}
                    icon={TrendingUp}
                    trend={{ value: 12.5, isPositive: true, label: "from last month" }}
                    className="border-green-200 dark:border-green-800"
                />
                <MetricCard
                    title="Total Expenses"
                    value={`$${(totalExpenses / 1000).toFixed(0)}K`}
                    icon={TrendingDown}
                    trend={{ value: 3.2, isPositive: false, label: "from last month" }}
                    className="border-red-200 dark:border-red-800"
                />
                <MetricCard
                    title="Net Income"
                    value={`$${(netIncome / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    trend={{ value: 18.7, isPositive: true, label: "profit margin" }}
                />
                <MetricCard
                    title="Cash on Hand"
                    value={`$${(cashOnHand / 1000).toFixed(0)}K`}
                    icon={Wallet}
                    description="Available balance"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Cash Flow Chart */}
                <ChartWrapper
                    title="Cash Flow"
                    description="Monthly income vs expenses"
                    action={
                        <Tabs defaultValue="6m" className="w-auto">
                            <TabsList className="h-8">
                                <TabsTrigger value="1m" className="text-xs">1M</TabsTrigger>
                                <TabsTrigger value="3m" className="text-xs">3M</TabsTrigger>
                                <TabsTrigger value="6m" className="text-xs">6M</TabsTrigger>
                                <TabsTrigger value="1y" className="text-xs">1Y</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    }
                >
                    <div className="h-[300px]">
                        <AreaChartComponent
                            data={cashFlowData}
                            xKey="month"
                            areas={[
                                { key: "income", name: "Income", color: "hsl(142, 76%, 36%)" },
                                { key: "expenses", name: "Expenses", color: "hsl(0, 84%, 60%)" },
                            ]}
                            height={300}
                        />
                    </div>
                </ChartWrapper>

                {/* Expense Breakdown */}
                <ChartWrapper
                    title="Expense Breakdown"
                    description="Where your money goes"
                >
                    <div className="h-[300px]">
                        <PieChartComponent
                            data={expenseBreakdownData}
                            donut
                            centerLabel={{ value: `$${(78000 / 1000).toFixed(0)}K`, label: "Total" }}
                            height={300}
                        />
                    </div>
                </ChartWrapper>
            </div>

            {/* Revenue by Category */}
            <ChartWrapper
                title="Revenue by Category"
                description="Sales performance across product categories"
            >
                <div className="h-[300px]">
                    <BarChartComponent
                        data={revenueByCategoryData}
                        xKey="category"
                        bars={[
                            { key: "revenue", name: "Revenue", color: "hsl(217, 91%, 60%)" },
                            { key: "profit", name: "Profit", color: "hsl(142, 76%, 36%)" },
                        ]}
                        height={300}
                    />
                </div>
            </ChartWrapper>

            {/* Recent Transactions */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <CardDescription>Latest financial activity</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/financial/transactions">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-full p-2 ${transaction.type === "income"
                                            ? "bg-green-100 dark:bg-green-900/30"
                                            : "bg-red-100 dark:bg-red-900/30"
                                        }`}>
                                        {transaction.type === "income" ? (
                                            <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{transaction.description}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {transaction.account} • {transaction.date}
                                        </div>
                                    </div>
                                </div>
                                <div className={`text-lg font-semibold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"
                                    }`}>
                                    {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/financial/accounts">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Chart of Accounts</h3>
                                <p className="text-sm text-muted-foreground">Manage account structure</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/financial/transactions">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Transactions</h3>
                                <p className="text-sm text-muted-foreground">View all transactions</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/financial/reports">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                                <FileDown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Financial Reports</h3>
                                <p className="text-sm text-muted-foreground">Generate statements</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
