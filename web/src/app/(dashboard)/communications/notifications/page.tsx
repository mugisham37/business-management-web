"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Bell, Settings, Check, X } from "lucide-react";

const notifications = [
    { id: "1", title: "New order received", message: "Order #12456 from Tech Corp", type: "order", read: false, date: "2 min ago" },
    { id: "2", title: "Low stock alert", message: "iPhone 15 Pro Max below reorder level", type: "alert", read: false, date: "15 min ago" },
    { id: "3", title: "Payment received", message: "$5,000 from Global Retail", type: "payment", read: true, date: "1 hour ago" },
    { id: "4", title: "Shipment delivered", message: "Order #12450 delivered successfully", type: "shipping", read: true, date: "2 hours ago" },
];

export default function NotificationsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Notifications" description="Manage system notifications" actions={<Button variant="outline" size="sm"><Settings className="mr-2 h-4 w-4" />Settings</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Unread</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">12</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">28</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">This Week</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">156</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Alerts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">3</div></CardContent></Card>
            </div>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Recent Notifications</CardTitle><Button variant="ghost" size="sm">Mark all read</Button></CardHeader>
                <CardContent className="space-y-4">
                    {notifications.map(n => (
                        <div key={n.id} className={`flex items-center justify-between border-b pb-4 ${!n.read ? "bg-blue-50 dark:bg-blue-900/10 -mx-4 px-4 rounded" : ""}`}>
                            <div className="flex items-center gap-3">
                                <Bell className={`h-5 w-5 ${!n.read ? "text-blue-600" : "text-muted-foreground"}`} />
                                <div><div className="font-medium">{n.title}</div><div className="text-sm text-muted-foreground">{n.message}</div></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">{n.date}</span>
                                <Badge variant="outline">{n.type}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
