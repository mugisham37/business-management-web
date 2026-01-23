/**
 * Real-time GraphQL Subscriptions
 * Generated from GraphQL schema
 */

import { gql } from '@apollo/client';

// User Presence Subscriptions
export const USER_STATUS_CHANGED = gql`
  subscription UserStatusChanged {
    userStatusChanged {
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

export const USER_ONLINE = gql`
  subscription UserOnline {
    userOnline {
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

export const USER_OFFLINE = gql`
  subscription UserOffline {
    userOffline {
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

export const MESSAGE_RECEIVED = gql`
  subscription MessageReceived {
    messageReceived {
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

export const TYPING_INDICATOR = gql`
  subscription TypingIndicator {
    typingIndicator
  }
`;

// Notification Subscriptions
export const NOTIFICATION_RECEIVED = gql`
  subscription NotificationReceived {
    notificationReceived {
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
`;

// Live Data Subscriptions
export const INVENTORY_UPDATED = gql`
  subscription InventoryUpdated {
    inventoryUpdated
  }
`;

export const LOW_STOCK_ALERT = gql`
  subscription LowStockAlert {
    lowStockAlert
  }
`;

export const SALES_UPDATED = gql`
  subscription SalesUpdated {
    salesUpdated
  }
`;

export const CUSTOMER_ACTIVITY_UPDATED = gql`
  subscription CustomerActivityUpdated {
    customerActivityUpdated
  }
`;

export const ANALYTICS_UPDATED = gql`
  subscription AnalyticsUpdated {
    analyticsUpdated
  }
`;

export const ALERT_TRIGGERED = gql`
  subscription AlertTriggered {
    alertTriggered
  }
`;

// Legacy subscriptions for backward compatibility
export const REALTIME_NOTIFICATIONS = gql`
  subscription RealtimeNotifications($tenantId: ID!, $userId: ID) {
    realtimeNotifications(tenantId: $tenantId, userId: $userId) {
      id
      type
      title
      message
      priority
      data
      tenantId
      userId
      createdAt
      readAt
    }
  }
`;

export const SYSTEM_ALERTS = gql`
  subscription SystemAlerts($tenantId: ID!) {
    systemAlerts(tenantId: $tenantId) {
      id
      level
      category
      message
      details
      tenantId
      resolvedAt
      createdAt
    }
  }
`;

export const BUSINESS_EVENTS = gql`
  subscription BusinessEvents($tenantId: ID!, $eventTypes: [String!]) {
    businessEvents(tenantId: $tenantId, eventTypes: $eventTypes) {
      id
      type
      entity
      entityId
      action
      data
      tenantId
      userId
      timestamp
      metadata
    }
  }
`;