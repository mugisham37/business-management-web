/**
 * Dashboard Screen
 *
 * Main dashboard with KPIs, quick actions, and activity feed.
 */
import React from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen, ScreenContent } from "@/components/layout";
import { StatCard, Card, Button } from "@/components/core";
import { LoadingState } from "@/components/state";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/hooks/auth";

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // TODO: Refetch dashboard data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <SafeScreen hasTabBar>
        <LoadingState message="Loading dashboard..." />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen hasTabBar bgColor="bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6"]}
          />
        }
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-text-secondary text-sm">Welcome back,</Text>
              <Text className="text-text-primary text-2xl font-bold">
                {user?.firstName || "User"}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                leftIcon="notifications-outline"
                onPress={() => { }}
              >
                3
              </Button>
            </View>
          </View>
        </View>

        {/* KPI Cards */}
        <View className="px-4 mb-4">
          <Text className="text-text-secondary text-sm font-medium mb-3">
            Today's Overview
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[150px]">
              <StatCard
                label="Revenue"
                value="$12,459"
                icon="trending-up-outline"
                iconColor="#22C55E"
                change={{ value: 12.5, type: "increase" }}
              />
            </View>
            <View className="flex-1 min-w-[150px]">
              <StatCard
                label="Orders"
                value={47}
                icon="cart-outline"
                iconColor="#3B82F6"
                change={{ value: 8, type: "increase" }}
              />
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3 mt-3">
            <View className="flex-1 min-w-[150px]">
              <StatCard
                label="Customers"
                value={156}
                icon="people-outline"
                iconColor="#8B5CF6"
                change={{ value: 3.2, type: "increase" }}
              />
            </View>
            <View className="flex-1 min-w-[150px]">
              <StatCard
                label="Low Stock"
                value={12}
                icon="warning-outline"
                iconColor="#F59E0B"
              />
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 mb-4">
          <Text className="text-text-secondary text-sm font-medium mb-3">
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <QuickActionCard
              icon="cart-outline"
              label="New Sale"
              color="#3B82F6"
              onPress={() => router.push("/(tabs)/pos")}
            />
            <QuickActionCard
              icon="scan-outline"
              label="Scan Item"
              color="#22C55E"
              onPress={() => { }}
            />
            <QuickActionCard
              icon="add-circle-outline"
              label="Add Product"
              color="#8B5CF6"
              onPress={() => router.push("/(tabs)/inventory")}
            />
            <QuickActionCard
              icon="people-outline"
              label="Customers"
              color="#F59E0B"
              onPress={() => { }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-text-secondary text-sm font-medium">
              Recent Activity
            </Text>
            <Button variant="ghost" size="sm" onPress={() => { }}>
              View All
            </Button>
          </View>
          <Card>
            <ActivityItem
              icon="cart"
              iconColor="#3B82F6"
              title="New order #1247"
              description="2 items • $89.99"
              time="5 min ago"
            />
            <View className="h-px bg-border my-3" />
            <ActivityItem
              icon="cube"
              iconColor="#22C55E"
              title="Stock updated"
              description="iPhone 15 Pro - Added 50 units"
              time="1 hour ago"
            />
            <View className="h-px bg-border my-3" />
            <ActivityItem
              icon="person-add"
              iconColor="#8B5CF6"
              title="New customer"
              description="John Smith registered"
              time="2 hours ago"
            />
          </Card>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

// Quick Action Card Component
interface QuickActionCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}

function QuickActionCard({ icon, label, color, onPress }: QuickActionCardProps) {
  return (
    <Card
      onPress={onPress}
      noPadding
      className="flex-1 min-w-[70px] items-center py-4"
    >
      <View
        className="w-12 h-12 rounded-xl items-center justify-center mb-2"
        style={{ backgroundColor: `${color}20` }}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text className="text-text-primary text-xs font-medium">{label}</Text>
    </Card>
  );
}

// Activity Item Component
interface ActivityItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  description: string;
  time: string;
}

function ActivityItem({
  icon,
  iconColor,
  title,
  description,
  time,
}: ActivityItemProps) {
  return (
    <View className="flex-row items-center">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}20` }}
      >
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text className="text-text-primary text-sm font-medium">{title}</Text>
        <Text className="text-text-secondary text-xs">{description}</Text>
      </View>
      <Text className="text-text-tertiary text-xs">{time}</Text>
    </View>
  );
}
