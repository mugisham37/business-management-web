/**
 * Communication GraphQL Subscriptions
 * TypeScript definitions for all communication subscriptions
 */

import { gql } from '@apollo/client';

// Communication event fragment
export const COMMUNICATION_EVENT_FRAGMENT = gql`
  fragment CommunicationEventFragment on CommunicationEvent {
    id
    type
    channel
    success
    error
    metadata
    timestamp
    tenantId
  }
`;

export const NOTIFICATION_DELIVERY_STATUS_FRAGMENT = gql`
  fragment NotificationDeliveryStatusFragment on NotificationDeliveryStatus {
    notificationId
    channel
    status
    deliveredAt
    error
    metadata
  }
`;

// General communication events
export const COMMUNICATION_EVENTS = gql`
  subscription CommunicationEvents($tenantId: ID!, $filter: CommunicationEventFilterInput) {
    communicationEvents(tenantId: $tenantId, filter: $filter) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Alert events
export const ALERT_EVENTS = gql`
  subscription AlertEvents($tenantId: ID!, $severity: AlertSeverity) {
    alertEvents(tenantId: $tenantId, severity: $severity) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Business notification events
export const BUSINESS_NOTIFICATION_EVENTS = gql`
  subscription BusinessNotificationEvents($tenantId: ID!, $notificationType: String) {
    businessNotificationEvents(tenantId: $tenantId, notificationType: $notificationType) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Email events
export const EMAIL_EVENTS = gql`
  subscription EmailEvents($tenantId: ID!, $userId: ID) {
    emailEvents(tenantId: $tenantId, userId: $userId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const EMAIL_DELIVERY_EVENTS = gql`
  subscription EmailDeliveryEvents($tenantId: ID!, $messageId: String) {
    emailDeliveryEvents(tenantId: $tenantId, messageId: $messageId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const EMAIL_BULK_EVENTS = gql`
  subscription EmailBulkEvents($tenantId: ID!, $batchId: String) {
    emailBulkEvents(tenantId: $tenantId, batchId: $batchId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// SMS events
export const SMS_EVENTS = gql`
  subscription SMSEvents($tenantId: ID!, $userId: ID) {
    smsEvents(tenantId: $tenantId, userId: $userId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const SMS_DELIVERY_EVENTS = gql`
  subscription SMSDeliveryEvents($tenantId: ID!, $messageId: String) {
    smsDeliveryEvents(tenantId: $tenantId, messageId: $messageId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const SMS_BULK_EVENTS = gql`
  subscription SMSBulkEvents($tenantId: ID!, $batchId: String) {
    smsBulkEvents(tenantId: $tenantId, batchId: $batchId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Slack events
export const SLACK_EVENTS = gql`
  subscription SlackEvents($tenantId: ID!, $channel: String) {
    slackEvents(tenantId: $tenantId, channel: $channel) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const SLACK_NOTIFICATION_EVENTS = gql`
  subscription SlackNotificationEvents($tenantId: ID!, $notificationType: String) {
    slackNotificationEvents(tenantId: $tenantId, notificationType: $notificationType) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const SLACK_ALERT_EVENTS = gql`
  subscription SlackAlertEvents($tenantId: ID!, $severity: AlertSeverity) {
    slackAlertEvents(tenantId: $tenantId, severity: $severity) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Teams events
export const TEAMS_EVENTS = gql`
  subscription TeamsEvents($tenantId: ID!) {
    teamsEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const TEAMS_NOTIFICATION_EVENTS = gql`
  subscription TeamsNotificationEvents($tenantId: ID!, $notificationType: String) {
    teamsNotificationEvents(tenantId: $tenantId, notificationType: $notificationType) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const TEAMS_ALERT_EVENTS = gql`
  subscription TeamsAlertEvents($tenantId: ID!, $severity: AlertSeverity) {
    teamsAlertEvents(tenantId: $tenantId, severity: $severity) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const TEAMS_RICH_CARD_EVENTS = gql`
  subscription TeamsRichCardEvents($tenantId: ID!) {
    teamsRichCardEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Notification delivery status
export const NOTIFICATION_DELIVERY_STATUS = gql`
  subscription NotificationDeliveryStatus($tenantId: ID!, $notificationId: ID!) {
    notificationDeliveryStatus(tenantId: $tenantId, notificationId: $notificationId) {
      ...NotificationDeliveryStatusFragment
    }
  }
  ${NOTIFICATION_DELIVERY_STATUS_FRAGMENT}
`;

// Combined subscriptions for dashboard
export const COMMUNICATION_DASHBOARD_EVENTS = gql`
  subscription CommunicationDashboardEvents($tenantId: ID!) {
    communicationEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
    alertEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Channel-specific combined subscriptions
export const EMAIL_DASHBOARD_EVENTS = gql`
  subscription EmailDashboardEvents($tenantId: ID!, $userId: ID) {
    emailEvents(tenantId: $tenantId, userId: $userId) {
      ...CommunicationEventFragment
    }
    emailDeliveryEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const SMS_DASHBOARD_EVENTS = gql`
  subscription SMSDashboardEvents($tenantId: ID!, $userId: ID) {
    smsEvents(tenantId: $tenantId, userId: $userId) {
      ...CommunicationEventFragment
    }
    smsDeliveryEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const SLACK_DASHBOARD_EVENTS = gql`
  subscription SlackDashboardEvents($tenantId: ID!) {
    slackEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
    slackNotificationEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
    slackAlertEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const TEAMS_DASHBOARD_EVENTS = gql`
  subscription TeamsDashboardEvents($tenantId: ID!) {
    teamsEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
    teamsNotificationEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
    teamsAlertEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
    teamsRichCardEvents(tenantId: $tenantId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Real-time analytics subscriptions
export const COMMUNICATION_METRICS_EVENTS = gql`
  subscription CommunicationMetricsEvents($tenantId: ID!) {
    communicationMetricsEvents(tenantId: $tenantId) {
      timestamp
      channel
      eventType
      success
      responseTime
      metadata
    }
  }
`;

export const CHANNEL_HEALTH_EVENTS = gql`
  subscription ChannelHealthEvents($tenantId: ID!) {
    channelHealthEvents(tenantId: $tenantId) {
      channel
      status
      lastCheck
      errorRate
      averageResponseTime
      isHealthy
    }
  }
`;

// Template and configuration change events
export const TEMPLATE_CHANGE_EVENTS = gql`
  subscription TemplateChangeEvents($tenantId: ID!) {
    templateChangeEvents(tenantId: $tenantId) {
      templateType
      templateName
      changeType
      changedBy
      timestamp
    }
  }
`;

export const CONFIGURATION_CHANGE_EVENTS = gql`
  subscription ConfigurationChangeEvents($tenantId: ID!) {
    configurationChangeEvents(tenantId: $tenantId) {
      configurationType
      changeType
      changedBy
      timestamp
      metadata
    }
  }
`;

// Provider status events
export const PROVIDER_STATUS_EVENTS = gql`
  subscription ProviderStatusEvents($tenantId: ID!) {
    providerStatusEvents(tenantId: $tenantId) {
      providerType
      providerName
      status
      lastCheck
      errorMessage
      isHealthy
    }
  }
`;

// Quota and rate limit events
export const QUOTA_EVENTS = gql`
  subscription QuotaEvents($tenantId: ID!) {
    quotaEvents(tenantId: $tenantId) {
      channel
      quotaType
      currentUsage
      limit
      resetTime
      isExceeded
    }
  }
`;

export const RATE_LIMIT_EVENTS = gql`
  subscription RateLimitEvents($tenantId: ID!) {
    rateLimitEvents(tenantId: $tenantId) {
      channel
      currentRate
      limit
      windowStart
      windowEnd
      isExceeded
    }
  }
`;

// Filtered event subscriptions
export const FAILED_COMMUNICATION_EVENTS = gql`
  subscription FailedCommunicationEvents($tenantId: ID!) {
    communicationEvents(tenantId: $tenantId, filter: { successOnly: false }) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const HIGH_PRIORITY_EVENTS = gql`
  subscription HighPriorityEvents($tenantId: ID!) {
    communicationEvents(tenantId: $tenantId, filter: { priorities: [HIGH, URGENT] }) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const CRITICAL_ALERT_EVENTS = gql`
  subscription CriticalAlertEvents($tenantId: ID!) {
    alertEvents(tenantId: $tenantId, severity: CRITICAL) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

// Bulk operation events
export const BULK_OPERATION_EVENTS = gql`
  subscription BulkOperationEvents($tenantId: ID!, $operationId: String!) {
    bulkOperationEvents(tenantId: $tenantId, operationId: $operationId) {
      operationId
      operationType
      status
      progress
      totalItems
      processedItems
      successfulItems
      failedItems
      startTime
      endTime
      errors
    }
  }
`;

// Integration health subscriptions
export const INTEGRATION_HEALTH_EVENTS = gql`
  subscription IntegrationHealthEvents($tenantId: ID!) {
    integrationHealthEvents(tenantId: $tenantId) {
      integrationType
      status
      lastCheck
      responseTime
      errorCount
      isHealthy
      metadata
    }
  }
`;

// User-specific subscriptions
export const USER_COMMUNICATION_EVENTS = gql`
  subscription UserCommunicationEvents($tenantId: ID!, $userId: ID!) {
    userCommunicationEvents(tenantId: $tenantId, userId: $userId) {
      ...CommunicationEventFragment
    }
  }
  ${COMMUNICATION_EVENT_FRAGMENT}
`;

export const USER_NOTIFICATION_PREFERENCES_EVENTS = gql`
  subscription UserNotificationPreferencesEvents($tenantId: ID!, $userId: ID!) {
    userNotificationPreferencesEvents(tenantId: $tenantId, userId: $userId) {
      userId
      preferences
      updatedAt
      updatedBy
    }
  }
`;