import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { LoggerModule } from './common/logger';
import { CacheModule } from './common/cache';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule,
    CacheModule,
    DatabaseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
