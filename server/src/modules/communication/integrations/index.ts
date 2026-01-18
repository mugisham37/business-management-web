// Integration Services
export { AuthCommunicationIntegrationService } from './auth-integration.service';
export { BusinessCommunicationIntegrationService } from './business-integration.service';
export { SystemCommunicationIntegrationService } from './system-integration.service';

// Integration interfaces for external modules
export interface AuthIntegrationInterface {
  sendWelcomeNotification(tenantId: string, userId: string, userDetails: any): Promise<void>;
  sendPasswordResetNotification(tenantId: string, userDetails: any): Promise<void>;
  sendTwoFactorOTP(tenantId: string, phoneNumber: string, otp: string, userDetails: any): Promise<void>;
  sendAccountVerificationNotification(tenantId: string, userDetails: any): Promise<void>;
  sendSecurityAlert(tenantId: string, userId: string, alertDetails: any): Promise<void>;
  sendSessionExpiryWarning(tenantId: string, userId: string, expiryTime: Date): Promise<void>;
  sendAccountLockoutNotification(tenantId: string, userDetails: any): Promise<void>;
}

export interface BusinessIntegrationInterface {
  sendOrderConfirmation(tenantId: string, orderDetails: any): Promise<void>;
  sendLowStockAlert(tenantId: string, inventoryDetails: any): Promise<void>;
  sendPaymentNotification(tenantId: string, paymentDetails: any): Promise<void>;
  sendShipmentNotification(tenantId: string, shipmentDetails: any): Promise<void>;
  sendShiftReminder(tenantId: string, shiftDetails: any): Promise<void>;
  sendMaintenanceNotification(tenantId: string, maintenanceDetails: any): Promise<void>;
  sendFeedbackRequest(tenantId: string, feedbackDetails: any): Promise<void>;
  sendPromotionalCampaign(tenantId: string, campaignDetails: any): Promise<void>;
}

export interface SystemIntegrationInterface {
  sendSystemErrorAlert(tenantId: string, errorDetails: any): Promise<void>;
  sendPerformanceAlert(tenantId: string, performanceDetails: any): Promise<void>;
  sendBackupNotification(tenantId: string, backupDetails: any): Promise<void>;
  sendDeploymentNotification(tenantId: string, deploymentDetails: any): Promise<void>;
  sendSecurityIncidentAlert(tenantId: string, incidentDetails: any): Promise<void>;
  sendSystemHealthReport(tenantId: string, healthData: any): Promise<void>;
  sendCapacityAlert(tenantId: string, capacityDetails: any): Promise<void>;
}

// Integration event types
export const INTEGRATION_EVENTS = {
  // Auth events
  USER_REGISTERED: 'auth.user.registered',
  PASSWORD_RESET_REQUESTED: 'auth.password.reset.requested',
  TWO_FACTOR_REQUESTED: 'auth.two_factor.requested',
  ACCOUNT_VERIFICATION_REQUESTED: 'auth.account.verification.requested',
  SECURITY_ALERT_TRIGGERED: 'auth.security.alert.triggered',
  SESSION_EXPIRY_WARNING: 'auth.session.expiry.warning',
  ACCOUNT_LOCKED: 'auth.account.locked',

  // Business events
  ORDER_CREATED: 'business.order.created',
  INVENTORY_LOW_STOCK: 'business.inventory.low_stock',
  PAYMENT_PROCESSED: 'business.payment.processed',
  SHIPMENT_STATUS_CHANGED: 'business.shipment.status.changed',
  SHIFT_SCHEDULED: 'business.shift.scheduled',
  MAINTENANCE_SCHEDULED: 'business.maintenance.scheduled',
  FEEDBACK_REQUESTED: 'business.feedback.requested',
  CAMPAIGN_LAUNCHED: 'business.campaign.launched',

  // System events
  SYSTEM_ERROR_OCCURRED: 'system.error.occurred',
  PERFORMANCE_DEGRADED: 'system.performance.degraded',
  BACKUP_COMPLETED: 'system.backup.completed',
  DEPLOYMENT_STATUS_CHANGED: 'system.deployment.status.changed',
  SECURITY_INCIDENT_DETECTED: 'system.security.incident.detected',
  HEALTH_REPORT_GENERATED: 'system.health.report.generated',
  CAPACITY_THRESHOLD_EXCEEDED: 'system.capacity.threshold.exceeded',
} as const;

