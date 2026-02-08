import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { MFAService } from './mfa.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EnableMfaDto, DisableMfaDto } from './dto';
import { User } from '@prisma/client';

/**
 * MFA Controller
 * 
 * Provides REST API endpoints for multi-factor authentication operations:
 * - MFA setup (generate secret and QR code)
 * - MFA enable (validate and activate)
 * - MFA disable (deactivate with password and code)
 * - MFA status (check current status)
 * - Backup codes regeneration
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.7
 */
@Controller('mfa')
@UseGuards(JwtAuthGuard)
export class MFAController {
  private readonly logger = new Logger(MFAController.name);

  constructor(private readonly mfaService: MFAService) {}

  /**
   * Setup MFA - Generate secret, QR code, and backup codes
   * 
   * POST /mfa/setup
   * 
   * Requirement 13.1: WHEN a user enables MFA, THE MFA_System SHALL generate 
   * a TOTP secret and display a QR code
   * 
   * Requirement 13.3: WHEN MFA is enabled, THE MFA_System SHALL generate 
   * 10 backup codes for account recovery
   * 
   * @param user - Current user from JWT
   * @returns MFA setup data (secret, QR code, backup codes)
   */
  @Post('setup')
  @HttpCode(HttpStatus.OK)
  async setup(@CurrentUser() user: User) {
    this.logger.log(`MFA setup request for user: ${user.id}`);

    const result = await this.mfaService.generateSecret(user.id, user.organizationId);

    return {
      success: true,
      data: result,
    };
  }

  /**
   * Enable MFA - Validate TOTP code and activate MFA
   * 
   * POST /mfa/enable
   * 
   * Requirement 13.2: WHEN a user confirms MFA setup, THE MFA_System SHALL 
   * require validation of a TOTP code before activation
   * 
   * @param user - Current user from JWT
   * @param dto - TOTP code for validation
   * @returns Success message
   */
  @Post('enable')
  @HttpCode(HttpStatus.OK)
  async enable(@CurrentUser() user: User, @Body() dto: EnableMfaDto) {
    this.logger.log(`MFA enable request for user: ${user.id}`);

    await this.mfaService.enableTOTP(user.id, user.organizationId, dto.token);

    return {
      success: true,
      message: 'MFA has been enabled successfully',
    };
  }

  /**
   * Disable MFA - Deactivate MFA with password and TOTP code
   * 
   * POST /mfa/disable
   * 
   * Requirement 13.7: WHEN a user disables MFA, THE MFA_System SHALL require 
   * current password and a valid TOTP code
   * 
   * @param user - Current user from JWT
   * @param dto - Password and TOTP code for validation
   * @returns Success message
   */
  @Post('disable')
  @HttpCode(HttpStatus.OK)
  async disable(@CurrentUser() user: User, @Body() dto: DisableMfaDto) {
    this.logger.log(`MFA disable request for user: ${user.id}`);

    await this.mfaService.disableTOTP(
      user.id,
      user.organizationId,
      dto.password,
      dto.token,
    );

    return {
      success: true,
      message: 'MFA has been disabled successfully',
    };
  }

  /**
   * Get MFA status
   * 
   * GET /mfa/status
   * 
   * Requirement 13.4: WHEN a user has MFA enabled, THE Auth_System SHALL 
   * require a valid TOTP code or backup code
   * 
   * @param user - Current user from JWT
   * @returns MFA status (enabled, totpEnabled, backupCodesRemaining)
   */
  @Get('status')
  @HttpCode(HttpStatus.OK)
  async getStatus(@CurrentUser() user: User) {
    this.logger.log(`MFA status request for user: ${user.id}`);

    const status = await this.mfaService.getMFAStatus(user.id, user.organizationId);

    return {
      success: true,
      data: status,
    };
  }

  /**
   * Regenerate backup codes
   * 
   * POST /mfa/backup-codes/regenerate
   * 
   * Requirement 13.3: WHEN MFA is enabled, THE MFA_System SHALL generate 
   * 10 backup codes for account recovery
   * 
   * @param user - Current user from JWT
   * @returns New backup codes
   */
  @Post('backup-codes/regenerate')
  @HttpCode(HttpStatus.OK)
  async regenerateBackupCodes(@CurrentUser() user: User) {
    this.logger.log(`Backup codes regeneration request for user: ${user.id}`);

    const backupCodes = await this.mfaService.generateBackupCodes(
      user.id,
      user.organizationId,
    );

    return {
      success: true,
      data: {
        backupCodes,
      },
      message: 'New backup codes have been generated. Please store them securely.',
    };
  }
}
