"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { Plus, FileText, Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Edit } from "lucide-react";

const contracts = [
    { id: "CTR-001", customer: "Tech Solutions Inc", type: "Annual Supply", value: 500000, startDate: "2025-06-01", endDate: "2026-05-31", status: "active", progress: 65, renewal: "auto" },
    { id: "CTR-002", customer: "Global Retail Corp", type: "Volume Discount", value: 250000, startDate: "2025-01-01", endDate: "2025-12-31", status: "expiring", progress: 92, renewal: "pending" },
    { id: "CTR-003", customer: "Manufacturing Plus", type: "Framework", value: 150000, startDate: "2025-09-01", endDate: "2027-08-31", status: "active", progress: 33, renewal: "auto" },
    { id: "CTR-004", customer: "Hospitality Group", type: "Annual Supply", value: 180000, startDate: "2026-01-01", endDate: "2026-12-31", status: "new", progress: 8, renewal: "manual" },
];

export default function ContractsPage() {
    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode }> = {
            active: { color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-3 w-3" /> },
            expiring: { color: "bg-yellow-100 text-yellow-800", icon: <AlertCircle className="h-3 w-3" /> },
            new: { color: "bg-blue-100 text-blue-800", icon: <Clock className="h-3 w-3" /> },
            expired: { color: "bg-red-100 text-red-800", icon: <AlertCircle className="h-3 w-3" /> },
        };
        return config[status] || config.active;
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Contracts" description="Manage B2B contracts" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />New Contract</Button>} />

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Active Contracts</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{contracts.filter(c => c.status === "active").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Value</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${(contracts.reduce((s, c) => s + c.value, 0) / 1000).toFixed(0)}K</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Expiring Soon</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{contracts.filter(c => c.status === "expiring").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending Renewal</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-600">{contracts.filter(c => c.renewal === "pending").length}</div></CardContent></Card>
            </div>

            <div className="space-y-4">
                {contracts.map((contract) => {
                    const status = getStatusBadge(contract.status);
                    return (
                        <Card key={contract.id}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <FileText className="h-8 w-8 text-muted-foreground" />
                                        <div>
                                            <div className="font-semibold">{contract.customer}</div>
                                            <div className="text-sm text-muted-foreground">{contract.id} • {contract.type}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={status?.color ?? "bg-gray-100 text-gray-800"}><span className="mr-1">{status?.icon}</span>{contract.status}</Badge>
                                        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
                                    <div><span className="text-muted-foreground">Value:</span> <span className="font-semibold">${contract.value.toLocaleString()}</span></div>
                                    <div><span className="text-muted-foreground">Start:</span> {contract.startDate}</div>
                                    <div><span className="text-muted-foreground">End:</span> {contract.endDate}</div>
                                    <div><span className="text-muted-foreground">Renewal:</span> <Badge variant="outline">{contract.renewal}</Badge></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm"><span>Contract Progress</span><span>{contract.progress}%</span></div>
                                    <Progress value={contract.progress} className={contract.status === "expiring" ? "[&>div]:bg-yellow-500" : ""} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
