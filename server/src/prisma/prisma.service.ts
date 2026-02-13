import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../tenant/tenant-context.service';
import { createTenantIsolationMiddleware } from '../tenant/prisma-tenant.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly tenantContextService: TenantContextService) {
    super();
  }

  async onModuleInit() {
    await this.$connect();

    // Register tenant isolation middleware using $use from PrismaClient
    (this as any).$use(
      createTenantIsolationMiddleware(this.tenantContextService),
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
