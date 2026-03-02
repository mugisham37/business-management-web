/**
 * GraphQL Mutations
 * 
 * This module exports all GraphQL mutation definitions.
 * 
 * Requirements: 2.2
 */

// Authentication mutations
export {
  LOGIN_MUTATION,
  LOGIN_WITH_PIN_MUTATION,
  LOGOUT_MUTATION,
  REFRESH_TOKEN_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  REQUEST_PASSWORD_RESET_MUTATION,
  RESET_PASSWORD_MUTATION,
} from './auth';

// User mutations
export {
  CREATE_MANAGER_MUTATION,
  CREATE_WORKER_MUTATION,
  UPDATE_USER_MUTATION,
} from './users';

// Permission mutations
export {
  CREATE_PERMISSION_MUTATION,
  UPDATE_PERMISSION_MUTATION,
  DELETE_PERMISSION_MUTATION,
} from './permissions';

// Organization mutations
export { CREATE_ORGANIZATION_MUTATION } from './organizations';

// Branch mutations
export {
  CREATE_BRANCH_MUTATION,
  UPDATE_BRANCH_MUTATION,
  DELETE_BRANCH_MUTATION,
} from './branches';

// Department mutations
export {
  CREATE_DEPARTMENT_MUTATION,
  UPDATE_DEPARTMENT_MUTATION,
  DELETE_DEPARTMENT_MUTATION,
} from './departments';

// Business rule mutations
export {
  CREATE_BUSINESS_RULE_MUTATION,
  UPDATE_BUSINESS_RULE_MUTATION,
} from './business-rules';
