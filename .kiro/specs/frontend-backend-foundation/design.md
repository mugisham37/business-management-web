# Design Document: Frontend-Backend Foundation Layer

## Overview

This design document specifies the architecture and implementation details for a comprehensive foundation layer connecting a Next.js 15 (App Router) frontend with a NestJS backend server. The foundation provides type-safe API communication, secure JWT-based authentication, permission-based access control, and robust error handling across 34 REST API endpoints.

The foundation layer follows a layered architecture pattern:
- **Type Layer**: Complete TypeScript definitions for all API interactions
- **Client Layer**: Configured Axios instance with interceptors for token management
- **Service Layer**: Typed API service functions organized by domain
- **State Layer**: React Context providers for global authentication and organization state
- **Hook Layer**: Custom React hooks for common operations
- **Middleware Layer**: Next.js middleware for route protection
- **Utility Layer**: Helper functions for common operations

### Key Design Principles

1. **Security First**: Access tokens in memory, refresh tokens in httpOnly cookies
2. **Type Safety**: Complete TypeScript coverage with runtime validation for critical paths
3. **Separation of Concerns**: Clear boundaries between layers
4. **Developer Experience**: Intuitive APIs with comprehensive hooks
5. **Performance**: Request deduplication, caching, and optimistic updates
6. **Testability**: Pure functions and dependency injection where appropriate

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
├─────────────────────────────────────────────────────────────┤
│  Components & Pages                                          │
│    ↓ use hooks                                               │
│  Custom Hooks (useAuth, useApi, usePermissions, etc.)       │
│    ↓ consume context                                         │
│  Context Providers (AuthContext, OrganizationContext)       │
│    ↓ call services                                           │
│  API Services (auth.api, users.api, roles.api, etc.)       │
│    ↓ use client                                              │
│  API Client (Axios with interceptors)                       │
│    ↓ HTTP requests                                           │
├─────────────────────────────────────────────────────────────┤
│                     Network Layer                            │
├─────────────────────────────────────────────────────────────┤
│                     NestJS Backend                           │
│  34 REST API Endpoints across 5 modules                     │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
web/src/
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios instance configuration
│   │   ├── interceptors.ts        # Request/response interceptors
│   │   ├── endpoints.ts           # API endpoint constants
│   │   └── services/
│   │       ├── auth.api.ts        # Authentication endpoints
│   │       ├── mfa.api.ts         # MFA endpoints
│   │       ├── users.api.ts       # User management endpoints
│   │       ├── roles.api.ts       # Role management endpoints
│   │       └── sessions.api.ts    # Session management endpoints
│   ├── auth/
│   │   ├── token-manager.ts       # Token storage and management
│   │   ├── auth-context.tsx       # Authentication context provider
│   │   └── permissions.ts         # Permission checking utilities
│   ├── utils/
│   │   ├── error-handler.ts       # Error handling utilities
│   │   ├── storage.ts             # Secure storage utilities
│   │   ├── validators.ts          # Validation helpers
│   │   └── formatters.ts          # Formatting utilities
│   └── constants/
│       ├── api.ts                 # API configuration constants
│       ├── auth.ts                # Auth-related constants
│       └── permissions.ts         # Permission name constants
├── hooks/
│   ├── useAuth.ts                 # Authentication hook
│   ├── useApi.ts                  # API call hook with state
│   ├── usePermissions.ts          # Permission checking hook
│   ├── useSession.ts              # Session management hook
│   └── useOrganization.ts         # Organization context hook
├── types/
│   ├── api/
│   │   ├── requests.ts            # API request types
│   │   ├── responses.ts           # API response types
│   │   └── common.ts              # Common API types
│   ├── auth.ts                    # Enhanced auth types
│   ├── user.ts                    # User domain types
│   ├── organization.ts            # Organization types
│   ├── role.ts                    # Role and permission types
│   └── session.ts                 # Session types
├── middleware.ts                  # Next.js route protection
└── components/
    └── providers/
        └── AppProviders.tsx       # Root provider wrapper
```


## Components and Interfaces

### 1. Type System

#### API Request Types

All request types follow a consistent pattern with required and optional fields:

```typescript
// Authentication requests
interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface TeamMemberLoginRequest {
  email: string;
  password: string;
  organizationId: string;
}

interface MfaLoginRequest {
  tempToken: string;
  code: string;
}

interface PasswordResetRequestRequest {
  email: string;
}

interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// MFA requests
interface MfaEnableRequest {
  code: string;
}

interface MfaDisableRequest {
  code: string;
}

// User management requests
interface InviteUserRequest {
  email: string;
  roleId: string;
  firstName?: string;
  lastName?: string;
}

