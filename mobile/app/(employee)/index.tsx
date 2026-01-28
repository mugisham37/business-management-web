/**
 * Employee List Screen
 *
 * Displays list of employees with time tracking status.
 */
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { SearchInput, Card, Button } from "@/components/core";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Mock employee data
const MOCK_EMPLOYEES = [
    {
        id: "1",
        name: "Alice Williams",
        role: "Manager",
        department: "Sales",
        status: "clocked-in" as const,
        clockedInAt: "08:30 AM",
        hoursToday: 4.5,
        phone: "+1 555-111-2222",
        avatarColor: "#3B82F6",
    },
    {
        id: "2",
        name: "Bob Johnson",
        role: "Cashier",
        department: "POS",
        status: "clocked-out" as const,
        clockedInAt: null,
        hoursToday: 0,
        phone: "+1 555-333-4444",
        avatarColor: "#8B5CF6",
    },
    {
        id: "3",
        name: "Carol Davis",
        role: "Stock Clerk",
        department: "Inventory",
        status: "clocked-in" as const,
        clockedInAt: "09:00 AM",
        hoursToday: 4.0,
        phone: "+1 555-555-6666",
        avatarColor: "#22C55E",
    },
    {
        id: "4",
        name: "David Brown",
        role: "Cashier",
        department: "POS",
        status: "on-break" as const,
        clockedInAt: "08:00 AM",
        hoursToday: 5.0,
        phone: "+1 555-777-8888",
        avatarColor: "#F59E0B",
    },
];

type EmployeeStatus = "clocked-in" | "clocked-out" | "on-break";
type Employee = typeof MOCK_EMPLOYEES[0];

const statusConfig: Record<EmployeeStatus, { label: string; color: string; bg: string }> = {
    "clocked-in": { label: "Working", color: "#22C55E", bg: "bg-success/20" },
    "clocked-out": { label: "Off Duty", color: "#737373", bg: "bg-text-tertiary/20" },
    "on-break": { label: "Break", color: "#F59E0B", bg: "bg-warning/20" },
};

export default function EmployeesScreen() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | EmployeeStatus>("all");

    const filteredEmployees = MOCK_EMPLOYEES.filter((emp) => {
        const matchesSearch =
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.role.toLowerCase().includes(search.toLowerCase()) ||
            emp.department.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || emp.status === filter;
        return matchesSearch && matchesFilter;
    });

    const clockedInCount = MOCK_EMPLOYEES.filter((e) => e.status !== "clocked-out").length;

    const handleEmployeePress = (employee: Employee) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(employee)/${employee.id}`);
    };

    const handleTimeClock = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/(employee)/time-clock");
    };

    const handleSchedule = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/(employee)/schedule");
    };

    const renderEmployee = ({ item }: { item: Employee }) => {
        const config = statusConfig[item.status];

        return (
            <TouchableOpacity
                onPress={() => handleEmployeePress(item)}
                activeOpacity={0.7}
                className="mb-3"
            >
                <Card noPadding className="p-3">
                    <View className="flex-row items-center">
                        {/* Avatar */}
                        <View
                            className="w-12 h-12 rounded-full items-center justify-center mr-3"
                            style={{ backgroundColor: `${item.avatarColor}20` }}
                        >
                            <Text style={{ color: item.avatarColor }} className="text-lg font-bold">
                                {item.name.split(" ").map((n) => n[0]).join("")}
                            </Text>
                        </View>

                        {/* Employee Info */}
                        <View className="flex-1">
                            <Text className="text-text-primary text-base font-medium">
                                {item.name}
                            </Text>
                            <Text className="text-text-tertiary text-sm">
                                {item.role} • {item.department}
                            </Text>
                            {item.status !== "clocked-out" && (
                                <View className="flex-row items-center mt-1">
                                    <Ionicons name="time-outline" size={12} color="#A3A3A3" />
                                    <Text className="text-text-secondary text-xs ml-1">
                                        {item.hoursToday.toFixed(1)}h today
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Status Badge */}
                        <View className={`px-2.5 py-1 rounded-full ${config.bg}`}>
                            <Text style={{ color: config.color }} className="text-xs font-medium">
                                {config.label}
                            </Text>
                        </View>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <SafeScreen bgColor="bg-background">
            {/* Header */}
            <Header
                title="Employees"
                subtitle={`${clockedInCount} on duty`}
                showBack
                largeTitle
            />

            {/* Quick Actions */}
            <View className="flex-row px-4 mb-3 gap-3">
                <TouchableOpacity
                    onPress={handleTimeClock}
                    className="flex-1 bg-primary rounded-xl py-3 items-center flex-row justify-center"
                >
                    <Ionicons name="finger-print-outline" size={18} color="#FFFFFF" />
                    <Text className="text-white text-sm font-medium ml-2">Time Clock</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSchedule}
                    className="flex-1 bg-surface rounded-xl py-3 items-center flex-row justify-center"
                >
                    <Ionicons name="calendar-outline" size={18} color="#A3A3A3" />
                    <Text className="text-text-secondary text-sm font-medium ml-2">Schedule</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-4 mb-2">
                <SearchInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search employees..."
                />
            </View>

            {/* Filters */}
            <View className="flex-row px-4 mb-3 gap-2">
                <FilterChip label="All" active={filter === "all"} onPress={() => setFilter("all")} />
                <FilterChip label="Working" active={filter === "clocked-in"} onPress={() => setFilter("clocked-in")} />
                <FilterChip label="On Break" active={filter === "on-break"} onPress={() => setFilter("on-break")} />
                <FilterChip label="Off" active={filter === "clocked-out"} onPress={() => setFilter("clocked-out")} />
            </View>

            {/* Employee List */}
            <FlatList
                data={filteredEmployees}
                renderItem={renderEmployee}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </SafeScreen>
    );
}

// Filter Chip Component
interface FilterChipProps {
    label: string;
    active?: boolean;
    onPress: () => void;
}

function FilterChip({ label, active = false, onPress }: FilterChipProps) {
    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            className={`px-3 py-1.5 rounded-full ${active ? "bg-primary" : "bg-surface"}`}
        >
            <Text className={`text-sm font-medium ${active ? "text-white" : "text-text-secondary"}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}
