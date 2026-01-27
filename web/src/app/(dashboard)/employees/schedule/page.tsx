"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";

// Days of the week
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Mock schedule data
const scheduleData = [
    {
        day: 0, shifts: [
            { employee: "John Doe", start: "09:00", end: "17:00", type: "regular" },
            { employee: "Jane Smith", start: "13:00", end: "21:00", type: "regular" },
        ]
    },
    {
        day: 1, shifts: [
            { employee: "John Doe", start: "09:00", end: "17:00", type: "regular" },
            { employee: "Mike Wilson", start: "06:00", end: "14:00", type: "early" },
            { employee: "Jane Smith", start: "13:00", end: "21:00", type: "regular" },
        ]
    },
    {
        day: 2, shifts: [
            { employee: "Tom Harris", start: "09:00", end: "17:00", type: "regular" },
            { employee: "Lisa Brown", start: "10:00", end: "18:00", type: "regular" },
        ]
    },
    {
        day: 3, shifts: [
            { employee: "John Doe", start: "09:00", end: "17:00", type: "regular" },
            { employee: "Jane Smith", start: "13:00", end: "21:00", type: "regular" },
            { employee: "Mike Wilson", start: "06:00", end: "14:00", type: "early" },
        ]
    },
    {
        day: 4, shifts: [
            { employee: "John Doe", start: "09:00", end: "17:00", type: "regular" },
            { employee: "Tom Harris", start: "14:00", end: "22:00", type: "late" },
        ]
    },
    {
        day: 5, shifts: [
            { employee: "Lisa Brown", start: "10:00", end: "16:00", type: "weekend" },
        ]
    },
    { day: 6, shifts: [] },
];

const shiftColors: Record<string, string> = {
    early: "bg-blue-100 border-blue-300 text-blue-800",
    regular: "bg-green-100 border-green-300 text-green-800",
    late: "bg-purple-100 border-purple-300 text-purple-800",
    weekend: "bg-yellow-100 border-yellow-300 text-yellow-800",
};

export default function SchedulePage() {
    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Work Schedule"
                description="Manage employee shifts and schedules"
                actions={
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                            Jan 27 - Feb 2, 2026
                        </Button>
                        <Button variant="outline" size="sm">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Shift
                        </Button>
                    </div>
                }
            />

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Shifts</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">24</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Employees Scheduled</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">12</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total Hours</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">192h</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Open Shifts</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">3</div></CardContent>
                </Card>
            </div>

            {/* Schedule Grid */}
            <Card>
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 divide-x">
                        {days.map((day, index) => (
                            <div key={day} className="min-h-[300px]">
                                <div className="sticky top-0 bg-muted/50 p-3 text-center border-b">
                                    <div className="font-semibold">{day}</div>
                                    <div className="text-sm text-muted-foreground">{27 + index}</div>
                                </div>
                                <div className="p-2 space-y-2">
                                    {scheduleData.find(s => s.day === index)?.shifts.map((shift, i) => (
                                        <div
                                            key={i}
                                            className={`p-2 rounded border ${shiftColors[shift.type]} text-xs`}
                                        >
                                            <div className="flex items-center gap-1 mb-1">
                                                <Avatar className="h-5 w-5">
                                                    <AvatarFallback className="text-[8px]">
                                                        {shift.employee.split(" ").map(n => n[0]).join("")}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium truncate">{shift.employee.split(" ")[0]}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {shift.start} - {shift.end}
                                            </div>
                                        </div>
                                    ))}
                                    {scheduleData.find(s => s.day === index)?.shifts.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground text-xs">
                                            No shifts
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-blue-200 border border-blue-400" />
                    <span>Early (6AM-2PM)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-200 border border-green-400" />
                    <span>Regular (9AM-5PM)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-purple-200 border border-purple-400" />
                    <span>Late (2PM-10PM)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400" />
                    <span>Weekend</span>
                </div>
            </div>
        </div>
    );
}
