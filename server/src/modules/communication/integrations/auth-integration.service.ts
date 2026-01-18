import { Injectable, Logger } from '@nestjs/common';
import { CommunicationIntegrationService } from '../services/communication-integration.service';
import { EmailNotificationService } from '../services/email-notification.service';
import { SMSNotificationService } from '../services/sms-notification.service';

@Injectable()
export class AuthCommunicationIntegrationService {
  private readonly logger = new Logger(AuthCommunicationIntegrationService.name);

  constructor(
    private readonly communicationService: CommunicationIntegrationService,
    private readonly emailService: EmailNotificationService,
    private readonly smsService: SMSNotificationService,
  ) {}

  /**
   * Send welcome email to new user
   */
  async sendWelcomeNotification(
    tenantId: string,
    userId: string,
    userDetails: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending welcome notification to user ${userId} in tenant ${tenantId}`);

      await this.communicationService.sendBusinessNotification(tenantId, {
        type: 'user_welcome',
        title: 'Welcome to Business Platform!',
        message: `Welcome ${userDetails.firstName}! Your account has been successfully created.`,
        priority: 'medium',
        recipients: {
          userIds: [userId],
          emails: [userDetails.email],
        },
        templateName: 'welcome_email',
        templateVariables: {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          fullName: `${userDetails.firstName} ${userDetails.lastName}`,
          brandName: 'Business Platform',
          loginUrl: `${process.env.FRONTEND_URL}/login`,
        },
      });

      this.logger.log(`Welcome notification sent successfully to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send password reset notification
   */
  async sendPasswordResetNotification(
    tenantId: string,
    userDetails: {
      email: string;
      firstName: string;
      resetToken: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending password reset notification to ${userDetails.email}`);

      await this.emailService.sendEmail(tenantId, {
        to: [userDetails.email],
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${userDetails.firstName},</p>
          <p>You have requested to reset your password. Click the link below to reset it:</p>
          <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${userDetails.resetToken}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
        text: `Hello ${userDetails.firstName}, you have requested to reset your password. Visit: ${process.env.FRONTEND_URL}/reset-password?token=${userDetails.resetToken}`,
        priority: 'high',
      });

      this.logger.log(`Password reset notification sent successfully to ${userDetails.email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send OTP for two-factor authentication
   */
  async sendTwoFactorOTP(
    tenantId: string,
    phoneNumber: string,
    otp: string,
    userDetails: {
      firstName: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending 2FA OTP to ${phoneNumber.replace(/\d(?=\d{4})/g, '*')}`);

      await this.smsService.sendOTP(tenantId, phoneNumber, otp, {
        validityMinutes: 10,
        brandName: 'Business Platform',
      });

      this.logger.log(`2FA OTP sent successfully`);
    } catch (error) {
      this.logger.error(`Failed to send 2FA OTP: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send account verification email
   */
  async sendAccountVerificationNotification(
    tenantId: string,
    userDetails: {
      email: string;
      firstName: string;
      verificationToken: string;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending account verification notification to ${userDetails.email}`);

      await this.emailService.sendEmail(tenantId, {
        to: [userDetails.email],
        subject: 'Verify Your Account',
        html: `
          <h2>Account Verification</h2>
          <p>Hello ${userDetails.firstName},</p>
          <p>Please verify your account by clicking the link below:</p>
          <p><a href="${process.env.FRONTEND_URL}/verify-account?token=${userDetails.verificationToken}">Verify Account</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
        text: `Hello ${userDetails.firstName}, please verify your account by visiting: ${process.env.FRONTEND_URL}/verify-account?token=${userDetails.verificationToken}`,
        priority: 'high',
      });

      this.logger.log(`Account verification notification sent successfully to ${userDetails.email}`);
    } catch (error) {
      this.logger.error(`Failed to send account verification notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send security alert notification
   */
  async sendSecurityAlert(
    tenantId: string,
    userId: string,
    alertDetails: {
      type: 'login_attempt' | 'password_change' | 'suspicious_activity';
      location?: string;
      ipAddress?: string;
      userAgent?: string;
      timestamp: Date;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending security alert for user ${userId} in tenant ${tenantId}`);

      const alertMessages = {
        login_attempt: 'New login detected from an unrecognized device or location',
        password_change: 'Your password has been changed',
        suspicious_activity: 'Suspicious activity detected on your account',
      };

      await this.communicationService.sendAlert(tenantId, {
        title: 'Security Alert',
        message: alertMessages[alertDetails.type],
        severity: 'warning',
        metadata: {
          alertType: alertDetails.type,
          location: alertDetails.location,
          ipAddress: alertDetails.ipAddress,
          userAgent: alertDetails.userAgent,
          timestamp: alertDetails.timestamp,
        },
        recipients: {
          userIds: [userId],
        },
      });

      this.logger.log(`Security alert sent successfully for user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send security alert: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send session expiry warning
   */
  async sendSessionExpiryWarning(
    tenantId: string,
    userId: string,
    expiryTime: Date,
  ): Promise<void> {
    try {
      this.logger.log(`Sending session expiry warning to user ${userId}`);

      await this.communicationService.sendBusinessNotification(tenantId, {
        type: 'session_expiry_warning',
        title: 'Session Expiring Soon',
        message: `Your session will expire at ${expiryTime.toLocaleString()}. Please save your work.`,
        priority: 'medium',
        recipients: {
          userIds: [userId],
        },
      });

      this.logger.log(`Session expiry warning sent successfully to user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to send session expiry warning: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Send account lockout notification
   */
  async sendAccountLockoutNotification(
    tenantId: string,
    userDetails: {
      email: string;
      firstName: string;
      lockoutReason: string;
      unlockTime?: Date;
    },
  ): Promise<void> {
    try {
      this.logger.log(`Sending account lockout notification to ${userDetails.email}`);

      const unlockMessage = userDetails.unlockTime 
        ? `Your account will be automatically unlocked at ${userDetails.unlockTime.toLocaleString()}.`
        : 'Please contact support to unlock your account.';

      await this.emailService.sendEmail(tenantId, {
        to: [userDetails.email],
        subject: 'Account Locked',
        html: `
          <h2>Account Locked</h2>
          <p>Hello ${userDetails.firstName},</p>
          <p>Your account has been locked due to: ${userDetails.lockoutReason}</p>
          <p>${unlockMessage}</p>
          <p>If you believe this is an error, please contact our support team.</p>
        `,
        text: `Hello ${userDetails.firstName}, your account has been locked due to: ${userDetails.lockoutReason}. ${unlockMessage}`,
        priority: 'high',
      });

      this.logger.log(`Account lockout notification sent successfully to ${userDetails.email}`);
    } catch (error) {
      this.logger.error(`Failed to send account lockout notification: ${error.message}`, error.stack);
      throw error;
    }
  }
}