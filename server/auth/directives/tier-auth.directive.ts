import { getDirectives } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLField, GraphQLObjectType, GraphQLSchema } from 'graphql';
import { ForbiddenException } from '@nestjs/common';
import { mapSchema, MapperKind } from '@graphql-tools/utils';

/**
 * GraphQL Directive for field-level tier authorization
 * Usage: @tierAuth(tier: "medium", features: ["advanced_reporting"])
 * Modern implementation using mapSchema instead of deprecated SchemaDirectiveVisitor
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
                  `Access denied. Required tier: ${requiredTier}, current tier: ${user.businessTier}`
                );
              }

              // Check feature requirements
              if (requiredFeatures && requiredFeatures.length > 0) {
                const missingFeatures = requiredFeatures.filter(
                  (feature: any) => !user.featureFlags.includes(feature)
                );

                if (missingFeatures.length > 0) {
                  throw new ForbiddenException(
                    `Access denied. Missing features: ${missingFeatures.join(', ')}`
                  );
                }
              }

              return originalResolve.call(this, source, args, context, info);
            };
          }

          return fieldConfig;
        },
      });
    };
  }
}

/**
 * Check if current tier meets required tier
 */
function checkTierAccess(currentTier: string, requiredTier: string): boolean {
  const tierOrder = ['micro', 'small', 'medium', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);
  
  if (currentIndex === -1 || requiredIndex === -1) {
    return false;
  }
  
  return currentIndex >= requiredIndex;
}

/**
 * GraphQL Schema Definition for the directive
 */
export const tierAuthDirectiveTypeDefs = `
  directive @tierAuth(
    tier: String
    features: [String!]
  ) on FIELD_DEFINITION
`;