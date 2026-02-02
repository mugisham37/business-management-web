import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ForbiddenException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TierAuthorizationService } from '../services/tier-authorization.service';

export interface TierUpgradeInfo {
  currentTier: string;
  requiredTier: string;
  missingFeatures: string[];
  upgradeUrl: string;
  pricingInfo?: {
    currentPrice: number;
    targetPrice: number;
    currency: string;
  };
}

/**
 * Tier Authorization Interceptor
 * 
 * Enhances tier-related authorization errors with upgrade information.
 * Provides structured error responses for frontend upgrade prompts and
 * seamless user experience when encountering tier limitations.
 * 
 * Features:
 * - Detects tier-related authorization failures
 * - Enriches errors with upgrade information
 * - Provides pricing and feature comparison data
 * - Generates upgrade URLs with context
 * - Supports A/B testing for upgrade flows
 */
@Injectable()
export class TierAuthInterceptor implements NestInterceptor {
  constructor(private readonly tierAuthService: TierAuthorizationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        // Only handle tier-related authorization errors
        if (error instanceof ForbiddenException && this.isTierError(error.message)) {
          const enhancedError = this.enhanceTierError(error, context);
          return throwError(() => enhancedError);
        }
        
        return throwError(() => error);
      }),
    );
  }

  /**
   * Check if error is tier-related
   */
  private isTierError(message: string): boolean {
    const tierKeywords = [
      'Required tier:',
      'tier access',
      'subscription',
      'upgrade',
      'feature not available',
      'premium feature',
      'enterprise feature',
    ];

    return tierKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * Enhance tier error with upgrade information
   */
  private enhanceTierError(error: ForbiddenException, context: ExecutionContext): ForbiddenException {
    try {
      const user = this.getUserFromContext(context);
      const requiredTier = this.extractRequiredTier(error.message);
      const currentTier = user?.businessTier || 'free';

      const upgradeInfo: TierUpgradeInfo = {
        currentTier,
        requiredTier,
        missingFeatures: this.getMissingFeatures(currentTier, requiredTier),
        upgradeUrl: this.generateUpgradeUrl(currentTier, requiredTier, context),
        pricingInfo: this.getPricingInfo(currentTier, requiredTier),
      };

      // Create enhanced error response
      const enhancedResponse = {
        statusCode: 403,
        message: error.message,
        error: 'Tier Upgrade Required',
        upgradeInfo,
        timestamp: new Date().toISOString(),
        path: this.getRequestPath(context),
      };

      return new ForbiddenException(enhancedResponse);
    } catch (enhancementError) {
      // If enhancement fails, return original error
      console.error('Failed to enhance tier error:', enhancementError);
      return error;
    }
  }

  /**
   * Extract user from execution context
   */
  private getUserFromContext(context: ExecutionContext): any {
    try {
      // Try GraphQL context first
      const gqlContext = GqlExecutionContext.create(context);
      const gqlUser = gqlContext.getContext()?.req?.user;
      if (gqlUser) {
        return gqlUser;
      }

      // Fallback to HTTP context
      const request = context.switchToHttp().getRequest();
      return request?.user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract required tier from error message
   */
  private extractRequiredTier(message: string): string {
    const tierMatch = message.match(/Required tier:\s*(\w+)/i);
    if (tierMatch) {
      return tierMatch[1].toLowerCase();
    }

    // Try to infer from message content
    if (message.toLowerCase().includes('enterprise')) return 'enterprise';
    if (message.toLowerCase().includes('premium')) return 'premium';
    if (message.toLowerCase().includes('standard')) return 'standard';
    if (message.toLowerCase().includes('basic')) return 'basic';

    return 'premium'; // Default fallback
  }

  /**
   * Get missing features for tier upgrade
   */
  private getMissingFeatures(currentTier: string, requiredTier: string): string[] {
    const tierFeatures = {
      free: ['Basic reporting', 'Up to 5 users', 'Email support'],
      basic: ['Advanced reporting', 'Up to 25 users', 'Priority support', 'API access'],
      standard: ['Custom dashboards', 'Up to 100 users', 'Phone support', 'Integrations'],
      premium: ['Advanced analytics', 'Unlimited users', '24/7 support', 'Custom integrations', 'White-label'],
      enterprise: ['Enterprise SSO', 'Advanced security', 'Dedicated support', 'Custom development', 'SLA'],
    };

    const currentFeatures = tierFeatures[currentTier as keyof typeof tierFeatures] || [];
    const requiredFeatures = tierFeatures[requiredTier as keyof typeof tierFeatures] || [];

    return requiredFeatures.filter(feature => !currentFeatures.includes(feature));
  }

  /**
   * Generate upgrade URL with context
   */
  private generateUpgradeUrl(currentTier: string, requiredTier: string, context: ExecutionContext): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://app.example.com';
    const path = this.getRequestPath(context);
    
    const params = new URLSearchParams({
      from: currentTier,
      to: requiredTier,
      source: 'tier_interceptor',
      path: path || '',
      utm_source: 'app',
      utm_medium: 'tier_gate',
      utm_campaign: 'upgrade',
    });

    return `${baseUrl}/upgrade?${params.toString()}`;
  }

  /**
   * Get pricing information for tier comparison
   */
  private getPricingInfo(currentTier: string, requiredTier: string): TierUpgradeInfo['pricingInfo'] {
    const pricing = {
      free: 0,
      basic: 29,
      standard: 79,
      premium: 149,
      enterprise: 299,
    };

    const currentPrice = pricing[currentTier as keyof typeof pricing] || 0;
    const targetPrice = pricing[requiredTier as keyof typeof pricing] || 0;

    return {
      currentPrice,
      targetPrice,
      currency: 'USD',
    };
  }

  /**
   * Get request path from context
   */
  private getRequestPath(context: ExecutionContext): string {
    try {
      // Try GraphQL context first
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      if (info) {
        return `graphql:${info.fieldName}`;
      }

      // Fallback to HTTP context
      const request = context.switchToHttp().getRequest();
      return request?.url || request?.path || '';
    } catch (error) {
      return '';
    }
  }
}