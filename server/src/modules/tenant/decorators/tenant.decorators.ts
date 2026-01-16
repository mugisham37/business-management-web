import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to extract current tenant ID from GraphQL context
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;
    return user?.tenantId;
  },
);

/**
 * Decorator to extract full tenant context from GraphQL context
 */
export const TenantContext = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    return {
      tenantId: request.user?.tenantId,
      businessTier: request.user?.businessTier,
      subscriptionStatus: request.user?.subscriptionStatus,
    };
  },
);

/**
 * Decorator to skip tenant validation for specific resolvers
 */
export const SkipTenantCheck = () => SetMetadata('skipTenantCheck', true);

/**
 * Decorator to require specific feature access
 */
export const RequireFeature = (featureName: string) => SetMetadata('requiredFeature', featureName);

/**
 * Decorator to skip feature validation for specific resolvers
 */
export const SkipFeatureCheck = () => SetMetadata('skipFeatureCheck', true);

/**
 * Decorator to mark resolver as tenant-scoped (enforces tenant isolation)
 */
export const TenantScoped = () => SetMetadata('tenantScoped', true);

/**
 * Decorator to mark resolver as cross-tenant (allows access to multiple tenants)
 */
export const CrossTenant = () => SetMetadata('crossTenant', true);
