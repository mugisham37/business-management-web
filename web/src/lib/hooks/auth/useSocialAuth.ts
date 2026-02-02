import { useState, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { AuthEventEmitter } from '../../auth/auth-events';
import {
  GET_SOCIAL_AUTH_URL,
  GET_CONNECTED_SOCIAL_PROVIDERS,
  IS_SOCIAL_PROVIDER_AVAILABLE,
  GET_SUPPORTED_SOCIAL_PROVIDERS,
  LINK_SOCIAL_PROVIDER,
  UNLINK_SOCIAL_PROVIDER,
  USER_SOCIAL_PROVIDER_EVENTS,
} from '../../graphql/operations/social-auth';
import type {
  SocialProvider,
  SocialAuthUrlResponse,
  LinkSocialProviderInput,
  UnlinkSocialProviderInput,
  AuthEvent,
} from '../../graphql/generated/types';

/**
 * Social Authentication Hook
 * 
 * Provides comprehensive social authentication management with:
 * - OAuth URL generation
 * - Provider linking/unlinking
 * - Connected providers management
 * - Provider availability checking
 * - Real-time social auth events
 */

interface SocialAuthState {
  connectedProviders: SocialProvider[];
  supportedProviders: string[];
  isLoading: boolean;
  error: string | null;
  authUrl: string | null;
  authState: string | null;
}

interface SocialAuthOperations {
  generateAuthUrl: (provider: string, tenantId?: string) => Promise<SocialAuthUrlResponse>;
  linkProvider: (input: LinkSocialProviderInput) => Promise<boolean>;
  unlinkProvider: (provider: string) => Promise<boolean>;
  isProviderAvailable: (provider: string) => Promise<boolean>;
  refreshConnectedProviders: () => Promise<void>;
  clearError: () => void;
  clearAuthUrl: () => void;
}

interface UseSocialAuthReturn extends SocialAuthState, SocialAuthOperations {
  // Utilities
  isProviderConnected: (provider: string) => boolean;
  getProviderInfo: (provider: string) => SocialProvider | null;
  canLinkProvider: (provider: string) => boolean;
  getProviderDisplayName: (provider: string) => string;
}

export function useSocialAuth(): UseSocialAuthReturn {
  const [socialAuthState, setSocialAuthState] = useState<SocialAuthState>({
    connectedProviders: [],
    supportedProviders: [],
    isLoading: false,
    error: null,
    authUrl: null,
    authState: null,
  });

  // GraphQL operations
  const { data: connectedData, loading: connectedLoading, refetch: refetchConnected } = useQuery(
    GET_CONNECTED_SOCIAL_PROVIDERS,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: supportedData, loading: supportedLoading } = useQuery(
    GET_SUPPORTED_SOCIAL_PROVIDERS,
    {
      errorPolicy: 'all',
    }
  );

  const [generateAuthUrlMutation, { loading: authUrlLoading }] = useMutation(
    GET_SOCIAL_AUTH_URL,
    {
      errorPolicy: 'all',
    }
  );

  const [linkProviderMutation, { loading: linkLoading }] = useMutation(LINK_SOCIAL_PROVIDER, {
    errorPolicy: 'all',
  });

  const [unlinkProviderMutation, { loading: unlinkLoading }] = useMutation(
    UNLINK_SOCIAL_PROVIDER,
    {
      errorPolicy: 'all',
    }
  );

  const [checkProviderAvailabilityMutation] = useMutation(IS_SOCIAL_PROVIDER_AVAILABLE, {
    errorPolicy: 'all',
  });

  // Real-time social provider events
  useSubscription(USER_SOCIAL_PROVIDER_EVENTS, {
    onData: ({ data }) => {
      if (data.data?.userSocialProviderEvents) {
        handleSocialProviderEvent(data.data.userSocialProviderEvents);
      }
    },
  });

  // Handle social provider events
  const handleSocialProviderEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case 'SOCIAL_PROVIDER_LINKED':
        AuthEventEmitter.emit('social:provider_linked', event.metadata?.provider);
        refetchConnected();
        break;
      case 'SOCIAL_PROVIDER_UNLINKED':
        AuthEventEmitter.emit('social:provider_unlinked', event.metadata?.provider);
        refetchConnected();
        break;
      default:
        console.log('Received social provider event:', event);
    }
  }, [refetchConnected]);

  // Generate OAuth authorization URL
  const generateAuthUrl = useCallback(async (
    provider: string,
    tenantId?: string
  ): Promise<SocialAuthUrlResponse> => {
    try {
      setSocialAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await generateAuthUrlMutation({
        variables: { provider, tenantId },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      const authData = result.data?.getSocialAuthUrl;
      if (!authData) {
        throw new Error('Failed to generate auth URL');
      }

      setSocialAuthState(prev => ({
        ...prev,
        authUrl: authData.authUrl,
        authState: authData.state,
        isLoading: false,
      }));

      return authData;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to generate auth URL';
      setSocialAuthState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [generateAuthUrlMutation]);

  // Link social provider
  const linkProvider = useCallback(async (input: LinkSocialProviderInput): Promise<boolean> => {
    try {
      setSocialAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await linkProviderMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      const response = result.data?.linkSocialProvider;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to link provider');
      }

      setSocialAuthState(prev => ({
        ...prev,
        connectedProviders: response.connectedProviders,
        isLoading: false,
      }));

      // Refresh connected providers
      await refetchConnected();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to link provider';
      setSocialAuthState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [linkProviderMutation, refetchConnected]);

  // Unlink social provider
  const unlinkProvider = useCallback(async (provider: string): Promise<boolean> => {
    try {
      setSocialAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await unlinkProviderMutation({
        variables: { input: { provider } },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      const response = result.data?.unlinkSocialProvider;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to unlink provider');
      }

      setSocialAuthState(prev => ({
        ...prev,
        connectedProviders: response.connectedProviders,
        isLoading: false,
      }));

      // Refresh connected providers
      await refetchConnected();

      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to unlink provider';
      setSocialAuthState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [unlinkProviderMutation, refetchConnected]);

  // Check if provider is available
  const isProviderAvailable = useCallback(async (provider: string): Promise<boolean> => {
    try {
      const result = await checkProviderAvailabilityMutation({
        variables: { provider },
      });

      return result.data?.isSocialProviderAvailable || false;
    } catch (error) {
      console.error('Failed to check provider availability:', error);
      return false;
    }
  }, [checkProviderAvailabilityMutation]);

  // Refresh connected providers
  const refreshConnectedProviders = useCallback(async (): Promise<void> => {
    try {
      await refetchConnected();
    } catch (error) {
      console.error('Failed to refresh connected providers:', error);
    }
  }, [refetchConnected]);

  // Clear error
  const clearError = useCallback(() => {
    setSocialAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear auth URL
  const clearAuthUrl = useCallback(() => {
    setSocialAuthState(prev => ({ ...prev, authUrl: null, authState: null }));
  }, []);

  // Utility functions
  const isProviderConnected = useCallback((provider: string): boolean => {
    return socialAuthState.connectedProviders.some(p => p.provider === provider);
  }, [socialAuthState.connectedProviders]);

  const getProviderInfo = useCallback((provider: string): SocialProvider | null => {
    return socialAuthState.connectedProviders.find(p => p.provider === provider) || null;
  }, [socialAuthState.connectedProviders]);

  const canLinkProvider = useCallback((provider: string): boolean => {
    return socialAuthState.supportedProviders.includes(provider) && 
           !isProviderConnected(provider);
  }, [socialAuthState.supportedProviders, isProviderConnected]);

  const getProviderDisplayName = useCallback((provider: string): string => {
    const displayNames: Record<string, string> = {
      google: 'Google',
      facebook: 'Facebook',
      github: 'GitHub',
      twitter: 'Twitter',
      linkedin: 'LinkedIn',
      microsoft: 'Microsoft',
    };
    
    return displayNames[provider.toLowerCase()] || provider;
  }, []);

  // Update state when data changes
  React.useEffect(() => {
    if (connectedData?.getConnectedSocialProviders) {
      setSocialAuthState(prev => ({
        ...prev,
        connectedProviders: connectedData.getConnectedSocialProviders,
      }));
    }
  }, [connectedData]);

  React.useEffect(() => {
    if (supportedData?.getSupportedSocialProviders) {
      setSocialAuthState(prev => ({
        ...prev,
        supportedProviders: supportedData.getSupportedSocialProviders,
      }));
    }
  }, [supportedData]);

  return {
    // State
    ...socialAuthState,
    isLoading: socialAuthState.isLoading || 
               connectedLoading || 
               supportedLoading || 
               authUrlLoading || 
               linkLoading || 
               unlinkLoading,

    // Operations
    generateAuthUrl,
    linkProvider,
    unlinkProvider,
    isProviderAvailable,
    refreshConnectedProviders,
    clearError,
    clearAuthUrl,

    // Utilities
    isProviderConnected,
    getProviderInfo,
    canLinkProvider,
    getProviderDisplayName,
  };
}