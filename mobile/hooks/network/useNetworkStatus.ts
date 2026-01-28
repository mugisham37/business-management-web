/**
 * Use Network Status Hook
 *
 * Monitors network connectivity status.
 */
import { useState, useEffect, useCallback } from "react";
import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { appStorage } from "@/lib/storage";

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean | null;
    type: string;
    isWifi: boolean;
    isCellular: boolean;
}

/**
 * Hook for monitoring network connectivity
 */
export function useNetworkStatus() {
    const [status, setStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: null,
        type: "unknown",
        isWifi: false,
        isCellular: false,
    });

    const updateStatus = useCallback((state: NetInfoState) => {
        const newStatus: NetworkStatus = {
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable,
            type: state.type,
            isWifi: state.type === "wifi",
            isCellular: state.type === "cellular",
        };

        setStatus(newStatus);

        // Store offline status for offline-first operations
        appStorage.setBoolean("isOnline", state.isConnected ?? false);
    }, []);

    useEffect(() => {
        // Get initial state
        NetInfo.fetch().then(updateStatus);

        // Subscribe to changes
        const unsubscribe = NetInfo.addEventListener(updateStatus);

        return () => {
            unsubscribe();
        };
    }, [updateStatus]);

    return status;
}

export default useNetworkStatus;
