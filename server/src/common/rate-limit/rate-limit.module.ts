import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RateLimitService } from './rate-limit.service';
import { ThrottlerStorageRedisService } from './throttler-storage-redis.service';
import { IpRateLimitGuard } from './guards/ip-rate-limit.guard';
import { UserRateLimitGuard } from './guards/user-rate-limit.guard';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule, CacheModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000, // 1 minute in milliseconds
            limit: 100, // 100 requests per minute (global default)
          },
        ],
        storage: new ThrottlerStorageRedisService(configService),
      }),
    }),
    CacheModule,
  ],
  providers: [RateLimitService, IpRateLimitGuard, UserRateLimitGuard],
  exports: [RateLimitService, IpRateLimitGuard, UserRateLimitGuard, ThrottlerModule],
})
export class RateLimitModule {}
