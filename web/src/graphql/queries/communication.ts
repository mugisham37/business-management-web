/**
 * Communication GraphQL Queries
 * TypeScript definitions for all communication queries
 */

import { gql } from '@apollo/client';

// Communication Channels
export const GET_COMMUNICATION_CHANNELS = gql`
  query GetCommunicationChannels($tenantId: ID!) {
    getCommunicationChannels(tenantId: $tenantId) {
      type
      enabled
      configuration
      priority
      fallbackChannels
    }
  }
`;

export const TEST_COMMUNICATION_CHANNELS = gql`
  query TestCommunicationChannels($tenantId: ID!) {
    testCommunicationChannels(tenantId: $tenantId) {
      channel
      success
      error
      responseTime
    }
  }
`;

// Communication Statistics
export const GET_COMMUNICATION_STATS = gql`
  query GetCommunicationStats($tenantId: ID!, $filter: CommunicationStatsFilterInput) {
    getCommunicationStats(tenantId: $tenantId, filter: $filter) {
      totalSent
      totalFailed
      successRate
      channelBreakdown
      priorityBreakdown
      period
      generatedAt
    }
  }
`;

export const GET_CHANNEL_USAGE_STATS = gql`
  query GetChannelUsageStats($tenantId: ID!, $filter: CommunicationStatsFilterInput) {
    getChannelUsageStats(tenantId: $tenantId, filter: $filter) {
      channel
      totalMessages
      successfulMessages
      failedMessages
      successRate
      averageResponseTime
      lastUsed
    }
  }
`;

// Email Queries
export const GET_EMAIL_TEMPLATES = gql`
  query GetEmailTemplates($tenantId: ID!, $category: String) {
    getEmailTemplates(tenantId: $tenantId, category: $category) {
      name
      subject
      htmlTemplate
      textTemplate
      variables
      category
    }
  }
`;

export const GET_EMAIL_PROVIDERS = gql`
  query GetEmailProviders($tenantId: ID!) {
    getEmailProviders(tenantId: $tenantId) {
      type
      configuration
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const GET_EMAIL_TEMPLATE = gql`
  query GetEmailTemplate($tenantId: ID!, $templateName: String!) {
    getEmailTemplate(tenantId: $tenantId, templateName: $templateName) {
      name
      subject
      htmlTemplate
      textTemplate
      variables
      category
    }
  }
`;

// SMS Queries
export const GET_SMS_TEMPLATES = gql`
  query GetSMSTemplates($tenantId: ID!, $category: String) {
    getSMSTemplates(tenantId: $tenantId, category: $category) {
      name
      message
      variables
      category
      maxLength
    }
  }
`;

export const GET_SMS_PROVIDERS = gql`
  query GetSMSProviders($tenantId: ID!) {
    getSMSProviders(tenantId: $tenantId) {
      type
      configuration
      isEnabled
      createdAt
      updatedAt
    }
  }
`;

export const GET_SMS_TEMPLATE = gql`
  query GetSMSTemplate($tenantId: ID!, $templateName: String!) {
    getSMSTemplate(tenantId: $tenantId, templateName: $templateName) {
      name
      message
      variables
      category
      maxLength
    }
  }
`;

// Slack Queries
export const GET_SLACK_CONFIGURATION = gql`
  query GetSlackConfiguration($tenantId: ID!) {
    getSlackConfiguration(tenantId: $tenantId) {
      webhookUrl
      botToken
      defaultChannel
      username
      iconEmoji
      iconUrl
      enableThreads
      enableMentions
      mentionUsers
      mentionChannels
    }
  }
`;

export const IS_SLACK_CONFIGURED = gql`
  query IsSlackConfigured($tenantId: ID!) {
    isSlackConfigured(tenantId: $tenantId)
  }
