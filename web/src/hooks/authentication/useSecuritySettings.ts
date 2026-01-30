/**
 * Security Settings Hook
 * Manages advanced security configuration and policies
 */

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { GET_SECURITY_SETTINGS_QUERY } from '@/graphql/queries/auth-complete';
import {
  UPDATE_SECURITY_SETTINGS_MUTATION,
  BLOCK_IP_ADDRESS_MUTATION,
  UNBLOCK_IP_ADDRESS_MUTATION,
} from '@/graphql/mutations/auth-complete';

export interface SecuritySettings {
  maxFailedAttempts: number;
  lockoutDuration: number; // minutes
  sessionTimeout: number; // hours
  requireMfaForAdmin: boolean;
  allowedIpRanges: string[];
  blockedIpAddresses: string[];
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number;
    maxAge: number; // days
  };
  deviceTrustPolicy: {
    trustNewDevices: boolean;
    requireApprovalForNewDevices: boolean;
    deviceTrustDuration: number; // days
  };
  auditSettings: {
    logAllEvents: boolean;
    retentionPeriod: number; // days
    alertOnSuspiciousActivity: boolean;
    emailNotifications: boolean;
  };
}

export interface IPRestriction {
  id: string;
  ipAddress: string;
  type: 'allow' | 'block';
  reason: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface UseSecuritySettingsReturn {
  settings: SecuritySettings | null;
  ipRestrictions: IPRestriction[];
  isLoading: boolean;
  error: string | null;
  
  // Settings management
  updateSettings: (updates: Partial<SecuritySettings>) => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;
  
  // IP management
  blockIpAddress: (ipAddress: string, reason: string, expiresAt?: Date) => Promise<boolean>;
  unblockIpAddress: (ipAddress: string) => Promise<boolean>;
  addAllowedIpRange: (ipRange: string) => Promise<boolean>;
  removeAllowedIpRange: (ipRange: string) => Promise<boolean>;
  
  // Utility functions
  validateIpAddress: (ip: string) => boolean;
  validateIpRange: (range: string) => boolean;
  isIpBlocked: (ip: string) => boolean;
  isIpAllowed: (ip: string) => boolean;
}

const DEFAULT_SETTINGS: SecuritySettings = {
  maxFailedAttempts: 5,
  lockoutDuration: 15,
  sessionTimeout: 24,
  requireMfaForAdmin: true,
  allowedIpRanges: [],
  blockedIpAddresses: [],
  passwordPolicy: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    maxAge: 90,
  },
  deviceTrustPolicy: {
    trustNewDevices: false,
    requireApprovalForNewDevices: true,
    deviceTrustDuration: 30,
  },
  auditSettings: {
    logAllEvents: true,
    retentionPeriod: 365,
    alertOnSuspiciousActivity: true,
    emailNotifications: true,
  },
};

