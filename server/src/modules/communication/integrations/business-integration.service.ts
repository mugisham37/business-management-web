import { Injectable, Logger } from '@nestjs/common';
import { CommunicationIntegrationService } from '../services/communication-integration.service';
import { EmailNotificationService } from '../services/email-notification.service';
import { SMSNotificationService } from '../services/sms-notification.service';
import { SlackIntegrationService } from '../services/slack-integration.service';

@Injectable()
export class BusinessCommunicationIntegrationService {
  private readonly logger = new Logger(BusinessCommunicationIntegrationService.name);

  constructor(
    private readonly communicationService: CommunicationIntegrationService,
    private readonly emailService: EmailNotificationService,
    private readonly smsService: SMSNotificationService,
    private readonly slackService: SlackIntegrationService,
  ) {}

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(
    tenantId: string,
    orderDetails: {
      orderId: string;
      customerId: string;
      customerEmail: string;
      customerPhone?: string;
      customerName: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      total: number;
      estimatedDelivery?: Date;
      trackingNumber?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending order confirmation for order ${orderDetails.orderId}`);

      const itemsList = orderDetails.items
        .map(item => `${item.name} (Qty: ${item.quantity}) - $${item.price.toFixed(2)}`)
        .join('\n');

      await this.communicationService.sendMultiChannelNotification(tenantId, {
        title: `Order Confirmation - #${orderDetails.orderId}`,
        message: `Thank you for your order! Your order #${orderDetails.orderId} has been confirmed.`,
        priority: 'medium',
        type: 'order_confirmation',
        channels: ['email', 'sms'],
        recipients: {
          userIds: [orderDetails.customerId],
          emails: [orderDetails.customerEmail],
          ...(orderDetails.customerPhone && { phoneNumbers: [orderDetails.customerPhone] }),
        },
        templateName: 'order_confirmation',
        templateVariables: {
          customerName: orderDetails.customerName,
          orderId: orderDetails.orderId,
          items: itemsList,
          total: orderDetails.total.toFixed(2),
          estimatedDelivery: orderDetails.estimatedDelivery?.toLocaleDateString(),
          trackingNumber: orderDetails.trackingNumber,
          orderUrl: `${process.env.FRONTEND_URL}/orders/${orderDetails.orderId}`,
        },
      });

      this.logger.log(`Order confirmation sent successfully for order ${orderDetails.orderId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send order confirmation: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send inventory low stock alert
   */
  async sendLowStockAlert(
    tenantId: string,
    inventoryDetails: {
      productId: string;
      productName: string;
      currentStock: number;
      minimumStock: number;
      locationId?: string;
      locationName?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending low stock alert for product ${inventoryDetails.productId}`);

      await this.communicationService.sendAlert(tenantId, {
        title: 'Low Stock Alert',
        message: `Product "${inventoryDetails.productName}" is running low on stock. Current: ${inventoryDetails.currentStock}, Minimum: ${inventoryDetails.minimumStock}`,
        severity: 'warning',
        metadata: {
          productId: inventoryDetails.productId,
          productName: inventoryDetails.productName,
          currentStock: inventoryDetails.currentStock,
          minimumStock: inventoryDetails.minimumStock,
          locationId: inventoryDetails.locationId,
          locationName: inventoryDetails.locationName,
        },
        actionUrl: `${process.env.FRONTEND_URL}/inventory/${inventoryDetails.productId}`,
        actionLabel: 'View Product',
        recipients: {
          roles: ['inventory_manager', 'warehouse_manager'],
        },
      });

      this.logger.log(`Low stock alert sent successfully for product ${inventoryDetails.productId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send low stock alert: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send payment notification
   */
  async sendPaymentNotification(
    tenantId: string,
    paymentDetails: {
      paymentId: string;
      customerId: string;
      customerEmail: string;
      customerName: string;
      amount: number;
      currency: string;
      status: 'success' | 'failed' | 'pending';
      orderId?: string;
      invoiceId?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending payment notification for payment ${paymentDetails.paymentId}`);

      const statusMessages = {
        success: 'Your payment has been processed successfully.',
        failed: 'Your payment could not be processed. Please try again.',
        pending: 'Your payment is being processed and will be confirmed shortly.',
      };

      const priority = paymentDetails.status === 'failed' ? 'high' : 'normal';

