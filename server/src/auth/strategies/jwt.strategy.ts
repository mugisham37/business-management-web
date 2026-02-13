import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AccessTokenPayload } from '../../common/utils/token.util';

/**
 * JWT Strategy for Access Token validation
 * Implements requirements 3.1, 4.3
 * 
 * This strategy validates JWT access tokens and extracts the payload
 * for use in authentication guards and request context.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload and return user context
   * This method is called automatically by Passport after token verification
   * 
   * @param payload - Decoded JWT payload
   * @returns User context object for request.user
   */
  async validate(payload: AccessTokenPayload) {
    // Verify this is an access token
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate required fields
    if (!payload.user_id || !payload.organization_id || !payload.role) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return user context that will be attached to request.user
    return {
      userId: payload.user_id,
      organizationId: payload.organization_id,
      role: payload.role,
    };
  }
}
