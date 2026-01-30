/**
 * Teams Communication Hook
 * Provides comprehensive Microsoft Teams integration functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { useAuth } from '@/hooks/authentication/useAuth';
import {
  TeamsMessage,
  TeamsNotification,
  TeamsAlert,
  TeamsRichCard,
  TeamsIntegrationConfig,
  CommunicationResult,
  IntegrationTestResult,
  NotificationOptions,
  UseTeamsReturn,
  CommunicationHookOptions
} from '@/types/communication';
import { CommunicationUtils } from '@/lib/utils/communication';

// GraphQL Operations
import {
  GET_TEAMS_CONFIGURATION,
  IS_TEAMS_CONFIGURED,
} from '@/graphql/queries/communication';

import {
  SEND_TEAMS_MESSAGE,
  SEND_TEAMS_NOTIFICATION,
  SEND_TEAMS_ALERT,
  SEND_TEAMS_RICH_CARD,
  SEND_TEAMS_SIMPLE_MESSAGE,
  CONFIGURE_TEAMS_INTEGRATION,
  TEST_TEAMS_INTEGRATION,
  DISABLE_TEAMS_INTEGRATION,
} from '@/graphql/mutations/communication';

import {
  TEAMS_EVENTS,
} from '@/graphql/subscriptions/communication';

export const useTeams = (options: CommunicationHookOptions = {}): UseTeamsReturn => {
  const { user } = useAuth();
  const apolloClient = useApolloClient();
  
  const {
    tenantId = user?.tenantId,
    userId = user?.id,
    autoRefresh = true,
    refreshInterval = 60000,
    enableRealtime = true,
  } = options;

  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuration, setConfiguration] = useState<TeamsIntegrationConfig | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  // Queries
  const { 
    loading: configLoading, 
    error: configError,
    refetch: refetchConfig 
  } = useQuery(GET_TEAMS_CONFIGURATION, {
    variables: { tenantId },
    skip: !tenantId,
    pollInterval: autoRefresh ? refreshInterval : 0,
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (data?.getTeamsConfiguration) {
        setConfiguration(data.getTeamsConfiguration);
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const { 
    loading: isConfiguredLoading,
    refetch: refetchIsConfigured 
  } = useQuery(IS_TEAMS_CONFIGURED, {
    variables: { tenantId },
    skip: !tenantId,
    pollInterval: autoRefresh ? refreshInterval : 0,
    errorPolicy: 'all',
    onCompleted: (data) => {
      if (typeof data?.isTeamsConfigured === 'boolean') {
        setIsConfigured(data.isTeamsConfigured);
      }
    },
  });

  // Mutations
  const [sendMessageMutation] = useMutation(SEND_TEAMS_MESSAGE, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
  });

  const [sendNotificationMutation] = useMutation(SEND_TEAMS_NOTIFICATION, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
  });

  const [sendAlertMutation] = useMutation(SEND_TEAMS_ALERT, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
  });

  const [sendRichCardMutation] = useMutation(SEND_TEAMS_RICH_CARD, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
  });

  const [sendSimpleMessageMutation] = useMutation(SEND_TEAMS_SIMPLE_MESSAGE, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
  });

  const [configureIntegrationMutation] = useMutation(CONFIGURE_TEAMS_INTEGRATION, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
    refetchQueries: [
      { query: GET_TEAMS_CONFIGURATION, variables: { tenantId } },
      { query: IS_TEAMS_CONFIGURED, variables: { tenantId } }
    ],
  });

  const [testIntegrationMutation] = useMutation(TEST_TEAMS_INTEGRATION, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
  });

  const [disableIntegrationMutation] = useMutation(DISABLE_TEAMS_INTEGRATION, {
    errorPolicy: 'all',
    onError: (error) => setError(error.message),
    refetchQueries: [
      { query: GET_TEAMS_CONFIGURATION, variables: { tenantId } },
      { query: IS_TEAMS_CONFIGURED, variables: { tenantId } }
    ],
  });

  // Real-time subscription for Teams events
  useEffect(() => {
    if (!enableRealtime || !tenantId) return;

    const subscription = apolloClient.subscribe({
      query: TEAMS_EVENTS,
      variables: { tenantId },
      errorPolicy: 'all',
    }).subscribe({
      next: (result) => {
        if (result.data?.teamsEvents) {
          const event = result.data.teamsEvents;
          console.log('Teams event received:', event);
          
          // Handle Teams events
          if (event.type === 'integration_configured') {
            refetchConfig();
            refetchIsConfigured();
          }
        }
      },
      error: (error) => {
        console.error('Teams subscription error:', error);
      },
    });

    return () => subscription.unsubscribe();
  }, [enableRealtime, tenantId, apolloClient, refetchConfig, refetchIsConfigured]);

  // Teams operations
  const sendMessage = useCallback(async (
    message: TeamsMessage,
    options?: NotificationOptions
  ): Promise<CommunicationResult> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate Teams message
      if (!message.text && !message.sections) {
        throw new Error('Either text or sections are required');
      }

      // Validate theme color format if provided
      if (message.themeColor && !/^#[0-9A-Fa-f]{6}$/.test(message.themeColor)) {
        throw new Error('Invalid theme color format (use #RRGGBB)');
      }

      const { data } = await sendMessageMutation({
        variables: {
          tenantId,
          message,
          options,
        },
      });

      if (!data?.sendTeamsMessage) {
        throw new Error('Failed to send Teams message');
      }

      return data.sendTeamsMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, sendMessageMutation]);

  const sendNotification = useCallback(async (
    notification: TeamsNotification
  ): Promise<CommunicationResult> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate notification
      if (!notification.title || !notification.message) {
        throw new Error('Notification title and message are required');
      }

      if (!notification.type) {
        throw new Error('Notification type is required');
      }

      const { data } = await sendNotificationMutation({
        variables: {
          tenantId,
          notification,
        },
      });

      if (!data?.sendTeamsNotification) {
        throw new Error('Failed to send Teams notification');
      }

      return data.sendTeamsNotification;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, sendNotificationMutation]);

  const sendAlert = useCallback(async (alert: TeamsAlert): Promise<CommunicationResult> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate alert
      if (!alert.title || !alert.message) {
        throw new Error('Alert title and message are required');
      }

      if (!alert.severity) {
        throw new Error('Alert severity is required');
      }

      // Validate action URL if provided
      if (alert.actionUrl && !CommunicationUtils.validateWebhookUrl(alert.actionUrl)) {
        throw new Error('Invalid action URL format');
      }

      const { data } = await sendAlertMutation({
        variables: {
          tenantId,
          alert,
        },
      });

      if (!data?.sendTeamsAlert) {
        throw new Error('Failed to send Teams alert');
      }

      return data.sendTeamsAlert;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, sendAlertMutation]);

  const sendRichCard = useCallback(async (card: TeamsRichCard): Promise<CommunicationResult> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate rich card
      if (!card.title) {
        throw new Error('Card title is required');
      }

      if (!card.sections || card.sections.length === 0) {
        throw new Error('At least one section is required');
      }

      // Validate theme color format if provided
      if (card.themeColor && !/^#[0-9A-Fa-f]{6}$/.test(card.themeColor)) {
        throw new Error('Invalid theme color format (use #RRGGBB)');
      }

      // Validate action URLs if provided
      if (card.actions) {
        const invalidActions = card.actions.filter(action => 
          action.url && !CommunicationUtils.validateWebhookUrl(action.url)
        );
        if (invalidActions.length > 0) {
          throw new Error('Invalid action URL format in card actions');
        }
      }

      const { data } = await sendRichCardMutation({
        variables: {
          tenantId,
          card,
        },
      });

      if (!data?.sendTeamsRichCard) {
        throw new Error('Failed to send Teams rich card');
      }

      return data.sendTeamsRichCard;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, sendRichCardMutation]);

  const sendSimpleMessage = useCallback(async (
    message: string,
    options?: NotificationOptions
  ): Promise<CommunicationResult> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate message
      if (!message) {
        throw new Error('Message is required');
      }

      const { data } = await sendSimpleMessageMutation({
        variables: {
          tenantId,
          message,
          options,
        },
      });

      if (!data?.sendTeamsSimpleMessage) {
        throw new Error('Failed to send Teams simple message');
      }

      return data.sendTeamsSimpleMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, sendSimpleMessageMutation]);

  // Configuration management
  const getConfiguration = useCallback(async (): Promise<TeamsIntegrationConfig | null> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    try {
      const { data } = await refetchConfig();
      return data?.getTeamsConfiguration || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    }
  }, [tenantId, refetchConfig]);

  const configureIntegration = useCallback(async (
    config: TeamsIntegrationConfig
  ): Promise<void> => {
    if (!tenantId || !userId) {
      throw new Error('Tenant ID and User ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate configuration
      if (!config.webhookUrl) {
        throw new Error('Webhook URL is required');
      }

      if (!CommunicationUtils.validateWebhookUrl(config.webhookUrl)) {
        throw new Error('Invalid webhook URL format');
      }

      // Validate theme color format if provided
      if (config.defaultThemeColor && !/^#[0-9A-Fa-f]{6}$/.test(config.defaultThemeColor)) {
        throw new Error('Invalid default theme color format (use #RRGGBB)');
      }

      // Validate activity image URL if provided
      if (config.activityImageUrl && !CommunicationUtils.validateWebhookUrl(config.activityImageUrl)) {
        throw new Error('Invalid activity image URL format');
      }

      await configureIntegrationMutation({
        variables: {
          tenantId,
          config,
          updatedBy: userId,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, userId, configureIntegrationMutation]);

  const testIntegration = useCallback(async (
    config: TeamsIntegrationConfig
  ): Promise<IntegrationTestResult> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    setLoading(true);
    setError(null);

    try {
      // Validate configuration
      if (!config.webhookUrl) {
        throw new Error('Webhook URL is required');
      }

      if (!CommunicationUtils.validateWebhookUrl(config.webhookUrl)) {
        throw new Error('Invalid webhook URL format');
      }

      const { data } = await testIntegrationMutation({
        variables: {
          tenantId,
          config,
        },
      });

      if (!data?.testTeamsIntegration) {
        throw new Error('Failed to test Teams integration');
      }

      return data.testTeamsIntegration;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, testIntegrationMutation]);

  const disableIntegration = useCallback(async (): Promise<void> => {
    if (!tenantId || !userId) {
      throw new Error('Tenant ID and User ID are required');
    }

    setLoading(true);
    setError(null);

    try {
      await disableIntegrationMutation({
        variables: {
          tenantId,
          updatedBy: userId,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [tenantId, userId, disableIntegrationMutation]);

  const isConfiguredCheck = useCallback(async (): Promise<boolean> => {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    try {
      const { data } = await refetchIsConfigured();
      return data?.isTeamsConfigured || false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      throw error;
    }
  }, [tenantId, refetchIsConfigured]);

  // Utility methods
  const validateConfiguration = useCallback((config: TeamsIntegrationConfig) => {
    const errors: string[] = [];

    if (!config.webhookUrl) {
      errors.push('Webhook URL is required');
    } else if (!CommunicationUtils.validateWebhookUrl(config.webhookUrl)) {
      errors.push('Invalid webhook URL format');
    }

    if (config.defaultThemeColor && !/^#[0-9A-Fa-f]{6}$/.test(config.defaultThemeColor)) {
      errors.push('Invalid default theme color format (use #RRGGBB)');
    }

    if (config.activityImageUrl && !CommunicationUtils.validateWebhookUrl(config.activityImageUrl)) {
      errors.push('Invalid activity image URL format');
    }

    return errors;
  }, []);

  const createRichCard = useCallback((params: {
    title: string;
    subtitle?: string;
    summary?: string;
    themeColor?: string;
    facts?: Array<{ name: string; value: string }>;
    actions?: Array<{ id: string; label: string; url?: string }>;
  }): TeamsRichCard => {
    const sections = [];
    
    if (params.facts && params.facts.length > 0) {
      sections.push({
        facts: params.facts,
      });
    }

    return {
      title: params.title,
      ...(params.subtitle && { subtitle: params.subtitle }),
      ...(params.summary && { summary: params.summary }),
      ...(params.themeColor && { themeColor: params.themeColor }),
      sections,
      ...(params.actions && { actions: params.actions }),
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update loading state based on queries
  useEffect(() => {
    setLoading(configLoading || isConfiguredLoading);
  }, [configLoading, isConfiguredLoading]);

  // Update error state based on queries
  useEffect(() => {
    if (configError) {
      setError(configError.message);
    }
  }, [configError]);

  return {
    // Teams operations
    sendMessage,
    sendNotification,
    sendAlert,
    sendRichCard,
    sendSimpleMessage,
    
    // Configuration
    getConfiguration,
    configureIntegration,
    testIntegration,
    disableIntegration,
    isConfiguredCheck,
    validateConfiguration,
    createRichCard,
    
    // State
    loading,
    error,
    configuration,
    isConfigured,
    
    // Utility methods
    clearError,
  };
};