import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

/**
 * JWT Authentication Guard
 * 
 * Extends @nestjs/passport AuthGuard('jwt') to protect routes requiring authentication.
 * This guard validates JWT tokens and injects the authenticated user into the request.
 * 
 * Requirements:
 * - 3.4: WHEN authentication succeeds, THE Auth_System SHALL return a JWT 
 *   containing user ID, organization ID, and embedded permissions
 * - 22.4: WHEN a token is validated, THE Auth_System SHALL verify signature, 
 *   expiration, and organization context
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('/profile')
 * async getProfile(@CurrentUser() user: CurrentUserInfo) {
 *   return this.usersService.findById(user.id, user.organizationId);
 * }
 * ```
 * 
 * The guard:
 * 1. Extracts JWT from Authorization header
 * 2. Validates JWT signature and expiration (via JwtStrategy)
 * 3. Validates user exists and is active (via JwtStrategy)
 * 4. Injects user object into request (req.user)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  /**
   * Determines if the request can activate the route
   * 
   * @param context - Execution context
   * @returns true if authenticated, throws UnauthorizedException otherwise
   */
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Call parent AuthGuard which triggers JwtStrategy.validate()
    return super.canActivate(context);
  }

  /**
   * Handle authentication errors
   * 
   * @param err - Error from authentication
   * @param user - User object (if authentication succeeded)
   * @param info - Additional info about the error
   * @returns User object if authenticated
   * @throws UnauthorizedException if authentication failed
   */
  handleRequest(err: any, user: any, info: any) {
    // Log authentication attempts
    if (err || !user) {
      this.logger.debug(`JWT authentication failed: ${info?.message || err?.message || 'Unknown error'}`);
      
      // Provide specific error messages
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not yet valid');
      }
      
      // Generic authentication error
      throw err || new UnauthorizedException('Authentication failed');
    }

    // Authentication successful - user will be injected into request
    this.logger.debug(`JWT authentication successful for user: ${user.id}`);
    return user;
  }
}
