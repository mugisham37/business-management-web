import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { GoogleOAuthStrategy } from './strategies/google-oauth.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionGuard } from './guards/permission.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';
import { CacheModule } from '../cache/cache.module';
import { TenantModule } from '../tenant/tenant.module';
import { PermissionsModule } from '../permissions/permissions.module';

/**
 * Authentication Module
 * Provides authentication and authorization services
 */
@Module({
  imports: [
    ConfigModule,
    PassportModule,
    PrismaModule,
    OrganizationsModule,
    UsersModule,
    AuditModule,
    CacheModule,
    TenantModule,
    PermissionsModule,
  ],
  providers: [
    AuthService,
    GoogleOAuthStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    JwtAuthGuard,
    PermissionGuard,
  ],
  exports: [AuthService, JwtAuthGuard, PermissionGuard],
})
export class AuthModule {}
