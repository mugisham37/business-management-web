# Foundation Layer Requirements

## Feature Overview

**Feature Name**: Enterprise Foundation Layer for Next.js Web Application

**Description**: Implement a comprehensive, production-ready foundation layer that enables high-performance, type-safe, real-time communication between the Next.js web application and the enterprise-grade NestJS backend using GraphQL, gRPC, and WebSocket protocols.

**Business Value**: 
- Establishes robust infrastructure for all client-server communication
- Enables real-time features with WebSocket subscriptions
- Provides type-safe API interactions with auto-generated types
- Implements enterprise-grade security with JWT token management
- Supports high-performance operations via dual-protocol architecture (GraphQL + gRPC)
- Creates reusable patterns and utilities for rapid feature development

---

## User Stories & Acceptance Criteria

### Epic 1: Project Setup & Configuration

#### 1.1 Environment Configuration & Port Resolution
**As a** developer  
**I want** proper port configuration and environment setup  
**So that** the web application and backend can run without conflicts

**Acceptance Criteria**:
- Backend runs on port 3001 (GraphQL/HTTP)
- Web application runs on port 3000
- gRPC service runs on port 5000
- Environment variables are properly configured in both projects
- CORS is configured to allow web app (port 3000) to access backend (port 3001)
- All environment variables are validated at startup
- Development and production configurations are separated

#### 1.2 Dependency Installation & TypeScript Configuration
**As a** developer  
**I want** all required dependencies installed and TypeScript properly configured  
**So that** I can build type-safe applications with proper tooling

