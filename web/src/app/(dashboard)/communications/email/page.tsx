"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { Mail, Send, Eye, Trash2, Plus, Inbox, CheckCircle } from "lucide-react";

const emails = [
    { id: "1", subject: "Order Confirmation #12456", to: "john@example.com", status: "sent", date: "2026-01-27 14:30", template: "Order Confirmation" },
    { id: "2", subject: "Your invoice is ready", to: "jane@company.com", status: "sent", date: "2026-01-27 12:15", template: "Invoice" },
    { id: "3", subject: "Welcome to our platform!", to: "mike@startup.io", status: "delivered", date: "2026-01-27 09:00", template: "Welcome" },
    { id: "4", subject: "Password reset request", to: "lisa@corp.com", status: "failed", date: "2026-01-26 16:45", template: "Password Reset" },
];

export default function EmailPage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Email Management" description="Send and track email communications" actions={<Button size="sm"><Plus className="mr-2 h-4 w-4" />Compose</Button>} />
            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sent Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">156</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Delivered</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">152</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">42%</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Failed</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">4</div></CardContent></Card>
            </div>
            <Card>
                <CardHeader><CardTitle>Recent Emails</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    {emails.map(email => (
                        <div key={email.id} className="flex items-center justify-between border-b pb-4">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground" />
                                <div><div className="font-medium">{email.subject}</div><div className="text-sm text-muted-foreground">To: {email.to} • {email.template}</div></div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">{email.date}</span>
                                <Badge className={email.status === "delivered" ? "bg-green-100 text-green-800" : email.status === "failed" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}>{email.status}</Badge>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
