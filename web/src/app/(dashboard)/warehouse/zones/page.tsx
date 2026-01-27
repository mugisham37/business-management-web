"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, MapPin, Package, Settings, Edit } from "lucide-react";

const zones = [
    { id: "A", name: "Zone A", type: "Picking", locations: 120, utilization: 85, products: 450, temperature: "ambient" },
    { id: "B", name: "Zone B", type: "Bulk Storage", locations: 80, utilization: 72, products: 180, temperature: "ambient" },
    { id: "C", name: "Zone C", type: "Cold Storage", locations: 40, utilization: 90, products: 95, temperature: "refrigerated" },
    { id: "D", name: "Zone D", type: "Receiving", locations: 20, utilization: 45, products: 32, temperature: "ambient" },
    { id: "E", name: "Zone E", type: "Shipping", locations: 30, utilization: 60, products: 78, temperature: "ambient" },
];

export default function ZonesPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Zone Management" description="Configure warehouse zones and locations" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Add Zone</Button>} />

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Zones</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{zones.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Locations</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{zones.reduce((s, z) => s + z.locations, 0)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Avg. Utilization</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round(zones.reduce((s, z) => s + z.utilization, 0) / zones.length)}%</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Products</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{zones.reduce((s, z) => s + z.products, 0)}</div></CardContent></Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {zones.map((zone) => (
                    <Card key={zone.id}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary">{zone.id}</div>
                                    <div><CardTitle>{zone.name}</CardTitle><CardDescription>{zone.type}</CardDescription></div>
                                </div>
                                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-muted-foreground">Locations:</span> <span className="font-medium">{zone.locations}</span></div>
                                <div><span className="text-muted-foreground">Products:</span> <span className="font-medium">{zone.products}</span></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm"><span>Utilization</span><span>{zone.utilization}%</span></div>
                                <Progress value={zone.utilization} className={zone.utilization > 85 ? "[&>div]:bg-red-500" : ""} />
                            </div>
                            <Badge variant={zone.temperature === "refrigerated" ? "secondary" : "outline"}>{zone.temperature === "refrigerated" ? "❄️ Cold" : "🌡️ Ambient"}</Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
