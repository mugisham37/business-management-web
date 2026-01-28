/**
 * Schedule Screen
 *
 * Weekly schedule view for employees.
 */
import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeScreen, Header } from "@/components/layout";
import { Card } from "@/components/core";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Mock shift data
const MOCK_SHIFTS = [
    { id: "1", day: 1, startTime: "08:00", endTime: "16:00", role: "Cashier" },
    { id: "2", day: 2, startTime: "08:00", endTime: "16:00", role: "Cashier" },
    { id: "3", day: 3, startTime: "12:00", endTime: "20:00", role: "Cashier" },
    { id: "4", day: 4, startTime: "12:00", endTime: "20:00", role: "Cashier" },
    { id: "5", day: 5, startTime: "08:00", endTime: "16:00", role: "Cashier" },
];

export default function ScheduleScreen() {
    const today = new Date();
    const [selectedWeek, setSelectedWeek] = useState(0); // 0 = current week

    // Get week dates
    const getWeekDates = (weekOffset: number) => {
        const dates: Date[] = [];
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset * 7);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const weekDates = getWeekDates(selectedWeek);

    const getShiftForDay = (dayIndex: number) => {
        return MOCK_SHIFTS.find((shift) => shift.day === dayIndex);
    };

    const formatTimeRange = (start: string, end: string) => {
        const formatTime = (time: string) => {
            const [hours, minutes] = time.split(":");
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${minutes} ${ampm}`;
        };
        return `${formatTime(start)} - ${formatTime(end)}`;
    };

    const getHoursFromShift = (start: string, end: string) => {
        const [startH, startM] = start.split(":").map(Number);
        const [endH, endM] = end.split(":").map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        return (endMinutes - startMinutes) / 60;
    };

    const totalHours = MOCK_SHIFTS.reduce(
        (sum, shift) => sum + getHoursFromShift(shift.startTime, shift.endTime),
        0
    );

    const navigateWeek = (direction: -1 | 1) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedWeek((prev) => prev + direction);
    };

    const isToday = (date: Date) => {
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    return (
        <SafeScreen bgColor="bg-background">
            <Header title="Schedule" showBack />

            {/* Week Navigation */}
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity
                    onPress={() => navigateWeek(-1)}
                    className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                >
                    <Ionicons name="chevron-back" size={20} color="#A3A3A3" />
                </TouchableOpacity>

                <View className="items-center">
                    <Text className="text-text-primary text-base font-semibold">
                        {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} -{" "}
                        {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </Text>
                    <Text className="text-text-tertiary text-xs">
                        {selectedWeek === 0 ? "This Week" : selectedWeek > 0 ? "Next Week" : "Last Week"}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => navigateWeek(1)}
                    className="w-10 h-10 rounded-full bg-surface items-center justify-center"
                >
                    <Ionicons name="chevron-forward" size={20} color="#A3A3A3" />
                </TouchableOpacity>
            </View>

            {/* Hours Summary */}
            <View className="flex-row px-4 mb-4 gap-3">
                <Card className="flex-1 items-center py-3">
                    <Text className="text-text-tertiary text-xs mb-1">Scheduled</Text>
                    <Text className="text-primary text-xl font-bold">{totalHours}h</Text>
                </Card>
                <Card className="flex-1 items-center py-3">
                    <Text className="text-text-tertiary text-xs mb-1">Shifts</Text>
                    <Text className="text-text-primary text-xl font-bold">{MOCK_SHIFTS.length}</Text>
                </Card>
                <Card className="flex-1 items-center py-3">
                    <Text className="text-text-tertiary text-xs mb-1">Days Off</Text>
                    <Text className="text-success text-xl font-bold">{7 - MOCK_SHIFTS.length}</Text>
                </Card>
            </View>

            {/* Week Calendar */}
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {weekDates.map((date, index) => {
                    const shift = getShiftForDay(index);
                    const isDayToday = isToday(date);

                    return (
                        <View
                            key={index}
                            className={`mb-3 ${isDayToday ? "opacity-100" : "opacity-80"}`}
                        >
                            <View className="flex-row items-center mb-2">
                                <View
                                    className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${isDayToday ? "bg-primary" : "bg-surface"
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-medium ${isDayToday ? "text-white" : "text-text-tertiary"
                                            }`}
                                    >
                                        {DAYS[index]}
                                    </Text>
                                    <Text
                                        className={`text-sm font-bold ${isDayToday ? "text-white" : "text-text-primary"
                                            }`}
                                    >
                                        {date.getDate()}
                                    </Text>
                                </View>

                                {shift ? (
                                    <Card className="flex-1" noPadding>
                                        <View className="flex-row items-center p-3">
                                            <View className="w-1 h-full absolute left-0 top-0 bottom-0 bg-primary rounded-l-xl" />
                                            <View className="pl-3 flex-1">
                                                <Text className="text-text-primary text-sm font-medium">
                                                    {formatTimeRange(shift.startTime, shift.endTime)}
                                                </Text>
                                                <Text className="text-text-tertiary text-xs">
                                                    {shift.role} • {getHoursFromShift(shift.startTime, shift.endTime)}h
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color="#737373" />
                                        </View>
                                    </Card>
                                ) : (
                                    <Card className="flex-1 items-center py-3">
                                        <Text className="text-success text-sm font-medium">Day Off</Text>
                                    </Card>
                                )}
                            </View>
                        </View>
                    );
                })}
            </ScrollView>
        </SafeScreen>
    );
}
