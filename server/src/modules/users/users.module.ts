import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../../database/database.module';
import { SecurityModule } from '../../common/security/security.module';

@Module({
  imports: [DatabaseModule, SecurityModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
