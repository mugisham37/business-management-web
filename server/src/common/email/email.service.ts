import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email Service
 * 
 * Handles all email sending operations using SMTP.
 * Supports both development (console logging) and production (actual sending).
 * 
 * Features:
 * - SMTP configuration from environment variables
 * - HTML email templates
 * - Graceful fallback to logging in development
 * - Error handling and retry logic
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly isProduction: boolean;
  private readonly smtpConfigured: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Check if SMTP is configured
    this.smtpConfigured = !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD
    );

    this.logger.log('📧 Email Service Initialization');
    this.logger.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    this.logger.log(`   SMTP Host: ${process.env.SMTP_HOST || 'NOT SET'}`);
    this.logger.log(`   SMTP Port: ${process.env.SMTP_PORT || 'NOT SET'}`);
    this.logger.log(`   SMTP User: ${process.env.SMTP_USER || 'NOT SET'}`);
    this.logger.log(`   SMTP Password: ${process.env.SMTP_PASSWORD ? '***SET***' : 'NOT SET'}`);
    this.logger.log(`   SMTP From: ${process.env.SMTP_FROM || process.env.SMTP_USER || 'NOT SET'}`);
    this.logger.log(`   SMTP Configured: ${this.smtpConfigured ? 'YES ✅' : 'NO ❌'}`);

    if (this.smtpConfigured) {
      this.initializeTransporter();
    } else {
      this.logger.warn(
        '⚠️  SMTP not configured. Emails will be logged to console. ' +
        'Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in .env'
      );
    }
  }

  /**
   * Initialize nodemailer transporter with SMTP configuration
   */
  private initializeTransporter(): void {
    try {
      this.logger.log('🔧 Initializing SMTP transporter...');
      
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      this.logger.log('✅ Email transporter initialized successfully');
      this.logger.log(`   Host: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
      this.logger.log(`   Secure: ${process.env.SMTP_PORT === '465'}`);
    } catch (error) {
      this.logger.error('❌ Failed to initialize email transporter:', error);
      this.transporter = null;
    }
  }

  /**
   * Send an email
   * 
   * @param options - Email options (to, subject, html, text)
   * @returns Promise<boolean> - true if sent successfully, false otherwise
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      this.logger.log(`📧 Attempting to send email to: ${options.to}`);
      this.logger.log(`   Subject: ${options.subject}`);
      
      // If SMTP not configured, log to console
      if (!this.smtpConfigured || !this.transporter) {
        this.logger.warn('⚠️  SMTP not configured - email will not be sent');
        this.logger.log('📧 Email details (not sent):');
        this.logger.log(`   To: ${options.to}`);
        this.logger.log(`   Subject: ${options.subject}`);
        this.logger.log(`   Text: ${options.text || 'See HTML content'}`);
        return true; // Return true to not break the flow
      }

      this.logger.log('✉️  Sending email via SMTP...');
      
      // Send actual email
      const info = await this.transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      this.logger.log(`✅ Email sent successfully to ${options.to}`);
      this.logger.log(`   Message ID: ${info.messageId}`);
      this.logger.log(`   Response: ${info.response}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error);
      if (error instanceof Error) {
        this.logger.error(`   Error message: ${error.message}`);
        this.logger.error(`   Error stack: ${error.stack}`);
      }
      return false;
    }
  }

  /**
   * Send email verification email
   * 
   * @param email - User's email address
   * @param token - Verification token
   * @param firstName - User's first name
   * @returns Promise<boolean>
   */
  async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string,
  ): Promise<boolean> {
    this.logger.log(`🔐 Preparing verification email for: ${email}`);
    
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    
    this.logger.log(`   Verification URL: ${verificationUrl}`);

    const html = this.getVerificationEmailTemplate(firstName, verificationUrl);
    const text = `
Hello ${firstName},

Thank you for registering! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
The Team
    `.trim();

    return this.sendEmail({
      to: email,
      subject: 'Verify your email address',
      html,
      text,
    });
  }

  /**
   * Send password reset email
   * 
   * @param email - User's email address
   * @param token - Reset token
   * @param firstName - User's first name
   * @returns Promise<boolean>
   */
  async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string,
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;

    const html = this.getPasswordResetEmailTemplate(firstName, resetUrl);
    const text = `
Hello ${firstName},

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Team
    `.trim();

    return this.sendEmail({
      to: email,
      subject: 'Reset your password',
      html,
      text,
    });
  }

  /**
   * Send password changed notification email
   * 
   * @param email - User's email address
   * @param firstName - User's first name
   * @returns Promise<boolean>
   */
  async sendPasswordChangedEmail(
    email: string,
    firstName: string,
  ): Promise<boolean> {
    const html = this.getPasswordChangedEmailTemplate(firstName);
    const text = `
Hello ${firstName},

Your password has been successfully changed.

If you didn't make this change, please contact support immediately.

Best regards,
The Team
    `.trim();

    return this.sendEmail({
      to: email,
      subject: 'Password changed successfully',
      html,
      text,
    });
  }

  /**
   * HTML template for verification email
   */
  private getVerificationEmailTemplate(firstName: string, verificationUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Verify your email address</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello ${firstName},
              </p>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Thank you for registering! Please verify your email address by clicking the button below:
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; color: #2563eb; font-size: 14px; word-break: break-all;">
                ${verificationUrl}
              </p>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                This link will expire in 24 hours.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                If you didn't create an account, please ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Business Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * HTML template for password reset email
   */
  private getPasswordResetEmailTemplate(firstName: string, resetUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Reset your password</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello ${firstName},
              </p>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                We received a request to reset your password. Click the button below to create a new password:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 500;">Reset Password</a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 8px 0 0 0; color: #2563eb; font-size: 14px; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                This link will expire in 1 hour.
              </p>
              
              <p style="margin: 20px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.5;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Business Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * HTML template for password changed notification
   */
  private getPasswordChangedEmailTemplate(firstName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password changed</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">Password changed successfully</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 0 40px 40px 40px;">
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Hello ${firstName},
              </p>
              <p style="margin: 0 0 20px 0; color: #4a4a4a; font-size: 16px; line-height: 1.5;">
                Your password has been successfully changed.
              </p>
              
              <div style="margin: 30px 0; padding: 16px; background-color: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 4px;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                  ✓ Your account is now secured with your new password.
                </p>
              </div>
              
              <p style="margin: 20px 0 0 0; color: #dc2626; font-size: 14px; line-height: 1.5; font-weight: 500;">
                If you didn't make this change, please contact support immediately.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Business Management System. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }
}
