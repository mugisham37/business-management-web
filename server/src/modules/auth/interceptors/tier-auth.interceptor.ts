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
 * Enhances tier-related authorization errors with upgrade information
 * Provides structured error responses for frontend upgrade prompts
 */
@Injectable()
export class TierAuthInterceptor implements NestInterceptor {
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
      'current tier:',
      'Required feature:',
      'upgrade your subscription',
      'not available in your current plan',
    ];
    
    return tierKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Enhance tier error with upgrade information
   */
  private enhanceTierError(error: ForbiddenException, context: ExecutionContext): ForbiddenException {
    const gqlContext = GqlExecutionContext.create(context);
    const user = gqlContext.getContext().req?.user;
    
    if (!user) {
      return error;
    }

    const upgradeInfo = this.generateUpgradeInfo(error.message, user);
    
    // Create enhanced error with upgrade information
    const enhancedError = new ForbiddenException({
      message: error.message,
      error: 'TIER_ACCESS_DENIED',
      statusCode: 403,
      upgradeInfo,
      timestamp: new Date().toISOString(),
    });

    return enhancedError;
  }

  /**
   * Generate upgrade information from error message and user context
   */
  private generateUpgradeInfo(errorMessage: string, user: any): TierUpgradeInfo {
    const currentTier = user.businessTier || 'micro';
    
    // Extract required tier from error message
    const tierMatch = errorMessage.match(/Required tier: (\w+)/);
    const requiredTier = tierMatch ? tierMatch[1] : this.getNextTier(currentTier);
    
    // Extract missing features from error message
    const featureMatch = errorMessage.match(/Required feature: (\w+)/);
    const missingFeatures = featureMatch ? [featureMatch[1]] : [];
    
    // Generate upgrade URL (would be configured based on your frontend routing)
    const upgradeUrl = `/upgrade?from=${currentTier}&to=${requiredTier}`;
    
    // Get pricing information (would come from your pricing service)
    const pricingInfo = this.getPricingInfo(currentTier, requiredTier);

    return {
      currentTier,
      requiredTier,
      missingFeatures,
      upgradeUrl,
      pricingInfo,
    };
  }

  /**
   * Get the next tier in progression
   */
  private getNextTier(currentTier: string): string {
    const tierProgression = {
      micro: 'small',
      small: 'medium',
      medium: 'enterprise',
      enterprise: 'enterprise',
    };
    
    return tierProgression[currentTier as keyof typeof tierProgression] || 'small';
  }

  /**
   * Get pricing information for tier upgrade
   * In production, this would integrate with your pricing service
   */
  private getPricingInfo(currentTier: string, targetTier: string) {
    const pricing = {
      micro: 0,
      small: 29,
      medium: 99,
      enterprise: 299,
    };

    const currentPrice = pricing[currentTier as keyof typeof pricing] || 0;
    const targetPrice = pricing[targetTier as keyof typeof pricing] || 0;

    return {
      currentPrice,
      targetPrice,
      currency: 'USD',
    };
  }
}