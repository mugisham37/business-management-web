"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { MessageSquare, Plus } from "lucide-react";

const messages = [
    { id: "1", to: "+1555-0100", message: "Your order #12456 has shipped!", status: "delivered", date: "2026-01-27 14:30" },
    { id: "2", to: "+1555-0101", message: "Your verification code is: 123456", status: "delivered", date: "2026-01-27 12:15" },
    { id: "3", to: "+1555-0102", message: "Appointment reminder: Tomorrow at 2PM", status: "sent", date: "2026-01-27 09:00" },
];

export default function SMSPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="SMS Management" description="Send and track SMS messages" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Send SMS</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sent Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">48</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">47</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Credits</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">1,250</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Failed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">1</div></CardContent></Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Recent Messages</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                <div><div className="font-medium">{msg.to}</div><div className="text-sm text-muted-foreground">{msg.message}</div></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">{msg.date}</span>
                                <Badge className="bg-green-100 text-green-800">{msg.status}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
