# Enterprise Authentication & Authorization Module

A comprehensive, enterprise-grade authentication and authorization system built with modern security principles, zero-trust architecture, and DNV-style rigor.

## 🔐 Core Features

### Authentication Capabilities
- **Multi-factor Authentication (MFA)**: TOTP, backup codes, WebAuthn support
- **Social Authentication**: Google, Facebook, GitHub OAuth integration
- **JWT-based Authentication**: Secure token-based authentication with refresh token rotation
- **Passwordless Authentication**: Magic links and WebAuthn support
- **Risk-based Authentication**: Behavioral analysis and adaptive security
- **Device Fingerprinting**: Enhanced device trust scoring

### Authorization Features
- **Role-based Access Control (RBAC)**: Hierarchical role system
- **Permission-based Access Control**: Granular permissions with wildcard support
- **Attribute-based Access Control (ABAC)**: Dynamic policy-based authorization
- **Tier-based Feature Access**: Business tier-based feature gating
- **Time-based Access Control**: Temporal access restrictions
- **Resource-level Permissions**: Fine-grained resource access control

### Enterprise Security
- **Multi-tenant Architecture**: Proper tenant isolation and security
- **Session Management**: Concurrent session control and security validation
- **Account Security**: Lockout protection and brute force prevention
- **Comprehensive Audit Logging**: Full compliance and security monitoring
- **Real-time Security Events**: Live threat detection and response
- **Just-in-time Privileges**: Temporary privilege escalation

## 🏗️ Architecture

### Module Structure
```
src/modules/auth/
├── config/                 # Configuration management
├── decorators/            # Custom decorators for authorization
├── guards/                # Authentication and authorization guards
├── inputs/                # GraphQL input types
├── interfaces/            # TypeScript interfaces
├── resolvers/             # GraphQL resolvers
├── services/              # Business logic services
├── strategies/            # Passport authentication strategies
├── types/                 # GraphQL object types
└── utils/                 # Utility functions
```

### Core Services

#### AuthService
- User registration and login
- Password management
- Token generation and validation
- Session management
- Security validation

#### SecurityService
- Threat detection and prevention
- Security event logging
- Compliance reporting
- Risk assessment coordination
- Audit trail management

#### RiskAssessmentService
- Multi-factor risk analysis
- Behavioral pattern detection
- Device and network trust scoring
- Adaptive security recommendations
- Continuous risk monitoring

#### SessionService
- Session lifecycle management
- Device tracking and validation
- Concurrent session control
- Security-aware session handling
- Automatic cleanup and maintenance

## 🚀 Quick Start

### 1. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

**Required Configuration:**
```env
# JWT Secrets (REQUIRED - Change these!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/business_management

# Redis (for caching and sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Run database migrations:
```bash
npm run db:migrate
```

### 4. Start the Server

```bash
npm run start:dev
```

## 📊 GraphQL API

### Authentication Mutations

#### Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    user {
      id
      email
      role
      businessTier
      featureFlags
    }
    accessToken
    refreshToken
    expiresIn
    riskScore
  }
}
```

#### Login with MFA
```graphql
mutation LoginWithMfa($input: LoginWithMfaInput!) {
  loginWithMfa(input: $input) {
    user { id email role }
    accessToken
    refreshToken
  }
}
```

#### Register
```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    user { id email role }
    accessToken
    refreshToken
  }
}
```

### Authorization Queries

#### Current User
```graphql
query Me {
  me {
    id
    email
    role
    permissions
    businessTier
    featureFlags
    lastLoginAt
  }
}
```

#### Security Status
```graphql
query SecurityStatus {
  getSecurityStatus
}
```

## 🛡️ Security Features

### Risk-Based Authentication

The system continuously assesses login risk based on:

- **Location Analysis**: Geographic location patterns
- **Device Fingerprinting**: Hardware and software characteristics
- **Behavioral Analysis**: User behavior patterns
- **Network Trust**: Network reputation and trust scores
- **Temporal Patterns**: Time-based access patterns

### Advanced Authorization Decorators

#### Basic Authorization
```typescript
@UseGuards(JwtAuthGuard)
@Query(() => String)
async protectedQuery(@CurrentUser() user: AuthenticatedUser) {
  return `Hello ${user.email}`;
}
```

#### Role-Based Authorization
```typescript
@AdminOnly(['users:manage'])
@Mutation(() => MutationResponse)
async deleteUser(@Args('userId') userId: string) {
  // Only admins with users:manage permission
}
```

#### Tier-Based Authorization
```typescript
@RequireEnterpriseTier()
@RequireFeature(['advanced_analytics'])
@Query(() => AnalyticsReport)
async getAdvancedAnalytics() {
  // Requires enterprise tier and advanced analytics feature
}
```

