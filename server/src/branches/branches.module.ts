import { Module } from '@nestjs/common';
import { BranchesService } from './branches.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
