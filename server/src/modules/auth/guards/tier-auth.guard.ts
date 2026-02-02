import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { TierAuthorizationService } from '../services/tier-authorization.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Tier Authorization Guard
 * 
 * Validates that the authenticated user's subscription tier has access
 * to the requested feature or resource. Supports feature-based access
 * control based on subscription tiers.
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, TierAuthGuard)
 * @TierAuth('premium', 'enterprise')
 * async getPremiumFeature() { ... }
 * 
 * Features:
 * - Subscription tier validation
 * - Feature-based access control
 * - Tenant-level tier management
 * - Graceful degradation for missing tiers
 */
@Injectable()
export class TierAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tierAuthService: TierAuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get required tiers from decorator
    const requiredTiers = this.reflector.getAllAndOverride<string[]>('tierAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no tiers required, allow access
    if (!requiredTiers || requiredTiers.length === 0) {
      return true;
    }

    // Get user from context
    const user = this.getUserFromContext(context);
    if (!user) {
      throw new ForbiddenException('Authentication required for tier-based access');
    }

    try {
      // Check if user's tenant has access to any of the required tiers
      for (const requiredTier of requiredTiers) {
        const hasAccess = await this.tierAuthService.checkTierAccess(
          user.tenantId,
          requiredTier,
        );

        if (hasAccess) {
          return true;
        }
      }

      // Get user's current tier for error message
      const currentTier = await this.tierAuthService.getTenantTier(user.tenantId);
      
      throw new ForbiddenException(
        `Access denied. Required tier: ${requiredTiers.join(' or ')}. Current tier: ${currentTier}`
      );
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      
      // Log error and deny access
      console.error('TierAuthGuard error:', error);
      throw new ForbiddenException('Unable to verify tier access');
    }
  }

  /**
   * Extract user from execution context (supports both HTTP and GraphQL)
   */
  private getUserFromContext(context: ExecutionContext): AuthenticatedUser | null {
    try {
      // Try GraphQL context first
      const gqlContext = GqlExecutionContext.create(context);
      const gqlUser = gqlContext.getContext()?.req?.user;
      if (gqlUser) {
        return gqlUser;
      }

      // Fallback to HTTP context
      const request = context.switchToHttp().getRequest();
      return request?.user || null;
    } catch (error) {
      return null;
    }
  }
}