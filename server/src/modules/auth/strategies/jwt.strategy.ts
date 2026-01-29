import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * JWT Strategy for Passport
 * Used to validate JWT tokens in request headers
 * Extracts JWT from Authorization header (Bearer token)
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Validate JWT payload
   * Called after JWT is successfully verified
   * Attaches user info to request object
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      permissions: payload.permissions || [],
      sessionId: payload.sessionId,
      // Enhanced tier-based fields
      businessTier: payload.businessTier || 'micro',
      featureFlags: payload.featureFlags || [],
      trialExpiresAt: payload.trialExpiresAt ? new Date(payload.trialExpiresAt * 1000) : undefined,
    };
  }
}
