import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Configuration
import { configValidationSchema } from '../server/config/config.validation';
import { appConfig } from '../server/config/app.config';
import { databaseConfig } from '../server/config/database.config';
import { redisConfig } from '../server/config/redis.config';
import { GraphQLConfigService } from '../server/config/graphql.config';

// Core Modules
import { DatabaseModule } from '../server/modules/database/database.module';
import { CacheModule } from '../server/modules/cache/cache.module';
import { LoggerModule } from '../server/modules/logger/logger.module';
import { GraphQLCommonModule } from '../server/common/graphql/graphql-common.module';
import { ValidationModule } from '../server/common/validation/validation.module';

// Health Check
import { HealthResolver } from './health/health.resolver';

// GraphQL Configuration
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configValidationSchema,
      load: [appConfig, databaseConfig, redisConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Event System
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),

    // GraphQL
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useClass: GraphQLConfigService,
    }),

    // Core Infrastructure Modules
    GraphQLCommonModule,
    ValidationModule,
    DatabaseModule,
    CacheModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [GraphQLConfigService, HealthResolver],
})
export class AppModule {}