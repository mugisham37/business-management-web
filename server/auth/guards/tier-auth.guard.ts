import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { FeatureFlagService } from '../../tenant/services/feature-flag.service';

/**
 * Tier-Based Authorization Guard
 * Validates that user's business tier has access to specific features
 * Used with @RequireTier() and @RequireFeature() decorators
 * Integrates with existing RBAC system for comprehensive authorization
 * GraphQL-only implementation
 */
@Injectable()
export class TierAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagService: FeatureFlagService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get tier and feature requirements from decorators
    const requiredTier = this.reflector.getAllAndOverride<string>('requiredTier', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredFeatures = this.reflector.getAllAndOverride<string[]>('requiredFeatures', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no tier or feature requirements, allow access
    if (!requiredTier && (!requiredFeatures || requiredFeatures.length === 0)) {
      return true;
    }

    // GraphQL-only: Extract user from GraphQL context
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check tier requirement
    if (requiredTier && !this.checkTierAccess(user.businessTier, requiredTier)) {
      throw new ForbiddenException(
        `Access denied. Required tier: ${requiredTier}, current tier: ${user.businessTier}. Please upgrade your subscription.`
      );
    }

    // Check feature requirements
    if (requiredFeatures && requiredFeatures.length > 0) {
      for (const feature of requiredFeatures) {
        const hasFeature = await this.featureFlagService.hasFeature(
          user.tenantId,
          feature,
          {
            businessTier: user.businessTier,
            businessMetrics: {
              employeeCount: 0,
              locationCount: 0,
              monthlyTransactionVolume: 0,
              monthlyRevenue: 0,
            },
            userId: user.id,
            userRoles: [user.role],
          }
        );

        if (!hasFeature) {
          throw new ForbiddenException(
            `Access denied. Required feature: ${feature}. This feature is not available in your current plan.`
          );
        }
      }
    }

    return true;
  }

  /**
   * Check if current tier meets required tier
   * Uses progressive tier system where higher tiers include lower tier access
   */
  private checkTierAccess(currentTier: string, requiredTier: string): boolean {
    const tierOrder = ['micro', 'small', 'medium', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    const requiredIndex = tierOrder.indexOf(requiredTier);
    
    // If tier not found, deny access
    if (currentIndex === -1 || requiredIndex === -1) {
      return false;
    }
    
    // Current tier must be equal or higher than required tier
    return currentIndex >= requiredIndex;
  }
}