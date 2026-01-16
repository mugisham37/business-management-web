import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { FeatureFlagService } from '../services/feature-flag.service';

/**
 * Guard to enforce feature flag access control in GraphQL resolvers
 * Ensures that users can only access features that are enabled for their tier
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private featureFlagService: FeatureFlagService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if feature validation is disabled for this route
    const skipFeatureCheck = this.reflector.getAllAndOverride<boolean>('skipFeatureCheck', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipFeatureCheck) {
      return true;
    }

    // Get required feature from metadata
    const requiredFeature = this.reflector.getAllAndOverride<string>('requiredFeature', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no feature is required, allow access
    if (!requiredFeature) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const user = request.user;

    // If no user is authenticated, let the auth guard handle it
    if (!user) {
      return true;
    }

    // Check if user has access to the required feature
    const hasAccess = await this.featureFlagService.hasFeature(
      user.tenantId,
      requiredFeature,
      {
        userId: user.id,
        userRoles: [user.role],
      },
    );

    if (!hasAccess) {
      throw new ForbiddenException(`Feature '${requiredFeature}' is not available for your tier`);
    }

    return true;
  }
}