`;

// Teams Queries
export const GET_TEAMS_CONFIGURATION = gql`
  query GetTeamsConfiguration($tenantId: ID!) {
    getTeamsConfiguration(tenantId: $tenantId) {
      webhookUrl
      defaultTitle
      defaultThemeColor
      enableMentions
      mentionUsers
      enableActivityImages
      activityImageUrl
    }
  }
`;

export const IS_TEAMS_CONFIGURED = gql`
  query IsTeamsConfigured($tenantId: ID!) {
    isTeamsConfigured(tenantId: $tenantId)
  }
`;

// Fragment definitions for reusability
export const COMMUNICATION_CHANNEL_FRAGMENT = gql`
  fragment CommunicationChannelFragment on CommunicationChannel {
    type
    enabled
    configuration
    priority
    fallbackChannels
  }
`;

export const COMMUNICATION_RESULT_FRAGMENT = gql`
  fragment CommunicationResultFragment on CommunicationResult {
    channel
    success
    messageId
    error
    recipientCount
  }
`;

export const BULK_COMMUNICATION_RESULT_FRAGMENT = gql`
  fragment BulkCommunicationResultFragment on BulkCommunicationResult {
    totalChannels
    successfulChannels
    failedChannels
    results {
      ...CommunicationResultFragment
    }
    overallSuccess
  }
  ${COMMUNICATION_RESULT_FRAGMENT}
`;

export const EMAIL_TEMPLATE_FRAGMENT = gql`
  fragment EmailTemplateFragment on EmailTemplate {
    name
    subject
    htmlTemplate
    textTemplate
    variables
    category
  }
`;

export const SMS_TEMPLATE_FRAGMENT = gql`
  fragment SMSTemplateFragment on SMSTemplate {
    name
    message
    variables
    category
    maxLength
  }
`;

export const EMAIL_PROVIDER_FRAGMENT = gql`
  fragment EmailProviderFragment on EmailProvider {
    type
    configuration
    isEnabled
    createdAt
    updatedAt
  }
`;

export const SMS_PROVIDER_FRAGMENT = gql`
  fragment SMSProviderFragment on SMSProvider {
    type
    configuration
    isEnabled
    createdAt
    updatedAt
  }
`;

export const COMMUNICATION_STATS_FRAGMENT = gql`
  fragment CommunicationStatsFragment on CommunicationStats {
    totalSent
    totalFailed
    successRate
    channelBreakdown
    priorityBreakdown
    period
    generatedAt
  }
`;

export const CHANNEL_USAGE_STATS_FRAGMENT = gql`
  fragment ChannelUsageStatsFragment on ChannelUsageStats {
    channel
    totalMessages
    successfulMessages
    failedMessages
    successRate
    averageResponseTime
    lastUsed
  }
`;

export const CHANNEL_TEST_RESULT_FRAGMENT = gql`
  fragment ChannelTestResultFragment on ChannelTestResult {
    channel
    success
    error
    responseTime
  }
`;

export const INTEGRATION_TEST_RESULT_FRAGMENT = gql`
  fragment IntegrationTestResultFragment on IntegrationTestResult {
    success
    error
    messageId
    responseTime
  }
`;

export const SLACK_CONFIGURATION_FRAGMENT = gql`
  fragment SlackConfigurationFragment on SlackIntegrationConfig {
    webhookUrl
    botToken
    defaultChannel
    username
    iconEmoji
    iconUrl
    enableThreads
    enableMentions
    mentionUsers
    mentionChannels
  }
`;

export const TEAMS_CONFIGURATION_FRAGMENT = gql`
  fragment TeamsConfigurationFragment on TeamsIntegrationConfig {
    webhookUrl
    defaultTitle
    defaultThemeColor
    enableMentions
    mentionUsers
    enableActivityImages
    activityImageUrl
  }
`;

// Bulk result fragments
export const BULK_EMAIL_RESULT_FRAGMENT = gql`
  fragment BulkEmailResultFragment on BulkEmailResult {
    totalSent
    totalFailed
    results {
      userId
      success
      error
      messageId
    }
  }
