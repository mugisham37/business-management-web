# Business Management Server

A robust NestJS backend server with GraphQL, PostgreSQL, Redis, and comprehensive logging capabilities.

## Features

- **GraphQL API** with Apollo Server
- **PostgreSQL Database** with Drizzle ORM
- **Redis Caching** with intelligent caching strategies
- **Comprehensive Logging** with real-time analytics
- **Multi-tenant Architecture** with tenant isolation
- **Advanced Validation** with custom validators
- **Performance Monitoring** with query complexity limits
- **Horizontal Scaling** support

## Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. **Start the development server:**
   ```bash
   npm run start:dev
   ```

## Available Scripts

- `npm run start` - Start the server
- `npm run start:dev` - Start in development mode with hot reload
- `npm run start:prod` - Start in production mode
- `npm run build` - Build the application
- `npm run test` - Run tests
- `npm run lint` - Lint the code

## API Endpoints

- **GraphQL Playground:** `http://localhost:3000/graphql`
- **API Documentation:** `http://localhost:3000/docs`
- **Health Check:** `http://localhost:3000/health`

## Environment Variables

See `.env.example` for all required environment variables.

### Required Variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret (32+ characters)
- `JWT_REFRESH_SECRET` - JWT refresh secret (32+ characters)
- `ENCRYPTION_KEY` - Data encryption key (32 characters)
- `FIELD_ENCRYPTION_KEY` - Field encryption key (32 characters)

## Architecture

### Core Modules

- **Database Module** - PostgreSQL with Drizzle ORM, connection pooling, read replicas
- **Cache Module** - Redis with intelligent caching, pub/sub, horizontal scaling
- **Logger Module** - Comprehensive logging with analytics and real-time streaming
- **GraphQL Common** - DataLoader, custom scalars, PubSub for subscriptions
- **Validation Module** - Custom validators and sanitizers

### Key Features

- **Multi-tenancy** - All modules support tenant isolation
- **Global Modules** - Core modules available application-wide
- **Connection Pooling** - Optimized database and Redis connections
- **Event-Driven** - Event emitter for audit and business events
- **Error Handling** - Standardized error codes and formatting
- **Performance Monitoring** - Query complexity limits and slow query detection

## Development

The server is built with a modular architecture using NestJS best practices. All existing modules are production-ready with comprehensive error handling, logging, and monitoring capabilities.

## License

MIT