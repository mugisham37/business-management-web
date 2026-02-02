import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { SecurityService } from '../services/security.service';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { SessionService } from '../services/session.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

/**
 * Advanced Authentication Guard
 * 
 * Provides comprehensive security validation beyond basic JWT authentication.
 * Implements risk-based authentication, session validation, and security policies.
 * 
 * Usage:
 * @UseGuards(JwtAuthGuard, AdvancedAuthGuard)
 * @AdvancedAuth({ requireMfa: true, maxRiskScore: 50 })
 * async sensitiveOperation() { ... }
 * 
 * Features:
 * - Risk-based authentication
 * - MFA requirement enforcement
 * - Session validation and security
 * - Device trust verification
 * - Location-based access control
 * - Time-based access restrictions
 */
@Injectable()
export class AdvancedAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly securityService: SecurityService,
    private readonly riskAssessmentService: RiskAssessmentService,
    private readonly sessionService: SessionService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get advanced auth requirements from decorator
    const advancedAuthConfig = this.reflector.getAllAndOverride<any>('advancedAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no advanced auth required, allow access
    if (!advancedAuthConfig) {
      return true;
    }

    // Get user and request info from context
    const { user, request } = this.getContextInfo(context);
    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      // 1. Validate session security
      await this.validateSession(user, request, advancedAuthConfig);

      // 2. Perform risk assessment
      await this.performRiskAssessment(user, request, advancedAuthConfig);

      // 3. Check MFA requirements
      await this.validateMfaRequirements(user, advancedAuthConfig);

      // 4. Validate device trust
      await this.validateDeviceTrust(user, request, advancedAuthConfig);

      // 5. Check time-based restrictions
      await this.validateTimeRestrictions(user, advancedAuthConfig);

      // 6. Validate location-based access
      await this.validateLocationAccess(user, request, advancedAuthConfig);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      
      // Log security event
      await this.securityService.logSecurityEvent(
        user.id,
        user.tenantId,
        'advanced_auth_failure',
        {
          error: error.message,
          config: advancedAuthConfig,
          ip: request?.ip,
          userAgent: request?.headers?.['user-agent'],
        }
      );

      throw new UnauthorizedException('Advanced authentication failed');
    }
  }

  /**
   * Validate session security
   */
  private async validateSession(
    user: AuthenticatedUser,
    request: any,
    config: any
  ): Promise<void> {
    if (config.validateSession === false) {
      return;
    }

    const sessionId = request?.headers?.['x-session-id'] || user.sessionId;
    if (!sessionId) {
      throw new UnauthorizedException('Session ID required');
    }

    const isValidSession = await this.sessionService.validateSession(
      sessionId,
      user.id,
      user.tenantId
    );

    if (!isValidSession) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }

  /**
   * Perform risk assessment
   */
  private async performRiskAssessment(
    user: AuthenticatedUser,
    request: any,
    config: any
  ): Promise<void> {
    const maxRiskScore = config.maxRiskScore || 100;
    
    const riskScore = await this.riskAssessmentService.calculateRiskScore(
      user.id,
      user.tenantId,
      {
        ip: request?.ip,
        userAgent: request?.headers?.['user-agent'],
        location: request?.headers?.['x-user-location'],
        deviceFingerprint: request?.headers?.['x-device-fingerprint'],
      }
    );

    if (riskScore > maxRiskScore) {
      throw new UnauthorizedException(
        `Access denied due to high risk score: ${riskScore}. Maximum allowed: ${maxRiskScore}`
      );
    }
  }

  /**
   * Validate MFA requirements
   */
  private async validateMfaRequirements(
    user: AuthenticatedUser,
    config: any
  ): Promise<void> {
    if (!config.requireMfa) {
      return;
    }

    // Check if user has MFA enabled
    const hasMfa = await this.securityService.isMfaEnabled(user.id, user.tenantId);
    if (!hasMfa) {
      throw new UnauthorizedException('Multi-factor authentication required');
    }

    // Check if MFA was recently verified (within last 30 minutes)
    const mfaVerified = await this.securityService.isMfaRecentlyVerified(
      user.id,
      user.tenantId,
      config.mfaGracePeriod || 30 * 60 * 1000 // 30 minutes
    );

    if (!mfaVerified) {
      throw new UnauthorizedException('Recent MFA verification required');
    }
  }

  /**
   * Validate device trust
   */
  private async validateDeviceTrust(
    user: AuthenticatedUser,
    request: any,
    config: any
  ): Promise<void> {
    if (!config.requireTrustedDevice) {
      return;
    }

    const deviceFingerprint = request?.headers?.['x-device-fingerprint'];
    if (!deviceFingerprint) {
      throw new UnauthorizedException('Device fingerprint required');
    }

    const isTrustedDevice = await this.securityService.isDeviceTrusted(
      user.id,
      user.tenantId,
      deviceFingerprint
    );

    if (!isTrustedDevice) {
      throw new UnauthorizedException('Trusted device required');
    }
  }

  /**
   * Validate time-based restrictions
   */
  private async validateTimeRestrictions(
    user: AuthenticatedUser,
    config: any
  ): Promise<void> {
    if (!config.timeRestrictions) {
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const { allowedHours, allowedDays } = config.timeRestrictions;

    if (allowedHours && !allowedHours.includes(currentHour)) {
      throw new UnauthorizedException(
        `Access not allowed at this time. Allowed hours: ${allowedHours.join(', ')}`
      );
    }

    if (allowedDays && !allowedDays.includes(currentDay)) {
      throw new UnauthorizedException(
        `Access not allowed on this day. Allowed days: ${allowedDays.join(', ')}`
      );
    }
  }

  /**
   * Validate location-based access
   */
  private async validateLocationAccess(
    user: AuthenticatedUser,
    request: any,
    config: any
  ): Promise<void> {
    if (!config.locationRestrictions) {
      return;
    }

    const userLocation = request?.headers?.['x-user-location'];
    const userIp = request?.ip;

    if (!userLocation && !userIp) {
      throw new UnauthorizedException('Location information required');
    }

    const isLocationAllowed = await this.securityService.isLocationAllowed(
      user.id,
      user.tenantId,
      userLocation,
      userIp,
      config.locationRestrictions
    );

    if (!isLocationAllowed) {
      throw new UnauthorizedException('Access not allowed from this location');
    }
  }

  /**
   * Extract user and request info from execution context
   */
  private getContextInfo(context: ExecutionContext): { user: AuthenticatedUser | null; request: any } {
    try {
      // Try GraphQL context first
      const gqlContext = GqlExecutionContext.create(context);
      const gqlRequest = gqlContext.getContext()?.req;
      if (gqlRequest) {
        return {
          user: gqlRequest.user,
          request: gqlRequest,
        };
      }

      // Fallback to HTTP context
      const request = context.switchToHttp().getRequest();
      return {
        user: request?.user || null,
        request,
      };
    } catch (error) {
      return { user: null, request: null };
    }
  }
}