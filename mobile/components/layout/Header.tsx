/**
 * Header Component
 *
 * Consistent screen header with back button, title, and optional actions.
 */
import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface HeaderProps extends ViewProps {
    /** Screen title */
    title: string;
    /** Subtitle (optional) */
    subtitle?: string;
    /** Show back button */
    showBack?: boolean;
    /** Custom back action */
    onBack?: () => void;
    /** Right side action button */
    rightAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
        label?: string;
    };
    /** Secondary right action */
    secondaryAction?: {
        icon: keyof typeof Ionicons.glyphMap;
        onPress: () => void;
        label?: string;
    };
    /** Large title style (iOS-like) */
    largeTitle?: boolean;
    /** Transparent background */
    transparent?: boolean;
}

export function Header({
    title,
    subtitle,
    showBack = true,
    onBack,
    rightAction,
    secondaryAction,
    largeTitle = false,
    transparent = false,
    className = "",
    ...props
}: HeaderProps) {
    const router = useRouter();
    const navigation = useNavigation();

    const handleBack = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (onBack) {
            onBack();
        } else if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            router.back();
        }
    };

    const handleAction = (action: () => void) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action();
    };

    if (largeTitle) {
        return (
            <View
                className={`pt-2 pb-4 px-4 ${transparent ? "" : "bg-background"} ${className}`}
                {...props}
            >
                {/* Top row with back button and actions */}
                <View className="flex-row items-center justify-between mb-2">
                    {showBack ? (
                        <TouchableOpacity
                            onPress={handleBack}
                            className="w-10 h-10 items-center justify-center rounded-full bg-surface active:bg-surface-elevated"
                            accessibilityLabel="Go back"
                            accessibilityRole="button"
                        >
                            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    ) : (
                        <View className="w-10" />
                    )}

                    <View className="flex-row items-center gap-2">
                        {secondaryAction && (
                            <TouchableOpacity
                                onPress={() => handleAction(secondaryAction.onPress)}
                                className="w-10 h-10 items-center justify-center rounded-full bg-surface active:bg-surface-elevated"
                                accessibilityLabel={secondaryAction.label || "Action"}
                                accessibilityRole="button"
                            >
                                <Ionicons name={secondaryAction.icon} size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                        {rightAction && (
                            <TouchableOpacity
                                onPress={() => handleAction(rightAction.onPress)}
                                className="w-10 h-10 items-center justify-center rounded-full bg-primary active:bg-primary-600"
                                accessibilityLabel={rightAction.label || "Action"}
                                accessibilityRole="button"
                            >
                                <Ionicons name={rightAction.icon} size={22} color="#FFFFFF" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Large title */}
                <Text className="text-text-primary text-3xl font-bold">{title}</Text>
                {subtitle && (
                    <Text className="text-text-secondary text-base mt-1">{subtitle}</Text>
                )}
            </View>
        );
    }

    return (
        <View
            className={`flex-row items-center justify-between h-14 px-4 ${transparent ? "" : "bg-background border-b border-border-subtle"
                } ${className}`}
            {...props}
        >
            {/* Left section */}
            <View className="flex-row items-center flex-1">
                {showBack && (
                    <TouchableOpacity
                        onPress={handleBack}
                        className="w-10 h-10 items-center justify-center rounded-full mr-2 active:bg-surface"
                        accessibilityLabel="Go back"
                        accessibilityRole="button"
                    >
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}
                <View className="flex-1">
                    <Text
                        className="text-text-primary text-lg font-semibold"
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-text-secondary text-xs" numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            {/* Right section */}
            <View className="flex-row items-center gap-1">
                {secondaryAction && (
                    <TouchableOpacity
                        onPress={() => handleAction(secondaryAction.onPress)}
                        className="w-10 h-10 items-center justify-center rounded-full active:bg-surface"
                        accessibilityLabel={secondaryAction.label || "Action"}
                        accessibilityRole="button"
                    >
                        <Ionicons name={secondaryAction.icon} size={22} color="#A3A3A3" />
                    </TouchableOpacity>
                )}
                {rightAction && (
                    <TouchableOpacity
                        onPress={() => handleAction(rightAction.onPress)}
                        className="w-10 h-10 items-center justify-center rounded-full active:bg-surface"
                        accessibilityLabel={rightAction.label || "Action"}
                        accessibilityRole="button"
                    >
                        <Ionicons name={rightAction.icon} size={22} color="#3B82F6" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
