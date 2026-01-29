/**
 * OnboardingRecoveryService - Onboarding failure recovery and resume functionality
 */

import { gql } from '@apollo/client';
import { OnboardingStep, OnboardingData, BusinessTier } from '@/hooks/useOnboarding';

/**
 * Recovery session data
 */
export interface RecoverySession {
  sessionId: string;
  userId: string;
  failurePoint: OnboardingStep;
  failureReason: string;
  failureTimestamp: Date;
  recoveryAttempts: number;
  lastRecoveryAttempt?: Date;
  preservedData: OnboardingData;
  canRecover: boolean;
  expiresAt: Date;
}

/**
 * Recovery attempt result
 */
export interface RecoveryResult {
  success: boolean;
  resumedStep: OnboardingStep;
  preservedData: OnboardingData;
  sessionId: string;
  error?: string;
}

/**
 * Failure analysis
 */
export interface FailureAnalysis {
  failureType: 'validation' | 'network' | 'server' | 'timeout' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  suggestedActions: string[];
  dataLoss: boolean;
  affectedFields: string[];
}

/**
 * Recovery strategy
 */
export interface RecoveryStrategy {
  strategy: 'retry' | 'skip' | 'reset' | 'manual';
  description: string;
  estimatedTime: number; // in minutes
  dataPreservation: 'full' | 'partial' | 'none';
  userAction: 'none' | 'confirm' | 'input' | 'contact_support';
}

export class OnboardingRecoveryService {
  private apolloClient: ApolloClient<any>;
  private readonly maxRecoveryAttempts = 3;
  private readonly recoverySessionTTL = 24 * 60 * 60 * 1000; // 24 hours

  constructor(apolloClient: ApolloClient<any>) {
    this.apolloClient = apolloClient;
  }

  /**
   * Create recovery session when onboarding fails
   */
  async createRecoverySession(
    userId: string,
    failurePoint: OnboardingStep,
    failureReason: string,
    preservedData: OnboardingData
  ): Promise<RecoverySession> {
    const sessionId = this.generateRecoverySessionId();
    const now = new Date();
    
    const recoverySession: RecoverySession = {
      sessionId,
      userId,
      failurePoint,
      failureReason,
      failureTimestamp: now,
      recoveryAttempts: 0,
      preservedData,
      canRecover: true,
      expiresAt: new Date(now.getTime() + this.recoverySessionTTL),
    };

    try {
      // Save recovery session to backend
      await this.apolloClient.mutate({
        mutation: `
          mutation CreateRecoverySession($input: CreateRecoverySessionInput!) {
            createRecoverySession(input: $input) {
              sessionId
              success
            }
          }
        `,
        variables: {
          input: {
            sessionId,
            userId,
            failurePoint,
            failureReason,
            preservedData,
            expiresAt: recoverySession.expiresAt.toISOString(),
          },
        },
      });

      // Store in local storage as backup
      this.storeRecoverySessionLocally(recoverySession);

      return recoverySession;
    } catch (error) {
      console.error('Failed to create recovery session:', error);
      
      // Fallback to local storage only
      this.storeRecoverySessionLocally(recoverySession);
      return recoverySession;
    }
  }

  /**
   * Attempt to recover from onboarding failure
   */
  async attemptRecovery(sessionId: string): Promise<RecoveryResult> {
    try {
      // Get recovery session
      const recoverySession = await this.getRecoverySession(sessionId);
      
      if (!recoverySession) {
        return {
          success: false,
          resumedStep: OnboardingStep.BUSINESS_PROFILE,
          preservedData: {},
          sessionId,
          error: 'Recovery session not found or expired',
        };
      }

      if (!recoverySession.canRecover) {
        return {
          success: false,
          resumedStep: recoverySession.failurePoint,
          preservedData: recoverySession.preservedData,
          sessionId,
          error: 'Recovery not possible for this failure type',
        };
      }

      if (recoverySession.recoveryAttempts >= this.maxRecoveryAttempts) {
        return {
          success: false,
          resumedStep: recoverySession.failurePoint,
          preservedData: recoverySession.preservedData,
          sessionId,
          error: 'Maximum recovery attempts exceeded',
        };
      }

      // Analyze failure and determine recovery strategy
      const failureAnalysis = this.analyzeFailure(recoverySession.failureReason);
      const recoveryStrategy = this.determineRecoveryStrategy(failureAnalysis, recoverySession);

      // Execute recovery based on strategy
      const result = await this.executeRecoveryStrategy(recoverySession, recoveryStrategy);

      // Update recovery session
      await this.updateRecoverySession(sessionId, {
        recoveryAttempts: recoverySession.recoveryAttempts + 1,
        lastRecoveryAttempt: new Date(),
      });

      return result;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      return {
        success: false,
        resumedStep: OnboardingStep.BUSINESS_PROFILE,
        preservedData: {},
        sessionId,
        error: error instanceof Error ? error.message : 'Recovery failed',
      };
    }
  }

