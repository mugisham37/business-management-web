/**
 * Inventory Tab Screen
 *
 * Product list with search and quick access to inventory functions.
 */
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { SearchInput, Card, Button } from "@/components/core";
import { LoadingState, EmptyState } from "@/components/state";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Mock product data
const MOCK_PRODUCTS = [
    { id: "1", name: "iPhone 15 Pro", sku: "APL-IP15P-256", price: 1199, stock: 45, lowStock: false },
    { id: "2", name: "Samsung Galaxy S24", sku: "SAM-GS24-128", price: 899, stock: 5, lowStock: true },
    { id: "3", name: "MacBook Air M3", sku: "APL-MBA-M3", price: 1299, stock: 23, lowStock: false },
    { id: "4", name: "iPad Pro 12.9", sku: "APL-IPDP-12", price: 1099, stock: 8, lowStock: true },
    { id: "5", name: "AirPods Pro 2", sku: "APL-APP2", price: 249, stock: 67, lowStock: false },
];

export default function InventoryScreen() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const filteredProducts = MOCK_PRODUCTS.filter(
        (p) =>
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const handleScan = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // TODO: Open barcode scanner
    };

    const renderProduct = ({ item }: { item: typeof MOCK_PRODUCTS[0] }) => (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // router.push(`/(inventory)/${item.id}`);
            }}
            activeOpacity={0.7}
            className="mb-3"
        >
            <Card noPadding className="p-3">
                <View className="flex-row items-center">
                    {/* Product Image Placeholder */}
                    <View className="w-14 h-14 rounded-xl bg-surface-elevated items-center justify-center mr-3">
                        <Ionicons name="cube-outline" size={24} color="#737373" />
                    </View>

                    {/* Product Info */}
                    <View className="flex-1">
                        <Text className="text-text-primary text-base font-medium" numberOfLines={1}>
                            {item.name}
                        </Text>
                        <Text className="text-text-tertiary text-xs">{item.sku}</Text>
                        <View className="flex-row items-center mt-1">
                            <Text className="text-primary text-sm font-semibold">
                                ${item.price.toLocaleString()}
                            </Text>
                            <View className="mx-2 w-1 h-1 rounded-full bg-border" />
                            <View className="flex-row items-center">
                                <View
                                    className={`w-2 h-2 rounded-full mr-1 ${item.lowStock ? "bg-warning" : "bg-success"
                                        }`}
                                />
                                <Text
                                    className={`text-xs ${item.lowStock ? "text-warning" : "text-text-secondary"
                                        }`}
                                >
                                    {item.stock} in stock
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Arrow */}
                    <Ionicons name="chevron-forward" size={20} color="#737373" />
                </View>
            </Card>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeScreen hasTabBar>
                <LoadingState message="Loading products..." />
            </SafeScreen>
        );
    }

    return (
        <SafeScreen hasTabBar bgColor="bg-background">
            {/* Header */}
            <Header
                title="Inventory"
                subtitle={`${MOCK_PRODUCTS.length} products`}
                showBack={false}
                largeTitle
                rightAction={{
                    icon: "scan-outline",
                    onPress: handleScan,
                    label: "Scan barcode",
                }}
                secondaryAction={{
                    icon: "add-outline",
                    onPress: () => { },
                    label: "Add product",
                }}
            />

            {/* Search */}
            <View className="px-4 mb-2">
                <SearchInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search products..."
                />
            </View>

            {/* Quick Filters */}
            <View className="flex-row px-4 mb-3 gap-2">
                <FilterChip label="All" active />
                <FilterChip label="Low Stock" count={5} />
                <FilterChip label="Out of Stock" count={0} />
            </View>

            {/* Product List */}
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="cube-outline"
                        title="No products found"
                        description={search ? "Try a different search term" : "Add your first product"}
                        action={{
                            label: "Add Product",
                            onPress: () => { },
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
    count?: number;
}

function FilterChip({ label, active = false, count }: FilterChipProps) {
    return (
        <TouchableOpacity
            className={`flex-row items-center px-3 py-1.5 rounded-full ${active ? "bg-primary" : "bg-surface"
                }`}
        >
            <Text
                className={`text-sm font-medium ${active ? "text-white" : "text-text-secondary"
                    }`}
            >
                {label}
            </Text>
            {count !== undefined && count > 0 && (
                <View className="ml-1.5 bg-error min-w-4 h-4 rounded-full items-center justify-center px-1">
                    <Text className="text-white text-2xs font-bold">{count}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
}
