/**
 * Time Clock Screen
 *
 * Clock in/out functionality with biometric verification.
 */
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { Button, Card } from "@/components/core";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";

type ClockStatus = "clocked-out" | "clocked-in" | "on-break";

export default function TimeClockScreen() {
    const router = useRouter();
    const [status, setStatus] = useState<ClockStatus>("clocked-out");
    const [clockTime, setClockTime] = useState<Date | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isVerifying, setIsVerifying] = useState(false);

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
        });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getElapsedTime = () => {
        if (!clockTime || status === "clocked-out") return "0:00:00";
        const elapsed = Math.floor((currentTime.getTime() - clockTime.getTime()) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const verifyBiometric = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Verify your identity",
                fallbackLabel: "Use PIN",
            });
            return result.success;
        } catch (error) {
            console.error("Biometric error:", error);
            return false;
        }
    };

    const handleClockIn = async () => {
        setIsVerifying(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        const verified = await verifyBiometric();
        if (verified) {
            setStatus("clocked-in");
            setClockTime(new Date());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setIsVerifying(false);
    };

    const handleClockOut = async () => {
        setIsVerifying(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        const verified = await verifyBiometric();
        if (verified) {
            setStatus("clocked-out");
            setClockTime(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setIsVerifying(false);
    };

    const handleStartBreak = async () => {
        setIsVerifying(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const verified = await verifyBiometric();
        if (verified) {
            setStatus("on-break");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setIsVerifying(false);
    };

    const handleEndBreak = async () => {
        setIsVerifying(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        const verified = await verifyBiometric();
        if (verified) {
            setStatus("clocked-in");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        setIsVerifying(false);
    };

    const statusConfig = {
        "clocked-out": {
            label: "Off Duty",
            color: "#737373",
            icon: "remove-circle-outline" as const,
        },
        "clocked-in": {
            label: "Working",
            color: "#22C55E",
            icon: "checkmark-circle-outline" as const,
        },
        "on-break": {
            label: "On Break",
            color: "#F59E0B",
            icon: "pause-circle-outline" as const,
        },
    };

    const config = statusConfig[status];

    return (
        <SafeScreen bgColor="bg-background">
            <Header title="Time Clock" showBack />

            <View className="flex-1 px-4">
                {/* Current Time Display */}
                <View className="items-center py-8">
                    <Text className="text-text-tertiary text-sm mb-2">
                        {formatDate(currentTime)}
                    </Text>
                    <Text className="text-text-primary text-5xl font-bold tracking-tight">
                        {formatTime(currentTime)}
                    </Text>
                </View>

                {/* Status Card */}
                <Card className="mb-6">
                    <View className="items-center py-4">
                        <View
                            className="w-16 h-16 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: `${config.color}20` }}
                        >
                            <Ionicons name={config.icon} size={32} color={config.color} />
                        </View>
                        <Text className="text-text-primary text-lg font-semibold mb-1">
                            {config.label}
                        </Text>
                        {status !== "clocked-out" && (
                            <>
                                <Text className="text-text-secondary text-sm">
                                    Clocked in at {clockTime?.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </Text>
                                <Text className="text-primary text-2xl font-bold mt-4">
                                    {getElapsedTime()}
                                </Text>
                                <Text className="text-text-tertiary text-xs">
                                    Time worked today
                                </Text>
                            </>
                        )}
                    </View>
                </Card>

                {/* Action Buttons */}
                <View className="gap-3">
                    {status === "clocked-out" ? (
                        <Button
                            variant="primary"
                            size="lg"
                            fullWidth
                            leftIcon="log-in-outline"
                            loading={isVerifying}
                            onPress={handleClockIn}
                        >
                            Clock In
                        </Button>
                    ) : status === "clocked-in" ? (
                        <>
                            <Button
                                variant="secondary"
                                size="lg"
                                fullWidth
                                leftIcon="cafe-outline"
                                loading={isVerifying}
                                onPress={handleStartBreak}
                            >
                                Start Break
                            </Button>
                            <Button
                                variant="danger"
                                size="lg"
                                fullWidth
                                leftIcon="log-out-outline"
                                loading={isVerifying}
                                onPress={handleClockOut}
                            >
                                Clock Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="primary"
                                size="lg"
                                fullWidth
                                leftIcon="play-outline"
                                loading={isVerifying}
                                onPress={handleEndBreak}
                            >
                                End Break
                            </Button>
                            <Button
                                variant="danger"
                                size="lg"
                                fullWidth
                                leftIcon="log-out-outline"
                                loading={isVerifying}
                                onPress={handleClockOut}
                            >
                                Clock Out
                            </Button>
                        </>
                    )}
                </View>

                {/* Recent Activity */}
                <View className="mt-8">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Today's Activity
                    </Text>
                    <Card>
                        <ActivityItem time="8:30 AM" action="Clocked In" icon="log-in-outline" />
                        <View className="h-px bg-border my-3" />
                        <ActivityItem time="12:00 PM" action="Break Started" icon="cafe-outline" />
                        <View className="h-px bg-border my-3" />
                        <ActivityItem time="12:30 PM" action="Break Ended" icon="play-outline" />
                    </Card>
                </View>
            </View>
        </SafeScreen>
    );
}

function ActivityItem({
    time,
    action,
    icon,
}: {
    time: string;
    action: string;
    icon: keyof typeof Ionicons.glyphMap;
}) {
    return (
        <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-lg bg-surface items-center justify-center mr-3">
                <Ionicons name={icon} size={16} color="#A3A3A3" />
            </View>
            <View className="flex-1">
                <Text className="text-text-primary text-sm">{action}</Text>
                <Text className="text-text-tertiary text-xs">{time}</Text>
            </View>
        </View>
    );
}
