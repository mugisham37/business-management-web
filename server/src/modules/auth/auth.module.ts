import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { MFAModule } from '../mfa/mfa.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { AuditModule } from '../../common/audit/audit.module';
import { RateLimitModule } from '../../common/rate-limit/rate-limit.module';
import { GoogleStrategy, LocalStrategy, LocalTeamMemberStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    UsersModule,
    SessionsModule,
    MFAModule,
    PermissionsModule,
    OrganizationsModule,
    AuditModule,
    RateLimitModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    LocalStrategy,
    LocalTeamMemberStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
