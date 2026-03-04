import { gql } from '@apollo/client';
import { BUSINESS_RULE_FRAGMENT } from '../fragments';

// Business Rule Mutations

export const CREATE_BUSINESS_RULE = gql`
  ${BUSINESS_RULE_FRAGMENT}
  mutation CreateBusinessRule($input: CreateBusinessRuleInput!) {
    createBusinessRule(input: $input) {
      ...BusinessRuleFragment
    }
  }
`;

export const UPDATE_BUSINESS_RULE = gql`
  ${BUSINESS_RULE_FRAGMENT}
  mutation UpdateBusinessRule($ruleId: String!, $input: UpdateBusinessRuleInput!) {
    updateBusinessRule(ruleId: $ruleId, input: $input) {
      ...BusinessRuleFragment
    }
  }
`;
