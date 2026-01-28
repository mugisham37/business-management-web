/**
 * Card Component
 *
 * A container component with consistent styling for content grouping.
 */
import React from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface CardProps extends ViewProps {
    children: React.ReactNode;
    /** Card title */
    title?: string;
    /** Card subtitle */
    subtitle?: string;
    /** Press handler (makes card touchable) */
    onPress?: () => void;
    /** Right side content */
    rightContent?: React.ReactNode;
    /** Remove padding */
    noPadding?: boolean;
    /** Elevated style */
    elevated?: boolean;
}

export function Card({
    children,
    title,
    subtitle,
    onPress,
    rightContent,
    noPadding = false,
    elevated = false,
    className = "",
    ...props
}: CardProps) {
    const content = (
        <View
            className={`
        rounded-2xl
        ${elevated ? "bg-surface-elevated" : "bg-surface"}
        ${noPadding ? "" : "p-4"}
        ${className}
      `}
            {...props}
        >
            {(title || subtitle || rightContent) && (
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-1">
                        {title && (
                            <Text className="text-text-primary text-lg font-semibold">
                                {title}
                            </Text>
                        )}
                        {subtitle && (
                            <Text className="text-text-secondary text-sm mt-0.5">
                                {subtitle}
                            </Text>
                        )}
                    </View>
                    {rightContent}
                </View>
            )}
            {children}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onPress();
                }}
                activeOpacity={0.7}
            >
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

/**
 * ListCard - Card styled for list items with arrow indicator
 */
interface ListCardProps extends Omit<CardProps, "children"> {
    /** Main label */
    label: string;
    /** Description text */
    description?: string;
    /** Value on the right */
    value?: string;
    /** Icon on the left */
    icon?: keyof typeof Ionicons.glyphMap;
    /** Icon background color */
    iconBgColor?: string;
    /** Show disclosure arrow */
    showArrow?: boolean;
    /** Badge count */
    badge?: number;
}

export function ListCard({
    label,
    description,
    value,
    icon,
    iconBgColor = "bg-primary/10",
    showArrow = true,
    badge,
    onPress,
    className = "",
    ...props
}: ListCardProps) {
    return (
        <Card
            onPress={onPress}
            noPadding
            className={`p-3 ${className}`}
            {...props}
        >
            <View className="flex-row items-center">
                {/* Icon */}
                {icon && (
                    <View
                        className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${iconBgColor}`}
                    >
                        <Ionicons name={icon} size={20} color="#3B82F6" />
                    </View>
                )}

                {/* Content */}
                <View className="flex-1">
                    <Text className="text-text-primary text-base font-medium">
                        {label}
                    </Text>
                    {description && (
                        <Text className="text-text-secondary text-sm mt-0.5">
                            {description}
                        </Text>
                    )}
                </View>

                {/* Right content */}
                <View className="flex-row items-center">
                    {value && (
                        <Text className="text-text-secondary text-sm mr-2">{value}</Text>
                    )}
                    {badge !== undefined && badge > 0 && (
                        <View className="bg-error min-w-5 h-5 rounded-full items-center justify-center px-1.5 mr-2">
                            <Text className="text-white text-xs font-bold">
                                {badge > 99 ? "99+" : badge}
                            </Text>
                        </View>
                    )}
                    {showArrow && onPress && (
                        <Ionicons name="chevron-forward" size={20} color="#737373" />
                    )}
                </View>
            </View>
        </Card>
    );
}

/**
 * StatCard - Card for displaying statistics/KPIs
 */
interface StatCardProps extends ViewProps {
    /** Stat label */
    label: string;
    /** Main value */
    value: string | number;
    /** Change indicator */
    change?: {
        value: number;
        type: "increase" | "decrease";
    };
    /** Icon */
    icon?: keyof typeof Ionicons.glyphMap;
    /** Icon color */
    iconColor?: string;
}

export function StatCard({
    label,
    value,
    change,
    icon,
    iconColor = "#3B82F6",
    className = "",
    ...props
}: StatCardProps) {
    return (
        <View
            className={`bg-surface rounded-2xl p-4 ${className}`}
            {...props}
        >
            <View className="flex-row items-center justify-between mb-2">
                <Text className="text-text-secondary text-sm">{label}</Text>
                {icon && (
                    <View className="w-8 h-8 rounded-lg bg-surface-elevated items-center justify-center">
                        <Ionicons name={icon} size={18} color={iconColor} />
                    </View>
                )}
            </View>

            <Text className="text-text-primary text-2xl font-bold">
                {typeof value === "number" ? value.toLocaleString() : value}
            </Text>

            {change && (
                <View className="flex-row items-center mt-1">
                    <Ionicons
                        name={change.type === "increase" ? "trending-up" : "trending-down"}
                        size={14}
                        color={change.type === "increase" ? "#22C55E" : "#EF4444"}
                    />
                    <Text
                        className={`text-xs ml-1 ${change.type === "increase" ? "text-success" : "text-error"
                            }`}
                    >
                        {Math.abs(change.value)}%
                    </Text>
                    <Text className="text-text-tertiary text-xs ml-1">vs last period</Text>
                </View>
            )}
        </View>
    );
}
