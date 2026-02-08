import { Injectable, NestMiddleware, UnauthorizedException, Logger } from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import * as jwt from 'jsonwebtoken';

/**
 * Tenant Isolation Middleware
 * 
 * Extracts organization ID from JWT and injects it into request context
 * to enforce multi-tenant data isolation at every layer.
 * 
 * Requirements:
 * - 16.1: WHEN any database query is executed, THE Auth_System SHALL include 
 *   organization ID in the query filter
 * - 16.3: WHEN a JWT is validated, THE Auth_System SHALL extract and enforce 
 *   the organization context
 * 
 * This middleware runs on all protected routes and ensures that:
 * 1. JWT contains valid organization ID
 * 2. Organization ID is available in request context for downstream services
 * 3. All subsequent database queries can enforce tenant isolation
 */
@Injectable()
export class TenantIsolationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantIsolationMiddleware.name);
  private readonly JWT_SECRET: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
  }

  /**
   * Extract organization ID from JWT and inject into request context
   * 
   * @param req - Fastify request object
   * @param res - Fastify reply object
   * @param next - Next middleware function
   */
  async use(req: FastifyRequest['raw'], res: FastifyReply['raw'], next: () => void) {
    try {
      // Extract authorization header
      const authHeader = req.headers['authorization'];

      if (!authHeader) {
        // No auth header - let auth guards handle this
        // This middleware only extracts org context when token is present
        return next();
      }

      // Extract token from "Bearer <token>" format
      const parts = authHeader.split(' ');
      if (parts.length !== 2 || parts[0] !== 'Bearer') {
        this.logger.warn('Invalid authorization header format');
        return next();
      }

      const token = parts[1];

      try {
        // Decode and verify JWT
        const payload = jwt.verify(token, this.JWT_SECRET) as any;

        // Extract organization ID from JWT payload
        const organizationId = payload.organizationId;

        if (!organizationId) {
          this.logger.warn('JWT missing organizationId claim');
          // Don't throw - let auth guards handle this
          return next();
        }

        // Inject organization ID into request object for downstream use
        // This makes it available to controllers, services, and guards
        (req as any).organizationId = organizationId;
        (req as any).userId = payload.sub;
        (req as any).userEmail = payload.email;
        (req as any).userRoles = payload.roles || [];
        (req as any).userPermissions = payload.permissions || [];

        this.logger.debug(
          `Tenant context injected: orgId=${organizationId}, userId=${payload.sub}`,
        );
      } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
          this.logger.warn('Invalid JWT token');
          // Let auth guards handle invalid tokens
        } else if (error instanceof jwt.TokenExpiredError) {
          this.logger.warn('Expired JWT token');
          // Let auth guards handle expired tokens
        } else {
          throw error;
        }
      }

      next();
    } catch (error) {
      this.logger.error('Error in tenant isolation middleware:', error);
      // Pass error to error handler
      next();
    }
  }
}
