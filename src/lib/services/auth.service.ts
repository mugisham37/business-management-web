/**
 * AuthService
 * 
 * Handles all authentication operations including registration, login, logout,
 * password changes, and token management.
 * 
 * Features:
 * - Request/response transformation
 * - Centralized error handling
 * - Token management integration
 * - Cache updates after mutations
 * 
 * Requirements: 4.1, 4.8, 4.9, 4.10
 */

import { ApolloClient } from '@apollo/client';
import {
  REGISTER_OWNER,
  LOGIN,
  LOGIN_WITH_PIN,
  REFRESH_TOKEN,
  LOGOUT,
  CHANGE_PASSWORD,
} from '@/graphql/mutations/auth';
import { errorHandler } from '@/lib/errors/error-handler';
import { tokenManager } from '@/lib/auth/token-manager';

/**
 * Input types for authentication operations
 */
export interface RegisterOwnerInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  phoneNumber?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginWithPinInput {
  email: string;
  pin: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * Response types for authentication operations
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    hierarchyLevel: number;
    organizationId: string;
  };
}

export interface RegisterOwnerResponse extends AuthResponse {
  user: AuthResponse['user'] & {
    organizationId: string;
  };
}

/**
 * AuthService class
 * Provides methods for all authentication operations
 */
export class AuthService {
  constructor(
    private apolloClient: ApolloClient
  ) {}

