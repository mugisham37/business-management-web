import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { AuthEventEmitter } from '../../auth/auth-events';
import {
  GET_MFA_STATUS,
  IS_MFA_ENABLED,
  GENERATE_MFA_SETUP,
  ENABLE_MFA,
  DISABLE_MFA,
  VERIFY_MFA_TOKEN,
  GENERATE_BACKUP_CODES,
  USER_MFA_EVENTS,
} from '../../graphql/operations/mfa';
import type {
  MfaStatusResponse,
  MfaSetupResponse,
  DisableMfaInput,
  AuthEvent,
} from '../../graphql/generated/types';

/**
 * Multi-Factor Authentication Hook
 * 
 * Provides comprehensive MFA management with:
 * - MFA status checking
 * - MFA setup with QR codes
 * - MFA enable/disable operations
 * - Token verification
 * - Backup code management
 * - Real-time MFA events
 */

interface MfaState {
  isEnabled: boolean;
  isLoading: boolean;
  error: string | null;
  setupData: MfaSetupResponse | null;
  backupCodes: string[] | null;
  status: MfaStatusResponse | null;
}

interface MfaOperations {
  generateSetup: () => Promise<MfaSetupResponse>;
  enableMfa: (token: string) => Promise<boolean>;
  disableMfa: (token?: string, backupCode?: string, password?: string) => Promise<boolean>;
  verifyToken: (token: string) => Promise<boolean>;
  generateBackupCodes: (token: string) => Promise<string[]>;
  refreshStatus: () => Promise<void>;
  clearError: () => void;
  clearSetupData: () => void;
}

interface UseMfaReturn extends MfaState, MfaOperations {
  // Additional utilities
  hasBackupCodes: boolean;
  backupCodesCount: number;
  canDisableMfa: boolean;
}

