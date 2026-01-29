/**
 * GraphQL Integration Service
 * Comprehensive service that integrates all GraphQL authentication operations
 */

import { ApolloClient } from '@apollo/client';
import { AuthEventSubscriptionService } from '@/lib/realtime/AuthEventSubscriptionService';

// Import all GraphQL operations
import {
    LOGIN_MUTATION,
    LOGIN_WITH_MFA_MUTATION,
    REGISTER_MUTATION,
    LOGOUT_MUTATION,
    LOGOUT_ALL_SESSIONS_MUTATION,
    REFRESH_TOKEN_MUTATION,
    CHANGE_PASSWORD_MUTATION,
    FORGOT_PASSWORD_MUTATION,
    RESET_PASSWORD_MUTATION,
    SETUP_MFA_MUTATION,
    ENABLE_MFA_MUTATION,
    DISABLE_MFA_MUTATION,
    VERIFY_MFA_MUTATION,
    GENERATE_BACKUP_CODES_MUTATION,
    LINK_SOCIAL_PROVIDER_MUTATION,
    UNLINK_SOCIAL_PROVIDER_MUTATION,
    TERMINATE_SESSION_MUTATION,
    UPDATE_SECURITY_SETTINGS_MUTATION,
    GRANT_PERMISSION_MUTATION,
    REVOKE_PERMISSION_MUTATION,
    ASSIGN_ROLE_MUTATION,
    BULK_GRANT_PERMISSIONS_MUTATION,
    BULK_REVOKE_PERMISSIONS_MUTATION,
    CREATE_ROLE_MUTATION,
    UPDATE_ROLE_PERMISSIONS_MUTATION,
    TRUST_DEVICE_MUTATION,
    UNTRUST_DEVICE_MUTATION,
    START_ONBOARDING_MUTATION,
    SUBMIT_ONBOARDING_STEP_MUTATION,
    COMPLETE_ONBOARDING_MUTATION,
    UPDATE_TIER_MUTATION,
    PROCESS_PAYMENT_MUTATION,
    UPDATE_PAYMENT_METHOD_MUTATION,
    CANCEL_SUBSCRIPTION_MUTATION,
    UPDATE_IP_RESTRICTIONS_MUTATION,
    UPDATE_TIME_BASED_ACCESS_MUTATION,
    REGISTER_DEVICE_MUTATION,
    UPDATE_SESSION_MUTATION,
    TERMINATE_ALL_USER_SESSIONS_MUTATION,
    SEND_SECURITY_ALERT_MUTATION,
    BLOCK_IP_ADDRESS_MUTATION,
    UNBLOCK_IP_ADDRESS_MUTATION
} from '@/graphql/mutations/auth-complete';

import {
    ME_QUERY,
    REQUIRES_MFA_QUERY,
    GET_MFA_SETUP_QUERY,
    GET_MFA_STATUS_QUERY,
    IS_MFA_ENABLED_QUERY,
    GET_USER_PERMISSIONS_QUERY,
    GET_MY_PERMISSIONS_QUERY,
    CHECK_PERMISSION_QUERY,
    GET_AVAILABLE_PERMISSIONS_QUERY,
    GET_ROLES_QUERY,
    GET_ROLE_PERMISSIONS_QUERY,
    GET_ACTIVE_SESSIONS_QUERY,
    GET_SECURITY_SETTINGS_QUERY,
    GET_AUDIT_LOGS_QUERY,
    GET_USER_TIER_QUERY,
    GET_MY_TIER_QUERY,
    GET_DEVICE_SESSIONS_QUERY,
    GET_TRUSTED_DEVICES_QUERY,
    GET_SECURITY_EVENTS_QUERY,
    GET_ONBOARDING_STATUS_QUERY,
    GET_SUBSCRIPTION_STATUS_QUERY,
    VALIDATE_SESSION_QUERY,
    GET_IP_RESTRICTIONS_QUERY,
    GET_TIME_BASED_ACCESS_QUERY,
    GET_SOCIAL_AUTH_URL_QUERY,
    GET_CONNECTED_SOCIAL_PROVIDERS_QUERY,
    BASIC_FEATURE_QUERY,
    SMALL_TIER_FEATURE_QUERY,
    MEDIUM_TIER_FEATURE_QUERY,
    ENTERPRISE_FEATURE_QUERY,
    ADVANCED_REPORTS_QUERY,
    MULTI_LOCATION_DATA_QUERY,
    GET_USER_FEATURES_QUERY,
    GET_UPGRADE_RECOMMENDATIONS_QUERY,
    CHECK_PERMISSION_WITH_DETAILS_QUERY,
    GET_USER_PERMISSIONS_WITH_METADATA_QUERY,
    GET_AVAILABLE_PERMISSIONS_DETAILED_QUERY
} from '@/graphql/queries/auth-complete';

