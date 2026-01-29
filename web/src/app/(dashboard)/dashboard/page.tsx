"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { AreaChartComponent } from "@/components/common/charts/area-chart";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { PieChartComponent } from "@/components/common/charts/pie-chart";
import { TierGuidance } from "@/components/dashboard/TierGuidance";
import { useAuthGateway } from "@/lib/auth/auth-gateway";
import {
    TrendingUp,
    DollarSign,
    ShoppingCart,
    Users,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    AlertTriangle,
    RefreshCw,
    Calendar,
} from "lucide-react";
import Link from "next/link";

// Mock data for revenue trend
const revenueTrendData = [
    { month: "Jul", revenue: 125000, orders: 245 },
    { month: "Aug", revenue: 142000, orders: 278 },
    { month: "Sep", revenue: 138000, orders: 265 },
    { month: "Oct", revenue: 156000, orders: 312 },
    { month: "Nov", revenue: 189000, orders: 378 },
    { month: "Dec", revenue: 225000, orders: 456 },
    { month: "Jan", revenue: 198000, orders: 398 },
];

// Mock data for category performance
const categoryPerformanceData = [
    { category: "Electronics", sales: 89500, growth: 15 },
    { category: "Clothing", sales: 67200, growth: 8 },
    { category: "Home & Garden", sales: 45800, growth: -3 },
    { category: "Sports", sales: 34100, growth: 22 },
    { category: "Beauty", sales: 28900, growth: 12 },
];

// Mock data for order status
const orderStatusData = [
    { name: "Pending", value: 45, color: "hsl(45, 93%, 47%)" },
    { name: "Processing", value: 78, color: "hsl(217, 91%, 60%)" },
    { name: "Shipped", value: 156, color: "hsl(280, 87%, 65%)" },
    { name: "Delivered", value: 423, color: "hsl(142, 76%, 36%)" },
];

// Recent activities
const recentActivities = [
    { id: "1", type: "order", message: "New order #12456 received", amount: 234.50, time: "2 min ago", icon: ShoppingCart },
    { id: "2", type: "payment", message: "Payment received for #12453", amount: 567.00, time: "15 min ago", icon: DollarSign },
    { id: "3", type: "customer", message: "New customer registration", amount: null, time: "32 min ago", icon: Users },
    { id: "4", type: "alert", message: "Low stock alert: iPhone 15 Pro", amount: null, time: "1 hour ago", icon: AlertTriangle },
    { id: "5", type: "order", message: "Order #12451 shipped", amount: 189.99, time: "2 hours ago", icon: Package },
];

export default function MainDashboardPage() {
    const { getCurrentSession } = useAuthGateway();
    const [userSession, setUserSession] = useState<any>(null);
    const [isNewUser, setIsNewUser] = useState(false);
    
    const totalRevenue = 198000;
    const totalOrders = 398;
    const avgOrderValue = totalRevenue / totalOrders;
    const activeCustomers = 1245;

    useEffect(() => {
        const loadUserSession = async () => {
            try {
                const session = await getCurrentSession();
                setUserSession(session);
                
                // Check if user is new (created within last 24 hours)
                // This would typically come from the user data
                const isNew = session.user?.createdAt && 
                    new Date().getTime() - new Date(session.user.createdAt).getTime() < 24 * 60 * 60 * 1000;
                setIsNewUser(isNew || false);
            } catch (error) {
                console.error('Failed to load user session:', error);
            }
        };

        loadUserSession();
    }, [getCurrentSession]);

    const handleUpgrade = () => {
        // Navigate to pricing/upgrade page
        window.location.href = '/pricing';
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's an overview of your business"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Last 30 Days
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                }
            />

            {/* Tier Guidance for new users or tier-specific recommendations */}
            {userSession?.user && (
                <TierGuidance
                    userTier={userSession.user.tier || 'micro'}
                    isNewUser={isNewUser}
                    onUpgrade={handleUpgrade}
                />
            )}

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={`$${(totalRevenue / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    trend={{ value: 12.5, isPositive: true, label: "from last month" }}
                    className="border-green-200 dark:border-green-800"
                />
                <MetricCard
                    title="Total Orders"
                    value={totalOrders.toLocaleString()}
                    icon={ShoppingCart}
                    trend={{ value: 8.2, isPositive: true, label: "from last month" }}
                />
                <MetricCard
                    title="Avg. Order Value"
                    value={`$${avgOrderValue.toFixed(0)}`}
                    icon={TrendingUp}
                    trend={{ value: 4.1, isPositive: true, label: "from last month" }}
                />
                <MetricCard
                    title="Active Customers"
                    value={activeCustomers.toLocaleString()}
                    icon={Users}
                    trend={{ value: 15.3, isPositive: true, label: "new this month" }}
                />
            </div>

            {/* Main Charts */}
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ChartWrapper
                        title="Revenue Trend"
                        description="Monthly revenue and orders over time"
                    >
                        <div className="h-[350px]">
                            <AreaChartComponent
                                data={revenueTrendData}
                                xKey="month"
                                areas={[
                                    { key: "revenue", name: "Revenue ($)", color: "hsl(142, 76%, 36%)" },
                                ]}
                                height={350}
                            />
                        </div>
                    </ChartWrapper>
                </div>

                <ChartWrapper
                    title="Order Status"
                    description="Current order distribution"
                >
                    <div className="h-[350px]">
                        <PieChartComponent
                            data={orderStatusData}
                            donut
                            centerLabel={{ value: "702", label: "Orders" }}
                            height={350}
                        />
                    </div>
                </ChartWrapper>
            </div>

            {/* Category Performance */}
            <ChartWrapper
                title="Category Performance"
                description="Sales by product category"
            >
                <div className="h-[300px]">
                    <BarChartComponent
                        data={categoryPerformanceData}
                        xKey="category"
                        bars={[
                            { key: "sales", name: "Sales ($)", color: "hsl(217, 91%, 60%)" },
                        ]}
                        height={300}
                    />
                </div>
            </ChartWrapper>

            {/* Recent Activity & Quick Stats */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your store</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={activity.id}
                                        className="flex items-center gap-4"
                                    >
                                        <div className={`rounded-lg p-2 ${activity.type === "alert"
                                                ? "bg-yellow-100 dark:bg-yellow-900/30"
                                                : "bg-muted"
                                            }`}>
                                            <Icon className={`h-4 w-4 ${activity.type === "alert" ? "text-yellow-600" : "text-muted-foreground"
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{activity.message}</p>
                                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                                        </div>
                                        {activity.amount && (
                                            <span className="font-semibold text-green-600">
                                                +${activity.amount.toFixed(2)}
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                        <CardDescription>Key metrics at a glance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-100 dark:bg-green-900/30 p-2">
                                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Conversion Rate</p>
                                        <p className="text-sm text-muted-foreground">Orders / Visitors</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-green-600">3.2%</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900/30 p-2">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Customer Retention</p>
                                        <p className="text-sm text-muted-foreground">Returning customers</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-blue-600">68%</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-purple-100 dark:bg-purple-900/30 p-2">
                                        <Package className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Inventory Health</p>
                                        <p className="text-sm text-muted-foreground">In-stock rate</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-purple-600">94%</span>
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-yellow-100 dark:bg-yellow-900/30 p-2">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Low Stock Items</p>
                                        <p className="text-sm text-muted-foreground">Need attention</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold text-yellow-600">12</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
