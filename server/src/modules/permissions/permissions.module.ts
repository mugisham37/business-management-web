import { Module, forwardRef } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { DatabaseModule } from '../../database/database.module';
import { CacheModule } from '../../common/cache/cache.module';
import { AuditModule } from '../../common/audit/audit.module';

@Module({
  imports: [DatabaseModule, CacheModule, forwardRef(() => AuditModule)],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
