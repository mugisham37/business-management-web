"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/common/metric-card";
import { ChartWrapper } from "@/components/common/charts/chart-wrapper";
import { PieChartComponent } from "@/components/common/charts/pie-chart";
import { BarChartComponent } from "@/components/common/charts/bar-chart";
import {
    Users,
    UserPlus,
    Calendar,
    Clock,
    DollarSign,
    Briefcase,
    TrendingUp,
    Award,
} from "lucide-react";
import Link from "next/link";

// Mock data for department distribution
const departmentData = [
    { name: "Sales", value: 24, color: "hsl(217, 91%, 60%)" },
    { name: "Operations", value: 18, color: "hsl(142, 76%, 36%)" },
    { name: "Engineering", value: 15, color: "hsl(45, 93%, 47%)" },
    { name: "Support", value: 12, color: "hsl(0, 84%, 60%)" },
    { name: "Marketing", value: 8, color: "hsl(280, 87%, 65%)" },
    { name: "HR", value: 5, color: "hsl(180, 65%, 45%)" },
];

// Mock data for attendance
const attendanceData = [
    { day: "Mon", present: 78, absent: 4, leave: 3 },
    { day: "Tue", present: 80, absent: 2, leave: 3 },
    { day: "Wed", present: 75, absent: 5, leave: 5 },
    { day: "Thu", present: 79, absent: 3, leave: 3 },
    { day: "Fri", present: 76, absent: 6, leave: 3 },
];

// Recent employees
const recentEmployees = [
    { id: "1", name: "Alex Johnson", role: "Sales Manager", department: "Sales", startDate: "2026-01-15", status: "onboarding" },
    { id: "2", name: "Maria Garcia", role: "Software Engineer", department: "Engineering", startDate: "2026-01-20", status: "active" },
    { id: "3", name: "David Kim", role: "Customer Support", department: "Support", startDate: "2026-01-22", status: "onboarding" },
];

// Top performers
const topPerformers = [
    { id: "1", name: "Sarah Chen", department: "Sales", metric: "Revenue", value: "$125K", trend: "+15%" },
    { id: "2", name: "Michael Brown", department: "Support", metric: "Tickets Resolved", value: "342", trend: "+22%" },
    { id: "3", name: "Emily Davis", department: "Operations", metric: "Efficiency", value: "98%", trend: "+5%" },
];

export default function EmployeesDashboardPage() {
    const totalEmployees = 85;
    const presentToday = 78;
    const onLeave = 4;
    const monthlyPayroll = 425000;

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Employee Management"
                description="Manage staff, schedules, and payroll"
                actions={
                    <Button size="sm" asChild>
                        <Link href="/employees/new">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Link>
                    </Button>
                }
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Employees"
                    value={totalEmployees}
                    icon={Users}
                    trend={{ value: 3, isPositive: true, label: "new this month" }}
                />
                <MetricCard
                    title="Present Today"
                    value={presentToday}
                    icon={Clock}
                    description={`${Math.round(presentToday / totalEmployees * 100)}% attendance`}
                    className="border-green-200 dark:border-green-800"
                />
                <MetricCard
                    title="On Leave"
                    value={onLeave}
                    icon={Calendar}
                    description="Approved absences"
                />
                <MetricCard
                    title="Monthly Payroll"
                    value={`$${(monthlyPayroll / 1000).toFixed(0)}K`}
                    icon={DollarSign}
                    description="This month"
                />
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Department Distribution */}
                <ChartWrapper
                    title="Employees by Department"
                    description="Staff distribution across teams"
                >
                    <div className="h-[300px]">
                        <PieChartComponent
                            data={departmentData}
                            donut
                            centerLabel={{ value: totalEmployees.toString(), label: "Total" }}
                            height={300}
                        />
                    </div>
                </ChartWrapper>

                {/* Weekly Attendance */}
                <ChartWrapper
                    title="Weekly Attendance"
                    description="This week's attendance breakdown"
                >
                    <div className="h-[300px]">
                        <BarChartComponent
                            data={attendanceData}
                            xKey="day"
                            bars={[
                                { key: "present", name: "Present", color: "hsl(142, 76%, 36%)" },
                                { key: "absent", name: "Absent", color: "hsl(0, 84%, 60%)" },
                                { key: "leave", name: "On Leave", color: "hsl(45, 93%, 47%)" },
                            ]}
                            height={300}
                        />
                    </div>
                </ChartWrapper>
            </div>

            {/* Recent Employees & Top Performers */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Employees */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Hires</CardTitle>
                        <CardDescription>Newest team members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentEmployees.map((employee) => (
                                <div
                                    key={employee.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {employee.name.split(" ").map(n => n[0]).join("")}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">{employee.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {employee.role} • {employee.department}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={employee.status === "onboarding" ? "secondary" : "default"}>
                                        {employee.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Performers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            Top Performers
                        </CardTitle>
                        <CardDescription>This month's stars</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topPerformers.map((performer, index) => (
                                <div
                                    key={performer.id}
                                    className="flex items-center justify-between rounded-lg border p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 font-bold">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium">{performer.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {performer.department} • {performer.metric}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{performer.value}</div>
                                        <div className="text-sm text-green-600">{performer.trend}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Users className="h-8 w-8 text-blue-600" />
                        <div>
                            <h3 className="font-semibold">Directory</h3>
                            <p className="text-sm text-muted-foreground">All employees</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/employees/schedule">
                        <CardContent className="flex items-center gap-4 p-6">
                            <Calendar className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold">Schedule</h3>
                                <p className="text-sm text-muted-foreground">Work schedules</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <Link href="/employees/payroll">
                        <CardContent className="flex items-center gap-4 p-6">
                            <DollarSign className="h-8 w-8 text-yellow-600" />
                            <div>
                                <h3 className="font-semibold">Payroll</h3>
                                <p className="text-sm text-muted-foreground">Compensation</p>
                            </div>
                        </CardContent>
                    </Link>
                </Card>

                <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-center gap-4 p-6">
                        <Briefcase className="h-8 w-8 text-purple-600" />
                        <div>
                            <h3 className="font-semibold">Departments</h3>
                            <p className="text-sm text-muted-foreground">Team structure</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
