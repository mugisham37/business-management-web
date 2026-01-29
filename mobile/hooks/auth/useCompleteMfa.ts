/**
 * Complete MFA Hook for Mobile
 * Comprehensive MFA management with mobile-specific features
 */

import { useState, useCallback, useEffect } from 'react';
import { Alert, Vibration } from 'react-native';
import { useMutation, useQuery } from '@apollo/client';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  GENERATE_MFA_SETUP_MUTATION,
  ENABLE_MFA_MUTATION,
  DISABLE_MFA_MUTATION,
  VERIFY_MFA_TOKEN_MUTATION,
  GENERATE_BACKUP_CODES_MUTATION,
} from '@/graphql/mutations/auth-mutations';
import {
  GET_MFA_STATUS_QUERY,
  IS_MFA_ENABLED_QUERY,
} from '@/graphql/queries/auth-queries';
import { secureStorage, STORAGE_KEYS } from '@/lib/storage';

export interface MfaSetupData {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface MfaStatus {
  isEnabled: boolean;
  backupCodesCount: number;
  lastUsedAt?: Date;
}

export interface MfaState {
  isEnabled: boolean;
  isSetupInProgress: boolean;
  backupCodesCount: number;
  lastUsedAt?: Date;
  setupData?: MfaSetupData;
  biometricAvailable: boolean;
  biometricEnabled: boolean;
}

export interface UseMfaReturn {
  state: MfaState;
  isLoading: boolean;
  error: string | null;
  
  // Setup operations
  generateSetup: () => Promise<MfaSetupData | null>;
  enableMfa: (token: string) => Promise<boolean>;
  disableMfa: (password: string) => Promise<boolean>;
  
  // Verification operations
  verifyToken: (token: string, isBackupCode?: boolean) => Promise<boolean>;
  generateBackupCodes: () => Promise<string[] | null>;
  
  // Biometric operations
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => Promise<boolean>;
  authenticateWithBiometric: () => Promise<boolean>;
  