export interface GraphQLOperationResult<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export class GraphQLIntegrationService {
    private apolloClient: ApolloClient<any>;
    private subscriptionService: AuthEventSubscriptionService;

    constructor(apolloClient: ApolloClient<any>) {
        this.apolloClient = apolloClient;
        this.subscriptionService = new AuthEventSubscriptionService(apolloClient);
    }

    /**
     * Authentication Operations
     */
    async login(email: string, password: string, deviceInfo?: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGIN_MUTATION,
                variables: {
                    input: { email, password, deviceInfo }
                }
            });

            return {
                success: data?.login?.success || false,
                data: data?.login,
                message: data?.login?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Login failed'
            };
        }
    }

    async loginWithMfa(email: string, password: string, mfaToken: string, deviceInfo?: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGIN_WITH_MFA_MUTATION,
                variables: {
                    input: { email, password, mfaToken, deviceInfo }
                }
            });

            return {
                success: data?.loginWithMfa?.success || false,
                data: data?.loginWithMfa,
                message: data?.loginWithMfa?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'MFA login failed'
            };
        }
    }

    async register(userData: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: REGISTER_MUTATION,
                variables: { input: userData }
            });

            return {
                success: data?.register?.success || false,
                data: data?.register,
                message: data?.register?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Registration failed'
            };
        }
    }

    async logout(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGOUT_MUTATION
            });

            return {
                success: data?.logout?.success || true,
                data: data?.logout,
                message: data?.logout?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Logout failed'
            };
        }
    }

    async logoutAllSessions(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGOUT_ALL_SESSIONS_MUTATION
            });

            return {
                success: data?.logoutAllSessions?.success || false,
                data: data?.logoutAllSessions,
                message: data?.logoutAllSessions?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to logout all sessions'
            };
        }
    }

    async refreshToken(refreshToken: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: REFRESH_TOKEN_MUTATION,
                variables: { input: { refreshToken } }
            });

            return {
                success: data?.refreshToken?.success || false,
                data: data?.refreshToken,
                message: data?.refreshToken?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Token refresh failed'
            };
        }
    }

    /**
     * User Information Operations
     */
    async getCurrentUser(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: ME_QUERY,
                fetchPolicy: 'network-only'
            });

            return {
                success: !!data?.me,
                data: data?.me
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get current user'
            };
        }
    }

    async requiresMfa(email: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: REQUIRES_MFA_QUERY,
                variables: { email }
            });

            return {
                success: true,
                data: data?.requiresMfa
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to check MFA requirement'
            };
        }
    }

    /**
     * MFA Operations
     */
    async setupMfa(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: SETUP_MFA_MUTATION,
                variables: { input: {} }
            });

            return {
                success: data?.setupMfa?.success || false,
                data: data?.setupMfa,
                message: data?.setupMfa?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'MFA setup failed'
            };
        }
    }

    async enableMfa(token: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: ENABLE_MFA_MUTATION,
                variables: { input: { token } }
            });

            return {
                success: data?.enableMfa?.success || false,
                data: data?.enableMfa,
                message: data?.enableMfa?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to enable MFA'
            };
        }
    }

    async disableMfa(token: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: DISABLE_MFA_MUTATION,
                variables: { input: { token } }
            });

            return {
                success: data?.disableMfa?.success || false,
                data: data?.disableMfa,
                message: data?.disableMfa?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to disable MFA'
            };
        }
    }

    async verifyMfa(token: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: VERIFY_MFA_MUTATION,
                variables: { input: { token } }
            });

            return {
                success: data?.verifyMfa?.success || false,
                data: data?.verifyMfa,
                message: data?.verifyMfa?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'MFA verification failed'
            };
        }
    }

    async generateBackupCodes(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: GENERATE_BACKUP_CODES_MUTATION,
                variables: { input: {} }
            });

            return {
                success: data?.generateBackupCodes?.success || false,
                data: data?.generateBackupCodes,
                message: data?.generateBackupCodes?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to generate backup codes'
            };
        }
    }

    async getMfaStatus(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_MFA_STATUS_QUERY
            });

            return {
                success: true,
                data: data?.getMfaStatus
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get MFA status'
            };
        }
    }

    /**
     * Social Authentication Operations
     */
    async getSocialAuthUrl(provider: string, redirectUri?: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_SOCIAL_AUTH_URL_QUERY,
                variables: { provider, redirectUri }
            });

            return {
                success: true,
                data: data?.getSocialAuthUrl
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get social auth URL'
            };
        }
    }

    async linkSocialProvider(provider: string, code: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LINK_SOCIAL_PROVIDER_MUTATION,
                variables: { input: { provider, code } }
            });

            return {
                success: data?.linkSocialProvider?.success || false,
                data: data?.linkSocialProvider,
                message: data?.linkSocialProvider?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to link social provider'
            };
        }
    }

    async unlinkSocialProvider(provider: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: UNLINK_SOCIAL_PROVIDER_MUTATION,
                variables: { input: { provider } }
            });

            return {
                success: data?.unlinkSocialProvider?.success || false,
                data: data?.unlinkSocialProvider,
                message: data?.unlinkSocialProvider?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to unlink social provider'
            };
        }
    }

    async getConnectedSocialProviders(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_CONNECTED_SOCIAL_PROVIDERS_QUERY
            });

            return {
                success: true,
                data: data?.getConnectedSocialProviders || []
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get connected social providers'
            };
        }
    }

    /**
     * Permission Operations
     */
    async getMyPermissions(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_MY_PERMISSIONS_QUERY
            });

            return {
                success: true,
                data: data?.getMyPermissions
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get permissions'
            };
        }
    }

    async checkPermission(permission: string, resource?: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: CHECK_PERMISSION_QUERY,
                variables: { input: { permission, resource } }
            });

            return {
                success: true,
                data: data?.checkPermission
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to check permission'
            };
        }
    }

    async grantPermission(userId: string, permission: string, resource?: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: GRANT_PERMISSION_MUTATION,
                variables: { input: { userId, permission, resource } }
            });

            return {
                success: data?.grantPermission?.success || false,
                data: data?.grantPermission,
                message: data?.grantPermission?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to grant permission'
            };
        }
    }

    async revokePermission(userId: string, permission: string, resource?: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: REVOKE_PERMISSION_MUTATION,
                variables: { input: { userId, permission, resource } }
            });

            return {
                success: data?.revokePermission?.success || false,
                data: data?.revokePermission,
                message: data?.revokePermission?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to revoke permission'
            };
        }
    }

    /**
     * Tier Operations
     */
    async getMyTier(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_MY_TIER_QUERY
            });

            return {
                success: true,
                data: data?.getMyTier
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get tier information'
            };
        }
    }

    async getUserFeatures(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_USER_FEATURES_QUERY
            });

            return {
                success: true,
                data: data?.getUserFeatures ? JSON.parse(data.getUserFeatures) : []
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get user features'
            };
        }
    }

    async getUpgradeRecommendations(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_UPGRADE_RECOMMENDATIONS_QUERY
            });

            return {
                success: true,
                data: data?.getUpgradeRecommendations ? JSON.parse(data.getUpgradeRecommendations) : {}
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get upgrade recommendations'
            };
        }
    }

    async updateTier(newTier: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: UPDATE_TIER_MUTATION,
                variables: { input: { tier: newTier } }
            });

            return {
                success: data?.updateTier?.success || false,
                data: data?.updateTier,
                message: data?.updateTier?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to update tier'
            };
        }
    }

    /**
     * Tier Feature Access Checks
     */
    async checkBasicFeature(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: BASIC_FEATURE_QUERY
            });

            return {
                success: true,
                data: { hasAccess: !!data?.basicFeature }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { hasAccess: false },
                error: error.message
            };
        }
    }

    async checkSmallTierFeature(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: SMALL_TIER_FEATURE_QUERY
            });

            return {
                success: true,
                data: { hasAccess: !!data?.smallTierFeature }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { hasAccess: false },
                error: error.message
            };
        }
    }

    async checkMediumTierFeature(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: MEDIUM_TIER_FEATURE_QUERY
            });

            return {
                success: true,
                data: { hasAccess: !!data?.mediumTierFeature }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { hasAccess: false },
                error: error.message
            };
        }
    }

    async checkEnterpriseFeature(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: ENTERPRISE_FEATURE_QUERY
            });

            return {
                success: true,
                data: { hasAccess: !!data?.enterpriseFeature }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { hasAccess: false },
                error: error.message
            };
        }
    }

    async checkAdvancedReports(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: ADVANCED_REPORTS_QUERY
            });

            return {
                success: true,
                data: { hasAccess: !!data?.advancedReports }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { hasAccess: false },
                error: error.message
            };
        }
    }

    async checkMultiLocationData(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: MULTI_LOCATION_DATA_QUERY
            });

            return {
                success: true,
                data: { hasAccess: !!data?.multiLocationData }
            };
        } catch (error: any) {
            return {
                success: false,
                data: { hasAccess: false },
                error: error.message
            };
        }
    }

    /**
     * Session Management Operations
     */
    async getActiveSessions(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_ACTIVE_SESSIONS_QUERY,
                fetchPolicy: 'network-only'
            });

            return {
                success: true,
                data: data?.getActiveSessions || []
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get active sessions'
            };
        }
    }

    async terminateSession(sessionId: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: TERMINATE_SESSION_MUTATION,
                variables: { sessionId }
            });

            return {
                success: data?.terminateSession?.success || false,
                data: data?.terminateSession,
                message: data?.terminateSession?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to terminate session'
            };
        }
    }

    async getDeviceSessions(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_DEVICE_SESSIONS_QUERY,
                fetchPolicy: 'network-only'
            });

            return {
                success: true,
                data: data?.getDeviceSessions || []
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get device sessions'
            };
        }
    }

    async trustDevice(deviceId: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: TRUST_DEVICE_MUTATION,
                variables: { deviceId }
            });

            return {
                success: data?.trustDevice?.success || false,
                data: data?.trustDevice,
                message: data?.trustDevice?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to trust device'
            };
        }
    }

    async untrustDevice(deviceId: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: UNTRUST_DEVICE_MUTATION,
                variables: { deviceId }
            });

            return {
                success: data?.untrustDevice?.success || false,
                data: data?.untrustDevice,
                message: data?.untrustDevice?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to untrust device'
            };
        }
    }

    /**
     * Onboarding Operations
     */
    async startOnboarding(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: START_ONBOARDING_MUTATION,
                variables: { input: {} }
            });

            return {
                success: data?.startOnboarding?.success || false,
                data: data?.startOnboarding,
                message: data?.startOnboarding?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to start onboarding'
            };
        }
    }

    async submitOnboardingStep(sessionId: string, step: number, stepData: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: SUBMIT_ONBOARDING_STEP_MUTATION,
                variables: {
                    input: {
                        sessionId,
                        step,
                        data: stepData
                    }
                }
            });

            return {
                success: data?.submitOnboardingStep?.success || false,
                data: data?.submitOnboardingStep,
                message: data?.submitOnboardingStep?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to submit onboarding step'
            };
        }
    }

    async completeOnboarding(sessionId: string, selectedTier: string): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: COMPLETE_ONBOARDING_MUTATION,
                variables: {
                    input: {
                        sessionId,
                        selectedTier
                    }
                }
            });

            return {
                success: data?.completeOnboarding?.success || false,
                data: data?.completeOnboarding,
                message: data?.completeOnboarding?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to complete onboarding'
            };
        }
    }

    async getOnboardingStatus(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_ONBOARDING_STATUS_QUERY
            });

            return {
                success: true,
                data: data?.getOnboardingStatus
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get onboarding status'
            };
        }
    }

    /**
     * Payment Operations
     */
    async processPayment(paymentData: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: PROCESS_PAYMENT_MUTATION,
                variables: { input: paymentData }
            });

            return {
                success: data?.processPayment?.success || false,
                data: data?.processPayment,
                message: data?.processPayment?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Payment processing failed'
            };
        }
    }

    async getSubscriptionStatus(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_SUBSCRIPTION_STATUS_QUERY
            });

            return {
                success: true,
                data: data?.getSubscriptionStatus
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get subscription status'
            };
        }
    }

    /**
     * Security Operations
     */
    async getSecuritySettings(): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_SECURITY_SETTINGS_QUERY
            });

            return {
                success: true,
                data: data?.getSecuritySettings
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get security settings'
            };
        }
    }

    async updateSecuritySettings(settings: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: UPDATE_SECURITY_SETTINGS_MUTATION,
                variables: { input: settings }
            });

            return {
                success: data?.updateSecuritySettings?.success || false,
                data: data?.updateSecuritySettings,
                message: data?.updateSecuritySettings?.message
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to update security settings'
            };
        }
    }

    async getAuditLogs(filter?: any, pagination?: any): Promise<GraphQLOperationResult> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_AUDIT_LOGS_QUERY,
                variables: { filter, pagination }
            });

            return {
                success: true,
                data: data?.getAuditLogs
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.message || 'Failed to get audit logs'
            };
        }
    }

    /**
     * Real-time Subscription Service
     */
    getSubscriptionService(): AuthEventSubscriptionService {
        return this.subscriptionService;
    }

    /**
     * Cleanup
     */
    cleanup(): void {
        this.subscriptionService.unsubscribeAll();
    }
}