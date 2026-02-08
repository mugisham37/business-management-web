# Enterprise Authentication & Authorization Server

NestJS-based authentication and authorization system with Fastify adapter.

## Tech Stack

- **Framework**: NestJS 11.x with Fastify adapter
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Caching**: Redis 7+
- **Authentication**: Passport.js with JWT
- **Password Hashing**: Argon2id
- **Validation**: class-validator, class-transformer
- **Testing**: Jest with @fast-check/jest for property-based testing

## Project Structure

```
src/
├── modules/        # Application modules (auth, users, roles, etc.)
├── common/         # Shared utilities, guards, interceptors
├── config/         # Configuration files
├── main.ts         # Application entry point
└── app.module.ts   # Root module
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### Running the Application

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov
```

## Development

This project follows the NestJS modular architecture with strict TypeScript configuration for type safety and code quality.
