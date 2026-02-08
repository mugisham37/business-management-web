# Custom Exceptions Usage Guide

This guide demonstrates how to use the custom exception classes in your NestJS controllers and services.

## Overview

The custom exception system provides:
- Consistent error response format across the application
- Automatic correlation ID tracking
- Sensitive data masking
- Structured error logging
- Type-safe exception handling

## Error Response Format

All errors follow this structure:

```typescript
{
  statusCode: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  correlationId: string;
  details?: Record<string, any>;
}
```

## Available Exception Categories

### 1. Validation Errors (400)

```typescript
import { ValidationException, PasswordStrengthException } from '@/common/exceptions';

// Generic validation error
throw new ValidationException('Invalid input data', {
  field: 'email',
  reason: 'Email format is invalid',
});

// Password strength error
throw new PasswordStrengthException('Password must contain at least 12 characters', {
  requirements: {
    minLength: 12,
    uppercase: true,
    lowercase: true,
    number: true,
    special: true,
  },
});
```

### 2. Authentication Errors (401)

```typescript
import {
  InvalidCredentialsException,
  ExpiredTokenException,
  UnverifiedEmailException,
  MFARequiredException,
} from '@/common/exceptions';

// Invalid credentials
throw new InvalidCredentialsException();

// Expired token
throw new ExpiredTokenException('Access token has expired');

// Unverified email
throw new UnverifiedEmailException('Please verify your email before logging in');

// MFA required
throw new MFARequiredException('Multi-factor authentication is required', {
  tempToken: 'temp_token_here',
});
```

### 3. Authorization Errors (403)

```typescript
import {
  InsufficientPermissionsException,
  CrossTenantAccessException,
  DelegationValidationException,
  AccountSuspendedException,
} from '@/common/exceptions';

// Insufficient permissions
throw new InsufficientPermissionsException('You do not have permission to perform this action', {
  required: 'users:delete',
  current: ['users:read', 'users:update'],
});

// Cross-tenant access
throw new CrossTenantAccessException();

// Delegation validation failed
throw new DelegationValidationException('Cannot delegate permissions you do not possess', {
  attempted: ['users:delete'],
  missing: ['users:delete'],
});

// Account suspended
throw new AccountSuspendedException('Your account has been suspended', {
  reason: 'Policy violation',
  suspendedUntil: '2024-12-31',
});
```

### 4. Resource Errors (404)

```typescript
import {
  UserNotFoundException,
  OrganizationNotFoundException,
  RoleNotFoundException,
} from '@/common/exceptions';

// User not found
throw new UserNotFoundException('user-123');

// Organization not found
throw new OrganizationNotFoundException('org-456');

// Role not found
throw new RoleNotFoundException('role-789');
```

### 5. Conflict Errors (409)

```typescript
import {
  DuplicateEmailException,
  OrganizationLimitReachedException,
  RoleInUseException,
  PasswordHistoryException,
} from '@/common/exceptions';

// Duplicate email
throw new DuplicateEmailException('user@example.com');

// Organization limit reached
throw new OrganizationLimitReachedException('users', {
  current: 100,
  max: 100,
});

// Role in use
throw new RoleInUseException('Cannot delete role that is assigned to users', {
  roleId: 'role-123',
  assignedUsers: 5,
});

// Password history
throw new PasswordHistoryException('Password has been used in the last 5 changes');
```

### 6. Rate Limit Errors (429)

```typescript
import { RateLimitException, BruteForceProtectionException } from '@/common/exceptions';

// Rate limit exceeded
throw new RateLimitException('Too many requests, please try again later', {
  limit: 100,
  window: '1 minute',
  retryAfter: 60,
});

// Brute force protection
throw new BruteForceProtectionException('Account locked due to too many failed attempts', {
  lockDuration: 1800,
  attemptsRemaining: 0,
});
```

### 7. Server Errors (500)

```typescript
import {
  DatabaseException,
  CacheException,
  EncryptionException,
  ExternalServiceException,
} from '@/common/exceptions';

// Database error
throw new DatabaseException('Failed to connect to database');

// Cache error
throw new CacheException('Redis connection failed');

// Encryption error
throw new EncryptionException('Failed to encrypt sensitive data');

// External service error
throw new ExternalServiceException('email-service', 'Failed to send email');
```

## Usage in Controllers

```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  InvalidCredentialsException,
  UnverifiedEmailException,
  AccountSuspendedException,
} from '@/common/exceptions';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new InvalidCredentialsException();
    }

    if (!user.emailVerified) {
      throw new UnverifiedEmailException();
    }

    if (user.status === 'suspended') {
      throw new AccountSuspendedException();
    }

    return this.authService.login(user);
  }
}
```

## Usage in Services

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database';
import {
  UserNotFoundException,
  DuplicateEmailException,
  OrganizationLimitReachedException,
} from '@/common/exceptions';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto, organizationId: string) {
    // Check organization limits
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (organization.currentUserCount >= organization.maxUsers) {
      throw new OrganizationLimitReachedException('users', {
        current: organization.currentUserCount,
        max: organization.maxUsers,
      });
    }

    // Check for duplicate email
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        organizationId,
      },
    });

    if (existingUser) {
      throw new DuplicateEmailException(dto.email);
    }

    // Create user
    return this.prisma.user.create({
      data: {
        ...dto,
        organizationId,
      },
    });
  }

  async findById(id: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!user) {
      throw new UserNotFoundException(id);
    }

    return user;
  }
}
```

## Validation Pipe Usage

The validation pipe is automatically applied globally. Just use class-validator decorators in your DTOs:

```typescript
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(12)
  password: string;

  @IsNotEmpty()
  @IsString()
  organizationName: string;
}
```

When validation fails, the response will be:

```json
{
  "statusCode": 400,
  "error": "ValidationError",
  "message": "Validation failed",
  "timestamp": "2024-02-08T12:00:00.000Z",
  "path": "/auth/register",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "details": {
    "errors": [
      {
        "field": "email",
        "constraints": {
          "isEmail": "email must be an email"
        }
      },
      {
        "field": "password",
        "constraints": {
          "minLength": "password must be longer than or equal to 12 characters"
        }
      }
    ]
  }
}
```

## Sensitive Data Masking

The exception filter automatically masks sensitive data in error messages and details:

- Passwords
- Tokens
- Secrets
- API keys
- Authorization headers
- MFA secrets
- OAuth tokens

Example:

```typescript
// This error message
throw new Error('Failed to validate token: abc123xyz');

// Will be logged and returned as
"Failed to validate token: [REDACTED]"
```

## Correlation IDs

Every error response includes a unique correlation ID that can be used to track the error across logs and services. This is automatically generated and included in both the response and logs.

## Best Practices

1. **Use specific exceptions**: Use the most specific exception type available rather than generic ones
2. **Include helpful details**: Add context in the details object to help with debugging
3. **Don't expose sensitive data**: Never include passwords, tokens, or secrets in error messages
4. **Log appropriately**: Let the exception filter handle logging - don't duplicate logs
5. **Be consistent**: Use the same exception types for the same error conditions across the application
