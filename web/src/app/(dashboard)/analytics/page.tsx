"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { AreaChartComponent } from "@/components/common/charts/area-chart";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { PieChartComponent } from "@/components/common/charts/pie-chart";
import { MetricCard } from "@/components/common";
import { TrendingUp, Users, ShoppingCart, DollarSign, Download } from "lucide-react";

const revenueData = [
    { month: "Aug", revenue: 45000 }, { month: "Sep", revenue: 52000 }, { month: "Oct", revenue: 48000 },
    { month: "Nov", revenue: 61000 }, { month: "Dec", revenue: 75000 }, { month: "Jan", revenue: 68000 },
];
const categoryData = [
    { name: "Electronics", value: 45, color: "hsl(217, 91%, 60%)" }, { name: "Clothing", value: 25, color: "hsl(142, 76%, 36%)" }, { name: "Home", value: 20, color: "hsl(45, 93%, 47%)" }, { name: "Other", value: 10, color: "hsl(0, 0%, 70%)" },
];
const channelData = [
    { channel: "Website", sales: 125000 }, { channel: "Mobile", sales: 85000 }, { channel: "POS", sales: 65000 }, { channel: "B2B", sales: 95000 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Analytics Dashboard" description="Business intelligence and insights" actions={<Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" />Export</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard title="Total Revenue" value="$370K" trend={{ value: 12.5, isPositive: true }} icon={DollarSign} />
                <MetricCard title="Orders" value="2,847" trend={{ value: 8.2, isPositive: true }} icon={ShoppingCart} />
                <MetricCard title="Customers" value="1,234" trend={{ value: 5.1, isPositive: true }} icon={Users} />
                <MetricCard title="Conversion" value="3.2%" trend={{ value: 0.8, isPositive: true }} icon={TrendingUp} />
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <ChartWrapper title="Revenue Trend" description="Last 6 months"><div className="h-[300px]"><AreaChartComponent data={revenueData} xKey="month" areas={[{ key: "revenue", name: "Revenue", color: "hsl(142, 76%, 36%)" }]} height={300} /></div></ChartWrapper>
                <ChartWrapper title="Sales by Channel"><div className="h-[300px]"><BarChartComponent data={channelData} xKey="channel" bars={[{ key: "sales", name: "Sales", color: "hsl(217, 91%, 60%)" }]} height={300} /></div></ChartWrapper>
            </div>
            <ChartWrapper title="Category Distribution"><div className="h-[300px]"><PieChartComponent data={categoryData} height={300} /></div></ChartWrapper>
        </div>
    );
}
