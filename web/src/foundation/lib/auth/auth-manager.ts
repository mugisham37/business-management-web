/**
 * Auth Manager
 * 
 * Handles authentication flows (login, MFA, logout), manages user state,
 * and coordinates with Token Manager.
 * 
 * Features:
 * - Login with email/password
 * - Google OAuth login
 * - MFA verification
 * - Session management (logout, logout all devices)
 * - Session restoration
 * - MFA enrollment/disable
 * - Password management (change, reset, request reset)
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.8, 6.4, 6.5, 13.1, 13.6, 14.1, 14.2, 14.3
 */

import { ApolloClient } from '@apollo/client';
import { TokenManager } from './token-manager';
import {
  LoginDocument,
  LoginMutation,
  LoginMutationVariables,
  LoginWithGoogleDocument,
  LoginWithGoogleMutation,
  LoginWithGoogleMutationVariables,
  VerifyMfaDocument,
  VerifyMfaMutation,
  VerifyMfaMutationVariables,
  LogoutDocument,
  LogoutMutation,
  LogoutAllDevicesDocument,
  LogoutAllDevicesMutation,
  MeDocument,
  MeQuery,
  EnableMfaDocument,
  EnableMfaMutation,
  DisableMfaDocument,
  DisableMfaMutation,
  DisableMfaMutationVariables,
  ChangePasswordDocument,
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
  RequestPasswordResetDocument,
  RequestPasswordResetMutation,
  RequestPasswordResetMutationVariables,
  ResetPasswordDocument,
  ResetPasswordMutation,
  ResetPasswordMutationVariables,
  User,
} from '@/foundation/types/generated/graphql';

/**
 * User interface for the Auth Manager
 * Uses the User type from GraphQL queries which includes all fields
 */
export type AuthUser = MeQuery['me'];

/**
 * MFA setup response
 */
export interface MFASetup {
  qrCode: string;
  secret: string;
  backupCodes: string[];
}

/**
 * Login result
 */
export interface LoginResult {
  requiresMFA: boolean;
  user?: AuthUser;
}

/**
 * Auth Manager interface
 */
export interface AuthManager {
  // Authentication
  login(email: string, password: string, organizationId: string): Promise<LoginResult>;
  loginWithGoogle(code: string, organizationId?: string): Promise<LoginResult>;
  verifyMFA(userId: string, token: string, organizationId: string): Promise<AuthUser>;
  logout(): Promise<void>;
  logoutAllDevices(): Promise<void>;

  // Session
  getCurrentUser(): AuthUser | null;
  isAuthenticated(): boolean;
  restoreSession(): Promise<AuthUser | null>;

  // MFA
  enableMFA(): Promise<MFASetup>;
  disableMFA(password: string, totpToken: string): Promise<void>;

