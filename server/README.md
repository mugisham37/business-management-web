# Multi-Tenant Authentication and Authorization System

A comprehensive NestJS-based authentication and authorization system with multi-tenant support, hierarchical user management, and property-based testing.

## Features

- Multi-tenant architecture with complete data isolation
- Hierarchical user roles (Owner, Manager, Worker)
- JWT-based authentication with refresh token rotation
- MFA support with TOTP and backup codes
- OAuth2 Google authentication
- Fine-grained permission system
- Redis-based caching and session management
- Comprehensive audit logging
- GraphQL API
- Property-based testing with fast-check

## Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis with ioredis
- **Authentication**: Passport.js with JWT and Google OAuth2
- **API**: GraphQL with Apollo Server
- **Testing**: Jest with fast-check for property-based testing
- **Logging**: Winston
- **Security**: Helmet, bcrypt, rate limiting

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations (after Task 2 is complete):
```bash
npx prisma migrate dev
```

## Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## Testing

### Unit Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage
```bash
npm run test:cov
```

### E2E Tests
```bash
npm run test:e2e
```

## Project Structure

```
src/
├── config/           # Configuration files and validation
├── prisma/           # Prisma service and module
├── redis/            # Redis service and module
├── auth/             # Authentication module (to be added)
├── users/            # Users module (to be added)
├── permissions/      # Permissions module (to be added)
├── organizations/    # Organizations module (to be added)
└── main.ts          # Application entry point
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for access tokens
- `JWT_REFRESH_SECRET`: Secret for refresh tokens
- `REDIS_HOST`: Redis server host
- `REDIS_PORT`: Redis server port

## Security Features

- Helmet security headers
- CORS configuration
- Rate limiting on authentication endpoints
- Password hashing with bcrypt (12 rounds)
- JWT token rotation and blacklisting
- Input validation and sanitization
- SQL injection prevention via Prisma

## License

UNLICENSED
