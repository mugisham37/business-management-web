/**
 * Confirmation Dialog Component
 *
 * Simple modal dialog for confirmations and alerts.
 */
import React from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

type DialogVariant = "default" | "danger" | "success" | "warning";

interface DialogAction {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "danger";
}

interface ConfirmDialogProps {
    visible: boolean;
    onClose: () => void;
    title: string;
    message?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    variant?: DialogVariant;
    actions?: DialogAction[];
}

const variantColors: Record<DialogVariant, string> = {
    default: "#3B82F6",
    danger: "#EF4444",
    success: "#22C55E",
    warning: "#F59E0B",
};

export function ConfirmDialog({
    visible,
    onClose,
    title,
    message,
    icon,
    variant = "default",
    actions = [
        { label: "Cancel", onPress: onClose, variant: "secondary" },
        { label: "Confirm", onPress: onClose, variant: "primary" },
    ],
}: ConfirmDialogProps) {
    const handleAction = (action: DialogAction) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action.onPress();
    };

    const color = variantColors[variant];

    const getButtonStyle = (buttonVariant?: "primary" | "secondary" | "danger") => {
        switch (buttonVariant) {
            case "primary":
                return { backgroundColor: color };
            case "danger":
                return { backgroundColor: "#EF4444" };
            case "secondary":
            default:
                return { backgroundColor: "#333333" };
        }
    };

    const getButtonTextStyle = (buttonVariant?: "primary" | "secondary" | "danger") => {
        switch (buttonVariant) {
            case "primary":
            case "danger":
                return { color: "#FFFFFF" };
            case "secondary":
            default:
                return { color: "#A3A3A3" };
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.dialog} onPress={() => { }}>
                    {/* Icon */}
                    {icon && (
                        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
                            <Ionicons name={icon} size={28} color={color} />
                        </View>
                    )}

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Message */}
                    {message && <Text style={styles.message}>{message}</Text>}

                    {/* Actions */}
                    <View style={styles.actions}>
                        {actions.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.button,
                                    getButtonStyle(action.variant),
                                    actions.length > 1 && { flex: 1 },
                                ]}
                                onPress={() => handleAction(action)}
                            >
                                <Text style={[styles.buttonText, getButtonTextStyle(action.variant)]}>
                                    {action.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 32,
    },
    dialog: {
        width: "100%",
        maxWidth: 320,
        backgroundColor: "#1F1F1F",
        borderRadius: 20,
        padding: 24,
        alignItems: "center",
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 8,
    },
    message: {
        color: "#A3A3A3",
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 24,
    },
    actions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
    },
    button: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        fontSize: 15,
        fontWeight: "600",
    },
});

export default ConfirmDialog;
