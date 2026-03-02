# Foundation Layer Design Document

## 1. Design Overview

### 1.1 Architecture Philosophy

The foundation layer follows a **layered architecture** pattern with clear separation of concerns:

- **Communication Layer**: Handles all network communication (GraphQL, gRPC, WebSocket)
- **Authentication Layer**: Manages tokens, sessions, and permissions
- **State Management Layer**: Handles caching and data synchronization
- **Error Handling Layer**: Provides centralized error management
- **Validation Layer**: Ensures data integrity
- **Monitoring Layer**: Tracks performance and errors

### 1.2 Design Principles

1. **Type Safety First**: 100% TypeScript coverage with generated types
2. **Security by Default**: Tokens in memory, HttpOnly cookies, no localStorage
3. **Performance Optimized**: Caching, request deduplication, code splitting
4. **Resilient**: Automatic retry, circuit breakers, graceful degradation
5. **Developer Friendly**: Custom hooks, clear APIs, comprehensive error messages
6. **Observable**: Correlation IDs, performance metrics, error tracking

### 1.3 Technology Stack

**Core Technologies**:
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5+
- Apollo Client 3.8+ (GraphQL)
- @grpc/grpc-js 1.9+ (gRPC)
- graphql-ws 5.14+ (WebSocket)

**Supporting Libraries**:
- jose 5.0+ (JWT handling)
- zod 3.22+ (validation)
- date-fns 2.30+ (date utilities)

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js Application (Port 3000)               │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Application Layer                         │ │
│  │              (React Components & Pages)                     │ │
│  └──────────────────────┬─────────────────────────────────────┘ │
│                         │                                         │
│  ┌──────────────────────▼─────────────────────────────────────┐ │
│  │                  Foundation Layer                           │ │
│  │                                                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐       │ │
│  │  │   Apollo    │  │    gRPC     │  │  WebSocket   │       │ │
│  │  │   Client    │  │   Clients   │  │   Manager    │       │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬───────┘       │ │
│  │         │                 │                 │                │ │
│  │  ┌──────▼─────────────────▼─────────────────▼──────┐       │ │
│  │  │         Interceptor & Middleware Layer           │       │ │
│  │  │  • Token Injection    • Correlation ID           │       │ │
│  │  │  • Error Handling     • Retry Logic              │       │ │
│  │  └──────┬─────────────────┬─────────────────┬───────┘       │ │
│  │         │                 │                 │                │ │
│  │  ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐        │ │
│  │  │    Auth     │  │    Cache    │  │   Error     │        │ │
│  │  │   Manager   │  │   Manager   │  │  Handler    │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────┬──────────────┬──────────────┬────────────────┘
                    │              │              │
              GraphQL (HTTP)   gRPC (Binary)  WebSocket (WSS)
                    │              │              │
┌───────────────────▼──────────────▼──────────────▼────────────────┐
│                  Network Layer (HTTPS/WSS)                        │
└───────────────────┬──────────────┬──────────────┬────────────────┘
                    │              │              │
┌───────────────────▼──────────────▼──────────────▼────────────────┐
│              NestJS Backend Server (Port 3001)                    │
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  GraphQL API │  │ gRPC Service │  │  WebSocket   │          │
│  │  (Port 3001) │  │ (Port 5000)  │  │ (Port 3001)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────────────────────────────────────────────────┘
```

### 2.2 Port Configuration


**Port Allocation**:
- Web Application: `3000` (Next.js dev server)
- Backend GraphQL/HTTP: `3001` (NestJS server)
- Backend gRPC: `5000` (gRPC service)
- WebSocket: `3001` (same as GraphQL, different protocol)

**Environment Configuration**:
```typescript
// web/src/lib/config/environment.ts
export const config = {
  graphql: {
    httpUrl: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
    wsUrl: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:3001/graphql',
  },
  grpc: {
    url: process.env.NEXT_PUBLIC_GRPC_URL || 'localhost:5000',
    maxConnections: 10,
    connectionTimeout: 5000,
    requestTimeout: 10000,
  },
  auth: {
    tokenRefreshThreshold: 300000, // 5 minutes
    sessionTimeout: 900000, // 15 minutes
  },
  retry: {
    maxAttempts: 3,
    initialDelay: 300,
    maxDelay: 1200,
  },
} as const;
```

**CORS Configuration** (Backend):
```typescript
// server/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-Id'],
});
```

### 2.3 Communication Layer Design

#### 2.3.1 Apollo Client Architecture

**Apollo Client Configuration**:
```typescript
// web/src/lib/api/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink, split, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// Link Chain Architecture:
// RetryLink → ErrorLink → AuthLink → SplitLink → [HttpLink | WsLink]

const httpLink = new HttpLink({
  uri: config.graphql.httpUrl,
  credentials: 'include',
});

const wsLink = new GraphQLWsLink(createClient({
  url: config.graphql.wsUrl,
  connectionParams: async () => ({
    authorization: await getAccessToken(),
    correlationId: generateCorrelationId(),
  }),
}));

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const authLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  const correlationId = generateCorrelationId();
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'X-Correlation-Id': correlationId,
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        return fromPromise(
          refreshToken().catch(() => {
            // Redirect to login
            window.location.href = '/login';
            return;
          })
        ).flatMap(() => forward(operation));
      }
    }
  }
  
  if (networkError) {
    console.error('[Network error]:', networkError);
  }
});

const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 1200,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => !!error && !error.statusCode?.toString().startsWith('4'),
  },
});

export const apolloClient = new ApolloClient({
  link: from([retryLink, errorLink, authLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            keyArgs: ['filter'],
            merge(existing, incoming, { args }) {
              // Pagination merge logic
              return incoming;
            },
          },
        },
      },
      User: {
        keyFields: ['id'],
      },
      Permission: {
        keyFields: ['id'],
      },
      Organization: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
```

**Request Deduplication**: Apollo Client automatically deduplicates identical queries within a 10ms window.

**Cache Normalization**: All entities are normalized by ID, enabling automatic cache updates across the application.


#### 2.3.2 gRPC Client Architecture

**Connection Pool Design**:
```typescript
// web/src/grpc/utils/connection-pool.ts
import * as grpc from '@grpc/grpc-js';

class GRPCConnectionPool {
  private connections: Map<string, grpc.Client> = new Map();
  private maxConnections = 10;
  private activeConnections = 0;

  getConnection(serviceName: string): grpc.Client {
    if (this.connections.has(serviceName)) {
      return this.connections.get(serviceName)!;
    }

    if (this.activeConnections >= this.maxConnections) {
      throw new Error('Connection pool exhausted');
    }

    const connection = this.createConnection(serviceName);
    this.connections.set(serviceName, connection);
    this.activeConnections++;
    
    return connection;
  }

  private createConnection(serviceName: string): grpc.Client {
    const credentials = grpc.credentials.createInsecure(); // Use SSL in production
    
    return new grpc.Client(
      config.grpc.url,
      credentials,
      {
        'grpc.keepalive_time_ms': 30000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.keepalive_permit_without_calls': 1,
      }
    );
  }
}

export const connectionPool = new GRPCConnectionPool();
```

**gRPC Service Clients**:
```typescript
// web/src/grpc/clients/authorization-client.ts
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { connectionPool } from '../utils/connection-pool';

const PROTO_PATH = './protos/authorization.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const authProto = grpc.loadPackageDefinition(packageDefinition).authorization;

export class AuthorizationClient {
  private client: any;

  constructor() {
    this.client = connectionPool.getConnection('authorization');
  }

  async checkPermission(userId: string, module: string, action: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const deadline = new Date();
      deadline.setSeconds(deadline.getSeconds() + 10);

      this.client.CheckPermission(
        { userId, module, action },
        { deadline },
        (error: grpc.ServiceError | null, response: any) => {
          if (error) {
            reject(this.mapGRPCError(error));
          } else {
            resolve(response.hasPermission);
          }
        }
      );
    });
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    return new Promise((resolve, reject) => {
      this.client.GetUserPermissions(
        { userId },
        (error: grpc.ServiceError | null, response: any) => {
          if (error) {
            reject(this.mapGRPCError(error));
          } else {
            resolve(response.permissions);
          }
        }
      );
    });
  }

  private mapGRPCError(error: grpc.ServiceError): Error {
    // Map gRPC status codes to application errors
    const errorMap: Record<number, string> = {
      [grpc.status.UNAUTHENTICATED]: 'Authentication required',
      [grpc.status.PERMISSION_DENIED]: 'Permission denied',
      [grpc.status.NOT_FOUND]: 'Resource not found',
      [grpc.status.UNAVAILABLE]: 'Service unavailable',
      [grpc.status.DEADLINE_EXCEEDED]: 'Request timeout',
    };

    const message = errorMap[error.code] || error.message;
    return new Error(message);
  }
}

export const authorizationClient = new AuthorizationClient();
```


### 2.4 Authentication System Architecture

#### 2.4.1 Token Management

**Token Storage Strategy**:
- **Access Tokens**: Stored in memory only (never localStorage or sessionStorage)
- **Refresh Tokens**: Stored in HttpOnly cookies (set by backend) or memory
- **Token Lifecycle**: Access token (15 min), Refresh token (7 days)

**Token Manager Implementation**:
```typescript
// web/src/lib/auth/token-manager.ts
import { jwtVerify, decodeJwt } from 'jose';

interface TokenPayload {
  sub: string; // user ID
  email: string;
  organizationId: string;
  hierarchyLevel: number;
  permissions: string[];
  fingerprint: string;
  iat: number;
  exp: number;
}

class TokenManager {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenRefreshTimer: NodeJS.Timeout | null = null;

