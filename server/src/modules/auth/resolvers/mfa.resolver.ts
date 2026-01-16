import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MfaService } from '../services/mfa.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';
import {
  EnableMfaInput,
  DisableMfaInput,
  VerifyMfaTokenInput,
  GenerateBackupCodesInput,
} from '../inputs/mfa.input';
import {
  MfaSetupResponse,
  MfaStatusResponse,
} from '../types/mfa.types';

/**
 * MFA resolver for multi-factor authentication operations
 * Handles MFA setup, verification, enable/disable, and backup codes
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class MfaResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly mfaService: MfaService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Generate MFA setup
   * Creates QR code and backup codes for MFA setup
   * Requires authentication
   */
  @Mutation(() => MfaSetupResponse, {
    description: 'Generate MFA setup with QR code and backup codes',
  })
  async generateMfaSetup(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MfaSetupResponse> {
    try {
      const result = await this.mfaService.generateMfaSetup(
        user.id,
        user.tenantId,
        user.email,
      );

      return result;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate MFA setup');
    }
  }

  /**
   * Enable MFA mutation
   * Enables MFA after verifying the setup token
   * Requires authentication
   */
  @Mutation(() => MutationResponse, {
    description: 'Enable MFA after verifying setup token',
  })
  async enableMfa(
    @Args('input') input: EnableMfaInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.mfaService.enableMfa(
        user.id,
        user.tenantId,
        input.token,
      );

      return {
        success: true,
        message: 'MFA enabled successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to enable MFA',
        errors: [
          {
            message: error.message || 'Failed to enable MFA',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Disable MFA mutation
   * Disables MFA after verifying token or backup code
   * Requires authentication
   */
  @Mutation(() => MutationResponse, {
    description: 'Disable MFA using token or backup code',
  })
  async disableMfa(
    @Args('input') input: DisableMfaInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      await this.mfaService.disableMfa(
        user.id,
        user.tenantId,
        input.token,
        input.backupCode,
      );

      return {
        success: true,
        message: 'MFA disabled successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to disable MFA',
        errors: [
          {
            message: error.message || 'Failed to disable MFA',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Verify MFA token mutation
   * Verifies an MFA token (TOTP or backup code)
   * Requires authentication
   */
  @Mutation(() => MutationResponse, {
    description: 'Verify MFA token',
  })
  async verifyMfaToken(
    @Args('input') input: VerifyMfaTokenInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      const result = await this.mfaService.verifyMfaToken(
        user.id,
        user.tenantId,
        input.token,
      );

      if (result.isValid) {
        return {
          success: true,
          message: result.usedBackupCode
            ? 'Backup code verified successfully'
            : 'MFA token verified successfully',
        };
      } else {
        return {
          success: false,
          message: 'Invalid MFA token',
          errors: [
            {
              message: 'Invalid MFA token',
              timestamp: new Date(),
            },
          ],
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to verify MFA token',
        errors: [
          {
            message: error.message || 'Failed to verify MFA token',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Generate new backup codes mutation
   * Generates new backup codes after verifying current MFA token
   * Requires authentication
   */
  @Mutation(() => [String], {
    description: 'Generate new backup codes',
  })
  async generateBackupCodes(
    @Args('input') input: GenerateBackupCodesInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string[]> {
    try {
      const backupCodes = await this.mfaService.generateNewBackupCodes(
        user.id,
        user.tenantId,
        input.token,
      );

      return backupCodes;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate backup codes');
    }
  }

  /**
   * Get MFA status query
   * Returns the current MFA status for the user
   * Requires authentication
   */
  @Query(() => MfaStatusResponse, {
    description: 'Get MFA status for current user',
  })
  async mfaStatus(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MfaStatusResponse> {
    try {
      const status = await this.mfaService.getMfaStatus(
        user.id,
        user.tenantId,
      );

      return status;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get MFA status');
    }
  }

  /**
   * Check if MFA is enabled query
   * Returns whether MFA is enabled for the user
   * Requires authentication
   */
  @Query(() => Boolean, {
    description: 'Check if MFA is enabled for current user',
  })
  async isMfaEnabled(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<boolean> {
    try {
      const isEnabled = await this.mfaService.isMfaEnabled(
        user.id,
        user.tenantId,
      );

      return isEnabled;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to check MFA status');
    }
  }
}