interface RegisterInvitationRequest {
  token: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

// Role management requests
interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

interface AssignPermissionsRequest {
  permissions: string[];
}

interface AssignRoleRequest {
  userId: string;
}
```

#### API Response Types

All responses are wrapped in a standardized format:

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Authentication responses
interface AuthResponse {
  accessToken: string;
  user: User;
}

interface MfaSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface MfaStatusResponse {
  enabled: boolean;
  backupCodesRemaining: number;
}

interface BackupCodesResponse {
  backupCodes: string[];
}

// User responses
interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleId: string;
  role: Role;
  isActive: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserHierarchyResponse {
  user: UserResponse;
  createdUsers: UserResponse[];
  depth: number;
}

// Role responses
interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}

// Session responses
interface SessionResponse {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  createdAt: string;
  expiresAt: string;
}
```


#### Domain Types

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string; // computed: firstName + lastName
  organizationId: string;
  organization?: Organization;
  roleId: string;
  role: Role;
  isActive: boolean;
  isSuspended: boolean;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Organization {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

interface Session {
  id: string;
  userId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: Date;
  createdAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

interface JwtPayload {
  sub: string; // user ID
  email: string;
  organizationId: string;
  roleId: string;
  permissions: string[];
  iat: number;
  exp: number;
}
```

### 2. API Client Layer

#### Axios Instance Configuration

```typescript
// lib/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { setupInterceptors } from './interceptors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TIMEOUT = 30000; // 30 seconds

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set');
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for httpOnly cookies
});

// Setup request/response interceptors
setupInterceptors(apiClient);

export default apiClient;
```

#### Interceptor Design

The interceptor system handles:
1. **Request Interceptor**: Adds access token to Authorization header
2. **Response Interceptor**: Handles token refresh on 401 errors
3. **Error Interceptor**: Transforms errors into user-friendly format

```typescript
// lib/api/interceptors.ts
import { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { TokenManager } from '../auth/token-manager';
import { handleApiError } from '../utils/error-handler';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token!);
    }
  });
  failedQueue = [];
};

export function setupInterceptors(client: AxiosInstance) {
  // Request interceptor: Add access token
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = TokenManager.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor: Handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

      // If error is 401 and we haven't retried yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue the request while refresh is in progress
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return client(originalRequest);
            })
            .catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh the token
          const newAccessToken = await TokenManager.refreshAccessToken();
          processQueue(null, newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return client(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          TokenManager.clearTokens();
          window.location.href = '/auth/login';
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(handleApiError(error));
    }
  );
}
```


### 3. Token Management

The Token Manager provides secure storage and management of JWT tokens following security best practices.

```typescript
// lib/auth/token-manager.ts
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';
import apiClient from '../api/client';
import { JwtPayload } from '@/types/auth';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

class TokenManagerClass {
  private accessToken: string | null = null;

  // Get access token from memory
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Set access token in memory
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  // Clear all tokens
  clearTokens(): void {
    this.accessToken = null;
    Cookies.remove(REFRESH_TOKEN_COOKIE);
  }

  // Decode JWT without validation (validation happens on backend)
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded) return true;
    
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  }

  // Get user info from access token
  getUserFromToken(): JwtPayload | null {
    if (!this.accessToken) return null;
    return this.decodeToken(this.accessToken);
  }

  // Refresh access token using refresh token cookie
  async refreshAccessToken(): Promise<string> {
    const response = await apiClient.post('/auth/refresh');
    const { accessToken } = response.data.data;
    this.setAccessToken(accessToken);
    return accessToken;
  }

  // Initialize session from refresh token
  async initializeSession(): Promise<boolean> {
    try {
      const newAccessToken = await this.refreshAccessToken();
      return !!newAccessToken;
    } catch {
      this.clearTokens();
      return false;
    }
  }
}

export const TokenManager = new TokenManagerClass();
```

### 4. Authentication Context

The Auth Context provides global authentication state and methods throughout the application.

```typescript
// lib/auth/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TokenManager } from './token-manager';
import { authApi } from '../api/services/auth.api';
import { User, JwtPayload } from '@/types/auth';
import { LoginRequest, RegisterRequest } from '@/types/api/requests';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const success = await TokenManager.initializeSession();
      if (success) {
        await loadUser();
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUser = async () => {
    const tokenPayload = TokenManager.getUserFromToken();
    if (!tokenPayload) {
      setUser(null);
      return;
    }

    try {
      // Fetch full user details
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      setUser(null);
    }
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    const response = await authApi.login(credentials);
    TokenManager.setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      TokenManager.clearTokens();
      setUser(null);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    TokenManager.setAccessToken(response.data.accessToken);
    setUser(response.data.user);
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
```


### 5. API Service Layer

Each service module provides typed functions for related endpoints.

```typescript
// lib/api/services/auth.api.ts
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  RegisterRequest,
  LoginRequest,
  TeamMemberLoginRequest,
  MfaLoginRequest,
  PasswordResetRequestRequest,
  PasswordResetConfirmRequest,
  ChangePasswordRequest,
} from '@/types/api/requests';
import {
  ApiResponse,
  AuthResponse,
} from '@/types/api/responses';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.REGISTER, data),

  verifyEmail: (token: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  resendVerification: (email: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email }),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN, data),

  loginTeamMember: (data: TeamMemberLoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN_TEAM_MEMBER, data),

  loginMfa: (data: MfaLoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.AUTH.LOGIN_MFA, data),

  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string }>>(API_ENDPOINTS.AUTH.REFRESH),

  logout: () =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT),

  logoutAll: () =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.LOGOUT_ALL),

  requestPasswordReset: (data: PasswordResetRequestRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.PASSWORD_RESET_REQUEST, data),

  confirmPasswordReset: (data: PasswordResetConfirmRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.PASSWORD_RESET_CONFIRM, data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),

  getCurrentUser: () =>
    apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.ME),
};