  /**
   * Resume onboarding from failure point
   */
  async resumeFromFailure(
    sessionId: string,
    additionalData?: Partial<OnboardingData>
  ): Promise<RecoveryResult> {
    try {
      const recoverySession = await this.getRecoverySession(sessionId);
      
      if (!recoverySession) {
        throw new Error('Recovery session not found');
      }

      // Merge preserved data with any additional data
      const mergedData: OnboardingData = {
        ...recoverySession.preservedData,
        ...additionalData,
      };

      // Resume onboarding via backend
      const { data } = await this.apolloClient.mutate({
        mutation: `
          mutation ResumeOnboardingFromFailure($input: ResumeFromFailureInput!) {
            resumeOnboardingFromFailure(input: $input) {
              success
              resumedStep
              sessionId
              onboardingData {
                businessName
                businessIndustry
                businessSize
                businessType
                expectedEmployees
                expectedLocations
                expectedMonthlyTransactions
                expectedMonthlyRevenue
                selectedPlan
                recommendedPlan
              }
            }
          }
        `,
        variables: {
          input: {
            recoverySessionId: sessionId,
            resumeFromStep: recoverySession.failurePoint,
            onboardingData: mergedData,
          },
        },
      });

      const result = data.resumeOnboardingFromFailure;

      if (result.success) {
        // Clear recovery session on successful resume
        await this.clearRecoverySession(sessionId);
        
        return {
          success: true,
          resumedStep: result.resumedStep,
          preservedData: result.onboardingData,
          sessionId: result.sessionId,
        };
      } else {
        return {
          success: false,
          resumedStep: recoverySession.failurePoint,
          preservedData: mergedData,
          sessionId,
          error: 'Failed to resume onboarding',
        };
      }
    } catch (error) {
      console.error('Failed to resume from failure:', error);
      return {
        success: false,
        resumedStep: OnboardingStep.BUSINESS_PROFILE,
        preservedData: {},
        sessionId,
        error: error instanceof Error ? error.message : 'Resume failed',
      };
    }
  }

  /**
   * Get recovery session by ID
   */
  async getRecoverySession(sessionId: string): Promise<RecoverySession | null> {
    try {
      // Try to get from backend first
      const { data } = await this.apolloClient.query({
        query: `
          query GetRecoverySession($sessionId: String!) {
            recoverySession(sessionId: $sessionId) {
              sessionId
              userId
              failurePoint
              failureReason
              failureTimestamp
              recoveryAttempts
              lastRecoveryAttempt
              preservedData {
                businessName
                businessIndustry
                businessSize
                businessType
                expectedEmployees
                expectedLocations
                expectedMonthlyTransactions
                expectedMonthlyRevenue
                selectedPlan
                recommendedPlan
              }
              canRecover
              expiresAt
            }
          }
        `,
        variables: { sessionId },
        fetchPolicy: 'network-only',
      });

      if (data.recoverySession) {
        return {
          ...data.recoverySession,
          failureTimestamp: new Date(data.recoverySession.failureTimestamp),
          lastRecoveryAttempt: data.recoverySession.lastRecoveryAttempt 
            ? new Date(data.recoverySession.lastRecoveryAttempt) 
            : undefined,
          expiresAt: new Date(data.recoverySession.expiresAt),
        };
      }
    } catch (error) {
      console.warn('Failed to get recovery session from backend:', error);
    }

    // Fallback to local storage
    return this.getRecoverySessionLocally(sessionId);
  }

  /**
   * Analyze failure to determine recovery approach
   */
  private analyzeFailure(failureReason: string): FailureAnalysis {
    const reason = failureReason.toLowerCase();
    
    if (reason.includes('validation') || reason.includes('invalid')) {
      return {
        failureType: 'validation',
        severity: 'low',
        recoverable: true,
        suggestedActions: ['Review and correct input data', 'Retry with valid data'],
        dataLoss: false,
        affectedFields: this.extractAffectedFields(failureReason),
      };
    }
    
    if (reason.includes('network') || reason.includes('connection')) {
      return {
        failureType: 'network',
        severity: 'medium',
        recoverable: true,
        suggestedActions: ['Check internet connection', 'Retry operation'],
        dataLoss: false,
        affectedFields: [],
      };
    }
    
    if (reason.includes('timeout')) {
      return {
        failureType: 'timeout',
        severity: 'medium',
        recoverable: true,
        suggestedActions: ['Retry operation', 'Check connection stability'],
        dataLoss: false,
        affectedFields: [],
      };
    }
    
    if (reason.includes('server') || reason.includes('500') || reason.includes('internal')) {
      return {
        failureType: 'server',
        severity: 'high',
        recoverable: true,
        suggestedActions: ['Wait and retry', 'Contact support if persistent'],
        dataLoss: false,
        affectedFields: [],
      };
    }
    
    return {
      failureType: 'unknown',
      severity: 'critical',
      recoverable: false,
      suggestedActions: ['Contact support', 'Manual recovery required'],
      dataLoss: true,
      affectedFields: [],
    };
  }

