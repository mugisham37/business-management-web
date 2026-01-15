#!/usr/bin/env ts-node

/**
 * GraphQL Resolver Generator Script
 * 
 * Usage: ts-node scripts/generate-resolver.ts <module-name> <entity-name>
 * Example: ts-node scripts/generate-resolver.ts inventory product
 * 
 * This script generates:
 * - Resolver file with CRUD operations
 * - Entity type file
 * - Input type files (create, update)
 * - Connection type file for pagination
 */

import * as fs from 'fs';
import * as path from 'path';

interface GeneratorOptions {
  moduleName: string;
  entityName: string;
  entityNamePascal: string;
  entityNameCamel: string;
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function generateResolverTemplate(options: GeneratorOptions): string {
  const { entityNamePascal, entityNameCamel } = options;
  
  return `import { Resolver, Query, Mutation, Args, ResolveField, Parent, Context, Info, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { BaseResolver } from '../../../common/graphql/base.resolver';
import { DataLoaderService } from '../../../common/graphql/dataloader.service';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { CurrentUser } from '../../auth/decorators/auth.decorators';
import { CurrentTenant } from '../../tenant/decorators/tenant.decorators';
import { ${entityNamePascal}Type } from '../entities/${entityNameCamel}.entity';
import { ${entityNamePascal}Connection } from '../types/${entityNameCamel}.connection';
import { Create${entityNamePascal}Input, Update${entityNamePascal}Input } from '../dto/${entityNameCamel}.dto';
import { PaginationArgs } from '../../../common/graphql/pagination.args';
import { ${entityNamePascal}Service } from '../services/${entityNameCamel}.service';

@Resolver(() => ${entityNamePascal}Type)
export class ${entityNamePascal}Resolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly ${entityNameCamel}Service: ${entityNamePascal}Service,
  ) {
    super(dataLoaderService);
  }

  @Query(() => ${entityNamePascal}Type, { name: '${entityNameCamel}' })
  @UseGuards(PermissionsGuard)
  @Permissions('${entityNameCamel}:read')
  async get${entityNamePascal}(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
    @Info() info: GraphQLResolveInfo,
  ): Promise<${entityNamePascal}Type> {
    const ${entityNameCamel} = await this.${entityNameCamel}Service.findById(id, tenantId);
    
    if (!${entityNameCamel}) {
      throw new Error('${entityNamePascal} not found');
    }
    
    return ${entityNameCamel};
  }

  @Query(() => ${entityNamePascal}Connection, { name: '${entityNameCamel}s' })
  @UseGuards(PermissionsGuard)
  @Permissions('${entityNameCamel}:read')
  async get${entityNamePascal}s(
    @Args() args: PaginationArgs,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<${entityNamePascal}Connection> {
    const { limit, cursor, isForward } = this.parsePaginationArgs(args);
    const result = await this.${entityNameCamel}Service.findAll(tenantId, { limit, cursor, isForward });
    
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

  @Mutation(() => ${entityNamePascal}Type, { name: 'create${entityNamePascal}' })
  @UseGuards(PermissionsGuard)
  @Permissions('${entityNameCamel}:create')
  async create${entityNamePascal}(
    @Args('input') input: Create${entityNamePascal}Input,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<${entityNamePascal}Type> {
    return this.${entityNameCamel}Service.create(input, tenantId, user.id);
  }

  @Mutation(() => ${entityNamePascal}Type, { name: 'update${entityNamePascal}' })
  @UseGuards(PermissionsGuard)
  @Permissions('${entityNameCamel}:update')
  async update${entityNamePascal}(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: Update${entityNamePascal}Input,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<${entityNamePascal}Type> {
    return this.${entityNameCamel}Service.update(id, input, tenantId, user.id);
  }

  @Mutation(() => Boolean, { name: 'delete${entityNamePascal}' })
  @UseGuards(PermissionsGuard)
  @Permissions('${entityNameCamel}:delete')
  async delete${entityNamePascal}(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: any,
    @CurrentTenant() tenantId: string,
  ): Promise<boolean> {
    await this.${entityNameCamel}Service.delete(id, tenantId, user.id);
    return true;
  }

  // Add field resolvers here for relationships
  // Example:
  // @ResolveField(() => RelatedType)
  // async relatedEntity(
  //   @Parent() ${entityNameCamel}: ${entityNamePascal}Type,
  //   @CurrentTenant() tenantId: string,
  // ): Promise<RelatedType> {
  //   const loader = this.getDataLoader(
  //     'related_by_id',
  //     this.relatedService.batchLoadByIds.bind(this.relatedService),
  //   );
  //   return loader.load(${entityNameCamel}.relatedId);
  // }
}
`;
}

function generateEntityTemplate(options: GeneratorOptions): string {
  const { entityNamePascal } = options;
  
  return `import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

@ObjectType()
export class ${entityNamePascal}Type extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  // Add more fields here
}
`;
}

function generateInputTemplate(options: GeneratorOptions): string {
  const { entityNamePascal } = options;
  
  return `import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

@InputType()
export class Create${entityNamePascal}Input {
  @Field()
  @ApiProperty({ description: 'Name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // Add more fields here
}

@InputType()
export class Update${entityNamePascal}Input {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // Add more fields here
}
`;
}

function generateConnectionTemplate(options: GeneratorOptions): string {
  const { entityNamePascal } = options;
  
  return `import { ObjectType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Connection, Edge } from '../../../common/graphql/base.types';
import { ${entityNamePascal}Type } from '../entities/${options.entityNameCamel}.entity';

@ObjectType()
export class ${entityNamePascal}Edge extends Edge<${entityNamePascal}Type> {
  @Field(() => ${entityNamePascal}Type)
  @ApiProperty({ type: ${entityNamePascal}Type })
  node!: ${entityNamePascal}Type;
}

@ObjectType()
export class ${entityNamePascal}Connection extends Connection<${entityNamePascal}Type> {
  @Field(() => [${entityNamePascal}Edge])
  @ApiProperty({ type: [${entityNamePascal}Edge] })
  edges!: ${entityNamePascal}Edge[];
}
`;
}

function generateDocumentation(): string {
  return `# GraphQL Resolver Patterns and Best Practices

## Overview

This document outlines the patterns and best practices for implementing GraphQL resolvers in this project.

## Resolver Structure

All resolvers should extend \`BaseResolver\` and follow this structure:

\`\`\`typescript
@Resolver(() => EntityType)
export class EntityResolver extends BaseResolver {
  constructor(
    protected readonly dataLoaderService: DataLoaderService,
    private readonly entityService: EntityService,
  ) {
    super(dataLoaderService);
  }
  
  // Queries
  // Mutations
  // Field Resolvers
}
\`\`\`

## Authentication and Authorization

### Guards

All resolvers are protected by default with:
- \`JwtAuthGuard\`: Ensures user is authenticated
- \`TenantGuard\`: Ensures tenant context is available
- \`PermissionsGuard\`: Checks specific permissions (applied per operation)

### Decorators

- \`@CurrentUser()\`: Get authenticated user
- \`@CurrentTenant()\`: Get current tenant ID
- \`@Permissions(...)\`: Specify required permissions

## Pagination

Use cursor-based pagination for all list queries:

\`\`\`typescript
@Query(() => EntityConnection)
async entities(@Args() args: PaginationArgs): Promise<EntityConnection> {
  const { limit, cursor, isForward } = this.parsePaginationArgs(args);
  const result = await this.service.findAll(tenantId, { limit, cursor, isForward });
  
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
\`\`\`

## DataLoader Integration

Use DataLoader for all field resolvers that load related entities:

\`\`\`typescript
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
\`\`\`

## Error Handling

Use the error handler utilities for consistent error responses:

\`\`\`typescript
import { GraphQLErrorHandler, NotFoundError } from '../../../common/graphql';

if (!entity) {
  throw new NotFoundError('Entity not found', 'Entity');
}
\`\`\`

## Subscriptions

Implement subscriptions for real-time updates:

\`\`\`typescript
@Subscription(() => EntityType, {
  filter: (payload, variables, context) => {
    return payload.entityCreated.tenantId === context.req.user.tenantId;
  },
})
entityCreated(@CurrentTenant() tenantId: string) {
  return this.pubSub.asyncIterator('ENTITY_CREATED');
}
\`\`\`

## Testing

Write both unit tests and integration tests for all resolvers:

### Unit Test Example

\`\`\`typescript
describe('EntityResolver', () => {
  let resolver: EntityResolver;
  let service: EntityService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EntityResolver,
        { provide: EntityService, useValue: mockService },
        { provide: DataLoaderService, useValue: mockDataLoader },
      ],
    }).compile();

    resolver = module.get(EntityResolver);
    service = module.get(EntityService);
  });

  it('should return entity by id', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue(mockEntity);
    const result = await resolver.getEntity('id', mockUser, 'tenant-1', {} as any);
    expect(result).toEqual(mockEntity);
  });
});
\`\`\`

## Performance Considerations

1. **Use DataLoader**: Always use DataLoader for loading related entities
2. **Limit Pagination**: Cap pagination at 100 items
3. **Cache Results**: Use Redis caching for frequently accessed data
4. **Optimize Queries**: Only select needed fields from database
5. **Monitor Complexity**: Query complexity is automatically monitored

## Security Considerations

1. **Tenant Isolation**: Always filter by tenant ID
2. **Permission Checks**: Apply appropriate permission guards
3. **Input Validation**: Use class-validator decorators
4. **Rate Limiting**: Apply rate limiting to sensitive operations
5. **Audit Logging**: Log all mutations for audit trail
`;
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: ts-node scripts/generate-resolver.ts <module-name> <entity-name>');
    console.error('Example: ts-node scripts/generate-resolver.ts inventory product');
    process.exit(1);
  }

