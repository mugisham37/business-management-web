/**
 * POS Tab Screen
 *
 * Point of Sale with cart, scanner, and checkout.
 */
import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, Header } from "@/components/layout";
import { Button, Card, SearchInput } from "@/components/core";
import { EmptyState } from "@/components/state";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

// Cart item type
interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export default function POSScreen() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([
        { id: "1", name: "iPhone 15 Pro", price: 1199, quantity: 1 },
        { id: "2", name: "AirPods Pro 2", price: 249, quantity: 2 },
    ]);
    const [search, setSearch] = useState("");

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    const updateQuantity = (id: string, delta: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setCart((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
                        : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    const handleScan = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        // TODO: Open barcode scanner
    };

    const handleCheckout = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // TODO: Navigate to payment
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <Card noPadding className="p-3 mb-3">
            <View className="flex-row items-center">
                {/* Product Image Placeholder */}
                <View className="w-12 h-12 rounded-lg bg-surface-elevated items-center justify-center mr-3">
                    <Ionicons name="cube-outline" size={20} color="#737373" />
                </View>

                {/* Product Info */}
                <View className="flex-1">
                    <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text className="text-primary text-sm font-semibold">
                        ${item.price.toLocaleString()}
                    </Text>
                </View>

                {/* Quantity Controls */}
                <View className="flex-row items-center bg-surface-elevated rounded-lg">
                    <TouchableOpacity
                        onPress={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 items-center justify-center"
                    >
                        <Ionicons name="remove" size={18} color="#A3A3A3" />
                    </TouchableOpacity>
                    <Text className="text-text-primary text-sm font-semibold w-8 text-center">
                        {item.quantity}
                    </Text>
                    <TouchableOpacity
                        onPress={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 items-center justify-center"
                    >
                        <Ionicons name="add" size={18} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>
        </Card>
    );

    return (
        <SafeScreen hasTabBar={false} bgColor="bg-background">
            {/* Header */}
            <Header
                title="Point of Sale"
                showBack={false}
                largeTitle
                rightAction={{
                    icon: "scan-outline",
                    onPress: handleScan,
                    label: "Scan item",
                }}
            />

            {/* Search */}
            <View className="px-4 mb-2">
                <SearchInput
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search or scan product..."
                />
            </View>

            {/* Cart Items */}
            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <EmptyState
                        icon="cart-outline"
                        title="Cart is empty"
                        description="Scan a barcode or search for products"
                        action={{
                            label: "Scan Product",
                            onPress: handleScan,
                            icon: "scan-outline",
                        }}
                    />
                }
            />

            {/* Order Summary */}
            {cart.length > 0 && (
                <View className="bg-surface border-t border-border px-4 pt-4 pb-6">
                    {/* Summary */}
                    <View className="mb-4">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-text-secondary text-sm">Subtotal</Text>
                            <Text className="text-text-primary text-sm">
                                ${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-text-secondary text-sm">Tax (8%)</Text>
                            <Text className="text-text-primary text-sm">
                                ${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                        <View className="flex-row justify-between pt-2 border-t border-border mt-2">
                            <Text className="text-text-primary text-lg font-bold">Total</Text>
                            <Text className="text-primary text-lg font-bold">
                                ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </Text>
                        </View>
                    </View>

                    {/* Checkout Button */}
                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        leftIcon="card-outline"
                        onPress={handleCheckout}
                    >
                        Proceed to Payment
                    </Button>
                </View>
            )}
        </SafeScreen>
    );
}
