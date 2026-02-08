import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { LoggerModule } from './common/logger';
import { CacheModule } from './common/cache';
import { OrganizationsModule } from './modules/organizations';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    CacheModule,
    DatabaseModule,
    OrganizationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
