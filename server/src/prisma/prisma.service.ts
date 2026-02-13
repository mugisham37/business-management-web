import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { TenantContextService } from '../tenant/tenant-context.service';
import { createTenantIsolationMiddleware } from '../tenant/prisma-tenant.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor(
    private readonly tenantContextService: TenantContextService,
    private readonly configService: ConfigService,
  ) {
    const databaseUrl = configService.get<string>('DATABASE_URL');
    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['error', 'warn'],
    });

    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();

    // Note: Prisma 7 removed the $use middleware API
    // Tenant isolation should be implemented using Prisma Client Extensions
    // or by manually adding organizationId filters in service methods
    // For now, we'll skip the middleware registration
    // TODO: Migrate to Prisma Client Extensions for tenant isolation
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
