import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';

/**
 * Authentication Module
 * Provides authentication and authorization services
 */
@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    OrganizationsModule,
    UsersModule,
    AuditModule,
    CacheModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
