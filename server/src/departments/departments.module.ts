import { Module, forwardRef } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { DepartmentsResolver } from './departments.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { UsersModule } from '../users/users.module';
import { CacheModule } from '../cache/cache.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    CacheModule,
    PermissionsModule,
    forwardRef(() => UsersModule),
  ],
  providers: [DepartmentsService, DepartmentsResolver],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
