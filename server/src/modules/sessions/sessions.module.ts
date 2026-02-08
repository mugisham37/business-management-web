import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';

@Module({
  imports: [DatabaseModule, SecurityModule],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
