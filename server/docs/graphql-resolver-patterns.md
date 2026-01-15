# GraphQL Resolver Patterns and Best Practices

## Overview

This document outlines the patterns and best practices for implementing GraphQL resolvers in the unified business management platform. All resolvers follow consistent patterns for authentication, authorization, pagination, error handling, and performance optimization.

## Table of Contents

1. [Resolver Structure](#resolver-structure)
2. [Authentication and Authorization](#authentication-and-authorization)
3. [Pagination](#pagination)
4. [DataLoader Integration](#dataloader-integration)
5. [Error Handling](#error-handling)
6. [Subscriptions](#subscriptions)
7. [Testing](#testing)
8. [Performance Considerations](#performance-considerations)
9. [Security Considerations](#security-considerations)

## Resolver Structure

All resolvers should extend `BaseResolver` and follow this structure:

```typescript
import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

@Resolver(() => EntityType)
export class EntityResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly entityService: EntityService,
  ) {
    super(dataLoaderService);
  }
  
  // Queries
  @Query(() => EntityType)
  async entity(@Args('id') id: string): Promise<EntityType> {
    // Implementation
  }
  
  // Mutations
  @Mutation(() => EntityType)
  async createEntity(@Args('input') input: CreateEntityInput): Promise<EntityType> {
    // Implementation
  }
  
  // Field Resolvers
  @ResolveField(() => RelatedType)
  async relatedEntity(@Parent() entity: EntityType): Promise<RelatedType> {
    // Implementation
  }
}
```

## Authentication and Authorization

### Guards

All resolvers are protected by default with:
- `JwtAuthGuard`: Ensures user is authenticated
- `TenantGuard`: Ensures tenant context is available
- `PermissionsGuard`: Checks specific permissions (applied per operation)

The `BaseResolver` class applies these guards automatically:

```typescript
@UseGuards(JwtAuthGuard, TenantGuard)
@UseInterceptors(TenantInterceptor)
export abstract class BaseResolver {
  // ...
}
```

### Decorators

Use these decorators to access authentication context:

- `@CurrentUser()`: Get authenticated user object
- `@CurrentTenant()`: Get current tenant ID
- `@Permissions(...)`: Specify required permissions for an operation

Example:

```typescript
@Query(() => EntityType)
@UseGuards(PermissionsGuard)
@Permissions('entity:read')
async entity(
  @Args('id') id: string,
  @CurrentUser() user: any,
  @CurrentTenant() tenantId: string,
): Promise<EntityType> {
  return this.entityService.findById(id, tenantId);
}
```

## Pagination

Use cursor-based pagination for all list queries following the Relay specification:

```typescript
@Query(() => EntityConnection)
@UseGuards(PermissionsGuard)
@Permissions('entity:read')
async entities(
  @Args() args: PaginationArgs,
  @CurrentTenant() tenantId: string,
): Promise<EntityConnection> {
  const { limit, cursor, isForward } = this.parsePaginationArgs(args);
  const result = await this.entityService.findAll(tenantId, { limit, cursor, isForward });
  
  return {
    edges: this.createEdges(result.items, item => item.id),
    pageInfo: this.createPageInfo(
      result.hasNextPage,
      result.hasPreviousPage,
      result.items[0]?.id,
      result.items[result.items.length - 1]?.id,
    ),
    totalCount: result.totalCount,
  };
}
```

### Pagination Arguments

Clients can use these arguments:
- `first`: Number of items to fetch from start
- `after`: Cursor to fetch items after
- `last`: Number of items to fetch from end
- `before`: Cursor to fetch items before

### Pagination Limits

- Maximum page size: 100 items
- Default page size: 10 items
- Cursors are opaque base64-encoded strings

## DataLoader Integration

Use DataLoader for all field resolvers that load related entities to prevent N+1 query problems:

```typescript
@ResolveField(() => RelatedType)
async relatedEntity(
  @Parent() entity: EntityType,
  @CurrentTenant() tenantId: string,
): Promise<RelatedType> {
  const loader = this.getDataLoader(
    'related_by_id',
    this.relatedService.batchLoadByIds.bind(this.relatedService),
  );
  return loader.load(entity.relatedId);
}
```

### Service Batch Loading Methods

Services must implement batch loading methods for DataLoader:

```typescript
export class EntityService {
  async batchLoadByIds(ids: readonly string[]): Promise<(Entity | Error)[]> {
    const entities = await this.db
      .select()
      .from(entityTable)
      .where(inArray(entityTable.id, [...ids]));

    const entityMap = new Map<string, Entity>();
    entities.forEach(entity => entityMap.set(entity.id, entity));

    return ids.map(id => entityMap.get(id) || new Error(`Entity not found: ${id}`));
  }
}
```

## Error Handling

Use the error handler utilities for consistent error responses:

```typescript
import {
  GraphQLErrorHandler,
  NotFoundError,
  ValidationError,
  ForbiddenError,
  TenantIsolationError,
} from '../../../common/graphql';

// Not found error
if (!entity) {
  throw new NotFoundError('Entity not found', 'Entity');
}

// Validation error
if (errors.length > 0) {
  throw new ValidationError('Validation failed', errors);
}

// Authorization error
if (!hasPermission) {
  throw new ForbiddenError('Insufficient permissions');
}

// Tenant isolation error
if (entity.tenantId !== currentTenantId) {
  throw new TenantIsolationError();
}
```

### Error Codes

All errors include these standard codes:
- `UNAUTHENTICATED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `CROSS_TENANT_ACCESS`: Tenant isolation violation
- `QUERY_TOO_COMPLEX`: Query complexity exceeded
- `QUERY_TOO_DEEP`: Query depth exceeded
- `INTERNAL_SERVER_ERROR`: Unexpected error

## Subscriptions

Implement subscriptions for real-time updates:

```typescript
import { Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@Subscription(() => EntityType, {
  filter: (payload, variables, context) => {
    // Filter by tenant
    return payload.entityCreated.tenantId === context.req.user.tenantId;
  },
})
entityCreated(@CurrentTenant() tenantId: string) {
  return this.pubSub.asyncIterator('ENTITY_CREATED');
}
```

### Publishing Events

Publish subscription events from services:

```typescript
export class EntityService {
  constructor(
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  async create(input: CreateEntityInput, tenantId: string): Promise<Entity> {
    const entity = await this.db.insert(entityTable).values({
      ...input,
      tenantId,
    });

    // Publish subscription event
    await this.pubSub.publish('ENTITY_CREATED', {
      entityCreated: entity,
    });

    return entity;
  }
}
```

## Testing

Write both unit tests and integration tests for all resolvers.

### Unit Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { EntityResolver } from './entity.resolver';
import { EntityService } from '../services/entity.service';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';

describe('EntityResolver', () => {
  let resolver: EntityResolver;
  let service: EntityService;

  const mockUser = {
    id: 'user-1',
    tenantId: 'tenant-1',
    permissions: ['entity:read', 'entity:create'],
  };

  const mockEntity = {
    id: 'entity-1',
    tenantId: 'tenant-1',
    name: 'Test Entity',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EntityResolver,
        {
          provide: EntityService,
          useValue: {
            findById: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: DataLoaderService,
          useValue: {
            getLoader: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<EntityResolver>(EntityResolver);
    service = module.get<EntityService>(EntityService);
  });

  describe('entity query', () => {
    it('should return entity by id', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockEntity);

      const result = await resolver.entity('entity-1', mockUser, 'tenant-1', {} as any);

      expect(result).toEqual(mockEntity);
      expect(service.findById).toHaveBeenCalledWith('entity-1', 'tenant-1');
    });

    it('should throw error when entity not found', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(null);

      await expect(
        resolver.entity('nonexistent', mockUser, 'tenant-1', {} as any)
      ).rejects.toThrow('Entity not found');
    });
  });
});
```

### Integration Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';

describe('Entity GraphQL Integration', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Authenticate
    const loginResponse = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { login(email: "test@example.com", password: "password") { token } }`,
      });

    authToken = loginResponse.body.data.login.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and query entity', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `
          mutation CreateEntity($input: CreateEntityInput!) {
            createEntity(input: $input) {
              id
              name
            }
          }
        `,
        variables: {
          input: { name: 'Test Entity' },
        },
      });

    expect(createResponse.status).toBe(200);
    expect(createResponse.body.data.createEntity).toHaveProperty('id');

    const entityId = createResponse.body.data.createEntity.id;

    const queryResponse = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        query: `query GetEntity($id: ID!) { entity(id: $id) { id name } }`,
        variables: { id: entityId },
      });

    expect(queryResponse.status).toBe(200);
    expect(queryResponse.body.data.entity.id).toBe(entityId);
  });
});
```

## Performance Considerations

1. **Use DataLoader**: Always use DataLoader for loading related entities to prevent N+1 queries
2. **Limit Pagination**: Cap pagination at 100 items to prevent resource exhaustion
3. **Cache Results**: Use Redis caching for frequently accessed data
4. **Optimize Queries**: Only select needed fields from database using field selection
5. **Monitor Complexity**: Query complexity is automatically monitored and limited
6. **Lazy Field Resolvers**: Field resolvers only execute when fields are requested

### Query Complexity Limits

- Maximum complexity: 1000
- Maximum depth: 10 levels
- Queries exceeding limits are rejected before execution

## Security Considerations

1. **Tenant Isolation**: Always filter by tenant ID in all queries
2. **Permission Checks**: Apply appropriate permission guards to all operations
3. **Input Validation**: Use class-validator decorators on all input types
4. **Rate Limiting**: Apply rate limiting to sensitive operations
5. **Audit Logging**: Log all mutations for audit trail
6. **Cursor Opacity**: Cursors are base64-encoded and cannot be manipulated
7. **Error Sanitization**: Internal errors are sanitized in production

### Tenant Isolation Pattern

```typescript
// Always validate tenant access
protected validateTenantAccess(entity: { tenantId: string }, currentTenantId: string): void {
  if (entity.tenantId !== currentTenantId) {
    throw new TenantIsolationError();
  }
}

// Always filter by tenant
const entities = await this.db
  .select()
  .from(entityTable)
  .where(eq(entityTable.tenantId, tenantId));
```

## Code Generation

Use the resolver generator script to create new resolvers:

```bash
ts-node scripts/generate-resolver.ts <module-name> <entity-name>
```

Example:

```bash
ts-node scripts/generate-resolver.ts inventory product
```

This generates:
- Resolver file with CRUD operations
- Entity type file
- Input type files (create, update)
- Connection type file for pagination

## Additional Resources

- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Relay Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
- [DataLoader Documentation](https://github.com/graphql/dataloader)
- [NestJS GraphQL Documentation](https://docs.nestjs.com/graphql/quick-start)
