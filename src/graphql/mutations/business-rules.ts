import { gql } from '@apollo/client';
import { BUSINESS_RULE_FRAGMENT } from '../fragments';

export const CREATE_BUSINESS_RULE_MUTATION = gql`
  ${BUSINESS_RULE_FRAGMENT}
  mutation CreateBusinessRule($input: CreateBusinessRuleInput!) {
    createBusinessRule(input: $input) {
      ...BusinessRuleFragment
    }
  }
`;

export const UPDATE_BUSINESS_RULE_MUTATION = gql`
  ${BUSINESS_RULE_FRAGMENT}
  mutation UpdateBusinessRule($id: UUID!, $input: UpdateBusinessRuleInput!) {
    updateBusinessRule(id: $id, input: $input) {
      ...BusinessRuleFragment
    }
  }
`;
