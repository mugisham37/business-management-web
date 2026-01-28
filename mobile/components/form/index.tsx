/**
 * Form Components
 *
 * Reusable form controls with consistent styling.
 */
import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Switch,
    Modal,
    FlatList,
    Pressable,
    StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

/**
 * FormField - Wrapper for form inputs with label and error
 */
interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}

export function FormField({
    label,
    error,
    required = false,
    hint,
    children,
    className = "",
}: FormFieldProps) {
    return (
        <View className={`mb-4 ${className}`}>
            <View className="flex-row items-center mb-1.5">
                <Text className="text-text-secondary text-sm font-medium">{label}</Text>
                {required && <Text className="text-error text-sm ml-1">*</Text>}
            </View>
            {children}
            {hint && !error && (
                <Text className="text-text-tertiary text-xs mt-1">{hint}</Text>
            )}
            {error && <Text className="text-error text-xs mt-1">{error}</Text>}
        </View>
    );
}

/**
 * FormSelect - Dropdown select input
 */
interface SelectOption {
    label: string;
    value: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

interface FormSelectProps {
    value?: string;
    options: SelectOption[];
    onSelect: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    label?: string;
    error?: string;
}

export function FormSelect({
    value,
    options,
    onSelect,
    placeholder = "Select...",
    disabled = false,
    label,
    error,
}: FormSelectProps) {
    const [modalVisible, setModalVisible] = useState(false);

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (option: SelectOption) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onSelect(option.value);
        setModalVisible(false);
    };

    return (
        <>
            {label && (
                <Text className="text-text-secondary text-sm font-medium mb-1.5">
                    {label}
                </Text>
            )}
            <TouchableOpacity
                disabled={disabled}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setModalVisible(true);
                }}
                className={`flex-row items-center justify-between bg-surface rounded-xl px-4 py-3.5 border ${error ? "border-error" : "border-border"
                    } ${disabled ? "opacity-50" : ""}`}
            >
                <View className="flex-row items-center flex-1">
                    {selectedOption?.icon && (
                        <Ionicons
                            name={selectedOption.icon}
                            size={18}
                            color="#A3A3A3"
                            style={{ marginRight: 8 }}
                        />
                    )}
                    <Text
                        className={`text-base ${selectedOption ? "text-text-primary" : "text-text-tertiary"
                            }`}
                    >
                        {selectedOption?.label || placeholder}
                    </Text>
                </View>
                <Ionicons name="chevron-down" size={18} color="#737373" />
            </TouchableOpacity>

            {error && <Text className="text-error text-xs mt-1">{error}</Text>}

            {/* Options Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable
                    style={styles.backdrop}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.selectModal}>
                        <View style={styles.selectHeader}>
                            <Text style={styles.selectTitle}>
                                {label || "Select an option"}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#A3A3A3" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item)}
                                    style={[
                                        styles.optionItem,
                                        item.value === value && styles.optionItemSelected,
                                    ]}
                                >
                                    {item.icon && (
                                        <Ionicons
                                            name={item.icon}
                                            size={20}
                                            color={item.value === value ? "#3B82F6" : "#A3A3A3"}
                                            style={{ marginRight: 12 }}
                                        />
                                    )}
                                    <Text
                                        style={[
                                            styles.optionLabel,
                                            item.value === value && styles.optionLabelSelected,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

/**
 * FormSwitch - Toggle switch with label
 */
interface FormSwitchProps {
    value: boolean;
    onValueChange: (value: boolean) => void;
    label: string;
    description?: string;
    disabled?: boolean;
}

export function FormSwitch({
    value,
    onValueChange,
    label,
    description,
    disabled = false,
}: FormSwitchProps) {
    const handleToggle = (newValue: boolean) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onValueChange(newValue);
    };

    return (
        <View
            className={`flex-row items-center justify-between py-3 ${disabled ? "opacity-50" : ""
                }`}
        >
            <View className="flex-1 mr-4">
                <Text className="text-text-primary text-base">{label}</Text>
                {description && (
                    <Text className="text-text-secondary text-sm mt-0.5">
                        {description}
                    </Text>
                )}
            </View>
            <Switch
                value={value}
                onValueChange={handleToggle}
                disabled={disabled}
                trackColor={{ false: "#525252", true: "#3B82F6" }}
                thumbColor={value ? "#FFFFFF" : "#A3A3A3"}
                ios_backgroundColor="#525252"
            />
        </View>
    );
}

/**
 * FormToggleGroup - Segmented control / toggle group
 */
interface ToggleOption {
    label: string;
    value: string;
    icon?: keyof typeof Ionicons.glyphMap;
}

interface FormToggleGroupProps {
    value: string;
    options: ToggleOption[];
    onChange: (value: string) => void;
    label?: string;
}

export function FormToggleGroup({
    value,
    options,
    onChange,
    label,
}: FormToggleGroupProps) {
    const handleSelect = (optionValue: string) => {
        if (optionValue !== value) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(optionValue);
        }
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-text-secondary text-sm font-medium mb-2">
                    {label}
                </Text>
            )}
            <View className="flex-row bg-surface rounded-xl p-1">
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSelect(option.value)}
                        className={`flex-1 flex-row items-center justify-center py-2.5 px-3 rounded-lg ${value === option.value ? "bg-primary" : ""
                            }`}
                    >
                        {option.icon && (
                            <Ionicons
                                name={option.icon}
                                size={16}
                                color={value === option.value ? "#FFFFFF" : "#A3A3A3"}
                                style={{ marginRight: option.label ? 6 : 0 }}
                            />
                        )}
                        {option.label && (
                            <Text
                                className={`text-sm font-medium ${value === option.value ? "text-white" : "text-text-secondary"
                                    }`}
                            >
                                {option.label}
                            </Text>
                        )}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

/**
 * FormQuantity - Numeric input with +/- buttons
 */
interface FormQuantityProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
}

export function FormQuantity({
    value,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    label,
}: FormQuantityProps) {
    const handleIncrement = () => {
        if (value + step <= max) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(value + step);
        }
    };

    const handleDecrement = () => {
        if (value - step >= min) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(value - step);
        }
    };

    return (
        <View className="mb-4">
            {label && (
                <Text className="text-text-secondary text-sm font-medium mb-2">
                    {label}
                </Text>
            )}
            <View className="flex-row items-center bg-surface rounded-xl">
                <TouchableOpacity
                    onPress={handleDecrement}
                    disabled={value <= min}
                    className={`w-12 h-12 items-center justify-center ${value <= min ? "opacity-30" : ""
                        }`}
                >
                    <Ionicons name="remove" size={20} color="#A3A3A3" />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                    <Text className="text-text-primary text-lg font-semibold">
                        {value}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={handleIncrement}
                    disabled={value >= max}
                    className={`w-12 h-12 items-center justify-center ${value >= max ? "opacity-30" : ""
                        }`}
                >
                    <Ionicons name="add" size={20} color="#3B82F6" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        justifyContent: "flex-end",
    },
    selectModal: {
        backgroundColor: "#1F1F1F",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "60%",
    },
    selectHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },
    selectTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#333333",
        justifyContent: "center",
        alignItems: "center",
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#2A2A2A",
    },
    optionItemSelected: {
        backgroundColor: "rgba(59, 130, 246, 0.1)",
    },
    optionLabel: {
        flex: 1,
        color: "#FFFFFF",
        fontSize: 16,
    },
    optionLabelSelected: {
        color: "#3B82F6",
        fontWeight: "500",
    },
});
