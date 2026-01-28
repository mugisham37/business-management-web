/**
 * Profile Tab Screen
 *
 * User profile, settings, and logout.
 */
import React from "react";
import { View, Text, ScrollView, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen } from "@/components/layout";
import { ListCard, Button } from "@/components/core";
import { useAuth, useBiometric } from "@/hooks/auth";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();
    const { isAvailable, isEnabled, getBiometricName, enableBiometric, disableBiometric } = useBiometric();

    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () => logout(),
                },
            ]
        );
    };

    const handleBiometricToggle = async () => {
        if (isEnabled) {
            disableBiometric();
        } else {
            await enableBiometric();
        }
    };

    return (
        <SafeScreen hasTabBar bgColor="bg-background">
            <ScrollView
                className="flex-1"
                contentContainerClassName="pb-24"
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View className="items-center py-8 px-4">
                    {/* Avatar */}
                    <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
                        {user?.avatarUrl ? (
                            <Image
                                source={{ uri: user.avatarUrl }}
                                className="w-24 h-24 rounded-full"
                            />
                        ) : (
                            <Text className="text-white text-3xl font-bold">
                                {user?.firstName?.[0] || "U"}
                                {user?.lastName?.[0] || ""}
                            </Text>
                        )}
                    </View>

                    {/* Name */}
                    <Text className="text-text-primary text-xl font-bold">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-text-secondary text-sm">{user?.email}</Text>

                    {/* Role Badge */}
                    <View className="mt-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-primary text-xs font-medium uppercase">
                            {user?.role || "User"}
                        </Text>
                    </View>
                </View>

                {/* Account Section */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Account
                    </Text>
                    <View className="gap-2">
                        <ListCard
                            icon="person-outline"
                            label="Edit Profile"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="key-outline"
                            label="Change Password"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="notifications-outline"
                            label="Notifications"
                            value="Enabled"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Security Section */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Security
                    </Text>
                    <View className="gap-2">
                        {isAvailable && (
                            <ListCard
                                icon="finger-print-outline"
                                label={`${getBiometricName()} Login`}
                                description={isEnabled ? "Enabled" : "Disabled"}
                                onPress={handleBiometricToggle}
                                showArrow={false}
                            />
                        )}
                        <ListCard
                            icon="shield-checkmark-outline"
                            label="Two-Factor Auth"
                            value="Off"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="time-outline"
                            label="Session History"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Preferences Section */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Preferences
                    </Text>
                    <View className="gap-2">
                        <ListCard
                            icon="moon-outline"
                            label="Dark Mode"
                            value="System"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="language-outline"
                            label="Language"
                            value="English"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="location-outline"
                            label="Location"
                            value="Main Store"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Support Section */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Support
                    </Text>
                    <View className="gap-2">
                        <ListCard
                            icon="help-circle-outline"
                            label="Help Center"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="chatbubble-outline"
                            label="Contact Support"
                            onPress={() => { }}
                        />
                        <ListCard
                            icon="document-text-outline"
                            label="Privacy Policy"
                            onPress={() => { }}
                        />
                    </View>
                </View>

                {/* Sign Out */}
                <View className="px-4 mt-4">
                    <Button
                        variant="danger"
                        size="lg"
                        fullWidth
                        leftIcon="log-out-outline"
                        onPress={handleLogout}
                        loading={isLoading}
                    >
                        Sign Out
                    </Button>
                </View>

                {/* App Version */}
                <View className="items-center mt-6">
                    <Text className="text-text-tertiary text-xs">
                        Enterprise BMS v1.0.0
                    </Text>
                </View>
            </ScrollView>
        </SafeScreen>
    );
}
