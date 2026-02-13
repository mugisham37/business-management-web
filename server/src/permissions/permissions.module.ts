import { Module, OnModuleInit } from '@nestjs/common';
import { PermissionRegistry } from './permission-registry';
import { PermissionsService } from './permissions.service';
import { PermissionsResolver } from './permissions.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { CacheModule } from '../cache/cache.module';
import { TenantModule } from '../tenant/tenant.module';
import { MODULE_PERMISSIONS_MAP } from './sample-modules';

@Module({
  imports: [PrismaModule, CacheModule, TenantModule],
  providers: [PermissionRegistry, PermissionsService, PermissionsResolver],
  exports: [PermissionRegistry, PermissionsService],
})
export class PermissionsModule implements OnModuleInit {
  constructor(private readonly permissionRegistry: PermissionRegistry) {}

  /**
   * Register sample module permissions on module initialization
   * In a real application, each feature module would register its own permissions
   */
  onModuleInit() {
    // Register all sample modules with their permissions
    for (const [moduleName, permissions] of Object.entries(MODULE_PERMISSIONS_MAP)) {
      this.permissionRegistry.registerModulePermissions(
        moduleName,
        permissions,
        true, // All modules enabled by default
      );
    }
  }
}