  const [moduleName, entityName] = args;
  const options: GeneratorOptions = {
    moduleName,
    entityName,
    entityNamePascal: toPascalCase(entityName),
    entityNameCamel: toCamelCase(entityName),
  };

  const moduleDir = path.join(process.cwd(), 'src', 'modules', moduleName);
  
  // Create directories if they don't exist
  const dirs = [
    path.join(moduleDir, 'resolvers'),
    path.join(moduleDir, 'entities'),
    path.join(moduleDir, 'dto'),
    path.join(moduleDir, 'types'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Generate files
  const files = [
    {
      path: path.join(moduleDir, 'resolvers', `${entityName}.resolver.ts`),
      content: generateResolverTemplate(options),
    },
    {
      path: path.join(moduleDir, 'entities', `${entityName}.entity.ts`),
      content: generateEntityTemplate(options),
    },
    {
      path: path.join(moduleDir, 'dto', `${entityName}.dto.ts`),
      content: generateInputTemplate(options),
    },
    {
      path: path.join(moduleDir, 'types', `${entityName}.connection.ts`),
      content: generateConnectionTemplate(options),
    },
  ];

  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.warn(`Warning: File already exists: ${file.path}`);
    } else {
      fs.writeFileSync(file.path, file.content);
      console.log(`Created: ${file.path}`);
    }
  });

  // Generate documentation if it doesn't exist
  const docsPath = path.join(process.cwd(), 'docs', 'graphql-resolver-patterns.md');
  if (!fs.existsSync(docsPath)) {
    fs.mkdirSync(path.dirname(docsPath), { recursive: true });
    fs.writeFileSync(docsPath, generateDocumentation());
    console.log(`Created: ${docsPath}`);
  }

  console.log('\nResolver generation complete!');
  console.log(`\nNext steps:`);
  console.log(`1. Implement service methods in ${moduleName}/${entityName}.service.ts`);
  console.log(`2. Add field resolvers for relationships`);
  console.log(`3. Add subscriptions if needed`);
  console.log(`4. Write unit tests`);
  console.log(`5. Register resolver in module`);
}

main();
