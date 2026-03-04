import { gql } from '@apollo/client';

export const BUSINESS_RULE_FRAGMENT = gql`
  fragment BusinessRuleFragment on BusinessRuleType {
    id
    organizationId
    ruleName
    transactionType
    basedOn
    thresholdValue
    appliesToLevel
    approverLevel
    priority
    isActive
    createdAt
    updatedAt
  }
`;
