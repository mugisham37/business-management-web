/**
 * GraphQL Queries
 * 
 * This module exports all GraphQL query definitions.
 * 
 * Requirements: 2.2
 */

// Authentication queries
export { VALIDATE_SESSION_QUERY, GET_ACTIVE_SESSIONS_QUERY } from './auth';

// User queries
export { GET_USERS_QUERY, GET_USER_BY_ID_QUERY } from './users';

// Permission queries
export { GET_PERMISSIONS_QUERY } from './permissions';

// Organization queries
export { GET_ORGANIZATIONS_QUERY } from './organizations';

// Branch queries
export { GET_BRANCHES_QUERY } from './branches';

// Department queries
export { GET_DEPARTMENTS_QUERY } from './departments';

// Business rule queries
export { GET_BUSINESS_RULES_QUERY } from './business-rules';

// Audit log queries
export { GET_AUDIT_LOGS_QUERY, GET_AUDIT_LOG_BY_ID_QUERY } from './audit-logs';

// Health check query
export { HEALTH_CHECK_QUERY } from './health';