      await this.emailService.sendEmail(tenantId, {
        to: [paymentDetails.customerEmail],
        subject: `Payment ${paymentDetails.status === 'success' ? 'Confirmation' : 'Update'} - ${paymentDetails.paymentId}`,
        html: `
          <h2>Payment ${paymentDetails.status.charAt(0).toUpperCase() + paymentDetails.status.slice(1)}</h2>
          <p>Hello ${paymentDetails.customerName},</p>
          <p>${statusMessages[paymentDetails.status]}</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Payment ID:</strong> ${paymentDetails.paymentId}</p>
            <p><strong>Amount:</strong> ${paymentDetails.amount.toFixed(2)} ${paymentDetails.currency}</p>
            <p><strong>Status:</strong> ${paymentDetails.status.toUpperCase()}</p>
            ${paymentDetails.orderId ? `<p><strong>Order ID:</strong> ${paymentDetails.orderId}</p>` : ''}
            ${paymentDetails.invoiceId ? `<p><strong>Invoice ID:</strong> ${paymentDetails.invoiceId}</p>` : ''}
          </div>
          ${paymentDetails.status === 'success' ? '<p>Thank you for your business!</p>' : ''}
        `,
        priority,
      });

      this.logger.log(`Payment notification sent successfully for payment ${paymentDetails.paymentId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send payment notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send shipment tracking notification
   */
  async sendShipmentNotification(
    tenantId: string,
    shipmentDetails: {
      orderId: string;
      customerId: string;
      customerEmail: string;
      customerPhone?: string;
      customerName: string;
      trackingNumber: string;
      carrier: string;
      status: 'shipped' | 'in_transit' | 'delivered' | 'exception';
      estimatedDelivery?: Date;
      actualDelivery?: Date;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending shipment notification for order ${shipmentDetails.orderId}`);

      const statusMessages = {
        shipped: 'Your order has been shipped!',
        in_transit: 'Your order is on its way!',
        delivered: 'Your order has been delivered!',
        exception: 'There was an issue with your shipment.',
      };

      await this.communicationService.sendMultiChannelNotification(tenantId, {
        title: statusMessages[shipmentDetails.status],
        message: `Order #${shipmentDetails.orderId} - ${statusMessages[shipmentDetails.status]}`,
        priority: shipmentDetails.status === 'exception' ? 'high' : 'medium',
        type: 'shipment_update',
        channels: ['email', 'sms'],
        recipients: {
          userIds: [shipmentDetails.customerId],
          emails: [shipmentDetails.customerEmail],
          ...(shipmentDetails.customerPhone && { phoneNumbers: [shipmentDetails.customerPhone] }),
        },
        templateName: 'shipment_notification',
        templateVariables: {
          customerName: shipmentDetails.customerName,
          orderId: shipmentDetails.orderId,
          trackingNumber: shipmentDetails.trackingNumber,
          carrier: shipmentDetails.carrier,
          status: shipmentDetails.status,
          estimatedDelivery: shipmentDetails.estimatedDelivery?.toLocaleDateString(),
          actualDelivery: shipmentDetails.actualDelivery?.toLocaleDateString(),
          trackingUrl: `https://tracking.${shipmentDetails.carrier.toLowerCase()}.com/${shipmentDetails.trackingNumber}`,
        },
      });

      this.logger.log(`Shipment notification sent successfully for order ${shipmentDetails.orderId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send shipment notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send employee shift reminder
   */
  async sendShiftReminder(
    tenantId: string,
    shiftDetails: {
      employeeId: string;
      employeeEmail: string;
      employeePhone?: string;
      employeeName: string;
      shiftStart: Date;
      shiftEnd: Date;
      locationName: string;
      position: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending shift reminder to employee ${shiftDetails.employeeId}`);

      const reminderTime = new Date(shiftDetails.shiftStart.getTime() - 2 * 60 * 60 * 1000); // 2 hours before