// lib/api/services/mfa.api.ts
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  MfaEnableRequest,
  MfaDisableRequest,
} from '@/types/api/requests';
import {
  ApiResponse,
  MfaSetupResponse,
  MfaStatusResponse,
  BackupCodesResponse,
} from '@/types/api/responses';

export const mfaApi = {
  setup: () =>
    apiClient.post<ApiResponse<MfaSetupResponse>>(API_ENDPOINTS.MFA.SETUP),

  enable: (data: MfaEnableRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.MFA.ENABLE, data),

  disable: (data: MfaDisableRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.MFA.DISABLE, data),

  getStatus: () =>
    apiClient.get<ApiResponse<MfaStatusResponse>>(API_ENDPOINTS.MFA.STATUS),

  regenerateBackupCodes: () =>
    apiClient.post<ApiResponse<BackupCodesResponse>>(API_ENDPOINTS.MFA.REGENERATE_BACKUP_CODES),
};

// lib/api/services/users.api.ts
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  InviteUserRequest,
  RegisterInvitationRequest,
  UpdateUserRequest,
} from '@/types/api/requests';
import {
  ApiResponse,
  UserResponse,
  UserHierarchyResponse,
} from '@/types/api/responses';

export const usersApi = {
  invite: (data: InviteUserRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.USERS.INVITE, data),

  registerInvitation: (data: RegisterInvitationRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>(API_ENDPOINTS.USERS.REGISTER_INVITATION, data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<UserResponse>>(API_ENDPOINTS.USERS.GET_BY_ID(id)),

  update: (id: string, data: UpdateUserRequest) =>
    apiClient.patch<ApiResponse<UserResponse>>(API_ENDPOINTS.USERS.UPDATE(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.USERS.DELETE(id)),

  suspend: (id: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.USERS.SUSPEND(id)),

  reactivate: (id: string) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.USERS.REACTIVATE(id)),

  getHierarchy: (id: string) =>
    apiClient.get<ApiResponse<UserHierarchyResponse>>(API_ENDPOINTS.USERS.HIERARCHY(id)),

  getCreatedUsers: (id: string) =>
    apiClient.get<ApiResponse<UserResponse[]>>(API_ENDPOINTS.USERS.CREATED_USERS(id)),
};

// lib/api/services/roles.api.ts
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  AssignRoleRequest,
} from '@/types/api/requests';
import {
  ApiResponse,
  RoleResponse,
} from '@/types/api/responses';

export const rolesApi = {
  create: (data: CreateRoleRequest) =>
    apiClient.post<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.CREATE, data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.GET_BY_ID(id)),

  update: (id: string, data: UpdateRoleRequest) =>
    apiClient.patch<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.UPDATE(id), data),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.ROLES.DELETE(id)),

  assignPermissions: (id: string, data: AssignPermissionsRequest) =>
    apiClient.post<ApiResponse<RoleResponse>>(API_ENDPOINTS.ROLES.ASSIGN_PERMISSIONS(id), data),

  assignRole: (id: string, data: AssignRoleRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.ROLES.ASSIGN_ROLE(id), data),
};

// lib/api/services/sessions.api.ts
import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import {
  ApiResponse,
  SessionResponse,
} from '@/types/api/responses';

export const sessionsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<SessionResponse[]>>(API_ENDPOINTS.SESSIONS.GET_ALL),

  delete: (id: string) =>
    apiClient.delete<ApiResponse<void>>(API_ENDPOINTS.SESSIONS.DELETE(id)),
};
```


### 6. Custom React Hooks

```typescript
// hooks/useAuth.ts
import { useAuthContext } from '@/lib/auth/auth-context';

export function useAuth() {
  return useAuthContext();
}

// hooks/useApi.ts
import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api/responses';

interface UseApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

interface UseApiReturn<T, Args extends any[]> extends UseApiState<T> {
  execute: (...args: Args) => Promise<T>;
  reset: () => void;
}

