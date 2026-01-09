import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '../services/auth.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Validate user exists and is active
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Validate session is still active
    const session = await this.authService.validateSession(payload.sessionId);
    if (!session) {
      throw new UnauthorizedException('Session expired or invalid');
    }

    // Return authenticated user with session info
    return {
      ...user,
      sessionId: payload.sessionId,
    };
  }
}