# Apollo Client v4 Import Fixes

## Changes Required

Apollo Client v4 moved React hooks to separate entry points:
- `useQuery` → `@apollo/client/react/hooks`
- `useMutation` → `@apollo/client/react/hooks`
- `useApolloClient` → `@apollo/client/react/hooks`
- `ApolloError` → `@apollo/client/errors`
- `ApolloCache` and `ApolloClient` are no longer generic in v4

## Files to Fix

1. ✅ useAuditLogs.ts - DONE
2. useBranches.ts
3. useBusinessRules.ts
4. useDepartments.ts
5. useHealthCheck.ts
6. useOrganization.ts
7. usePermissions.ts
8. usePrefetch.ts
9. useSessions.ts
10. useUsers.ts
11. All service files
12. All cache files
13. All store files
