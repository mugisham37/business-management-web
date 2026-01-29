/**
 * Authentication Event Subscription Service
 * Manages real-time authentication events using GraphQL subscriptions
 */

import { ApolloClient, Observable } from '@apollo/client';
import {
    AUTH_EVENTS_SUBSCRIPTION,
    PERMISSION_CHANGES_SUBSCRIPTION,
    TENANT_AUTH_EVENTS_SUBSCRIPTION,
    SECURITY_ALERTS_SUBSCRIPTION,
    MFA_EVENTS_SUBSCRIPTION,
    SESSION_EVENTS_SUBSCRIPTION,
    ROLE_ASSIGNMENT_EVENTS_SUBSCRIPTION,
    USER_EVENTS_SUBSCRIPTION,
    TIER_CHANGES_SUBSCRIPTION,
    PAYMENT_EVENTS_SUBSCRIPTION,
    DEVICE_TRUST_EVENTS_SUBSCRIPTION,
    ONBOARDING_PROGRESS_SUBSCRIPTION,
    IP_RESTRICTION_EVENTS_SUBSCRIPTION,
    SESSION_LIMIT_EVENTS_SUBSCRIPTION,
    PASSWORD_POLICY_EVENTS_SUBSCRIPTION
} from '@/graphql/subscriptions/auth-subscriptions';

export interface AuthEvent {
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
    metadata?: any;
    severity?: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityAlert {
    id: string;
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userId: string;
    sessionId?: string;
    deviceInfo?: any;
    ipAddress?: string;
    timestamp: string;
    description: string;
    metadata?: any;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}

export interface PermissionChange {
    type: 'granted' | 'revoked' | 'role_assigned' | 'role_removed';
    userId: string;
    permission?: string;
    resource?: string;
    resourceId?: string;
    grantedBy: string;
    timestamp: string;
    metadata?: any;
}

export interface TierChange {
    type: 'upgrade' | 'downgrade' | 'trial_started' | 'trial_ended';
    userId: string;
    oldTier: string;
    newTier: string;
    timestamp: string;
    reason: string;
    activatedFeatures: string[];
    deactivatedFeatures: string[];
    subscription?: any;
}

export interface EventHandler<T> {
    (event: T): void;
}

export class AuthEventSubscriptionService {
    private apolloClient: ApolloClient<any>;
    private subscriptions: Map<string, any> = new Map();
    private eventHandlers: Map<string, EventHandler<any>[]> = new Map();

    constructor(apolloClient: ApolloClient<any>) {
        this.apolloClient = apolloClient;
    }

