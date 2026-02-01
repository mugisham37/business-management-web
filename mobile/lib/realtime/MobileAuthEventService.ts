/**
 * Mobile Authentication Event Service
 * Manages real-time authentication events using GraphQL subscriptions for mobile
 */

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import * as Notifications from 'expo-notifications';
import {
    SECURITY_EVENTS_SUBSCRIPTION,
    AUTH_EVENTS_SUBSCRIPTION,
    PERMISSION_CHANGES_SUBSCRIPTION,
    SECURITY_ALERTS_SUBSCRIPTION,
    MFA_EVENTS_SUBSCRIPTION,
    SESSION_EVENTS_SUBSCRIPTION,
    TIER_CHANGES_SUBSCRIPTION,
    PAYMENT_EVENTS_SUBSCRIPTION,
    DEVICE_TRUST_EVENTS_SUBSCRIPTION,
    ONBOARDING_PROGRESS_SUBSCRIPTION,
    SESSION_LIMIT_EVENTS_SUBSCRIPTION,
    PUSH_NOTIFICATION_EVENTS_SUBSCRIPTION,
    BIOMETRIC_AUTH_EVENTS_SUBSCRIPTION,
    DEEP_LINK_EVENTS_SUBSCRIPTION
} from '@/graphql/subscriptions/auth-subscriptions';

export interface MobileAuthEvent {
    type: string;
    userId: string;
    sessionId?: string;
    deviceInfo?: {
        deviceId: string;
        platform: string;
        deviceName: string;
        fingerprint: string;
    };
    ipAddress?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface PushNotificationEvent {
    type: string;
    userId: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    timestamp: string;
    priority: 'low' | 'normal' | 'high';
    category?: string;
}

export interface BiometricAuthEvent {
    type: string;
    userId: string;
    deviceId: string;
    biometricType: 'fingerprint' | 'face' | 'voice';
    success: boolean;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface DeepLinkEvent {
    type: string;
    userId: string;
    url: string;
    handled: boolean;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface MobileEventHandler<T> {
    (event: T): void;
}

// Subscription callback data types
interface SubscriptionCallbackData<T> {
    data?: T;
}

interface SecurityEventsData {
    securityEvents: MobileAuthEvent;
}

interface AuthEventsData {
    authEvents: MobileAuthEvent;
}

interface PermissionChangesData {
    permissionChanges: Record<string, unknown>;
}

interface SecurityAlertsData {
    securityAlerts: MobileAuthEvent;
}

interface MfaEventsData {
    mfaEvents: MobileAuthEvent;
}

interface SessionEventsData {
    sessionEvents: MobileAuthEvent;
}

interface TierChangesData {
    tierChanges: Record<string, unknown>;
}

interface PaymentEventsData {
    paymentEvents: Record<string, unknown>;
}

interface DeviceTrustEventsData {
    deviceTrustEvents: Record<string, unknown>;
}

interface PushNotificationEventsData {
    pushNotificationEvents: PushNotificationEvent;
}

interface BiometricAuthEventsData {
    biometricAuthEvents: BiometricAuthEvent;
}

interface DeepLinkEventsData {
    deepLinkEvents: DeepLinkEvent;
}

interface OnboardingProgressData {
    onboardingProgress: Record<string, unknown>;
}

interface SessionLimitEventsData {
    sessionLimitEvents: Record<string, unknown>;
}

// Type alias for Apollo Client to handle generic resolution issues
type ApolloClientInstance = ApolloClient<NormalizedCacheObject>;

export class MobileAuthEventService {
    private apolloClient: ApolloClientInstance;
    private subscriptions: Map<string, { unsubscribe: () => void }> = new Map();
    private eventHandlers: Map<string, MobileEventHandler<unknown>[]> = new Map();
    private userId: string | null = null;

    constructor(apolloClient: ApolloClientInstance) {
        this.apolloClient = apolloClient;
        this.setupNotificationHandlers();
    }

    /**
     * Initialize the service with user ID
     */
    initialize(userId: string): void {
        this.userId = userId;
        this.subscribeToSecurityEvents();
    }

    /**
     * Setup push notification handlers
     */
    private setupNotificationHandlers(): void {
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // Handle notification responses
        Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data as Record<string, unknown> | undefined;
            if (data?.type === 'auth_event') {
                this.handleAuthNotification(data);
            }
        });
    }

