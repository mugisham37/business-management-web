/**
 * Input Component
 *
 * A styled text input with label, helper text, error handling, and icons.
 */
import React, { forwardRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
    /** Input label */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Error message (shows instead of helper text) */
    error?: string;
    /** Icon on the left */
    leftIcon?: keyof typeof Ionicons.glyphMap;
    /** Icon on the right (clickable) */
    rightIcon?: keyof typeof Ionicons.glyphMap;
    /** Right icon press handler */
    onRightIconPress?: () => void;
    /** Whether this is a password field (shows toggle) */
    isPassword?: boolean;
    /** Container className */
    containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
    (
        {
            label,
            helperText,
            error,
            leftIcon,
            rightIcon,
            onRightIconPress,
            isPassword = false,
            containerClassName = "",
            className = "",
            editable = true,
            ...props
        },
        ref
    ) => {
        const [isFocused, setIsFocused] = useState(false);
        const [showPassword, setShowPassword] = useState(false);

        const hasError = !!error;
        const isDisabled = !editable;

        const getBorderColor = () => {
            if (hasError) return "border-error";
            if (isFocused) return "border-primary";
            return "border-border";
        };

        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        return (
            <View className={`mb-4 ${containerClassName}`}>
                {/* Label */}
                {label && (
                    <Text className="text-text-secondary text-sm font-medium mb-2">
                        {label}
                    </Text>
                )}

                {/* Input container */}
                <View
                    className={`
            flex-row items-center
            bg-surface h-12 rounded-xl border
            ${getBorderColor()}
            ${isDisabled ? "opacity-50" : ""}
          `}
                >
                    {/* Left icon */}
                    {leftIcon && (
                        <View className="pl-3">
                            <Ionicons
                                name={leftIcon}
                                size={20}
                                color={hasError ? "#EF4444" : isFocused ? "#3B82F6" : "#A3A3A3"}
                            />
                        </View>
                    )}

                    {/* Text input */}
                    <TextInput
                        ref={ref}
                        className={`flex-1 h-full px-3 text-text-primary text-base ${className}`}
                        placeholderTextColor="#737373"
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        editable={editable}
                        secureTextEntry={isPassword && !showPassword}
                        {...props}
                    />

                    {/* Right icon or password toggle */}
                    {isPassword ? (
                        <TouchableOpacity
                            onPress={togglePasswordVisibility}
                            className="pr-3"
                            accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                        >
                            <Ionicons
                                name={showPassword ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#A3A3A3"
                            />
                        </TouchableOpacity>
                    ) : rightIcon ? (
                        <TouchableOpacity
                            onPress={onRightIconPress}
                            disabled={!onRightIconPress}
                            className="pr-3"
                        >
                            <Ionicons
                                name={rightIcon}
                                size={20}
                                color={isFocused ? "#3B82F6" : "#A3A3A3"}
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Helper text or error */}
                {(error || helperText) && (
                    <Text
                        className={`text-xs mt-1.5 ${hasError ? "text-error" : "text-text-tertiary"
                            }`}
                    >
                        {error || helperText}
                    </Text>
                )}
            </View>
        );
    }
);

Input.displayName = "Input";

/**
 * SearchInput - Specialized input for search functionality
 */
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "label"> {
    onClear?: () => void;
}

export function SearchInput({
    value,
    onClear,
    onChangeText,
    placeholder = "Search...",
    ...props
}: SearchInputProps) {
    const hasValue = !!value && value.length > 0;

    const handleClear = () => {
        onChangeText?.("");
        onClear?.();
    };

    return (
        <Input
            leftIcon="search-outline"
            rightIcon={hasValue ? "close-circle" : undefined}
            onRightIconPress={hasValue ? handleClear : undefined}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            returnKeyType="search"
            {...props}
        />
    );
}
