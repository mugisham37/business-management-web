import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [PrismaModule, TenantModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
