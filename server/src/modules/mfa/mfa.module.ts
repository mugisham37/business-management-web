import { Module } from '@nestjs/common';
import { MFAService } from './mfa.service';
import { MFAController } from './mfa.controller';
import { DatabaseModule } from '../../database';
import { SecurityModule } from '../../common/security';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [MFAController],
  providers: [MFAService],
  exports: [MFAService],
})
export class MFAModule {}
