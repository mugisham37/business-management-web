/**
 * Tab Layout
 *
 * Main navigation with role-based tabs using a floating blur tab bar.
 */
import React from "react";
import { View, Platform } from "react-native";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

// Tab configuration
interface TabConfig {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  {
    name: "index",
    title: "Dashboard",
    icon: "grid-outline",
    iconFocused: "grid",
  },
  {
    name: "inventory",
    title: "Inventory",
    icon: "cube-outline",
    iconFocused: "cube",
  },
  {
    name: "pos",
    title: "POS",
    icon: "cart-outline",
    iconFocused: "cart",
  },
  {
    name: "profile",
    title: "Profile",
    icon: "person-outline",
    iconFocused: "person",
  },
];

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#3B82F6",
        tabBarInactiveTintColor: "#737373",
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -2,
        },
        tabBarStyle: {
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 70 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          borderTopWidth: 0,
          backgroundColor: Platform.OS === "ios" ? "transparent" : "#1F1F1F",
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="dark"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          ) : null,
      }}
      screenListeners={{
        tabPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ color, focused }) => (
              <View
                className={`items-center justify-center ${focused ? "bg-primary/10 rounded-full w-12 h-8" : ""
                  }`}
              >
                <Ionicons
                  name={focused ? tab.iconFocused : tab.icon}
                  size={22}
                  color={color}
                />
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
