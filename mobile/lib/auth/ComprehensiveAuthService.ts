/**
 * Comprehensive Authentication Service for Mobile
 * Integrates all GraphQL authentication operations for complete parity with web
 */

import type { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { secureStorage, appStorage, STORAGE_KEYS } from '@/lib/storage';

// Import all GraphQL operations
import {
    LOGIN_MUTATION,
    LOGIN_WITH_MFA_MUTATION,
    REGISTER_MUTATION,
    LOGOUT_MUTATION,
    LOGOUT_ALL_SESSIONS_MUTATION,
    REFRESH_TOKEN_MUTATION,
    OAUTH_LOGIN_MUTATION,
    GITHUB_OAUTH_MUTATION,
    BIOMETRIC_LOGIN_MUTATION,
    SETUP_MFA_MUTATION,
    ENABLE_MFA_MUTATION,
    DISABLE_MFA_MUTATION,
    VERIFY_MFA_MUTATION,
    GENERATE_BACKUP_CODES_MUTATION,
    LINK_SOCIAL_PROVIDER_MUTATION,
    UNLINK_SOCIAL_PROVIDER_MUTATION,
    REGISTER_DEVICE_MUTATION,
    UPDATE_SESSION_MUTATION,
    SYNC_SESSION_MUTATION,
    REGISTER_PUSH_TOKEN_MUTATION,
    TERMINATE_SESSION_MUTATION,
    TRUST_DEVICE_MUTATION,
    UNTRUST_DEVICE_MUTATION,
    START_ONBOARDING_MUTATION,
    SUBMIT_ONBOARDING_STEP_MUTATION,
    COMPLETE_ONBOARDING_MUTATION,
    UPDATE_TIER_MUTATION,
    PROCESS_PAYMENT_MUTATION
} from '@/graphql/mutations/auth-mutations';

import {
    ME_QUERY,
    REQUIRES_MFA_QUERY,
    GET_MFA_SETUP_QUERY,
    GET_MFA_STATUS_QUERY,
    IS_MFA_ENABLED_QUERY,
    GET_MY_PERMISSIONS_QUERY,
    CHECK_PERMISSION_QUERY,
    GET_AVAILABLE_PERMISSIONS_QUERY,
    GET_ROLES_QUERY,
    GET_SOCIAL_AUTH_URL_QUERY,
    GET_CONNECTED_SOCIAL_PROVIDERS_QUERY,
    GET_SECURITY_SETTINGS_QUERY,
    GET_MY_TIER_QUERY,
    GET_USER_FEATURES_QUERY,
    GET_UPGRADE_RECOMMENDATIONS_QUERY,
    GET_DEVICE_SESSIONS_QUERY,
    GET_TRUSTED_DEVICES_QUERY,
    GET_ONBOARDING_STATUS_QUERY,
    GET_SUBSCRIPTION_STATUS_QUERY,
    VALIDATE_SESSION_QUERY
} from '@/graphql/queries/auth-queries';

export interface AuthResult {
    success: boolean;
    message?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: any;
    sessionId?: string;
    onboardingCompleted?: boolean;
}

export interface BiometricAuthResult {
    success: boolean;
    authMethod?: 'fingerprint' | 'face' | 'voice';
    fallbackToPassword?: boolean;
    error?: string;
}

export interface DeviceInfo {
    deviceId: string;
    platform: string;
    deviceName: string;
    appVersion: string;
    fingerprint: string;
}

export interface OAuthProvider {
    provider: string;
    providerId: string;
    email: string;
    displayName: string;
    connectedAt: string;
}

// Type alias for Apollo Client to handle generic resolution issues
type ApolloClientInstance = ApolloClient<NormalizedCacheObject>;

export class ComprehensiveAuthService {
    private apolloClient: ApolloClientInstance;
    private deviceInfo: DeviceInfo | null = null;

    constructor(apolloClient: ApolloClientInstance) {
        this.apolloClient = apolloClient;
        this.initializeDeviceInfo();
    }

    /**
     * Initialize device information
     */
    private async initializeDeviceInfo(): Promise<void> {
        try {
            const deviceId = await this.getDeviceId();
            const deviceName = await this.getDeviceName();
            const appVersion = await this.getAppVersion();
            const fingerprint = await this.generateDeviceFingerprint();

            this.deviceInfo = {
                deviceId,
                platform: Platform.OS,
                deviceName,
                appVersion,
                fingerprint
            };

            // Register device with backend
            await this.registerDevice();
        } catch (error) {
            console.error('Failed to initialize device info:', error);
        }
    }

    /**
     * Basic Authentication Operations
     */
    async login(email: string, password: string, deviceTracking = true): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGIN_MUTATION,
                variables: {
                    input: {
                        email,
                        password,
                        deviceInfo: deviceTracking ? this.deviceInfo : undefined
                    }
                }
            });

            if (data?.login?.success) {
                await this.storeTokens(data.login.accessToken, data.login.refreshToken);
                await this.syncSession();
                return data.login;
            }

            return { success: false, message: data?.login?.message || 'Login failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Login failed' };
        }
    }

    async loginWithMfa(email: string, password: string, mfaToken: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGIN_WITH_MFA_MUTATION,
                variables: {
                    input: {
                        email,
                        password,
                        mfaToken,
                        deviceInfo: this.deviceInfo
                    }
                }
            });

            if (data?.loginWithMfa?.success) {
                await this.storeTokens(data.loginWithMfa.accessToken, data.loginWithMfa.refreshToken);
                await this.syncSession();
                return data.loginWithMfa;
            }

            return { success: false, message: data?.loginWithMfa?.message || 'MFA login failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'MFA login failed' };
        }
    }

    async register(userData: any): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: REGISTER_MUTATION,
                variables: {
                    input: {
                        ...userData,
                        deviceInfo: this.deviceInfo
                    }
                }
            });

            return data?.register || { success: false, message: 'Registration failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Registration failed' };
        }
    }

    async logout(): Promise<void> {
        try {
            await this.apolloClient.mutate({
                mutation: LOGOUT_MUTATION
            });
        } catch (error) {
            console.error('Logout mutation error:', error);
        } finally {
            await this.clearAuthData();
        }
    }

    async logoutAllSessions(): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LOGOUT_ALL_SESSIONS_MUTATION
            });

            await this.clearAuthData();
            return data?.logoutAllSessions || { success: true };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to logout all sessions' };
        }
    }

    /**
     * OAuth Authentication
     */
    async getSocialAuthUrl(provider: string, redirectUri?: string): Promise<{ url: string; state: string }> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_SOCIAL_AUTH_URL_QUERY,
                variables: { provider, redirectUri }
            });

            return data?.getSocialAuthUrl || { url: '', state: '' };
        } catch (error) {
            throw new Error(`Failed to get ${provider} auth URL`);
        }
    }

    async oauthLogin(provider: string, code: string, state: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: OAUTH_LOGIN_MUTATION,
                variables: {
                    input: {
                        provider,
                        code,
                        state,
                        deviceInfo: this.deviceInfo
                    }
                }
            });

            if (data?.oauthLogin?.success) {
                await this.storeTokens(data.oauthLogin.accessToken, data.oauthLogin.refreshToken);
                await this.syncSession();
                return data.oauthLogin;
            }

            return { success: false, message: data?.oauthLogin?.message || 'OAuth login failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'OAuth login failed' };
        }
    }

    async githubOAuth(code: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: GITHUB_OAUTH_MUTATION,
                variables: {
                    input: {
                        code,
                        deviceInfo: this.deviceInfo
                    }
                }
            });

            if (data?.githubOAuth?.success) {
                await this.storeTokens(data.githubOAuth.accessToken, data.githubOAuth.refreshToken);
                await this.syncSession();
                return data.githubOAuth;
            }

            return { success: false, message: data?.githubOAuth?.message || 'GitHub OAuth failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'GitHub OAuth failed' };
        }
    }

    async linkSocialProvider(provider: string, code: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: LINK_SOCIAL_PROVIDER_MUTATION,
                variables: {
                    input: { provider, code }
                }
            });

            return data?.linkSocialProvider || { success: false };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to link social provider' };
        }
    }

    async unlinkSocialProvider(provider: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: UNLINK_SOCIAL_PROVIDER_MUTATION,
                variables: {
                    input: { provider }
                }
            });

            return data?.unlinkSocialProvider || { success: false };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to unlink social provider' };
        }
    }

    async getConnectedSocialProviders(): Promise<OAuthProvider[]> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_CONNECTED_SOCIAL_PROVIDERS_QUERY
            });

            return data?.getConnectedSocialProviders || [];
        } catch (error) {
            console.error('Failed to get connected social providers:', error);
            return [];
        }
    }

    /**
     * Biometric Authentication
     */
    async authenticateWithBiometrics(): Promise<BiometricAuthResult> {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            if (!hasHardware) {
                return { success: false, fallbackToPassword: true, error: 'No biometric hardware available' };
            }

            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (!isEnrolled) {
                return { success: false, fallbackToPassword: true, error: 'No biometric data enrolled' };
            }

            const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
            const authMethod = supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) 
                ? 'face' 
                : supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT) 
                ? 'fingerprint' 
                : 'voice';

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access your account',
                cancelLabel: 'Use Password',
                fallbackLabel: 'Use Password'
            });

            if (result.success) {
                // Perform biometric login with backend
                const { data } = await this.apolloClient.mutate({
                    mutation: BIOMETRIC_LOGIN_MUTATION,
                    variables: {
                        input: {
                            biometricType: authMethod,
                            deviceInfo: this.deviceInfo
                        }
                    }
                });

                if (data?.biometricLogin?.success) {
                    await this.storeTokens(data.biometricLogin.accessToken, data.biometricLogin.refreshToken);
                    await this.syncSession();
                    return { success: true, authMethod };
                }
            }

            return { success: false, fallbackToPassword: true };
        } catch (error: any) {
            return { success: false, fallbackToPassword: true, error: error.message };
        }
    }

    /**
     * MFA Operations
     */
    async setupMfa(): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: SETUP_MFA_MUTATION,
                variables: { input: {} }
            });

            return data?.setupMfa || { secret: '', qrCodeUrl: '', backupCodes: [] };
        } catch (error) {
            throw new Error('Failed to setup MFA');
        }
    }

    async enableMfa(token: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: ENABLE_MFA_MUTATION,
                variables: {
                    input: { token }
                }
            });

            return data?.enableMfa || { success: false };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to enable MFA' };
        }
    }

    async disableMfa(token: string): Promise<AuthResult> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: DISABLE_MFA_MUTATION,
                variables: {
                    input: { token }
                }
            });

            return data?.disableMfa || { success: false };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to disable MFA' };
        }
    }

    async verifyMfa(token: string): Promise<{ isValid: boolean; remainingAttempts: number }> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: VERIFY_MFA_MUTATION,
                variables: {
                    input: { token }
                }
            });

            return data?.verifyMfa || { isValid: false, remainingAttempts: 0 };
        } catch (error) {
            return { isValid: false, remainingAttempts: 0 };
        }
    }

    async generateBackupCodes(): Promise<string[]> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: GENERATE_BACKUP_CODES_MUTATION,
                variables: { input: {} }
            });

            return data?.generateBackupCodes?.backupCodes || [];
        } catch (error) {
            return [];
        }
    }

    async getMfaStatus(): Promise<{ isEnabled: boolean; backupCodesCount: number }> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_MFA_STATUS_QUERY
            });

            return data?.getMfaStatus || { isEnabled: false, backupCodesCount: 0 };
        } catch (error) {
            return { isEnabled: false, backupCodesCount: 0 };
        }
    }

    /**
     * Session Management
     */
    async syncSession(): Promise<void> {
        try {
            await this.apolloClient.mutate({
                mutation: SYNC_SESSION_MUTATION,
                variables: {
                    input: {
                        deviceInfo: this.deviceInfo,
                        lastActivity: new Date().toISOString()
                    }
                }
            });
        } catch (error) {
            console.error('Failed to sync session:', error);
        }
    }

    async registerDevice(): Promise<void> {
        if (!this.deviceInfo) return;

        try {
            await this.apolloClient.mutate({
                mutation: REGISTER_DEVICE_MUTATION,
                variables: {
                    input: this.deviceInfo
                }
            });
        } catch (error) {
            console.error('Failed to register device:', error);
        }
    }

    async registerPushToken(): Promise<void> {
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') return;

            const token = await Notifications.getExpoPushTokenAsync();
            
            await this.apolloClient.mutate({
                mutation: REGISTER_PUSH_TOKEN_MUTATION,
                variables: {
                    input: {
                        token: token.data,
                        deviceId: this.deviceInfo?.deviceId,
                        platform: Platform.OS
                    }
                }
            });
        } catch (error) {
            console.error('Failed to register push token:', error);
        }
    }

    /**
     * Tier and Permission Operations
     */
    async getMyTier(): Promise<any> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_MY_TIER_QUERY
            });

            return data?.getMyTier;
        } catch (error) {
            return null;
        }
    }

    async getMyPermissions(): Promise<string[]> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_MY_PERMISSIONS_QUERY
            });

            return data?.getMyPermissions?.permissions || [];
        } catch (error) {
            return [];
        }
    }

    async checkPermission(permission: string, resource?: string): Promise<boolean> {
        try {
            const { data } = await this.apolloClient.query({
                query: CHECK_PERMISSION_QUERY,
                variables: {
                    input: { permission, resource }
                }
            });

            return data?.checkPermission?.hasPermission || false;
        } catch (error) {
            return false;
        }
    }

    async getUserFeatures(): Promise<string[]> {
        try {
            const { data } = await this.apolloClient.query({
                query: GET_USER_FEATURES_QUERY
            });

            return data?.getUserFeatures ? JSON.parse(data.getUserFeatures) : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Onboarding Operations
     */
    async startOnboarding(): Promise<{ sessionId: string; currentStep: number }> {
        try {
            const { data } = await this.apolloClient.mutate({
                mutation: START_ONBOARDING_MUTATION,
                variables: { input: {} }
            });

            return data?.startOnboarding || { sessionId: '', currentStep: 1 };
        } catch (error) {
            throw new Error('Failed to start onboarding');
        }
    }

    async submitOnboardingStep(sessionId: string, step: number, stepData: any): Promise<any> {
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

            return data?.submitOnboardingStep;
        } catch (error) {
            throw new Error('Failed to submit onboarding step');
        }
    }

    async completeOnboarding(sessionId: string, selectedTier: string): Promise<any> {
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

            return data?.completeOnboarding;
        } catch (error) {
            throw new Error('Failed to complete onboarding');
        }
    }

    /**
     * Utility Methods
     */
    private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
        await secureStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }

    private async clearAuthData(): Promise<void> {
        await secureStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        await appStorage.delete(STORAGE_KEYS.USER_ID);
        await appStorage.delete(STORAGE_KEYS.TENANT_ID);
        await this.apolloClient.clearStore();
    }

    private async getDeviceId(): Promise<string> {
        // Implementation depends on your device ID strategy
        return 'mobile-device-' + Math.random().toString(36).substr(2, 9);
    }

    private async getDeviceName(): Promise<string> {
        // Implementation depends on your device name strategy
        return `${Platform.OS} Device`;
    }

    private async getAppVersion(): Promise<string> {
        // Implementation depends on your app version strategy
        return '1.0.0';
    }

    private async generateDeviceFingerprint(): Promise<string> {
        // Implementation depends on your fingerprinting strategy
        return Platform.OS + '-' + Math.random().toString(36).substr(2, 9);
    }
}