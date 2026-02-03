'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { AuthEventEmitter } from '../../auth/auth-events';
import {
  GET_LINKED_PROVIDERS,
  GET_OAUTH_URL,
  GET_AVAILABLE_PROVIDERS,
  OAUTH_LOGIN,
  LINK_SOCIAL_PROVIDER,
  UNLINK_SOCIAL_PROVIDER,
  REFRESH_SOCIAL_TOKEN,
  VERIFY_SOCIAL_EMAIL,
  SOCIAL_AUTH_EVENTS,
  PROVIDER_STATUS_CHANGED,
} from '../../graphql/operations/social-auth';
import type {
  SocialProvider,
  LoginResponse,
} from '../../graphql/generated/types';

/**
 * Social Authentication Hook
 * 
 * Provides comprehensive social authentication management with:
 * - OAuth provider integration (Google, Facebook, GitHub)
 * - Provider linking/unlinking
 * - Social login operations
 * - Provider status monitoring
 * - Real-time social auth events
 */

interface SocialAuthState {
  linkedProviders: SocialProvider[];
  availableProviders: unknown[];
  isLoading: boolean;
  error: string | null;
  isLinking: boolean;
  isUnlinking: boolean;
}

interface SocialAuthOperations {
  oauthLogin: (provider: string, tenantId: string) => Promise<LoginResponse>;
  linkProvider: (provider: string) => Promise<boolean>;
  unlinkProvider: (provider: string) => Promise<boolean>;
  refreshProviderToken: (provider: string) => Promise<boolean>;
  verifyProviderEmail: (provider: string, email: string) => Promise<boolean>;
  getOAuthUrl: (provider: string, tenantId: string) => Promise<string>;
  refreshProviders: () => Promise<void>;
  clearError: () => void;
}

interface UseSocialAuthReturn extends SocialAuthState, SocialAuthOperations {
  // Provider utilities
  isProviderLinked: (provider: string) => boolean;
  getLinkedProvider: (provider: string) => SocialProvider | null;
  getProviderInfo: (provider: string) => unknown;
  canLinkProvider: (provider: string) => boolean;
  canUnlinkProvider: (provider: string) => boolean;
  
  // Computed properties
  linkedProviderCount: number;
  hasLinkedProviders: boolean;
  availableProviderCount: number;
  
  // Aliases for backwards compatibility
  connectedProviders: SocialProvider[];
  supportedProviders: string[];
}