export function useMFA(): UseMfaReturn {
  const [mfaState, setMfaState] = useState<MfaState>({
    isEnabled: false,
    isLoading: false,
    error: null,
    setupData: null,
    backupCodes: null,
    status: null,
  });

  // GraphQL operations
  const { data: statusData, loading: statusLoading, refetch: refetchStatus } = useQuery(
    GET_MFA_STATUS,
    {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    }
  );

  const { data: enabledData, refetch: refetchEnabled } = useQuery(IS_MFA_ENABLED, {
    errorPolicy: 'all',
  });

  const [generateSetupMutation, { loading: setupLoading }] = useMutation(GENERATE_MFA_SETUP, {
    errorPolicy: 'all',
  });

  const [enableMfaMutation, { loading: enableLoading }] = useMutation(ENABLE_MFA, {
    errorPolicy: 'all',
  });

  const [disableMfaMutation, { loading: disableLoading }] = useMutation(DISABLE_MFA, {
    errorPolicy: 'all',
  });

  const [verifyTokenMutation, { loading: verifyLoading }] = useMutation(VERIFY_MFA_TOKEN, {
    errorPolicy: 'all',
  });

  const [generateBackupCodesMutation, { loading: backupCodesLoading }] = useMutation(
    GENERATE_BACKUP_CODES,
    {
      errorPolicy: 'all',
    }
  );

  // Real-time MFA events
  useSubscription(USER_MFA_EVENTS, {
    onData: ({ data }) => {
      if (data.data?.userMfaEvents) {
        handleMfaEvent(data.data.userMfaEvents);
      }
    },
  });

  // Handle MFA events
  const handleMfaEvent = useCallback((event: AuthEvent) => {
    switch (event.type) {
      case 'MFA_ENABLED':
        setMfaState(prev => ({ ...prev, isEnabled: true }));
        AuthEventEmitter.emit('auth:mfa_enabled');
        refetchStatus();
        refetchEnabled();
        break;
      case 'MFA_DISABLED':
        setMfaState(prev => ({ ...prev, isEnabled: false }));
        AuthEventEmitter.emit('auth:mfa_disabled');
        refetchStatus();
        refetchEnabled();
        break;
      default:
        console.log('Received MFA event:', event);
    }
  }, [refetchStatus, refetchEnabled]);

  // Generate MFA setup
  const generateSetup = useCallback(async (): Promise<MfaSetupResponse> => {
    try {
      setMfaState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await generateSetupMutation();

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const setupData = result.data?.generateMfaSetup;
      if (!setupData) {
        throw new Error('Failed to generate MFA setup');
      }

      setMfaState(prev => ({
        ...prev,
        setupData,
        isLoading: false,
      }));

      return setupData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate MFA setup';
      setMfaState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [generateSetupMutation]);

  // Enable MFA
  const enableMfa = useCallback(async (token: string): Promise<boolean> => {
    try {
      setMfaState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await enableMfaMutation({
        variables: { input: { token } },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.enableMfa;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to enable MFA');
      }

      setMfaState(prev => ({
        ...prev,
        isEnabled: true,
        isLoading: false,
        setupData: null, // Clear setup data after successful enable
      }));

      // Refresh status
      await refetchStatus();
      await refetchEnabled();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to enable MFA';
      setMfaState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [enableMfaMutation, refetchStatus, refetchEnabled]);

  // Disable MFA
  const disableMfa = useCallback(async (token?: string, backupCode?: string, password?: string): Promise<boolean> => {
    try {
      setMfaState(prev => ({ ...prev, isLoading: true, error: null }));

      const input: DisableMfaInput = {
        password: password || '', // Password is required by the type
      };
      if (token) input.token = token;
      if (backupCode) input.backupCode = backupCode;

      const result = await disableMfaMutation({
        variables: { input },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.disableMfa;
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to disable MFA');
      }

      setMfaState(prev => ({
        ...prev,
        isEnabled: false,
        isLoading: false,
        backupCodes: null, // Clear backup codes
      }));

      // Refresh status
      await refetchStatus();
      await refetchEnabled();

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disable MFA';
      setMfaState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [disableMfaMutation, refetchStatus, refetchEnabled]);

  // Verify MFA token
  const verifyToken = useCallback(async (token: string): Promise<boolean> => {
    try {
      setMfaState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await verifyTokenMutation({
        variables: { input: { token } },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const response = result.data?.verifyMfaToken;
      const isValid = response?.success || false;

      setMfaState(prev => ({
        ...prev,
        isLoading: false,
        error: isValid ? null : (response?.message || 'Invalid MFA token'),
      }));

      if (isValid) {
        AuthEventEmitter.emit('auth:mfa_verified');
      }

      return isValid;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify MFA token';
      setMfaState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      return false;
    }
  }, [verifyTokenMutation]);

  // Generate new backup codes
  const generateBackupCodes = useCallback(async (token: string): Promise<string[]> => {
    try {
      setMfaState(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await generateBackupCodesMutation({
        variables: { input: { token } },
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0]?.message || 'Unknown error occurred');
      }

      const backupCodes = result.data?.generateBackupCodes;
      if (!backupCodes || backupCodes.length === 0) {
        throw new Error('Failed to generate backup codes');
      }

      setMfaState(prev => ({
        ...prev,
        backupCodes,
        isLoading: false,
      }));

      // Refresh status to update backup codes count
      await refetchStatus();

      return backupCodes;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate backup codes';
      setMfaState(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      throw error;
    }
  }, [generateBackupCodesMutation, refetchStatus]);

  // Refresh MFA status
  const refreshStatus = useCallback(async (): Promise<void> => {
    try {
      await Promise.all([refetchStatus(), refetchEnabled()]);
    } catch (error) {
      console.error('Failed to refresh MFA status:', error);
    }
  }, [refetchStatus, refetchEnabled]);

  // Clear error
  const clearError = useCallback(() => {
    setMfaState(prev => ({ ...prev, error: null }));
  }, []);

  // Clear setup data
  const clearSetupData = useCallback(() => {
    setMfaState(prev => ({ ...prev, setupData: null }));
  }, []);

  // Update state when data changes
  React.useEffect(() => {
    if (statusData?.mfaStatus) {
      setMfaState(prev => ({
        ...prev,
        status: statusData.mfaStatus,
        isEnabled: statusData.mfaStatus.enabled,
      }));
    }
  }, [statusData]);

  React.useEffect(() => {
    if (enabledData?.isMfaEnabled !== undefined) {
      setMfaState(prev => ({
        ...prev,
        isEnabled: enabledData.isMfaEnabled,
      }));
    }
  }, [enabledData]);

  // Computed properties
  const hasBackupCodes = (mfaState.status?.backupCodesCount || 0) > 0;
  const backupCodesCount = mfaState.status?.backupCodesCount || 0;
  const canDisableMfa = Boolean(mfaState.isEnabled && (hasBackupCodes || mfaState.status?.hasSecret));

  return {
    // State
    ...mfaState,
    isLoading: mfaState.isLoading || 
               statusLoading || 
               setupLoading || 
               enableLoading || 
               disableLoading || 
               verifyLoading || 
               backupCodesLoading,

    // Operations
    generateSetup,
    enableMfa,
    disableMfa,
    verifyToken,
    generateBackupCodes,
    refreshStatus,
    clearError,
    clearSetupData,

    // Utilities
    hasBackupCodes,
    backupCodesCount,
    canDisableMfa,
  };
}