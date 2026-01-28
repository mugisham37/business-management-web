/**
 * State Components
 *
 * Components for displaying loading, error, and empty states.
 */
import React from "react";
import { View, Text, ActivityIndicator, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "../core/Button";

/**
 * LoadingState - Full screen loading indicator
 */
interface LoadingStateProps {
    /** Loading message */
    message?: string;
    /** Compact mode (inline) */
    compact?: boolean;
}

export function LoadingState({
    message = "Loading...",
    compact = false,
}: LoadingStateProps) {
    if (compact) {
        return (
            <View className= "flex-row items-center justify-center py-4" >
            <ActivityIndicator size="small" color = "#3B82F6" />
                <Text className="text-text-secondary text-sm ml-2" > { message } </Text>
                    </View>
    );
    }

    return (
        <View className= "flex-1 items-center justify-center p-8" >
        <ActivityIndicator size="large" color = "#3B82F6" />
            <Text className="text-text-secondary text-base mt-4" > { message } </Text>
                </View>
  );
}

/**
 * ErrorState - Error display with retry option
 */
interface ErrorStateProps {
    /** Error title */
    title?: string;
    /** Error message */
    message?: string;
    /** Retry handler */
    onRetry?: () => void;
    /** Compact mode (inline) */
    compact?: boolean;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We couldn't load the data. Please try again.",
    onRetry,
    compact = false,
}: ErrorStateProps) {
    if (compact) {
        return (
            <View className= "flex-row items-center justify-between bg-error/10 rounded-xl p-3" >
            <View className="flex-row items-center flex-1" >
                <Ionicons name="warning-outline" size = { 20} color = "#EF4444" />
                    <Text className="text-error text-sm ml-2 flex-1" numberOfLines = { 1} >
                        { message }
                        </Text>
                        </View>
        {
            onRetry && (
                <Button variant="ghost" size = "sm" onPress = { onRetry } >
                    Retry
                    </Button>
        )
        }
        </View>
    );
    }

    return (
        <View className= "flex-1 items-center justify-center p-8" >
        <View className="w-16 h-16 rounded-full bg-error/10 items-center justify-center mb-4" >
            <Ionicons name="warning-outline" size = { 32} color = "#EF4444" />
                </View>
                < Text className = "text-text-primary text-xl font-semibold text-center mb-2" >
                    { title }
                    </Text>
                    < Text className = "text-text-secondary text-base text-center mb-6" >
                        { message }
                        </Text>
    {
        onRetry && (
            <Button variant="primary" onPress = { onRetry } leftIcon = "refresh-outline" >
                Try Again
                    </Button>
      )
    }
    </View>
  );
}

/**
 * EmptyState - Placeholder when no data is available
 */
interface EmptyStateProps {
    /** Icon to display */
    icon?: keyof typeof Ionicons.glyphMap;
    /** Title */
    title: string;
    /** Description */
    description?: string;
    /** Action button */
    action?: {
        label: string;
        onPress: () => void;
        icon?: keyof typeof Ionicons.glyphMap;
    };
    /** Compact mode (inline) */
    compact?: boolean;
}

export function EmptyState({
    icon = "folder-open-outline",
    title,
    description,
    action,
    compact = false,
}: EmptyStateProps) {
    if (compact) {
        return (
            <View className= "items-center py-8" >
            <Ionicons name={ icon } size = { 40} color = "#737373" />
                <Text className="text-text-secondary text-sm mt-2" > { title } </Text>
        {
            action && (
                <Button
            variant="ghost"
            size = "sm"
            onPress = { action.onPress }
            className = "mt-2"
                >
                { action.label }
                </Button>
        )
        }
        </View>
    );
    }

    return (
        <View className= "flex-1 items-center justify-center p-8" >
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4" >
            <Ionicons name={ icon } size = { 40} color = "#737373" />
                </View>
                < Text className = "text-text-primary text-xl font-semibold text-center mb-2" >
                    { title }
                    </Text>
    {
        description && (
            <Text className="text-text-secondary text-base text-center mb-6" >
                { description }
                </Text>
      )
    }
    {
        action && (
            <Button
          variant="primary"
        onPress = { action.onPress }
        leftIcon = { action.icon }
            >
            { action.label }
            </Button>
      )
    }
    </View>
  );
}

/**
 * OfflineBanner - Shows when the device is offline
 */
interface OfflineBannerProps {
    onDismiss?: () => void;
}

export function OfflineBanner({ onDismiss }: OfflineBannerProps) {
    return (
        <View className= "bg-warning/10 flex-row items-center justify-between px-4 py-2" >
        <View className="flex-row items-center" >
            <Ionicons name="cloud-offline-outline" size = { 18} color = "#F59E0B" />
                <Text className="text-warning text-sm font-medium ml-2" >
                    You're offline
                        </Text>
                        </View>
                        < Text className = "text-text-secondary text-xs" >
                            Changes will sync when connected
                                </Text>
                                </View>
  );
}
