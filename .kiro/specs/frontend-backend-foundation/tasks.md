# Implementation Plan: Frontend-Backend Foundation Layer

## Overview

This implementation plan breaks down the foundation layer into discrete, incremental steps. Each task builds on previous work, with testing integrated throughout to catch issues early. The plan follows a bottom-up approach: core infrastructure → types → API client → authentication → services → hooks → middleware → integration.

## Tasks

- [x] 1. Install dependencies and setup project structure
  - Install axios (^1.6.0), js-cookie (^3.0.0), jwt-decode (^4.0.0)
  - Install dev dependencies: @types/js-cookie, fast-check, msw
  - Create directory structure: lib/api, lib/auth, lib/utils, lib/constants, hooks, types/api
  - Setup .env.local with NEXT_PUBLIC_API_URL placeholder
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Define TypeScript types
  - [x] 2.1 Create API request types for all 34 endpoints
    - Define types in types/api/requests.ts
    - Include auth requests (12), MFA requests (5), user requests (9), role requests (6), session requests (2)
    - _Requirements: 2.1, 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 2.2 Create API response types
    - Define ApiResponse<T>, ApiError, PaginatedResponse<T> in types/api/responses.ts
    - Define specific response types for auth, MFA, users, roles, sessions
    - _Requirements: 2.2, 2.5_
  
  - [x] 2.3 Create domain types
    - Define User, Organization, Role, Permission, Session in respective type files
    - Define JwtPayload in types/auth.ts
    - Include computed properties (e.g., User.fullName)
    - _Requirements: 2.3, 2.4_

- [x] 3. Implement constants
  - [x] 3.1 Create API configuration constants
    - Define API_CONFIG in lib/constants/api.ts (base URL, timeout, retry config)
    - Define API_ENDPOINTS in lib/api/endpoints.ts (all 34 endpoint paths)
    - _Requirements: 19.1_
  
  - [x] 3.2 Create auth and permission constants
    - Define TOKEN_CONFIG and AUTH_ROUTES in lib/constants/auth.ts
    - Define PERMISSIONS in lib/constants/permissions.ts
    - _Requirements: 19.2, 19.3, 19.4_

- [x] 4. Implement utility functions
  - [x] 4.1 Create error handling utilities
    - Implement handleApiError, getErrorMessage, error type checkers in lib/utils/error-handler.ts
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6_
  
  - [x] 4.2 Create validation utilities
    - Implement isValidEmail, isStrongPassword, getPasswordStrength in lib/utils/validators.ts
    - _Requirements: 18.3, 18.4_
  
  - [ ]* 4.3 Write property tests for validators
    - **Property 22: Email Validation**
    - **Property 23: Password Strength Validation**
    - **Validates: Requirements 18.3, 18.4**
  
  - [x] 4.4 Create formatting utilities
    - Implement formatDate, formatDateTime, formatFullName, formatRelativeTime in lib/utils/formatters.ts
    - _Requirements: 18.1, 18.2_
  
  - [ ]* 4.5 Write property tests for formatters
    - **Property 20: Date Formatting Consistency**
    - **Property 21: Name Formatting**
    - **Validates: Requirements 18.1, 18.2**
  
  - [x] 4.6 Create storage utilities
    - Implement safeGetNestedProperty, debounce in lib/utils/storage.ts
    - _Requirements: 18.5, 18.6_
  
  - [ ]* 4.7 Write property tests for storage utilities
    - **Property 24: Safe Property Access**
    - **Validates: Requirements 18.5**

- [ ] 5. Implement Token Manager
  - [ ] 5.1 Create TokenManager class
    - Implement token storage (access in memory, refresh in cookies)
    - Implement getAccessToken, setAccessToken, clearTokens methods
    - Implement decodeToken, isTokenExpired, getUserFromToken methods
    - Implement refreshAccessToken, initializeSession methods
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7_
  
  - [ ]* 5.2 Write unit tests for TokenManager
    - Test token storage locations
    - Test session initialization
    - Test token clearing
    - _Requirements: 4.1, 4.2, 4.3, 4.5_
  
  - [ ]* 5.3 Write property tests for TokenManager
    - **Property 3: JWT Token Operations**
    - **Validates: Requirements 4.6, 4.7**

- [ ] 6. Implement API Client
  - [ ] 6.1 Create Axios instance configuration
    - Create apiClient in lib/api/client.ts with base URL, timeout, headers
    - Validate NEXT_PUBLIC_API_URL environment variable
    - Enable withCredentials for cookies
    - _Requirements: 3.1, 3.2, 15.4_
  
  - [ ] 6.2 Implement request/response interceptors
    - Create setupInterceptors in lib/api/interceptors.ts
    - Implement request interceptor to add Authorization header
    - Implement response interceptor for token refresh on 401
    - Implement request deduplication logic
    - Implement retry logic with exponential backoff
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ]* 6.3 Write unit tests for API client
    - Test base URL configuration
    - Test timeout configuration
    - Test Authorization header injection
    - Test 401 handling and token refresh
    - Test retry logic for network errors
    - Test no retry for POST requests
    - Test no retry for 4xx errors (except 401)
    - _Requirements: 3.1, 3.2, 3.5, 3.6, 3.7, 14.1, 14.2, 14.4, 14.5, 14.6_
  
  - [ ]* 6.4 Write property tests for API client
    - **Property 1: Token Refresh and Retry**
    - **Property 4: Authorization Header Injection**
    - **Property 5: Content-Type Header**
    - **Property 6: Request Deduplication**
    - **Property 16: Idempotent Request Retry**
    - **Property 17: Client Error No Retry**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 14.3, 14.4, 14.6**

