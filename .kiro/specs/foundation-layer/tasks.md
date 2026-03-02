# Implementation Plan: Foundation Layer

## Overview

This implementation plan breaks down the foundation layer into discrete, incremental tasks. Each task builds on previous work, with testing integrated throughout. The foundation layer provides communication, authentication, caching, error handling, validation, and monitoring infrastructure for the Next.js web application.

## Tasks

- [x] 1. Project Setup & Configuration
  - Install all required dependencies (Apollo Client, gRPC, validation, utilities)
  - Configure TypeScript paths for clean imports (@/lib/*, @/graphql/*, @/grpc/*)
  - Set up environment configuration file with validation
  - Configure CORS settings (document backend changes needed)
  - Create directory structure per design document
  - _Requirements: 1.1, 1.2_

- [x] 2. Type Generation Setup
  - [x] 2.1 Configure GraphQL Code Generation
    - Create codegen.yml configuration file
    - Set up GraphQL schema introspection from backend
    - Configure TypeScript plugins for types, operations, and React hooks
    - Add type generation scripts to package.json
    - _Requirements: 1.3_
  
  - [x] 2.2 Configure gRPC Type Generation
    - Set up proto file directory structure
    - Configure grpc-tools for TypeScript generation
    - Add gRPC generation scripts to package.json
    - Create watch mode for development
    - _Requirements: 1.3_
  
  - [ ]* 2.3 Verify Generated Types
    - Run type generation for GraphQL
    - Run type generation for gRPC
    - Verify generated types compile without errors
    - _Requirements: 1.3_

- [ ] 3. Core Utilities & Infrastructure
  - [ ] 3.1 Implement Correlation ID System
    - Create correlation ID manager
    - Implement generateCorrelationId() function
    - Create useCorrelationId() React hook
    - _Requirements: 2.1, 8.3_
  
  - [ ] 3.2 Implement Error Types
    - Create base AppError interface
    - Implement AuthenticationError class
    - Implement AuthorizationError class
    - Implement ValidationError class
    - Implement NetworkError class
    - _Requirements: 6.1_
  
  - [ ]* 3.3 Write property tests for correlation ID
    - **Property 36: Correlation ID Uniqueness**
    - **Validates: Requirements 8.3**
  
  - [ ]* 3.4 Write unit tests for error types
    - Test error construction with all properties
    - Test error categorization
    - _Requirements: 6.1_

- [ ] 4. Authentication System - Token Management
  - [ ] 4.1 Implement Token Manager
    - Create TokenManager class with in-memory storage
    - Implement setTokens(), getAccessToken(), getRefreshToken()
    - Implement clearTokens() method
    - Implement decodeToken() using jose library
    - Implement isTokenExpired() method
    - Implement getTimeUntilExpiry() method
    - Implement automatic token refresh scheduling
    - _Requirements: 4.1_
  
  - [ ]* 4.2 Write property tests for token manager
    - **Property 10: Access Token Memory Storage**
    - **Property 11: Token Expiry Detection**
    - **Property 12: JWT Decoding**
    - **Property 13: Token Structure Validation**
    - **Validates: Requirements 4.1**
  
  - [ ]* 4.3 Write unit tests for token manager
    - Test token storage and retrieval
    - Test token expiry edge cases
    - Test automatic refresh scheduling
    - _Requirements: 4.1_

- [ ] 5. Authentication System - Permission Checking
  - [ ] 5.1 Implement Permission Checker
    - Create PermissionChecker class
    - Implement hasPermission(module, action) method
    - Implement hasAnyPermission() method
    - Implement hasAllPermissions() method
    - Implement getHierarchyLevel() method
    - Implement validateFingerprint() method
    - Implement permission caching with 1-minute TTL
    - _Requirements: 4.3_
  
  - [ ]* 5.2 Write property tests for permission checker
    - **Property 14: Permission Check Correctness**
    - **Property 15: Permission Cache Consistency**
    - **Validates: Requirements 4.3**
  
  - [ ]* 5.3 Write unit tests for permission checker
    - Test permission check with various combinations
    - Test cache expiration
    - Test fingerprint validation
    - _Requirements: 4.3_

- [ ] 6. Authentication System - Session Management
  - [ ] 6.1 Implement Session Manager
    - Create SessionManager class
    - Implement Broadcast Channel initialization
    - Implement session event handling (login, logout, token_refresh, permission_change)
    - Implement broadcastEvent() method
    - Implement session timeout with activity tracking
    - Implement resetSessionTimeout() on user activity
    - _Requirements: 4.4_
  
  - [ ]* 6.2 Write property tests for session manager
    - **Property 16: Multi-Tab Auth Synchronization**
    - **Validates: Requirements 4.4**
  
  - [ ]* 6.3 Write unit tests for session manager
    - Test event broadcasting
    - Test session timeout
    - Test activity tracking
    - _Requirements: 4.4_

- [ ] 7. Checkpoint - Authentication System Complete
  - Ensure all authentication tests pass, ask the user if questions arise.

- [ ] 8. Apollo Client Configuration
  - [ ] 8.1 Implement Apollo Client Links
    - Create HttpLink for GraphQL HTTP requests
    - Create WebSocket Link for subscriptions
    - Create SplitLink to route operations
    - Create AuthLink for token injection
    - Create ErrorLink for error handling and token refresh
    - Create RetryLink with exponential backoff
    - Chain links in correct order
    - _Requirements: 2.1_
  
  - [ ] 8.2 Configure InMemoryCache
    - Create cache configuration with type policies
    - Define type policies for User, Permission, Organization, Branch, Department
    - Configure pagination merge functions
    - Configure cache normalization
    - _Requirements: 2.1, 2.3_
  
  - [ ] 8.3 Create Apollo Client Instance
    - Instantiate ApolloClient with link chain and cache
    - Configure default options (fetchPolicy, errorPolicy)
    - Export apolloClient singleton
    - _Requirements: 2.1_
  
  - [ ]* 8.4 Write property tests for Apollo Client
    - **Property 2: Bearer Token Injection**
    - **Property 3: Correlation ID Propagation**
    - **Property 4: Exponential Backoff Retry**
    - **Property 5: Client Error No Retry**
    - **Property 6: Server Error Retry**
    - **Validates: Requirements 2.1, 6.3**
  
  - [ ]* 8.5 Write unit tests for Apollo Client
    - Test link chain configuration
    - Test error handling and token refresh
    - Test retry logic
    - _Requirements: 2.1_

- [ ] 9. Cache Management
  - [ ] 9.1 Implement Cache Update Functions
    - Create updateCacheAfterCreateUser()
    - Create updateCacheAfterUpdateUser()
    - Create updateCacheAfterDeleteUser()
    - Create similar functions for other entities
    - _Requirements: 2.3_
  
  - [ ]* 9.2 Write property tests for cache management
    - **Property 17: Cache Normalization**
    - **Property 18: Mutation Cache Update**
    - **Property 19: Optimistic Update Timing**
    - **Validates: Requirements 2.3**
  
  - [ ]* 9.3 Write unit tests for cache updates
    - Test cache update after create operations
    - Test cache update after update operations
    - Test cache eviction after delete operations
    - _Requirements: 2.3_

- [ ] 10. gRPC Client Implementation
  - [ ] 10.1 Implement gRPC Connection Pool
    - Create GRPCConnectionPool class
    - Implement getConnection() with max 10 connections
    - Implement createConnection() with keepalive settings
    - _Requirements: 3.1_
  
  - [ ] 10.2 Implement Authorization Service Client
    - Create AuthorizationClient class
    - Implement CheckPermission() method
    - Implement ValidateToken() method
    - Implement GetUserPermissions() method
    - Implement gRPC error mapping
    - _Requirements: 3.1, 3.2_
  
  - [ ] 10.3 Implement User Service Client
    - Create UserClient class
    - Implement GetUser() method
    - Implement GetUserByEmail() method
    - Implement ListUsers() method
    - Implement UpdateUser() method
    - _Requirements: 3.1_
  
  - [ ] 10.4 Implement Health Service Client
    - Create HealthClient class
    - Implement Check() method
    - Implement Watch() streaming method
    - _Requirements: 3.1_
  
  - [ ]* 10.5 Write property tests for gRPC clients
    - **Property 7: gRPC Connection Pool Limit**
    - **Property 8: gRPC Error Mapping**
    - **Property 9: gRPC Transient Failure Retry**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 10.6 Write unit tests for gRPC clients
    - Test connection pooling
    - Test request timeout
    - Test error handling
    - _Requirements: 3.1, 3.2_

- [ ] 11. Checkpoint - Communication Layer Complete
  - Ensure all communication tests pass, ask the user if questions arise.

- [ ] 12. WebSocket Connection Management
  - [ ] 12.1 Implement WebSocket Connection Manager
    - Create WebSocketConnectionManager class
    - Implement connect() method with graphql-ws client
    - Implement disconnect() method
    - Implement connection state tracking
    - Implement heartbeat mechanism (30s interval)
    - Implement automatic reconnection with exponential backoff
    - Implement onStateChange() listener registration
    - _Requirements: 5.1_
  
  - [ ]* 12.2 Write property tests for WebSocket manager
    - **Property 20: WebSocket Reconnection Backoff**
    - **Validates: Requirements 5.1**
  
  - [ ]* 12.3 Write unit tests for WebSocket manager
    - Test connection lifecycle
    - Test heartbeat mechanism
    - Test reconnection logic
    - _Requirements: 5.1_

- [ ] 13. GraphQL Subscriptions
  - [ ] 13.1 Implement useSubscription Hook
    - Create useSubscription hook with options interface
    - Implement subscription lifecycle management
    - Implement data, loading, error state management
    - Implement cleanup on unmount
    - _Requirements: 5.2_
  
  - [ ] 13.2 Create Subscription Definitions
    - Define OnAuditLogCreated subscription
    - Define OnPermissionChanged subscription
    - Define OnSessionRevoked subscription
    - _Requirements: 5.2_
  
  - [ ]* 13.3 Write property tests for subscriptions
    - **Property 21: Subscription Replay After Reconnection**
    - **Property 22: Subscription Cache Update**
    - **Validates: Requirements 5.2, 5.3**
  
  - [ ]* 13.4 Write unit tests for subscriptions
    - Test subscription creation and cleanup
    - Test subscription data handling
    - Test subscription error handling
    - _Requirements: 5.2_

- [ ] 14. Error Handling System
  - [ ] 14.1 Implement Error Handler
    - Create ErrorHandler class
    - Implement handleGraphQLError() method
    - Implement handleGRPCError() method
    - Implement error categorization logic
    - Implement extractCorrelationId() helper
    - Implement extractFieldErrors() helper
    - Implement logError() method
    - _Requirements: 6.1_
  
  - [ ] 14.2 Implement Error Boundaries
    - Create ErrorBoundary component with level prop
    - Implement getDerivedStateFromError()
    - Implement componentDidCatch() with error logging
    - Create RootErrorBoundary wrapper
    - Create RouteErrorBoundary wrapper
    - Create ComponentErrorBoundary wrapper
    - _Requirements: 6.2_
  
  - [ ]* 14.3 Write property tests for error handling
    - **Property 23: Error Categorization**
    - **Property 24: Validation Error Field Mapping**
    - **Property 25: Error Message User-Friendliness**
    - **Property 26: Error Logging with Context**
    - **Validates: Requirements 6.1, 8.2**
  
  - [ ]* 14.4 Write unit tests for error handling
    - Test GraphQL error handling
    - Test gRPC error handling
    - Test error boundary rendering
    - _Requirements: 6.1, 6.2_

- [ ] 15. Validation System
  - [ ] 15.1 Implement Input Validation Schemas
    - Create emailSchema with RFC 5322 validation
    - Create passwordSchema with strength requirements
    - Create pinSchema for 6-digit validation
    - Create phoneSchema for international format
    - Create loginSchema, pinLoginSchema
    - Create createUserSchema, createPermissionSchema
    - _Requirements: 7.1_
  
  - [ ] 15.2 Implement DTO Validators
    - Create userDtoSchema with transformations
    - Create permissionDtoSchema
    - Create organizationDtoSchema
    - Create branchDtoSchema, departmentDtoSchema
    - Create validateDto() helper function
    - _Requirements: 7.2_
  
  - [ ] 15.3 Implement Type Guards
    - Create isUser() type guard
    - Create isPermission() type guard
    - Create isOrganization() type guard
    - Create isGraphQLError() type guard
    - Create isGRPCError() type guard
    - _Requirements: 7.3_
  
  - [ ]* 15.4 Write property tests for validation
    - **Property 27: Email Validation Correctness**
    - **Property 28: Password Strength Validation**
    - **Property 29: PIN Validation Exactness**
    - **Property 30: Phone Number Validation**
    - **Property 31: DTO Validation**
    - **Property 32: Timestamp Transformation**
    - **Property 33: Type Guard Correctness**
    - **Validates: Requirements 7.1, 7.2, 7.3**
  
  - [ ]* 15.5 Write unit tests for validation
    - Test edge cases for each validator
    - Test DTO transformation
    - Test type guard edge cases
    - _Requirements: 7.1, 7.2, 7.3_

- [ ] 16. Checkpoint - Core Infrastructure Complete
  - Ensure all infrastructure tests pass, ask the user if questions arise.

- [ ] 17. Monitoring & Observability
  - [ ] 17.1 Implement Performance Monitor
    - Create PerformanceMonitor class
    - Implement trackRequest() method
    - Implement trackCacheHit() method
    - Implement trackWebSocketState() method
    - Implement trackWebVitals() with PerformanceObserver
    - Implement getMetricsSummary() method
    - _Requirements: 8.1_
  
  - [ ] 17.2 Implement Request Tracer
    - Create RequestTracer class
    - Implement startSpan() method
    - Implement endSpan() method
    - Implement getSpansByCorrelationId() method
    - Create traceAsync() helper function
    - _Requirements: 8.3_
  
  - [ ]* 17.3 Write property tests for monitoring
    - **Property 34: Request Duration Tracking**
    - **Property 35: Cache Hit/Miss Tracking**
    - **Validates: Requirements 8.1**
  
  - [ ]* 17.4 Write unit tests for monitoring
    - Test metric recording
    - Test span lifecycle
    - Test metrics summary calculation
    - _Requirements: 8.1, 8.3_

- [ ] 18. GraphQL Operations Implementation
  - [ ] 18.1 Define GraphQL Fragments
    - Create UserFragment
    - Create PermissionFragment
    - Create OrganizationFragment
    - Create BranchFragment, DepartmentFragment
    - Create BusinessRuleFragment, AuditLogFragment
    - _Requirements: 2.2_
  
  - [ ] 18.2 Define Authentication Mutations
    - Create LOGIN_MUTATION
    - Create LOGIN_WITH_PIN_MUTATION
    - Create LOGOUT_MUTATION
    - Create REFRESH_TOKEN_MUTATION
    - Create CHANGE_PASSWORD_MUTATION
    - Create REQUEST_PASSWORD_RESET_MUTATION
    - Create RESET_PASSWORD_MUTATION
    - _Requirements: 2.2_
  
  - [ ] 18.3 Define Authentication Queries
    - Create VALIDATE_SESSION_QUERY
    - Create GET_ACTIVE_SESSIONS_QUERY
    - _Requirements: 2.2_
  
  - [ ] 18.4 Define User Management Operations
    - Create CREATE_MANAGER_MUTATION
    - Create CREATE_WORKER_MUTATION
    - Create GET_USERS_QUERY
    - Create GET_USER_BY_ID_QUERY
    - Create UPDATE_USER_MUTATION
    - _Requirements: 2.2_
  
  - [ ] 18.5 Define Permission Management Operations
    - Create CREATE_PERMISSION_MUTATION
    - Create GET_PERMISSIONS_QUERY
    - Create UPDATE_PERMISSION_MUTATION
    - Create DELETE_PERMISSION_MUTATION
    - _Requirements: 2.2_
  
  - [ ] 18.6 Define Organization Operations
    - Create CREATE_ORGANIZATION_MUTATION
    - Create GET_ORGANIZATIONS_QUERY
    - _Requirements: 2.2_
  
  - [ ] 18.7 Define Branch Operations
    - Create CREATE_BRANCH_MUTATION
    - Create GET_BRANCHES_QUERY
    - Create UPDATE_BRANCH_MUTATION
    - Create DELETE_BRANCH_MUTATION
    - _Requirements: 2.2_
  
  - [ ] 18.8 Define Department Operations
    - Create CREATE_DEPARTMENT_MUTATION
    - Create GET_DEPARTMENTS_QUERY
    - Create UPDATE_DEPARTMENT_MUTATION
    - Create DELETE_DEPARTMENT_MUTATION
    - _Requirements: 2.2_
  
  - [ ] 18.9 Define Business Rule Operations
    - Create CREATE_BUSINESS_RULE_MUTATION
    - Create GET_BUSINESS_RULES_QUERY
    - Create UPDATE_BUSINESS_RULE_MUTATION
    - _Requirements: 2.2_
  
  - [ ] 18.10 Define Audit Log Operations
    - Create GET_AUDIT_LOGS_QUERY
    - Create GET_AUDIT_LOG_BY_ID_QUERY
    - Create ON_AUDIT_LOG_CREATED_SUBSCRIPTION
    - _Requirements: 2.2_
  
  - [ ] 18.11 Define Health Check Query
    - Create HEALTH_CHECK_QUERY
    - _Requirements: 2.2_
  
  - [ ]* 18.12 Verify all 35 GraphQL operations
    - Verify all operations compile
    - Verify generated hooks exist
    - _Requirements: 2.2_

- [ ] 19. Custom Hooks Implementation
  - [ ] 19.1 Implement useAuth Hook
    - Create AuthContext
    - Implement AuthProvider component
    - Implement useAuth hook with all methods
    - Implement login() method
    - Implement loginWithPin() method
    - Implement logout() method
    - Implement refreshToken() method
    - Implement changePassword() method
    - _Requirements: 4.2, 9.1_
  
  - [ ] 19.2 Implement usePermission Hook
    - Create usePermission hook
    - Integrate with PermissionChecker
    - Return allowed boolean for specific permission
    - Return all permission check methods
    - _Requirements: 4.3, 9.1_
  
  - [ ] 19.3 Implement useWebSocket Hook
    - Create useWebSocket hook
    - Integrate with WebSocketConnectionManager
    - Return connection state and control methods
    - _Requirements: 5.1, 9.1_
  
  - [ ]* 19.4 Write unit tests for custom hooks
    - Test useAuth hook functionality
    - Test usePermission hook
    - Test useWebSocket hook
    - _Requirements: 4.2, 4.3, 5.1, 9.1_

- [ ] 20. Provider Components
  - [ ] 20.1 Create ApolloProvider Wrapper
    - Create ApolloProvider component
    - Wrap BaseApolloProvider with apolloClient
    - _Requirements: 2.1_
  
  - [ ] 20.2 Create AppProviders Component
    - Create AppProviders component
    - Nest RootErrorBoundary, ApolloProvider, AuthProvider
    - Export for use in app layout
    - _Requirements: 2.1, 4.2, 6.2_
  
  - [ ]* 20.3 Write integration tests for providers
    - Test provider nesting
    - Test context availability
    - _Requirements: 2.1, 4.2_

- [ ] 21. Checkpoint - All Components Implemented
  - Ensure all component tests pass, ask the user if questions arise.

- [ ] 22. Integration & Wiring
  - [ ] 22.1 Wire Authentication System
    - Connect TokenManager to Apollo Client AuthLink
    - Connect SessionManager to AuthProvider
    - Connect PermissionChecker to usePermission hook
    - Test login flow end-to-end
    - Test logout flow end-to-end
    - Test token refresh flow
    - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 22.2 Wire WebSocket System
    - Connect WebSocketConnectionManager to Apollo Client
    - Connect subscriptions to cache updates
    - Test subscription lifecycle
    - Test reconnection behavior
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 22.3 Wire Error Handling
    - Connect ErrorHandler to Apollo ErrorLink
    - Connect ErrorHandler to gRPC clients
    - Test error propagation
    - Test error boundary fallbacks
    - _Requirements: 6.1, 6.2_
  
  - [ ] 22.4 Wire Monitoring
    - Connect PerformanceMonitor to Apollo Client
    - Connect PerformanceMonitor to gRPC clients
    - Connect RequestTracer to all requests
    - Test metric collection
    - _Requirements: 8.1, 8.3_
  
  - [ ]* 22.5 Write integration tests
    - Test complete authentication flow
    - Test GraphQL query with caching
    - Test gRPC call with error handling
    - Test WebSocket subscription with cache update
    - Test multi-tab synchronization
    - _Requirements: All epics_

- [ ] 23. Documentation & Examples
  - [ ] 23.1 Create Usage Examples
    - Create example of using useAuth hook
    - Create example of using usePermission hook
    - Create example of GraphQL query with cache
    - Create example of gRPC call
    - Create example of subscription
    - _Requirements: 9.1_
  
  - [ ] 23.2 Document Configuration
    - Document environment variables
    - Document port configuration
    - Document type generation setup
    - Document testing setup
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 23.3 Create Developer Guide
    - Document architecture overview
    - Document authentication flow
    - Document error handling patterns
    - Document testing approach
    - _Requirements: All epics_

- [ ] 24. Final Checkpoint - Foundation Layer Complete
  - Run all tests (unit, property, integration)
  - Verify test coverage > 80%
  - Verify all 35 GraphQL operations accessible
  - Verify all 9 gRPC services accessible
  - Verify type generation working
  - Verify authentication flows working
  - Verify WebSocket connections stable
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All 36 correctness properties from the design document must be implemented as property-based tests
- Type generation must be run before implementing GraphQL operations
- Backend port must be changed to 3001 before starting implementation
