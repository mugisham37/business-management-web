"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import {
    Package,
    Truck,
    ClipboardList,
    PackageCheck,
    AlertTriangle,
    Clock,
    ArrowRight,
    RefreshCw,
    MapPin,
} from "lucide-react";
import Link from "next/link";

// Mock data for zone activity
const zoneActivityData = [
    { zone: "Zone A", picks: 145, receives: 32, ships: 67 },
    { zone: "Zone B", picks: 98, receives: 45, ships: 52 },
    { zone: "Zone C", picks: 67, receives: 28, ships: 41 },
    { zone: "Zone D", picks: 112, receives: 18, ships: 78 },
];

// Active orders
const activeOrders = [
    { id: "ORD-5678", type: "pick", items: 12, status: "in_progress", progress: 75, assignee: "John D.", priority: "high" },
    { id: "ORD-5677", type: "pick", items: 8, status: "pending", progress: 0, assignee: "Jane S.", priority: "normal" },
    { id: "RCV-1234", type: "receive", items: 45, status: "in_progress", progress: 40, assignee: "Mike W.", priority: "normal" },
    { id: "ORD-5676", type: "ship", items: 15, status: "ready", progress: 100, assignee: "Tom H.", priority: "urgent" },
    { id: "RCV-1233", type: "receive", items: 120, status: "pending", progress: 0, assignee: "Lisa B.", priority: "normal" },
];

export default function WarehouseDashboardPage() {
    const pendingPicks = 23;
    const activeReceiving = 5;
    const readyToShip = 18;
    const utilizationRate = 78;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Warehouse Operations"
                description="Monitor picking, receiving, and shipping activities"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </Button>
                        <Button size="sm" asChild>
                            <Link href="/warehouse/picking">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Start Picking
                            </Link>
                        </Button>
                    </div>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Pending Picks"
                    value={pendingPicks}
                    icon={ClipboardList}
                    description="Orders awaiting fulfillment"
                    className="border-yellow-200 dark:border-yellow-800"
                />
                <MetricCard
                    title="Active Receiving"
                    value={activeReceiving}
                    icon={Truck}
                    description="Shipments being processed"
                />
                <MetricCard
                    title="Ready to Ship"
                    value={readyToShip}
                    icon={PackageCheck}
                    description="Packed and ready"
                    className="border-green-200 dark:border-green-800"
                />
                <MetricCard
                    title="Space Utilization"
                    value={`${utilizationRate}%`}
                    icon={Package}
                    description="Warehouse capacity"
                />
            </div>

            {/* Zone Activity Chart */}
            <ChartWrapper
                title="Zone Activity"
                description="Operations by warehouse zone today"
            >
                <div className="h-[300px]">
                    <BarChartComponent
                        data={zoneActivityData}
                        xKey="zone"
                        bars={[
                            { key: "picks", name: "Picks", color: "hsl(217, 91%, 60%)" },
                            { key: "receives", name: "Receives", color: "hsl(142, 76%, 36%)" },
                            { key: "ships", name: "Ships", color: "hsl(45, 93%, 47%)" },
                        ]}
                        height={300}
                    />
                </div>
            </ChartWrapper>

            {/* Active Orders */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Active Orders</CardTitle>
                        <CardDescription>Current warehouse operations</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {activeOrders.map((order) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between rounded-lg border p-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`rounded-lg p-2 ${order.type === "pick" ? "bg-blue-100 dark:bg-blue-900/30" :
                                            order.type === "receive" ? "bg-green-100 dark:bg-green-900/30" :
                                                "bg-yellow-100 dark:bg-yellow-900/30"
                                        }`}>
                                        {order.type === "pick" ? <ClipboardList className="h-5 w-5 text-blue-600" /> :
                                            order.type === "receive" ? <Truck className="h-5 w-5 text-green-600" /> :
                                                <PackageCheck className="h-5 w-5 text-yellow-600" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono font-medium">{order.id}</span>
                                            {order.priority === "urgent" && (
                                                <Badge variant="destructive" className="text-xs">Urgent</Badge>
                                            )}
                                            {order.priority === "high" && (
                                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">High</Badge>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {order.items} items • {order.assignee}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-32">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="capitalize">{order.status.replace("_", " ")}</span>
                                            <span>{order.progress}%</span>
                                        </div>
                                        <Progress value={order.progress} className="h-2" />
                                    </div>
                                    <Button variant="ghost" size="sm">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/warehouse/picking">
                        <CardContent className="flex items-center gap-4 p-6">
                            <ClipboardList className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold">Picking</h3>
                                <p className="text-sm text-muted-foreground">Process orders</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/warehouse/receiving">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Truck className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold">Receiving</h3>
                                <p className="text-sm text-muted-foreground">Inbound shipments</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <PackageCheck className="h-8 w-8 text-yellow-600" />
                        <div>
                            <h3 className="font-semibold">Shipping</h3>
                            <p className="text-sm text-muted-foreground">Outbound packages</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <MapPin className="h-8 w-8 text-purple-600" />
                        <div>
                            <h3 className="font-semibold">Locations</h3>
                            <p className="text-sm text-muted-foreground">Manage zones</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