export function useSecuritySettings(): UseSecuritySettingsReturn {
  const [ipRestrictions, setIpRestrictions] = useState<IPRestriction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // GraphQL operations
  const { data: settingsData, loading: settingsLoading, refetch } = useQuery(
    GET_SECURITY_SETTINGS_QUERY,
    {
      fetchPolicy: 'cache-and-network',
      onError: (err) => setError(err.message),
    }
  );

  const [updateSettingsMutation, { loading: updateLoading }] = useMutation(
    UPDATE_SECURITY_SETTINGS_MUTATION,
    {
      onError: (err) => setError(err.message),
      onCompleted: () => {
        setError(null);
        refetch();
      },
    }
  );

  const [blockIpMutation] = useMutation(BLOCK_IP_ADDRESS_MUTATION, {
    onError: (err) => setError(err.message),
  });

  const [unblockIpMutation] = useMutation(UNBLOCK_IP_ADDRESS_MUTATION, {
    onError: (err) => setError(err.message),
  });

  const settings = settingsData?.getSecuritySettings || null;
  const isLoading = settingsLoading || updateLoading;

  // Utility functions - defined first since they are used by other functions
  const validateIpAddress = useCallback((ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }, []);

  const validateIpRange = useCallback((range: string): boolean => {
    // Support CIDR notation (e.g., 192.168.1.0/24)
    const cidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
    
    // Support range notation (e.g., 192.168.1.1-192.168.1.100)
    const rangeRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)-(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    return cidrRegex.test(range) || rangeRegex.test(range) || validateIpAddress(range);
  }, [validateIpAddress]);

  const isIpBlocked = useCallback((ip: string): boolean => {
    const currentSettings = settings || DEFAULT_SETTINGS;
    return currentSettings.blockedIpAddresses.includes(ip) ||
           ipRestrictions.some(restriction => 
             restriction.type === 'block' && 
             restriction.ipAddress === ip && 
             restriction.isActive &&
             (!restriction.expiresAt || restriction.expiresAt > new Date())
           );
  }, [settings, ipRestrictions]);

  const isIpAllowed = useCallback((ip: string): boolean => {
    const currentSettings = settings || DEFAULT_SETTINGS;
    
    // If no allowed ranges specified, allow all (except blocked)
    if (currentSettings.allowedIpRanges.length === 0) {
      return !isIpBlocked(ip);
    }

    // Check if IP is in any allowed range
    const isInAllowedRange = currentSettings.allowedIpRanges.some((range: string) => {
      if (range === ip) return true;
      
      // Simple CIDR check (basic implementation)
      if (range.includes('/')) {
        const [network, prefixLength] = range.split('/');
        // This is a simplified check - in production, use a proper CIDR library
        return ip.startsWith(network.split('.').slice(0, Math.floor(parseInt(prefixLength) / 8)).join('.'));
      }
      
      return false;
    });

    return isInAllowedRange && !isIpBlocked(ip);
  }, [settings, isIpBlocked]);

  // Settings management
  const updateSettings = useCallback(async (updates: Partial<SecuritySettings>): Promise<boolean> => {
    try {
      setError(null);
      
      const result = await updateSettingsMutation({
        variables: {
          input: updates,
        },
      });

      return result.data?.updateSecuritySettings?.success || false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      return false;
    }
  }, [updateSettingsMutation]);

  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    return updateSettings(DEFAULT_SETTINGS);
  }, [updateSettings]);

  // IP management
  const blockIpAddress = useCallback(async (
    ipAddress: string,
    reason: string,
    expiresAt?: Date
  ): Promise<boolean> => {
    if (!validateIpAddress(ipAddress)) {
      setError('Invalid IP address format');
      return false;
    }

    try {
      setError(null);
      
      const result = await blockIpMutation({
        variables: {
          input: {
            ipAddress,
            reason,
            expiresAt: expiresAt?.toISOString(),
          },
        },
      });

      if (result.data?.blockIpAddress?.success) {
        // Update local state
        const newRestriction: IPRestriction = {
          id: `block_${Date.now()}`,
          ipAddress,
          type: 'block',
          reason,
          createdAt: new Date(),
          ...(expiresAt !== undefined && { expiresAt }),
          isActive: true,
        };
        
        setIpRestrictions(prev => [...prev, newRestriction]);
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to block IP address';
      setError(errorMessage);
      return false;
    }
  }, [blockIpMutation, validateIpAddress]);

  const unblockIpAddress = useCallback(async (ipAddress: string): Promise<boolean> => {
    try {
      setError(null);
      
      const result = await unblockIpMutation({
        variables: {
          input: { ipAddress },
        },
      });

      if (result.data?.unblockIpAddress?.success) {
        // Update local state
        setIpRestrictions(prev => 
          prev.filter(restriction => 
            !(restriction.ipAddress === ipAddress && restriction.type === 'block')
          )
        );
        return true;
      }

      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unblock IP address';
      setError(errorMessage);
      return false;
    }
  }, [unblockIpMutation]);

  const addAllowedIpRange = useCallback(async (ipRange: string): Promise<boolean> => {
    if (!validateIpRange(ipRange)) {
      setError('Invalid IP range format');
      return false;
    }

    const currentSettings = settings || DEFAULT_SETTINGS;
    const updatedSettings = {
      ...currentSettings,
      allowedIpRanges: [...currentSettings.allowedIpRanges, ipRange],
    };

    return updateSettings(updatedSettings);
  }, [settings, updateSettings, validateIpRange]);

  const removeAllowedIpRange = useCallback(async (ipRange: string): Promise<boolean> => {
    const currentSettings = settings || DEFAULT_SETTINGS;
    const updatedSettings = {
      ...currentSettings,
      allowedIpRanges: currentSettings.allowedIpRanges.filter((range: string) => range !== ipRange),
    };

    return updateSettings(updatedSettings);
  }, [settings, updateSettings]);

  return {
    settings,
    ipRestrictions,
    isLoading,
    error,
    updateSettings,
    resetToDefaults,
    blockIpAddress,
    unblockIpAddress,
    addAllowedIpRange,
    removeAllowedIpRange,
    validateIpAddress,
    validateIpRange,
    isIpBlocked,
    isIpAllowed,
  };
}