/**
 * Scanner Screen
 *
 * Full-screen barcode scanner modal.
 */
import React from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { BarcodeScanner } from "@/components/scanner";

export default function ScannerScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ returnTo?: string }>();

    const handleScan = (data: string, type: string) => {
        // Navigate back with scanned data
        if (params.returnTo) {
            router.replace({
                pathname: params.returnTo as any,
                params: { barcode: data, barcodeType: type },
            });
        } else {
            router.back();
        }
    };

    const handleClose = () => {
        router.back();
    };

    return (
        <BarcodeScanner
            onScan={handleScan}
            onClose={handleClose}
            title="Scan Product"
            description="Position the product barcode within the frame"
        />
    );
}
