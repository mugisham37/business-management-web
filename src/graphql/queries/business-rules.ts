import { gql } from '@apollo/client';
import { BUSINESS_RULE_FRAGMENT } from '../fragments';

// Business Rule Queries

export const GET_BUSINESS_RULES = gql`
  ${BUSINESS_RULE_FRAGMENT}
  query GetBusinessRules($transactionType: String) {
    getBusinessRules(transactionType: $transactionType) {
      rules {
        ...BusinessRuleFragment
      }
      total
    }
  }
`;
