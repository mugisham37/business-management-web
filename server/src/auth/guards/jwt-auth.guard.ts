import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CacheService } from '../../cache/cache.service';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * JWT Authentication Guard
 * Implements requirements 4.6, 9.2
 * 
 * This guard:
 * 1. Validates JWT access tokens using the JwtStrategy
 * 2. Checks if the token is blacklisted in Redis
 * 3. Sets the tenant context on successful authentication
 * 
 * Can be used with both REST and GraphQL endpoints
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly cacheService: CacheService,
    private readonly tenantContextService: TenantContextService,
  ) {
    super();
  }

  /**
   * Get the request object from either HTTP or GraphQL context
   */
  getRequest(context: ExecutionContext) {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }

    return context.switchToHttp().getRequest();
  }

  /**
   * Main guard logic
   * Validates token, checks blacklist, and sets tenant context
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    const token = this.extractToken(request);

    // Check if token is blacklisted (logout/revocation)
    if (token && (await this.cacheService.isTokenBlacklisted(token))) {
      throw new UnauthorizedException('Token has been revoked');
    }

    // Call parent canActivate to run JWT validation via JwtStrategy
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    // At this point, request.user has been populated by JwtStrategy.validate()
    const user = request.user;

    if (!user || !user.userId || !user.organizationId || !user.role) {
      throw new UnauthorizedException('Invalid user context');
    }

    // Set tenant context for the request lifecycle
    // This enables automatic tenant isolation in Prisma middleware
    this.tenantContextService.setTenantContext(
      user.organizationId,
      user.userId,
      user.role,
    );

    return true;
  }

  /**
   * Extract JWT token from Authorization header
   */
  private extractToken(request: any): string | null {
    const authHeader = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    return authHeader.substring(7);
  }

  /**
   * Handle authentication errors
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      throw err || new UnauthorizedException('Authentication failed');
    }

    return user;
  }
}
