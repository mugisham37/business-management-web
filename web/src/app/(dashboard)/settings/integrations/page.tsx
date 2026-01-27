"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, Link2, CheckCircle, Settings } from "lucide-react";

const integrations = [
    { id: "1", name: "Stripe", category: "Payments", status: "connected", lastSync: "2 min ago" },
    { id: "2", name: "QuickBooks", category: "Accounting", status: "connected", lastSync: "1 hour ago" },
    { id: "3", name: "Shopify", category: "E-commerce", status: "connected", lastSync: "30 min ago" },
    { id: "4", name: "Mailchimp", category: "Marketing", status: "disconnected", lastSync: "Never" },
    { id: "5", name: "Slack", category: "Communication", status: "connected", lastSync: "5 min ago" },
];

export default function IntegrationsPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Integrations" description="Connect third-party services" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Integration</Button>} />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {integrations.map(int => (
                    <Card key={int.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Link2 className="h-5 w-5" />
                                    <CardTitle className="text-lg">{int.name}</CardTitle>
                                </div>
                                <Badge variant={int.status === "connected" ? "default" : "secondary"}>{int.status}</Badge>
                            </div>
                            <CardDescription>{int.category}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last sync: {int.lastSync}</span>
                            <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
