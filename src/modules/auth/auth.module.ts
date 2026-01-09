import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { DrizzleService } from '../database/drizzle.service';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './services/auth.service';
import { PermissionsService } from './services/permissions.service';
import { MfaService } from './services/mfa.service';
import { AuthController } from './controllers/auth.controller';
import { PermissionsController } from './controllers/permissions.controller';
import { MfaController } from './controllers/mfa.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesGuard } from './guards/roles.guard';
import { DrizzleService } from '../database/drizzle.service';

@Module({
  imports: [
    PassportModule.register({ 
      defaultStrategy: 'jwt',
      session: false,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, PermissionsController, MfaController],
  providers: [
    DrizzleService,
    AuthService,
    PermissionsService,
    MfaService,
    JwtStrategy,
    LocalStrategy,
    JwtAuthGuard,
    LocalAuthGuard,
    PermissionsGuard,
    RolesGuard,
  ],
  exports: [
    AuthService,
    PermissionsService,
    MfaService,
    JwtAuthGuard,
    LocalAuthGuard,
    PermissionsGuard,
    RolesGuard,
    PassportModule,
    JwtModule,
  ],
})
export class AuthModule {}