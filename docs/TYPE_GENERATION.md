# Type Generation Guide

This document explains how to generate TypeScript types from GraphQL schema and Protocol Buffer definitions.

## Overview

The foundation layer uses two type generation systems:

1. **GraphQL Code Generator** - Generates TypeScript types, operations, and React hooks from GraphQL schema
2. **gRPC Type Generation** - Generates TypeScript types from Protocol Buffer (.proto) files

## GraphQL Type Generation

### Configuration

GraphQL type generation is configured in `codegen.yml` at the project root.

### Running Type Generation

```bash
# Generate types once
npm run codegen

# Watch mode (regenerates on schema/operation changes)
npm run codegen:watch
```

### Generated Files

Types are generated in: `src/lib/types/generated/graphql.ts`

This file includes:
- TypeScript types for all GraphQL types
- TypeScript types for all GraphQL operations (queries, mutations, subscriptions)
- React hooks for all operations (useQuery, useMutation, useSubscription)

### Usage Example

```typescript
import { useHealthCheckQuery, HealthCheckQuery } from '@/lib/types/generated/graphql';

function HealthStatus() {
  const { data, loading, error } = useHealthCheckQuery();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Status: {data?.health.status}</div>;
}
```

## gRPC Type Generation

### Configuration

gRPC type generation uses the `scripts/generate-grpc-types.sh` script.

Proto files are located in: `proto/`
- `proto/common/` - Common message types
- `proto/services/` - Service definitions

### Running Type Generation

```bash
# Generate types once
npm run grpc:generate

# Watch mode (regenerates on proto file changes)
npm run grpc:watch
```

### Generated Files

Types are generated in: `src/lib/types/generated/grpc/`

Currently, we use manually defined TypeScript interfaces in `src/lib/types/generated/grpc/index.ts` for type safety.

### Usage Example

```typescript
import { IUserService, GetUserRequest } from '@/lib/types/generated/grpc';

async function getUser(userService: IUserService, userId: string) {
  const request: GetUserRequest = { id: userId };
  const response = await userService.getUser(request);
  return response.user;
}
```

## Combined Type Generation

To generate both GraphQL and gRPC types at once:

```bash
# Generate all types once
npm run types:generate

# Watch mode for both
npm run types:watch
```

## Type Generation Workflow

### Development Workflow

1. Start the backend server (port 3001)
2. Run `npm run types:watch` to enable automatic type regeneration
3. Make changes to GraphQL operations or proto files
4. Types will automatically regenerate

### Build Workflow

1. Ensure backend is running (for GraphQL schema introspection)
2. Run `npm run types:generate` before building
3. Generated types are committed to version control

## Troubleshooting

### GraphQL Schema Introspection Fails

**Problem**: `codegen` fails with "Cannot introspect schema"

**Solution**: 
- Ensure backend server is running on port 3001
- Check `NEXT_PUBLIC_GRAPHQL_URL` in `.env.local`
- Verify backend GraphQL endpoint is accessible

### gRPC Type Generation Fails

**Problem**: `grpc:generate` script fails

**Solution**:
- Ensure proto files exist in `proto/` directory
- Check that `grpc-tools` is installed: `npm list grpc-tools`
- Verify proto file syntax is valid

### Generated Types Not Found

**Problem**: Import errors for generated types

**Solution**:
- Run type generation: `npm run types:generate`
- Check that generated files exist in `src/lib/types/generated/`
- Verify TypeScript paths in `tsconfig.json`

## Type Safety Best Practices

1. **Never use `any` types** - Always use generated types
2. **Run type generation before committing** - Ensure types are up to date
3. **Use type guards** - Validate runtime data matches expected types
4. **Keep operations in separate files** - Organize by feature/domain
5. **Use fragments** - Reuse common field selections

## Schema Changes

### When GraphQL Schema Changes

1. Backend team updates schema
2. Run `npm run codegen` to regenerate types
3. Fix any TypeScript errors in frontend code
4. Test affected components
5. Commit updated generated types

### When Proto Files Change

1. Backend team updates proto files
2. Copy updated proto files to `proto/` directory
3. Run `npm run grpc:generate` to regenerate types
4. Fix any TypeScript errors in frontend code
5. Test affected gRPC clients
6. Commit updated proto files and generated types

## Configuration Files

### codegen.yml

Main configuration for GraphQL Code Generator:
- Schema source (introspection URL)
- Document patterns (where to find operations)
- Output location
- Plugins and their configuration
- Scalar mappings
- Naming conventions

### scripts/generate-grpc-types.sh

Shell script for gRPC type generation:
- Proto file locations
- Output directory
- protoc command configuration

## Dependencies

### GraphQL Type Generation
- `@graphql-codegen/cli` - Code generator CLI
- `@graphql-codegen/typescript` - TypeScript types plugin
- `@graphql-codegen/typescript-operations` - Operations types plugin
- `@graphql-codegen/typescript-react-apollo` - React hooks plugin

### gRPC Type Generation
- `grpc-tools` - Protocol buffer compiler
- `grpc_tools_node_protoc_ts` - TypeScript plugin for protoc
- `@types/google-protobuf` - TypeScript types for protobuf

## Next Steps

After type generation is set up:

1. Define all GraphQL operations (queries, mutations, subscriptions)
2. Implement gRPC clients using generated types
3. Create custom hooks that use generated types
4. Build UI components with type-safe data fetching
