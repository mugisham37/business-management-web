/**
 * Customer Detail Screen
 *
 * Shows customer information, order history, and actions.
 */
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { Card, StatCard, Button, ListCard } from "@/components/core";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Mock customer data (in real app, fetch by ID)
const MOCK_CUSTOMER = {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "+1 555-123-4567",
    address: "123 Main St, New York, NY 10001",
    totalOrders: 24,
    totalSpent: 2450.0,
    avgOrderValue: 102.08,
    lastVisit: "2 days ago",
    status: "active" as const,
    joinDate: "Jan 15, 2024",
    notes: "Prefers email communication. Regular buyer of electronics.",
    recentOrders: [
        { id: "ORD-1247", date: "Jan 25, 2024", total: 89.99, items: 2 },
        { id: "ORD-1198", date: "Jan 18, 2024", total: 234.5, items: 5 },
        { id: "ORD-1142", date: "Jan 10, 2024", total: 45.0, items: 1 },
    ],
};

export default function CustomerDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const customer = MOCK_CUSTOMER; // In real app: useQuery to fetch

    const handleCall = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(`tel:${customer.phone.replace(/\s+/g, "")}`);
    };

    const handleEmail = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL(`mailto:${customer.email}`);
    };

    const handleEditCustomer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        // router.push(`/(crm)/edit/${id}`);
    };

    return (
        <SafeScreen bgColor="bg-background">
            <Header
                title="Customer"
                showBack
                rightAction={{
                    icon: "create-outline",
                    onPress: handleEditCustomer,
                    label: "Edit customer",
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
                            {customer.name.split(" ").map((n) => n[0]).join("")}
                        </Text>
                    </View>
                    <Text className="text-text-primary text-xl font-bold">{customer.name}</Text>
                    <Text className="text-text-secondary text-sm">{customer.email}</Text>
                    <View className="flex-row items-center mt-2">
                        <View className="bg-success/20 px-2 py-1 rounded-full">
                            <Text className="text-success text-xs font-medium uppercase">
                                {customer.status}
                            </Text>
                        </View>
                        <Text className="text-text-tertiary text-xs ml-2">
                            Customer since {customer.joinDate}
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
                        <Ionicons name="chatbubble-outline" size={20} color="#3B82F6" />
                        <Text className="text-text-primary text-xs mt-1">Message</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Overview
                    </Text>
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <StatCard
                                label="Total Spent"
                                value={`$${customer.totalSpent.toLocaleString()}`}
                                icon="wallet-outline"
                                iconColor="#22C55E"
                            />
                        </View>
                        <View className="flex-1">
                            <StatCard
                                label="Orders"
                                value={customer.totalOrders}
                                icon="cart-outline"
                                iconColor="#3B82F6"
                            />
                        </View>
                    </View>
                    <View className="mt-3">
                        <StatCard
                            label="Average Order"
                            value={`$${customer.avgOrderValue.toFixed(2)}`}
                            icon="analytics-outline"
                            iconColor="#8B5CF6"
                        />
                    </View>
                </View>

                {/* Contact Details */}
                <View className="px-4 mb-4">
                    <Text className="text-text-secondary text-sm font-medium mb-3">
                        Contact
                    </Text>
                    <View className="gap-2">
                        <ListCard
                            icon="call-outline"
                            label="Phone"
                            value={customer.phone}
                            onPress={handleCall}
                        />
                        <ListCard
                            icon="mail-outline"
                            label="Email"
                            value={customer.email}
                            onPress={handleEmail}
                        />
                        <ListCard
                            icon="location-outline"
                            label="Address"
                            value={customer.address}
                        />
                    </View>
                </View>

                {/* Recent Orders */}
                <View className="px-4 mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-text-secondary text-sm font-medium">
                            Recent Orders
                        </Text>
                        <Button variant="ghost" size="sm" onPress={() => { }}>
                            View All
                        </Button>
                    </View>
                    <Card>
                        {customer.recentOrders.map((order, index) => (
                            <React.Fragment key={order.id}>
                                <TouchableOpacity className="flex-row items-center py-2">
                                    <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center mr-3">
                                        <Ionicons name="receipt-outline" size={18} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-text-primary text-sm font-medium">
                                            {order.id}
                                        </Text>
                                        <Text className="text-text-tertiary text-xs">
                                            {order.date} • {order.items} items
                                        </Text>
                                    </View>
                                    <Text className="text-primary text-sm font-semibold">
                                        ${order.total.toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                                {index < customer.recentOrders.length - 1 && (
                                    <View className="h-px bg-border my-2" />
                                )}
                            </React.Fragment>
                        ))}
                    </Card>
                </View>

                {/* Notes */}
                {customer.notes && (
                    <View className="px-4">
                        <Text className="text-text-secondary text-sm font-medium mb-3">
                            Notes
                        </Text>
                        <Card>
                            <Text className="text-text-secondary text-sm leading-5">
                                {customer.notes}
                            </Text>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </SafeScreen>
    );
}
