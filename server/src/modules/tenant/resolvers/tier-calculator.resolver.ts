import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GraphqlJwtAuthGuard } from '../../auth/guards/graphql-jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUser } from '../../auth/types/auth.types';
import { TierCalculatorService } from '../services/tier-calculator.service';
import {
  TierEvaluationResultType,
  TierChangeAuditLogType,
  UpgradeRecommendationType,
  AutomaticTierUpgradeResultType,
  TierEvaluationSummaryType,
  TierEvaluationInput,
  ManualTierChangeInput,
  AutomaticTierUpgradeInput,
  UpgradeRecommendationsInput,
  TierChangeHistoryInput,
  UpgradeUrgency,
} from '../types/tier-calculator.types';

/**
 * GraphQL resolver for tier calculator operations
 */
@Resolver()
@UseGuards(GraphqlJwtAuthGuard)
export class TierCalculatorResolver {
  constructor(
    private readonly tierCalculatorService: TierCalculatorService,
  ) {}

  /**
   * Evaluate tier appropriateness for a tenant
   */
  @Query(() => TierEvaluationResultType, {
    description: 'Evaluate tier appropriateness based on real-time metrics',
  })
  async evaluateTierAppropriateness(
    @Args('input') input: TierEvaluationInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TierEvaluationResultType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    return await this.tierCalculatorService.evaluateTierAppropriatenessRealTime(input.tenantId);
  }

  /**
   * Process automatic tier upgrade for a tenant
   */
  @Mutation(() => AutomaticTierUpgradeResultType, {
    description: 'Process automatic tier upgrade if thresholds are exceeded',
  })
  async processAutomaticTierUpgrade(
    @Args('input') input: AutomaticTierUpgradeInput,
    @CurrentUser() user: AuthUser,
  ): Promise<AutomaticTierUpgradeResultType> {
    // Verify user has access to the tenant
    if (user.tenantId !== input.tenantId) {
      throw new BadRequestException('Access denied to tenant');
    }

    return await this.tierCalculatorService.processAutomaticTierUpgrade(input.tenantId, user.id);
  }

  /**
   * Manually change tenant tier (admin only)
   */
  @Mutation(() => TierChangeAuditLogType, {
    description: 'Manually change tenant tier with audit logging',
  })
  async changeTierManually(
    @Args('input') input: ManualTierChangeInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TierChangeAuditLogType> {
    // Check if user has admin permissions or is changing their own tenant
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('MANAGE_TIERS');
    const isOwnTenant = user.tenantId === input.tenantId;

    if (!hasAdminPermissions && !isOwnTenant) {
      throw new ForbiddenException('Insufficient permissions to change tier');
    }

    return await this.tierCalculatorService.changeTier(
      input.tenantId,
      input.newTier,
      'manual',
      input.reason,
      user.id,
    );
  }

  /**
   * Get upgrade recommendations (admin only)
   */
  @Query(() => [UpgradeRecommendationType], {
    description: 'Get upgrade recommendations for tenants that exceed thresholds',
  })
  async getUpgradeRecommendations(
    @Args('input') input: UpgradeRecommendationsInput,
    @CurrentUser() user: AuthUser,
  ): Promise<UpgradeRecommendationType[]> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('VIEW_ANALYTICS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to view upgrade recommendations');
    }

    const recommendations = await this.tierCalculatorService.getUpgradeRecommendations(input.limit);

    // Filter by urgency if specified
    if (input.urgencyFilter) {
      return recommendations.filter(rec => rec.urgency === input.urgencyFilter);
    }

    return recommendations;
  }

  /**
   * Get tier change history for a tenant
   */
  @Query(() => [TierChangeAuditLogType], {
    description: 'Get tier change audit history for a tenant',
  })
  async getTierChangeHistory(
    @Args('input') input: TierChangeHistoryInput,
    @CurrentUser() user: AuthUser,
  ): Promise<TierChangeAuditLogType[]> {
    // Check if user has access to the tenant or admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('VIEW_AUDIT_LOGS');
    const isOwnTenant = user.tenantId === input.tenantId;

    if (!hasAdminPermissions && !isOwnTenant) {
      throw new ForbiddenException('Insufficient permissions to view tier change history');
    }

    return await this.tierCalculatorService.getTierChangeHistory(input.tenantId, input.limit);
  }

  /**
   * Get current tier evaluation summary (admin only)
   */
  @Query(() => TierEvaluationSummaryType, {
    description: 'Get summary of recent tier evaluations',
  })
  async getTierEvaluationSummary(
    @CurrentUser() user: AuthUser,
  ): Promise<TierEvaluationSummaryType> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('VIEW_ANALYTICS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to view evaluation summary');
    }

    // Get recent recommendations to build summary
    const recommendations = await this.tierCalculatorService.getUpgradeRecommendations(1000);

    const summary: TierEvaluationSummaryType = {
      totalEvaluated: recommendations.length,
      highUrgency: recommendations.filter(r => r.urgency === UpgradeUrgency.HIGH).length,
      mediumUrgency: recommendations.filter(r => r.urgency === UpgradeUrgency.MEDIUM).length,
      lowUrgency: recommendations.filter(r => r.urgency === UpgradeUrgency.LOW).length,
      timestamp: new Date(),
    };

    return summary;
  }

  /**
   * Trigger manual tier evaluation for all tenants (admin only)
   */
  @Mutation(() => TierEvaluationSummaryType, {
    description: 'Manually trigger tier evaluation for all tenants',
  })
  async triggerTierEvaluation(
    @CurrentUser() user: AuthUser,
  ): Promise<TierEvaluationSummaryType> {
    // Check if user has admin permissions
    const hasAdminPermissions = user.permissions.includes('ADMIN') || user.permissions.includes('MANAGE_TIERS');

    if (!hasAdminPermissions) {
      throw new ForbiddenException('Insufficient permissions to trigger tier evaluation');
    }

    // Trigger the scheduled evaluation manually
    await this.tierCalculatorService.scheduledTierEvaluation();

    // Return summary
    return await this.getTierEvaluationSummary(user);
  }
}