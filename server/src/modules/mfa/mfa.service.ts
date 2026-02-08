import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SecurityService } from '../../common/security/security.service';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface MFASetupResult {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface MFAStatus {
  enabled: boolean;
  totpEnabled: boolean;
  backupCodesRemaining: number;
}

/**
 * MFA Service for multi-factor authentication management
 * 
 * Features:
 * - TOTP (Time-based One-Time Password) setup and validation
 * - Backup code generation and validation
 * - MFA status management
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.7
 */
@Injectable()
export class MFAService {
  private readonly logger = new Logger(MFAService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly security: SecurityService,
  ) {}

  /**
   * Generate TOTP secret, QR code, and backup codes for MFA setup
   * 
   * Requirement 13.1: WHEN a user enables MFA, THE MFA_System SHALL generate 
   * a TOTP secret and display a QR code
   * 
   * Requirement 13.3: WHEN MFA is enabled, THE MFA_System SHALL generate 
   * 10 backup codes for account recovery
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns MFA setup data (secret, QR code, backup codes)
   */
  async generateSecret(userId: string, organizationId: string): Promise<MFASetupResult> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Check if MFA is already enabled
      if (user.mfaEnabled) {
        throw new BadRequestException('MFA is already enabled for this user');
      }

      // Generate TOTP secret
      const secret = speakeasy.generateSecret({
        name: `${user.email}`,
        issuer: 'Enterprise Auth System',
        length: 32,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

      // Generate 10 backup codes
      const backupCodes = await this.generateBackupCodesInternal(userId);

      // Store encrypted secret (not yet enabled)
      const encryptedSecret = this.security.encrypt(secret.base32);
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaSecret: encryptedSecret,
        },
      });

      this.logger.log(`MFA secret generated for user: ${userId}`);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error) {
      this.logger.error(`Failed to generate MFA secret for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Enable TOTP after validating a code
   * 
   * Requirement 13.2: WHEN a user confirms MFA setup, THE MFA_System SHALL 
   * require validation of a TOTP code before activation
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param token - TOTP code to validate
   */
  async enableTOTP(userId: string, organizationId: string, token: string): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Check if MFA is already enabled
      if (user.mfaEnabled) {
        throw new BadRequestException('MFA is already enabled for this user');
      }

      // Check if secret exists
      if (!user.mfaSecret) {
        throw new BadRequestException('MFA secret not found. Please generate a secret first.');
      }

      // Decrypt secret
      const secret = this.security.decrypt(user.mfaSecret);

      // Validate TOTP code
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after for clock skew
      });

      if (!isValid) {
        throw new ForbiddenException('Invalid TOTP code');
      }

      // Enable MFA
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
        },
      });

      this.logger.log(`MFA enabled for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to enable MFA for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Disable TOTP after validating password and code
   * 
   * Requirement 13.7: WHEN a user disables MFA, THE MFA_System SHALL require 
   * current password and a valid TOTP code
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param password - Current password
   * @param token - TOTP code to validate
   */
  async disableTOTP(
    userId: string,
    organizationId: string,
    password: string,
    token: string,
  ): Promise<void> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Check if MFA is enabled
      if (!user.mfaEnabled) {
        throw new BadRequestException('MFA is not enabled for this user');
      }

      // Verify password
      const isPasswordValid = await this.security.verifyPassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new ForbiddenException('Invalid password');
      }

      // Verify TOTP code
      const isTotpValid = await this.validateTOTP(userId, organizationId, token);
      if (!isTotpValid) {
        throw new ForbiddenException('Invalid TOTP code');
      }

      // Disable MFA and clear secret
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: false,
          mfaSecret: null,
        },
      });

      // Delete all backup codes
      await this.prisma.mFABackupCode.deleteMany({
        where: { userId },
      });

      this.logger.log(`MFA disabled for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to disable MFA for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Validate a TOTP code
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param token - TOTP code to validate
   * @returns True if valid, false otherwise
   */
  async validateTOTP(userId: string, organizationId: string, token: string): Promise<boolean> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        return false;
      }

      // Check if MFA is enabled
      if (!user.mfaEnabled || !user.mfaSecret) {
        return false;
      }

      // Decrypt secret
      const secret = this.security.decrypt(user.mfaSecret);

      // Validate TOTP code
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps before/after for clock skew
      });

      return isValid;
    } catch (error) {
      this.logger.error(`Failed to validate TOTP for user: ${userId}`, error);
      return false;
    }
  }

  /**
   * Generate 10 backup codes (internal method)
   * 
   * @param userId - User ID
   * @returns Array of plain text backup codes
   */
  private async generateBackupCodesInternal(userId: string): Promise<string[]> {
    const codes: string[] = [];
    const hashedCodes: { userId: string; codeHash: string }[] = [];

    // Generate 10 backup codes
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric code
      const code = this.security.generateToken(4).toUpperCase().substring(0, 8);
      codes.push(code);

      // Hash the code
      const codeHash = await this.security.hashPassword(code);
      hashedCodes.push({
        userId,
        codeHash,
      });
    }

    // Store hashed codes
    await this.prisma.mFABackupCode.createMany({
      data: hashedCodes,
    });

    return codes;
  }

  /**
   * Generate new backup codes (public method)
   * 
   * Requirement 13.3: WHEN MFA is enabled, THE MFA_System SHALL generate 
   * 10 backup codes for account recovery
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Array of plain text backup codes
   */
  async generateBackupCodes(userId: string, organizationId: string): Promise<string[]> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Check if MFA is enabled
      if (!user.mfaEnabled) {
        throw new BadRequestException('MFA is not enabled for this user');
      }

      // Delete existing backup codes
      await this.prisma.mFABackupCode.deleteMany({
        where: { userId },
      });

      // Generate new backup codes
      const codes = await this.generateBackupCodesInternal(userId);

      this.logger.log(`Backup codes regenerated for user: ${userId}`);

      return codes;
    } catch (error) {
      this.logger.error(`Failed to generate backup codes for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Validate a backup code
   * 
   * Requirement 13.5: WHEN a backup code is used, THE MFA_System SHALL 
   * invalidate that code permanently
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @param code - Backup code to validate
   * @returns True if valid, false otherwise
   */
  async validateBackupCode(userId: string, organizationId: string, code: string): Promise<boolean> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        return false;
      }

      // Check if MFA is enabled
      if (!user.mfaEnabled) {
        return false;
      }

      // Get all unused backup codes
      const backupCodes = await this.prisma.mFABackupCode.findMany({
        where: {
          userId,
          isUsed: false,
        },
      });

      // Check each backup code
      for (const backupCode of backupCodes) {
        const isValid = await this.security.verifyPassword(code, backupCode.codeHash);
        if (isValid) {
          // Mark as used
          await this.prisma.mFABackupCode.update({
            where: { id: backupCode.id },
            data: {
              isUsed: true,
              usedAt: new Date(),
            },
          });

          this.logger.log(`Backup code used for user: ${userId}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to validate backup code for user: ${userId}`, error);
      return false;
    }
  }

  /**
   * Get remaining backup codes count
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns Number of remaining backup codes
   */
  async getRemainingBackupCodes(userId: string, organizationId: string): Promise<number> {
    try {
      // Verify user exists and belongs to organization
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      // Count unused backup codes
      const count = await this.prisma.mFABackupCode.count({
        where: {
          userId,
          isUsed: false,
        },
      });

      return count;
    } catch (error) {
      this.logger.error(`Failed to get remaining backup codes for user: ${userId}`, error);
      throw error;
    }
  }

  /**
   * Check if MFA is enabled for a user
   * 
   * Requirement 13.4: WHEN a user has MFA enabled, THE Auth_System SHALL 
   * require a valid TOTP code or backup code
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns True if MFA is enabled, false otherwise
   */
  async isMFAEnabled(userId: string, organizationId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
        select: {
          mfaEnabled: true,
        },
      });

      return user?.mfaEnabled || false;
    } catch (error) {
      this.logger.error(`Failed to check MFA status for user: ${userId}`, error);
      return false;
    }
  }

  /**
   * Get MFA status for a user
   * 
   * Requirement 13.4: WHEN a user has MFA enabled, THE Auth_System SHALL 
   * require a valid TOTP code or backup code
   * 
   * @param userId - User ID
   * @param organizationId - Organization ID for tenant isolation
   * @returns MFA status
   */
  async getMFAStatus(userId: string, organizationId: string): Promise<MFAStatus> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          organizationId,
        },
        select: {
          mfaEnabled: true,
        },
      });

      if (!user) {
        throw new NotFoundException(`User not found: ${userId}`);
      }

      const backupCodesRemaining = user.mfaEnabled
        ? await this.getRemainingBackupCodes(userId, organizationId)
        : 0;

      return {
        enabled: user.mfaEnabled,
        totpEnabled: user.mfaEnabled,
        backupCodesRemaining,
      };
    } catch (error) {
      this.logger.error(`Failed to get MFA status for user: ${userId}`, error);
      throw error;
    }
  }
}
