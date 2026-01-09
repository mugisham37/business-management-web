import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RealtimeGateway } from './gateways/realtime.gateway';
import { RealtimeService } from './services/realtime.service';
import { ConnectionManagerService } from './services/connection-manager.service';
import { RealtimeController } from './controllers/realtime.controller';
import { AuthModule } from '../auth/auth.module';
import { TenantModule } from '../tenant/tenant.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    AuthModule,
    TenantModule,
    LoggerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [RealtimeController],
  providers: [
    RealtimeGateway,
    RealtimeService,
    ConnectionManagerService,
  ],
  exports: [
    RealtimeService,
    RealtimeGateway,
    ConnectionManagerService,
  ],
})
export class RealtimeModule {}