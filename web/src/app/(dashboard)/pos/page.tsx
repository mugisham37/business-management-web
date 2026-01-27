"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { LineChartComponent } from "@/components/common/charts/line-chart";
import {
    CreditCard,
    DollarSign,
    Receipt,
    ShoppingCart,
    TrendingUp,
    Monitor,
    Clock,
    Users,
} from "lucide-react";
import Link from "next/link";

// Mock data for hourly sales
const hourlySalesData = [
    { hour: "9AM", sales: 1200, transactions: 8 },
    { hour: "10AM", sales: 2100, transactions: 14 },
    { hour: "11AM", sales: 3200, transactions: 22 },
    { hour: "12PM", sales: 4500, transactions: 31 },
    { hour: "1PM", sales: 3800, transactions: 26 },
    { hour: "2PM", sales: 2900, transactions: 19 },
    { hour: "3PM", sales: 2400, transactions: 16 },
    { hour: "4PM", sales: 3100, transactions: 21 },
    { hour: "5PM", sales: 4200, transactions: 28 },
];

// Mock data for payment methods
const paymentMethodsData = [
    { method: "Card", amount: 12500, count: 85 },
    { method: "Cash", amount: 4200, count: 42 },
    { method: "Mobile", amount: 3800, count: 28 },
    { method: "Gift Card", amount: 1500, count: 12 },
];

// Recent transactions
const recentTransactions = [
    { id: "TXN-001234", time: "5 min ago", amount: 156.50, items: 4, paymentMethod: "Card", status: "completed" },
    { id: "TXN-001233", time: "12 min ago", amount: 89.99, items: 2, paymentMethod: "Cash", status: "completed" },
    { id: "TXN-001232", time: "18 min ago", amount: 234.00, items: 6, paymentMethod: "Card", status: "completed" },
    { id: "TXN-001231", time: "25 min ago", amount: 45.50, items: 1, paymentMethod: "Mobile", status: "completed" },
    { id: "TXN-001230", time: "32 min ago", amount: 178.25, items: 3, paymentMethod: "Card", status: "refunded" },
];

// Terminal status
const terminals = [
    { id: "POS-01", name: "Register 1", status: "active", cashier: "John Doe", currentSession: "8:32" },
    { id: "POS-02", name: "Register 2", status: "active", cashier: "Jane Smith", currentSession: "6:15" },
    { id: "POS-03", name: "Register 3", status: "idle", cashier: null, currentSession: null },
    { id: "POS-04", name: "Self-Checkout 1", status: "active", cashier: "Self-Service", currentSession: "4:45" },
];

export default function POSDashboardPage() {
    const todaySales = 22000;
    const transactionCount = 167;
    const avgTransaction = todaySales / transactionCount;
    const activeTerminals = terminals.filter(t => t.status === "active").length;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Point of Sale"
                description="Monitor real-time sales and manage terminals"
                actions={
                    <Button size="sm" asChild>
                        <Link href="/pos/terminal">
                            <Monitor className="mr-2 h-4 w-4" />
                            Open Terminal
                        </Link>
                    </Button>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Today's Sales"
                    value={`$${todaySales.toLocaleString()}`}
                    icon={DollarSign}
                    trend={{ value: 15.2, isPositive: true, label: "vs yesterday" }}
                    className="border-green-200 dark:border-green-800"
                />
                <MetricCard
                    title="Transactions"
                    value={transactionCount}
                    icon={Receipt}
                    trend={{ value: 8.5, isPositive: true, label: "vs yesterday" }}
                />
                <MetricCard
                    title="Avg. Transaction"
                    value={`$${avgTransaction.toFixed(2)}`}
                    icon={ShoppingCart}
                    description="Per transaction"
                />
                <MetricCard
                    title="Active Terminals"
                    value={`${activeTerminals}/${terminals.length}`}
                    icon={Monitor}
                    description="Currently in use"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Hourly Sales */}
                <ChartWrapper
                    title="Hourly Sales"
                    description="Sales volume throughout the day"
                >
                    <div className="h-[300px]">
                        <LineChartComponent
                            data={hourlySalesData}
                            xKey="hour"
                            lines={[
                                { key: "sales", name: "Sales ($)", color: "hsl(217, 91%, 60%)" },
                            ]}
                            height={300}
                        />
                    </div>
                </ChartWrapper>

                {/* Payment Methods */}
                <ChartWrapper
                    title="Payment Methods"
                    description="Transaction breakdown by payment type"
                >
                    <div className="h-[300px]">
                        <BarChartComponent
                            data={paymentMethodsData}
                            xKey="method"
                            bars={[
                                { key: "amount", name: "Amount ($)", color: "hsl(142, 76%, 36%)" },
                            ]}
                            height={300}
                        />
                    </div>
                </ChartWrapper>
            </div>

            {/* Recent Transactions & Terminal Status */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Transactions */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>Latest POS activity</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/pos/transactions">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentTransactions.map((txn) => (
                                <div
                                    key={txn.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium">{txn.id}</span>
                                            {txn.status === "refunded" && (
                                                <Badge variant="destructive" className="text-xs">Refunded</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {txn.items} items • {txn.paymentMethod} • {txn.time}
                                        </div>
                                    </div>
                                    <div className={`text-lg font-semibold ${txn.status === "refunded" ? "text-red-600" : ""}`}>
                                        {txn.status === "refunded" ? "-" : ""}${txn.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Terminal Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Terminal Status</CardTitle>
                        <CardDescription>Active registers and cashiers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {terminals.map((terminal) => (
                                <div
                                    key={terminal.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-3 w-3 rounded-full ${terminal.status === "active" ? "bg-green-500 animate-pulse" : "bg-gray-300"
                                            }`} />
                                        <div>
                                            <div className="font-medium">{terminal.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {terminal.cashier || "No cashier assigned"}
                                            </div>
                                        </div>
                                    </div>
                                    {terminal.currentSession && (
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            {terminal.currentSession}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/pos/terminal">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Monitor className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold">New Sale</h3>
                                <p className="text-sm text-muted-foreground">Start a transaction</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/pos/transactions">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Receipt className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold">Transactions</h3>
                                <p className="text-sm text-muted-foreground">View history</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/pos/receipts">
                        <CardContent className="flex items-center gap-4 p-6">
                            <CreditCard className="h-8 w-8 text-purple-600" />
                            <div>
                                <h3 className="font-semibold">Receipts</h3>
                                <p className="text-sm text-muted-foreground">Print & email</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Users className="h-8 w-8 text-orange-600" />
                        <div>
                            <h3 className="font-semibold">Cashiers</h3>
                            <p className="text-sm text-muted-foreground">Manage staff</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