  // Utility operations
  checkMfaStatus: () => Promise<void>;
  clearError: () => void;
}

export function useCompleteMfa(): UseMfaReturn {
  const [state, setState] = useState<MfaState>({
    isEnabled: false,
    isSetupInProgress: false,
    backupCodesCount: 0,
    biometricAvailable: false,
    biometricEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GraphQL operations
  const [generateMfaSetup] = useMutation(GENERATE_MFA_SETUP_MUTATION);
  const [enableMfaMutation] = useMutation(ENABLE_MFA_MUTATION);
  const [disableMfaMutation] = useMutation(DISABLE_MFA_MUTATION);
  const [verifyMfaToken] = useMutation(VERIFY_MFA_TOKEN_MUTATION);
  const [generateBackupCodesMutation] = useMutation(GENERATE_BACKUP_CODES_MUTATION);

  const { data: mfaStatusData, refetch: refetchMfaStatus } = useQuery(GET_MFA_STATUS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  // Initialize biometric availability
  useEffect(() => {
    checkBiometricAvailability();
    loadBiometricSettings();
  }, []);

  // Update state when query data changes
  useEffect(() => {
    if (mfaStatusData?.getMfaStatus) {
      const status = mfaStatusData.getMfaStatus;
      setState(prev => ({
        ...prev,
        isEnabled: status.isEnabled,
        backupCodesCount: status.backupCodesCount,
        lastUsedAt: status.lastUsedAt ? new Date(status.lastUsedAt) : undefined,
      }));
    }
  }, [mfaStatusData]);

  const checkBiometricAvailability = async () => {
    try {
      const isAvailable = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      setState(prev => ({
        ...prev,
        biometricAvailable: isAvailable && isEnrolled,
      }));
    } catch (error) {
      console.error('Failed to check biometric availability:', error);
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const enabled = await secureStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      setState(prev => ({
        ...prev,
        biometricEnabled: enabled === 'true',
      }));
    } catch (error) {
      console.error('Failed to load biometric settings:', error);
    }
  };

  const updateState = useCallback((updates: Partial<MfaState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const generateSetup = useCallback(async (): Promise<MfaSetupData | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateMfaSetup();
      
      if (result.data?.generateMfaSetup) {
        const setupData = result.data.generateMfaSetup;
        updateState({ 
          setupData,
          isSetupInProgress: true,
        });
        return setupData;
      } else {
        throw new Error('Failed to generate MFA setup');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate MFA setup';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [generateMfaSetup, updateState]);

  const enableMfa = useCallback(async (token: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await enableMfaMutation({
        variables: { input: { token } }
      });

      if (result.data?.enableMfa?.success) {
        updateState({
          isEnabled: true,
          isSetupInProgress: false,
          setupData: undefined,
        });
        
        // Refresh status to get updated backup codes count
        await refetchMfaStatus();
        
        Vibration.vibrate(100); // Success feedback
        return true;
      } else {
        throw new Error(result.data?.enableMfa?.message || 'Failed to enable MFA');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable MFA';
      setError(errorMessage);
      Vibration.vibrate([100, 100, 100]); // Error feedback
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [enableMfaMutation, updateState, refetchMfaStatus]);

  const disableMfa = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await disableMfaMutation({
        variables: { input: { password } }
      });

      if (result.data?.disableMfa?.success) {
        updateState({
          isEnabled: false,
          backupCodesCount: 0,
          lastUsedAt: undefined,
        });
        
        // Also disable biometric if it was enabled
        await disableBiometric();
        
        return true;
      } else {
        throw new Error(result.data?.disableMfa?.message || 'Failed to disable MFA');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [disableMfaMutation, updateState]);

  const verifyToken = useCallback(async (token: string, isBackupCode = false): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await verifyMfaToken({
        variables: {
          input: {
            token,
            isBackupCode,
          }
        }
      });

      if (result.data?.verifyMfaToken?.success) {
        // Update last used time
        updateState({ lastUsedAt: new Date() });
        
        // If backup code was used, refresh status to update count
        if (isBackupCode) {
          await refetchMfaStatus();
        }
        
        Vibration.vibrate(100); // Success feedback
        return true;
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed';
      setError(errorMessage);
      Vibration.vibrate([100, 100, 100]); // Error feedback
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [verifyMfaToken, updateState, refetchMfaStatus]);

  const generateBackupCodes = useCallback(async (): Promise<string[] | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateBackupCodesMutation();
      
      if (result.data?.generateBackupCodes?.success) {
        const backupCodes = result.data.generateBackupCodes.backupCodes;
        updateState({ backupCodesCount: backupCodes.length });
        return backupCodes;
      } else {
        throw new Error('Failed to generate backup codes');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate backup codes';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [generateBackupCodesMutation, updateState]);

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    if (!state.biometricAvailable) {
      setError('Biometric authentication is not available on this device');
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable biometric authentication for MFA',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await secureStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, 'true');
        updateState({ biometricEnabled: true });
        return true;
      } else {
        setError('Biometric authentication failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to enable biometric authentication';
      setError(errorMessage);
      return false;
    }
  }, [state.biometricAvailable, updateState]);

  const disableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      await secureStorage.removeItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      updateState({ biometricEnabled: false });
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disable biometric authentication';
      setError(errorMessage);
      return false;
    }
  }, [updateState]);

  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!state.biometricEnabled || !state.biometricAvailable) {
      setError('Biometric authentication is not enabled or available');
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with biometrics',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        Vibration.vibrate(100); // Success feedback
        return true;
      } else {
        setError('Biometric authentication failed');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Biometric authentication failed';
      setError(errorMessage);
      return false;
    }
  }, [state.biometricEnabled, state.biometricAvailable]);

  const checkMfaStatus = useCallback(async (): Promise<void> => {
    try {
      await refetchMfaStatus();
    } catch (err) {
      console.error('Failed to check MFA status:', err);
    }
  }, [refetchMfaStatus]);

  return {
    state,
    isLoading,
    error,
    generateSetup,
    enableMfa,
    disableMfa,
    verifyToken,
    generateBackupCodes,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    checkMfaStatus,
    clearError,
  };
}