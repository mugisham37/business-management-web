/**
 * GraphQL Queries
 * 
 * This module exports all GraphQL query definitions organized by domain.
 * 
 * Requirements: 2.2, 2.7
 */

// Session queries
export { GET_ACTIVE_SESSIONS } from './auth';

// User queries
export { GET_USERS, GET_USER } from './users';

// Permission queries
export { GET_USER_PERMISSIONS, GET_PERMISSION_HISTORY } from './permissions';

// Organization queries
export { GET_ORGANIZATION } from './organizations';

// Branch queries
export { GET_BRANCHES } from './branches';

// Department queries
export { GET_DEPARTMENTS } from './departments';

// Business rule queries
export { GET_BUSINESS_RULES } from './business-rules';

// Audit log queries
export {
  GET_USER_AUDIT_LOGS,
  GET_ORGANIZATION_AUDIT_LOGS,
  GET_RESOURCE_AUDIT_LOGS,
} from './audit-logs';

// Health check query
export { HEALTH, HEALTH as HEALTH_CHECK_QUERY } from './health';
