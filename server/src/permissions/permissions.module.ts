import { Module } from '@nestjs/common';
import { PermissionRegistry } from './permission-registry';
import { PermissionsService } from './permissions.service';
import { PermissionsResolver } from './permissions.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [PrismaModule, CacheModule, TenantModule],
  providers: [PermissionRegistry, PermissionsService, PermissionsResolver],
  exports: [PermissionRegistry, PermissionsService],
})
export class PermissionsModule {}
