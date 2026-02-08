import { Module } from '@nestjs/common';
import { MFAService } from './mfa.service';
import { DatabaseModule } from '../../database';
import { SecurityModule } from '../../common/security';

@Module({
  imports: [DatabaseModule, SecurityModule],
  providers: [MFAService],
  exports: [MFAService],
})
export class MFAModule {}