`;

export const BULK_SMS_RESULT_FRAGMENT = gql`
  fragment BulkSMSResultFragment on BulkSMSResult {
    totalSent
    totalFailed
    results {
      userId
      success
      error
      messageId
    }
  }
`;

// Query with fragments
export const GET_COMMUNICATION_CHANNELS_WITH_FRAGMENT = gql`
  query GetCommunicationChannelsWithFragment($tenantId: ID!) {
    getCommunicationChannels(tenantId: $tenantId) {
      ...CommunicationChannelFragment
    }
  }
  ${COMMUNICATION_CHANNEL_FRAGMENT}
`;

export const GET_EMAIL_TEMPLATES_WITH_FRAGMENT = gql`
  query GetEmailTemplatesWithFragment($tenantId: ID!, $category: String) {
    getEmailTemplates(tenantId: $tenantId, category: $category) {
      ...EmailTemplateFragment
    }
  }
  ${EMAIL_TEMPLATE_FRAGMENT}
`;

export const GET_SMS_TEMPLATES_WITH_FRAGMENT = gql`
  query GetSMSTemplatesWithFragment($tenantId: ID!, $category: String) {
    getSMSTemplates(tenantId: $tenantId, category: $category) {
      ...SMSTemplateFragment
    }
  }
  ${SMS_TEMPLATE_FRAGMENT}
`;

export const GET_COMMUNICATION_STATS_WITH_FRAGMENT = gql`
  query GetCommunicationStatsWithFragment($tenantId: ID!, $filter: CommunicationStatsFilterInput) {
    getCommunicationStats(tenantId: $tenantId, filter: $filter) {
      ...CommunicationStatsFragment
    }
  }
  ${COMMUNICATION_STATS_FRAGMENT}
`;

// Combined queries for dashboard
export const GET_COMMUNICATION_DASHBOARD_DATA = gql`
  query GetCommunicationDashboardData($tenantId: ID!) {
    getCommunicationChannels(tenantId: $tenantId) {
      ...CommunicationChannelFragment
    }
    getCommunicationStats(tenantId: $tenantId) {
      ...CommunicationStatsFragment
    }
    getChannelUsageStats(tenantId: $tenantId) {
      ...ChannelUsageStatsFragment
    }
  }
  ${COMMUNICATION_CHANNEL_FRAGMENT}
  ${COMMUNICATION_STATS_FRAGMENT}
  ${CHANNEL_USAGE_STATS_FRAGMENT}
`;

export const GET_EMAIL_DASHBOARD_DATA = gql`
  query GetEmailDashboardData($tenantId: ID!) {
    getEmailTemplates(tenantId: $tenantId) {
      ...EmailTemplateFragment
    }
    getEmailProviders(tenantId: $tenantId) {
      ...EmailProviderFragment
    }
  }
  ${EMAIL_TEMPLATE_FRAGMENT}
  ${EMAIL_PROVIDER_FRAGMENT}
`;

export const GET_SMS_DASHBOARD_DATA = gql`
  query GetSMSDashboardData($tenantId: ID!) {
    getSMSTemplates(tenantId: $tenantId) {
      ...SMSTemplateFragment
    }
    getSMSProviders(tenantId: $tenantId) {
      ...SMSProviderFragment
    }
  }
  ${SMS_TEMPLATE_FRAGMENT}
  ${SMS_PROVIDER_FRAGMENT}
`;

export const GET_INTEGRATION_DASHBOARD_DATA = gql`
  query GetIntegrationDashboardData($tenantId: ID!) {
    getSlackConfiguration(tenantId: $tenantId) {
      ...SlackConfigurationFragment
    }
    getTeamsConfiguration(tenantId: $tenantId) {
      ...TeamsConfigurationFragment
    }
    isSlackConfigured(tenantId: $tenantId)
    isTeamsConfigured(tenantId: $tenantId)
  }
  ${SLACK_CONFIGURATION_FRAGMENT}
  ${TEAMS_CONFIGURATION_FRAGMENT}
`;