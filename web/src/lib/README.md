# Authentication Foundation Layer

A comprehensive, enterprise-grade authentication and authorization foundation layer for React/Next.js applications. This library provides complete integration with the NestJS GraphQL authentication backend, offering type-safe operations, real-time updates, and advanced security features.

## 🚀 Features

### Core Authentication
- **JWT Token Management** - Automatic token refresh, multi-tab sync, secure storage
- **Multi-Factor Authentication** - TOTP, backup codes, QR code generation
- **Social Authentication** - Google, Facebook, GitHub OAuth integration
- **Password Management** - Strength validation, reset flows, security policies

### Authorization & Access Control
- **Role-Based Access Control (RBAC)** - Hierarchical role system with 6 levels
- **Permission-Based Access Control (ABAC)** - Granular permissions with wildcards
- **Tier-Based Feature Access** - Subscription tier management and feature gating
- **Real-time Permission Updates** - Live permission and role changes

### Security & Monitoring
- **Risk Assessment** - Behavioral analysis and risk scoring (0-100)
- **Device Trust Management** - Device fingerprinting and trust scoring
- **Security Event Logging** - Comprehensive audit trail
- **Session Management** - Concurrent session control, timeout handling

### Developer Experience
- **Type Safety** - Full TypeScript support with generated types
- **Real-time Updates** - GraphQL subscriptions for live data
- **Caching** - Intelligent permission and data caching
- **Error Handling** - Comprehensive error management and recovery

## 📦 Installation

```bash
npm install @apollo/client graphql graphql-ws
```

## 🏗️ Architecture

```
web/src/lib/
├── auth/                    # Core authentication logic
│   ├── token-manager.ts     # JWT token management
│   └── auth-events.ts       # Event system for auth state
├── graphql/                 # GraphQL integration
│   ├── client.ts           # Apollo Client configuration
│   ├── generated/          # Generated TypeScript types
│   └── operations/         # GraphQL queries/mutations
├── hooks/                   # React hooks for auth operations
│   └── auth/               # Authentication-specific hooks
├── providers/              # React context providers
├── utils/                  # Utility functions
└── index.ts               # Main entry point
```

## 🚀 Quick Start

### 1. Setup Provider

```tsx
// app/layout.tsx
import { AuthProvider } from '@/lib/providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 2. Use Authentication

```tsx
// components/LoginForm.tsx
import { useAuth } from '@/lib/hooks/auth';

