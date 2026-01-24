/**
 * Real-time GraphQL Queries
 * Generated from GraphQL schema
 */

import { gql } from '@apollo/client';

// User Presence Queries
export const GET_ONLINE_USERS = gql`
  query GetOnlineUsers($input: GetOnlineUsersInput) {
    getOnlineUsers(input: $input) {
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

export const GET_CONNECTION_STATS = gql`
  query GetConnectionStats {
    getConnectionStats
  }
`;

export const GET_CONNECTION_HEALTH = gql`
  query GetConnectionHealth {
    getConnectionHealth
  }
`;

// Live Data Queries
export const LIVE_INVENTORY_LEVELS = gql`
  query LiveInventoryLevels($productIds: [String!]!, $locationId: String) {
    liveInventoryLevels(productIds: $productIds, locationId: $locationId) {
      productId
      variantId
      locationId
      currentLevel
      availableLevel
      reservedLevel
      reorderPoint
      lastUpdated
      status
    }
  }
`;

export const INVENTORY_DASHBOARD = gql`
  query InventoryDashboard($locationId: String) {
    inventoryDashboard(locationId: $locationId)
  }
`;

export const SALES_DASHBOARD = gql`
  query SalesDashboard($locationId: String) {
    salesDashboard(locationId: $locationId) {
      totalSales
      transactionCount
      averageTransactionValue
      hourlyBreakdown {
        hour
        sales
        transactions
      }
    }
  }
`;

export const LIVE_SALES_METRICS = gql`
  query LiveSalesMetrics($locationId: String) {
    liveSalesMetrics(locationId: $locationId)
  }
`;

export const CUSTOMER_ACTIVITY_FEED = gql`
  query CustomerActivityFeed($limit: Int, $customerId: String, $locationId: String) {
    customerActivityFeed(limit: $limit, customerId: $customerId, locationId: $locationId) {
      type
      customerId
      customerName
      customerEmail
      locationId
      timestamp
      details
    }
  }
`;

export const CUSTOMER_ENGAGEMENT_METRICS = gql`
  query CustomerEngagementMetrics {
    customerEngagementMetrics
  }
`;

export const ANALYTICS_OVERVIEW = gql`
  query AnalyticsOverview($locationId: String) {
    analyticsOverview(locationId: $locationId) {
      totalRevenue
      totalTransactions
      totalCustomers
      totalProducts
      averageOrderValue
      conversionRate
      timestamp
    }
  }
`;

export const KPI_METRICS = gql`
  query KpiMetrics($locationId: String) {
    kpiMetrics(locationId: $locationId) {
      name
      value
      unit
      change
      changeDirection
      target
      status
      timestamp
    }
  }
`;

export const ANALYTICS_ALERTS = gql`
  query AnalyticsAlerts($severity: String, $type: String, $locationId: String, $limit: Int) {
    analyticsAlerts(severity: $severity, type: $type, locationId: $locationId, limit: $limit)
  }
`;

// Notification Queries
export const GET_NOTIFICATIONS = gql`
  query GetNotifications($input: GetNotificationsInput) {
    getNotifications(input: $input) {
      nodes {
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
      totalCount
      hasMore
    }
  }
`;

// Communication Queries
export const GET_COMMUNICATION_HISTORY = gql`
  query GetCommunicationHistory($input: GetCommunicationHistoryInput) {
    getCommunicationHistory(input: $input) {
      items {
        id
        type
        channel
        recipient
        subject
        message
        status
        createdAt
        sentAt
        deliveredAt
        failureReason
      }
      totalCount
      hasMore
    }
  }
`;