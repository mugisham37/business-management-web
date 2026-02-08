import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { DatabaseModule } from '../../database/database.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [DatabaseModule, PermissionsModule],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