export function useApi<T, Args extends any[]>(
  apiFunction: (...args: Args) => Promise<{ data: { data: T } }>
): UseApiReturn<T, Args> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      setState({ data: null, error: null, isLoading: true });
      
      try {
        const response = await apiFunction(...args);
        const data = response.data.data;
        setState({ data, error: null, isLoading: false });
        return data;
      } catch (err) {
        const error = err as AxiosError<ApiError>;
        const apiError = error.response?.data || {
          statusCode: 500,
          message: 'An unexpected error occurred',
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
        };
        setState({ data: null, error: apiError, isLoading: false });
        throw apiError;
      }
    },
    [apiFunction]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, execute, reset };
}

// hooks/usePermissions.ts
import { useAuth } from './useAuth';
import { checkPermission, checkAnyPermission, checkAllPermissions } from '@/lib/auth/permissions';

export function usePermissions() {
  const { user } = useAuth();

  return {
    hasPermission: (permission: string) => checkPermission(user, permission),
    hasAnyPermission: (permissions: string[]) => checkAnyPermission(user, permissions),
    hasAllPermissions: (permissions: string[]) => checkAllPermissions(user, permissions),
    permissions: user?.role?.permissions?.map(p => p.name) || [],
  };
}

// hooks/useSession.ts
import { useState, useEffect } from 'react';
import { sessionsApi } from '@/lib/api/services/sessions.api';
import { Session } from '@/types/session';
import { useApi } from './useApi';

export function useSession() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const { execute: fetchSessions, isLoading } = useApi(sessionsApi.getAll);
  const { execute: deleteSession } = useApi(sessionsApi.delete);

  const loadSessions = async () => {
    try {
      const data = await fetchSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      await loadSessions();
    } catch (error) {
      console.error('Failed to revoke session:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  return {
    sessions,
    isLoading,
    refreshSessions: loadSessions,
    revokeSession,
  };
}

// hooks/useOrganization.ts
import { useAuth } from './useAuth';

export function useOrganization() {
  const { user } = useAuth();

  return {
    organization: user?.organization || null,
    organizationId: user?.organizationId || null,
    isOwner: user?.organization?.ownerId === user?.id,
  };
}
```

### 7. Permission System

```typescript
// lib/auth/permissions.ts
import { User } from '@/types/auth';

export function checkPermission(user: User | null, permission: string): boolean {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return user.role.permissions.some(p => p.name === permission);
}

export function checkAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return permissions.some(permission =>
    user.role.permissions.some(p => p.name === permission)
  );
}

export function checkAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user || !user.role || !user.role.permissions) {
    return false;
  }

  return permissions.every(permission =>
    user.role.permissions.some(p => p.name === permission)
  );
}

