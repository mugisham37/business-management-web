/**
 * GraphQL Operations
 * 
 * This module exports all GraphQL operations (queries, mutations, subscriptions, and fragments).
 * 
 * Total Operations: 35
 * - Authentication: 9 operations (7 mutations, 2 queries)
 * - User Management: 5 operations (3 mutations, 2 queries)
 * - Permission Management: 4 operations (3 mutations, 1 query)
 * - Organization Management: 2 operations (1 mutation, 1 query)
 * - Branch Management: 4 operations (3 mutations, 1 query)
 * - Department Management: 4 operations (3 mutations, 1 query)
 * - Business Rules: 3 operations (2 mutations, 1 query)
 * - Audit Logs: 3 operations (2 queries, 1 subscription)
 * - Health Check: 1 operation (1 query)
 * 
 * Requirements: 2.2
 * 
 * @example
 * ```typescript
 * import { LOGIN_MUTATION, GET_USERS_QUERY, ON_AUDIT_LOG_CREATED } from '@/graphql';
 * import { useMutation, useQuery, useSubscription } from '@apollo/client';
 * 
 * // Use a mutation
 * const [login] = useMutation(LOGIN_MUTATION);
 * 
 * // Use a query
 * const { data } = useQuery(GET_USERS_QUERY);
 * 
 * // Use a subscription
 * const { data: auditLog } = useSubscription(ON_AUDIT_LOG_CREATED);
 * ```
 */

// Export all fragments
export * from './fragments';

// Export all queries
export * from './queries';

// Export all mutations
export * from './mutations';

// Export all subscriptions
export * from './subscriptions';
