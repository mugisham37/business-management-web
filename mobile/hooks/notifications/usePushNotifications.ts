/**
 * Push Notifications Hook
 *
 * Manages push notification permissions, registration, and handling.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { appStorage, STORAGE_KEYS } from "@/lib/storage";

// Configure notification behavior
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export interface PushNotificationState {
    token: string | null;
    isEnabled: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface NotificationData {
    type: string;
    id?: string;
    route?: string;
    [key: string]: any;
}

/**
 * Hook for managing push notifications
 */
export function usePushNotifications() {
    const router = useRouter();
    const [state, setState] = useState<PushNotificationState>({
        token: null,
        isEnabled: false,
        isLoading: true,
        error: null,
    });

    const notificationListener = useRef<Notifications.Subscription>();
    const responseListener = useRef<Notifications.Subscription>();

    /**
     * Register for push notifications
     */
    const registerForPushNotifications = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            // Check if physical device
            if (!Device.isDevice) {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    error: "Push notifications require a physical device",
                }));
                return null;
            }

            // Get existing permission status
            const { status: existingStatus } =
                await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            // Request permission if not already granted
            if (existingStatus !== "granted") {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== "granted") {
                setState((prev) => ({
                    ...prev,
                    isLoading: false,
                    isEnabled: false,
                    error: "Push notification permission denied",
                }));
                return null;
            }

            // Get push token
            const projectId =
                Constants.expoConfig?.extra?.eas?.projectId ??
                Constants.easConfig?.projectId;

            if (!projectId) {
                console.warn("No EAS project ID found");
            }

            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId,
            });

            const token = tokenData.data;

            // Store token
            appStorage.setString("pushToken", token);

            // Android-specific notification channel
            if (Platform.OS === "android") {
                await Notifications.setNotificationChannelAsync("default", {
                    name: "Default",
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#3B82F6",
                });

                await Notifications.setNotificationChannelAsync("orders", {
                    name: "Orders",
                    description: "New order notifications",
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: "#22C55E",
                });

                await Notifications.setNotificationChannelAsync("inventory", {
                    name: "Inventory",
                    description: "Stock alerts and inventory updates",
                    importance: Notifications.AndroidImportance.DEFAULT,
                    lightColor: "#F59E0B",
                });
            }

            setState({
                token,
                isEnabled: true,
                isLoading: false,
                error: null,
            });

            return token;
        } catch (error: any) {
            console.error("Push notification registration error:", error);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: error.message || "Failed to register for push notifications",
            }));
            return null;
        }
    }, []);

    /**
     * Handle notification received while app is in foreground
     */
    const handleNotificationReceived = useCallback(
        (notification: Notifications.Notification) => {
            const data = notification.request.content.data as NotificationData;
            console.log("Notification received:", data);

            // You can show in-app notification UI here
        },
        []
    );

    /**
     * Handle notification tap (user interaction)
     */
    const handleNotificationResponse = useCallback(
        (response: Notifications.NotificationResponse) => {
            const data = response.notification.request.content
                .data as NotificationData;
            console.log("Notification tapped:", data);

            // Navigate based on notification type
            if (data.route) {
                router.push(data.route as any);
            } else if (data.type) {
                switch (data.type) {
                    case "order":
                        if (data.id) router.push(`/(tabs)/pos?orderId=${data.id}`);
                        break;
                    case "inventory":
                        router.push("/(tabs)/inventory");
                        break;
                    case "customer":
                        if (data.id) router.push(`/(crm)/${data.id}`);
                        break;
                    case "employee":
                        if (data.id) router.push(`/(employee)/${data.id}`);
                        break;
                    default:
                        router.push("/(tabs)");
                }
            }
        },
        [router]
    );

    /**
     * Schedule a local notification
     */
    const scheduleNotification = useCallback(
        async (options: {
            title: string;
            body: string;
            data?: NotificationData;
            trigger?: Notifications.NotificationTriggerInput;
            channelId?: string;
        }) => {
            try {
                const id = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: options.title,
                        body: options.body,
                        data: options.data || {},
                        sound: true,
                    },
                    trigger: options.trigger || null, // null = immediate
                });
                return id;
            } catch (error) {
                console.error("Failed to schedule notification:", error);
                return null;
            }
        },
        []
    );

    /**
     * Cancel a scheduled notification
     */
    const cancelNotification = useCallback(async (notificationId: string) => {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    }, []);

    /**
     * Cancel all notifications
     */
    const cancelAllNotifications = useCallback(async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }, []);

    /**
     * Get badge count
     */
    const getBadgeCount = useCallback(async () => {
        return await Notifications.getBadgeCountAsync();
    }, []);

    /**
     * Set badge count
     */
    const setBadgeCount = useCallback(async (count: number) => {
        await Notifications.setBadgeCountAsync(count);
    }, []);

    // Setup listeners on mount
    useEffect(() => {
        // Register for notifications
        registerForPushNotifications();

        // Listen for notifications received while app is foregrounded
        notificationListener.current =
            Notifications.addNotificationReceivedListener(handleNotificationReceived);

        // Listen for notification taps
        responseListener.current =
            Notifications.addNotificationResponseReceivedListener(
                handleNotificationResponse
            );

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(
                    notificationListener.current
                );
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, [
        registerForPushNotifications,
        handleNotificationReceived,
        handleNotificationResponse,
    ]);

    return {
        ...state,
        registerForPushNotifications,
        scheduleNotification,
        cancelNotification,
        cancelAllNotifications,
        getBadgeCount,
        setBadgeCount,
    };
}

export default usePushNotifications;