  /**
   * Determine recovery strategy based on failure analysis
   */
  private determineRecoveryStrategy(
    analysis: FailureAnalysis,
    session: RecoverySession
  ): RecoveryStrategy {
    switch (analysis.failureType) {
      case 'validation':
        return {
          strategy: 'retry',
          description: 'Retry with corrected data',
          estimatedTime: 2,
          dataPreservation: 'full',
          userAction: 'input',
        };
        
      case 'network':
      case 'timeout':
        return {
          strategy: 'retry',
          description: 'Retry operation after connection check',
          estimatedTime: 1,
          dataPreservation: 'full',
          userAction: 'confirm',
        };
        
      case 'server':
        if (session.recoveryAttempts < 2) {
          return {
            strategy: 'retry',
            description: 'Retry after brief delay',
            estimatedTime: 3,
            dataPreservation: 'full',
            userAction: 'confirm',
          };
        } else {
          return {
            strategy: 'manual',
            description: 'Manual intervention required',
            estimatedTime: 15,
            dataPreservation: 'partial',
            userAction: 'contact_support',
          };
        }
        
      default:
        return {
          strategy: 'reset',
          description: 'Reset onboarding process',
          estimatedTime: 10,
          dataPreservation: 'partial',
          userAction: 'confirm',
        };
    }
  }

  /**
   * Execute recovery strategy
   */
  private async executeRecoveryStrategy(
    session: RecoverySession,
    strategy: RecoveryStrategy
  ): Promise<RecoveryResult> {
    switch (strategy.strategy) {
      case 'retry':
        return this.executeRetryStrategy(session);
        
      case 'skip':
        return this.executeSkipStrategy(session);
        
      case 'reset':
        return this.executeResetStrategy(session);
        
      case 'manual':
        return this.executeManualStrategy(session);
        
      default:
        throw new Error(`Unknown recovery strategy: ${strategy.strategy}`);
    }
  }

  /**
   * Execute retry recovery strategy
   */
  private async executeRetryStrategy(session: RecoverySession): Promise<RecoveryResult> {
    // Simply resume from the failure point with preserved data
    return {
      success: true,
      resumedStep: session.failurePoint,
      preservedData: session.preservedData,
      sessionId: session.sessionId,
    };
  }

  /**
   * Execute skip recovery strategy
   */
  private async executeSkipStrategy(session: RecoverySession): Promise<RecoveryResult> {
    // Skip the failed step and move to the next one
    const allSteps = [
      OnboardingStep.BUSINESS_PROFILE,
      OnboardingStep.BUSINESS_TYPE,
      OnboardingStep.USAGE_EXPECTATIONS,
      OnboardingStep.PLAN_SELECTION,
      OnboardingStep.WELCOME,
    ];
    
    const currentIndex = allSteps.indexOf(session.failurePoint);
    const nextStep = allSteps[currentIndex + 1] || OnboardingStep.WELCOME;
    
    return {
      success: true,
      resumedStep: nextStep,
      preservedData: session.preservedData,
      sessionId: session.sessionId,
    };
  }

  /**
   * Execute reset recovery strategy
   */
  private async executeResetStrategy(session: RecoverySession): Promise<RecoveryResult> {
    // Reset to the beginning but preserve some data
    const preservedData: OnboardingData = {
      businessName: session.preservedData.businessName,
      businessIndustry: session.preservedData.businessIndustry,
      // Reset other fields
    };
    
    return {
      success: true,
      resumedStep: OnboardingStep.BUSINESS_PROFILE,
      preservedData,
      sessionId: session.sessionId,
    };
  }

  /**
   * Execute manual recovery strategy
   */
  private async executeManualStrategy(session: RecoverySession): Promise<RecoveryResult> {
    // Manual recovery requires user intervention
    return {
      success: false,
      resumedStep: session.failurePoint,
      preservedData: session.preservedData,
      sessionId: session.sessionId,
      error: 'Manual recovery required - please contact support',
    };
  }

