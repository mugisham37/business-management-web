/**
 * Real-time GraphQL Mutations
 * Generated from GraphQL schema
 */

import { gql } from '@apollo/client';

// User Presence Mutations
export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($input: UpdateUserStatusInput!) {
    updateUserStatus(input: $input) {
      userId
      email
      displayName
      status
      connectedAt
      lastActivity
      rooms
    }
  }
`;

export const SEND_DIRECT_MESSAGE = gql`
  mutation SendDirectMessage($input: DirectMessageInput!) {
    sendDirectMessage(input: $input) {
      id
      senderId
      senderName
      recipientIds
      content
      priority
      timestamp
      metadata
    }
  }
`;

export const SEND_REALTIME_MESSAGE = gql`
  mutation SendRealtimeMessage($input: SendMessageInput!) {
    sendRealtimeMessage(input: $input) {
      id
      senderId
      senderName
      recipientIds
      content
      priority
      timestamp
      metadata
    }
  }
`;

export const BROADCAST_MESSAGE = gql`
  mutation BroadcastMessage($input: BroadcastMessageInput!) {
    broadcastMessage(input: $input) {
      success
      recipientCount
      message
    }
  }
`;

// Live Data Subscription Mutations
export const SUBSCRIBE_TO_INVENTORY_UPDATES = gql`
  mutation SubscribeToInventoryUpdates($input: InventorySubscriptionInput!) {
    subscribeToInventoryUpdates(input: $input)
  }
`;

export const SUBSCRIBE_TO_SALES_UPDATES = gql`
  mutation SubscribeToSalesUpdates($input: SalesSubscriptionInput!) {
    subscribeToSalesUpdates(input: $input)
  }
`;

export const SUBSCRIBE_TO_CUSTOMER_ACTIVITY = gql`
  mutation SubscribeToCustomerActivity($input: CustomerActivitySubscriptionInput!) {
    subscribeToCustomerActivity(input: $input)
  }
`;

export const SUBSCRIBE_TO_ANALYTICS_UPDATES = gql`
  mutation SubscribeToAnalyticsUpdates($input: AnalyticsSubscriptionInput!) {
    subscribeToAnalyticsUpdates(input: $input)
  }
`;

// Configuration Mutations
export const CONFIGURE_INVENTORY_ALERTS = gql`
  mutation ConfigureInventoryAlerts($input: InventoryAlertConfigInput!) {
    configureInventoryAlerts(input: $input)
  }
`;

export const SET_SALES_TARGETS = gql`
  mutation SetSalesTargets($input: SalesTargetInput!) {
    setSalesTargets(input: $input)
  }
`;

export const CREATE_ANALYTICS_ALERT = gql`
  mutation CreateAnalyticsAlert($input: CreateAnalyticsAlertInput!) {
    createAnalyticsAlert(input: $input)
  }
`;

// Notification Mutations
export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($input: MarkNotificationReadInput!) {
    markNotificationRead(input: $input) {
      success
      message
      notification {
        id
        recipientId
        type
        channel
        subject
        message
        status
        priority
        scheduledAt
        sentAt
        deliveredAt
        readAt
        deliveryAttempts
        failureReason
        metadata
        createdAt
      }
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead {
      success
      message
    }
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($input: DeleteNotificationInput!) {
    deleteNotification(input: $input) {
      success
      message
    }
  }
`;

// Communication Mutations
export const SEND_EMAIL = gql`
  mutation SendEmail($input: SendEmailInput!) {
    sendEmail(input: $input) {
      success
      message
      jobId
      recipientCount
    }
  }
`;

export const SEND_SMS = gql`
  mutation SendSMS($input: SendSMSInput!) {
    sendSMS(input: $input) {
      success
      message
      jobId
      recipientCount
    }
  }
`;

export const SEND_PUSH_NOTIFICATION = gql`
  mutation SendPushNotification($input: SendPushNotificationInput!) {
    sendPushNotification(input: $input) {
      success
      message
      recipientCount
    }
  }
`;

export const SEND_MULTI_CHANNEL_NOTIFICATION = gql`
  mutation SendMultiChannelNotification($input: SendMultiChannelNotificationInput!) {
    sendMultiChannelNotification(input: $input) {
      success
      message
      recipientCount
    }
  }
`;

export const SEND_ALERT = gql`
  mutation SendAlert($input: SendAlertInput!) {
    sendAlert(input: $input) {
      success
      message
      recipientCount
    }
  }
`;

export const SEND_BUSINESS_NOTIFICATION = gql`
  mutation SendBusinessNotification($input: SendBusinessNotificationInput!) {
    sendBusinessNotification(input: $input) {
      success
      message
      recipientCount
    }
  }
`;

// Integration Configuration Mutations
export const CONFIGURE_COMMUNICATION_CHANNELS = gql`
  mutation ConfigureCommunicationChannels($input: ConfigureCommunicationChannelsInput!) {
    configureCommunicationChannels(input: $input) {
      success
      message
    }
  }
`;

export const CREATE_SLACK_INTEGRATION = gql`
  mutation CreateSlackIntegration($input: CreateSlackIntegrationInput!) {
    createSlackIntegration(input: $input) {
      success
      message
    }
  }
`;

export const CREATE_TEAMS_INTEGRATION = gql`
  mutation CreateTeamsIntegration($input: CreateTeamsIntegrationInput!) {
    createTeamsIntegration(input: $input) {
      success
      message
    }
  }
`;

export const CREATE_EMAIL_PROVIDER = gql`
  mutation CreateEmailProvider($input: CreateEmailProviderInput!) {
    createEmailProvider(input: $input) {
      success
      message
    }
  }
`;

export const CREATE_SMS_PROVIDER = gql`
  mutation CreateSMSProvider($input: CreateSMSProviderInput!) {
    createSMSProvider(input: $input) {
      success
      message
    }
  }
`;