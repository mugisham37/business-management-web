import { Module } from '@nestjs/common';
import { DataScopeService } from './data-scope.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [DataScopeService],
  exports: [DataScopeService],
})
export class DataScopeModule {}
