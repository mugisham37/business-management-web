/**
 * useAuthEventSubscriptions Hook
 * React hook for managing authentication event subscriptions
 */

import { useEffect, useCallback, useRef, useState } from 'react';
import { useApolloClient, type ApolloClient, type NormalizedCacheObject } from '@apollo/client';
import { AuthEventSubscriptionService, AuthEvent, SecurityAlert, PermissionChange, TierChange } from '@/lib/realtime/AuthEventSubscriptionService';
import { useAuth } from '@/hooks/authentication/useAuth';

interface UseAuthEventSubscriptionsOptions {
    enableAuthEvents?: boolean;
    enablePermissionChanges?: boolean;
    enableSecurityAlerts?: boolean;
    enableMfaEvents?: boolean;
    enableSessionEvents?: boolean;
    enableTierChanges?: boolean;
    enablePaymentEvents?: boolean;
    enableDeviceTrustEvents?: boolean;
    enableOnboardingProgress?: boolean;
    enableTenantAuthEvents?: boolean; // Admin only
    enableRoleAssignmentEvents?: boolean; // Admin only
    enableIpRestrictionEvents?: boolean;
    enableSessionLimitEvents?: boolean;
    enablePasswordPolicyEvents?: boolean;
}

interface PaymentEvent {
    id: string;
    type: string;
    amount?: number;
    currency?: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface DeviceTrustEvent {
    id: string;
    deviceId: string;
    trusted: boolean;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface OnboardingProgressEvent {
    id: string;
    step: string;
    progress: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface RoleAssignmentEvent {
    id: string;
    userId: string;
    role: string;
    action: 'assigned' | 'revoked';
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface IpRestrictionEvent {
    id: string;
    ipAddress: string;
    action: 'blocked' | 'allowed';
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface SessionLimitEvent {
    id: string;
    userId: string;
    sessionCount: number;
    limit: number;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface PasswordPolicyEvent {
    id: string;
    userId: string;
    event: string;
    timestamp: Date;
    metadata?: Record<string, unknown>;
}

interface AuthEventHandlers {
    onAuthEvent?: (event: AuthEvent) => void;
    onPermissionChange?: (change: PermissionChange) => void;
    onSecurityAlert?: (alert: SecurityAlert) => void;
    onMfaEvent?: (event: AuthEvent) => void;
    onSessionEvent?: (event: AuthEvent) => void;
    onTierChange?: (change: TierChange) => void;
    onPaymentEvent?: (event: PaymentEvent) => void;
    onDeviceTrustEvent?: (event: DeviceTrustEvent) => void;
    onOnboardingProgress?: (event: OnboardingProgressEvent) => void;
    onTenantAuthEvent?: (event: AuthEvent) => void;
    onRoleAssignmentEvent?: (event: RoleAssignmentEvent) => void;
    onIpRestrictionEvent?: (event: IpRestrictionEvent) => void;
    onSessionLimitEvent?: (event: SessionLimitEvent) => void;
    onPasswordPolicyEvent?: (event: PasswordPolicyEvent) => void;
}

export function useAuthEventSubscriptions(
    options: UseAuthEventSubscriptionsOptions = {},
    handlers: AuthEventHandlers = {}
) {
    const apolloClient = useApolloClient();
    const { isAuthenticated, user } = useAuth();
    const serviceRef = useRef<AuthEventSubscriptionService | null>(null);
    const unsubscribersRef = useRef<(() => void)[]>([]);
    const [isServiceReady, setIsServiceReady] = useState(false);

    // Initialize service
    useEffect(() => {
        if (isAuthenticated && !serviceRef.current) {
            serviceRef.current = new AuthEventSubscriptionService(apolloClient as ApolloClient<NormalizedCacheObject>);
            setIsServiceReady(true);
        }

        return () => {
            if (serviceRef.current) {
                serviceRef.current.unsubscribeAll();
                serviceRef.current = null;
                setIsServiceReady(false);
            }
        };
    }, [apolloClient, isAuthenticated]);

    // Setup subscriptions
    useEffect(() => {
        if (!serviceRef.current || !isAuthenticated) return;

        const service = serviceRef.current;
        const unsubscribers: (() => void)[] = [];

        // Auth events
        if (options.enableAuthEvents && handlers.onAuthEvent) {
            const unsubscribe = service.subscribeToAuthEvents(handlers.onAuthEvent);
            unsubscribers.push(unsubscribe);
        }

        // Permission changes
        if (options.enablePermissionChanges && handlers.onPermissionChange) {
            const unsubscribe = service.subscribeToPermissionChanges(handlers.onPermissionChange);
            unsubscribers.push(unsubscribe);
        }

        // Security alerts
        if (options.enableSecurityAlerts && handlers.onSecurityAlert) {
            const unsubscribe = service.subscribeToSecurityAlerts(handlers.onSecurityAlert);
            unsubscribers.push(unsubscribe);
        }

        // MFA events
        if (options.enableMfaEvents && handlers.onMfaEvent) {
            const unsubscribe = service.subscribeToMfaEvents(handlers.onMfaEvent);
            unsubscribers.push(unsubscribe);
        }

        // Session events
        if (options.enableSessionEvents && handlers.onSessionEvent) {
            const unsubscribe = service.subscribeToSessionEvents(handlers.onSessionEvent);
            unsubscribers.push(unsubscribe);
        }

        // Tier changes
        if (options.enableTierChanges && handlers.onTierChange) {
            const unsubscribe = service.subscribeToTierChanges(handlers.onTierChange);
            unsubscribers.push(unsubscribe);
        }

        // Payment events
        if (options.enablePaymentEvents && handlers.onPaymentEvent) {
            const unsubscribe = service.subscribeToPaymentEvents(handlers.onPaymentEvent);
            unsubscribers.push(unsubscribe);
        }

        // Device trust events
        if (options.enableDeviceTrustEvents && handlers.onDeviceTrustEvent) {
            const unsubscribe = service.subscribeToDeviceTrustEvents(handlers.onDeviceTrustEvent);
            unsubscribers.push(unsubscribe);
        }

        // Onboarding progress
        if (options.enableOnboardingProgress && handlers.onOnboardingProgress) {
            const unsubscribe = service.subscribeToOnboardingProgress(handlers.onOnboardingProgress);
            unsubscribers.push(unsubscribe);
        }

        // Tenant auth events (admin only)
        if (options.enableTenantAuthEvents && handlers.onTenantAuthEvent && user?.role === 'admin') {
            const unsubscribe = service.subscribeToTenantAuthEvents(handlers.onTenantAuthEvent);
            unsubscribers.push(unsubscribe);
        }

        // Role assignment events (admin only)
        if (options.enableRoleAssignmentEvents && handlers.onRoleAssignmentEvent && user?.role === 'admin') {
            const unsubscribe = service.subscribeToRoleAssignmentEvents(handlers.onRoleAssignmentEvent);
            unsubscribers.push(unsubscribe);
        }

        // IP restriction events
        if (options.enableIpRestrictionEvents && handlers.onIpRestrictionEvent) {
            const unsubscribe = service.subscribeToIpRestrictionEvents(handlers.onIpRestrictionEvent);
            unsubscribers.push(unsubscribe);
        }

        // Session limit events
        if (options.enableSessionLimitEvents && handlers.onSessionLimitEvent) {
            const unsubscribe = service.subscribeToSessionLimitEvents(handlers.onSessionLimitEvent);
            unsubscribers.push(unsubscribe);
        }

        // Password policy events
        if (options.enablePasswordPolicyEvents && handlers.onPasswordPolicyEvent) {
            const unsubscribe = service.subscribeToPasswordPolicyEvents(handlers.onPasswordPolicyEvent);
            unsubscribers.push(unsubscribe);
        }

        unsubscribersRef.current = unsubscribers;

        return () => {
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };
    }, [
        isAuthenticated,
        user?.role,
        options.enableAuthEvents,
        options.enablePermissionChanges,
        options.enableSecurityAlerts,
        options.enableMfaEvents,
        options.enableSessionEvents,
        options.enableTierChanges,
        options.enablePaymentEvents,
        options.enableDeviceTrustEvents,
        options.enableOnboardingProgress,
        options.enableTenantAuthEvents,
        options.enableRoleAssignmentEvents,
        options.enableIpRestrictionEvents,
        options.enableSessionLimitEvents,
        options.enablePasswordPolicyEvents,
        handlers.onAuthEvent,
        handlers.onPermissionChange,
        handlers.onSecurityAlert,
        handlers.onMfaEvent,
        handlers.onSessionEvent,
        handlers.onTierChange,
        handlers.onPaymentEvent,
        handlers.onDeviceTrustEvent,
        handlers.onOnboardingProgress,
        handlers.onTenantAuthEvent,
        handlers.onRoleAssignmentEvent,
        handlers.onIpRestrictionEvent,
        handlers.onSessionLimitEvent,
        handlers.onPasswordPolicyEvent
    ]);

    // Subscribe to user-specific events (admin only)
    const subscribeToUserEvents = useCallback((userId: string, handler: (event: AuthEvent) => void) => {
        if (!serviceRef.current || !isAuthenticated || user?.role !== 'admin') {
            return () => {};
        }

        return serviceRef.current.subscribeToUserEvents(userId, handler);
    }, [isAuthenticated, user?.role]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            unsubscribersRef.current.forEach(unsubscribe => unsubscribe());
            if (serviceRef.current) {
                serviceRef.current.unsubscribeAll();
            }
        };
    }, []);

    return {
        subscribeToUserEvents,
        isConnected: isServiceReady && isAuthenticated
    };
}

/**
 * Hook for security-focused subscriptions
 */
export function useSecurityEventSubscriptions(handlers: {
    onSecurityAlert?: (alert: SecurityAlert) => void;
    onAuthEvent?: (event: AuthEvent) => void;
    onSessionEvent?: (event: AuthEvent) => void;
    onMfaEvent?: (event: AuthEvent) => void;
    onDeviceTrustEvent?: (event: DeviceTrustEvent) => void;
    onIpRestrictionEvent?: (event: IpRestrictionEvent) => void;
}) {
    return useAuthEventSubscriptions(
        {
            enableSecurityAlerts: true,
            enableAuthEvents: true,
            enableSessionEvents: true,
            enableMfaEvents: true,
            enableDeviceTrustEvents: true,
            enableIpRestrictionEvents: true
        },
        handlers
    );
}

/**
 * Hook for business-focused subscriptions
 */
export function useBusinessEventSubscriptions(handlers: {
    onTierChange?: (change: TierChange) => void;
    onPaymentEvent?: (event: PaymentEvent) => void;
    onPermissionChange?: (change: PermissionChange) => void;
    onOnboardingProgress?: (event: OnboardingProgressEvent) => void;
}) {
    return useAuthEventSubscriptions(
        {
            enableTierChanges: true,
            enablePaymentEvents: true,
            enablePermissionChanges: true,
            enableOnboardingProgress: true
        },
        handlers
    );
}

/**
 * Hook for admin-focused subscriptions
 */
export function useAdminEventSubscriptions(handlers: {
    onTenantAuthEvent?: (event: AuthEvent) => void;
    onRoleAssignmentEvent?: (event: RoleAssignmentEvent) => void;
    onSecurityAlert?: (alert: SecurityAlert) => void;
    onSessionLimitEvent?: (event: SessionLimitEvent) => void;
    onPasswordPolicyEvent?: (event: PasswordPolicyEvent) => void;
}) {
    return useAuthEventSubscriptions(
        {
            enableTenantAuthEvents: true,
            enableRoleAssignmentEvents: true,
            enableSecurityAlerts: true,
            enableSessionLimitEvents: true,
            enablePasswordPolicyEvents: true
        },
        handlers
    );
}