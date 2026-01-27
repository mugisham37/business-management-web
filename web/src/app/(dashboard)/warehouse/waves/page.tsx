"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, Play, Pause, CheckCircle, Clock, Package } from "lucide-react";

interface Wave {
    id: string;
    name: string;
    ordersCount: number;
    itemsCount: number;
    pickedItems: number;
    status: "pending" | "in_progress" | "completed";
    priority: "urgent" | "high" | "normal";
    assignees: string[];
    startedAt?: string;
}

const mockWaves: Wave[] = [
    { id: "W-001", name: "Morning Wave A", ordersCount: 15, itemsCount: 87, pickedItems: 65, status: "in_progress", priority: "high", assignees: ["John D.", "Jane S."], startedAt: "09:00" },
    { id: "W-002", name: "Morning Wave B", ordersCount: 12, itemsCount: 54, pickedItems: 0, status: "pending", priority: "normal", assignees: ["Mike W."] },
    { id: "W-003", name: "Express Orders", ordersCount: 5, itemsCount: 18, pickedItems: 18, status: "completed", priority: "urgent", assignees: ["Tom H."], startedAt: "08:30" },
    { id: "W-004", name: "Afternoon Wave", ordersCount: 20, itemsCount: 112, pickedItems: 0, status: "pending", priority: "normal", assignees: [] },
];

export default function PickingWavesPage() {
    const [waves] = useState(mockWaves);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = { pending: "bg-gray-100 text-gray-800", in_progress: "bg-blue-100 text-blue-800", completed: "bg-green-100 text-green-800" };
        return colors[status] || colors.pending;
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = { urgent: "bg-red-100 text-red-800", high: "bg-orange-100 text-orange-800", normal: "bg-gray-100 text-gray-800" };
        return colors[priority] || colors.normal;
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Picking Waves"
                description="Manage batch picking operations"
                actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Create Wave</Button>}
            />

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Waves</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{waves.length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{waves.filter(w => w.status === "in_progress").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Orders</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{waves.reduce((s, w) => s + w.ordersCount, 0)}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Items to Pick</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{waves.reduce((s, w) => s + w.itemsCount - w.pickedItems, 0)}</div></CardContent></Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {waves.map((wave) => (
                    <Card key={wave.id} className={wave.status === "completed" ? "opacity-60" : ""}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{wave.name}</CardTitle>
                                    <Badge className={getPriorityColor(wave.priority)}>{wave.priority}</Badge>
                                </div>
                                <Badge className={getStatusColor(wave.status)}>{wave.status.replace("_", " ")}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><div className="text-2xl font-bold">{wave.ordersCount}</div><div className="text-xs text-muted-foreground">Orders</div></div>
                                <div><div className="text-2xl font-bold">{wave.itemsCount}</div><div className="text-xs text-muted-foreground">Items</div></div>
                                <div><div className="text-2xl font-bold">{wave.assignees.length || "—"}</div><div className="text-xs text-muted-foreground">Pickers</div></div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-sm"><span>Progress</span><span>{wave.pickedItems}/{wave.itemsCount}</span></div>
                                <Progress value={(wave.pickedItems / wave.itemsCount) * 100} />
                            </div>
                            <div className="flex gap-2">
                                {wave.status === "pending" && <Button className="flex-1"><Play className="mr-2 h-4 w-4" />Start</Button>}
                                {wave.status === "in_progress" && <><Button variant="outline" className="flex-1"><Pause className="mr-2 h-4 w-4" />Pause</Button><Button className="flex-1"><CheckCircle className="mr-2 h-4 w-4" />Complete</Button></>}
                                {wave.status === "completed" && <Button variant="outline" className="flex-1" disabled><CheckCircle className="mr-2 h-4 w-4" />Completed</Button>}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
