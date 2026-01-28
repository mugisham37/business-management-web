/**
 * Secure Storage Utility
 *
 * Provides encrypted storage for sensitive data using react-native-keychain
 * and fast storage for non-sensitive data using MMKV.
 */
import * as Keychain from "react-native-keychain";
import { MMKV } from "react-native-mmkv";

// MMKV instance for fast, non-sensitive storage
export const storage = new MMKV({
    id: "enterprise-bms-storage",
});

// Storage keys
export const STORAGE_KEYS = {
    // Authentication
    ACCESS_TOKEN: "auth.accessToken",
    REFRESH_TOKEN: "auth.refreshToken",
    USER_ID: "auth.userId",
    TENANT_ID: "auth.tenantId",

    // Preferences
    THEME: "preferences.theme",
    BIOMETRIC_ENABLED: "preferences.biometricEnabled",
    LANGUAGE: "preferences.language",
    NOTIFICATIONS_ENABLED: "preferences.notificationsEnabled",

    // Cache
    LAST_SYNC: "cache.lastSync",
    OFFLINE_QUEUE: "cache.offlineQueue",
    APOLLO_CACHE: "cache.apollo",
} as const;

/**
 * Secure storage for sensitive credentials (tokens, passwords)
 * Uses react-native-keychain with biometric protection
 */
export const secureStorage = {
    /**
     * Store tokens securely in the device keychain
     */
    async setTokens(accessToken: string, refreshToken: string): Promise<boolean> {
        try {
            await Keychain.setGenericPassword(
                STORAGE_KEYS.ACCESS_TOKEN,
                JSON.stringify({ accessToken, refreshToken }),
                {
                    service: "enterprise-bms-auth",
                    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
                }
            );
            return true;
        } catch (error) {
            console.error("Failed to store tokens:", error);
            return false;
        }
    },

    /**
     * Retrieve tokens from secure storage
     */
    async getTokens(): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        try {
            const credentials = await Keychain.getGenericPassword({
                service: "enterprise-bms-auth",
            });
            if (credentials && credentials.password) {
                return JSON.parse(credentials.password);
            }
            return null;
        } catch (error) {
            console.error("Failed to retrieve tokens:", error);
            return null;
        }
    },

    /**
     * Clear all secure credentials (logout)
     */
    async clearTokens(): Promise<boolean> {
        try {
            await Keychain.resetGenericPassword({ service: "enterprise-bms-auth" });
            return true;
        } catch (error) {
            console.error("Failed to clear tokens:", error);
            return false;
        }
    },

    /**
     * Check if biometric authentication is available
     */
    async isBiometricAvailable(): Promise<boolean> {
        try {
            const biometryType = await Keychain.getSupportedBiometryType();
            return biometryType !== null;
        } catch (error) {
            return false;
        }
    },

    /**
     * Store a value with biometric protection
     */
    async setWithBiometric(
        key: string,
        value: string
    ): Promise<boolean> {
        try {
            await Keychain.setGenericPassword(key, value, {
                service: `enterprise-bms-biometric-${key}`,
                accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
                accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
            });
            return true;
        } catch (error) {
            console.error("Failed to store with biometric:", error);
            return false;
        }
    },
};

/**
 * Fast storage for non-sensitive app data
 * Uses MMKV for synchronous, fast operations
 */
export const appStorage = {
    // String operations
    getString(key: string): string | undefined {
        return storage.getString(key);
    },

    setString(key: string, value: string): void {
        storage.set(key, value);
    },

    // Number operations
    getNumber(key: string): number | undefined {
        return storage.getNumber(key);
    },

    setNumber(key: string, value: number): void {
        storage.set(key, value);
    },

    // Boolean operations
    getBoolean(key: string): boolean | undefined {
        return storage.getBoolean(key);
    },

    setBoolean(key: string, value: boolean): void {
        storage.set(key, value);
    },

    // Object operations (JSON serialized)
    getObject<T>(key: string): T | undefined {
        const value = storage.getString(key);
        if (value) {
            try {
                return JSON.parse(value) as T;
            } catch {
                return undefined;
            }
        }
        return undefined;
    },

    setObject<T>(key: string, value: T): void {
        storage.set(key, JSON.stringify(value));
    },

    // Delete and clear
    delete(key: string): void {
        storage.delete(key);
    },

    clear(): void {
        storage.clearAll();
    },

    // Check if key exists
    contains(key: string): boolean {
        return storage.contains(key);
    },

    // Get all keys
    getAllKeys(): string[] {
        return storage.getAllKeys();
    },
};

/**
 * User preferences with typed access
 */
export const preferences = {
    getTheme(): "light" | "dark" | "system" {
        return (appStorage.getString(STORAGE_KEYS.THEME) as any) || "dark";
    },

    setTheme(theme: "light" | "dark" | "system"): void {
        appStorage.setString(STORAGE_KEYS.THEME, theme);
    },

    isBiometricEnabled(): boolean {
        return appStorage.getBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED) ?? false;
    },

    setBiometricEnabled(enabled: boolean): void {
        appStorage.setBoolean(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled);
    },

    getLanguage(): string {
        return appStorage.getString(STORAGE_KEYS.LANGUAGE) || "en";
    },

    setLanguage(language: string): void {
        appStorage.setString(STORAGE_KEYS.LANGUAGE, language);
    },

    isNotificationsEnabled(): boolean {
        return appStorage.getBoolean(STORAGE_KEYS.NOTIFICATIONS_ENABLED) ?? true;
    },

    setNotificationsEnabled(enabled: boolean): void {
        appStorage.setBoolean(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled);
    },
};
