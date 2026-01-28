/**
 * Button Component
 *
 * A versatile button component with multiple variants, sizes, and states.
 */
import React from "react";
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    View,
    TouchableOpacityProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<TouchableOpacityProps, "children"> {
    /** Button text */
    children: React.ReactNode;
    /** Visual variant */
    variant?: ButtonVariant;
    /** Size preset */
    size?: ButtonSize;
    /** Loading state */
    loading?: boolean;
    /** Icon on the left */
    leftIcon?: keyof typeof Ionicons.glyphMap;
    /** Icon on the right */
    rightIcon?: keyof typeof Ionicons.glyphMap;
    /** Full width button */
    fullWidth?: boolean;
    /** Disable haptic feedback */
    noHaptics?: boolean;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
    primary: {
        bg: "bg-primary active:bg-primary-600",
        text: "text-white",
    },
    secondary: {
        bg: "bg-surface active:bg-surface-elevated",
        text: "text-text-primary",
    },
    outline: {
        bg: "bg-transparent active:bg-surface",
        text: "text-primary",
        border: "border border-primary",
    },
    ghost: {
        bg: "bg-transparent active:bg-surface",
        text: "text-text-secondary",
    },
    danger: {
        bg: "bg-error active:bg-error-600",
        text: "text-white",
    },
};

const sizeStyles: Record<ButtonSize, { container: string; text: string; icon: number }> = {
    sm: {
        container: "h-9 px-3 rounded-lg",
        text: "text-sm font-medium",
        icon: 16,
    },
    md: {
        container: "h-12 px-4 rounded-xl",
        text: "text-base font-semibold",
        icon: 20,
    },
    lg: {
        container: "h-14 px-6 rounded-xl",
        text: "text-lg font-semibold",
        icon: 24,
    },
};

const textColorMap: Record<string, string> = {
    "text-white": "#FFFFFF",
    "text-text-primary": "#FFFFFF",
    "text-text-secondary": "#A3A3A3",
    "text-primary": "#3B82F6",
};

export function Button({
    children,
    variant = "primary",
    size = "md",
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    noHaptics = false,
    disabled,
    onPress,
    className = "",
    ...props
}: ButtonProps) {
    const styles = variantStyles[variant];
    const sizeStyle = sizeStyles[size];
    const iconColor = textColorMap[styles.text] || "#FFFFFF";

    const handlePress = (event: any) => {
        if (!noHaptics) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.(event);
    };

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={isDisabled}
            className={`
        flex-row items-center justify-center
        ${sizeStyle.container}
        ${styles.bg}
        ${styles.border || ""}
        ${fullWidth ? "w-full" : ""}
        ${isDisabled ? "opacity-50" : ""}
        ${className}
      `}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled }}
            {...props}
        >
            {loading ? (
                <ActivityIndicator size="small" color={iconColor} />
            ) : (
                <>
                    {leftIcon && (
                        <Ionicons
                            name={leftIcon}
                            size={sizeStyle.icon}
                            color={iconColor}
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text
                        className={`${sizeStyle.text} ${styles.text}`}
                        numberOfLines={1}
                    >
                        {children}
                    </Text>
                    {rightIcon && (
                        <Ionicons
                            name={rightIcon}
                            size={sizeStyle.icon}
                            color={iconColor}
                            style={{ marginLeft: 8 }}
                        />
                    )}
                </>
            )}
        </TouchableOpacity>
    );
}

/**
 * IconButton - A circular button with just an icon
 */
interface IconButtonProps extends Omit<TouchableOpacityProps, "children"> {
    icon: keyof typeof Ionicons.glyphMap;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

const iconSizeMap: Record<ButtonSize, { container: string; icon: number }> = {
    sm: { container: "w-9 h-9", icon: 18 },
    md: { container: "w-11 h-11", icon: 22 },
    lg: { container: "w-14 h-14", icon: 26 },
};

export function IconButton({
    icon,
    variant = "secondary",
    size = "md",
    loading = false,
    disabled,
    onPress,
    className = "",
    ...props
}: IconButtonProps) {
    const styles = variantStyles[variant];
    const sizeStyle = iconSizeMap[size];
    const iconColor = textColorMap[styles.text] || "#FFFFFF";

    const handlePress = (event: any) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(event);
    };

    const isDisabled = disabled || loading;

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={isDisabled}
            className={`
        items-center justify-center rounded-full
        ${sizeStyle.container}
        ${styles.bg}
        ${styles.border || ""}
        ${isDisabled ? "opacity-50" : ""}
        ${className}
      `}
            accessibilityRole="button"
            accessibilityState={{ disabled: isDisabled }}
            {...props}
        >
            {loading ? (
                <ActivityIndicator size="small" color={iconColor} />
            ) : (
                <Ionicons name={icon} size={sizeStyle.icon} color={iconColor} />
            )}
        </TouchableOpacity>
    );
}