  // Password Management
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  requestPasswordReset(email: string, organizationId?: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

/**
 * Auth Manager Implementation
 */
export class AuthManagerImpl implements AuthManager {
  private currentUser: AuthUser | null = null;
  private tempAccessToken: string | null = null; // Temporary token for MFA flow

  constructor(
    private apolloClient: ApolloClient,
    private tokenManager: TokenManager
  ) {}

  /**
   * Login with email and password
   * Handles MFA flow if required
   */
  async login(
    email: string,
    password: string,
    organizationId: string
  ): Promise<LoginResult> {
    try {
      const response = await this.apolloClient.mutate<
        LoginMutation,
        LoginMutationVariables
      >({
        mutation: LoginDocument,
        variables: { email, password, organizationId },
      });

      if (!response.data?.login) {
        throw new Error('Login failed: No data returned');
      }

      const { accessToken, refreshToken, requiresMFA, user } = response.data.login;

      if (requiresMFA) {
        // Store temporary token for MFA verification
        this.tempAccessToken = accessToken;
        return { requiresMFA: true };
      }

      // Store tokens
      this.tokenManager.setAccessToken(accessToken);
      
      // Fetch full user data
      const meResponse = await this.apolloClient.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: 'network-only',
      });
      
      if (!meResponse.data?.me) {
        throw new Error('Failed to fetch user data after login');
      }
      
      this.currentUser = meResponse.data.me;
      this.tokenManager.startRefreshTimer();

      return { requiresMFA: false, user: this.currentUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(
    code: string,
    organizationId?: string
  ): Promise<LoginResult> {
    try {
      const response = await this.apolloClient.mutate<
        LoginWithGoogleMutation,
        LoginWithGoogleMutationVariables
      >({
        mutation: LoginWithGoogleDocument,
        variables: { code, organizationId },
      });

      if (!response.data?.loginWithGoogle) {
        throw new Error('Google login failed: No data returned');
      }

      const { accessToken, refreshToken, requiresMFA, user } =
        response.data.loginWithGoogle;

      if (requiresMFA) {
        // Store temporary token for MFA verification
        this.tempAccessToken = accessToken;
        return { requiresMFA: true };
      }

      // Store tokens
      this.tokenManager.setAccessToken(accessToken);
      
      // Fetch full user data
      const meResponse = await this.apolloClient.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: 'network-only',
      });
      
      if (!meResponse.data?.me) {
        throw new Error('Failed to fetch user data after Google login');
      }
      
      this.currentUser = meResponse.data.me;
      this.tokenManager.startRefreshTimer();

      return { requiresMFA: false, user: this.currentUser };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  /**
   * Verify MFA code after login
   */
  async verifyMFA(
    userId: string,
    token: string,
    organizationId: string
  ): Promise<AuthUser> {
    try {
      if (!this.tempAccessToken) {
        throw new Error('No temporary token available for MFA verification');
      }

      const response = await this.apolloClient.mutate<
        VerifyMfaMutation,
        VerifyMfaMutationVariables
      >({
        mutation: VerifyMfaDocument,
        variables: { userId, token, organizationId },
        context: {
          headers: {
            authorization: `Bearer ${this.tempAccessToken}`,
          },
        },
      });

      if (!response.data?.verifyMFA) {
        throw new Error('MFA verification failed: No data returned');
      }

      const { accessToken, refreshToken, user } = response.data.verifyMFA;

      // Store tokens
      this.tokenManager.setAccessToken(accessToken);
      this.tempAccessToken = null;
      
      // Fetch full user data
      const meResponse = await this.apolloClient.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: 'network-only',
      });
      
      if (!meResponse.data?.me) {
        throw new Error('Failed to fetch user data');
      }
      
      this.currentUser = meResponse.data.me;
      this.tokenManager.startRefreshTimer();

      return this.currentUser;
    } catch (error) {
      console.error('MFA verification error:', error);
      throw error;
    }
  }

  /**
   * Logout from current device
   */
  async logout(): Promise<void> {
    try {
      await this.apolloClient.mutate<LogoutMutation>({
        mutation: LogoutDocument,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if server logout fails
    } finally {
      // Clear tokens and user state
      this.tokenManager.stopRefreshTimer();
      this.tokenManager.clearAllTokens();
      this.currentUser = null;
      this.tempAccessToken = null;

      // Clear Apollo cache
      await this.apolloClient.clearStore();
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAllDevices(): Promise<void> {
    try {
      await this.apolloClient.mutate<LogoutAllDevicesMutation>({
        mutation: LogoutAllDevicesDocument,
      });
    } catch (error) {
      console.error('Logout all devices error:', error);
      // Continue with local cleanup even if server logout fails
    } finally {
      // Clear tokens and user state
      this.tokenManager.stopRefreshTimer();
      this.tokenManager.clearAllTokens();
      this.currentUser = null;
      this.tempAccessToken = null;

      // Clear Apollo cache
      await this.apolloClient.clearStore();
    }
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.tokenManager.getAccessToken() !== null;
  }

  /**
   * Restore session on page load
   * Attempts to refresh tokens and fetch current user
   */
  async restoreSession(): Promise<AuthUser | null> {
    try {
      // Attempt to refresh tokens using HttpOnly cookie
      const { accessToken } = await this.tokenManager.refreshTokens();

      // Fetch current user
      const response = await this.apolloClient.query<MeQuery>({
        query: MeDocument,
        fetchPolicy: 'network-only', // Always fetch fresh data
      });

      if (!response.data?.me) {
        throw new Error('Failed to fetch current user');
      }

      this.currentUser = response.data.me;
      this.tokenManager.startRefreshTimer();

      return this.currentUser;
    } catch (error) {
      console.error('Session restoration failed:', error);
      // No valid session
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Enable MFA for current user
   * Returns QR code and secret for authenticator app setup
   */
  async enableMFA(): Promise<MFASetup> {
    try {
      const response = await this.apolloClient.mutate<EnableMfaMutation>({
        mutation: EnableMfaDocument,
      });

      if (!response.data?.enableMFA) {
        throw new Error('Failed to enable MFA: No data returned');
      }

      const { qrCodeUrl, secret, backupCodes } = response.data.enableMFA;

      return {
        qrCode: qrCodeUrl,
        secret,
        backupCodes,
      };
    } catch (error) {
      console.error('Enable MFA error:', error);
      throw error;
    }
  }

  /**
   * Disable MFA for current user
   * Requires current password for security
   */
  async disableMFA(password: string, totpToken: string): Promise<void> {
    try {
      const response = await this.apolloClient.mutate<
        DisableMfaMutation,
        DisableMfaMutationVariables
      >({
        mutation: DisableMfaDocument,
        variables: { currentPassword: password, totpToken },
      });

      if (!response.data?.disableMFA) {
        throw new Error('Failed to disable MFA');
      }

      // Update current user's MFA status
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          mfaEnabled: false,
        };
      }
    } catch (error) {
      console.error('Disable MFA error:', error);
      throw error;
    }
  }

  /**
   * Change password for current user
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const response = await this.apolloClient.mutate<
        ChangePasswordMutation,
        ChangePasswordMutationVariables
      >({
        mutation: ChangePasswordDocument,
        variables: { currentPassword, newPassword },
      });

      if (!response.data?.changePassword) {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Request password reset email
   */
  async requestPasswordReset(
    email: string,
    organizationId?: string
  ): Promise<void> {
    try {
      const response = await this.apolloClient.mutate<
        RequestPasswordResetMutation,
        RequestPasswordResetMutationVariables
      >({
        mutation: RequestPasswordResetDocument,
        variables: { email, organizationId },
      });

      if (!response.data?.requestPasswordReset) {
        throw new Error('Failed to request password reset');
      }
    } catch (error) {
      console.error('Request password reset error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token from email
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await this.apolloClient.mutate<
        ResetPasswordMutation,
        ResetPasswordMutationVariables
      >({
        mutation: ResetPasswordDocument,
        variables: { token, newPassword },
      });

      if (!response.data?.resetPassword) {
        throw new Error('Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
}

// Singleton instance (will be initialized with Apollo Client and Token Manager)
let authManagerInstance: AuthManager | null = null;

/**
 * Initialize the auth manager with Apollo Client and Token Manager
 */
export function initializeAuthManager(
  apolloClient: ApolloClient,
  tokenManager: TokenManager
): AuthManager {
  if (!authManagerInstance) {
    authManagerInstance = new AuthManagerImpl(apolloClient, tokenManager);
  }
  return authManagerInstance;
}

/**
 * Get the auth manager instance
 * Throws error if not initialized
 */
export function getAuthManager(): AuthManager {
  if (!authManagerInstance) {
    throw new Error(
      'AuthManager not initialized. Call initializeAuthManager first.'
    );
  }
  return authManagerInstance;
}