// Integration configuration
export interface IntegrationConfig {
  auth: {
    enableWelcomeEmails: boolean;
    enablePasswordResetEmails: boolean;
    enableTwoFactorSMS: boolean;
    enableSecurityAlerts: boolean;
    sessionWarningMinutes: number;
  };
  business: {
    enableOrderConfirmations: boolean;
    enableInventoryAlerts: boolean;
    enablePaymentNotifications: boolean;
    enableShipmentTracking: boolean;
    enableShiftReminders: boolean;
    enableMaintenanceNotifications: boolean;
    enableFeedbackRequests: boolean;
    enablePromotionalCampaigns: boolean;
  };
  system: {
    enableErrorAlerts: boolean;
    enablePerformanceAlerts: boolean;
    enableBackupNotifications: boolean;
    enableDeploymentNotifications: boolean;
    enableSecurityIncidentAlerts: boolean;
    enableHealthReports: boolean;
    enableCapacityAlerts: boolean;
  };
}

// Default integration configuration
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
  auth: {
    enableWelcomeEmails: true,
    enablePasswordResetEmails: true,
    enableTwoFactorSMS: true,
    enableSecurityAlerts: true,
    sessionWarningMinutes: 30,
  },
  business: {
    enableOrderConfirmations: true,
    enableInventoryAlerts: true,
    enablePaymentNotifications: true,
    enableShipmentTracking: true,
    enableShiftReminders: true,
    enableMaintenanceNotifications: true,
    enableFeedbackRequests: false,
    enablePromotionalCampaigns: false,
  },
  system: {
    enableErrorAlerts: true,
    enablePerformanceAlerts: true,
    enableBackupNotifications: true,
    enableDeploymentNotifications: true,
    enableSecurityIncidentAlerts: true,
    enableHealthReports: true,
    enableCapacityAlerts: true,
  },
};

// Integration utility functions
export const createIntegrationMetadata = (
  eventType: string,
  tenantId: string,
  additionalData?: Record<string, any>
) => ({
  eventType,
  tenantId,
  timestamp: new Date(),
  integrationId: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  ...additionalData,
});

export const validateIntegrationEvent = (eventType: string): boolean => {
  return Object.values(INTEGRATION_EVENTS).includes(eventType as any);
};

export const getIntegrationCategory = (eventType: string): 'auth' | 'business' | 'system' | 'unknown' => {
  if (eventType.startsWith('auth.')) return 'auth';
  if (eventType.startsWith('business.')) return 'business';
  if (eventType.startsWith('system.')) return 'system';
  return 'unknown';
};

export const shouldProcessIntegrationEvent = (
  eventType: string,
  config: IntegrationConfig
): boolean => {
  const category = getIntegrationCategory(eventType);
  
  switch (category) {
    case 'auth':
      return config.auth.enableWelcomeEmails || 
             config.auth.enablePasswordResetEmails || 
             config.auth.enableTwoFactorSMS || 
             config.auth.enableSecurityAlerts;
    case 'business':
      return config.business.enableOrderConfirmations || 
             config.business.enableInventoryAlerts || 
             config.business.enablePaymentNotifications || 
             config.business.enableShipmentTracking || 
             config.business.enableShiftReminders || 
             config.business.enableMaintenanceNotifications || 
             config.business.enableFeedbackRequests || 
             config.business.enablePromotionalCampaigns;
    case 'system':
      return config.system.enableErrorAlerts || 
             config.system.enablePerformanceAlerts || 
             config.system.enableBackupNotifications || 
             config.system.enableDeploymentNotifications || 
             config.system.enableSecurityIncidentAlerts || 
             config.system.enableHealthReports || 
             config.system.enableCapacityAlerts;
    default:
      return false;
  }
};

// Integration event handlers
export interface IntegrationEventHandler {
  eventType: string;
  handler: (tenantId: string, eventData: any) => Promise<void>;
}

