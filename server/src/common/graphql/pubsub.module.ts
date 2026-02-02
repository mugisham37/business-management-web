import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { Redis } from 'ioredis';
import { PubSubService } from './pubsub.service';

/**
 * PubSub module for GraphQL subscriptions
 * Uses Redis for scalable pub/sub across multiple server instances
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PUB_SUB',
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST', 'localhost');
        const redisPort = configService.get('REDIS_PORT', 6379);
        const redisPassword = configService.get('REDIS_PASSWORD');
        const redisDb = configService.get('REDIS_PUBSUB_DB', 1);

        const options = {
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          db: redisDb,
          retryStrategy: (times: number) => {
            // Reconnect after
            return Math.min(times * 50, 2000);
          },
        };

        return new RedisPubSub({
          publisher: new Redis(options),
          subscriber: new Redis(options),
          connection: options,
        });
      },
      inject: [ConfigService],
    },
    PubSubService,
  ],
  exports: ['PUB_SUB', PubSubService],
})
export class PubSubModule {}