      await this.communicationService.sendMultiChannelNotification(tenantId, {
        title: 'Shift Reminder',
        message: `Reminder: Your shift starts at ${shiftDetails.shiftStart.toLocaleTimeString()} at ${shiftDetails.locationName}`,
        priority: 'medium',
        type: 'shift_reminder',
        channels: ['email', 'sms'],
        recipients: {
          userIds: [shiftDetails.employeeId],
          emails: [shiftDetails.employeeEmail],
          ...(shiftDetails.employeePhone && { phoneNumbers: [shiftDetails.employeePhone] }),
        },
        scheduledAt: reminderTime,
        templateVariables: {
          employeeName: shiftDetails.employeeName,
          shiftStart: shiftDetails.shiftStart.toLocaleString(),
          shiftEnd: shiftDetails.shiftEnd.toLocaleString(),
          locationName: shiftDetails.locationName,
          position: shiftDetails.position,
        },
      });

      this.logger.log(`Shift reminder scheduled successfully for employee ${shiftDetails.employeeId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send shift reminder: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send system maintenance notification
   */
  async sendMaintenanceNotification(
    tenantId: string,
    maintenanceDetails: {
      title: string;
      description: string;
      startTime: Date;
      endTime: Date;
      affectedServices: string[];
      severity: 'low' | 'medium' | 'high';
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending maintenance notification for tenant ${tenantId}`);

      await this.communicationService.sendAlert(tenantId, {
        title: `Scheduled Maintenance: ${maintenanceDetails.title}`,
        message: maintenanceDetails.description,
        severity: maintenanceDetails.severity === 'high' ? 'warning' : 'info',
        metadata: {
          startTime: maintenanceDetails.startTime,
          endTime: maintenanceDetails.endTime,
          affectedServices: maintenanceDetails.affectedServices,
          duration: Math.round((maintenanceDetails.endTime.getTime() - maintenanceDetails.startTime.getTime()) / (1000 * 60)),
        },
        recipients: {
          roles: ['admin', 'manager', 'system_admin'],
        },
      });

      this.logger.log(`Maintenance notification sent successfully for tenant ${tenantId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send maintenance notification: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send customer feedback request
   */
  async sendFeedbackRequest(
    tenantId: string,
    feedbackDetails: {
      customerId: string;
      customerEmail: string;
      customerName: string;
      orderId?: string;
      serviceType: string;
      feedbackUrl: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending feedback request to customer ${feedbackDetails.customerId}`);

      await this.emailService.sendEmail(tenantId, {
        to: [feedbackDetails.customerEmail],
        subject: 'We Value Your Feedback',
        html: `
          <h2>How was your experience?</h2>
          <p>Hello ${feedbackDetails.customerName},</p>
          <p>We hope you're satisfied with our ${feedbackDetails.serviceType}${feedbackDetails.orderId ? ` for order #${feedbackDetails.orderId}` : ''}.</p>
          <p>Your feedback helps us improve our services. It will only take a few minutes:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${feedbackDetails.feedbackUrl}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Leave Feedback</a>
          </div>
          <p>Thank you for choosing us!</p>
        `,
        priority: 'low',
      });

      this.logger.log(`Feedback request sent successfully to customer ${feedbackDetails.customerId}`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send feedback request: ${err.message}`, err.stack);
      throw error;
    }
  }

  /**
   * Send promotional campaign
   */
  async sendPromotionalCampaign(
    tenantId: string,
    campaignDetails: {
      campaignId: string;
      title: string;
      content: string;
      targetSegment: string;
      customerIds: string[];
      discountCode?: string;
      expiryDate?: Date;
      landingPageUrl?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending promotional campaign ${campaignDetails.campaignId} to ${campaignDetails.customerIds.length} customers`);

      await this.communicationService.sendBusinessNotification(tenantId, {
        type: 'promotional_campaign',
        title: campaignDetails.title,
        message: campaignDetails.content,
        priority: 'low',
        recipients: {
          userIds: campaignDetails.customerIds,
        },
        templateName: 'promotional_email',
        templateVariables: {
          campaignTitle: campaignDetails.title,
          content: campaignDetails.content,
          discountCode: campaignDetails.discountCode,
          expiryDate: campaignDetails.expiryDate?.toLocaleDateString(),
          landingPageUrl: campaignDetails.landingPageUrl,
          unsubscribeUrl: `${process.env.FRONTEND_URL}/unsubscribe`,
        },
        metadata: {
          campaignId: campaignDetails.campaignId,
          targetSegment: campaignDetails.targetSegment,
        },
      });

      this.logger.log(`Promotional campaign sent successfully to ${campaignDetails.customerIds.length} customers`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Failed to send promotional campaign: ${err.message}`, err.stack);
      throw error;
    }
  }
}