    /**
     * Subscribe to security events for current user
     */
    private subscribeToSecurityEvents(): void {
        if (!this.userId) return;

        const subscriptionKey = 'security_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<SecurityEventsData>({
                query: SECURITY_EVENTS_SUBSCRIPTION,
                variables: { userId: this.userId }
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<SecurityEventsData>) => {
                    if (data?.securityEvents) {
                        this.notifyHandlers('security_events', data.securityEvents);
                        this.handleSecurityEvent(data.securityEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Security events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }
    }

    /**
     * Subscribe to authentication events
     */
    subscribeToAuthEvents(handler: MobileEventHandler<MobileAuthEvent>): () => void {
        const subscriptionKey = 'auth_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<AuthEventsData>({
                query: AUTH_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<AuthEventsData>) => {
                    if (data?.authEvents) {
                        this.notifyHandlers('auth_events', data.authEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Auth events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('auth_events', handler);

        return () => {
            this.removeEventHandler('auth_events', handler);
            if (this.getHandlerCount('auth_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to permission changes
     */
    subscribeToPermissionChanges(handler: MobileEventHandler<Record<string, unknown>>): () => void {
        const subscriptionKey = 'permission_changes';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<PermissionChangesData>({
                query: PERMISSION_CHANGES_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<PermissionChangesData>) => {
                    if (data?.permissionChanges) {
                        this.notifyHandlers('permission_changes', data.permissionChanges);
                        this.handlePermissionChange(data.permissionChanges);
                    }
                },
                error: (error: Error) => {
                    console.error('Permission changes subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('permission_changes', handler);

        return () => {
            this.removeEventHandler('permission_changes', handler);
            if (this.getHandlerCount('permission_changes') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to security alerts
     */
    subscribeToSecurityAlerts(handler: MobileEventHandler<any>): () => void {
        const subscriptionKey = 'security_alerts';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<SecurityAlertsData>({
                query: SECURITY_ALERTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<SecurityAlertsData>) => {
                    if (data?.securityAlerts) {
                        this.notifyHandlers('security_alerts', data.securityAlerts);
                        this.handleSecurityAlert(data.securityAlerts);
                    }
                },
                error: (error: Error) => {
                    console.error('Security alerts subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('security_alerts', handler);

        return () => {
            this.removeEventHandler('security_alerts', handler);
            if (this.getHandlerCount('security_alerts') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to MFA events
     */
    subscribeToMfaEvents(handler: MobileEventHandler<MobileAuthEvent>): () => void {
        const subscriptionKey = 'mfa_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<MfaEventsData>({
                query: MFA_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<MfaEventsData>) => {
                    if (data?.mfaEvents) {
                        this.notifyHandlers('mfa_events', data.mfaEvents);
                        this.handleMfaEvent(data.mfaEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('MFA events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('mfa_events', handler);

        return () => {
            this.removeEventHandler('mfa_events', handler);
            if (this.getHandlerCount('mfa_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to session events
     */
    subscribeToSessionEvents(handler: MobileEventHandler<MobileAuthEvent>): () => void {
        const subscriptionKey = 'session_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<SessionEventsData>({
                query: SESSION_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<SessionEventsData>) => {
                    if (data?.sessionEvents) {
                        this.notifyHandlers('session_events', data.sessionEvents);
                        this.handleSessionEvent(data.sessionEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Session events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('session_events', handler);

        return () => {
            this.removeEventHandler('session_events', handler);
            if (this.getHandlerCount('session_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to tier changes
     */
    subscribeToTierChanges(handler: MobileEventHandler<any>): () => void {
        const subscriptionKey = 'tier_changes';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<TierChangesData>({
                query: TIER_CHANGES_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<TierChangesData>) => {
                    if (data?.tierChanges) {
                        this.notifyHandlers('tier_changes', data.tierChanges);
                        this.handleTierChange(data.tierChanges);
                    }
                },
                error: (error: Error) => {
                    console.error('Tier changes subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('tier_changes', handler);

        return () => {
            this.removeEventHandler('tier_changes', handler);
            if (this.getHandlerCount('tier_changes') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to payment events
     */
    subscribeToPaymentEvents(handler: MobileEventHandler<any>): () => void {
        const subscriptionKey = 'payment_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<PaymentEventsData>({
                query: PAYMENT_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<PaymentEventsData>) => {
                    if (data?.paymentEvents) {
                        this.notifyHandlers('payment_events', data.paymentEvents);
                        this.handlePaymentEvent(data.paymentEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Payment events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('payment_events', handler);

        return () => {
            this.removeEventHandler('payment_events', handler);
            if (this.getHandlerCount('payment_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to device trust events
     */
    subscribeToDeviceTrustEvents(handler: MobileEventHandler<any>): () => void {
        const subscriptionKey = 'device_trust_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<DeviceTrustEventsData>({
                query: DEVICE_TRUST_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<DeviceTrustEventsData>) => {
                    if (data?.deviceTrustEvents) {
                        this.notifyHandlers('device_trust_events', data.deviceTrustEvents);
                        this.handleDeviceTrustEvent(data.deviceTrustEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Device trust events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('device_trust_events', handler);

        return () => {
            this.removeEventHandler('device_trust_events', handler);
            if (this.getHandlerCount('device_trust_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to push notification events
     */
    subscribeToPushNotificationEvents(handler: MobileEventHandler<PushNotificationEvent>): () => void {
        const subscriptionKey = 'push_notification_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<PushNotificationEventsData>({
                query: PUSH_NOTIFICATION_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<PushNotificationEventsData>) => {
                    if (data?.pushNotificationEvents) {
                        this.notifyHandlers('push_notification_events', data.pushNotificationEvents);
                        this.handlePushNotificationEvent(data.pushNotificationEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Push notification events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('push_notification_events', handler);

        return () => {
            this.removeEventHandler('push_notification_events', handler);
            if (this.getHandlerCount('push_notification_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to biometric authentication events
     */
    subscribeToBiometricAuthEvents(handler: MobileEventHandler<BiometricAuthEvent>): () => void {
        const subscriptionKey = 'biometric_auth_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<BiometricAuthEventsData>({
                query: BIOMETRIC_AUTH_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<BiometricAuthEventsData>) => {
                    if (data?.biometricAuthEvents) {
                        this.notifyHandlers('biometric_auth_events', data.biometricAuthEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Biometric auth events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('biometric_auth_events', handler);

        return () => {
            this.removeEventHandler('biometric_auth_events', handler);
            if (this.getHandlerCount('biometric_auth_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to deep link events
     */
    subscribeToDeepLinkEvents(handler: MobileEventHandler<DeepLinkEvent>): () => void {
        const subscriptionKey = 'deep_link_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe<DeepLinkEventsData>({
                query: DEEP_LINK_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }: SubscriptionCallbackData<DeepLinkEventsData>) => {
                    if (data?.deepLinkEvents) {
                        this.notifyHandlers('deep_link_events', data.deepLinkEvents);
                    }
                },
                error: (error: Error) => {
                    console.error('Deep link events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('deep_link_events', handler);

        return () => {
            this.removeEventHandler('deep_link_events', handler);
            if (this.getHandlerCount('deep_link_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Event handlers for mobile-specific actions
     */
    private handleSecurityEvent(event: MobileAuthEvent): void {
        if (event.severity === 'high' || event.severity === 'critical') {
            this.sendLocalNotification(
                'Security Alert',
                `Security event detected: ${event.type}`,
                { type: 'security_event', event }
            );
        }
    }

    private handleSecurityAlert(alert: any): void {
        this.sendLocalNotification(
            'Security Alert',
            alert.description,
            { type: 'security_alert', alert }
        );
    }

    private handlePermissionChange(change: any): void {
        if (change.type === 'granted') {
            this.sendLocalNotification(
                'Permission Granted',
                `You have been granted ${change.permission} permission`,
                { type: 'permission_change', change }
            );
        } else if (change.type === 'revoked') {
            this.sendLocalNotification(
                'Permission Revoked',
                `Your ${change.permission} permission has been revoked`,
                { type: 'permission_change', change }
            );
        }
    }

    private handleMfaEvent(event: MobileAuthEvent): void {
        if (event.type === 'mfa_enabled') {
            this.sendLocalNotification(
                'MFA Enabled',
                'Multi-factor authentication has been enabled for your account',
                { type: 'mfa_event', event }
            );
        } else if (event.type === 'mfa_disabled') {
            this.sendLocalNotification(
                'MFA Disabled',
                'Multi-factor authentication has been disabled for your account',
                { type: 'mfa_event', event }
            );
        }
    }

    private handleSessionEvent(event: MobileAuthEvent): void {
        if (event.type === 'session_terminated') {
            this.sendLocalNotification(
                'Session Terminated',
                'Your session has been terminated',
                { type: 'session_event', event }
            );
        } else if (event.type === 'new_device_login') {
            this.sendLocalNotification(
                'New Device Login',
                'A new device has logged into your account',
                { type: 'session_event', event }
            );
        }
    }

    private handleTierChange(change: any): void {
        if (change.type === 'upgrade') {
            this.sendLocalNotification(
                'Tier Upgraded',
                `Your account has been upgraded to ${change.newTier}`,
                { type: 'tier_change', change }
            );
        } else if (change.type === 'downgrade') {
            this.sendLocalNotification(
                'Tier Downgraded',
                `Your account has been downgraded to ${change.newTier}`,
                { type: 'tier_change', change }
            );
        }
    }

    private handlePaymentEvent(event: any): void {
        if (event.status === 'succeeded') {
            this.sendLocalNotification(
                'Payment Successful',
                `Your payment of ${event.amount} ${event.currency} was successful`,
                { type: 'payment_event', event }
            );
        } else if (event.status === 'failed') {
            this.sendLocalNotification(
                'Payment Failed',
                'Your payment failed. Please update your payment method.',
                { type: 'payment_event', event }
            );
        }
    }

    private handleDeviceTrustEvent(event: any): void {
        if (event.type === 'device_trusted') {
            this.sendLocalNotification(
                'Device Trusted',
                'This device has been marked as trusted',
                { type: 'device_trust_event', event }
            );
        } else if (event.type === 'device_untrusted') {
            this.sendLocalNotification(
                'Device Untrusted',
                'This device has been marked as untrusted',
                { type: 'device_trust_event', event }
            );
        }
    }

    private handlePushNotificationEvent(event: PushNotificationEvent): void {
        this.sendLocalNotification(
            event.title,
            event.body,
            event.data
        );
    }

    private handleAuthNotification(data: any): void {
        // Handle notification tap/response
        console.log('Auth notification tapped:', data);
    }

    /**
     * Send local notification
     */
    private async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title,
                    body,
                    data,
                    sound: true,
                },
                trigger: null, // Show immediately
            });
        } catch (error) {
            console.error('Failed to send local notification:', error);
        }
    }

    /**
     * Cleanup and unsubscribe from all events
     */
    cleanup(): void {
        this.subscriptions.forEach((subscription, key) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
        this.eventHandlers.clear();
        this.userId = null;
    }

    /**
     * Private helper methods
     */
    private addEventHandler(eventType: string, handler: MobileEventHandler<any>): void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType)!.push(handler);
    }

    private removeEventHandler(eventType: string, handler: MobileEventHandler<any>): void {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    private getHandlerCount(eventType: string): number {
        return this.eventHandlers.get(eventType)?.length || 0;
    }

    private notifyHandlers(eventType: string, event: any): void {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                } catch (error) {
                    console.error(`Error in event handler for ${eventType}:`, error);
                }
            });
        }
    }

    private unsubscribe(subscriptionKey: string): void {
        const subscription = this.subscriptions.get(subscriptionKey);
        if (subscription) {
            subscription.unsubscribe();
            this.subscriptions.delete(subscriptionKey);
        }
    }
}