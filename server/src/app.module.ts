import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import depthLimit from 'graphql-depth-limit';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { HealthModule } from './health/health.module';
import { TenantModule } from './tenant/tenant.module';
import { BranchesModule } from './branches/branches.module';
import { DepartmentsModule } from './departments/departments.module';
import { AuthModule } from './auth/auth.module';
import { validate } from './config/env.validation';
import { loggerConfig } from './config/logger.config';
import { AuthThrottlerGuard } from './common/guards/auth-throttler.guard';
import { calculateComplexity } from './common/utils/graphql-complexity.util';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '.env',
    }),
    WinstonModule.forRoot(loggerConfig),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute for general endpoints
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 5, // 5 requests per 15 minutes for auth endpoints
      },
    ]),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      typePaths: ['./**/*.graphql'],
      definitions: {
        path: join(process.cwd(), 'src/graphql.ts'),
        outputAs: 'class',
      },
      playground: true,
      introspection: true,
      context: ({ req, res }: { req: any; res: any }) => ({ req, res }),
      validationRules: [
        // Query depth limiting (max 10 levels)
        depthLimit(10),
      ],
      plugins: [
        {
          async requestDidStart() {
            return {
              async didResolveOperation(requestContext: any) {
                // Query complexity limiting
                const complexity = calculateComplexity(requestContext);
                const maxComplexity = 1000; // Maximum complexity score

                if (complexity > maxComplexity) {
                  throw new Error(
                    `Query is too complex: ${complexity}. Maximum allowed complexity: ${maxComplexity}`,
                  );
                }
              },
            };
          },
        },
      ],
    }),
    TenantModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    AuthModule,
    BranchesModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthThrottlerGuard,
    },
  ],
})
export class AppModule {}
