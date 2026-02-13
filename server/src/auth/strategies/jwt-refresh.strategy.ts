import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenPayload } from '../../common/utils/token.util';

/**
 * JWT Refresh Strategy for Refresh Token validation
 * Implements requirements 4.3
 * 
 * This strategy validates JWT refresh tokens and extracts the payload
 * for use in token refresh operations.
 */
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  /**
   * Validate JWT refresh token payload and return user context
   * This method is called automatically by Passport after token verification
   * 
   * @param req - Express request object (contains the raw token)
   * @param payload - Decoded JWT payload
   * @returns User context object with refresh token for request.user
   */
  async validate(req: any, payload: RefreshTokenPayload) {
    // Verify this is a refresh token
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Validate required fields
    if (
      !payload.user_id ||
      !payload.organization_id ||
      !payload.role ||
      !payload.family_id
    ) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Extract the raw token from the Authorization header
    const authHeader = req.headers.authorization;
    const refreshToken = authHeader?.replace('Bearer ', '');

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Return user context with refresh token that will be attached to request.user
    return {
      userId: payload.user_id,
      organizationId: payload.organization_id,
      role: payload.role,
      familyId: payload.family_id,
      refreshToken, // Include raw token for database lookup
    };
  }
}