- [ ] 7. Checkpoint - Verify core infrastructure
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement API service layer
  - [ ] 8.1 Create auth API service
    - Implement all 12 authentication endpoints in lib/api/services/auth.api.ts
    - Include register, login, loginTeamMember, loginMfa, refresh, logout, password reset, etc.
    - _Requirements: 6.1, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7_
  
  - [ ] 8.2 Create MFA API service
    - Implement all 5 MFA endpoints in lib/api/services/mfa.api.ts
    - Include setup, enable, disable, getStatus, regenerateBackupCodes
    - _Requirements: 6.2, 12.1, 12.2, 12.4, 12.6_
  
  - [ ] 8.3 Create users API service
    - Implement all 9 user endpoints in lib/api/services/users.api.ts
    - Include invite, registerInvitation, getById, update, delete, suspend, reactivate, hierarchy, createdUsers
    - _Requirements: 6.3_
  
  - [ ] 8.4 Create roles API service
    - Implement all 6 role endpoints in lib/api/services/roles.api.ts
    - Include create, getById, update, delete, assignPermissions, assignRole
    - _Requirements: 6.4_
  
  - [ ] 8.5 Create sessions API service
    - Implement all 2 session endpoints in lib/api/services/sessions.api.ts
    - Include getAll, delete
    - _Requirements: 6.5, 11.1, 11.3_
  
  - [ ]* 8.6 Write unit tests for API services
    - Test each service function calls correct endpoint
    - Test request/response type safety
    - Test error handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 8.7 Write property tests for API services
    - **Property 2: API Response Wrapping**
    - **Property 8: Service Function Type Safety**
    - **Property 9: Service Function Error Handling**
    - **Validates: Requirements 2.5, 6.6, 6.7**

- [ ] 9. Implement permission system
  - [ ] 9.1 Create permission checking utilities
    - Implement checkPermission, checkAnyPermission, checkAllPermissions in lib/auth/permissions.ts
    - Implement PermissionGate component
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ]* 9.2 Write unit tests for permission system
    - Test permission checking with various user/permission combinations
    - Test PermissionGate component rendering
    - _Requirements: 10.1, 10.2, 10.3, 10.4_
  
  - [ ]* 9.3 Write property tests for permission system
    - **Property 13: Unauthenticated Permission Checks**
    - **Validates: Requirements 10.5**

- [ ] 10. Implement Authentication Context
  - [ ] 10.1 Create AuthContext provider
    - Implement AuthProvider in lib/auth/auth-context.tsx
    - Provide user state, isAuthenticated, isLoading
    - Implement login, logout, register, refreshUser methods
    - Initialize auth state on mount using TokenManager
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [ ] 10.2 Create useAuthContext hook
    - Export useAuthContext hook with error handling
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_
  
  - [ ]* 10.3 Write unit tests for AuthContext
    - Test initial state
    - Test login updates state
    - Test logout clears state
    - Test session initialization on mount
    - Test component re-renders on state changes
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_
  
  - [ ]* 10.4 Write property tests for AuthContext
    - **Property 7: Authentication State Propagation**
    - **Validates: Requirements 5.5, 7.7**

- [ ] 11. Implement custom hooks
  - [ ] 11.1 Create useAuth hook
    - Simple wrapper around useAuthContext in hooks/useAuth.ts
    - _Requirements: 7.1_
  
  - [ ] 11.2 Create useApi hook
    - Implement useApi hook with loading/error state management in hooks/useApi.ts
    - Handle execute, reset methods
    - _Requirements: 7.3_
  
  - [ ] 11.3 Create usePermissions hook
    - Implement usePermissions hook in hooks/usePermissions.ts
    - Provide hasPermission, hasAnyPermission, hasAllPermissions methods
    - _Requirements: 7.2_
  
  - [ ] 11.4 Create useSession hook
    - Implement useSession hook in hooks/useSession.ts
    - Provide sessions list, loading state, refreshSessions, revokeSession methods
    - _Requirements: 7.4, 11.1, 11.3, 11.4, 11.5_
  
  - [ ] 11.5 Create useOrganization hook
    - Implement useOrganization hook in hooks/useOrganization.ts
    - Provide organization, organizationId, isOwner
    - _Requirements: 7.5, 13.1, 13.2, 13.3_
  
  - [ ]* 11.6 Write unit tests for custom hooks
    - Test useAuth returns correct values
    - Test useApi manages loading/error states
    - Test usePermissions checks permissions correctly
    - Test useSession loads and manages sessions
    - Test useOrganization provides organization context
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [ ]* 11.7 Write property tests for custom hooks
    - **Property 10: Hook Cleanup**
    - **Property 14: Organization Context Access**
    - **Validates: Requirements 7.6, 13.3**

