"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { PieChartComponent } from "@/components/common/charts/pie-chart";
import {
    Package,
    AlertTriangle,
    TrendingDown,
    TrendingUp,
    Boxes,
    RefreshCw,
    Plus,
    FileDown,
} from "lucide-react";
import Link from "next/link";

// Mock data for demonstration - will be replaced with real GraphQL data
const stockDistributionData = [
    { name: "In Stock", value: 1245, color: "hsl(142, 76%, 36%)" },
    { name: "Low Stock", value: 89, color: "hsl(45, 93%, 47%)" },
    { name: "Out of Stock", value: 23, color: "hsl(0, 84%, 60%)" },
    { name: "Overstocked", value: 45, color: "hsl(217, 91%, 60%)" },
];

const categoryStockData = [
    { category: "Electronics", inStock: 456, lowStock: 23, outOfStock: 5 },
    { category: "Clothing", inStock: 312, lowStock: 18, outOfStock: 3 },
    { category: "Food & Bev", inStock: 234, lowStock: 12, outOfStock: 8 },
    { category: "Home & Garden", inStock: 189, lowStock: 9, outOfStock: 2 },
    { category: "Sports", inStock: 167, lowStock: 15, outOfStock: 4 },
];

const lowStockItems = [
    { id: "1", name: "iPhone 15 Pro Max", sku: "APL-IP15PM", currentStock: 5, reorderPoint: 20, location: "Warehouse A" },
    { id: "2", name: "Samsung Galaxy S24", sku: "SAM-GS24", currentStock: 8, reorderPoint: 25, location: "Warehouse A" },
    { id: "3", name: "Sony WH-1000XM5", sku: "SNY-WH1K5", currentStock: 3, reorderPoint: 15, location: "Warehouse B" },
    { id: "4", name: "MacBook Pro 16", sku: "APL-MBP16", currentStock: 2, reorderPoint: 10, location: "Warehouse A" },
    { id: "5", name: "iPad Pro 12.9", sku: "APL-IPD129", currentStock: 7, reorderPoint: 20, location: "Warehouse C" },
];

export default function InventoryOverviewPage() {
    // In real implementation, use:
    // const { summary, lowStockItems, outOfStockItems, loading, error, refresh } = useInventoryManagement();

    const loading = false;
    const totalItems = 1402;
    const totalValue = 2458750;
    const lowStockCount = 89;
    const outOfStockCount = 23;

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-[400px]" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Inventory Overview"
                description="Monitor stock levels, track inventory movements, and manage your products"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <FileDown className="mr-2 h-4 w-4" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/inventory/products/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Products"
                    value={totalItems.toLocaleString()}
                    icon={Package}
                    trend={{ value: 12, isPositive: true, label: "from last month" }}
                />
                <MetricCard
                    title="Inventory Value"
                    value={`$${(totalValue / 1000).toFixed(0)}K`}
                    icon={Boxes}
                    trend={{ value: 8.5, isPositive: true, label: "from last month" }}
                />
                <MetricCard
                    title="Low Stock Items"
                    value={lowStockCount}
                    icon={TrendingDown}
                    description="Items below reorder point"
                    className="border-yellow-200 dark:border-yellow-800"
                />
                <MetricCard
                    title="Out of Stock"
                    value={outOfStockCount}
                    icon={AlertTriangle}
                    description="Requires immediate attention"
                    className="border-red-200 dark:border-red-800"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Stock Distribution Pie Chart */}
                <ChartWrapper
                    title="Stock Distribution"
                    description="Current inventory status breakdown"
                >
                    <div className="h-[300px]">
                        <PieChartComponent
                            data={stockDistributionData}
                            donut
                            centerLabel={{ value: totalItems.toString(), label: "Total Items" }}
                            height={300}
                        />
                    </div>
                </ChartWrapper>

                {/* Category Stock Levels Bar Chart */}
                <ChartWrapper
                    title="Stock by Category"
                    description="Inventory levels across product categories"
                >
                    <div className="h-[300px]">
                        <BarChartComponent
                            data={categoryStockData}
                            xKey="category"
                            bars={[
                                { key: "inStock", name: "In Stock", color: "hsl(142, 76%, 36%)" },
                                { key: "lowStock", name: "Low Stock", color: "hsl(45, 93%, 47%)" },
                                { key: "outOfStock", name: "Out of Stock", color: "hsl(0, 84%, 60%)" },
                            ]}
                            height={300}
                        />
                    </div>
                </ChartWrapper>
            </div>

            {/* Low Stock Alerts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Low Stock Alerts
                        </CardTitle>
                        <CardDescription>Products that need restocking soon</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/inventory/stock">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {lowStockItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {item.sku}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.location}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-right">
                                    <div>
                                        <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-500">
                                            {item.currentStock}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            of {item.reorderPoint} min
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        Reorder
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/inventory/products">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Manage Products</h3>
                                <p className="text-sm text-muted-foreground">View and edit all products</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/inventory/categories">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                                <Boxes className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Categories</h3>
                                <p className="text-sm text-muted-foreground">Organize product hierarchy</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/inventory/stock">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Stock Levels</h3>
                                <p className="text-sm text-muted-foreground">Track and adjust inventory</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>
            </div>
        </div>
    );
}
