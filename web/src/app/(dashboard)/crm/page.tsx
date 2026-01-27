"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { AreaChartComponent } from "@/components/common/charts/area-chart";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { PieChartComponent } from "@/components/common/charts/pie-chart";
import {
    Users,
    UserPlus,
    Target,
    TrendingUp,
    DollarSign,
    Phone,
    Mail,
    Calendar,
    ArrowRight,
    RefreshCw,
} from "lucide-react";
import Link from "next/link";

// Mock data for pipeline chart
const pipelineData = [
    { stage: "Lead", count: 45, value: 125000 },
    { stage: "Qualified", count: 32, value: 890000 },
    { stage: "Proposal", count: 18, value: 540000 },
    { stage: "Negotiation", count: 12, value: 380000 },
    { stage: "Closed Won", count: 8, value: 256000 },
];

// Mock data for sales trend
const salesTrendData = [
    { month: "Jan", newCustomers: 12, revenue: 45000 },
    { month: "Feb", newCustomers: 18, revenue: 62000 },
    { month: "Mar", newCustomers: 15, revenue: 58000 },
    { month: "Apr", newCustomers: 22, revenue: 78000 },
    { month: "May", newCustomers: 19, revenue: 71000 },
    { month: "Jun", newCustomers: 28, revenue: 98000 },
];

// Mock data for customer segments
const customerSegmentsData = [
    { name: "Enterprise", value: 35, color: "hsl(217, 91%, 60%)" },
    { name: "SMB", value: 45, color: "hsl(142, 76%, 36%)" },
    { name: "Startup", value: 20, color: "hsl(45, 93%, 47%)" },
];

// Recent leads
const recentLeads = [
    { id: "1", name: "Sarah Johnson", company: "Tech Innovations Inc", value: 45000, stage: "Qualified", assignee: "John D.", avatar: null },
    { id: "2", name: "Michael Chen", company: "Digital Solutions LLC", value: 28000, stage: "Proposal", assignee: "Jane S.", avatar: null },
    { id: "3", name: "Emily Davis", company: "Growth Partners", value: 72000, stage: "Negotiation", assignee: "John D.", avatar: null },
    { id: "4", name: "Robert Wilson", company: "Startup Hub", value: 15000, stage: "Lead", assignee: "Mike T.", avatar: null },
];

// Top customers
const topCustomers = [
    { id: "1", name: "Tech Corp International", totalRevenue: 245000, orders: 34, lastOrder: "2026-01-25" },
    { id: "2", name: "Global Trade Solutions", totalRevenue: 189000, orders: 28, lastOrder: "2026-01-24" },
    { id: "3", name: "Innovation Labs", totalRevenue: 156000, orders: 22, lastOrder: "2026-01-26" },
];

export default function CRMDashboardPage() {
    const totalCustomers = 1245;
    const activeLeads = 107;
    const pipelineValue = 2191000;
    const conversionRate = 24.5;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="CRM Dashboard"
                description="Manage customer relationships and track sales pipeline"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Sync
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/crm/customers/new">
                                <UserPlus className="mr-2 h-4 w-4" />
                                Add Customer
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Customers"
                    value={totalCustomers.toLocaleString()}
                    icon={Users}
                    trend={{ value: 8.2, isPositive: true, label: "from last month" }}
                />
                <MetricCard
                    title="Active Leads"
                    value={activeLeads}
                    icon={Target}
                    trend={{ value: 12.5, isPositive: true, label: "new this week" }}
                />
                <MetricCard
                    title="Pipeline Value"
                    value={`$${(pipelineValue / 1000000).toFixed(1)}M`}
                    icon={DollarSign}
                    description="Across all stages"
                />
                <MetricCard
                    title="Conversion Rate"
                    value={`${conversionRate}%`}
                    icon={TrendingUp}
                    trend={{ value: 3.1, isPositive: true, label: "vs last quarter" }}
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Sales Pipeline */}
                <ChartWrapper
                    title="Sales Pipeline"
                    description="Deals by stage"
                >
                    <div className="h-[300px]">
                        <BarChartComponent
                            data={pipelineData}
                            xKey="stage"
                            bars={[
                                { key: "value", name: "Value ($)", color: "hsl(217, 91%, 60%)" },
                            ]}
                            height={300}
                        />
                    </div>
                </ChartWrapper>

                {/* Customer Segments */}
                <ChartWrapper
                    title="Customer Segments"
                    description="Distribution by business size"
                >
                    <div className="h-[300px]">
                        <PieChartComponent
                            data={customerSegmentsData}
                            donut
                            centerLabel={{ value: totalCustomers.toString(), label: "Customers" }}
                            height={300}
                        />
                    </div>
                </ChartWrapper>
            </div>

            {/* Sales Trend */}
            <ChartWrapper
                title="Sales Trend"
                description="New customers and revenue over time"
            >
                <div className="h-[300px]">
                    <AreaChartComponent
                        data={salesTrendData}
                        xKey="month"
                        areas={[
                            { key: "revenue", name: "Revenue ($)", color: "hsl(142, 76%, 36%)" },
                        ]}
                        height={300}
                    />
                </div>
            </ChartWrapper>

            {/* Recent Leads & Top Customers */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Leads */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Leads</CardTitle>
                            <CardDescription>Latest opportunities in pipeline</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/crm/leads">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentLeads.map((lead) => (
                                <div
                                    key={lead.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {lead.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{lead.name}</div>
                                            <div className="text-sm text-muted-foreground">{lead.company}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">${lead.value.toLocaleString()}</div>
                                        <Badge variant="secondary" className="text-xs">{lead.stage}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Customers */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Top Customers</CardTitle>
                            <CardDescription>Highest revenue contributors</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/crm/customers">View All</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topCustomers.map((customer, index) => (
                                <div
                                    key={customer.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {customer.orders} orders • Last: {customer.lastOrder}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-lg font-bold text-green-600">
                                        ${(customer.totalRevenue / 1000).toFixed(0)}K
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/crm/customers">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Users className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold">Customers</h3>
                                <p className="text-sm text-muted-foreground">Manage all customers</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/crm/leads">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Target className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold">Leads</h3>
                                <p className="text-sm text-muted-foreground">Track opportunities</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/crm/pipeline">
                        <CardContent className="flex items-center gap-4 p-6">
                            <TrendingUp className="h-8 w-8 text-purple-600" />
                            <div>
                                <h3 className="font-semibold">Pipeline</h3>
                                <p className="text-sm text-muted-foreground">Visual sales funnel</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Calendar className="h-8 w-8 text-orange-600" />
                        <div>
                            <h3 className="font-semibold">Activities</h3>
                            <p className="text-sm text-muted-foreground">Calls & meetings</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
