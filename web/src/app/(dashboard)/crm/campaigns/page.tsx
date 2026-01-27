"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { Plus, Mail, MessageSquare, Users, TrendingUp, Eye, Edit, Play, Pause } from "lucide-react";

const campaigns = [
    { id: "1", name: "Spring Sale 2026", type: "Email", status: "active", sent: 12500, opened: 4250, clicked: 890, conversions: 145, revenue: 28500 },
    { id: "2", name: "New Product Launch", type: "Email", status: "scheduled", sent: 0, opened: 0, clicked: 0, conversions: 0, revenue: 0 },
    { id: "3", name: "Customer Win-back", type: "SMS", status: "active", sent: 3200, opened: 2100, clicked: 420, conversions: 67, revenue: 8900 },
    { id: "4", name: "Holiday Promo 2025", type: "Email", status: "completed", sent: 18000, opened: 7200, clicked: 1560, conversions: 312, revenue: 67800 },
];

const performanceData = [
    { campaign: "Spring Sale", opens: 34, clicks: 7.1, conversions: 1.2 },
    { campaign: "Win-back", opens: 65.6, clicks: 13.1, conversions: 2.1 },
    { campaign: "Holiday", opens: 40, clicks: 8.7, conversions: 1.7 },
];

export default function CampaignsPage() {
    const [campaignList] = useState(campaigns);

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = { active: "bg-green-100 text-green-800", scheduled: "bg-blue-100 text-blue-800", draft: "bg-gray-100 text-gray-800", completed: "bg-purple-100 text-purple-800", paused: "bg-yellow-100 text-yellow-800" };
        return colors[status] || colors.draft;
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Campaigns" description="Manage marketing campaigns" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Create Campaign</Button>} />

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Campaigns</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{campaigns.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{campaigns.filter(c => c.status === "active").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Sent</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{campaigns.reduce((s, c) => s + c.sent, 0).toLocaleString()}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">${campaigns.reduce((s, c) => s + c.revenue, 0).toLocaleString()}</div></CardContent></Card>
            </div>

            <ChartWrapper title="Campaign Performance" description="Open, click, and conversion rates (%)">
                <div className="h-[250px]"><BarChartComponent data={performanceData} xKey="campaign" bars={[{ key: "opens", name: "Open Rate", color: "hsl(217, 91%, 60%)" }, { key: "clicks", name: "Click Rate", color: "hsl(142, 76%, 36%)" }, { key: "conversions", name: "Conv. Rate", color: "hsl(45, 93%, 47%)" }]} height={250} /></div>
            </ChartWrapper>

            <div className="space-y-4">
                {campaignList.map((campaign) => (
                    <Card key={campaign.id}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${campaign.type === "Email" ? "bg-blue-100" : "bg-green-100"}`}>
                                        {campaign.type === "Email" ? <Mail className="h-5 w-5 text-blue-600" /> : <MessageSquare className="h-5 w-5 text-green-600" />}
                                    </div>
                                    <div>
                                        <div className="font-semibold">{campaign.name}</div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Badge variant="outline">{campaign.type}</Badge>
                                            <Badge className={getStatusBadge(campaign.status)}>{campaign.status}</Badge>
                                        </div>
                                    </div>
                                </div>
                                {campaign.status !== "scheduled" && campaign.sent > 0 && (
                                    <div className="grid grid-cols-4 gap-8 text-center">
                                        <div><div className="text-lg font-bold">{campaign.sent.toLocaleString()}</div><div className="text-xs text-muted-foreground">Sent</div></div>
                                        <div><div className="text-lg font-bold">{((campaign.opened / campaign.sent) * 100).toFixed(1)}%</div><div className="text-xs text-muted-foreground">Opened</div></div>
                                        <div><div className="text-lg font-bold">{((campaign.clicked / campaign.sent) * 100).toFixed(1)}%</div><div className="text-xs text-muted-foreground">Clicked</div></div>
                                        <div><div className="text-lg font-bold text-green-600">${campaign.revenue.toLocaleString()}</div><div className="text-xs text-muted-foreground">Revenue</div></div>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    {campaign.status === "active" && <Button variant="ghost" size="icon"><Pause className="h-4 w-4" /></Button>}
                                    {campaign.status === "scheduled" && <Button variant="ghost" size="icon"><Play className="h-4 w-4" /></Button>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