#### Risk-Based Authorization
```typescript
@RiskBasedAuth({ maxRiskScore: 50 })
@MfaRequired(['sensitive:operation'])
@Mutation(() => MutationResponse)
async sensitiveOperation() {
  // Requires low risk score and MFA
}
```

#### Time and Location-Based Authorization
```typescript
@TimeBasedAuth([9, 10, 11, 12, 13, 14, 15, 16, 17], 'America/New_York')
@NetworkBasedAuth(['office', 'vpn'])
@Query(() => FinancialReport)
async getFinancialReport() {
  // Only during business hours from trusted networks
}
```

## 🔧 Configuration

### Security Configuration

```env
# Account Security
MAX_FAILED_ATTEMPTS=5
LOCKOUT_DURATION=900000
PROGRESSIVE_LOCKOUT=true

# Risk Assessment
RISK_ASSESSMENT_ENABLED=true
RISK_SCORE_THRESHOLD=50
DEVICE_TRUST_THRESHOLD=70

# MFA Configuration
MFA_ENFORCE_FOR_ROLES=super_admin,tenant_admin
MFA_GRACE_PERIOD_DAYS=7
```

### Compliance Configuration

```env
# GDPR Compliance
GDPR_COMPLIANCE=true
GDPR_DATA_RETENTION_DAYS=2555
GDPR_RIGHT_TO_ERASURE=true

# SOX Compliance
SOX_COMPLIANCE=true
SOX_SEGREGATION_OF_DUTIES=true
SOX_AUDIT_TRAIL=true
```

## 📈 Monitoring & Analytics

### Security Metrics

The system provides comprehensive security metrics:

- **Authentication Success/Failure Rates**
- **Risk Score Distributions**
- **MFA Adoption Rates**
- **Device Trust Scores**
- **Geographic Access Patterns**
- **Threat Detection Statistics**

### Audit Logging

All security events are logged with:

- **User Identity**: Who performed the action
- **Action Details**: What was done
- **Resource Context**: What was accessed
- **Security Context**: Risk scores, device info, location
- **Timestamp**: When it occurred
- **Outcome**: Success/failure with details

## 🔒 Security Best Practices

### Password Security
- **Strong Hashing**: bcrypt with configurable rounds
- **Password Policies**: Complexity requirements and history
- **Secure Reset**: Time-limited, single-use reset tokens
- **Breach Detection**: Integration with breach databases

### Session Security
- **Secure Tokens**: Cryptographically secure session identifiers
- **Session Binding**: IP and device fingerprint validation
- **Automatic Cleanup**: Expired session removal
- **Concurrent Limits**: Maximum active sessions per user

### API Security
- **Rate Limiting**: Configurable request limits
- **Input Validation**: Comprehensive input sanitization
- **CORS Protection**: Configurable cross-origin policies
- **Security Headers**: Comprehensive security header management

## 🚨 Threat Detection

### Automated Detection
- **Brute Force Attacks**: Failed login attempt monitoring
- **Account Takeover**: Unusual access pattern detection
- **Device Anomalies**: New device detection and validation
- **Geographic Anomalies**: Impossible travel detection
- **Behavioral Anomalies**: Unusual user behavior patterns

### Response Actions
- **Automatic Blocking**: High-risk access prevention
- **Admin Alerts**: Real-time security notifications
- **MFA Requirements**: Adaptive authentication requirements
- **Account Lockouts**: Temporary access restrictions

## 📋 Compliance & Governance

### Supported Frameworks
- **GDPR**: Data protection and privacy compliance
- **SOX**: Financial reporting controls
- **HIPAA**: Healthcare data protection
- **ISO 27001**: Information security management
- **NIST**: Cybersecurity framework alignment

### Audit Capabilities
- **Comprehensive Logging**: All access and changes logged
- **Retention Management**: Configurable log retention
- **Export Capabilities**: Audit log export for compliance
- **Real-time Monitoring**: Live security event tracking

## 🔄 Integration

### External Services
- **Identity Providers**: SAML, OAuth, OpenID Connect
- **Threat Intelligence**: IP reputation and threat feeds
- **Notification Services**: Email, SMS, push notifications
- **Monitoring Systems**: SIEM and security monitoring integration

### API Integration
- **RESTful APIs**: Traditional REST endpoint support
- **GraphQL APIs**: Modern GraphQL query interface
- **Webhook Support**: Real-time event notifications
- **SDK Support**: Client library integration

## 📚 Additional Resources

- [Security Architecture Guide](./docs/security-architecture.md)
- [API Reference](./docs/api-reference.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## 🤝 Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Built with enterprise security in mind. Ready for production at scale.**