**Acceptance Criteria**:
- Apollo Client and GraphQL dependencies installed (@apollo/client, graphql, graphql-ws)
- gRPC dependencies installed (@grpc/grpc-js, @grpc/proto-loader, google-protobuf)
- Authentication libraries installed (jose for JWT, js-cookie)
- Validation libraries installed (zod)
- Utility libraries installed (date-fns, uuid, lodash-es)
- Code generation tools installed (@graphql-codegen/*, grpc-tools)
- TypeScript paths configured for clean imports (@/lib/*, @/graphql/*, @/grpc/*)
- Strict TypeScript configuration enabled
- All type definitions installed

#### 1.3 Code Generation Setup
**As a** developer  
**I want** automated type generation from GraphQL schema and Protocol Buffers  
**So that** I have 100% type safety between client and server

**Acceptance Criteria**:
- GraphQL Codegen configured with codegen.yml
- TypeScript types generated from GraphQL schema
- React hooks generated for all GraphQL operations
- gRPC TypeScript types generated from .proto files
- Type generation scripts added to package.json
- Watch mode available for development
- Generated types include JSDoc comments from schema descriptions

---

### Epic 2: GraphQL Communication Layer

#### 2.1 Apollo Client Configuration
**As a** developer  
**I want** a fully configured Apollo Client with authentication and error handling  
**So that** I can make type-safe GraphQL requests with automatic token management

**Acceptance Criteria**:
- Apollo Client configured with InMemoryCache
- HTTP Link configured pointing to port 3001
- WebSocket Link configured for subscriptions
- Split Link routes operations to appropriate transport
- Authentication Link injects Bearer token in all requests
- Correlation ID injected in all requests (X-Correlation-Id header)
- Error Link detects UNAUTHENTICATED errors and triggers token refresh
- Retry Link implements exponential backoff (300ms, 600ms, 1200ms)
- Maximum 3 retry attempts with jitter
- Cache configured with type policies for all entities
- Request deduplication enabled

#### 2.2 GraphQL Operations Implementation
**As a** developer  
**I want** all 35 GraphQL endpoints implemented as typed hooks  
**So that** I can easily interact with the backend API

**Acceptance Criteria**:
- All 9 authentication endpoints implemented (login, logout, refreshToken, etc.)
- All 5 user management endpoints implemented (createManager, createWorker, getUsers, etc.)
- All 4 permission management endpoints implemented
- All 2 organization management endpoints implemented
- All 4 branch management endpoints implemented
- All 4 department management endpoints implemented
- All 3 business rule endpoints implemented
- All 3 audit logging endpoints implemented
- Health check endpoint implemented
- GraphQL fragments defined for reusable fields (UserFragment, PermissionFragment, etc.)
- All operations have proper TypeScript types
- Loading and error states handled in all hooks
- Optimistic updates implemented for mutations where appropriate

#### 2.3 Cache Management
**As a** developer  
**I want** intelligent caching strategies  
**So that** the application performs well and data stays consistent

**Acceptance Criteria**:
- Normalized cache with entity IDs (User:123, Organization:456)
- Type policies defined for all entities
- Cache updates automatically after mutations
- Cache invalidation strategies implemented
- Optimistic responses for instant UI feedback
- Cache garbage collection configured
- Pagination support for list queries

---

### Epic 3: gRPC Communication Layer

#### 3.1 gRPC Client Implementation
**As a** developer  
**I want** gRPC clients for high-performance operations  
**So that** I can use the most efficient protocol for performance-critical operations

**Acceptance Criteria**:
- Authorization Service client implemented (CheckPermission, ValidateToken, GetUserPermissions)
- User Service client implemented (GetUser, GetUserByEmail, ListUsers, UpdateUser)
- Health Service client implemented (Check, Watch streaming)
- Connection pooling implemented (max 10 connections)
- Connection reuse enabled
- Automatic reconnection on failures
- Connection timeout set to 5 seconds
- Request timeout set to 10 seconds
- Binary serialization/deserialization handled automatically
- gRPC status codes mapped to application errors

#### 3.2 gRPC Error Handling
**As a** developer  
**I want** proper error handling for gRPC calls  
**So that** users receive meaningful error messages

**Acceptance Criteria**:
- All gRPC status codes mapped to user-friendly messages
- Retry logic for transient failures
- Errors logged with context
- Circuit breaker pattern for repeated failures
- Graceful degradation when gRPC unavailable

---

### Epic 4: Authentication & Authorization

#### 4.1 Token Management System
**As a** user  
**I want** secure token management  
**So that** my session is secure and seamless

**Acceptance Criteria**:
- Access tokens stored in memory only (never localStorage)
- Refresh tokens stored in HttpOnly cookies or memory
- Tokens automatically attached to all requests
- Token expiry detection implemented
- Automatic token refresh 5 minutes before expiry
- Token refresh on 401 errors
- JWT decoded to extract user context
- Token validation (structure and signature)
- Token rotation on refresh

#### 4.2 Authentication Context & Hooks
**As a** developer  
**I want** easy-to-use authentication hooks  
**So that** I can manage user authentication state

**Acceptance Criteria**:
- AuthProvider context created
- useAuth() hook provides user state and methods
- login(email, password, organizationId) method implemented
- loginWithPin(email, pin, organizationId) method implemented
- logout() method implemented
- refreshToken() method implemented
- changePassword() method implemented
- isAuthenticated boolean exposed
- User object exposed with all properties
- Loading and error states managed

#### 4.3 Permission System
**As a** developer  
**I want** permission checking utilities  
**So that** I can conditionally render UI based on user permissions

**Acceptance Criteria**:
- Permissions decoded from JWT token
- hasPermission(module, action) method implemented
- hasAnyPermission(permissions[]) method implemented
- hasAllPermissions(permissions[]) method implemented
- Permission checks cached for performance
- Permission fingerprint validation implemented
- Fingerprint mismatch triggers re-authentication
- usePermission(module, action) hook created
- useHierarchyLevel() hook created
- Permission-based rendering utilities created

#### 4.4 Session Management
**As a** user  
**I want** my sessions managed across multiple tabs  
**So that** logout in one tab logs me out everywhere

**Acceptance Criteria**:
- Session ID tracked
- Session timeout detection implemented
- Multi-tab synchronization using Broadcast Channel API
- Login events broadcast to all tabs
- Logout events broadcast to all tabs
- Token refresh events broadcast to all tabs
- Session enumeration available (view all active sessions)
- Remote session revocation supported

---

### Epic 5: WebSocket & Real-Time Communication

#### 5.1 WebSocket Connection Management
**As a** user  
**I want** real-time updates  
**So that** I see changes immediately without refreshing

**Acceptance Criteria**:
- WSS connection established to GraphQL endpoint
- Connection lifecycle managed (connect, disconnect, reconnect)
- Authentication token injected in connection_init
- connection_ack handled from server
- Heartbeat/ping mechanism implemented (every 30 seconds)
- Connection drops detected
- Automatic reconnection with exponential backoff
- Connection state tracked (connecting, connected, disconnected, reconnecting)
- Connection status exposed to application

#### 5.2 GraphQL Subscriptions
**As a** developer  
**I want** GraphQL subscription support  
**So that** I can receive real-time updates from the server

**Acceptance Criteria**:
- Subscription manager tracks active subscriptions
- subscribe(query, variables, callback) method implemented
- unsubscribe(subscriptionId) method implemented
- Subscriptions queued during reconnection
- Subscriptions replayed after reconnection
- Subscription errors handled gracefully
- Subscription cleanup on component unmount
- useSubscription(query, variables) hook created
- usePermissionChanges(userId) hook created
- useSessionEvents() hook created
- useAuditLogStream(filters) hook created

#### 5.3 Real-Time Event Handling
**As a** user  
**I want** the UI to update automatically when data changes  
**So that** I always see current information

**Acceptance Criteria**:
- Permission change events update local cache
- Session revocation events force logout
- User update events refresh user context
- Audit log events update audit log list
- Organization update events refresh organization data
- Apollo cache updated on subscription events
- UI re-renders automatically on data changes

---

### Epic 6: Error Handling & Resilience

#### 6.1 Centralized Error Handling
**As a** user  
**I want** clear error messages  
**So that** I understand what went wrong and how to fix it

**Acceptance Criteria**:
- Centralized error handler intercepts all errors
- GraphQL errors categorized and handled
- gRPC errors categorized and handled
- Network errors categorized and handled
- Authentication errors trigger token refresh or redirect
- Authorization errors show permission denied message
- Validation errors mapped to form fields
- Error codes mapped to user-friendly messages
- Errors logged with correlation ID, user context, and timestamp

#### 6.2 Error Boundaries
**As a** user  
**I want** the app to recover gracefully from errors  
**So that** one error doesn't crash the entire application

**Acceptance Criteria**:
- RootErrorBoundary catches app-level errors
- RouteErrorBoundary catches route-level errors
- ComponentErrorBoundary catches component-level errors
- Fallback UI provided for each boundary level
- Error recovery actions available (retry, go back, go home)
- Errors logged to monitoring service
- Stack traces captured in development

#### 6.3 Retry Logic & Circuit Breaker
**As a** developer  
**I want** automatic retry for transient failures  
**So that** temporary network issues don't disrupt user experience

**Acceptance Criteria**:
- Exponential backoff implemented for retries
- Maximum 3 retry attempts for most operations
- Immediate retry for transient network errors
- No retry for client errors (4xx)
- Retry for server errors (5xx)
- Circuit breaker pattern for repeated failures
- Jitter added to prevent thundering herd

---

### Epic 7: Validation & Type Safety

#### 7.1 Input Validation
**As a** user  
**I want** immediate feedback on invalid input  
**So that** I can correct errors before submitting

**Acceptance Criteria**:
- Zod schemas created for all input types
- Email validation with RFC 5322 compliance
- Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
- PIN validation (exactly 6 digits)
- Phone number validation with international format
- Date validation with format checking
- Enum validation against allowed values
- Field-level validation errors displayed
- Validation errors cleared when field corrected
- Form submission prevented if validation fails

#### 7.2 DTO Validators
**As a** developer  
**I want** runtime validation of server responses  
**So that** malformed data doesn't corrupt application state

**Acceptance Criteria**:
- DTO validators for all response types
- Server timestamps converted to Date objects
- Enum values normalized
- Business logic constraints applied
- Validation errors caught before reaching application state

#### 7.3 Type Guards & Transformers
**As a** developer  
**I want** type guards and transformers  
**So that** I can safely work with data at runtime

**Acceptance Criteria**:
- isUser(obj): obj is User type guard
- isPermission(obj): obj is Permission type guard
- isOrganization(obj): obj is Organization type guard
- isGraphQLError(error): error is GraphQLError type guard
- isGRPCError(error): error is GRPCError type guard
- transformUserResponse(data) transformer
- transformPermissionResponse(data) transformer
- transformDateString(str) transformer
- transformEnumValue(value) transformer

---

### Epic 8: Monitoring & Observability

#### 8.1 Performance Monitoring
**As a** developer  
**I want** performance metrics  
**So that** I can identify and fix performance bottlenecks

**Acceptance Criteria**:
- Page load times tracked
- API request durations tracked
- Component render times tracked
- Cache hit/miss rates tracked
- WebSocket connection stability tracked
- Time to first byte (TTFB) measured
- First contentful paint (FCP) measured
- Largest contentful paint (LCP) measured
- Cumulative layout shift (CLS) measured
- First input delay (FID) measured

#### 8.2 Error Tracking
**As a** developer  
**I want** comprehensive error tracking  
**So that** I can proactively fix issues

**Acceptance Criteria**:
- All unhandled errors captured
- GraphQL errors captured with context
- gRPC errors captured with context
- Network errors captured with context
- Error stack traces included
- User context included (user ID, organization ID)
- Request context included (endpoint, method, variables)
- Correlation ID included in all error logs
- Error grouping and deduplication implemented
- Critical errors sent to monitoring service

#### 8.3 Request Tracing
**As a** developer  
**I want** distributed tracing  
**So that** I can trace requests end-to-end

**Acceptance Criteria**:
- Unique correlation ID generated for each request
- Correlation ID propagated through all layers
- Correlation ID logged with all operations
- Correlation ID included in error reports
- Request flow visualization enabled in dev tools

---

### Epic 9: Developer Experience

#### 9.1 Custom Hooks
**As a** developer  
**I want** easy-to-use hooks for common operations  
**So that** I can build features quickly

**Acceptance Criteria**:
- useAuth() hook for authentication
- usePermission(module, action) hook for permission checks
- useQuery() enhanced hook for GraphQL queries
- useMutation() enhanced hook for GraphQL mutations
- useSubscription() hook for real-time updates
- useWebSocket() hook for WebSocket connection status
- useHierarchyLevel() hook for user hierarchy
- useSession() hook for session information
- useTokenRefresh() hook for manual token refresh

#### 9.2 Development Tools
**As a** developer  
**I want** debugging tools  
**So that** I can troubleshoot issues efficiently

**Acceptance Criteria**:
- Dev panel shows active GraphQL queries
- Dev panel shows active subscriptions
- Dev panel shows WebSocket connection status
- Dev panel shows cache contents
- Dev panel shows current user permissions
- Dev panel shows request/response logs
- Request replay functionality available
- Hot module replacement with state preservation
- Detailed error messages in development mode

---

## Technical Requirements

### Performance Requirements
- Initial page load < 3 seconds
- GraphQL queries respond < 500ms
- gRPC calls respond < 200ms
- WebSocket connection establishes < 1 second
- Token refresh completes < 500ms
- Cache hit rate > 70%

### Security Requirements
- Access tokens never stored in localStorage
- Refresh tokens in HttpOnly cookies or memory
- All requests use HTTPS in production
- CSRF protection implemented
- Input validation on all forms
- XSS protection enabled
- Sensitive data never logged
- Content Security Policy headers configured

### Reliability Requirements
- Automatic retry on transient failures
- Graceful degradation on service unavailability
- Circuit breaker prevents cascading failures
- Error recovery mechanisms work
- 99.9% uptime target

### Type Safety Requirements
- 100% TypeScript coverage
- All GraphQL operations have generated types
- All gRPC calls have generated types
- No 'any' types in production code
- Type guards used for runtime checks
- Validation schemas match server expectations

---

## Dependencies

### Required NPM Packages

**GraphQL & Apollo Client**:
- @apollo/client (^3.8.0)
- graphql (^16.8.0)
- graphql-ws (^5.14.0)
- @graphql-codegen/cli (^5.0.0)
- @graphql-codegen/typescript (^4.0.0)
- @graphql-codegen/typescript-operations (^4.0.0)
- @graphql-codegen/typescript-react-apollo (^4.0.0)

**gRPC Communication**:
- @grpc/grpc-js (^1.9.0)
- @grpc/proto-loader (^0.7.0)
- google-protobuf (^3.21.0)
- grpc-tools (^1.12.0)

**Authentication & Security**:
- jose (^5.0.0)
- js-cookie (^3.0.0)

**Validation & Type Safety**:
- zod (^3.22.0)

**Utilities**:
- date-fns (^2.30.0)
- uuid (^9.0.0)
- lodash-es (^4.17.0)

**Development Tools**:
- @types/node
- @types/uuid
- @types/lodash-es

---

## Environment Variables

### Web Application (.env.local)
```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:3001/graphql
NEXT_PUBLIC_GRAPHQL_WS_URL=ws://localhost:3001/graphql
NEXT_PUBLIC_GRPC_URL=localhost:5000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD=300000
NEXT_PUBLIC_SESSION_TIMEOUT=900000
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=3
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
NEXT_PUBLIC_LOG_LEVEL=debug
```

### Backend Changes Required (server/.env)
```
PORT=3001  # Changed from 3000
CORS_ORIGIN=http://localhost:3000
GRAPHQL_SUBSCRIPTIONS_ENABLED=true
```

---

## Directory Structure

```
web/src/
├── lib/
│   ├── api/
│   │   ├── apollo-client.ts
│   │   ├── grpc-client.ts
│   │   ├── interceptors.ts
│   │   └── correlation.ts
│   ├── auth/
│   │   ├── token-manager.ts
│   │   ├── session-manager.ts
│   │   ├── permission-checker.ts
│   │   └── fingerprint-validator.ts
│   ├── types/
│   │   ├── generated/
│   │   │   ├── graphql.ts
│   │   │   └── grpc.ts
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   └── common.ts
│   ├── websocket/
│   │   ├── connection-manager.ts
│   │   ├── subscription-manager.ts
│   │   └── reconnection-strategy.ts
│   ├── cache/
│   │   ├── apollo-cache-config.ts
│   │   ├── cache-policies.ts
│   │   └── cache-updaters.ts
│   ├── errors/
│   │   ├── error-handler.ts
│   │   ├── error-boundaries.tsx
│   │   └── error-mapper.ts
│   ├── validation/
│   │   ├── dto-validators.ts
│   │   ├── input-validators.ts
│   │   └── schema-validators.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   ├── useQuery.ts
│   │   ├── useMutation.ts
│   │   └── useSubscription.ts
│   ├── utils/
│   │   ├── format.ts
│   │   ├── transform.ts
│   │   └── helpers.ts
│   ├── config/
│   │   ├── environment.ts
│   │   └── constants.ts
│   └── monitoring/
│       ├── performance.ts
│       └── error-tracking.ts
├── providers/
│   ├── AuthProvider.tsx
│   ├── ApolloProvider.tsx
│   └── AppProviders.tsx
├── graphql/
│   ├── queries/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── permissions.ts
│   │   ├── organizations.ts
│   │   ├── branches.ts
│   │   ├── departments.ts
│   │   ├── business-rules.ts
│   │   └── audit-logs.ts
│   ├── mutations/
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── permissions.ts
│   │   ├── organizations.ts
│   │   ├── branches.ts
│   │   ├── departments.ts
│   │   └── business-rules.ts
│   ├── subscriptions/
│   │   ├── auth.ts
│   │   ├── permissions.ts
│   │   └── audit-logs.ts
│   └── fragments/
│       ├── user.ts
│       ├── permission.ts
│       └── common.ts
└── grpc/
    ├── clients/
    │   ├── authorization-client.ts
    │   ├── user-client.ts
    │   └── health-client.ts
    └── utils/
        ├── connection-pool.ts
        └── error-mapper.ts
```

---

## Success Metrics

### Functional Metrics
- 100% of backend endpoints (35 GraphQL + 9 gRPC) accessible from frontend
- All authentication flows working (login, logout, refresh, PIN login)
- All user management operations working
- All permission management operations working
- Real-time subscriptions delivering updates
- Multi-tab synchronization working

### Performance Metrics
- < 500ms average GraphQL query response time
- < 200ms average gRPC call response time
- > 99% WebSocket connection uptime
- > 70% cache hit rate
- < 3 seconds initial page load

### Quality Metrics
- Zero type errors in production
- < 1% error rate in production
- 100% test coverage for critical paths
- All errors logged with correlation IDs
- All requests traceable end-to-end

---

## Out of Scope

The following are explicitly out of scope for this foundation layer:
- UI components and pages (only infrastructure)
- Business logic implementation
- Feature-specific functionality
- Database migrations
- Backend API implementation (only client-side integration)
- Deployment configuration
- CI/CD pipeline setup

---

## Risks & Mitigation

### Risk 1: Port Conflict
**Risk**: Backend and web app both configured for port 3000  
**Impact**: High - Applications won't start  
**Mitigation**: Update backend PORT to 3001 before starting implementation

### Risk 2: Type Generation Complexity
**Risk**: GraphQL/gRPC type generation may fail  
**Impact**: Medium - Development blocked until resolved  
**Mitigation**: Test type generation early, have fallback manual types

### Risk 3: WebSocket Connection Stability
**Risk**: WebSocket connections may be unstable in production  
**Impact**: Medium - Real-time features degraded  
**Mitigation**: Implement robust reconnection logic, fallback to polling

### Risk 4: Token Management Security
**Risk**: Improper token storage could expose security vulnerabilities  
**Impact**: High - Security breach  
**Mitigation**: Follow security best practices, never use localStorage for tokens

### Risk 5: Performance Degradation
**Risk**: Too many network requests could slow down application  
**Impact**: Medium - Poor user experience  
**Mitigation**: Implement aggressive caching, request batching, code splitting

---

## Notes

- This foundation layer is infrastructure only - no UI components
- All 35 GraphQL endpoints must be implemented
- All 9 gRPC services must be implemented
- Type safety is non-negotiable - 100% TypeScript coverage required
- Security best practices must be followed for token management
- Performance targets must be met
- The foundation layer should be reusable across all features
- Documentation must be comprehensive for future developers
