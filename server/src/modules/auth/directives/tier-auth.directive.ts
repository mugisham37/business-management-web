import { SchemaDirectiveVisitor } from '@graphql-tools/utils';
import { defaultFieldResolver, GraphQLField } from 'graphql';
import { ForbiddenException } from '@nestjs/common';

/**
 * GraphQL Directive for field-level tier authorization
 * Usage: @tierAuth(tier: "medium", features: ["advanced_reporting"])
 */
export class TierAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const { resolve = defaultFieldResolver } = field;
    const requiredTier = this.args.tier;
    const requiredFeatures = this.args.features || [];

    field.resolve = async function (source, args, context, info) {
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
      if (requiredFeatures.length > 0) {
        const missingFeatures = requiredFeatures.filter(
          feature => !user.featureFlags.includes(feature)
        );

        if (missingFeatures.length > 0) {
          throw new ForbiddenException(
            `Access denied. Missing features: ${missingFeatures.join(', ')}`
          );
        }
      }

      return resolve.call(this, source, args, context, info);
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