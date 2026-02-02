import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../services/auth.service';
import { JwtPayload, AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
      issuer: configService.get<string>('JWT_ISSUER', 'business-management-platform'),
      audience: configService.get<string>('JWT_AUDIENCE', 'business-management-platform'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    // Validate user exists and is active
    const user = await this.authService.validateUser(payload.sub);
    
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    // Validate session if present
    if (payload.sessionId) {
      const session = await this.authService.validateSession(payload.sessionId);
      if (!session) {
        throw new UnauthorizedException('Session invalid or expired');
      }
    }

    // Return authenticated user with enhanced context
    return {
      ...user,
      sessionId: payload.sessionId,
      // Add security context from JWT payload
      securityContext: {
        deviceFingerprint: payload.deviceFingerprint || '',
        deviceTrustScore: 70, // Default trust score
        networkTrust: payload.networkTrust || 50,
        riskScore: payload.riskScore || 30,
        lastRiskAssessment: new Date(),
        requiresMfa: false,
        mfaVerified: false,
        ipAddress: '',
        userAgent: '',
        sessionStartTime: new Date(payload.iat * 1000),
        lastActivity: new Date(),
      },
    };
  }
}