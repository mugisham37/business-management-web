/**
 * SafeScreen Component
 *
 * A wrapper component that handles safe area insets for all screens.
 * Provides consistent padding and background color across the app.
 */
import React from "react";
import { View, ViewProps, StatusBar, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface SafeScreenProps extends ViewProps {
    children: React.ReactNode;
    /** Whether to include bottom padding for tab bar */
    hasTabBar?: boolean;
    /** Whether to include top safe area padding */
    hasHeader?: boolean;
    /** Custom background color class */
    bgColor?: string;
    /** Content container style */
    contentContainerClassName?: string;
}

export function SafeScreen({
    children,
    hasTabBar = false,
    hasHeader = true,
    bgColor = "bg-background",
    contentContainerClassName = "",
    className = "",
    ...props
}: SafeScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <>
            <StatusBar
                barStyle="light-content"
                backgroundColor="transparent"
                translucent
            />
            <SafeAreaView
                className={`flex-1 ${bgColor} ${className}`}
                edges={hasHeader ? ["top", "left", "right"] : ["left", "right"]}
                {...props}
            >
                <View
                    className={`flex-1 ${contentContainerClassName}`}
                    style={hasTabBar ? { paddingBottom: insets.bottom + 80 } : undefined}
                >
                    {children}
                </View>
            </SafeAreaView>
        </>
    );
}

/**
 * ScreenContent - Contents wrapper with standard horizontal padding
 */
export function ScreenContent({
    children,
    className = "",
    ...props
}: ViewProps & { children: React.ReactNode }) {
    return (
        <View className={`flex-1 px-4 ${className}`} {...props}>
            {children}
        </View>
    );
}
