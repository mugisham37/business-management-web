import { gql } from '@apollo/client';
import { BUSINESS_RULE_FRAGMENT } from '../fragments';

export const GET_BUSINESS_RULES_QUERY = gql`
  ${BUSINESS_RULE_FRAGMENT}
  query GetBusinessRules($filter: BusinessRuleFilterInput) {
    businessRules(filter: $filter) {
      ...BusinessRuleFragment
    }
  }
`;
