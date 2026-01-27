"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/layout/page-header";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { AreaChartComponent } from "@/components/common/charts/area-chart";
import { ArrowLeft, Mail, Phone, MapPin, Edit, ShoppingCart, DollarSign, Calendar, Star } from "lucide-react";
import Link from "next/link";

const customer = {
    id: "CUST-001", name: "Tech Corp International", email: "contact@techcorp.com", phone: "+1 555-0100",
    address: "123 Business Ave, Suite 400, San Francisco, CA 94102", type: "enterprise", status: "active",
    totalSpent: 245000, ordersCount: 34, avgOrderValue: 7205, lastOrder: "2026-01-25", customerSince: "2023-06-15"
};

const revenueData = [
    { month: "Aug", revenue: 18500 }, { month: "Sep", revenue: 22000 }, { month: "Oct", revenue: 19800 },
    { month: "Nov", revenue: 28500 }, { month: "Dec", revenue: 35200 }, { month: "Jan", revenue: 24000 },
];

const recentOrders = [
    { id: "ORD-12456", date: "2026-01-25", items: 5, total: 8750, status: "delivered" },
    { id: "ORD-12398", date: "2026-01-18", items: 3, total: 4200, status: "delivered" },
    { id: "ORD-12312", date: "2026-01-10", items: 8, total: 12500, status: "delivered" },
];

export default function CustomerDetailPage() {
    const params = useParams();

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title={customer.name}
                description={`Customer since ${customer.customerSince}`}
                actions={<div className="flex gap-2"><Button variant="outline" size="sm" asChild><Link href="/crm/customers"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button><Button size="sm"><Edit className="mr-2 h-4 w-4" />Edit</Button></div>}
            />

            <div className="grid gap-6 lg:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16"><AvatarFallback className="text-lg">{customer.name.split(" ").map(n => n[0]).join("").slice(0, 2)}</AvatarFallback></Avatar>
                            <div><div className="font-semibold text-lg">{customer.name}</div><Badge className="bg-blue-100 text-blue-800">{customer.type}</Badge></div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-muted-foreground" />{customer.email}</div>
                            <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-muted-foreground" />{customer.phone}</div>
                            <div className="flex items-start gap-2 text-sm"><MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />{customer.address}</div>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 grid gap-4 md:grid-cols-4">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Spent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${(customer.totalSpent / 1000).toFixed(0)}K</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customer.ordersCount}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg. Order</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${customer.avgOrderValue.toLocaleString()}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Last Order</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customer.lastOrder}</div></CardContent></Card>
                </div>
            </div>

            <Tabs defaultValue="orders" className="space-y-4">
                <TabsList><TabsTrigger value="orders"><ShoppingCart className="mr-2 h-4 w-4" />Orders</TabsTrigger><TabsTrigger value="analytics"><DollarSign className="mr-2 h-4 w-4" />Analytics</TabsTrigger></TabsList>
                <TabsContent value="orders">
                    <Card><CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader><CardContent><div className="space-y-4">{recentOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between border-b pb-3">
                            <div><div className="font-mono font-medium">{order.id}</div><div className="text-sm text-muted-foreground">{order.date} • {order.items} items</div></div>
                            <div className="text-right"><div className="font-semibold">${order.total.toLocaleString()}</div><Badge variant="default">{order.status}</Badge></div>
                        </div>
                    ))}</div></CardContent></Card>
                </TabsContent>
                <TabsContent value="analytics">
                    <ChartWrapper title="Revenue Over Time" description="Monthly spending"><div className="h-[300px]"><AreaChartComponent data={revenueData} xKey="month" areas={[{ key: "revenue", name: "Revenue", color: "hsl(142, 76%, 36%)" }]} height={300} /></div></ChartWrapper>
                </TabsContent>
            </Tabs>
        </div>
    );
}
