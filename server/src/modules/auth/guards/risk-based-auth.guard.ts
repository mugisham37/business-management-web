import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { RiskAssessmentService } from '../services/risk-assessment.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

export interface RiskBasedAuthOptions {
  maxRiskScore?: number;
  requiredActions?: string[];
  blockCritical?: boolean;
}

@Injectable()
export class RiskBasedAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private riskAssessmentService: RiskAssessmentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const riskOptions = this.reflector.getAllAndOverride<RiskBasedAuthOptions>('riskBasedAuth', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!riskOptions) {
      return true; // No risk-based auth required
    }

    const request = this.getRequest(context);
    const user: AuthenticatedUser = request.user;

    if (!user) {
      return false; // User must be authenticated first
    }

    // Get current risk assessment from user context or calculate new one
    const riskAssessment = user.securityContext?.riskScore 
      ? { score: user.securityContext.riskScore, level: this.determineRiskLevel(user.securityContext.riskScore) }
      : await this.calculateCurrentRisk(user, request);

    // Check risk score threshold
    const maxRiskScore = riskOptions.maxRiskScore || 50;
    if (riskAssessment.score > maxRiskScore) {
      throw new ForbiddenException(`Access denied due to high risk score: ${riskAssessment.score}`);
    }

    // Block critical risk by default
    if (riskOptions.blockCritical !== false && riskAssessment.level === 'critical') {
      throw new ForbiddenException('Access denied due to critical security risk');
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
    if (context.getType() === 'http') {
      return context.switchToHttp().getRequest();
    } else if (context.getType<any>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
    }
    return null;
  }

  private async calculateCurrentRisk(user: AuthenticatedUser, request: any): Promise<{ score: number; level: string }> {
    // Simplified risk calculation - would use full risk assessment in production
    let score = 30; // Base risk

    // Check for unusual patterns
    if (request.ip !== user.securityContext?.ipAddress) {
      score += 20; // IP change
    }

    if (!user.securityContext?.mfaVerified) {
      score += 15; // No MFA
    }

    const level = this.determineRiskLevel(score);
    return { score, level };
  }

  private determineRiskLevel(score: number): string {
    if (score >= 90) return 'critical';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }
}