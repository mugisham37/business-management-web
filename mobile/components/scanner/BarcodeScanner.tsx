/**
 * Barcode Scanner Component
 *
 * Full-screen barcode scanner using expo-camera.
 * Supports multiple barcode formats and haptic feedback.
 */
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const { width, height } = Dimensions.get("window");
const SCAN_AREA_SIZE = width * 0.7;

interface BarcodeScannerProps {
    onScan: (data: string, type: string) => void;
    onClose?: () => void;
    title?: string;
    description?: string;
}

export function BarcodeScanner({
    onScan,
    onClose,
    title = "Scan Barcode",
    description = "Position the barcode within the frame",
}: BarcodeScannerProps) {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [flashEnabled, setFlashEnabled] = useState(false);

    const handleBarCodeScanned = useCallback(
        (result: BarcodeScanningResult) => {
            if (scanned) return;

            setScanned(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Delay to show visual feedback
            setTimeout(() => {
                onScan(result.data, result.type);
            }, 300);
        },
        [scanned, onScan]
    );

    const handleClose = () => {
        if (onClose) {
            onClose();
        } else {
            router.back();
        }
    };

    const toggleFlash = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFlashEnabled((prev) => !prev);
    };

    const handleRescan = () => {
        setScanned(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    // Permission not yet determined
    if (!permission) {
        return (
            <View style={styles.container}>
                <Text style={styles.permissionText}>Requesting camera permission...</Text>
            </View>
        );
    }

    // Permission denied
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Ionicons name="camera-outline" size={64} color="#737373" />
                <Text style={styles.permissionTitle}>Camera Access Required</Text>
                <Text style={styles.permissionText}>
                    We need camera access to scan barcodes
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFillObject}
                facing="back"
                enableTorch={flashEnabled}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        "qr",
                        "ean13",
                        "ean8",
                        "upc_a",
                        "upc_e",
                        "code39",
                        "code128",
                        "code93",
                        "codabar",
                        "itf14",
                        "pdf417",
                        "aztec",
                        "datamatrix",
                    ],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            />

            {/* Overlay */}
            <View style={styles.overlay}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.title}>{title}</Text>
                    </View>
                    <TouchableOpacity onPress={toggleFlash} style={styles.headerButton}>
                        <Ionicons
                            name={flashEnabled ? "flash" : "flash-outline"}
                            size={24}
                            color={flashEnabled ? "#FBBF24" : "#FFFFFF"}
                        />
                    </TouchableOpacity>
                </View>

                {/* Scan Area */}
                <View style={styles.scanAreaContainer}>
                    <View
                        style={[
                            styles.scanArea,
                            scanned && styles.scanAreaSuccess,
                        ]}
                    >
                        {/* Corner indicators */}
                        <View style={[styles.corner, styles.cornerTopLeft]} />
                        <View style={[styles.corner, styles.cornerTopRight]} />
                        <View style={[styles.corner, styles.cornerBottomLeft]} />
                        <View style={[styles.corner, styles.cornerBottomRight]} />

                        {/* Scan line animation would go here */}
                        {!scanned && <View style={styles.scanLine} />}
                    </View>
                </View>

                {/* Description */}
                <View style={styles.footer}>
                    <Text style={styles.description}>{description}</Text>

                    {scanned && (
                        <TouchableOpacity style={styles.rescanButton} onPress={handleRescan}>
                            <Ionicons name="refresh" size={20} color="#FFFFFF" />
                            <Text style={styles.rescanText}>Tap to Scan Again</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: 60,
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    headerButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flex: 1,
        alignItems: "center",
    },
    title: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "600",
    },
    scanAreaContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    scanArea: {
        width: SCAN_AREA_SIZE,
        height: SCAN_AREA_SIZE,
        backgroundColor: "transparent",
        borderRadius: 16,
        position: "relative",
        overflow: "hidden",
    },
    scanAreaSuccess: {
        borderColor: "#22C55E",
        borderWidth: 2,
    },
    corner: {
        position: "absolute",
        width: 32,
        height: 32,
        borderColor: "#3B82F6",
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 16,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 16,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 16,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 16,
    },
    scanLine: {
        position: "absolute",
        top: "50%",
        left: 16,
        right: 16,
        height: 2,
        backgroundColor: "#3B82F6",
        opacity: 0.8,
    },
    footer: {
        paddingHorizontal: 32,
        paddingBottom: 80,
        alignItems: "center",
    },
    description: {
        color: "#A3A3A3",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    rescanButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(59, 130, 246, 0.3)",
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    rescanText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 8,
    },
    permissionTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "600",
        marginTop: 24,
        marginBottom: 8,
    },
    permissionText: {
        color: "#A3A3A3",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    permissionButton: {
        backgroundColor: "#3B82F6",
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
    },
    permissionButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    cancelButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
    },
    cancelButtonText: {
        color: "#A3A3A3",
        fontSize: 16,
    },
});

export default BarcodeScanner;