  setTokens(access: string, refresh?: string): void {
    this.accessToken = access;
    if (refresh) {
      this.refreshToken = refresh;
    }
    
    this.scheduleTokenRefresh();
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  decodeToken(): TokenPayload | null {
    if (!this.accessToken) return null;
    
    try {
      return decodeJwt(this.accessToken) as TokenPayload;
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  isTokenExpired(): boolean {
    const payload = this.decodeToken();
    if (!payload) return true;
    
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  getTimeUntilExpiry(): number {
    const payload = this.decodeToken();
    if (!payload) return 0;
    
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now) * 1000;
  }

  private scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    const timeUntilExpiry = this.getTimeUntilExpiry();
    const refreshThreshold = config.auth.tokenRefreshThreshold;
    const refreshTime = Math.max(0, timeUntilExpiry - refreshThreshold);

    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshAccessToken();
    }, refreshTime);
  }

  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await fetch(`${config.graphql.httpUrl}/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: this.refreshToken,
        }),
      });

      if (response.ok) {
        const { accessToken, refreshToken } = await response.json();
        this.setTokens(accessToken, refreshToken);
      } else {
        this.clearTokens();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
    }
  }
}

export const tokenManager = new TokenManager();
```


#### 2.4.2 Permission System

**Permission Checker Implementation**:
```typescript
// web/src/lib/auth/permission-checker.ts
import { tokenManager } from './token-manager';

export type PermissionModule = 
  | 'users' | 'permissions' | 'organizations' | 'branches' 
  | 'departments' | 'business_rules' | 'audit_logs' | 'reports';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

class PermissionChecker {
  private permissionCache: Map<string, boolean> = new Map();
  private cacheTimeout = 60000; // 1 minute

  hasPermission(module: PermissionModule, action: PermissionAction): boolean {
    const cacheKey = `${module}:${action}`;
    
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)!;
    }

    const payload = tokenManager.decodeToken();
    if (!payload) return false;

    const permissionString = `${module}:${action}`;
    const hasPermission = payload.permissions.includes(permissionString);

    this.permissionCache.set(cacheKey, hasPermission);
    setTimeout(() => this.permissionCache.delete(cacheKey), this.cacheTimeout);

    return hasPermission;
  }

  hasAnyPermission(permissions: Array<[PermissionModule, PermissionAction]>): boolean {
    return permissions.some(([module, action]) => this.hasPermission(module, action));
  }

  hasAllPermissions(permissions: Array<[PermissionModule, PermissionAction]>): boolean {
    return permissions.every(([module, action]) => this.hasPermission(module, action));
  }

  getHierarchyLevel(): number {
    const payload = tokenManager.decodeToken();
    return payload?.hierarchyLevel ?? 0;
  }

  validateFingerprint(expectedFingerprint: string): boolean {
    const payload = tokenManager.decodeToken();
    if (!payload) return false;

    return payload.fingerprint === expectedFingerprint;
  }

  clearCache(): void {
    this.permissionCache.clear();
  }
}

export const permissionChecker = new PermissionChecker();
```


#### 2.4.3 Session Management

**Multi-Tab Synchronization**:
```typescript
// web/src/lib/auth/session-manager.ts
import { v4 as uuidv4 } from 'uuid';

interface SessionEvent {
  type: 'login' | 'logout' | 'token_refresh' | 'permission_change';
  sessionId: string;
  timestamp: number;
  data?: any;
}

class SessionManager {
  private sessionId: string;
  private broadcastChannel: BroadcastChannel | null = null;
  private sessionTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.sessionId = uuidv4();
    this.initializeBroadcastChannel();
    this.startSessionTimeout();
  }

  private initializeBroadcastChannel(): void {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('auth_channel');
      
      this.broadcastChannel.onmessage = (event: MessageEvent<SessionEvent>) => {
        this.handleSessionEvent(event.data);
      };
    }
  }

  private handleSessionEvent(event: SessionEvent): void {
    if (event.sessionId === this.sessionId) return; // Ignore own events

    switch (event.type) {
      case 'login':
        // Sync login state across tabs
        window.location.reload();
        break;
      
      case 'logout':
        // Force logout in all tabs
        tokenManager.clearTokens();
        window.location.href = '/login';
        break;
      
      case 'token_refresh':
        // Sync new tokens
        if (event.data?.accessToken) {
          tokenManager.setTokens(event.data.accessToken, event.data.refreshToken);
        }
        break;
      
      case 'permission_change':
        // Clear permission cache
        permissionChecker.clearCache();
        break;
    }
  }

  broadcastEvent(type: SessionEvent['type'], data?: any): void {
    if (!this.broadcastChannel) return;

    const event: SessionEvent = {
      type,
      sessionId: this.sessionId,
      timestamp: Date.now(),
      data,
    };

    this.broadcastChannel.postMessage(event);
  }

  private startSessionTimeout(): void {
    this.resetSessionTimeout();

    // Reset timeout on user activity
    if (typeof window !== 'undefined') {
      ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
        window.addEventListener(event, () => this.resetSessionTimeout());
      });
    }
  }

  private resetSessionTimeout(): void {
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    this.sessionTimeout = setTimeout(() => {
      this.broadcastEvent('logout');
      tokenManager.clearTokens();
      window.location.href = '/login?reason=timeout';
    }, config.auth.sessionTimeout);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  destroy(): void {
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }
  }
}

export const sessionManager = new SessionManager();
```


### 2.5 WebSocket & Real-Time Communication

#### 2.5.1 WebSocket Connection Manager

```typescript
// web/src/lib/websocket/connection-manager.ts
import { createClient, Client } from 'graphql-ws';
import { tokenManager } from '../auth/token-manager';
import { generateCorrelationId } from '../utils/correlation';

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

class WebSocketConnectionManager {
  private client: Client | null = null;
  private state: ConnectionState = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(state: ConnectionState) => void> = new Set();

  connect(): void {
    if (this.client) return;

    this.setState('connecting');

    this.client = createClient({
      url: config.graphql.wsUrl,
      connectionParams: async () => {
        const token = tokenManager.getAccessToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
          correlationId: generateCorrelationId(),
        };
      },
      retryAttempts: this.maxReconnectAttempts,
      retryWait: (retries) => {
        return new Promise((resolve) => {
          const delay = Math.min(1000 * 2 ** retries, 30000);
          setTimeout(resolve, delay);
        });
      },
      on: {
        connected: () => {
          this.setState('connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
        },
        closed: () => {
          this.setState('disconnected');
          this.stopHeartbeat();
        },
        error: (error) => {
          console.error('WebSocket error:', error);
          this.setState('reconnecting');
        },
      },
    });
  }

  disconnect(): void {
    if (this.client) {
      this.client.dispose();
      this.client = null;
    }
    this.stopHeartbeat();
    this.setState('disconnected');
  }

  getClient(): Client | null {
    return this.client;
  }

  getState(): ConnectionState {
    return this.state;
  }

  onStateChange(listener: (state: ConnectionState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private setState(state: ConnectionState): void {
    this.state = state;
    this.listeners.forEach(listener => listener(state));
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      // Send ping to keep connection alive
      if (this.state === 'connected') {
        // graphql-ws handles ping/pong automatically
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const wsConnectionManager = new WebSocketConnectionManager();
```


### 2.6 Data Flow Diagrams

#### 2.6.1 Authentication Flow

```
┌─────────┐                                                    ┌─────────┐
│  User   │                                                    │ Backend │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │  1. Enter credentials                                       │
     ├──────────────────────────────────────────────────────────►  │
     │     POST /graphql (login mutation)                          │
     │     { email, password, organizationId }                     │
     │                                                              │
     │  2. Validate credentials & generate tokens                  │
     │                                                         ┌────▼────┐
     │                                                         │ Validate│
     │                                                         │  & JWT  │
     │                                                         └────┬────┘
     │                                                              │
     │  3. Return tokens                                           │
     │  ◄──────────────────────────────────────────────────────────┤
     │     { accessToken, refreshToken, user }                     │
     │                                                              │
┌────▼────┐                                                         │
│  Store  │                                                         │
│ Tokens  │                                                         │
│ in Mem  │                                                         │
└────┬────┘                                                         │
     │                                                              │
     │  4. Subsequent requests with token                          │
     ├──────────────────────────────────────────────────────────►  │
     │     Authorization: Bearer <accessToken>                     │
     │     X-Correlation-Id: <uuid>                                │
     │                                                              │
     │  5. Token expires (detected by error or timer)              │
     │                                                              │
┌────▼────┐                                                         │
│ Refresh │                                                         │
│  Token  │                                                         │
└────┬────┘                                                         │
     │  6. Request new access token                                │
     ├──────────────────────────────────────────────────────────►  │
     │     POST /refresh                                           │
     │     { refreshToken }                                        │
     │                                                              │
     │  7. Return new tokens                                       │
     │  ◄──────────────────────────────────────────────────────────┤
     │     { accessToken, refreshToken }                           │
     │                                                              │
     │  8. Broadcast to other tabs                                 │
┌────▼────┐                                                         │
│Broadcast│                                                         │
│ Channel │                                                         │
└─────────┘                                                         │
```


#### 2.6.2 GraphQL Query Flow with Caching

```
┌───────────┐
│ Component │
└─────┬─────┘
      │
      │ useQuery(GET_USERS)
      │
┌─────▼──────┐
│   Apollo   │
│   Client   │
└─────┬──────┘
      │
      │ 1. Check cache
      ├──────────────┐
      │              │
      │         ┌────▼────┐
      │         │  Cache  │
      │         │  Hit?   │
      │         └────┬────┘
      │              │
      │         Yes  │  No
      │         ┌────▼────┐
      │         │ Return  │
      │         │  Data   │
      │         └─────────┘
      │              │
      │ 2. Network request (if cache miss or cache-and-network)
      │
┌─────▼──────┐
│   Links    │
│  Pipeline  │
└─────┬──────┘
      │
      │ RetryLink → ErrorLink → AuthLink → HttpLink
      │
┌─────▼──────┐
│  Backend   │
│  GraphQL   │
└─────┬──────┘
      │
      │ 3. Response
      │
┌─────▼──────┐
│  Normalize │
│  & Cache   │
└─────┬──────┘
      │
      │ 4. Update cache
      │    User:123 → { id, name, email, ... }
      │    User:456 → { id, name, email, ... }
      │
┌─────▼──────┐
│   Notify   │
│ Observers  │
└─────┬──────┘
      │
      │ 5. Re-render components
      │
┌─────▼──────┐
│   Update   │
│     UI     │
└────────────┘
```


#### 2.6.3 Real-Time Subscription Flow

```
┌───────────┐                                              ┌─────────┐
│ Component │                                              │ Backend │
└─────┬─────┘                                              └────┬────┘
      │                                                         │
      │ useSubscription(PERMISSION_CHANGES)                    │
      │                                                         │
┌─────▼──────┐                                                 │
│ WebSocket  │                                                 │
│  Manager   │                                                 │
└─────┬──────┘                                                 │
      │                                                         │
      │ 1. Establish WSS connection (if not connected)         │
      ├─────────────────────────────────────────────────────►  │
      │    connection_init { authorization, correlationId }    │
      │                                                         │
      │ 2. Connection acknowledged                             │
      │  ◄─────────────────────────────────────────────────────┤
      │    connection_ack                                      │
      │                                                         │
      │ 3. Subscribe to events                                 │
      ├─────────────────────────────────────────────────────►  │
      │    subscribe { query, variables }                      │
      │                                                         │
      │ 4. Subscription confirmed                              │
      │  ◄─────────────────────────────────────────────────────┤
      │    next { id: "sub-123" }                              │
      │                                                         │
      │ ... time passes ...                                    │
      │                                                         │
      │ 5. Event occurs (permission changed)                   │
      │                                                    ┌────▼────┐
      │                                                    │  Event  │
      │                                                    │ Trigger │
      │                                                    └────┬────┘
      │                                                         │
      │ 6. Push update to client                               │
      │  ◄─────────────────────────────────────────────────────┤
      │    next { data: { permissionChanged: {...} } }         │
      │                                                         │
┌─────▼──────┐                                                 │
│   Update   │                                                 │
│   Cache    │                                                 │
└─────┬──────┘                                                 │
      │                                                         │
┌─────▼──────┐                                                 │
│  Callback  │                                                 │
│  Executed  │                                                 │
└─────┬──────┘                                                 │
      │                                                         │
┌─────▼──────┐                                                 │
│ UI Updates │                                                 │
└────────────┘                                                 │
```


### 2.7 Multi-Layer Caching Strategy

#### 2.7.1 Cache Architecture

**Three-Layer Caching**:

1. **Apollo InMemoryCache** (Primary)
   - Normalized entity cache
   - Automatic cache updates on mutations
   - Query result caching
   - Optimistic updates

2. **Permission Cache** (Secondary)
   - In-memory permission check results
   - 1-minute TTL
   - Cleared on permission change events

3. **Browser Cache** (Tertiary)
   - Static assets (images, fonts, CSS)
   - Service Worker cache (if PWA)
   - HTTP cache headers

#### 2.7.2 Cache Policies

```typescript
// web/src/lib/cache/apollo-cache-config.ts
import { InMemoryCache, TypePolicies } from '@apollo/client';

const typePolicies: TypePolicies = {
  Query: {
    fields: {
      users: {
        keyArgs: ['filter', 'organizationId'],
        merge(existing, incoming, { args }) {
          if (!existing) return incoming;
          
          // Pagination merge
          if (args?.offset) {
            return {
              ...incoming,
              edges: [...existing.edges, ...incoming.edges],
            };
          }
          
          return incoming;
        },
      },
      permissions: {
        keyArgs: ['userId'],
        merge: false, // Always replace
      },
      auditLogs: {
        keyArgs: ['filter'],
        merge(existing, incoming, { args }) {
          // Append new logs for infinite scroll
          if (!existing) return incoming;
          return {
            ...incoming,
            logs: [...existing.logs, ...incoming.logs],
          };
        },
      },
    },
  },
  User: {
    keyFields: ['id'],
    fields: {
      permissions: {
        merge: false, // Always replace permissions array
      },
    },
  },
  Permission: {
    keyFields: ['id'],
  },
  Organization: {
    keyFields: ['id'],
  },
  Branch: {
    keyFields: ['id'],
  },
  Department: {
    keyFields: ['id'],
  },
  BusinessRule: {
    keyFields: ['id'],
  },
  AuditLog: {
    keyFields: ['id'],
  },
};

export const cache = new InMemoryCache({
  typePolicies,
  possibleTypes: {
    // Add union/interface types here if needed
  },
});
```


#### 2.7.3 Cache Update Strategies

**Automatic Updates**:
```typescript
// web/src/lib/cache/cache-updaters.ts
import { ApolloCache } from '@apollo/client';

export const updateCacheAfterCreateUser = (
  cache: ApolloCache<any>,
  newUser: User
) => {
  cache.modify({
    fields: {
      users(existingUsers = { edges: [] }) {
        const newUserRef = cache.writeFragment({
          data: newUser,
          fragment: gql`
            fragment NewUser on User {
              id
              email
              firstName
              lastName
              status
            }
          `,
        });
        
        return {
          ...existingUsers,
          edges: [newUserRef, ...existingUsers.edges],
        };
      },
    },
  });
};

export const updateCacheAfterDeleteUser = (
  cache: ApolloCache<any>,
  userId: string
) => {
  cache.evict({ id: `User:${userId}` });
  cache.gc(); // Garbage collect orphaned references
};

export const updateCacheAfterUpdateUser = (
  cache: ApolloCache<any>,
  updatedUser: User
) => {
  cache.writeFragment({
    id: `User:${updatedUser.id}`,
    fragment: gql`
      fragment UpdatedUser on User {
        id
        email
        firstName
        lastName
        status
        updatedAt
      }
    `,
    data: updatedUser,
  });
};
```

**Optimistic Updates**:
```typescript
// Example: Optimistic user update
const [updateUser] = useMutation(UPDATE_USER, {
  optimisticResponse: (variables) => ({
    __typename: 'Mutation',
    updateUser: {
      __typename: 'User',
      id: variables.id,
      ...variables.input,
      updatedAt: new Date().toISOString(),
    },
  }),
  update: (cache, { data }) => {
    if (data?.updateUser) {
      updateCacheAfterUpdateUser(cache, data.updateUser);
    }
  },
});
```

**Cache Invalidation**:
```typescript
// Invalidate specific queries
apolloClient.refetchQueries({
  include: ['GetUsers', 'GetUserById'],
});

// Invalidate all queries
apolloClient.refetchQueries({
  include: 'active',
});

// Clear entire cache
apolloClient.clearStore();

// Reset cache and refetch
apolloClient.resetStore();
```


### 2.8 Error Handling Architecture

#### 2.8.1 Error Classification

**Error Types**:
```typescript
// web/src/lib/errors/error-types.ts
export enum ErrorCategory {
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  category: ErrorCategory;
  code: string;
  message: string;
  userMessage: string;
  correlationId?: string;
  timestamp: Date;
  stack?: string;
  context?: Record<string, any>;
}

export class AuthenticationError extends Error implements AppError {
  category = ErrorCategory.AUTHENTICATION;
  code = 'AUTH_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthenticationError';
    this.userMessage = userMessage;
    this.context = context;
  }
}

export class AuthorizationError extends Error implements AppError {
  category = ErrorCategory.AUTHORIZATION;
  code = 'AUTHZ_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, context?: Record<string, any>) {
    super(message);
    this.name = 'AuthorizationError';
    this.userMessage = userMessage;
    this.context = context;
  }
}

export class ValidationError extends Error implements AppError {
  category = ErrorCategory.VALIDATION;
  code = 'VALIDATION_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;
  fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    userMessage: string,
    fieldErrors?: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ValidationError';
    this.userMessage = userMessage;
    this.fieldErrors = fieldErrors;
    this.context = context;
  }
}

export class NetworkError extends Error implements AppError {
  category = ErrorCategory.NETWORK;
  code = 'NETWORK_ERROR';
  userMessage: string;
  correlationId?: string;
  timestamp = new Date();
  context?: Record<string, any>;

  constructor(message: string, userMessage: string, context?: Record<string, any>) {
    super(message);
    this.name = 'NetworkError';
    this.userMessage = userMessage;
    this.context = context;
  }
}
```


#### 2.8.2 Error Handler

```typescript
// web/src/lib/errors/error-handler.ts
import { GraphQLError } from 'graphql';
import { ApolloError } from '@apollo/client';
import * as grpc from '@grpc/grpc-js';

class ErrorHandler {
  handleGraphQLError(error: ApolloError): AppError {
    const correlationId = this.extractCorrelationId(error);
    
    if (error.graphQLErrors.length > 0) {
      const gqlError = error.graphQLErrors[0];
      const code = gqlError.extensions?.code as string;

      switch (code) {
        case 'UNAUTHENTICATED':
          return new AuthenticationError(
            gqlError.message,
            'Your session has expired. Please log in again.',
            { correlationId }
          );
        
        case 'FORBIDDEN':
          return new AuthorizationError(
            gqlError.message,
            'You do not have permission to perform this action.',
            { correlationId }
          );
        
        case 'BAD_USER_INPUT':
          const fieldErrors = this.extractFieldErrors(gqlError);
          return new ValidationError(
            gqlError.message,
            'Please check your input and try again.',
            fieldErrors,
            { correlationId }
          );
        
        default:
          return this.createGenericError(gqlError.message, correlationId);
      }
    }

    if (error.networkError) {
      return new NetworkError(
        error.networkError.message,
        'Unable to connect to the server. Please check your internet connection.',
        { correlationId }
      );
    }

    return this.createGenericError(error.message, correlationId);
  }

  handleGRPCError(error: grpc.ServiceError): AppError {
    const errorMap: Record<number, { message: string; category: ErrorCategory }> = {
      [grpc.status.UNAUTHENTICATED]: {
        message: 'Authentication required. Please log in.',
        category: ErrorCategory.AUTHENTICATION,
      },
      [grpc.status.PERMISSION_DENIED]: {
        message: 'You do not have permission to perform this action.',
        category: ErrorCategory.AUTHORIZATION,
      },
      [grpc.status.INVALID_ARGUMENT]: {
        message: 'Invalid request. Please check your input.',
        category: ErrorCategory.VALIDATION,
      },
      [grpc.status.NOT_FOUND]: {
        message: 'The requested resource was not found.',
        category: ErrorCategory.CLIENT,
      },
      [grpc.status.UNAVAILABLE]: {
        message: 'Service temporarily unavailable. Please try again.',
        category: ErrorCategory.NETWORK,
      },
      [grpc.status.DEADLINE_EXCEEDED]: {
        message: 'Request timed out. Please try again.',
        category: ErrorCategory.NETWORK,
      },
    };

    const mapped = errorMap[error.code] || {
      message: 'An unexpected error occurred.',
      category: ErrorCategory.UNKNOWN,
    };

    return {
      category: mapped.category,
      code: `GRPC_${error.code}`,
      message: error.message,
      userMessage: mapped.message,
      timestamp: new Date(),
      context: { grpcCode: error.code },
    };
  }

  private extractCorrelationId(error: ApolloError): string | undefined {
    return error.graphQLErrors[0]?.extensions?.correlationId as string | undefined;
  }

  private extractFieldErrors(error: GraphQLError): Record<string, string[]> | undefined {
    const validationErrors = error.extensions?.validationErrors;
    if (!validationErrors) return undefined;

    const fieldErrors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(validationErrors)) {
      fieldErrors[field] = Array.isArray(messages) ? messages : [messages as string];
    }
    return fieldErrors;
  }

  private createGenericError(message: string, correlationId?: string): AppError {
    return {
      category: ErrorCategory.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message,
      userMessage: 'An unexpected error occurred. Please try again.',
      correlationId,
      timestamp: new Date(),
    };
  }

  logError(error: AppError): void {
    console.error('[Error]', {
      category: error.category,
      code: error.code,
      message: error.message,
      correlationId: error.correlationId,
      timestamp: error.timestamp,
      context: error.context,
      stack: error.stack,
    });

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // this.sendToMonitoring(error);
    }
  }
}

export const errorHandler = new ErrorHandler();
```


#### 2.8.3 Error Boundaries

```typescript
// web/src/lib/errors/error-boundaries.tsx
'use client';

import React, { Component, ReactNode } from 'react';
import { errorHandler } from './error-handler';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
  level: 'root' | 'route' | 'component';
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = {
      category: ErrorCategory.CLIENT,
      code: 'REACT_ERROR',
      message: error.message,
      userMessage: 'Something went wrong. Please try again.',
      timestamp: new Date(),
      stack: error.stack,
      context: {
        componentStack: errorInfo.componentStack,
        level: this.props.level,
      },
    };

    errorHandler.logError(appError);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry for the inconvenience. Please try again.</p>
          <button onClick={this.reset}>Try Again</button>
          {process.env.NODE_ENV === 'development' && (
            <details>
              <summary>Error Details</summary>
              <pre>{this.state.error.message}</pre>
              <pre>{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrappers
export const RootErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="root">{children}</ErrorBoundary>
);

export const RouteErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="route">{children}</ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component">{children}</ErrorBoundary>
);
```


### 2.9 Validation System

#### 2.9.1 Input Validation with Zod

```typescript
// web/src/lib/validation/schemas.ts
import { z } from 'zod';

// Email validation
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// PIN validation
export const pinSchema = z
  .string()
  .regex(/^\d{6}$/, 'PIN must be exactly 6 digits');

// Phone validation
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Login form validation
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// PIN login validation
export const pinLoginSchema = z.object({
  email: emailSchema,
  pin: pinSchema,
  organizationId: z.string().uuid('Invalid organization ID'),
});

export type PinLoginInput = z.infer<typeof pinLoginSchema>;

// User creation validation
export const createUserSchema = z.object({
  email: emailSchema,
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  password: passwordSchema,
  phone: phoneSchema.optional(),
  organizationId: z.string().uuid(),
  branchId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  hierarchyLevel: z.number().int().min(1).max(10),
  permissionIds: z.array(z.string().uuid()).min(1, 'At least one permission required'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Permission creation validation
export const createPermissionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  module: z.enum([
    'users',
    'permissions',
    'organizations',
    'branches',
    'departments',
    'business_rules',
    'audit_logs',
    'reports',
  ]),
  action: z.enum(['create', 'read', 'update', 'delete', 'manage']),
  hierarchyLevel: z.number().int().min(1).max(10),
});

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>;
```


#### 2.9.2 DTO Validators

```typescript
// web/src/lib/validation/dto-validators.ts
import { z } from 'zod';

// User DTO validator
export const userDtoSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  status: z.enum(['active', 'inactive', 'suspended']),
  organizationId: z.string().uuid(),
  branchId: z.string().uuid().nullable(),
  departmentId: z.string().uuid().nullable(),
  hierarchyLevel: z.number().int(),
  permissions: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    module: z.string(),
    action: z.string(),
  })),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type UserDto = z.infer<typeof userDtoSchema>;

// Permission DTO validator
export const permissionDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  module: z.string(),
  action: z.string(),
  hierarchyLevel: z.number().int(),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type PermissionDto = z.infer<typeof permissionDtoSchema>;

// Organization DTO validator
export const organizationDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  code: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string().transform((str) => new Date(str)),
  updatedAt: z.string().transform((str) => new Date(str)),
});

export type OrganizationDto = z.infer<typeof organizationDtoSchema>;

// Validation helper
export function validateDto<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(
        'DTO validation failed',
        'Invalid data received from server',
        error.flatten().fieldErrors as Record<string, string[]>
      );
    }
    throw error;
  }
}
```


### 2.10 Type Generation Pipeline

#### 2.10.1 GraphQL Code Generation

**Configuration** (`codegen.yml`):
```yaml
overwrite: true
schema: "http://localhost:3001/graphql"
documents: "src/graphql/**/*.ts"
generates:
  src/lib/types/generated/graphql.ts:
    plugins:
      - "typescript"
      - "typescript-operations"
      - "typescript-react-apollo"
    config:
      withHooks: true
      withHOC: false
      withComponent: false
      skipTypename: false
      enumsAsTypes: true
      constEnums: false
      immutableTypes: true
      maybeValue: T | null
      avoidOptionals:
        field: false
        inputValue: false
        object: false
      scalars:
        DateTime: string
        UUID: string
        JSON: Record<string, any>
```

**Generated Types Example**:
```typescript
// src/lib/types/generated/graphql.ts (auto-generated)
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };

export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: string;
  UUID: string;
  JSON: Record<string, any>;
};

export type User = {
  __typename?: 'User';
  id: Scalars['UUID'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  phone?: Maybe<Scalars['String']>;
  status: UserStatus;
  organizationId: Scalars['UUID'];
  branchId?: Maybe<Scalars['UUID']>;
  departmentId?: Maybe<Scalars['UUID']>;
  hierarchyLevel: Scalars['Int'];
  permissions: Array<Permission>;
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export enum UserStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Suspended = 'SUSPENDED'
}

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  organizationId: Scalars['UUID'];
}>;

export type LoginMutation = {
  __typename?: 'Mutation';
  login: {
    __typename?: 'AuthPayload';
    accessToken: string;
    refreshToken: string;
    user: {
      __typename?: 'User';
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  };
};

// Generated hooks
export function useLoginMutation(
  baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>
) {
  return Apollo.useMutation<LoginMutation, LoginMutationVariables>(
    LoginDocument,
    baseOptions
  );
}
```


#### 2.10.2 gRPC Type Generation

**Proto File Example**:
```protobuf
// protos/authorization.proto
syntax = "proto3";

package authorization;

service AuthorizationService {
  rpc CheckPermission(CheckPermissionRequest) returns (CheckPermissionResponse);
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  rpc GetUserPermissions(GetUserPermissionsRequest) returns (GetUserPermissionsResponse);
}

message CheckPermissionRequest {
  string user_id = 1;
  string module = 2;
  string action = 3;
}

message CheckPermissionResponse {
  bool has_permission = 1;
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool is_valid = 1;
  string user_id = 2;
  int32 hierarchy_level = 3;
}

message Permission {
  string id = 1;
  string name = 2;
  string module = 3;
  string action = 4;
  int32 hierarchy_level = 5;
}

message GetUserPermissionsRequest {
  string user_id = 1;
}

message GetUserPermissionsResponse {
  repeated Permission permissions = 1;
}
```

**Generation Script** (`package.json`):
```json
{
  "scripts": {
    "generate:graphql": "graphql-codegen --config codegen.yml",
    "generate:grpc": "grpc_tools_node_protoc --js_out=import_style=commonjs,binary:./src/lib/types/generated --grpc_out=grpc_js:./src/lib/types/generated --plugin=protoc-gen-grpc=`which grpc_tools_node_protoc_plugin` --ts_out=grpc_js:./src/lib/types/generated -I ./protos ./protos/*.proto",
    "generate": "npm run generate:graphql && npm run generate:grpc",
    "generate:watch": "concurrently \"npm run generate:graphql -- --watch\" \"npm run generate:grpc -- --watch\""
  }
}
```


### 2.11 Monitoring & Observability

#### 2.11.1 Performance Monitoring

```typescript
// web/src/lib/monitoring/performance.ts
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: Date;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  // Track API request duration
  trackRequest(endpoint: string, duration: number, correlationId?: string): void {
    this.recordMetric({
      name: 'api_request_duration',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      context: { endpoint, correlationId },
    });
  }

  // Track cache hit/miss
  trackCacheHit(hit: boolean, key: string): void {
    this.recordMetric({
      name: hit ? 'cache_hit' : 'cache_miss',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      context: { key },
    });
  }

  // Track WebSocket connection
  trackWebSocketState(state: string, duration?: number): void {
    this.recordMetric({
      name: 'websocket_state',
      value: duration || 0,
      unit: 'ms',
      timestamp: new Date(),
      context: { state },
    });
  }

  // Track Core Web Vitals
  trackWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric({
        name: 'lcp',
        value: lastEntry.startTime,
        unit: 'ms',
        timestamp: new Date(),
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.recordMetric({
          name: 'fid',
          value: entry.processingStart - entry.startTime,
          unit: 'ms',
          timestamp: new Date(),
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric({
        name: 'cls',
        value: clsValue,
        unit: 'count',
        timestamp: new Date(),
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  // Get metrics summary
  getMetricsSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { values: number[]; count: number }> = {};

    this.metrics.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { values: [], count: 0 };
      }
      summary[metric.name].values.push(metric.value);
      summary[metric.name].count++;
    });

    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    Object.entries(summary).forEach(([name, data]) => {
      const values = data.values;
      result[name] = {
        avg: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        count: data.count,
      };
    });

    return result;
  }

  private recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // this.sendToMonitoring(metric);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();
```


#### 2.11.2 Correlation ID System

```typescript
// web/src/lib/utils/correlation.ts
import { v4 as uuidv4 } from 'uuid';

class CorrelationIdManager {
  private currentId: string | null = null;

  generate(): string {
    this.currentId = uuidv4();
    return this.currentId;
  }

  getCurrent(): string | null {
    return this.currentId;
  }

  clear(): void {
    this.currentId = null;
  }
}

export const correlationIdManager = new CorrelationIdManager();

export function generateCorrelationId(): string {
  return correlationIdManager.generate();
}

export function getCurrentCorrelationId(): string | null {
  return correlationIdManager.getCurrent();
}

// React hook for correlation ID
export function useCorrelationId(): string {
  const [correlationId] = React.useState(() => generateCorrelationId());
  return correlationId;
}
```

#### 2.11.3 Request Tracing

```typescript
// web/src/lib/monitoring/tracing.ts
interface TraceSpan {
  id: string;
  parentId?: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  correlationId: string;
  attributes?: Record<string, any>;
}

class RequestTracer {
  private spans: Map<string, TraceSpan> = new Map();

  startSpan(name: string, correlationId: string, parentId?: string): string {
    const spanId = uuidv4();
    const span: TraceSpan = {
      id: spanId,
      parentId,
      name,
      startTime: performance.now(),
      correlationId,
    };

    this.spans.set(spanId, span);
    return spanId;
  }

  endSpan(spanId: string, attributes?: Record<string, any>): void {
    const span = this.spans.get(spanId);
    if (!span) return;

    span.endTime = performance.now();
    span.duration = span.endTime - span.startTime;
    span.attributes = attributes;

    // Log completed span
    console.debug('[Trace]', {
      name: span.name,
      duration: span.duration,
      correlationId: span.correlationId,
      attributes: span.attributes,
    });
  }

  getSpan(spanId: string): TraceSpan | undefined {
    return this.spans.get(spanId);
  }

  getSpansByCorrelationId(correlationId: string): TraceSpan[] {
    return Array.from(this.spans.values()).filter(
      (span) => span.correlationId === correlationId
    );
  }
}

export const requestTracer = new RequestTracer();

// Helper for tracing async operations
export async function traceAsync<T>(
  name: string,
  correlationId: string,
  fn: () => Promise<T>
): Promise<T> {
  const spanId = requestTracer.startSpan(name, correlationId);
  try {
    const result = await fn();
    requestTracer.endSpan(spanId, { success: true });
    return result;
  } catch (error) {
    requestTracer.endSpan(spanId, { success: false, error: (error as Error).message });
    throw error;
  }
}
```


---

## 3. API Contracts

### 3.1 GraphQL Operations (35 Endpoints)

#### 3.1.1 Authentication Operations (9 endpoints)

**1. Login**
```graphql
mutation Login($email: String!, $password: String!, $organizationId: UUID!) {
  login(email: $email, password: $password, organizationId: $organizationId) {
    accessToken
    refreshToken
    user {
      ...UserFragment
    }
  }
}
```

**2. Login with PIN**
```graphql
mutation LoginWithPin($email: String!, $pin: String!, $organizationId: UUID!) {
  loginWithPin(email: $email, pin: $pin, organizationId: $organizationId) {
    accessToken
    refreshToken
    user {
      ...UserFragment
    }
  }
}
```

**3. Logout**
```graphql
mutation Logout {
  logout {
    success
  }
}
```

**4. Refresh Token**
```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
  }
}
```

**5. Change Password**
```graphql
mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
  changePassword(oldPassword: $oldPassword, newPassword: $newPassword) {
    success
  }
}
```

**6. Request Password Reset**
```graphql
mutation RequestPasswordReset($email: String!, $organizationId: UUID!) {
  requestPasswordReset(email: $email, organizationId: $organizationId) {
    success
  }
}
```

**7. Reset Password**
```graphql
mutation ResetPassword($token: String!, $newPassword: String!) {
  resetPassword(token: $token, newPassword: $newPassword) {
    success
  }
}
```

**8. Validate Session**
```graphql
query ValidateSession {
  validateSession {
    isValid
    user {
      ...UserFragment
    }
  }
}
```

**9. Get Active Sessions**
```graphql
query GetActiveSessions {
  activeSessions {
    id
    deviceInfo
    ipAddress
    lastActivity
    createdAt
  }
}
```


#### 3.1.2 User Management Operations (5 endpoints)

**10. Create Manager**
```graphql
mutation CreateManager($input: CreateManagerInput!) {
  createManager(input: $input) {
    ...UserFragment
  }
}

input CreateManagerInput {
  email: String!
  firstName: String!
  lastName: String!
  password: String!
  phone: String
  organizationId: UUID!
  branchId: UUID
  departmentId: UUID
  hierarchyLevel: Int!
  permissionIds: [UUID!]!
}
```

**11. Create Worker**
```graphql
mutation CreateWorker($input: CreateWorkerInput!) {
  createWorker(input: $input) {
    ...UserFragment
  }
}

input CreateWorkerInput {
  email: String!
  firstName: String!
  lastName: String!
  password: String!
  phone: String
  organizationId: UUID!
  branchId: UUID!
  departmentId: UUID!
  hierarchyLevel: Int!
  permissionIds: [UUID!]!
}
```

**12. Get Users**
```graphql
query GetUsers($filter: UserFilterInput, $limit: Int, $offset: Int) {
  users(filter: $filter, limit: $limit, offset: $offset) {
    edges {
      ...UserFragment
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      totalCount
    }
  }
}

input UserFilterInput {
  organizationId: UUID
  branchId: UUID
  departmentId: UUID
  status: UserStatus
  hierarchyLevel: Int
  search: String
}
```

**13. Get User by ID**
```graphql
query GetUserById($id: UUID!) {
  user(id: $id) {
    ...UserFragment
  }
}
```

**14. Update User**
```graphql
mutation UpdateUser($id: UUID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    ...UserFragment
  }
}

input UpdateUserInput {
  firstName: String
  lastName: String
  phone: String
  status: UserStatus
  branchId: UUID
  departmentId: UUID
  hierarchyLevel: Int
  permissionIds: [UUID!]
}
```


#### 3.1.3 Permission Management Operations (4 endpoints)

**15. Create Permission**
```graphql
mutation CreatePermission($input: CreatePermissionInput!) {
  createPermission(input: $input) {
    ...PermissionFragment
  }
}

input CreatePermissionInput {
  name: String!
  description: String
  module: PermissionModule!
  action: PermissionAction!
  hierarchyLevel: Int!
}

enum PermissionModule {
  USERS
  PERMISSIONS
  ORGANIZATIONS
  BRANCHES
  DEPARTMENTS
  BUSINESS_RULES
  AUDIT_LOGS
  REPORTS
}

enum PermissionAction {
  CREATE
  READ
  UPDATE
  DELETE
  MANAGE
}
```

**16. Get Permissions**
```graphql
query GetPermissions($filter: PermissionFilterInput) {
  permissions(filter: $filter) {
    ...PermissionFragment
  }
}

input PermissionFilterInput {
  module: PermissionModule
  action: PermissionAction
  hierarchyLevel: Int
}
```

**17. Update Permission**
```graphql
mutation UpdatePermission($id: UUID!, $input: UpdatePermissionInput!) {
  updatePermission(id: $id, input: $input) {
    ...PermissionFragment
  }
}

input UpdatePermissionInput {
  name: String
  description: String
  hierarchyLevel: Int
}
```

**18. Delete Permission**
```graphql
mutation DeletePermission($id: UUID!) {
  deletePermission(id: $id) {
    success
  }
}
```

#### 3.1.4 Organization Management Operations (2 endpoints)

**19. Create Organization**
```graphql
mutation CreateOrganization($input: CreateOrganizationInput!) {
  createOrganization(input: $input) {
    ...OrganizationFragment
  }
}

input CreateOrganizationInput {
  name: String!
  code: String!
}
```

**20. Get Organizations**
```graphql
query GetOrganizations($filter: OrganizationFilterInput) {
  organizations(filter: $filter) {
    ...OrganizationFragment
  }
}

input OrganizationFilterInput {
  status: OrganizationStatus
  search: String
}

enum OrganizationStatus {
  ACTIVE
  INACTIVE
}
```


#### 3.1.5 Branch Management Operations (4 endpoints)

**21. Create Branch**
```graphql
mutation CreateBranch($input: CreateBranchInput!) {
  createBranch(input: $input) {
    ...BranchFragment
  }
}

input CreateBranchInput {
  name: String!
  code: String!
  organizationId: UUID!
  address: String
  phone: String
}
```

**22. Get Branches**
```graphql
query GetBranches($organizationId: UUID!, $filter: BranchFilterInput) {
  branches(organizationId: $organizationId, filter: $filter) {
    ...BranchFragment
  }
}

input BranchFilterInput {
  status: BranchStatus
  search: String
}
```

**23. Update Branch**
```graphql
mutation UpdateBranch($id: UUID!, $input: UpdateBranchInput!) {
  updateBranch(id: $id, input: $input) {
    ...BranchFragment
  }
}

input UpdateBranchInput {
  name: String
  address: String
  phone: String
  status: BranchStatus
}
```

**24. Delete Branch**
```graphql
mutation DeleteBranch($id: UUID!) {
  deleteBranch(id: $id) {
    success
  }
}
```

#### 3.1.6 Department Management Operations (4 endpoints)

**25. Create Department**
```graphql
mutation CreateDepartment($input: CreateDepartmentInput!) {
  createDepartment(input: $input) {
    ...DepartmentFragment
  }
}

input CreateDepartmentInput {
  name: String!
  code: String!
  branchId: UUID!
  description: String
}
```

**26. Get Departments**
```graphql
query GetDepartments($branchId: UUID!, $filter: DepartmentFilterInput) {
  departments(branchId: $branchId, filter: $filter) {
    ...DepartmentFragment
  }
}

input DepartmentFilterInput {
  status: DepartmentStatus
  search: String
}
```

**27. Update Department**
```graphql
mutation UpdateDepartment($id: UUID!, $input: UpdateDepartmentInput!) {
  updateDepartment(id: $id, input: $input) {
    ...DepartmentFragment
  }
}

input UpdateDepartmentInput {
  name: String
  description: String
  status: DepartmentStatus
}
```

**28. Delete Department**
```graphql
mutation DeleteDepartment($id: UUID!) {
  deleteDepartment(id: $id) {
    success
  }
}
```


#### 3.1.7 Business Rule Operations (3 endpoints)

**29. Create Business Rule**
```graphql
mutation CreateBusinessRule($input: CreateBusinessRuleInput!) {
  createBusinessRule(input: $input) {
    ...BusinessRuleFragment
  }
}

input CreateBusinessRuleInput {
  name: String!
  description: String
  ruleType: BusinessRuleType!
  conditions: JSON!
  actions: JSON!
  priority: Int!
  isActive: Boolean!
}

enum BusinessRuleType {
  VALIDATION
  AUTOMATION
  NOTIFICATION
  WORKFLOW
}
```

**30. Get Business Rules**
```graphql
query GetBusinessRules($filter: BusinessRuleFilterInput) {
  businessRules(filter: $filter) {
    ...BusinessRuleFragment
  }
}

input BusinessRuleFilterInput {
  ruleType: BusinessRuleType
  isActive: Boolean
}
```

**31. Update Business Rule**
```graphql
mutation UpdateBusinessRule($id: UUID!, $input: UpdateBusinessRuleInput!) {
  updateBusinessRule(id: $id, input: $input) {
    ...BusinessRuleFragment
  }
}

input UpdateBusinessRuleInput {
  name: String
  description: String
  conditions: JSON
  actions: JSON
  priority: Int
  isActive: Boolean
}
```

#### 3.1.8 Audit Log Operations (3 endpoints)

**32. Get Audit Logs**
```graphql
query GetAuditLogs($filter: AuditLogFilterInput, $limit: Int, $offset: Int) {
  auditLogs(filter: $filter, limit: $limit, offset: $offset) {
    edges {
      ...AuditLogFragment
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      totalCount
    }
  }
}

input AuditLogFilterInput {
  userId: UUID
  action: String
  entityType: String
  entityId: UUID
  startDate: DateTime
  endDate: DateTime
}
```

**33. Get Audit Log by ID**
```graphql
query GetAuditLogById($id: UUID!) {
  auditLog(id: $id) {
    ...AuditLogFragment
  }
}
```

**34. Subscribe to Audit Logs**
```graphql
subscription OnAuditLogCreated($filter: AuditLogFilterInput) {
  auditLogCreated(filter: $filter) {
    ...AuditLogFragment
  }
}
```

#### 3.1.9 Health Check (1 endpoint)

**35. Health Check**
```graphql
query HealthCheck {
  health {
    status
    timestamp
    services {
      name
      status
      responseTime
    }
  }
}
```


#### 3.1.10 GraphQL Fragments

```graphql
fragment UserFragment on User {
  id
  email
  firstName
  lastName
  phone
  status
  organizationId
  branchId
  departmentId
  hierarchyLevel
  permissions {
    ...PermissionFragment
  }
  createdAt
  updatedAt
}

fragment PermissionFragment on Permission {
  id
  name
  description
  module
  action
  hierarchyLevel
  createdAt
  updatedAt
}

fragment OrganizationFragment on Organization {
  id
  name
  code
  status
  createdAt
  updatedAt
}

fragment BranchFragment on Branch {
  id
  name
  code
  organizationId
  address
  phone
  status
  createdAt
  updatedAt
}

fragment DepartmentFragment on Department {
  id
  name
  code
  branchId
  description
  status
  createdAt
  updatedAt
}

fragment BusinessRuleFragment on BusinessRule {
  id
  name
  description
  ruleType
  conditions
  actions
  priority
  isActive
  createdAt
  updatedAt
}

fragment AuditLogFragment on AuditLog {
  id
  userId
  action
  entityType
  entityId
  changes
  ipAddress
  userAgent
  timestamp
}
```

### 3.2 gRPC Service Contracts (9 Services)

#### 3.2.1 Authorization Service (3 methods)

```protobuf
service AuthorizationService {
  // Check if user has specific permission
  rpc CheckPermission(CheckPermissionRequest) returns (CheckPermissionResponse);
  
  // Validate JWT token
  rpc ValidateToken(ValidateTokenRequest) returns (ValidateTokenResponse);
  
  // Get all permissions for a user
  rpc GetUserPermissions(GetUserPermissionsRequest) returns (GetUserPermissionsResponse);
}

message CheckPermissionRequest {
  string user_id = 1;
  string module = 2;
  string action = 3;
}

message CheckPermissionResponse {
  bool has_permission = 1;
  string reason = 2;
}

message ValidateTokenRequest {
  string token = 1;
}

message ValidateTokenResponse {
  bool is_valid = 1;
  string user_id = 2;
  int32 hierarchy_level = 3;
  repeated string permissions = 4;
}

message GetUserPermissionsRequest {
  string user_id = 1;
}

message GetUserPermissionsResponse {
  repeated Permission permissions = 1;
}

message Permission {
  string id = 1;
  string name = 2;
  string module = 3;
  string action = 4;
  int32 hierarchy_level = 5;
}
```


#### 3.2.2 User Service (4 methods)

```protobuf
service UserService {
  // Get user by ID
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  
  // Get user by email
  rpc GetUserByEmail(GetUserByEmailRequest) returns (GetUserResponse);
  
  // List users with filters
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  
  // Update user
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse);
}

message GetUserRequest {
  string user_id = 1;
}

message GetUserByEmailRequest {
  string email = 1;
  string organization_id = 2;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  string organization_id = 1;
  string branch_id = 2;
  string department_id = 3;
  string status = 4;
  int32 hierarchy_level = 5;
  int32 limit = 6;
  int32 offset = 7;
}

message ListUsersResponse {
  repeated User users = 1;
  int32 total_count = 2;
}

message UpdateUserRequest {
  string user_id = 1;
  string first_name = 2;
  string last_name = 3;
  string phone = 4;
  string status = 5;
}

message UpdateUserResponse {
  User user = 1;
}

message User {
  string id = 1;
  string email = 2;
  string first_name = 3;
  string last_name = 4;
  string phone = 5;
  string status = 6;
  string organization_id = 7;
  string branch_id = 8;
  string department_id = 9;
  int32 hierarchy_level = 10;
  repeated Permission permissions = 11;
  string created_at = 12;
  string updated_at = 13;
}
```

#### 3.2.3 Health Service (2 methods)

```protobuf
service HealthService {
  // Check service health
  rpc Check(HealthCheckRequest) returns (HealthCheckResponse);
  
  // Watch service health (streaming)
  rpc Watch(HealthCheckRequest) returns (stream HealthCheckResponse);
}

message HealthCheckRequest {
  string service = 1;
}

message HealthCheckResponse {
  enum ServingStatus {
    UNKNOWN = 0;
    SERVING = 1;
    NOT_SERVING = 2;
    SERVICE_UNKNOWN = 3;
  }
  ServingStatus status = 1;
}
```


---

## 4. Component Interfaces

### 4.1 Custom Hooks

#### 4.1.1 useAuth Hook

```typescript
// web/src/lib/hooks/useAuth.ts
export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AppError | null;

  // Methods
  login: (email: string, password: string, organizationId: string) => Promise<void>;
  loginWithPin: (email: string, pin: string, organizationId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 4.1.2 usePermission Hook

```typescript
// web/src/lib/hooks/usePermissions.ts
export interface UsePermissionReturn {
  hasPermission: (module: PermissionModule, action: PermissionAction) => boolean;
  hasAnyPermission: (permissions: Array<[PermissionModule, PermissionAction]>) => boolean;
  hasAllPermissions: (permissions: Array<[PermissionModule, PermissionAction]>) => boolean;
  hierarchyLevel: number;
  isLoading: boolean;
}

export function usePermission(
  module?: PermissionModule,
  action?: PermissionAction
): UsePermissionReturn & { allowed: boolean } {
  const { user } = useAuth();
  
  const allowed = React.useMemo(() => {
    if (!module || !action || !user) return false;
    return permissionChecker.hasPermission(module, action);
  }, [module, action, user]);

  return {
    allowed,
    hasPermission: permissionChecker.hasPermission,
    hasAnyPermission: permissionChecker.hasAnyPermission,
    hasAllPermissions: permissionChecker.hasAllPermissions,
    hierarchyLevel: permissionChecker.getHierarchyLevel(),
    isLoading: !user,
  };
}
```

#### 4.1.3 useWebSocket Hook

```typescript
// web/src/lib/hooks/useWebSocket.ts
export interface UseWebSocketReturn {
  state: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  isReconnecting: boolean;
  connect: () => void;
  disconnect: () => void;
}

export function useWebSocket(): UseWebSocketReturn {
  const [state, setState] = React.useState<ConnectionState>(
    wsConnectionManager.getState()
  );

  React.useEffect(() => {
    const unsubscribe = wsConnectionManager.onStateChange(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    isReconnecting: state === 'reconnecting',
    connect: () => wsConnectionManager.connect(),
    disconnect: () => wsConnectionManager.disconnect(),
  };
}
```

#### 4.1.4 useSubscription Hook

```typescript
// web/src/lib/hooks/useSubscription.ts
export interface UseSubscriptionOptions<TData, TVariables> {
  query: DocumentNode;
  variables?: TVariables;
  skip?: boolean;
  onData?: (data: TData) => void;
  onError?: (error: Error) => void;
}

export interface UseSubscriptionReturn<TData> {
  data: TData | null;
  loading: boolean;
  error: Error | null;
}

export function useSubscription<TData = any, TVariables = any>(
  options: UseSubscriptionOptions<TData, TVariables>
): UseSubscriptionReturn<TData> {
  const [data, setData] = React.useState<TData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (options.skip) return;

    const client = wsConnectionManager.getClient();
    if (!client) {
      setError(new Error('WebSocket not connected'));
      setLoading(false);
      return;
    }

    const unsubscribe = client.subscribe<TData>(
      {
        query: print(options.query),
        variables: options.variables,
      },
      {
        next: (result) => {
          if (result.data) {
            setData(result.data);
            setLoading(false);
            options.onData?.(result.data);
          }
        },
        error: (err) => {
          setError(err);
          setLoading(false);
          options.onError?.(err);
        },
        complete: () => {
          setLoading(false);
        },
      }
    );

    return () => {
      unsubscribe();
    };
  }, [options.query, options.variables, options.skip]);

  return { data, loading, error };
}
```


### 4.2 Provider Components

#### 4.2.1 AuthProvider

```typescript
// web/src/providers/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenManager } from '@/lib/auth/token-manager';
import { sessionManager } from '@/lib/auth/session-manager';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AppError | null;
  login: (email: string, password: string, organizationId: string) => Promise<void>;
  loginWithPin: (email: string, pin: string, organizationId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    // Initialize auth state from token
    const token = tokenManager.getAccessToken();
    if (token && !tokenManager.isTokenExpired()) {
      const payload = tokenManager.decodeToken();
      if (payload) {
        // Fetch full user data
        fetchUserData(payload.sub);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, organizationId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: { email, password, organizationId },
      });

      const { accessToken, refreshToken, user } = result.data.login;
      tokenManager.setTokens(accessToken, refreshToken);
      setUser(user);
      sessionManager.broadcastEvent('login', { user });
    } catch (err) {
      const appError = errorHandler.handleGraphQLError(err as ApolloError);
      setError(appError);
      throw appError;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apolloClient.mutate({ mutation: LOGOUT_MUTATION });
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      sessionManager.broadcastEvent('logout');
      apolloClient.clearStore();
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithPin: async () => {}, // Implementation similar to login
    logout,
    refreshToken: async () => {}, // Implementation
    changePassword: async () => {}, // Implementation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

#### 4.2.2 ApolloProvider

```typescript
// web/src/providers/ApolloProvider.tsx
'use client';

import React from 'react';
import { ApolloProvider as BaseApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/api/apollo-client';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseApolloProvider client={apolloClient}>
      {children}
    </BaseApolloProvider>
  );
}
```

#### 4.2.3 AppProviders

```typescript
// web/src/providers/AppProviders.tsx
'use client';

import React from 'react';
import { ApolloProvider } from './ApolloProvider';
import { AuthProvider } from './AuthProvider';
import { RootErrorBoundary } from '@/lib/errors/error-boundaries';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <RootErrorBoundary>
      <ApolloProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ApolloProvider>
    </RootErrorBoundary>
  );
}
```


---

## 5. Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### 5.1 Configuration & Setup Properties

**Property 1: Environment Variable Validation**
*For any* application startup, all required environment variables should be validated, and missing or invalid variables should cause startup to fail with clear error messages.
**Validates: Requirements 1.1**

### 5.2 Communication Layer Properties

**Property 2: Bearer Token Injection**
*For any* GraphQL or gRPC request when an access token exists, the request should include the token in the Authorization header as "Bearer <token>".
**Validates: Requirements 2.1, 4.1**

**Property 3: Correlation ID Propagation**
*For any* request (GraphQL, gRPC, or WebSocket), a unique correlation ID should be generated, included in request headers, propagated through all operations, and included in all related logs and errors.
**Validates: Requirements 2.1, 8.2, 8.3**

**Property 4: Exponential Backoff Retry**
*For any* failed request eligible for retry, the retry delays should follow exponential backoff pattern with jitter, and there should be at most 3 retry attempts.
**Validates: Requirements 2.1, 6.3**

**Property 5: Client Error No Retry**
*For any* request that fails with a 4xx status code, the system should not retry the request.
**Validates: Requirements 6.3**

**Property 6: Server Error Retry**
*For any* request that fails with a 5xx status code, the system should retry the request with exponential backoff.
**Validates: Requirements 6.3**

**Property 7: gRPC Connection Pool Limit**
*For any* sequence of gRPC connection requests, the total number of active connections should never exceed 10.
**Validates: Requirements 3.1**

**Property 8: gRPC Error Mapping**
*For any* gRPC status code, there should be a corresponding user-friendly error message.
**Validates: Requirements 3.2**

**Property 9: gRPC Transient Failure Retry**
*For any* gRPC request that fails with UNAVAILABLE or DEADLINE_EXCEEDED status, the system should retry with exponential backoff.
**Validates: Requirements 3.2**

### 5.3 Authentication & Authorization Properties

**Property 10: Access Token Memory Storage**
*For any* point in time during application execution, localStorage and sessionStorage should never contain access tokens.
**Validates: Requirements 4.1**

**Property 11: Token Expiry Detection**
*For any* JWT token, the system should correctly identify whether it is expired based on the exp claim.
**Validates: Requirements 4.1**

**Property 12: JWT Decoding**
*For any* valid JWT token, decoding should extract the correct user context including user ID, email, organization ID, hierarchy level, permissions, and fingerprint.
**Validates: Requirements 4.1**

**Property 13: Token Structure Validation**
*For any* token string, validation should correctly identify whether it has valid JWT structure (header.payload.signature).
**Validates: Requirements 4.1**

**Property 14: Permission Check Correctness**
*For any* module and action combination, the hasPermission method should return true if and only if the user's permissions array contains the corresponding permission string.
**Validates: Requirements 4.3**

**Property 15: Permission Cache Consistency**
*For any* permission check, if the same check is performed within the cache TTL (1 minute), it should return the same result without re-evaluating.
**Validates: Requirements 4.3**

**Property 16: Multi-Tab Auth Synchronization**
*For any* authentication event (login, logout, token refresh) in one browser tab, all other tabs should receive the event via Broadcast Channel and update their state accordingly.
**Validates: Requirements 4.4**

### 5.4 Caching Properties

**Property 17: Cache Normalization**
*For any* entity stored in Apollo cache, it should be normalized with a key in the format "TypeName:id" (e.g., "User:123").
**Validates: Requirements 2.3**

**Property 18: Mutation Cache Update**
*For any* mutation that creates, updates, or deletes an entity, the Apollo cache should automatically reflect the change.
**Validates: Requirements 2.3**

**Property 19: Optimistic Update Timing**
*For any* mutation with optimistic response configured, the cache should be updated immediately before the server responds.
**Validates: Requirements 2.2, 2.3**

### 5.5 WebSocket & Real-Time Properties

**Property 20: WebSocket Reconnection Backoff**
*For any* WebSocket disconnection, reconnection attempts should follow exponential backoff with delays increasing up to a maximum of 30 seconds.
**Validates: Requirements 5.1**

**Property 21: Subscription Replay After Reconnection**
*For any* active subscription when WebSocket disconnects, the subscription should be queued and replayed after successful reconnection.
**Validates: Requirements 5.2**

**Property 22: Subscription Cache Update**
*For any* subscription event received, the Apollo cache should be updated to reflect the changes.
**Validates: Requirements 5.3**

### 5.6 Error Handling Properties

**Property 23: Error Categorization**
*For any* error (GraphQL, gRPC, or network), it should be categorized into one of the defined error categories (AUTHENTICATION, AUTHORIZATION, VALIDATION, NETWORK, SERVER, CLIENT, UNKNOWN).
**Validates: Requirements 6.1**

**Property 24: Validation Error Field Mapping**
*For any* validation error that includes field-specific errors, each field error should be correctly mapped to its corresponding form field.
**Validates: Requirements 6.1**

**Property 25: Error Message User-Friendliness**
*For any* error code, there should be a corresponding user-friendly message that doesn't expose internal implementation details.
**Validates: Requirements 6.1**

**Property 26: Error Logging with Context**
*For any* error that occurs, it should be logged with correlation ID, timestamp, error category, and relevant context.
**Validates: Requirements 6.1, 8.2**

### 5.7 Validation Properties

**Property 27: Email Validation Correctness**
*For any* email string, the validation function should correctly identify valid emails per RFC 5322 and reject invalid formats.
**Validates: Requirements 7.1**

**Property 28: Password Strength Validation**
*For any* password string, the validation function should return true if and only if it contains at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.
**Validates: Requirements 7.1**

**Property 29: PIN Validation Exactness**
*For any* PIN string, the validation function should return true if and only if it contains exactly 6 digits.
**Validates: Requirements 7.1**

**Property 30: Phone Number Validation**
*For any* phone string, the validation function should correctly identify valid international phone numbers in E.164 format.
**Validates: Requirements 7.1**

**Property 31: DTO Validation**
*For any* server response, the DTO validator should correctly validate the structure and reject malformed data.
**Validates: Requirements 7.2**

**Property 32: Timestamp Transformation**
*For any* ISO 8601 timestamp string from the server, it should be transformed into a JavaScript Date object.
**Validates: Requirements 7.2**

**Property 33: Type Guard Correctness**
*For any* object and type guard function, the type guard should return true if and only if the object has all required properties of the expected type.
**Validates: Requirements 7.3**

### 5.8 Monitoring Properties

**Property 34: Request Duration Tracking**
*For any* API request (GraphQL or gRPC), its duration should be tracked and recorded with the endpoint name and correlation ID.
**Validates: Requirements 8.1**

**Property 35: Cache Hit/Miss Tracking**
*For any* cache access, it should be tracked as either a hit or miss with the cache key.
**Validates: Requirements 8.1**

**Property 36: Correlation ID Uniqueness**
*For any* two concurrent requests, their correlation IDs should be unique.
**Validates: Requirements 8.3**


---

## 6. Security Implementation

### 6.1 Token Security

**Storage Strategy**:
- Access tokens: Memory only (never localStorage/sessionStorage)
- Refresh tokens: HttpOnly cookies (set by backend) or memory
- Session data: Memory with Broadcast Channel sync

**Token Lifecycle**:
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days
- Automatic refresh: 5 minutes before expiry
- Token rotation on refresh

**Security Measures**:
- JWT signature validation
- Token expiry checking
- Fingerprint validation
- Automatic logout on fingerprint mismatch

### 6.2 Request Security

**Headers**:
- Authorization: Bearer token on all authenticated requests
- X-Correlation-Id: Unique ID for request tracing
- Content-Type: application/json
- CORS headers: Configured on backend

**HTTPS/WSS**:
- All production traffic over HTTPS
- WebSocket connections over WSS
- Certificate validation enabled

**Input Sanitization**:
- All user input validated with Zod schemas
- XSS protection via React's built-in escaping
- SQL injection prevention (backend responsibility)

### 6.3 Permission Security

**Permission Checking**:
- Permissions decoded from JWT
- Permission checks cached (1-minute TTL)
- Cache cleared on permission change events
- Hierarchical permission enforcement

**Fingerprint Validation**:
- Fingerprint included in JWT
- Validated on each permission check
- Mismatch triggers re-authentication

### 6.4 Session Security

**Session Management**:
- Unique session ID per tab
- Session timeout: 15 minutes of inactivity
- Activity tracking on user interactions
- Automatic logout on timeout

**Multi-Tab Security**:
- Logout in one tab logs out all tabs
- Token refresh synced across tabs
- Permission changes synced across tabs

---

## 7. Performance Optimization

### 7.1 Network Performance

**Request Optimization**:
- Request deduplication (Apollo Client)
- Request batching where applicable
- Connection pooling (gRPC)
- Keep-alive connections

**Caching Strategy**:
- Normalized entity cache
- Cache-and-network fetch policy
- Optimistic updates for instant feedback
- Cache garbage collection

**Code Splitting**:
- Dynamic imports for large dependencies
- Route-based code splitting
- Component lazy loading

### 7.2 Rendering Performance

**React Optimization**:
- Memoization with useMemo/useCallback
- React.memo for expensive components
- Virtual scrolling for long lists
- Debouncing for search inputs

**Bundle Optimization**:
- Tree shaking for unused code
- Minification in production
- Compression (gzip/brotli)
- Asset optimization

### 7.3 Real-Time Performance

**WebSocket Optimization**:
- Connection reuse
- Message batching
- Heartbeat optimization (30s interval)
- Automatic reconnection with backoff

**Subscription Management**:
- Subscription cleanup on unmount
- Subscription deduplication
- Selective subscription updates

### 7.4 Performance Targets

**Load Time**:
- Initial page load: < 3 seconds
- Time to interactive: < 5 seconds
- First contentful paint: < 1.5 seconds

**Response Time**:
- GraphQL queries: < 500ms
- gRPC calls: < 200ms
- WebSocket connection: < 1 second
- Token refresh: < 500ms

**Cache Performance**:
- Cache hit rate: > 70%
- Cache lookup time: < 10ms

---

## 8. Testing Strategy

### 8.1 Testing Approach

**Dual Testing Strategy**:
- **Unit Tests**: Specific examples, edge cases, error conditions
- **Property-Based Tests**: Universal properties across all inputs
- Both are complementary and necessary for comprehensive coverage

### 8.2 Unit Testing

**Focus Areas**:
- Specific authentication flows (login, logout, refresh)
- Error boundary fallback rendering
- Component integration points
- Edge cases (empty inputs, null values, boundary conditions)
- Mock server responses

**Testing Library**:
- Jest for test runner
- React Testing Library for component tests
- MSW (Mock Service Worker) for API mocking

**Example Unit Tests**:
```typescript
describe('TokenManager', () => {
  it('should clear tokens on logout', () => {
    tokenManager.setTokens('access', 'refresh');
    tokenManager.clearTokens();
    expect(tokenManager.getAccessToken()).toBeNull();
  });

  it('should detect expired tokens', () => {
    const expiredToken = createExpiredToken();
    tokenManager.setTokens(expiredToken);
    expect(tokenManager.isTokenExpired()).toBe(true);
  });
});
```

### 8.3 Property-Based Testing

**Testing Library**: fast-check (JavaScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Seed-based reproducibility
- Shrinking for minimal failing examples

**Property Test Structure**:
```typescript
import fc from 'fast-check';

describe('Property: Email Validation', () => {
  it('should validate emails correctly', () => {
    // Feature: foundation-layer, Property 27: Email Validation Correctness
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should reject invalid emails', () => {
    // Feature: foundation-layer, Property 27: Email Validation Correctness
    fc.assert(
      fc.property(
        fc.string().filter(s => !s.includes('@')),
        (invalidEmail) => {
          const result = emailSchema.safeParse(invalidEmail);
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### 8.4 Integration Testing

**Focus Areas**:
- Apollo Client link chain
- Authentication flow end-to-end
- WebSocket connection lifecycle
- Cache update propagation
- Multi-tab synchronization

**Testing Approach**:
- Real GraphQL server (test environment)
- Real WebSocket connections
- Real browser APIs (Broadcast Channel)

### 8.5 Test Coverage Requirements

**Coverage Targets**:
- Critical paths: 100% coverage
- Authentication/Authorization: 100% coverage
- Error handling: 100% coverage
- Validation: 100% coverage
- Overall: > 80% coverage

**Critical Paths**:
- Login/logout flows
- Token refresh
- Permission checking
- Error handling
- Cache updates

### 8.6 Property Test Mapping

Each correctness property from Section 5 must be implemented as a property-based test:

**Property 1-9**: Communication layer properties
**Property 10-16**: Authentication & authorization properties
**Property 17-19**: Caching properties
**Property 20-22**: WebSocket & real-time properties
**Property 23-26**: Error handling properties
**Property 27-33**: Validation properties
**Property 34-36**: Monitoring properties

**Test Tag Format**:
```typescript
// Feature: foundation-layer, Property 27: Email Validation Correctness
```

### 8.7 Test Organization

```
web/src/
├── __tests__/
│   ├── unit/
│   │   ├── auth/
│   │   │   ├── token-manager.test.ts
│   │   │   ├── permission-checker.test.ts
│   │   │   └── session-manager.test.ts
│   │   ├── api/
│   │   │   ├── apollo-client.test.ts
│   │   │   └── grpc-client.test.ts
│   │   ├── validation/
│   │   │   ├── input-validators.test.ts
│   │   │   └── dto-validators.test.ts
│   │   └── errors/
│   │       ├── error-handler.test.ts
│   │       └── error-boundaries.test.tsx
│   ├── properties/
│   │   ├── communication.properties.test.ts
│   │   ├── authentication.properties.test.ts
│   │   ├── caching.properties.test.ts
│   │   ├── websocket.properties.test.ts
│   │   ├── error-handling.properties.test.ts
│   │   ├── validation.properties.test.ts
│   │   └── monitoring.properties.test.ts
│   └── integration/
│       ├── auth-flow.integration.test.ts
│       ├── cache-updates.integration.test.ts
│       └── websocket-lifecycle.integration.test.ts
```

### 8.8 Continuous Testing

**Pre-commit**:
- Run unit tests
- Run linting
- Type checking

**CI Pipeline**:
- Run all unit tests
- Run all property tests
- Run integration tests
- Generate coverage report
- Fail if coverage < 80%

**Test Execution**:
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run property tests only
npm run test:properties

# Run integration tests only
npm run test:integration

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

---

## 9. Implementation Notes

### 9.1 Development Workflow

1. **Setup Phase**:
   - Install dependencies
   - Configure environment variables
   - Set up type generation
   - Configure Apollo Client

2. **Development Phase**:
   - Implement communication layers
   - Implement authentication system
   - Implement caching strategy
   - Implement error handling
   - Implement validation
   - Implement monitoring

3. **Testing Phase**:
   - Write unit tests
   - Write property tests
   - Write integration tests
   - Verify coverage

4. **Integration Phase**:
   - Wire all components together
   - Test end-to-end flows
   - Performance testing
   - Security audit

### 9.2 Code Quality Standards

**TypeScript**:
- Strict mode enabled
- No 'any' types in production code
- Explicit return types for functions
- Proper error handling

**Code Style**:
- ESLint configuration enforced
- Prettier for formatting
- Consistent naming conventions
- Comprehensive JSDoc comments

**Git Workflow**:
- Feature branches
- Pull request reviews
- Conventional commits
- Semantic versioning

### 9.3 Documentation Requirements

**Code Documentation**:
- JSDoc for all public APIs
- Inline comments for complex logic
- Type definitions with descriptions
- Usage examples

**Developer Documentation**:
- Setup instructions
- Architecture overview
- API reference
- Testing guide
- Troubleshooting guide

### 9.4 Monitoring & Observability

**Development**:
- Console logging with levels
- Dev tools panel
- Request/response inspection
- Cache inspection

**Production**:
- Error tracking service integration
- Performance monitoring
- User analytics
- Correlation ID tracing

---

## 10. Appendix

### 10.1 Glossary

- **Apollo Client**: GraphQL client library for React
- **gRPC**: High-performance RPC framework
- **JWT**: JSON Web Token for authentication
- **WebSocket**: Protocol for real-time bidirectional communication
- **Correlation ID**: Unique identifier for request tracing
- **Fingerprint**: Unique identifier for permission validation
- **Hierarchy Level**: User's position in organizational hierarchy (1-10)
- **Property-Based Testing**: Testing approach that verifies properties across many generated inputs

### 10.2 References

- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [gRPC Documentation](https://grpc.io/docs/)
- [GraphQL Specification](https://spec.graphql.org/)
- [JWT Specification](https://datatracker.ietf.org/doc/html/rfc7519)
- [WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [Zod Documentation](https://zod.dev/)
- [fast-check Documentation](https://fast-check.dev/)

### 10.3 Change Log

- **Version 1.0** (Initial): Complete foundation layer design
  - Communication layer architecture
  - Authentication & authorization system
  - Caching strategy
  - Error handling
  - Validation system
  - Monitoring & observability
  - 36 correctness properties
  - Comprehensive testing strategy

---

**End of Design Document**
