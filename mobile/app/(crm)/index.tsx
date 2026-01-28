/**
 * Customers List Screen
 *
 * Displays list of customers with search and filtering.
 */
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { SearchInput, Card, Button } from "@/components/core";
import { LoadingState, EmptyState } from "@/components/state";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Mock customer data
const MOCK_CUSTOMERS = [
    {
        id: "1",
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1 555-123-4567",
        totalOrders: 24,
        totalSpent: 2450.0,
        lastVisit: "2 days ago",
        status: "active" as const,
    },
    {
        id: "2",
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1 555-987-6543",
        totalOrders: 12,
        totalSpent: 1890.5,
        lastVisit: "1 week ago",
        status: "active" as const,
    },
    {
        id: "3",
        name: "Michael Brown",
        email: "m.brown@example.com",
        phone: "+1 555-456-7890",
        totalOrders: 8,
        totalSpent: 720.0,
        lastVisit: "3 weeks ago",
        status: "inactive" as const,
    },
    {
        id: "4",
        name: "Emily Davis",
        email: "emily.d@example.com",
        phone: "+1 555-321-0987",
        totalOrders: 45,
        totalSpent: 5680.0,
        lastVisit: "Yesterday",
        status: "vip" as const,
    },
];

type CustomerStatus = "active" | "inactive" | "vip";
type Customer = typeof MOCK_CUSTOMERS[0];

const statusColors: Record<CustomerStatus, string> = {
    active: "#22C55E",
    inactive: "#737373",
    vip: "#F59E0B",
};

export default function CustomersScreen() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | CustomerStatus>("all");

    const filteredCustomers = MOCK_CUSTOMERS.filter((customer) => {
        const matchesSearch =
            customer.name.toLowerCase().includes(search.toLowerCase()) ||
            customer.email.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === "all" || customer.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleCustomerPress = (customer: Customer) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push(`/(crm)/${customer.id}`);
    };

    const handleAddCustomer = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/(crm)/new");
    };

    const renderCustomer = ({ item }: { item: Customer }) => (
        <TouchableOpacity
            onPress={() => handleCustomerPress(item)}
            activeOpacity={0.7}
            className="mb-3"
        >
            <Card noPadding className="p-3">
                <View className="flex-row items-center">
                    {/* Avatar */}
                    <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center mr-3">
                        <Text className="text-primary text-lg font-bold">
                            {item.name.split(" ").map((n) => n[0]).join("")}
                        </Text>
                    </View>

                    {/* Customer Info */}
                    <View className="flex-1">
                        <View className="flex-row items-center">
                            <Text className="text-text-primary text-base font-medium mr-2">
                                {item.name}
                            </Text>
                            {item.status === "vip" && (
                                <View className="bg-warning/20 px-1.5 py-0.5 rounded">
                                    <Text className="text-warning text-2xs font-bold">VIP</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-text-tertiary text-sm">{item.email}</Text>
                        <View className="flex-row items-center mt-1">
                            <Text className="text-primary text-sm font-medium">
                                ${item.totalSpent.toLocaleString()}
                            </Text>
                            <View className="mx-2 w-1 h-1 rounded-full bg-border" />
                            <Text className="text-text-secondary text-xs">
                                {item.totalOrders} orders
                            </Text>
                        </View>
                    </View>

                    {/* Last Visit */}
                    <View className="items-end">
                        <Text className="text-text-tertiary text-xs">{item.lastVisit}</Text>
                        <View
                            className="w-2 h-2 rounded-full mt-2"
                            style={{ backgroundColor: statusColors[item.status] }}
                        />
                    </View>
                </View>
            </Card>
        </TouchableOpacity>
    );

    return (
        <SafeScreen bgColor="bg-background">
            {/* Header */}
            <Header
                title="Customers"
                subtitle={`${MOCK_CUSTOMERS.length} total`}
                showBack
                largeTitle
                rightAction={{
                    icon: "add-outline",
                    onPress: handleAddCustomer,
                    label: "Add customer",
                }}
            />

            {/* Search */}
            <View className="px-4 mb-2">
                <SearchInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search customers..."
                />
            </View>

            {/* Filters */}
            <View className="flex-row px-4 mb-3 gap-2">
                <FilterChip
                    label="All"
                    active={filter === "all"}
                    onPress={() => setFilter("all")}
                />
                <FilterChip
                    label="Active"
                    active={filter === "active"}
                    onPress={() => setFilter("active")}
                />
                <FilterChip
                    label="VIP"
                    active={filter === "vip"}
                    onPress={() => setFilter("vip")}
                />
                <FilterChip
                    label="Inactive"
                    active={filter === "inactive"}
                    onPress={() => setFilter("inactive")}
                />
            </View>

            {/* Customer List */}
            <FlatList
                data={filteredCustomers}
                renderItem={renderCustomer}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="people-outline"
                        title="No customers found"
                        description={search ? "Try a different search term" : "Add your first customer"}
                        action={{
                            label: "Add Customer",
                            onPress: handleAddCustomer,
                            icon: "add-outline",
                        }}
                    />
                }
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
            className={`px-3 py-1.5 rounded-full ${active ? "bg-primary" : "bg-surface"
                }`}
        >
            <Text
                className={`text-sm font-medium ${active ? "text-white" : "text-text-secondary"
                    }`}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
}