    /**
     * Subscribe to authentication events for current user
     */
    subscribeToAuthEvents(handler: EventHandler<AuthEvent>): () => void {
        const subscriptionKey = 'auth_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: AUTH_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.authEvents) {
                        this.notifyHandlers('auth_events', data.authEvents);
                    }
                },
                error: (error) => {
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
     * Subscribe to permission changes for current user
     */
    subscribeToPermissionChanges(handler: EventHandler<PermissionChange>): () => void {
        const subscriptionKey = 'permission_changes';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: PERMISSION_CHANGES_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.permissionChanges) {
                        this.notifyHandlers('permission_changes', data.permissionChanges);
                    }
                },
                error: (error) => {
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
     * Subscribe to security alerts (admin only)
     */
    subscribeToSecurityAlerts(handler: EventHandler<SecurityAlert>): () => void {
        const subscriptionKey = 'security_alerts';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: SECURITY_ALERTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.securityAlerts) {
                        this.notifyHandlers('security_alerts', data.securityAlerts);
                    }
                },
                error: (error) => {
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
     * Subscribe to MFA events for current user
     */
    subscribeToMfaEvents(handler: EventHandler<AuthEvent>): () => void {
        const subscriptionKey = 'mfa_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: MFA_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.mfaEvents) {
                        this.notifyHandlers('mfa_events', data.mfaEvents);
                    }
                },
                error: (error) => {
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
     * Subscribe to session events for current user
     */
    subscribeToSessionEvents(handler: EventHandler<AuthEvent>): () => void {
        const subscriptionKey = 'session_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: SESSION_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.sessionEvents) {
                        this.notifyHandlers('session_events', data.sessionEvents);
                    }
                },
                error: (error) => {
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
     * Subscribe to tier changes for current user
     */
    subscribeToTierChanges(handler: EventHandler<TierChange>): () => void {
        const subscriptionKey = 'tier_changes';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: TIER_CHANGES_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.tierChanges) {
                        this.notifyHandlers('tier_changes', data.tierChanges);
                    }
                },
                error: (error) => {
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
     * Subscribe to payment events for current user
     */
    subscribeToPaymentEvents(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'payment_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: PAYMENT_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.paymentEvents) {
                        this.notifyHandlers('payment_events', data.paymentEvents);
                    }
                },
                error: (error) => {
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
    subscribeToDeviceTrustEvents(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'device_trust_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: DEVICE_TRUST_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.deviceTrustEvents) {
                        this.notifyHandlers('device_trust_events', data.deviceTrustEvents);
                    }
                },
                error: (error) => {
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
     * Subscribe to onboarding progress updates
     */
    subscribeToOnboardingProgress(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'onboarding_progress';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: ONBOARDING_PROGRESS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.onboardingProgress) {
                        this.notifyHandlers('onboarding_progress', data.onboardingProgress);
                    }
                },
                error: (error) => {
                    console.error('Onboarding progress subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('onboarding_progress', handler);

        return () => {
            this.removeEventHandler('onboarding_progress', handler);
            if (this.getHandlerCount('onboarding_progress') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to tenant-wide auth events (admin only)
     */
    subscribeToTenantAuthEvents(handler: EventHandler<AuthEvent>): () => void {
        const subscriptionKey = 'tenant_auth_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: TENANT_AUTH_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.tenantAuthEvents) {
                        this.notifyHandlers('tenant_auth_events', data.tenantAuthEvents);
                    }
                },
                error: (error) => {
                    console.error('Tenant auth events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('tenant_auth_events', handler);

        return () => {
            this.removeEventHandler('tenant_auth_events', handler);
            if (this.getHandlerCount('tenant_auth_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to role assignment events (admin only)
     */
    subscribeToRoleAssignmentEvents(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'role_assignment_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: ROLE_ASSIGNMENT_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.roleAssignmentEvents) {
                        this.notifyHandlers('role_assignment_events', data.roleAssignmentEvents);
                    }
                },
                error: (error) => {
                    console.error('Role assignment events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('role_assignment_events', handler);

        return () => {
            this.removeEventHandler('role_assignment_events', handler);
            if (this.getHandlerCount('role_assignment_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to events for a specific user (admin only)
     */
    subscribeToUserEvents(userId: string, handler: EventHandler<AuthEvent>): () => void {
        const subscriptionKey = `user_events_${userId}`;
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: USER_EVENTS_SUBSCRIPTION,
                variables: { userId }
            }).subscribe({
                next: ({ data }) => {
                    if (data?.userEvents) {
                        this.notifyHandlers(subscriptionKey, data.userEvents);
                    }
                },
                error: (error) => {
                    console.error('User events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler(subscriptionKey, handler);

        return () => {
            this.removeEventHandler(subscriptionKey, handler);
            if (this.getHandlerCount(subscriptionKey) === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to IP restriction events
     */
    subscribeToIpRestrictionEvents(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'ip_restriction_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: IP_RESTRICTION_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.ipRestrictionEvents) {
                        this.notifyHandlers('ip_restriction_events', data.ipRestrictionEvents);
                    }
                },
                error: (error) => {
                    console.error('IP restriction events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('ip_restriction_events', handler);

        return () => {
            this.removeEventHandler('ip_restriction_events', handler);
            if (this.getHandlerCount('ip_restriction_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to session limit events
     */
    subscribeToSessionLimitEvents(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'session_limit_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: SESSION_LIMIT_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.sessionLimitEvents) {
                        this.notifyHandlers('session_limit_events', data.sessionLimitEvents);
                    }
                },
                error: (error) => {
                    console.error('Session limit events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('session_limit_events', handler);

        return () => {
            this.removeEventHandler('session_limit_events', handler);
            if (this.getHandlerCount('session_limit_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Subscribe to password policy events
     */
    subscribeToPasswordPolicyEvents(handler: EventHandler<any>): () => void {
        const subscriptionKey = 'password_policy_events';
        
        if (!this.subscriptions.has(subscriptionKey)) {
            const subscription = this.apolloClient.subscribe({
                query: PASSWORD_POLICY_EVENTS_SUBSCRIPTION
            }).subscribe({
                next: ({ data }) => {
                    if (data?.passwordPolicyEvents) {
                        this.notifyHandlers('password_policy_events', data.passwordPolicyEvents);
                    }
                },
                error: (error) => {
                    console.error('Password policy events subscription error:', error);
                }
            });

            this.subscriptions.set(subscriptionKey, subscription);
        }

        this.addEventHandler('password_policy_events', handler);

        return () => {
            this.removeEventHandler('password_policy_events', handler);
            if (this.getHandlerCount('password_policy_events') === 0) {
                this.unsubscribe(subscriptionKey);
            }
        };
    }

    /**
     * Unsubscribe from all events and clean up
     */
    unsubscribeAll(): void {
        this.subscriptions.forEach((subscription, key) => {
            subscription.unsubscribe();
        });
        this.subscriptions.clear();
        this.eventHandlers.clear();
    }

    /**
     * Private helper methods
     */
    private addEventHandler(eventType: string, handler: EventHandler<any>): void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType)!.push(handler);
    }

    private removeEventHandler(eventType: string, handler: EventHandler<any>): void {
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