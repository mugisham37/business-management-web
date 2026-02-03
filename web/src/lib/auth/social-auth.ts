/**
 * Social Authentication Manager
 * 
 * Provides a unified interface for social authentication operations:
 * - OAuth callback handling
 * - Provider-specific login flows
 * - Token exchange with backend
 * 
 * Works with the foundation layer's useSocialAuth hook and TokenManager
 */

import { TokenManager } from './token-manager';
import { AuthEventEmitter } from './auth-events';

export type SocialProvider = 'google' | 'facebook' | 'github';

export interface SocialAuthResult {
  user: {
    id: string;
    email: string;
    displayName?: string;
    avatar?: string;
    provider: SocialProvider;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  isNewUser?: boolean;
}

export interface SocialAuthState {
  code: string;
  state: string;
  provider: SocialProvider;
}

class SocialAuthManagerClass {
  private static instance: SocialAuthManagerClass;
  private graphqlEndpoint: string;
  private pendingStates: Map<string, { provider: SocialProvider; tenantId?: string; action?: string }> = new Map();

  constructor() {
    this.graphqlEndpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql';
  }

  static getInstance(): SocialAuthManagerClass {
    if (!SocialAuthManagerClass.instance) {
      SocialAuthManagerClass.instance = new SocialAuthManagerClass();
    }
    return SocialAuthManagerClass.instance;
  }

  /**
   * Generate a random state parameter for OAuth
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      // Fallback for non-browser environments
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store OAuth state for verification
   */
  storeState(state: string, data: { provider: SocialProvider; tenantId?: string; action?: string }): void {
    this.pendingStates.set(state, data);
    
    // Also store in sessionStorage for page reloads
    if (typeof window !== 'undefined') {
      try {
        const storedStates = JSON.parse(sessionStorage.getItem('oauth_states') || '{}');
        storedStates[state] = { ...data, timestamp: Date.now() };
        sessionStorage.setItem('oauth_states', JSON.stringify(storedStates));
      } catch {
        // Ignore storage errors
      }
    }
  }

  /**
   * Retrieve and validate OAuth state
   */
  validateState(state: string): { provider: SocialProvider; tenantId?: string; action?: string } | null {
    // Check memory first
    if (this.pendingStates.has(state)) {
      const data = this.pendingStates.get(state)!;
      this.pendingStates.delete(state);
      return data;
    }

    // Check sessionStorage
    if (typeof window !== 'undefined') {
      try {
        const storedStates = JSON.parse(sessionStorage.getItem('oauth_states') || '{}');
        if (storedStates[state]) {
          const data = storedStates[state];
          delete storedStates[state];
          sessionStorage.setItem('oauth_states', JSON.stringify(storedStates));
          
          // Verify state isn't too old (5 minutes max)
          if (Date.now() - data.timestamp < 5 * 60 * 1000) {
            return { provider: data.provider, tenantId: data.tenantId, action: data.action };
          }
        }
      } catch {
        // Ignore storage errors
      }
    }

    return null;
  }

  /**
   * Initiate social authentication flow
   */
  async initiateAuth(provider: SocialProvider, options?: { 
    tenantId?: string; 
    action?: 'login' | 'link';
    popup?: boolean;
  }): Promise<string> {
    const state = this.generateState();
    this.storeState(state, { 
      provider, 
      ...(options?.tenantId && { tenantId: options.tenantId }),
      ...(options?.action && { action: options.action })
    });

    // Request OAuth URL from backend
    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TokenManager.getAccessToken() && {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`
        })
      },
      body: JSON.stringify({
        query: `
          mutation GetOAuthUrl($input: GetOAuthUrlInput!) {
            getOAuthUrl(input: $input) {
              url
              state
            }
          }
        `,
        variables: {
          input: {
            provider: provider.toUpperCase(),
            tenantId: options?.tenantId,
            action: options?.action,
            state,
          }
        }
      })
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to get OAuth URL');
    }

    const oauthUrl = result.data?.getOAuthUrl?.url;
    if (!oauthUrl) {
      throw new Error('No OAuth URL received');
    }

    return oauthUrl;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(
    provider: SocialProvider, 
    code: string, 
    state: string
  ): Promise<SocialAuthResult> {
    // Validate state
    const stateData = this.validateState(state);
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    if (stateData.provider !== provider) {
      throw new Error('Provider mismatch in OAuth callback');
    }

    // Exchange code for tokens via backend
    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(TokenManager.getAccessToken() && {
          'Authorization': `Bearer ${TokenManager.getAccessToken()}`
        })
      },
      body: JSON.stringify({
        query: `
          mutation OAuthLogin($input: OAuthLoginInput!) {
            oauthLogin(input: $input) {
              user {
                id
                email
                displayName
                avatar
              }
              accessToken
              refreshToken
              expiresIn
              tokenType
              requiresMfa
            }
          }
        `,
        variables: {
          input: {
            provider: provider.toUpperCase(),
            code,
            state,
            tenantId: stateData.tenantId,
          }
        }
      })
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'OAuth authentication failed');
    }

    const loginData = result.data?.oauthLogin;
    if (!loginData) {
      throw new Error('No authentication data received');
    }

    // Store tokens
    TokenManager.setTokens({
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      expiresIn: loginData.expiresIn,
      tokenType: loginData.tokenType,
    });

    // Emit login event
    AuthEventEmitter.emit('auth:login', loginData.user);
    AuthEventEmitter.emit('social:provider_linked', provider);

    return {
      user: {
        ...loginData.user,
        provider,
      },
      accessToken: loginData.accessToken,
      refreshToken: loginData.refreshToken,
      expiresIn: loginData.expiresIn,
      isNewUser: false, // Backend should indicate this
    };
  }

  /**
   * Link a social provider to existing account
   */
  async linkProvider(
    provider: SocialProvider, 
    code: string, 
    state: string
  ): Promise<boolean> {
    const stateData = this.validateState(state);
    if (!stateData) {
      throw new Error('Invalid or expired OAuth state');
    }

    const response = await fetch(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TokenManager.getAccessToken()}`
      },
      body: JSON.stringify({
        query: `
          mutation LinkSocialProvider($input: LinkSocialProviderInput!) {
            linkSocialProvider(input: $input) {
              success
              provider {
                provider
                email
                linkedAt
              }
            }
          }
        `,
        variables: {
          input: {
            provider: provider.toUpperCase(),
            code,
            state,
          }
        }
      })
    });

    const result = await response.json();

    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to link provider');
    }

    const success = result.data?.linkSocialProvider?.success;
    if (success) {
      AuthEventEmitter.emit('social:provider_linked', provider);
    }

    return success || false;
  }

  /**
   * Get supported providers
   */
  getSupportedProviders(): SocialProvider[] {
    return ['google', 'facebook', 'github'];
  }

  /**
   * Get provider display info
   */
  getProviderInfo(provider: SocialProvider): { name: string; icon: string; color: string } {
    const providers = {
      google: { name: 'Google', icon: '🔍', color: '#4285F4' },
      facebook: { name: 'Facebook', icon: '📘', color: '#1877F2' },
      github: { name: 'GitHub', icon: '🐙', color: '#333333' },
    };
    return providers[provider];
  }
}

// Export singleton instance
export const socialAuthManager = SocialAuthManagerClass.getInstance();

// Export class for testing
export { SocialAuthManagerClass };
