"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import { DollarSign, MoreHorizontal, Plus, GripVertical } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Pipeline stages
const stages = [
    { id: "new", name: "New", color: "bg-gray-500" },
    { id: "contacted", name: "Contacted", color: "bg-blue-500" },
    { id: "qualified", name: "Qualified", color: "bg-purple-500" },
    { id: "proposal", name: "Proposal", color: "bg-yellow-500" },
    { id: "negotiation", name: "Negotiation", color: "bg-orange-500" },
    { id: "won", name: "Won", color: "bg-green-500" },
];

// Mock deals
const deals = [
    { id: "1", name: "Tech Corp Deal", company: "Tech Corp", value: 85000, stage: "qualified", contact: "Sarah Johnson" },
    { id: "2", name: "Digital Solutions Contract", company: "Digital Solutions", value: 120000, stage: "proposal", contact: "Michael Chen" },
    { id: "3", name: "Enterprise License", company: "Big Enterprise", value: 250000, stage: "negotiation", contact: "Emily Davis" },
    { id: "4", name: "Startup Package", company: "Startup Inc", value: 15000, stage: "new", contact: "Robert Wilson" },
    { id: "5", name: "SMB Bundle", company: "Local Business", value: 35000, stage: "contacted", contact: "Lisa Brown" },
    { id: "6", name: "Annual Contract", company: "Global Tech", value: 180000, stage: "proposal", contact: "James Wilson" },
    { id: "7", name: "Pilot Program", company: "Innovation Labs", value: 45000, stage: "qualified", contact: "Anna Smith" },
    { id: "8", name: "Custom Solution", company: "Custom Co", value: 95000, stage: "won", contact: "Tom Harris" },
];

function DealCard({ deal }: { deal: typeof deals[0] }) {
    return (
        <Card className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm">{deal.name}</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit Deal</DropdownMenuItem>
                            <DropdownMenuItem>Log Activity</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-xs text-muted-foreground mb-3">{deal.company}</div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                                {deal.contact.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{deal.contact}</span>
                    </div>
                    <Badge variant="secondary" className="font-semibold">
                        ${(deal.value / 1000).toFixed(0)}K
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

function PipelineColumn({ stage, deals: stageDeals }: { stage: typeof stages[0]; deals: typeof deals }) {
    const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="flex-1 min-w-[280px]">
            <Card className="h-full">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                            <CardTitle className="text-sm font-medium">{stage.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                                {stageDeals.length}
                            </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        ${totalValue.toLocaleString()}
                    </div>
                </CardHeader>
                <CardContent className="pt-0 px-3 pb-3">
                    <div className="space-y-0">
                        {stageDeals.map((deal) => (
                            <DealCard key={deal.id} deal={deal} />
                        ))}
                        {stageDeals.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No deals in this stage
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function PipelinePage() {
    return (
        <div className="h-full flex flex-col">
            <div className="p-6 pb-0">
                <PageHeader
                    title="Sales Pipeline"
                    description="Visualize and manage your deals through each stage"
                    actions={
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Deal
                        </Button>
                    }
                />
            </div>

            {/* Pipeline Board */}
            <div className="flex-1 overflow-x-auto p-6">
                <div className="flex gap-4 h-full min-h-[600px]">
                    {stages.map((stage) => (
                        <PipelineColumn
                            key={stage.id}
                            stage={stage}
                            deals={deals.filter((d) => d.stage === stage.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
