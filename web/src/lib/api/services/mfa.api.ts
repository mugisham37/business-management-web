/**
 * Multi-Factor Authentication (MFA) API Service
 * 
 * Provides typed functions for all 5 MFA endpoints.
 * 
 * Endpoints:
 * - POST /mfa/setup - Setup MFA (get QR code and secret)
 * - POST /mfa/enable - Enable MFA with TOTP verification
 * - POST /mfa/disable - Disable MFA with TOTP verification
 * - GET /mfa/status - Get MFA status
 * - POST /mfa/regenerate-backup-codes - Regenerate backup codes
 * 
 * Requirements: 6.2, 12.1, 12.2, 12.4, 12.6
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';
import type {
  MfaEnableRequest,
  MfaDisableRequest,
} from '@/types/api/requests';
import type {
  ApiResponse,
  MfaSetupResponse,
  MfaStatusResponse,
  BackupCodesResponse,
} from '@/types/api/responses';

export const mfaApi = {
  /**
   * Setup MFA - Get QR code, secret, and initial backup codes
   * POST /mfa/setup
   */
  setup: () =>
    apiClient.post<ApiResponse<MfaSetupResponse>>(API_ENDPOINTS.MFA.SETUP),

  /**
   * Enable MFA with TOTP code verification
   * POST /mfa/enable
   */
  enable: (data: MfaEnableRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.MFA.ENABLE, data),

  /**
   * Disable MFA with TOTP code verification
   * POST /mfa/disable
   */
  disable: (data: MfaDisableRequest) =>
    apiClient.post<ApiResponse<void>>(API_ENDPOINTS.MFA.DISABLE, data),

  /**
   * Get MFA status for current user
   * GET /mfa/status
   */
  getStatus: () =>
    apiClient.get<ApiResponse<MfaStatusResponse>>(API_ENDPOINTS.MFA.STATUS),

  /**
   * Regenerate backup codes
   * POST /mfa/regenerate-backup-codes
   */
  regenerateBackupCodes: () =>
    apiClient.post<ApiResponse<BackupCodesResponse>>(API_ENDPOINTS.MFA.REGENERATE_BACKUP_CODES),
};