- [ ] 12. Checkpoint - Verify state management layer
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 13. Implement Next.js middleware
  - [ ] 13.1 Create route protection middleware
    - Implement middleware in middleware.ts
    - Define PUBLIC_ROUTES, AUTH_ROUTES, PROTECTED_ROUTES
    - Check refresh token cookie for authentication
    - Redirect unauthenticated users from protected routes to login
    - Redirect authenticated users from auth routes to dashboard
    - Preserve redirect URL in query params
    - _Requirements: 8.1, 8.2, 8.4, 8.5, 8.6_
  
  - [ ]* 13.2 Write unit tests for middleware
    - Test unauthenticated access to /dashboard redirects to /auth/login
    - Test authenticated access to /auth/login redirects to /dashboard
    - Test redirect URL preservation
    - Test token validation
    - _Requirements: 8.1, 8.2, 8.5, 8.6_
  
  - [ ]* 13.3 Write property tests for middleware
    - **Property 11: Protected Route Validation**
    - **Validates: Requirements 8.5**

- [ ] 14. Create root provider wrapper
  - [ ] 14.1 Create AppProviders component
    - Wrap AuthProvider in components/providers/AppProviders.tsx
    - Export for use in app layout
    - _Requirements: 5.1_
  
  - [ ] 14.2 Update app layout to use providers
    - Import and wrap children with AppProviders in app/layout.tsx
    - _Requirements: 5.1_

- [ ] 15. Implement serialization utilities
  - [ ] 15.1 Create date serialization utilities
    - Implement serializeDate, deserializeDate functions
    - Add to API client interceptors for automatic handling
    - _Requirements: 20.1, 20.2_
  
  - [ ] 15.2 Create object serialization utilities
    - Implement null/undefined handling
    - Implement nested object preservation
    - _Requirements: 20.3, 20.4, 20.5_
  
  - [ ]* 15.3 Write property tests for serialization
    - **Property 26: Date Serialization**
    - **Property 27: Date Deserialization**
    - **Property 28: Null Value Handling**
    - **Property 29: Nested Object Preservation**
    - **Validates: Requirements 20.1, 20.2, 20.3, 20.4**

- [ ] 16. Implement environment-specific configuration
  - [ ] 16.1 Add development logging
    - Add request/response logging in development mode
    - Add detailed error logging
    - _Requirements: 15.1, 9.7_
  
  - [ ] 16.2 Add production optimizations
    - Disable verbose logging in production
    - Optimize timeout values
    - _Requirements: 15.2_
  
  - [ ]* 16.3 Write unit tests for environment configuration
    - Test logging in development mode
    - Test logging disabled in production
    - Test timeout differences
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [ ]* 16.4 Write property tests for environment configuration
    - **Property 12: Error Logging**
    - **Property 18: Environment Variable Validation**
    - **Validates: Requirements 9.7, 15.5**

- [ ] 17. Integration testing
  - [ ]* 17.1 Write integration tests for authentication flow
    - Test complete registration flow
    - Test complete login flow
    - Test token refresh flow
    - Test logout flow
    - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5_
  
  - [ ]* 17.2 Write integration tests for MFA flow
    - Test MFA setup flow
    - Test MFA enable flow
    - Test MFA login flow
    - Test MFA disable flow
    - Test backup code regeneration
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_
  
  - [ ]* 17.3 Write integration tests for session management
    - Test fetching sessions
    - Test revoking sessions
    - Test current session revocation triggers logout
    - _Requirements: 11.1, 11.3, 11.4, 11.5_
  
  - [ ]* 17.4 Write integration tests for error handling
    - Test network error handling
    - Test 401 error handling with token refresh
    - Test 403 error handling
    - Test 400 validation error handling
    - Test 404 error handling
    - Test 500 error handling
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [ ]* 17.5 Write property tests for API integration
    - **Property 15: Organization ID in Requests**
    - **Property 19: Unexpected Response Handling**
    - **Property 25: Error Message Formatting**
    - **Validates: Requirements 13.4, 16.5, 18.7**

- [ ] 18. Final checkpoint - Comprehensive testing
  - Run all unit tests and property tests
  - Verify test coverage meets goals (80% line, 75% branch, 85% function)
  - Ensure all 29 properties are tested
  - Ask the user if questions arise or if any issues need addressing

## Notes

- Tasks marked with `*` are optional testing tasks that can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with 100+ iterations each
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: infrastructure → types → client → auth → services → hooks → middleware
- All code uses TypeScript with strict type checking
- Fast-check library is used for property-based testing
- MSW (Mock Service Worker) is used for HTTP mocking in tests