// React component for conditional rendering
export function PermissionGate({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  let hasAccess = false;

  if (permission) {
    hasAccess = checkPermission(user, permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? checkAllPermissions(user, permissions)
      : checkAnyPermission(user, permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
```


### 8. Route Protection Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/verify-email', '/auth/reset-password'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];
const PROTECTED_ROUTES = ['/dashboard', '/settings', '/users', '/roles'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get refresh token from cookies
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // Check if user is authenticated
  const isAuthenticated = !!refreshToken;

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect authenticated routes
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
```

### 9. Error Handling

```typescript
// lib/utils/error-handler.ts
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api/responses';

export function handleApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response) {
    // Server responded with error
    return error.response.data;
  } else if (error.request) {
    // Request made but no response
    return {
      statusCode: 0,
      message: 'Network error. Please check your connection.',
      error: 'NetworkError',
      timestamp: new Date().toISOString(),
    };
  } else {
    // Error setting up request
    return {
      statusCode: 0,
      message: error.message || 'An unexpected error occurred',
      error: 'UnknownError',
      timestamp: new Date().toISOString(),
    };
  }
}

export function getErrorMessage(error: ApiError): string {
  if (Array.isArray(error.message)) {
    return error.message.join(', ');
  }
  return error.message;
}

export function isValidationError(error: ApiError): boolean {
  return error.statusCode === 400;
}

export function isAuthError(error: ApiError): boolean {
  return error.statusCode === 401;
}

export function isForbiddenError(error: ApiError): boolean {
  return error.statusCode === 403;
}

export function isNotFoundError(error: ApiError): boolean {
  return error.statusCode === 404;
}

export function isServerError(error: ApiError): boolean {
  return error.statusCode >= 500;
}
```

### 10. Constants

```typescript
// lib/constants/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// lib/constants/auth.ts
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_COOKIE: 'refresh_token',
  ACCESS_TOKEN_EXPIRY: 15 * 60, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60, // 7 days in seconds
} as const;

export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_EMAIL: '/auth/verify-email',
  RESET_PASSWORD: '/auth/reset-password',
  DASHBOARD: '/dashboard',
  UNAUTHORIZED: '/unauthorized',
} as const;

// lib/constants/permissions.ts
export const PERMISSIONS = {
  // User permissions
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_SUSPEND: 'users:suspend',
  
  // Role permissions
  ROLES_VIEW: 'roles:view',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  ROLES_ASSIGN: 'roles:assign',
  
  // Session permissions
  SESSIONS_VIEW: 'sessions:view',
  SESSIONS_DELETE: 'sessions:delete',
  
  // Organization permissions
  ORGANIZATION_UPDATE: 'organization:update',
  ORGANIZATION_DELETE: 'organization:delete',
} as const;

// lib/api/endpoints.ts
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    LOGIN: '/auth/login',
    LOGIN_TEAM_MEMBER: '/auth/login/team-member',
    LOGIN_MFA: '/auth/login/mfa',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    LOGOUT_ALL: '/auth/logout-all',
    PASSWORD_RESET_REQUEST: '/auth/password-reset/request',
    PASSWORD_RESET_CONFIRM: '/auth/password-reset/confirm',
    CHANGE_PASSWORD: '/auth/password/change',
    ME: '/auth/me',
  },
  MFA: {
    SETUP: '/mfa/setup',
    ENABLE: '/mfa/enable',
    DISABLE: '/mfa/disable',
    STATUS: '/mfa/status',
    REGENERATE_BACKUP_CODES: '/mfa/backup-codes/regenerate',
  },
  USERS: {
    INVITE: '/users/invite',
    REGISTER_INVITATION: '/users/register/invitation',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    SUSPEND: (id: string) => `/users/${id}/suspend`,
    REACTIVATE: (id: string) => `/users/${id}/reactivate`,
    HIERARCHY: (id: string) => `/users/${id}/hierarchy`,
    CREATED_USERS: (id: string) => `/users/${id}/created-users`,
  },
  ROLES: {
    CREATE: '/roles',
    GET_BY_ID: (id: string) => `/roles/${id}`,
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    ASSIGN_PERMISSIONS: (id: string) => `/roles/${id}/permissions`,
    ASSIGN_ROLE: (id: string) => `/roles/${id}/assign`,
  },
  SESSIONS: {
    GET_ALL: '/sessions',
    DELETE: (id: string) => `/sessions/${id}`,
  },
} as const;
```


### 11. Utility Functions

```typescript
// lib/utils/formatters.ts
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(d);
}

// lib/utils/validators.ts
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special char
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}

// lib/utils/storage.ts
export function safeGetNestedProperty<T>(obj: any, path: string, defaultValue: T): T {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }

  return result as T;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
```

## Data Models

### User Model

The User model represents an authenticated user in the system:

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique email address
  firstName: string;             // User's first name
  lastName: string;              // User's last name
  fullName: string;              // Computed: firstName + lastName
  organizationId: string;        // UUID of organization
  organization?: Organization;   // Optional populated organization
  roleId: string;                // UUID of assigned role
  role: Role;                    // Populated role with permissions
  isActive: boolean;             // Account active status
  isSuspended: boolean;          // Account suspension status
  emailVerified: boolean;        // Email verification status
  mfaEnabled: boolean;           // MFA enabled status
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Organization Model

```typescript
interface Organization {
  id: string;           // UUID
  name: string;         // Organization name
  ownerId: string;      // UUID of owner user
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

### Role Model

```typescript
interface Role {
  id: string;                // UUID
  name: string;              // Role name (e.g., "Admin", "Member")
  description: string | null; // Optional description
  organizationId: string;    // UUID of organization
  permissions: Permission[]; // Array of permissions
  isSystemRole: boolean;     // Whether this is a system-defined role
  createdAt: Date;           // Creation timestamp
  updatedAt: Date;           // Last update timestamp
}
```

### Permission Model

```typescript
interface Permission {
  id: string;          // UUID
  name: string;        // Permission name (e.g., "users:create")
  description: string; // Human-readable description
  resource: string;    // Resource type (e.g., "users")
  action: string;      // Action type (e.g., "create")
}
```

### Session Model

```typescript
interface Session {
  id: string;          // UUID
  userId: string;      // UUID of user
  deviceInfo: string;  // Device information
  ipAddress: string;   // IP address
  lastActivity: Date;  // Last activity timestamp
  createdAt: Date;     // Session creation timestamp
  expiresAt: Date;     // Session expiration timestamp
  isCurrent: boolean;  // Whether this is the current session
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following categories:
- **Examples**: Specific test cases for configuration, setup, and discrete behaviors (e.g., dependency versions, specific error codes)
- **Properties**: Universal rules that apply across all inputs (e.g., token handling, serialization, validation)
- **Non-testable**: Implementation details or subjective requirements (e.g., code organization, performance optimization)

**Redundancy Analysis:**
- Requirements 3.5, 3.6, 3.7, 4.4, and 9.3 all relate to 401 error handling and token refresh - consolidated into Property 1
- Requirements 2.5 and 16.1 both address API response wrapping - consolidated into Property 2
- Requirements 4.6 and 4.7 both relate to JWT token operations - consolidated into Property 3
- Requirements 18.1-18.7 are all utility functions - consolidated into Properties 11-17
- Requirements 20.1-20.4 are all serialization rules - consolidated into Properties 18-21

### Core Properties

**Property 1: Token Refresh and Retry**
*For any* authenticated API request that receives a 401 response, the system SHALL attempt to refresh the access token using the refresh token, and if successful, SHALL retry the original request with the new token.
**Validates: Requirements 3.5, 3.6, 3.7, 4.4, 9.3**

**Property 2: API Response Wrapping**
*For any* API response received from the backend, the response SHALL be wrapped in a standardized ApiResponse<T> structure containing data, optional message, and timestamp fields.
**Validates: Requirements 2.5, 16.1**

**Property 3: JWT Token Operations**
*For any* valid JWT token, the Token_Manager SHALL correctly decode the token to extract payload information and SHALL accurately determine if the token is expired based on the exp claim compared to current time.
**Validates: Requirements 4.6, 4.7**

**Property 4: Authorization Header Injection**
*For any* API request when an access token is present in memory, the API_Client SHALL include the token in the Authorization header with Bearer scheme.
**Validates: Requirements 3.3**

**Property 5: Content-Type Header**
*For any* API request, the API_Client SHALL include Content-Type: application/json header.
**Validates: Requirements 3.4**

**Property 6: Request Deduplication**
*For any* set of concurrent identical API requests (same method, URL, and body), the API_Client SHALL send only one actual HTTP request and share the response with all callers.
**Validates: Requirements 3.8**

**Property 7: Authentication State Propagation**
*For any* change to authentication state (login, logout, token refresh), the Auth_Context SHALL notify all subscribed React components, triggering re-renders with updated state.
**Validates: Requirements 5.5, 7.7**

**Property 8: Service Function Type Safety**
*For any* API service function call, the function SHALL return a Promise that resolves to the correctly typed response data matching the endpoint's response schema.
**Validates: Requirements 6.6**

**Property 9: Service Function Error Handling**
*For any* API service function that encounters an error, the function SHALL throw a typed ApiError object containing statusCode, message, error, and timestamp fields.
**Validates: Requirements 6.7**

**Property 10: Hook Cleanup**
*For any* custom React hook with side effects (subscriptions, timers, API calls), the hook SHALL return a cleanup function that is executed when the component unmounts, preventing memory leaks.
**Validates: Requirements 7.6**

**Property 11: Protected Route Validation**
*For any* request to access a protected route, the middleware SHALL validate the presence and validity of authentication tokens before allowing access.
**Validates: Requirements 8.5**

**Property 12: Error Logging**
*For any* error that occurs in the application (API errors, validation errors, network errors), the system SHALL log detailed error information to the console including error type, message, and stack trace.
**Validates: Requirements 9.7**

**Property 13: Unauthenticated Permission Checks**
*For any* permission check performed when no user is authenticated, the permission checking functions SHALL return false regardless of the permission being checked.
**Validates: Requirements 10.5**

**Property 14: Organization Context Access**
*For any* access to the organization context, the context SHALL return either the current user's organization object or null if no user is authenticated.
**Validates: Requirements 13.3**

**Property 15: Organization ID in Requests**
*For any* API request that requires organization context, the request SHALL include the organization ID from the authenticated user's organization.
**Validates: Requirements 13.4**

**Property 16: Idempotent Request Retry**
*For any* failed API request using idempotent HTTP methods (GET, PUT, DELETE), the API_Client SHALL retry the request, while POST requests SHALL NOT be retried to prevent duplicate operations.
**Validates: Requirements 14.3, 14.4**

**Property 17: Client Error No Retry**
*For any* API request that fails with a 4xx client error status code (except 401), the API_Client SHALL NOT retry the request.
**Validates: Requirements 14.6**

**Property 18: Environment Variable Validation**
*For any* missing required environment variable, the application SHALL throw a descriptive error message indicating which variable is missing and why it's needed.
**Validates: Requirements 15.5**

**Property 19: Unexpected Response Handling**
*For any* API response that doesn't match the expected data structure, the system SHALL handle the mismatch gracefully by either using default values or throwing a descriptive validation error.
**Validates: Requirements 16.5**

**Property 20: Date Formatting Consistency**
*For any* date value (Date object or ISO string), the formatting utilities SHALL produce consistent, locale-appropriate string representations.
**Validates: Requirements 18.1**

**Property 21: Name Formatting**
*For any* pair of first name and last name strings, the formatFullName utility SHALL concatenate them with a space, trimming any extra whitespace.
**Validates: Requirements 18.2**

**Property 22: Email Validation**
*For any* string input, the email validator SHALL correctly identify whether it matches the standard email format (local@domain.tld).
**Validates: Requirements 18.3**

**Property 23: Password Strength Validation**
*For any* password string, the password strength validator SHALL correctly assess strength based on length, character variety (uppercase, lowercase, numbers, special characters), and return appropriate strength level.
**Validates: Requirements 18.4**

**Property 24: Safe Property Access**
*For any* object and property path string, the safe property accessor SHALL return the value at that path if it exists, or the provided default value if any part of the path is undefined or null.
**Validates: Requirements 18.5**

**Property 25: Error Message Formatting**
*For any* ApiError object, the error message formatter SHALL produce a user-friendly string message, handling both single string messages and arrays of validation messages.
**Validates: Requirements 18.7**

**Property 26: Date Serialization**
*For any* Date object included in an API request payload, the API_Client SHALL serialize it to ISO 8601 format string.
**Validates: Requirements 20.1**

**Property 27: Date Deserialization**
*For any* ISO 8601 date string in an API response, the API_Client SHALL parse it to a JavaScript Date object.
**Validates: Requirements 20.2**

**Property 28: Null Value Handling**
*For any* null or undefined value in request or response data, the API_Client SHALL handle it consistently, preserving null values and treating undefined as absent fields.
**Validates: Requirements 20.3**

**Property 29: Nested Object Preservation**
*For any* nested object structure in request data, the API_Client SHALL preserve the complete structure during serialization without flattening or losing depth.
**Validates: Requirements 20.4**


## Error Handling

### Error Types

The system handles several categories of errors:

1. **Network Errors**: Connection failures, timeouts, DNS resolution failures
2. **Authentication Errors (401)**: Invalid or expired tokens
3. **Authorization Errors (403)**: Insufficient permissions
4. **Validation Errors (400)**: Invalid request data
5. **Not Found Errors (404)**: Resource doesn't exist
6. **Server Errors (5xx)**: Backend service failures
7. **Client Errors**: Invalid configuration, missing environment variables

### Error Handling Strategy

#### Network Errors
- Display user-friendly message: "Network error. Please check your connection."
- Implement automatic retry with exponential backoff for idempotent requests
- Log detailed error information for debugging

#### Authentication Errors (401)
- Automatically attempt token refresh using refresh token
- If refresh succeeds, retry the original request
- If refresh fails, clear all tokens and redirect to login page
- Preserve the intended destination URL for post-login redirect

#### Authorization Errors (403)
- Display message: "You don't have permission to perform this action."
- Do not retry the request
- Log the attempted action for audit purposes

#### Validation Errors (400)
- Extract field-specific error messages from response
- Display errors next to relevant form fields
- Provide clear guidance on how to fix the errors
- Do not retry the request

#### Not Found Errors (404)
- Display message: "The requested resource was not found."
- Provide navigation options to return to valid pages
- Do not retry the request

#### Server Errors (5xx)
- Display generic message: "Something went wrong. Please try again later."
- Implement automatic retry with exponential backoff
- Log full error details for backend team investigation

#### Client Errors
- Throw descriptive errors during initialization
- Prevent application from starting with invalid configuration
- Provide clear instructions on how to fix configuration issues

### Error Response Format

All API errors follow this structure:

```typescript
interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
}
```

### Error Handling Flow

```
API Request
    ↓
[Interceptor: Add Auth Header]
    ↓
HTTP Request
    ↓
Response Received
    ↓
[Is Error?] ──No──→ Return Success
    ↓ Yes
[Is 401?] ──Yes──→ [Attempt Token Refresh]
    ↓ No              ↓
[Is Network Error?] ──Yes──→ [Retry with Backoff]
    ↓ No              ↓
[Transform to ApiError]
    ↓
[Log Error Details]
    ↓
[Display User Message]
    ↓
Throw Error
```

## Testing Strategy

### Dual Testing Approach

The foundation layer requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points
- Dependency installation verification
- Configuration validation
- Specific error scenarios (401, 403, 404, 500)
- Component integration (Auth Context with Token Manager)
- Hook behavior with React Testing Library
- Middleware redirect logic

**Property-Based Tests**: Verify universal properties across all inputs
- Token operations (decode, expiration check) with random valid/invalid JWTs
- Serialization/deserialization with random data structures
- Validation functions with random inputs
- Permission checking with random user/permission combinations
- Error handling with random error responses
- API response wrapping with random response data

### Testing Configuration

All property-based tests will use **fast-check** library for TypeScript/JavaScript:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: frontend-backend-foundation, Property {N}: {description}`
- Generators for: JWT tokens, API responses, user objects, dates, nested objects

### Test Organization

```
web/src/
├── lib/
│   ├── api/
│   │   ├── __tests__/
│   │   │   ├── client.test.ts
│   │   │   ├── interceptors.test.ts
│   │   │   └── services/
│   │   │       ├── auth.api.test.ts
│   │   │       ├── mfa.api.test.ts
│   │   │       ├── users.api.test.ts
│   │   │       ├── roles.api.test.ts
│   │   │       └── sessions.api.test.ts
│   ├── auth/
│   │   ├── __tests__/
│   │   │   ├── token-manager.test.ts
│   │   │   ├── token-manager.property.test.ts
│   │   │   ├── auth-context.test.tsx
│   │   │   └── permissions.test.ts
│   ├── utils/
│   │   ├── __tests__/
│   │   │   ├── error-handler.test.ts
│   │   │   ├── validators.test.ts
│   │   │   ├── validators.property.test.ts
│   │   │   ├── formatters.test.ts
│   │   │   └── formatters.property.test.ts
├── hooks/
│   ├── __tests__/
│   │   ├── useAuth.test.tsx
│   │   ├── useApi.test.tsx
│   │   ├── usePermissions.test.tsx
│   │   ├── useSession.test.tsx
│   │   └── useOrganization.test.tsx
└── __tests__/
    └── middleware.test.ts
```

### Key Test Scenarios

#### Unit Test Examples

1. **Token Manager**
   - Access token stored in memory only
   - Refresh token not accessible from JavaScript
   - Session initialization on app load
   - Token clearing on logout

2. **API Client**
   - Base URL configuration from environment
   - Timeout configuration
   - 401 triggers token refresh
   - Failed refresh redirects to login

3. **Auth Context**
   - Provides user state
   - Login updates user state
   - Logout clears user state
   - Components re-render on auth changes

4. **Middleware**
   - Unauthenticated users redirected from /dashboard
   - Authenticated users redirected from /auth/login
   - Redirect URL preserved in query params

5. **Error Handling**
   - Network errors show friendly message
   - 400 errors extract field-specific messages
   - 500 errors show generic message

#### Property Test Examples

1. **JWT Token Operations** (Property 3)
   ```typescript
   // Feature: frontend-backend-foundation, Property 3: JWT Token Operations
   fc.assert(
     fc.property(fc.jwt(), (token) => {
       const decoded = TokenManager.decodeToken(token);
       expect(decoded).toBeDefined();
       expect(decoded.exp).toBeGreaterThan(0);
       
       const isExpired = TokenManager.isTokenExpired(token);
       const currentTime = Date.now() / 1000;
       expect(isExpired).toBe(decoded.exp < currentTime);
     }),
     { numRuns: 100 }
   );
   ```

2. **Email Validation** (Property 22)
   ```typescript
   // Feature: frontend-backend-foundation, Property 22: Email Validation
   fc.assert(
     fc.property(fc.emailAddress(), (email) => {
       expect(isValidEmail(email)).toBe(true);
     }),
     { numRuns: 100 }
   );
   
   fc.assert(
     fc.property(fc.string(), (str) => {
       fc.pre(!str.includes('@') || !str.includes('.'));
       expect(isValidEmail(str)).toBe(false);
     }),
     { numRuns: 100 }
   );
   ```

3. **Date Serialization Round Trip** (Properties 26, 27)
   ```typescript
   // Feature: frontend-backend-foundation, Property 26-27: Date Serialization
   fc.assert(
     fc.property(fc.date(), (date) => {
       const serialized = serializeDate(date);
       expect(typeof serialized).toBe('string');
       
       const deserialized = deserializeDate(serialized);
       expect(deserialized.getTime()).toBe(date.getTime());
     }),
     { numRuns: 100 }
   );
   ```

4. **Safe Property Access** (Property 24)
   ```typescript
   // Feature: frontend-backend-foundation, Property 24: Safe Property Access
   fc.assert(
     fc.property(
       fc.object(),
       fc.string(),
       fc.anything(),
       (obj, path, defaultValue) => {
         const result = safeGetNestedProperty(obj, path, defaultValue);
         // Should never throw
         expect(result).toBeDefined();
       }
     ),
     { numRuns: 100 }
   );
   ```

5. **Permission Checks with No User** (Property 13)
   ```typescript
   // Feature: frontend-backend-foundation, Property 13: Unauthenticated Permission Checks
   fc.assert(
     fc.property(fc.string(), (permission) => {
       expect(checkPermission(null, permission)).toBe(false);
     }),
     { numRuns: 100 }
   );
   ```

### Test Coverage Goals

- **Line Coverage**: Minimum 80%
- **Branch Coverage**: Minimum 75%
- **Function Coverage**: Minimum 85%
- **Critical Paths**: 100% (authentication, token management, error handling)

### Mocking Strategy

- **API Responses**: Use MSW (Mock Service Worker) for HTTP mocking
- **Environment Variables**: Mock process.env in tests
- **Cookies**: Mock js-cookie library
- **React Context**: Use React Testing Library's wrapper
- **Next.js Router**: Mock next/navigation

### Continuous Integration

All tests must pass before merging:
- Unit tests run on every commit
- Property tests run on every pull request
- Integration tests run on main branch
- Coverage reports generated and tracked

