/**
 * Employee Detail Screen
 *
 * Shows employee information, time entries, and performance.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { Card, StatCard, Button, ListCard } from "@/components/core";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Mock employee data
const MOCK_EMPLOYEE = {
    id: "1",
    name: "Alice Williams",
    role: "Manager",
    department: "Sales",
    email: "alice.williams@company.com",
    phone: "+1 555-111-2222",
    status: "clocked-in" as const,
    clockedInAt: "08:30 AM",
    hireDate: "March 15, 2023",
    employeeId: "EMP-001",
    hoursThisWeek: 32.5,
    hoursThisMonth: 142.0,
    averageRating: 4.8,
    timeEntries: [
        { date: "Today", clockIn: "08:30 AM", clockOut: null, hours: 4.5 },
        { date: "Yesterday", clockIn: "08:00 AM", clockOut: "05:00 PM", hours: 8.0 },
        { date: "Jan 26", clockIn: "09:00 AM", clockOut: "06:00 PM", hours: 8.0 },
    ],
};

export default function EmployeeDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const employee = MOCK_EMPLOYEE;

    const handleCall = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(`tel:${employee.phone.replace(/\s+/g, "")}`);
    };

    const handleEmail = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(`mailto:${employee.email}`);
    };

    const statusColors = {
        "clocked-in": "#22C55E",
        "clocked-out": "#737373",
        "on-break": "#F59E0B",
    };

    return (
        <SafeScreen bgColor="bg-background">
            <Header
                title="Employee"
                showBack
                rightAction={{
                    icon: "create-outline",
                    onPress: () => { },
                    label: "Edit employee",
                }}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerClassName="pb-8"
            >
                {/* Profile Header */}
                <View className="items-center pt-4 pb-6 px-4">
                    <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-3">
                        <Text className="text-primary text-2xl font-bold">
                            {employee.name.split(" ").map((n) => n[0]).join("")}
                        </Text>
                    </View>
                    <Text className="text-text-primary text-xl font-bold">{employee.name}</Text>
                    <Text className="text-text-secondary text-sm">
                        {employee.role} • {employee.department}
                    </Text>
                    <View className="flex-row items-center mt-2">
                        <View
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: statusColors[employee.status] }}
                        />
                        <Text className="text-text-tertiary text-sm">
                            {employee.status === "clocked-in"
                                ? `Working since ${employee.clockedInAt}`
                                : employee.status === "on-break"
                                    ? "On break"
                                    : "Off duty"}
                        </Text>
                    </View>
                </View>

                {/* Quick Actions */}
                <View className="flex-row px-4 gap-3 mb-4">
                    <TouchableOpacity
                        onPress={handleCall}
                        className="flex-1 bg-surface rounded-xl py-3 items-center"
                    >
                        <Ionicons name="call-outline" size={20} color="#3B82F6" />
                        <Text className="text-text-primary text-xs mt-1">Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleEmail}
                        className="flex-1 bg-surface rounded-xl py-3 items-center"
                    >
                        <Ionicons name="mail-outline" size={20} color="#3B82F6" />
                        <Text className="text-text-primary text-xs mt-1">Email</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 bg-surface rounded-xl py-3 items-center">
                        <Ionicons name="calendar-outline" size={20} color="#3B82F6" />
                        <Text className="text-text-primary text-xs mt-1">Schedule</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Time & Performance
                    </Text>
                    <View className="flex-row gap-3 mb-3">
                        <View className="flex-1">
                            <StatCard
                                label="This Week"
                                value={`${employee.hoursThisWeek}h`}
                                icon="time-outline"
                                iconColor="#3B82F6"
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                label="This Month"
                                value={`${employee.hoursThisMonth}h`}
                                icon="calendar-outline"
                                iconColor="#8B5CF6"
                            />
                        </View>
                    </View>
                    <StatCard
                        label="Performance Rating"
                        value={`${employee.averageRating}/5`}
                        icon="star-outline"
                        iconColor="#F59E0B"
                    />
                </View>

                {/* Employee Info */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Information
                    </Text>
                    <View className="gap-2">
                        <ListCard icon="id-card-outline" label="Employee ID" value={employee.employeeId} />
                        <ListCard icon="call-outline" label="Phone" value={employee.phone} onPress={handleCall} />
                        <ListCard icon="mail-outline" label="Email" value={employee.email} onPress={handleEmail} />
                        <ListCard icon="calendar-outline" label="Hire Date" value={employee.hireDate} />
                    </View>
                </View>

                {/* Recent Time Entries */}
                <View className="px-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-text-secondary text-sm font-medium">
                            Recent Time Entries
                        </Text>
                        <Button variant="ghost" size="sm" onPress={() => { }}>
                            View All
                        </Button>
                    </View>
                    <Card>
                        {employee.timeEntries.map((entry, index) => (
                            <React.Fragment key={index}>
                                <View className="flex-row items-center py-2">
                                    <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center mr-3">
                                        <Ionicons name="time-outline" size={18} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-text-primary text-sm font-medium">
                                            {entry.date}
                                        </Text>
                                        <Text className="text-text-tertiary text-xs">
                                            {entry.clockIn} - {entry.clockOut || "Present"}
                                        </Text>
                                    </View>
                                    <Text className="text-primary text-sm font-semibold">
                                        {entry.hours.toFixed(1)}h
                                    </Text>
                                </View>
                                {index < employee.timeEntries.length - 1 && (
                                    <View className="h-px bg-border my-2" />
                                )}
                            </React.Fragment>
                        ))}
                    </Card>
                </View>
            </ScrollView>
        </SafeScreen>
    );
}
