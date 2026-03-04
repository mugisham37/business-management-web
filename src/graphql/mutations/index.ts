/**
 * GraphQL Mutations
 * 
 * This module exports all GraphQL mutation definitions organized by domain.
 * 
 * Requirements: 2.2, 2.7
 */

// Authentication mutations
export {
  REGISTER_OWNER,
  LOGIN,
  LOGIN_WITH_PIN,
  REFRESH_TOKEN,
  LOGOUT,
  CHANGE_PASSWORD,
} from './auth';

// User mutations
export {
  CREATE_MANAGER,
  CREATE_WORKER,
  UPDATE_USER,
} from './users';

// Permission mutations
export {
  GRANT_PERMISSIONS,
  REVOKE_PERMISSIONS,
} from './permissions';

// Organization mutations
export { UPDATE_ORGANIZATION } from './organizations';

// Branch mutations
export {
  CREATE_BRANCH,
  UPDATE_BRANCH,
  ASSIGN_BRANCH_MANAGER,
} from './branches';

// Department mutations
export {
  CREATE_DEPARTMENT,
  UPDATE_DEPARTMENT,
  ASSIGN_DEPARTMENT_MANAGER,
} from './departments';

// Business rule mutations
export {
  CREATE_BUSINESS_RULE,
  UPDATE_BUSINESS_RULE,
} from './business-rules';

// Session mutations
export {
  REVOKE_SESSION,
  REVOKE_ALL_SESSIONS,
} from './sessions';
