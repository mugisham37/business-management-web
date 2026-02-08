import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { LocationsModule } from '../locations/locations.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    PermissionsModule,
    RolesModule,
    LocationsModule,
    AuditModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
