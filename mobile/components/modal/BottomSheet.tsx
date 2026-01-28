/**
 * Bottom Sheet Component
 *
 * Reusable bottom sheet modal with gesture handling and snap points.
 */
import React, { useCallback, useRef, useEffect } from "react";
import {
    View,
    Text,
    Modal,
    Pressable,
    Animated,
    PanResponder,
    Dimensions,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    snapPoints?: number[]; // Percentages of screen height
    initialSnap?: number;
    children: React.ReactNode;
    showHandle?: boolean;
}

export function BottomSheet({
    visible,
    onClose,
    title,
    snapPoints = [0.5, 0.9],
    initialSnap = 0,
    children,
    showHandle = true,
}: BottomSheetProps) {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const currentSnapIndex = useRef(initialSnap);

    const getSnapHeight = (index: number) => {
        return SCREEN_HEIGHT * (1 - snapPoints[index]);
    };

    const animateToSnap = useCallback(
        (index: number) => {
            const targetY = getSnapHeight(index);
            currentSnapIndex.current = index;

            Animated.spring(translateY, {
                toValue: targetY,
                useNativeDriver: true,
                damping: 50,
                stiffness: 300,
            }).start();
        },
        [translateY, snapPoints]
    );

    const close = useCallback(() => {
        Animated.timing(translateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onClose();
        });
    }, [translateY, onClose]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dy) > 5;
            },
            onPanResponderMove: (_, gestureState) => {
                const currentY = getSnapHeight(currentSnapIndex.current);
                const newY = currentY + gestureState.dy;
                if (newY >= 0) {
                    translateY.setValue(newY);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                const currentY = getSnapHeight(currentSnapIndex.current);
                const newY = currentY + gestureState.dy;

                // Close if dragged down past threshold
                if (gestureState.dy > 100 && gestureState.vy > 0.5) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    close();
                    return;
                }

                // Find closest snap point
                let closestSnap = 0;
                let minDistance = Infinity;

                snapPoints.forEach((_, index) => {
                    const snapY = getSnapHeight(index);
                    const distance = Math.abs(newY - snapY);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestSnap = index;
                    }
                });

                if (closestSnap !== currentSnapIndex.current) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                animateToSnap(closestSnap);
            },
        })
    ).current;

    useEffect(() => {
        if (visible) {
            animateToSnap(initialSnap);
        }
    }, [visible, animateToSnap, initialSnap]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={close}
        >
            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={close}>
                <Animated.View
                    style={[
                        styles.backdropOverlay,
                        {
                            opacity: translateY.interpolate({
                                inputRange: [0, SCREEN_HEIGHT],
                                outputRange: [1, 0],
                            }),
                        },
                    ]}
                />
            </Pressable>

            {/* Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY }],
                    },
                ]}
            >
                {/* Handle area */}
                <View {...panResponder.panHandlers} style={styles.handleContainer}>
                    {showHandle && <View style={styles.handle} />}

                    {/* Header */}
                    {title && (
                        <View style={styles.header}>
                            <Text style={styles.title}>{title}</Text>
                            <TouchableOpacity onPress={close} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color="#A3A3A3" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>{children}</View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: SCREEN_HEIGHT,
        backgroundColor: "#1F1F1F",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    handleContainer: {
        alignItems: "center",
        paddingTop: 12,
        paddingHorizontal: 16,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: "#525252",
        borderRadius: 2,
    },
    header: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#333333",
    },
    title: {
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
    content: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
});

export default BottomSheet;