export function useSocialAuth(): UseSocialAuthReturn {
  const [socialAuthState, setSocialAuthState] = useState<SocialAuthState>({
    linkedProviders: [],
    availableProviders: [],
    isLoading: false,
    error: null,
    isLinking: false,
    isUnlinking: false,
  });

  // GraphQL operations
  const { data: linkedData, loading: linkedLoading, refetch: refetchLinked } = useQuery(
    GET_LINKED_PROVIDERS,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: availableData, loading: availableLoading } = useQuery(
    GET_AVAILABLE_PROVIDERS,
    {
      errorPolicy: 'all',
    }
  );

  const [getOAuthUrlMutation] = useMutation(GET_OAUTH_URL, {
    errorPolicy: 'all',
  });

  const [oauthLoginMutation, { loading: loginLoading }] = useMutation(OAUTH_LOGIN, {
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data.oauthLogin) {
        AuthEventEmitter.emit('auth:login', data.oauthLogin.user);
        AuthEventEmitter.emit('social:provider_linked', data.oauthLogin.user);
      }
    },
    onError: (error) => {
      setSocialAuthState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
      }));
    },
  });

  const [linkProviderMutation, { loading: linkLoading }] = useMutation(LINK_SOCIAL_PROVIDER, {
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data.linkSocialProvider.success) {
        AuthEventEmitter.emit('social:provider_linked', data.linkSocialProvider.provider.provider);
        refetchLinked();
      }
    },
    onError: (error) => {
      setSocialAuthState(prev => ({
        ...prev,
        error: error.message,
        isLinking: false,
      }));
    },
  });

  const [unlinkProviderMutation, { loading: unlinkLoading }] = useMutation(UNLINK_SOCIAL_PROVIDER, {
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data.unlinkSocialProvider.success) {
        AuthEventEmitter.emit('social:provider_unlinked', data.unlinkSocialProvider.provider);
        refetchLinked();
      }
    },
    onError: (error) => {
      setSocialAuthState(prev => ({
        ...prev,
        error: error.message,
        isUnlinking: false,
      }));
    },
  });

  const [refreshTokenMutation] = useMutation(REFRESH_SOCIAL_TOKEN, {
    errorPolicy: 'all',
  });

  const [verifyEmailMutation] = useMutation(VERIFY_SOCIAL_EMAIL, {
    errorPolicy: 'all',
  });

  // Subscriptions
  useSubscription(SOCIAL_AUTH_EVENTS, {
    onData: ({ data }) => {
      if (data.data?.socialAuthEvents) {
        const event = data.data.socialAuthEvents;
        AuthEventEmitter.emit('social:auth_event', event);
        
        // Refresh providers on relevant events
        if (['PROVIDER_LINKED', 'PROVIDER_UNLINKED'].includes(event.type)) {
          refetchLinked();
        }
      }
    },
  });

  useSubscription(PROVIDER_STATUS_CHANGED, {
    onData: ({ data }) => {
      if (data.data?.providerStatusChanged) {
        const event = data.data.providerStatusChanged;
        AuthEventEmitter.emit('social:provider_status_changed', event);
      }
    },
  });

  // Update state when data changes
  useEffect(() => {
    setSocialAuthState(prev => ({
      ...prev,
      linkedProviders: linkedData?.linkedProviders || [],
      isLoading: linkedLoading || availableLoading,
    }));
  }, [linkedData, linkedLoading, availableLoading]);

  useEffect(() => {
    setSocialAuthState(prev => ({
      ...prev,
      availableProviders: availableData?.availableProviders || [],
    }));
  }, [availableData]);

  useEffect(() => {
    setSocialAuthState(prev => ({
      ...prev,
      isLinking: linkLoading,
      isUnlinking: unlinkLoading,
      isLoading: loginLoading || linkLoading || unlinkLoading,
    }));
  }, [loginLoading, linkLoading, unlinkLoading]);

  // Operations
  const oauthLogin = useCallback(async (provider: string, tenantId: string): Promise<LoginResponse> => {
    try {
      setSocialAuthState(prev => ({ ...prev, error: null, isLoading: true }));

      // First get OAuth URL
      const urlResult = await getOAuthUrlMutation({
        variables: {
          input: { provider, tenantId }
        }
      });

      if (!urlResult.data?.getOAuthUrl?.url) {
        throw new Error('Failed to get OAuth URL');
      }

      // Open OAuth popup
      const popup = window.open(
        urlResult.data.getOAuthUrl.url,
        'oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Wait for OAuth callback
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            reject(new Error('OAuth cancelled'));
          }
        }, 1000);

        // Listen for OAuth callback
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', handleMessage);

            // Complete OAuth login
            oauthLoginMutation({
              variables: {
                input: {
                  provider,
                  code: event.data.code,
                  state: event.data.state,
                  tenantId,
                }
              }
            }).then(result => {
              if (result.data?.oauthLogin) {
                resolve(result.data.oauthLogin);
              } else {
                reject(new Error('OAuth login failed'));
              }
            }).catch(reject);
          } else if (event.data.type === 'OAUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', handleMessage);
            reject(new Error(event.data.error || 'OAuth failed'));
          }
        };

        window.addEventListener('message', handleMessage);
      });
    } catch (error) {
      setSocialAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'OAuth login failed',
        isLoading: false,
      }));
      throw error;
    }
  }, [getOAuthUrlMutation, oauthLoginMutation]);

  const linkProvider = useCallback(async (provider: string): Promise<boolean> => {
    try {
      setSocialAuthState(prev => ({ ...prev, error: null, isLinking: true }));

      // Get OAuth URL for linking
      const urlResult = await getOAuthUrlMutation({
        variables: {
          input: { provider, action: 'link' }
        }
      });

      if (!urlResult.data?.getOAuthUrl?.url) {
        throw new Error('Failed to get OAuth URL');
      }

      // Open OAuth popup
      const popup = window.open(
        urlResult.data.getOAuthUrl.url,
        'oauth-link',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Wait for OAuth callback
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setSocialAuthState(prev => ({ ...prev, isLinking: false }));
            reject(new Error('OAuth cancelled'));
          }
        }, 1000);

        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'OAUTH_SUCCESS') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', handleMessage);

            linkProviderMutation({
              variables: {
                input: {
                  provider,
                  code: event.data.code,
                  state: event.data.state,
                }
              }
            }).then(result => {
              setSocialAuthState(prev => ({ ...prev, isLinking: false }));
              resolve(result.data?.linkSocialProvider?.success || false);
            }).catch(error => {
              setSocialAuthState(prev => ({ ...prev, isLinking: false }));
              reject(error);
            });
          } else if (event.data.type === 'OAUTH_ERROR') {
            clearInterval(checkClosed);
            popup.close();
            window.removeEventListener('message', handleMessage);
            setSocialAuthState(prev => ({ ...prev, isLinking: false }));
            reject(new Error(event.data.error || 'OAuth failed'));
          }
        };

        window.addEventListener('message', handleMessage);
      });
    } catch (error) {
      setSocialAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to link provider',
        isLinking: false,
      }));
      throw error;
    }
  }, [getOAuthUrlMutation, linkProviderMutation]);

  const unlinkProvider = useCallback(async (provider: string): Promise<boolean> => {
    try {
      setSocialAuthState(prev => ({ ...prev, error: null, isUnlinking: true }));

      const result = await unlinkProviderMutation({
        variables: { provider }
      });

      return result.data?.unlinkSocialProvider?.success || false;
    } catch (error) {
      setSocialAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to unlink provider',
        isUnlinking: false,
      }));
      throw error;
    }
  }, [unlinkProviderMutation]);

  const refreshProviderToken = useCallback(async (provider: string): Promise<boolean> => {
    try {
      const result = await refreshTokenMutation({
        variables: { provider }
      });

      return result.data?.refreshSocialToken?.success || false;
    } catch (error) {
      setSocialAuthState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to refresh token' }));
      throw error;
    }
  }, [refreshTokenMutation]);

  const verifyProviderEmail = useCallback(async (provider: string, email: string): Promise<boolean> => {
    try {
      const result = await verifyEmailMutation({
        variables: {
          input: { provider, email }
        }
      });

      return result.data?.verifySocialEmail?.success || false;
    } catch (error) {
      setSocialAuthState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to verify email' }));
      throw error;
    }
  }, [verifyEmailMutation]);

  const getOAuthUrl = useCallback(async (provider: string, tenantId: string): Promise<string> => {
    try {
      const result = await getOAuthUrlMutation({
        variables: {
          input: { provider, tenantId }
        }
      });

      return result.data?.getOAuthUrl?.url || '';
    } catch (error) {
      setSocialAuthState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to get OAuth URL' }));
      throw error;
    }
  }, [getOAuthUrlMutation]);

  const refreshProviders = useCallback(async (): Promise<void> => {
    try {
      await refetchLinked();
    } catch (error) {
      setSocialAuthState(prev => ({ ...prev, error: error instanceof Error ? error.message : 'Failed to refresh providers' }));
    }
  }, [refetchLinked]);

  const clearError = useCallback(() => {
    setSocialAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Utility functions
  const isProviderLinked = useCallback((provider: string): boolean => {
    return socialAuthState.linkedProviders.some(p => p.provider === provider);
  }, [socialAuthState.linkedProviders]);

  const getLinkedProvider = useCallback((provider: string): SocialProvider | null => {
    return socialAuthState.linkedProviders.find(p => p.provider === provider) || null;
  }, [socialAuthState.linkedProviders]);

  const getProviderInfo = useCallback((provider: string): unknown => {
    return (socialAuthState.availableProviders as Array<{provider: string}>).find(p => p.provider === provider) || null;
  }, [socialAuthState.availableProviders]);

  const canLinkProvider = useCallback((provider: string): boolean => {
    const providerInfo = getProviderInfo(provider) as { enabled?: boolean } | null;
    return Boolean(providerInfo?.enabled) && !isProviderLinked(provider);
  }, [getProviderInfo, isProviderLinked]);

  const canUnlinkProvider = useCallback((provider: string): boolean => {
    return isProviderLinked(provider) && socialAuthState.linkedProviders.length > 1;
  }, [isProviderLinked, socialAuthState.linkedProviders.length]);

  // Computed properties
  const linkedProviderCount = socialAuthState.linkedProviders.length;
  const hasLinkedProviders = linkedProviderCount > 0;
  const availableProviderCount = socialAuthState.availableProviders.length;
  
  // Aliases for backwards compatibility
  const connectedProviders = socialAuthState.linkedProviders;
  const supportedProviders = (socialAuthState.availableProviders as Array<{ provider: string }>).map(p => p.provider);

  return {
    // State
    ...socialAuthState,

    // Operations
    oauthLogin,
    linkProvider,
    unlinkProvider,
    refreshProviderToken,
    verifyProviderEmail,
    getOAuthUrl,
    refreshProviders,
    clearError,

    // Utilities
    isProviderLinked,
    getLinkedProvider,
    getProviderInfo,
    canLinkProvider,
    canUnlinkProvider,

    // Computed properties
    linkedProviderCount,
    hasLinkedProviders,
    availableProviderCount,
    
    // Aliases for backwards compatibility
    connectedProviders,
    supportedProviders,
  };
}