import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
