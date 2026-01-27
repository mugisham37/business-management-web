"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/page-header";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import { Clock, Play, Pause, Calendar, Users } from "lucide-react";

const employees = [
    { id: "1", name: "John Doe", department: "Engineering", today: 7.5, week: 38, status: "clocked_in", clockedAt: "08:30" },
    { id: "2", name: "Jane Smith", department: "Sales", today: 6.25, week: 32, status: "clocked_in", clockedAt: "09:15" },
    { id: "3", name: "Mike Wilson", department: "Operations", today: 0, week: 40, status: "off", clockedAt: null },
    { id: "4", name: "Lisa Brown", department: "Support", today: 8, week: 42, status: "clocked_out", clockedAt: null },
    { id: "5", name: "Tom Harris", department: "Marketing", today: 5.75, week: 28, status: "break", clockedAt: "08:00" },
];

const weeklyData = [
    { day: "Mon", hours: 8.5 }, { day: "Tue", hours: 8 }, { day: "Wed", hours: 9 }, { day: "Thu", hours: 7.5 }, { day: "Fri", hours: 7.5 }, { day: "Sat", hours: 0 }, { day: "Sun", hours: 0 },
];

export default function TimeTrackingPage() {
    const [employeeList] = useState(employees);
    const getStatusBadge = (status: string) => {
        const config: Record<string, string> = { clocked_in: "bg-green-100 text-green-800", clocked_out: "bg-gray-100 text-gray-800", break: "bg-yellow-100 text-yellow-800", off: "bg-gray-100 text-gray-800" };
        return config[status] || config.off;
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader title="Time Tracking" description="Monitor employee hours" actions={<Button size="sm"><Calendar className="mr-2 h-4 w-4" />View Timesheets</Button>} />

            <div className="grid gap-4 md:grid-cols-4">
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Clocked In</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{employees.filter(e => e.status === "clocked_in").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">On Break</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{employees.filter(e => e.status === "break").length}</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hours Today</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{employees.reduce((s, e) => s + e.today, 0).toFixed(1)}h</div></CardContent></Card>
                <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Hours This Week</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{employees.reduce((s, e) => s + e.week, 0)}h</div></CardContent></Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <ChartWrapper title="My Hours This Week" description="Daily breakdown">
                    <div className="h-[200px]"><BarChartComponent data={weeklyData} xKey="day" bars={[{ key: "hours", name: "Hours", color: "hsl(217, 91%, 60%)" }]} height={200} /></div>
                </ChartWrapper>

                <Card>
                    <CardHeader><CardTitle>Quick Clock</CardTitle><CardDescription>Clock in/out for today</CardDescription></CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <div className="text-4xl font-bold">{new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</div>
                        <div className="flex gap-2">
                            <Button className="gap-2"><Play className="h-4 w-4" />Clock In</Button>
                            <Button variant="outline" className="gap-2"><Pause className="h-4 w-4" />Start Break</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Team Status</CardTitle></CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {employeeList.map((emp) => (
                            <div key={emp.id} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar><AvatarFallback>{emp.name.split(" ").map(n => n[0]).join("")}</AvatarFallback></Avatar>
                                    <div><div className="font-medium">{emp.name}</div><div className="text-sm text-muted-foreground">{emp.department}</div></div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right"><div className="font-semibold">{emp.today}h today</div><div className="text-sm text-muted-foreground">{emp.week}h this week</div></div>
                                    <Badge className={getStatusBadge(emp.status)}>{emp.status.replace("_", " ")}</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
