import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';
import { UsersModule } from '../users/users.module';
import { SessionsModule } from '../sessions/sessions.module';
import { MFAModule } from '../mfa/mfa.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    UsersModule,
    SessionsModule,
    MFAModule,
    PermissionsModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