  /**
   * Extract affected fields from failure reason
   */
  private extractAffectedFields(failureReason: string): string[] {
    const fields: string[] = [];
    const fieldPatterns = [
      /businessName/gi,
      /businessIndustry/gi,
      /businessSize/gi,
      /businessType/gi,
      /expectedEmployees/gi,
      /expectedLocations/gi,
      /expectedMonthlyTransactions/gi,
      /expectedMonthlyRevenue/gi,
    ];
    
    for (const pattern of fieldPatterns) {
      if (pattern.test(failureReason)) {
        fields.push(pattern.source.replace(/[gi]/g, ''));
      }
    }
    
    return fields;
  }

  /**
   * Store recovery session locally as backup
   */
  private storeRecoverySessionLocally(session: RecoverySession): void {
    try {
      const key = `onboarding_recovery_${session.sessionId}`;
      localStorage.setItem(key, JSON.stringify({
        ...session,
        failureTimestamp: session.failureTimestamp.toISOString(),
        lastRecoveryAttempt: session.lastRecoveryAttempt?.toISOString(),
        expiresAt: session.expiresAt.toISOString(),
      }));
    } catch (error) {
      console.warn('Failed to store recovery session locally:', error);
    }
  }

  /**
   * Get recovery session from local storage
   */
  private getRecoverySessionLocally(sessionId: string): RecoverySession | null {
    try {
      const key = `onboarding_recovery_${sessionId}`;
      const stored = localStorage.getItem(key);
      
      if (!stored) return null;
      
      const parsed = JSON.parse(stored);
      
      // Check if expired
      if (new Date(parsed.expiresAt) < new Date()) {
        localStorage.removeItem(key);
        return null;
      }
      
      return {
        ...parsed,
        failureTimestamp: new Date(parsed.failureTimestamp),
        lastRecoveryAttempt: parsed.lastRecoveryAttempt 
          ? new Date(parsed.lastRecoveryAttempt) 
          : undefined,
        expiresAt: new Date(parsed.expiresAt),
      };
    } catch (error) {
      console.warn('Failed to get recovery session from local storage:', error);
      return null;
    }
  }

  /**
   * Update recovery session
   */
  private async updateRecoverySession(
    sessionId: string,
    updates: Partial<RecoverySession>
  ): Promise<void> {
    try {
      await this.apolloClient.mutate({
        mutation: `
          mutation UpdateRecoverySession($input: UpdateRecoverySessionInput!) {
            updateRecoverySession(input: $input) {
              success
            }
          }
        `,
        variables: {
          input: {
            sessionId,
            ...updates,
          },
        },
      });
    } catch (error) {
      console.warn('Failed to update recovery session:', error);
    }
  }

  /**
   * Clear recovery session
   */
  private async clearRecoverySession(sessionId: string): Promise<void> {
    try {
      // Clear from backend
      await this.apolloClient.mutate({
        mutation: `
          mutation ClearRecoverySession($sessionId: String!) {
            clearRecoverySession(sessionId: $sessionId) {
              success
            }
          }
        `,
        variables: { sessionId },
      });
    } catch (error) {
      console.warn('Failed to clear recovery session from backend:', error);
    }

    // Clear from local storage
    try {
      const key = `onboarding_recovery_${sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to clear recovery session from local storage:', error);
    }
  }

  /**
   * Generate unique recovery session ID
   */
  private generateRecoverySessionId(): string {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get all active recovery sessions for user
   */
  async getActiveRecoverySessions(userId: string): Promise<RecoverySession[]> {
    try {
      const { data } = await this.apolloClient.query({
        query: `
          query GetActiveRecoverySessions($userId: String!) {
            activeRecoverySessions(userId: $userId) {
              sessionId
              userId
              failurePoint
              failureReason
              failureTimestamp
              recoveryAttempts
              lastRecoveryAttempt
              preservedData {
                businessName
                businessIndustry
                businessSize
                businessType
                expectedEmployees
                expectedLocations
                expectedMonthlyTransactions
                expectedMonthlyRevenue
                selectedPlan
                recommendedPlan
              }
              canRecover
              expiresAt
            }
          }
        `,
        variables: { userId },
      });

      return data.activeRecoverySessions.map((session: any) => ({
        ...session,
        failureTimestamp: new Date(session.failureTimestamp),
        lastRecoveryAttempt: session.lastRecoveryAttempt 
          ? new Date(session.lastRecoveryAttempt) 
          : undefined,
        expiresAt: new Date(session.expiresAt),
      }));
    } catch (error) {
      console.error('Failed to get active recovery sessions:', error);
      return [];
    }
  }
}

// Export singleton instance
let onboardingRecoveryServiceInstance: OnboardingRecoveryService | null = null;

export const getOnboardingRecoveryService = (apolloClient: ApolloClient<any>): OnboardingRecoveryService => {
  if (!onboardingRecoveryServiceInstance) {
    onboardingRecoveryServiceInstance = new OnboardingRecoveryService(apolloClient);
  }
  return onboardingRecoveryServiceInstance;
};

export default OnboardingRecoveryService;