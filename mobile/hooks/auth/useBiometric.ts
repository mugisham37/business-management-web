/**
 * useBiometric Hook
 *
 * Manages biometric authentication (Face ID, Touch ID, Fingerprint).
 */
import { useState, useCallback, useEffect } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { secureStorage, preferences } from "@/lib/storage";

export type BiometricType = "fingerprint" | "facial" | "iris" | "none";

interface BiometricState {
    isAvailable: boolean;
    biometricType: BiometricType;
    isEnabled: boolean;
    isLoading: boolean;
}

export function useBiometric() {
    const [state, setState] = useState<BiometricState>({
        isAvailable: false,
        biometricType: "none",
        isLoading: true,
        isEnabled: preferences.isBiometricEnabled(),
    });

    /**
     * Check biometric availability
     */
    const checkAvailability = useCallback(async () => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            const supportedTypes =
                await LocalAuthentication.supportedAuthenticationTypesAsync();

            let biometricType: BiometricType = "none";

            if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
                biometricType = "facial";
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
                biometricType = "fingerprint";
            } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
                biometricType = "iris";
            }

            setState((prev) => ({
                ...prev,
                isAvailable: hasHardware && isEnrolled,
                biometricType,
                isLoading: false,
            }));
        } catch (error) {
            console.error("Biometric check error:", error);
            setState((prev) => ({
                ...prev,
                isAvailable: false,
                biometricType: "none",
                isLoading: false,
            }));
        }
    }, []);

    /**
     * Authenticate with biometrics
     */
    const authenticate = useCallback(
        async (
            reason: string = "Authenticate to continue"
        ): Promise<{ success: boolean; error?: string }> => {
            if (!state.isAvailable) {
                return { success: false, error: "Biometric authentication not available" };
            }

            try {
                const result = await LocalAuthentication.authenticateAsync({
                    promptMessage: reason,
                    fallbackLabel: "Use passcode",
                    disableDeviceFallback: false,
                    cancelLabel: "Cancel",
                });

                if (result.success) {
                    return { success: true };
                }

                if (result.error === "user_cancel") {
                    return { success: false, error: "Authentication cancelled" };
                }

                return { success: false, error: result.error || "Authentication failed" };
            } catch (error: any) {
                return { success: false, error: error.message || "Authentication error" };
            }
        },
        [state.isAvailable]
    );

    /**
     * Enable biometric authentication
     */
    const enableBiometric = useCallback(async (): Promise<boolean> => {
        if (!state.isAvailable) return false;

        // Verify user can authenticate before enabling
        const result = await authenticate("Verify your identity to enable biometric login");

        if (result.success) {
            preferences.setBiometricEnabled(true);
            setState((prev) => ({ ...prev, isEnabled: true }));
            return true;
        }

        return false;
    }, [state.isAvailable, authenticate]);

    /**
     * Disable biometric authentication
     */
    const disableBiometric = useCallback(() => {
        preferences.setBiometricEnabled(false);
        setState((prev) => ({ ...prev, isEnabled: false }));
    }, []);

    /**
     * Perform biometric login (if enabled)
     */
    const biometricLogin = useCallback(
        async (): Promise<{ success: boolean; error?: string }> => {
            if (!state.isEnabled || !state.isAvailable) {
                return { success: false, error: "Biometric login not enabled" };
            }

            return authenticate("Login with biometrics");
        },
        [state.isEnabled, state.isAvailable, authenticate]
    );

    /**
     * Get display name for biometric type
     */
    const getBiometricName = useCallback(() => {
        switch (state.biometricType) {
            case "facial":
                return "Face ID";
            case "fingerprint":
                return "Fingerprint";
            case "iris":
                return "Iris";
            default:
                return "Biometric";
        }
    }, [state.biometricType]);

    // Check availability on mount
    useEffect(() => {
        checkAvailability();
    }, [checkAvailability]);

    return {
        ...state,
        authenticate,
        enableBiometric,
        disableBiometric,
        biometricLogin,
        getBiometricName,
        refresh: checkAvailability,
    };
}
