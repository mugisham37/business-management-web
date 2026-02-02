import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SecurityService } from '../services/security.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AuthenticatedUser } from '../interfaces/auth.interface';
import { MutationResponse } from '../../../common/graphql/mutation-response.types';

/**
 * Security Resolver
 * 
 * Provides GraphQL endpoints for security-related operations including
 * risk assessment, device management, and security monitoring.
 * 
 * Features:
 * - Risk score calculation and monitoring
 * - Device trust management
 * - Security event logging
 * - Account security status
 */
@Resolver()
@UseGuards(JwtAuthGuard)
export class SecurityResolver extends BaseResolver {
  constructor(
    protected override readonly dataLoaderService: DataLoaderService,
    private readonly securityService: SecurityService,
    private readonly riskAssessmentService: RiskAssessmentService,
  ) {
    super(dataLoaderService);
  }

  /**
   * Get current user's risk score
   * Returns the calculated risk score based on various factors
   */
  @Query(() => Number, {
    description: 'Get current user risk score',
  })
  async myRiskScore(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<number> {
    try {
      const riskScore = await this.riskAssessmentService.calculateRiskScore(
        user.id,
        user.tenantId,
        {} // Context would be provided by request middleware
      );

      return riskScore;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to calculate risk score');
    }
  }

  /**
   * Get security status for current user
   * Returns comprehensive security information
   */
  @Query(() => String, {
    description: 'Get security status for current user',
  })
  async mySecurityStatus(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      // This would return a comprehensive security status
      // For now, return a simple status
      const hasMfa = await this.securityService.isMfaEnabled(user.id, user.tenantId);
      const riskScore = await this.riskAssessmentService.calculateRiskScore(
        user.id,
        user.tenantId,
        {}
      );

      let status = 'Good';
      if (!hasMfa) status = 'Needs MFA';
      if (riskScore > 75) status = 'High Risk';
      if (riskScore > 90) status = 'Critical Risk';

      return status;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get security status');
    }
  }

  /**
   * Log a security event
   * Allows manual logging of security-related events
   */
  @Mutation(() => MutationResponse, {
    description: 'Log a security event',
  })
  async logSecurityEvent(
    @Args('eventType') eventType: string,
    @Args('description') description: string,
    @Args('metadata', { nullable: true }) metadata?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<MutationResponse> {
    try {
      if (!user) {
        throw new Error('Authentication required');
      }

      const parsedMetadata = metadata ? JSON.parse(metadata) : {};

      await this.securityService.logSecurityEvent(
        user.id,
        user.tenantId,
        eventType,
        {
          description,
          ...parsedMetadata,
        }
      );

      return {
        success: true,
        message: 'Security event logged successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to log security event',
        errors: [
          {
            message: error.message || 'Failed to log security event',
            timestamp: new Date(),
          },
        ],
      };
    }
  }

  /**
   * Get security recommendations for current user
   * Returns personalized security improvement suggestions
   */
  @Query(() => [String], {
    description: 'Get security recommendations for current user',
  })
  async mySecurityRecommendations(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string[]> {
    try {
      const recommendations: string[] = [];

      // Check MFA status
      const hasMfa = await this.securityService.isMfaEnabled(user.id, user.tenantId);
      if (!hasMfa) {
        recommendations.push('Enable multi-factor authentication for enhanced security');
      }

      // Check risk score
      const riskScore = await this.riskAssessmentService.calculateRiskScore(
        user.id,
        user.tenantId,
        {}
      );

      if (riskScore > 50) {
        recommendations.push('Your account shows elevated risk - consider reviewing recent activity');
      }

      if (riskScore > 75) {
        recommendations.push('High risk detected - please verify your recent login locations');
      }

      // Add general recommendations
      if (recommendations.length === 0) {
        recommendations.push('Your account security looks good! Keep up the good practices.');
      }

      return recommendations;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get security recommendations');
    }
  }

  /**
   * Check if device is trusted
   * Returns trust status for the current device
   */
  @Query(() => Boolean, {
    description: 'Check if current device is trusted',
  })
  async isDeviceTrusted(
    @Args('deviceFingerprint', { nullable: true }) deviceFingerprint?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<boolean> {
    try {
      if (!user || !deviceFingerprint) {
        return false;
      }

      return await this.securityService.isDeviceTrusted(
        user.id,
        user.tenantId,
        deviceFingerprint
      );
    } catch (error: any) {
      return false;
    }
  }

  /**
   * Get tenant security metrics (admin only)
   * Returns security statistics for the tenant
   */
  @Query(() => String, {
    description: 'Get tenant security metrics',
  })
  @UseGuards(PermissionsGuard)
  @Permissions('security:admin')
  async tenantSecurityMetrics(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<string> {
    try {
      // This would return comprehensive security metrics
      // For now, return a simple JSON string
      const metrics = {
        totalUsers: 0, // Would be calculated
        mfaEnabledUsers: 0, // Would be calculated
        averageRiskScore: 0, // Would be calculated
        securityEvents: 0, // Would be calculated
        timestamp: new Date(),
      };

      return JSON.stringify(metrics);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get security metrics');
    }
  }
}