export function LoginForm() {
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (data) => {
    try {
      await login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 3. Protect Routes

```tsx
// components/ProtectedPage.tsx
import { withAuth } from '@/lib/providers';

function AdminPage() {
  return <div>Admin Dashboard</div>;
}

export default withAuth(AdminPage, {
  requireAuth: true,
  requiredRoles: ['admin', 'manager'],
  requiredPermissions: ['users:read'],
});
```

## 🔐 Authentication Hooks

### useAuth - Core Authentication

```tsx
import { useAuth } from '@/lib/hooks/auth';

function MyComponent() {
  const {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Operations
    login,
    logout,
    register,
    refreshToken,
    
    // Utilities
    hasPermission,
    hasRole,
    hasTier,
    hasFeature,
  } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.displayName}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### useMFA - Multi-Factor Authentication

```tsx
import { useMFA } from '@/lib/hooks/auth';

function MFASetup() {
  const {
    isEnabled,
    setupData,
    generateSetup,
    enableMfa,
    disableMfa,
    verifyToken,
    generateBackupCodes,
  } = useMFA();

  const handleSetup = async () => {
    const setup = await generateSetup();
    // Display QR code: setup.qrCodeUrl
    // Show backup codes: setup.backupCodes
  };

  return (
    <div>
      {!isEnabled ? (
        <button onClick={handleSetup}>
          Enable MFA
        </button>
      ) : (
        <p>MFA is enabled</p>
      )}
    </div>
  );
}
```

### usePermissions - Permission Management

```tsx
import { usePermissions } from '@/lib/hooks/auth';

function UserManagement() {
  const {
    userPermissions,
    hasPermission,
    hasAnyPermission,
    grantPermission,
    revokePermission,
    assignRole,
  } = usePermissions();

  const canManageUsers = hasPermission('users:manage');
  const canViewReports = hasAnyPermission(['reports:read', 'analytics:read']);

  return (
    <div>
      {canManageUsers && (
        <button onClick={() => grantPermission({
          userId: 'user-id',
          permission: 'users:read',
        })}>
          Grant Permission
        </button>
      )}
    </div>
  );
}
```

### useSocialAuth - Social Authentication

```tsx
import { useSocialAuth } from '@/lib/hooks/auth';

function SocialLogin() {
  const {
    generateAuthUrl,
    connectedProviders,
    linkProvider,
    unlinkProvider,
    isProviderConnected,
  } = useSocialAuth();

  const handleGoogleLogin = async () => {
    const { authUrl } = await generateAuthUrl('google');
    window.location.href = authUrl;
  };

  return (
    <div>
      <button onClick={handleGoogleLogin}>
        Login with Google
      </button>
      
      {connectedProviders.map(provider => (
        <div key={provider.provider}>
          {provider.provider}: {provider.email}
          <button onClick={() => unlinkProvider(provider.provider)}>
            Unlink
          </button>
        </div>
      ))}
    </div>
  );
}
```

### useSecurity - Security Monitoring

```tsx
import { useSecurity } from '@/lib/hooks/auth';

function SecurityDashboard() {
  const {
    riskScore,
    riskLevel,
    recommendations,
    isHighRisk,
    securityScore,
    refreshRiskScore,
  } = useSecurity();

  return (
    <div>
      <h3>Security Status</h3>
      <p>Risk Score: {riskScore}/100 ({riskLevel})</p>
      <p>Security Score: {securityScore}/100</p>
      
      {isHighRisk && (
        <div className="alert alert-warning">
          High risk detected! Please review your account.
        </div>
      )}
      
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
}
```

### useTier - Subscription Tiers

```tsx
import { useTier } from '@/lib/hooks/auth';

function FeatureGate({ children, requiredTier }) {
  const { canAccessTier, isFeatureLocked } = useTier();

  if (!canAccessTier(requiredTier)) {
    return (
      <div className="feature-locked">
        <p>This feature requires {requiredTier} tier</p>
        <button>Upgrade Now</button>
      </div>
    );
  }

  return children;
}
```

## 🔒 Access Control

### Permission-Based Guards

```tsx
import { useAuthGuard } from '@/lib/providers';

function ConditionalComponent() {
  const { canRender } = useAuthGuard();

  return (
    <div>
      {canRender({ requiredPermissions: ['users:read'] }) && (
        <UserList />
      )}
      
      {canRender({ requiredRoles: ['admin'] }) && (
        <AdminPanel />
      )}
      
      {canRender({ requiredTier: 'premium' }) && (
        <PremiumFeature />
      )}
    </div>
  );
}
```

### HOC Protection

```tsx
import { withAuth } from '@/lib/providers';

const ProtectedComponent = withAuth(MyComponent, {
  requireAuth: true,
  requiredPermissions: ['users:manage'],
  requiredRoles: ['admin', 'manager'],
  requiredTier: 'premium',
  fallback: AccessDeniedComponent,
});
```

## 📡 Real-time Updates

### Authentication Events

```tsx
import { useEffect } from 'react';
import { AuthEventEmitter } from '@/lib/auth/auth-events';

function App() {
  useEffect(() => {
    const handleLogin = (user) => {
      console.log('User logged in:', user);
      // Show welcome message
    };

    const handleLogout = ({ reason }) => {
      console.log('User logged out:', reason);
      // Redirect to login
    };

    const handleMfaRequired = ({ mfaToken }) => {
      // Redirect to MFA page
      window.location.href = '/auth/mfa';
    };

    AuthEventEmitter.on('auth:login', handleLogin);
    AuthEventEmitter.on('auth:logout', handleLogout);
    AuthEventEmitter.on('auth:mfa_required', handleMfaRequired);

    return () => {
      AuthEventEmitter.off('auth:login', handleLogin);
      AuthEventEmitter.off('auth:logout', handleLogout);
      AuthEventEmitter.off('auth:mfa_required', handleMfaRequired);
    };
  }, []);

  return <div>App Content</div>;
}
```

### GraphQL Subscriptions

```tsx
import { useSubscription } from '@apollo/client';
import { USER_AUTH_EVENTS } from '@/lib/graphql/operations/auth';

function AuthEventMonitor() {
  useSubscription(USER_AUTH_EVENTS, {
    onData: ({ data }) => {
      const event = data.data?.userAuthEvents;
      if (event) {
        console.log('Auth event:', event);
        // Handle real-time auth events
      }
    },
  });

  return null;
}
```

## 🛠️ Configuration

### Environment Variables

```env
# GraphQL Endpoints
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:3001/graphql
NEXT_PUBLIC_GRAPHQL_WS_ENDPOINT=ws://localhost:3001/graphql

# OAuth Configuration (if using social auth)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=your-facebook-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=your-github-client-id
```

### Apollo Client Customization

```tsx
// lib/graphql/client.ts
import { apolloClient } from '@/lib/graphql/client';

// Add custom links or modify configuration
apolloClient.setLink(/* custom link chain */);
```

## 🔧 Advanced Usage

### Custom Permission Checking

```tsx
import { matchesPermission } from '@/lib/utils/auth-utils';

function hasCustomPermission(userPermissions: string[], resource: string, action: string) {
  const permission = `${resource}:${action}`;
  return matchesPermission(userPermissions, permission);
}
```

### Device Fingerprinting

```tsx
import { generateDeviceFingerprint } from '@/lib/utils/auth-utils';

function LoginForm() {
  const handleLogin = async (credentials) => {
    const deviceFingerprint = generateDeviceFingerprint();
    
    await login({
      ...credentials,
      deviceFingerprint,
    });
  };
}
```

### Password Strength Validation

```tsx
import { validatePasswordStrength } from '@/lib/utils/auth-utils';

function PasswordInput({ value, onChange }) {
  const strength = validatePasswordStrength(value);
  
  return (
    <div>
      <input
        type="password"
        value={value}
        onChange={onChange}
      />
      <div className={`strength-${strength.score}`}>
        Strength: {strength.score}/4
      </div>
      {strength.feedback.map((feedback, index) => (
        <p key={index} className="feedback">
          {feedback}
        </p>
      ))}
    </div>
  );
}
```

## 📊 Available Operations

### Authentication Operations
- `login` - Email/password authentication
- `loginWithMfa` - MFA-enabled login
- `register` - User registration
- `logout` - Single session logout
- `logoutAllSessions` - All sessions logout
- `refreshToken` - Token refresh
- `changePassword` - Password change
- `forgotPassword` - Password reset request
- `resetPassword` - Password reset completion

### MFA Operations
- `generateMfaSetup` - Generate QR code and backup codes
- `enableMfa` - Enable MFA with token verification
- `disableMfa` - Disable MFA
- `verifyMfaToken` - Verify TOTP or backup code
- `generateBackupCodes` - Generate new backup codes

### Social Auth Operations
- `getSocialAuthUrl` - Generate OAuth URL
- `linkSocialProvider` - Link social account
- `unlinkSocialProvider` - Unlink social account
- `getConnectedSocialProviders` - List connected accounts

### Permission Operations
- `getPermissions` - Get user permissions
- `grantPermission` - Grant permission to user
- `revokePermission` - Revoke permission from user
- `assignRole` - Assign role to user
- `bulkGrantPermissions` - Bulk permission operations
- `checkPermission` - Check specific permission

### Security Operations
- `myRiskScore` - Get current risk score
- `mySecurityStatus` - Get security status
- `mySecurityRecommendations` - Get security recommendations
- `logSecurityEvent` - Log security event

## 🎯 Best Practices

### 1. Error Handling

```tsx
import { useAuth } from '@/lib/hooks/auth';

function LoginForm() {
  const { login, error, clearError } = useAuth();

  const handleSubmit = async (data) => {
    clearError(); // Clear previous errors
    
    try {
      await login(data);
    } catch (error) {
      if (error.message === 'MFA_REQUIRED') {
        // Handle MFA requirement
        redirectToMFA();
      } else {
        // Handle other errors
        showErrorMessage(error.message);
      }
    }
  };
}
```

### 2. Permission Caching

```tsx
import { usePermissions } from '@/lib/hooks/auth';

function UserList() {
  const { hasPermission, clearCache } = usePermissions();

  // Clear cache when permissions might have changed
  useEffect(() => {
    const handlePermissionUpdate = () => {
      clearCache();
    };

    AuthEventEmitter.on('permissions:updated', handlePermissionUpdate);
    return () => AuthEventEmitter.off('permissions:updated', handlePermissionUpdate);
  }, [clearCache]);

  const canEdit = hasPermission('users:update');
  const canDelete = hasPermission('users:delete');

  return (
    <div>
      {/* User list with conditional actions */}
    </div>
  );
}
```

### 3. Security Monitoring

```tsx
import { useSecurity } from '@/lib/hooks/auth';

function SecurityAlert() {
  const { isHighRisk, riskScore, recommendations } = useSecurity();

  useEffect(() => {
    if (isHighRisk) {
      // Show security alert
      showSecurityWarning({
        score: riskScore,
        recommendations,
      });
    }
  }, [isHighRisk, riskScore, recommendations]);

  return null;
}
```

## 🚨 Security Considerations

1. **Token Storage** - Uses secure storage with automatic cleanup
2. **CSRF Protection** - Built-in CSRF token handling
3. **XSS Prevention** - Secure token handling and sanitization
4. **Session Management** - Automatic session timeout and cleanup
5. **Device Tracking** - Device fingerprinting for security
6. **Risk Assessment** - Continuous risk monitoring
7. **Audit Logging** - Comprehensive security event logging

## 📈 Performance Optimizations

1. **Intelligent Caching** - Permission and user data caching
2. **Query Batching** - Automatic GraphQL query batching
3. **Subscription Management** - Efficient WebSocket connection handling
4. **Code Splitting** - Lazy loading of authentication components
5. **Token Refresh** - Proactive token refresh to prevent interruptions

## 🔄 Migration Guide

When upgrading or migrating, follow these steps:

1. Update environment variables
2. Run type generation: `npm run codegen`
3. Update import paths if needed
4. Test authentication flows
5. Verify permission checks
6. Test real-time subscriptions

## 📚 API Reference

For complete API documentation, see the generated TypeScript types in `lib/graphql/generated/types.ts`.

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add comprehensive error handling
3. Include unit tests for utilities
4. Update documentation for new features
5. Ensure backward compatibility

## 📄 License

This authentication foundation layer is part of the business management platform and follows the project's licensing terms.