import { gql } from '@apollo/client';

export const BUSINESS_RULE_FRAGMENT = gql`
  fragment BusinessRuleFragment on BusinessRule {
    id
    name
    description
    ruleType
    conditions
    actions
    priority
    isActive
    createdAt
    updatedAt
  }
`;
