/**
 * Social Authentication Service
 * Handles OAuth flows for Google, Facebook, and other social providers
 */

export interface SocialAuthProvider {
  id: 'google' | 'facebook' | 'github';
  name: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface SocialAuthResult {
  provider: string;
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    name: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
  requiresOnboarding?: boolean;
}

export interface SocialAuthError {
  code: string;
  message: string;
  provider: string;
}

/**
 * Social Authentication Manager
 * Manages OAuth flows for multiple social providers
 */
export class SocialAuthManager {
  private providers: Map<string, SocialAuthProvider> = new Map();
  private popupWindow: Window | null = null;
  private initialized = false;

  constructor() {
    // Defer initialization until first use (client-side only)
  }

  /**
   * Initialize social auth providers (lazy initialization)
   */
  private initializeProviders(): void {
    if (this.initialized || typeof window === 'undefined') {
      return;
    }
    
    this.initialized = true;
    
    // Google OAuth configuration
    this.providers.set('google', {
      id: 'google',
      name: 'Google',
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/google`,
      scopes: ['openid', 'email', 'profile'],
    });

    // Facebook OAuth configuration
    this.providers.set('facebook', {
      id: 'facebook',
      name: 'Facebook',
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/facebook`,
      scopes: ['email', 'public_profile'],
    });

    // GitHub OAuth configuration
    this.providers.set('github', {
      id: 'github',
      name: 'GitHub',
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '',
      redirectUri: `${window.location.origin}/auth/callback/github`,
      scopes: ['user:email', 'read:user'],
    });
  }

  /**
   * Ensure providers are initialized before use
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      this.initializeProviders();
    }
  }

  /**
   * Get OAuth authorization URL for a provider
   */
  private getAuthUrl(providerId: string): string {
    this.ensureInitialized();
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not configured`);
    }

    const params = new URLSearchParams();
    const state = this.generateState();
    
    // Store state for validation
    sessionStorage.setItem(`oauth_state_${providerId}`, state);

    switch (providerId) {
      case 'google':
        params.append('client_id', provider.clientId);
        params.append('redirect_uri', provider.redirectUri);
        params.append('response_type', 'code');
        params.append('scope', provider.scopes.join(' '));
        params.append('state', state);
        params.append('access_type', 'offline');
        params.append('prompt', 'consent');
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      case 'facebook':
        params.append('client_id', provider.clientId);
        params.append('redirect_uri', provider.redirectUri);
        params.append('response_type', 'code');
        params.append('scope', provider.scopes.join(','));
        params.append('state', state);
        return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;

      case 'github':
        params.append('client_id', provider.clientId);
        params.append('redirect_uri', provider.redirectUri);
        params.append('scope', provider.scopes.join(' '));
        params.append('state', state);
        return `https://github.com/login/oauth/authorize?${params.toString()}`;

      default:
        throw new Error(`Unsupported provider: ${providerId}`);
    }
  }

  /**
   * Generate secure state parameter for OAuth
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Initiate OAuth flow with popup window
   */
  async authenticateWithPopup(providerId: string): Promise<SocialAuthResult> {
    return new Promise((resolve, reject) => {
      try {
        const authUrl = this.getAuthUrl(providerId);
        
        // Open popup window
        this.popupWindow = window.open(
          authUrl,
          `${providerId}_oauth`,
          'width=500,height=600,scrollbars=yes,resizable=yes'
        );

        if (!this.popupWindow) {
          throw new Error('Failed to open popup window. Please allow popups for this site.');
        }

        // Listen for popup messages
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) {
            return;
          }

          if (event.data.type === 'OAUTH_SUCCESS') {
            window.removeEventListener('message', messageListener);
            this.popupWindow?.close();
            resolve(event.data.result);
          } else if (event.data.type === 'OAUTH_ERROR') {
            window.removeEventListener('message', messageListener);
            this.popupWindow?.close();
            reject(new Error(event.data.error.message));
          }
        };

        window.addEventListener('message', messageListener);

        // Check if popup was closed manually
        const checkClosed = setInterval(() => {
          if (this.popupWindow?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            reject(new Error('Authentication was cancelled'));
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageListener);
          if (this.popupWindow && !this.popupWindow.closed) {
            this.popupWindow.close();
          }
          reject(new Error('Authentication timeout'));
        }, 300000);

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Initiate OAuth flow with redirect
   */
  async authenticateWithRedirect(providerId: string): Promise<void> {
    const authUrl = this.getAuthUrl(providerId);
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(providerId: string, code: string, state: string): Promise<SocialAuthResult> {
    // Validate state parameter
    const storedState = sessionStorage.getItem(`oauth_state_${providerId}`);
    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter');
    }

    // Clean up stored state
    sessionStorage.removeItem(`oauth_state_${providerId}`);

    // Exchange code for tokens
    const result = await this.exchangeCodeForTokens(providerId, code);
    return result;
  }

  /**
   * Exchange authorization code for access tokens
   */
  private async exchangeCodeForTokens(providerId: string, code: string): Promise<SocialAuthResult> {
    this.ensureInitialized();
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not configured`);
    }

    try {
      // Import Apollo Client and mutation dynamically to avoid SSR issues
      const { apolloClient } = await import('@/lib/apollo/client');
      const { OAUTH_LOGIN_MUTATION } = await import('@/lib/graphql/mutations/auth');

      // Get tenant ID (you might want to get this from context or config)
      const tenantId = process.env.NEXT_PUBLIC_DEFAULT_TENANT || 'default-tenant';

      // Call GraphQL mutation to exchange code for tokens
      const { data } = await apolloClient.mutate({
        mutation: OAUTH_LOGIN_MUTATION,
        variables: {
          input: {
            provider: providerId,
            code,
            state: sessionStorage.getItem(`oauth_state_${providerId}`) || '',
            tenantId,
          },
        },
      });

      if (!data?.oauthLogin) {
        throw new Error('OAuth login failed');
      }

      const { user, accessToken, refreshToken, requiresOnboarding } = data.oauthLogin;

      return {
        provider: providerId,
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.displayName || `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
        requiresOnboarding,
      };
    } catch (error) {
      console.error(`Failed to exchange code for tokens (${providerId}):`, error);
      throw error;
    }
  }

  /**
   * Get user profile from social provider
   */
  async getUserProfile(providerId: string, accessToken: string): Promise<Record<string, unknown>> {
    try {
      let profileUrl: string;
      
      switch (providerId) {
        case 'google':
          profileUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
          break;
        case 'facebook':
          profileUrl = 'https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture';
          break;
        case 'github':
          profileUrl = 'https://api.github.com/user';
          break;
        default:
          throw new Error(`Unsupported provider: ${providerId}`);
      }

      const response = await fetch(profileUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to get user profile (${providerId}):`, error);
      throw error;
    }
  }

  /**
   * Check if provider is configured
   */
  isProviderConfigured(providerId: string): boolean {
    this.ensureInitialized();
    const provider = this.providers.get(providerId);
    return !!(provider && provider.clientId);
  }

  /**
   * Get available providers
   */
  getAvailableProviders(): SocialAuthProvider[] {
    this.ensureInitialized();
    return Array.from(this.providers.values()).filter(provider => 
      this.isProviderConfigured(provider.id)
    );
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    if (this.popupWindow && !this.popupWindow.closed) {
      this.popupWindow.close();
    }
  }
}

// Export singleton instance
export const socialAuthManager = new SocialAuthManager();

// Clean up on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    socialAuthManager.cleanup();
  });
}