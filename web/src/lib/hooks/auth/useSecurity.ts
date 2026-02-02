import { useState, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { AuthEventEmitter } from '../../auth/auth-events';
import {
  MY_RISK_SCORE,
  MY_SECURITY_STATUS,
  MY_SECURITY_RECOMMENDATIONS,
  IS_DEVICE_TRUSTED,
  LOG_SECURITY_EVENT,
  USER_RISK_EVENTS,
} from '../../graphql/operations/security';
import type { AuthEvent } from '../../graphql/generated/types';

/**
 * Security Monitoring Hook
 * 
 * Provides comprehensive security monitoring and management with:
 * - Risk score tracking
 * - Security status monitoring
 * - Device trust management
 * - Security event logging
 * - Real-time security alerts
 * - Security recommendations
 */

interface SecurityState {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical' | 'unknown';
  securityStatus: string;
  recommendations: string[];
  isDeviceTrusted: boolean;
  isLoading: boolean;
  error: string | null;
  lastAssessment: Date | null;
}

interface SecurityOperations {
  refreshRiskScore: () => Promise<void>;
  refreshSecurityStatus: () => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  checkDeviceTrust: (deviceFingerprint?: string) => Promise<boolean>;
  logSecurityEvent: (eventType: string, description: string, metadata?: Record<string, any>) => Promise<boolean>;
  clearError: () => void;
}

interface UseSecurityReturn extends SecurityState, SecurityOperations {
  // Utilities
  isHighRisk: boolean;
  isCriticalRisk: boolean;
  needsAttention: boolean;
  securityScore: number; // 0-100, higher is better (inverse of risk)
  getSecurityLevel: () => 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  getRiskFactors: () => string[];
  getSecurityActions: () => string[];
}

export function useSecurity(): UseSecurityReturn {
  const [securityState, setSecurityState] = useState<SecurityState>({
    riskScore: 0,
    riskLevel: 'unknown',
    securityStatus: 'unknown',
    recommendations: [],
    isDeviceTrusted: false,
    isLoading: false,
    error: null,
    lastAssessment: null,
  });

  // GraphQL operations
  const { data: riskData, loading: riskLoading, refetch: refetchRisk } = useQuery(MY_RISK_SCORE, {
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
  });

  const { data: statusData, loading: statusLoading, refetch: refetchStatus } = useQuery(
    MY_SECURITY_STATUS,
    {
      errorPolicy: 'all',
    }
  );

  const { data: recommendationsData, loading: recommendationsLoading, refetch: refetchRecommendations } = useQuery(
    MY_SECURITY_RECOMMENDATIONS,
    {
      errorPolicy: 'all',
    }
  );

  const [checkDeviceTrustMutation] = useMutation(IS_DEVICE_TRUSTED, {
    errorPolicy: 'all',
  });

  const [logSecurityEventMutation, { loading: logEventLoading }] = useMutation(LOG_SECURITY_EVENT, {
    errorPolicy: 'all',
  });

  // Real-time security events
  useSubscription(USER_RISK_EVENTS, {
    onData: ({ data }) => {
      if (data.data?.userRiskEvents) {
        handleSecurityEvent(data.data.userRiskEvents);
      }
    },
  });

  // Handle security events
  const handleSecurityEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case 'RISK_ASSESSMENT':
        const newRiskScore = event.metadata?.riskScore;
        if (typeof newRiskScore === 'number') {
          setSecurityState(prev => ({
            ...prev,
            riskScore: newRiskScore,
            riskLevel: getRiskLevelFromScore(newRiskScore),
            lastAssessment: new Date(),
          }));
          
          AuthEventEmitter.emit('security:risk_score_changed', {
            score: newRiskScore,
            level: getRiskLevelFromScore(newRiskScore),
          });
        }
        break;
      case 'SECURITY_ALERT':
        AuthEventEmitter.emit('security:suspicious_activity', event.metadata);
        // Refresh security data
        refetchRisk();
        refetchStatus();
        refetchRecommendations();
        break;
      default:
        console.log('Received security event:', event);
    }
  }, [refetchRisk, refetchStatus, refetchRecommendations]);

  // Get risk level from score
  const getRiskLevelFromScore = (score: number): 'low' | 'medium' | 'high' | 'critical' | 'unknown' => {
    if (score < 25) return 'low';
    if (score < 50) return 'medium';
    if (score < 75) return 'high';
    if (score <= 100) return 'critical';
    return 'unknown';
  };

  // Refresh risk score
  const refreshRiskScore = useCallback(async (): Promise<void> => {
    try {
      setSecurityState(prev => ({ ...prev, isLoading: true, error: null }));
      await refetchRisk();
      setSecurityState(prev => ({ ...prev, isLoading: false, lastAssessment: new Date() }));
    } catch (error: any) {
      setSecurityState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh risk score',
        isLoading: false,
      }));
    }
  }, [refetchRisk]);

  // Refresh security status
  const refreshSecurityStatus = useCallback(async (): Promise<void> => {
    try {
      setSecurityState(prev => ({ ...prev, isLoading: true, error: null }));
      await refetchStatus();
      setSecurityState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setSecurityState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh security status',
        isLoading: false,
      }));
    }
  }, [refetchStatus]);

  // Refresh recommendations
  const refreshRecommendations = useCallback(async (): Promise<void> => {
    try {
      setSecurityState(prev => ({ ...prev, isLoading: true, error: null }));
      await refetchRecommendations();
      setSecurityState(prev => ({ ...prev, isLoading: false }));
    } catch (error: any) {
      setSecurityState(prev => ({
        ...prev,
        error: error.message || 'Failed to refresh recommendations',
        isLoading: false,
      }));
    }
  }, [refetchRecommendations]);

  // Check device trust
  const checkDeviceTrust = useCallback(async (deviceFingerprint?: string): Promise<boolean> => {
    try {
      const result = await checkDeviceTrustMutation({
        variables: { deviceFingerprint },
      });

      const isTrusted = result.data?.isDeviceTrusted || false;
      
      setSecurityState(prev => ({
        ...prev,
        isDeviceTrusted: isTrusted,
      }));

      AuthEventEmitter.emit('security:device_trust_changed', {
        trusted: isTrusted,
        score: isTrusted ? 100 : 0,
      });

      return isTrusted;
    } catch (error: any) {
      console.error('Failed to check device trust:', error);
      return false;
    }
  }, [checkDeviceTrustMutation]);

  // Log security event
  const logSecurityEvent = useCallback(async (
    eventType: string,
    description: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    try {
      setSecurityState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await logSecurityEventMutation({
        variables: {
          eventType,
          description,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
        },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      const response = result.data?.logSecurityEvent;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to log security event');
      }

      setSecurityState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to log security event';
      setSecurityState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [logSecurityEventMutation]);

  // Clear error
  const clearError = useCallback(() => {
    setSecurityState(prev => ({ ...prev, error: null }));
  }, []);

  // Utility functions
  const isHighRisk = securityState.riskScore >= 50;
  const isCriticalRisk = securityState.riskScore >= 75;
  const needsAttention = isHighRisk || securityState.recommendations.length > 0;
  const securityScore = Math.max(0, 100 - securityState.riskScore); // Inverse of risk score

  const getSecurityLevel = useCallback((): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' => {
    if (securityScore >= 90) return 'excellent';
    if (securityScore >= 75) return 'good';
    if (securityScore >= 50) return 'fair';
    if (securityScore >= 25) return 'poor';
    return 'critical';
  }, [securityScore]);

  const getRiskFactors = useCallback((): string[] => {
    const factors: string[] = [];
    
    if (securityState.riskScore >= 25) {
      factors.push('Elevated risk score detected');
    }
    
    if (!securityState.isDeviceTrusted) {
      factors.push('Device not trusted');
    }
    
    if (securityState.riskLevel === 'high' || securityState.riskLevel === 'critical') {
      factors.push('High risk authentication patterns');
    }
    
    return factors;
  }, [securityState]);

  const getSecurityActions = useCallback((): string[] => {
    const actions: string[] = [];
    
    if (securityState.recommendations.length > 0) {
      actions.push(...securityState.recommendations);
    }
    
    if (isHighRisk) {
      actions.push('Review recent account activity');
      actions.push('Consider enabling additional security measures');
    }
    
    if (!securityState.isDeviceTrusted) {
      actions.push('Verify device identity');
    }
    
    return [...new Set(actions)]; // Remove duplicates
  }, [securityState, isHighRisk]);

  // Update state when data changes
  React.useEffect(() => {
    if (typeof riskData?.myRiskScore === 'number') {
      const riskScore = riskData.myRiskScore;
      setSecurityState(prev => ({
        ...prev,
        riskScore,
        riskLevel: getRiskLevelFromScore(riskScore),
        lastAssessment: new Date(),
      }));
    }
  }, [riskData]);

  React.useEffect(() => {
    if (statusData?.mySecurityStatus) {
      setSecurityState(prev => ({
        ...prev,
        securityStatus: statusData.mySecurityStatus,
      }));
    }
  }, [statusData]);

  React.useEffect(() => {
    if (recommendationsData?.mySecurityRecommendations) {
      setSecurityState(prev => ({
        ...prev,
        recommendations: recommendationsData.mySecurityRecommendations,
      }));
    }
  }, [recommendationsData]);

  return {
    // State
    ...securityState,
    isLoading: securityState.isLoading || 
               riskLoading || 
               statusLoading || 
               recommendationsLoading || 
               logEventLoading,

    // Operations
    refreshRiskScore,
    refreshSecurityStatus,
    refreshRecommendations,
    checkDeviceTrust,
    logSecurityEvent,
    clearError,

    // Utilities
    isHighRisk,
    isCriticalRisk,
    needsAttention,
    securityScore,
    getSecurityLevel,
    getRiskFactors,
    getSecurityActions,
  };
}