export const createIntegrationEventHandlers = (
  authIntegration: AuthIntegrationInterface,
  businessIntegration: BusinessIntegrationInterface,
  systemIntegration: SystemIntegrationInterface
): IntegrationEventHandler[] => [
  // Auth handlers
  {
    eventType: INTEGRATION_EVENTS.USER_REGISTERED,
    handler: (tenantId, data) => authIntegration.sendWelcomeNotification(tenantId, data.userId, data.userDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.PASSWORD_RESET_REQUESTED,
    handler: (tenantId, data) => authIntegration.sendPasswordResetNotification(tenantId, data.userDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.TWO_FACTOR_REQUESTED,
    handler: (tenantId, data) => authIntegration.sendTwoFactorOTP(tenantId, data.phoneNumber, data.otp, data.userDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.ACCOUNT_VERIFICATION_REQUESTED,
    handler: (tenantId, data) => authIntegration.sendAccountVerificationNotification(tenantId, data.userDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.SECURITY_ALERT_TRIGGERED,
    handler: (tenantId, data) => authIntegration.sendSecurityAlert(tenantId, data.userId, data.alertDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.SESSION_EXPIRY_WARNING,
    handler: (tenantId, data) => authIntegration.sendSessionExpiryWarning(tenantId, data.userId, data.expiryTime),
  },
  {
    eventType: INTEGRATION_EVENTS.ACCOUNT_LOCKED,
    handler: (tenantId, data) => authIntegration.sendAccountLockoutNotification(tenantId, data.userDetails),
  },

  // Business handlers
  {
    eventType: INTEGRATION_EVENTS.ORDER_CREATED,
    handler: (tenantId, data) => businessIntegration.sendOrderConfirmation(tenantId, data.orderDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.INVENTORY_LOW_STOCK,
    handler: (tenantId, data) => businessIntegration.sendLowStockAlert(tenantId, data.inventoryDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.PAYMENT_PROCESSED,
    handler: (tenantId, data) => businessIntegration.sendPaymentNotification(tenantId, data.paymentDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.SHIPMENT_STATUS_CHANGED,
    handler: (tenantId, data) => businessIntegration.sendShipmentNotification(tenantId, data.shipmentDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.SHIFT_SCHEDULED,
    handler: (tenantId, data) => businessIntegration.sendShiftReminder(tenantId, data.shiftDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.MAINTENANCE_SCHEDULED,
    handler: (tenantId, data) => businessIntegration.sendMaintenanceNotification(tenantId, data.maintenanceDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.FEEDBACK_REQUESTED,
    handler: (tenantId, data) => businessIntegration.sendFeedbackRequest(tenantId, data.feedbackDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.CAMPAIGN_LAUNCHED,
    handler: (tenantId, data) => businessIntegration.sendPromotionalCampaign(tenantId, data.campaignDetails),
  },

  // System handlers
  {
    eventType: INTEGRATION_EVENTS.SYSTEM_ERROR_OCCURRED,
    handler: (tenantId, data) => systemIntegration.sendSystemErrorAlert(tenantId, data.errorDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.PERFORMANCE_DEGRADED,
    handler: (tenantId, data) => systemIntegration.sendPerformanceAlert(tenantId, data.performanceDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.BACKUP_COMPLETED,
    handler: (tenantId, data) => systemIntegration.sendBackupNotification(tenantId, data.backupDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.DEPLOYMENT_STATUS_CHANGED,
    handler: (tenantId, data) => systemIntegration.sendDeploymentNotification(tenantId, data.deploymentDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.SECURITY_INCIDENT_DETECTED,
    handler: (tenantId, data) => systemIntegration.sendSecurityIncidentAlert(tenantId, data.incidentDetails),
  },
  {
    eventType: INTEGRATION_EVENTS.HEALTH_REPORT_GENERATED,
    handler: (tenantId, data) => systemIntegration.sendSystemHealthReport(tenantId, data.healthData),
  },
  {
    eventType: INTEGRATION_EVENTS.CAPACITY_THRESHOLD_EXCEEDED,
    handler: (tenantId, data) => systemIntegration.sendCapacityAlert(tenantId, data.capacityDetails),
  },
];