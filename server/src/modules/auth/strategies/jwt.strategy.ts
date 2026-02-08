import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../auth.service';
import { User } from '@prisma/client';

/**
 * JWT Strategy for protected routes
 * 
 * Requirement 22.4: WHEN a token is validated, THE Auth_System SHALL verify 
 * signature, expiration, and organization context
 * 
 * Requirement 16.3: WHEN a JWT is validated, THE Auth_System SHALL extract 
 * and enforce the organization context
 * 
 * This strategy validates JWT tokens and extracts user information for protected routes.
 * It ensures the user still exists, is active, and belongs to the correct organization.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private readonly users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Reject expired tokens
      secretOrKey: process.env.JWT_SECRET || 'development-secret-change-in-production',
    });

    if (
      !process.env.JWT_SECRET ||
      process.env.JWT_SECRET === 'development-secret-change-in-production'
    ) {
      this.logger.warn('WARNING: Using default JWT secret. Set JWT_SECRET in production.');
    }
  }

  /**
   * Validate JWT payload and extract user
   * 
   * This method is called by Passport after the JWT signature and expiration
   * have been verified. It validates that the user still exists and is active,
   * and enforces organization context.
   * 
   * Requirement 22.4: Validates token signature, expiration, and organization context
   * Requirement 16.3: Extracts and enforces organization context from JWT
   * 
   * @param payload - Decoded JWT payload
   * @returns User object if valid
   * @throws UnauthorizedException if user is invalid or inactive
   */
  async validate(payload: JwtPayload): Promise<User> {
    this.logger.debug(`JWT validation for user: ${payload.sub}, org: ${payload.organizationId}`);

    // Extract user ID and organization ID from payload
    const userId = payload.sub;
    const organizationId = payload.organizationId;

    if (!userId || !organizationId) {
      this.logger.error('JWT payload missing required fields (sub or organizationId)');
      throw new UnauthorizedException('Invalid token payload');
    }

    // Verify user still exists and belongs to the organization
    const user = await this.users.findById(userId, organizationId);

    if (!user) {
      this.logger.debug(`JWT validation failed: user not found: ${userId}`);
      throw new UnauthorizedException('User not found');
    }

    // Verify user belongs to the organization in the token
    if (user.organizationId !== organizationId) {
      this.logger.error(
        `Security violation: User ${userId} does not belong to organization ${organizationId}`,
      );
      throw new UnauthorizedException('Invalid token');
    }

    // Check user status
    if (user.status !== 'active') {
      this.logger.debug(`JWT validation failed: user not active: ${userId}, status: ${user.status}`);
      
      // Provide specific message for locked accounts
      if (user.status === 'locked' && user.lockedUntil && user.lockedUntil > new Date()) {
        throw new UnauthorizedException(`User account is locked until ${user.lockedUntil.toISOString()}`);
      }
      
      throw new UnauthorizedException('User account is not active');
    }

    this.logger.debug(`JWT validation successful for user: ${userId}`);

    // Return user object (will be attached to request as req.user)
    return user;
  }
}
