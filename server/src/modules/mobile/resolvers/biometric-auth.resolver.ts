import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { GraphQLJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { TenantGuard } from '../../tenant/guards/tenant.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { Permission as RequirePermission } from '../../auth/decorators/permission.decorator';
import { BiometricAuthService } from '../services/biometric-auth.service';
import {
  BiometricAuthInput,
  RegisterBiometricInput,
} from '../inputs/mobile.input';
import {
  BiometricAuthResponse,
  BiometricAuthResult,
  BiometricRegistrationInfo,
  BiometricCapabilities,
} from '../types/mobile.types';

@Resolver()
@UseGuards(GraphQLJwtAuthGuard, TenantGuard)
export class BiometricAuthResolver {
  private readonly logger = new Logger(BiometricAuthResolver.name);

  constructor(private readonly biometricAuthService: BiometricAuthService) {}

  @Mutation(() => BiometricAuthResponse)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:biometric:auth')
  async authenticateWithBiometric(
    @Args('input') input: BiometricAuthInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<BiometricAuthResponse> {
    try {
      const result = await this.biometricAuthService.authenticateWithBiometric({
        userId: user.id,
        tenantId,
        deviceId: input.deviceId,
        biometricType: input.biometricType as any,
        challenge: input.challenge,
        signature: input.signature,
        publicKey: input.publicKey,
        timestamp: input.timestamp,
      });

      return {
        success: result.success,
        message: result.success ? 'Authentication successful' : result.error || 'Authentication failed',
        result,
      };
    } catch (error) {
      this.logger.error(`Biometric authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {
        success: false,
        message: 'Authentication failed',
      };
    }
  }

  @Mutation(() => BiometricRegistrationInfo)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:biometric:register')
  async registerBiometric(
    @Args('input') input: RegisterBiometricInput,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<BiometricRegistrationInfo> {
    try {
      const registration = await this.biometricAuthService.registerBiometric(
        user.id,
        tenantId,
        input.deviceId,
        input.biometricType as any,
        input.publicKey,
        input.keyAlgorithm,
        input.enrollmentData,
      );

      const result: any = {
        id: registration.id,
        biometricType: registration.biometricType,
        isActive: registration.isActive,
        createdAt: registration.createdAt,
      };
      
      if (registration.lastUsed !== undefined && registration.lastUsed !== null) {
        result.lastUsed = registration.lastUsed;
      }
      
      return result;
    } catch (error) {
      this.logger.error(`Biometric registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:biometric:register')
  async unregisterBiometric(
    @Args('deviceId') deviceId: string,
    @Args('biometricType', { nullable: true }) biometricType: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      await this.biometricAuthService.unregisterBiometric(
        user.id,
        tenantId,
        deviceId,
        biometricType as any,
      );
      return true;
    } catch (error) {
      this.logger.error(`Biometric unregistration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  @Query(() => BiometricCapabilities)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:biometric:read')
  async getBiometricCapabilities(
    @Args('deviceId') deviceId: string,
    @Args('userAgent', { nullable: true }) userAgent: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<BiometricCapabilities> {
    try {
      return await this.biometricAuthService.getBiometricCapabilities(deviceId, userAgent);
    } catch (error) {
      this.logger.error(`Failed to get biometric capabilities: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  @Query(() => Boolean)
  @UseGuards(PermissionsGuard)
  @RequirePermission('mobile:biometric:read')
  async validateBiometricSession(
    @Args('sessionToken') sessionToken: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    try {
      return await this.biometricAuthService.validateSessionToken(
        sessionToken,
        user.id,
        tenantId,
      );
    } catch (error) {
      this.logger.error(`Session validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}
