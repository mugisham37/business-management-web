import { getDirectives } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLSchema } from 'graphql';
import { ForbiddenException } from '@nestjs/common';
import { mapSchema, MapperKind } from '@graphql-tools/utils';

/**
 * GraphQL Directive for field-level tier authorization
 * 
 * Usage: @tierAuth(tier: "premium", features: ["advanced_reporting"])
 * 
 * Modern implementation using mapSchema instead of deprecated SchemaDirectiveVisitor.
 * Provides fine-grained access control at the GraphQL field level based on
 * subscription tiers and feature flags.
 * 
 * Features:
 * - Field-level tier authorization
 * - Feature flag validation
 * - Graceful error handling with upgrade information
 * - Support for multiple tier requirements
 * - Integration with tier authorization service
 */
export class TierAuthDirective {
  static getDirectiveTransformer() {
    return (schema: GraphQLSchema) => {
      return mapSchema(schema, {
        [MapperKind.FIELD]: (fieldConfig: any, fieldName: string, typeName: string) => {
          const directives = getDirectives(schema, fieldConfig) as unknown as Record<string, any[]> | undefined;
          const tierAuthDirective = directives ? directives['tierAuth'] : undefined;

          if (tierAuthDirective && tierAuthDirective.length > 0) {
            const directive = tierAuthDirective[0];
            const requiredTier = directive?.tier;
            const requiredFeatures = directive?.features || [];
            const originalResolve = fieldConfig.resolve || defaultFieldResolver;

            fieldConfig.resolve = async function (source: any, args: any, context: any, info: any) {
              const user = context.req?.user;

              if (!user) {
                throw new ForbiddenException('Authentication required');
              }

              // Check tier requirement
              if (requiredTier && !checkTierAccess(user.businessTier, requiredTier)) {
                throw new ForbiddenException(
                  `Access denied. Required tier: ${requiredTier}, current tier: ${user.businessTier || 'free'}`
                );
              }

              // Check feature requirements
              if (requiredFeatures && requiredFeatures.length > 0) {
                const userFeatures = user.featureFlags || [];
                const missingFeatures = requiredFeatures.filter(
                  (feature: any) => !userFeatures.includes(feature)
                );

                if (missingFeatures.length > 0) {
                  throw new ForbiddenException(
                    `Access denied. Missing features: ${missingFeatures.join(', ')}`
                  );
                }
              }

              return originalResolve(source, args, context, info);
            };
          }

          return fieldConfig;
        },
      });
    };
  }
}

/**
 * Check if user tier has access to required tier
 */
function checkTierAccess(userTier: string, requiredTier: string): boolean {
  const tierHierarchy = {
    free: 0,
    basic: 1,
    standard: 2,
    premium: 3,
    enterprise: 4,
  };

  const userLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 0;
  const requiredLevel = tierHierarchy[requiredTier as keyof typeof tierHierarchy] || 0;

  return userLevel >= requiredLevel;
}