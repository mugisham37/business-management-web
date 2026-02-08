import { Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { DatabaseModule } from '../../database/database.module';
import { CacheModule } from '../../common/cache/cache.module';

@Module({
  imports: [DatabaseModule, CacheModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