  /**
   * Register a new organization owner
   * Creates a new organization and owner user account
   * 
   * @param input - Registration data
   * @returns Authentication response with tokens and user data
   * @throws AppError on failure
   * 
   * Requirements: 4.1, 4.8, 4.9, 4.10
   */
  async registerOwner(input: RegisterOwnerInput): Promise<RegisterOwnerResponse> {
    try {
      // Transform input if needed (Requirements: 4.8)
      const transformedInput = this.transformRegisterOwnerInput(input);

      const { data } = await this.apolloClient.mutate<{ registerOwner: AuthResponse }>({
        mutation: REGISTER_OWNER,
        variables: { input: transformedInput },
      });

      if (!data?.registerOwner) {
        throw new Error('No data returned from registerOwner mutation');
      }

      // Transform response (Requirements: 4.9)
      const response = this.transformAuthResponse(data.registerOwner);

      // Store tokens
      tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error) {
      // Centralized error handling (Requirements: 4.10)
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Login with email and password
   * 
   * @param input - Login credentials
   * @returns Authentication response with tokens and user data
   * @throws AppError on failure
   * 
   * Requirements: 4.1, 4.8, 4.9, 4.10
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    try {
      const transformedInput = this.transformLoginInput(input);

      const { data } = await this.apolloClient.mutate<{ login: AuthResponse }>({
        mutation: LOGIN,
        variables: { input: transformedInput },
      });

      if (!data?.login) {
        throw new Error('No data returned from login mutation');
      }

      const response = this.transformAuthResponse(data.login);

      // Store tokens
      tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Login with email and PIN
   * Alternative authentication method for workers
   * 
   * @param input - Login credentials with PIN
   * @returns Authentication response with tokens and user data
   * @throws AppError on failure
   * 
   * Requirements: 4.1, 4.8, 4.9, 4.10
   */
  async loginWithPin(input: LoginWithPinInput): Promise<AuthResponse> {
    try {
      const transformedInput = this.transformLoginWithPinInput(input);

      const { data } = await this.apolloClient.mutate<{ loginWithPin: AuthResponse }>({
        mutation: LOGIN_WITH_PIN,
        variables: { input: transformedInput },
      });

      if (!data?.loginWithPin) {
        throw new Error('No data returned from loginWithPin mutation');
      }

      const response = this.transformAuthResponse(data.loginWithPin);

      // Store tokens
      tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Refresh access token using refresh token
   * Used for automatic token renewal
   * 
   * @param input - Refresh token
   * @returns New authentication response with fresh tokens
   * @throws AppError on failure
   * 
   * Requirements: 4.1, 4.8, 4.9, 4.10
   */
  async refreshToken(input: RefreshTokenInput): Promise<AuthResponse> {
    try {
      const { data } = await this.apolloClient.mutate<{ refreshToken: AuthResponse }>({
        mutation: REFRESH_TOKEN,
        variables: { input },
      });

      if (!data?.refreshToken) {
        throw new Error('No data returned from refreshToken mutation');
      }

      const response = this.transformAuthResponse(data.refreshToken);

      // Update stored tokens
      tokenManager.setTokens(response.accessToken, response.refreshToken);

      return response;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      
      // Clear tokens on refresh failure
      tokenManager.clearTokens();
      
      throw appError;
    }
  }

  /**
   * Logout current user
   * Revokes the current session and clears tokens
   * 
   * @returns Success boolean
   * @throws AppError on failure
   * 
   * Requirements: 4.1, 4.10
   */
  async logout(): Promise<boolean> {
    try {
      const { data } = await this.apolloClient.mutate<{ logout: boolean }>({
        mutation: LOGOUT,
      });

      // Clear tokens regardless of server response
      tokenManager.clearTokens();

      // Clear Apollo cache
      await this.apolloClient.clearStore();

      return data?.logout ?? true;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      
      // Clear tokens even on error
      tokenManager.clearTokens();
      
      throw appError;
    }
  }

  /**
   * Change user password
   * Requires current password for verification
   * 
   * @param input - Current and new passwords
   * @returns Success boolean
   * @throws AppError on failure
   * 
   * Requirements: 4.1, 4.8, 4.10
   */
  async changePassword(input: ChangePasswordInput): Promise<boolean> {
    try {
      const transformedInput = this.transformChangePasswordInput(input);

      const { data } = await this.apolloClient.mutate<{ changePassword: boolean }>({
        mutation: CHANGE_PASSWORD,
        variables: { input: transformedInput },
      });

      return data?.changePassword ?? false;
    } catch (error) {
      const appError = errorHandler.handle(error);
      errorHandler.logError(appError);
      throw appError;
    }
  }

  /**
   * Transform register owner input to GraphQL format
   * Requirements: 4.8
   */
  private transformRegisterOwnerInput(input: RegisterOwnerInput): RegisterOwnerInput {
    return {
      email: input.email.trim().toLowerCase(),
      password: input.password,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      organizationName: input.organizationName.trim(),
      phoneNumber: input.phoneNumber?.trim(),
    };
  }

  /**
   * Transform login input to GraphQL format
   * Requirements: 4.8
   */
  private transformLoginInput(input: LoginInput): LoginInput {
    return {
      email: input.email.trim().toLowerCase(),
      password: input.password,
    };
  }

  /**
   * Transform login with PIN input to GraphQL format
   * Requirements: 4.8
   */
  private transformLoginWithPinInput(input: LoginWithPinInput): LoginWithPinInput {
    return {
      email: input.email.trim().toLowerCase(),
      pin: input.pin.trim(),
    };
  }

  /**
   * Transform change password input to GraphQL format
   * Requirements: 4.8
   */
  private transformChangePasswordInput(input: ChangePasswordInput): ChangePasswordInput {
    return {
      currentPassword: input.currentPassword,
      newPassword: input.newPassword,
    };
  }

  /**
   * Transform authentication response to application format
   * Requirements: 4.9
   */
  private transformAuthResponse(data: any): AuthResponse {
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      user: {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        hierarchyLevel: data.user.hierarchyLevel,
        organizationId: data.user.organizationId,
      },
    };
  }
}

/**
 * Export singleton instance
 * Import apolloClient at runtime to avoid circular dependencies
 */
let authServiceInstance: AuthService | null = null;

export const getAuthService = (): AuthService => {
  if (!authServiceInstance) {
    // Import at runtime to avoid circular dependency
    const { apolloClient } = require('@/lib/api/apollo-client');
    authServiceInstance = new AuthService(apolloClient);
  }
  return authServiceInstance;
};

export const authService = getAuthService();
