import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database';
import { LoggerModule } from './common/logger';
import { CacheModule } from './common/cache';
import { OrganizationsModule } from './modules/organizations';
import { AuthModule } from './modules/auth';
import { TenantIsolationMiddleware } from './common/middleware';

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
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  /**
   * Configure middleware for tenant isolation
   * 
   * The TenantIsolationMiddleware extracts organization ID from JWT
   * and injects it into request context for all routes.
   * 
   * Requirements:
   * - 16.1: WHEN any database query is executed, THE Auth_System SHALL include 
   *   organization ID in the query filter
   * - 16.3: WHEN a JWT is validated, THE Auth_System SHALL extract and enforce 
   *   the organization context
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantIsolationMiddleware)
      .forRoutes('*'); // Apply to all routes
  }
}
