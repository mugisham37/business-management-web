import { Module, forwardRef } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { BranchesResolver } from './branches.resolver';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { UsersModule } from '../users/users.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    TenantModule,
    CacheModule,
    forwardRef(() => UsersModule),
  ],
  providers: [BranchesService, BranchesResolver],
  exports: [BranchesService],
})
export class BranchesModule {}
