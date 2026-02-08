import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';
import { PermissionsModule } from '../permissions/permissions.module';
import { RolesModule } from '../roles/roles.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    DatabaseModule,
    SecurityModule,
    PermissionsModule,
    RolesModule,
    LocationsModule,
  ],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
