import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, TenantModule, AuditModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
