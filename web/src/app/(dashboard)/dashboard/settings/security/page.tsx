'use client';

import React, { useState } from 'react';
import { useMfaStatus, useSetupMfa, useEnableMfa, useDisableMfa, useRegenerateBackupCodes } from '@/hooks/api/useMfa';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { RiShieldKeyholeLine, RiCheckLine, RiAlertLine, RiKeyLine } from '@remixicon/react';
import Image from 'next/image';

export default function SecuritySettings() {
  const { data: mfaStatus, isLoading: statusLoading } = useMfaStatus();
  const setupMfa = useSetupMfa();
  const enableMfa = useEnableMfa();
  const disableMfa = useDisableMfa();
  const regenerateBackupCodes = useRegenerateBackupCodes();
  
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpCode, setTotpCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);

  const handleSetup = async () => {
    try {
      setError('');
      const result = await setupMfa.mutateAsync();
      setQrCode(result.qrCode);
      setSecret(result.secret);
      setBackupCodes(result.backupCodes);
      setShowSetup(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to setup MFA');
    }
  };

  const handleEnable = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setError('');
      await enableMfa.mutateAsync({ code: totpCode });
      setSuccess('Two-factor authentication enabled successfully!');
      setShowSetup(false);
      setTotpCode('');
      setQrCode('');
      setSecret('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    }
  };

  const handleDisable = async () => {
    if (!disableCode || disableCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    try {
      setError('');
      await disableMfa.mutateAsync({ code: disableCode });
      setSuccess('Two-factor authentication disabled successfully');
      setShowDisable(false);
      setDisableCode('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid code. Please try again.');
    }
  };

  const handleRegenerateBackupCodes = async () => {
    try {
      setError('');
      const result = await regenerateBackupCodes.mutateAsync();
      setBackupCodes(result.backupCodes);
      setSuccess('Backup codes regenerated successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to regenerate backup codes');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Security Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account security and two-factor authentication
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <RiAlertLine className="h-4 w-4" />
          <div>
            <p className="text-sm">{error}</p>
          </div>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <RiCheckLine className="h-4 w-4" />
          <div>
            <p className="text-sm">{success}</p>
          </div>
        </Alert>
      )}

      {/* MFA Status Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <RiShieldKeyholeLine className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Two-Factor Authentication
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
              <div className="mt-2">
                {mfaStatus?.enabled ? (
                  <Badge variant="success">Enabled</Badge>
                ) : (
                  <Badge variant="neutral">Disabled</Badge>
                )}
              </div>
            </div>
          </div>

          {!showSetup && !showDisable && (
            <div>
              {!mfaStatus?.enabled ? (
                <Button
                  variant="primary"
                  onClick={handleSetup}
                  isLoading={setupMfa.isPending}
                >
                  Enable 2FA
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  onClick={() => setShowDisable(true)}
                >
                  Disable 2FA
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Setup Flow */}
        {showSetup && qrCode && (
          <div className="mt-6 space-y-6 border-t border-border pt-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Step 1: Scan QR Code
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="mt-4 flex justify-center">
                <div className="rounded-lg border border-border bg-white p-4">
                  <Image
                    src={qrCode}
                    alt="MFA QR Code"
                    width={200}
                    height={200}
                  />
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Or enter this code manually:
                </p>
                <button
                  onClick={() => copyToClipboard(secret)}
                  className="mt-1 rounded bg-muted px-3 py-1 font-mono text-sm text-foreground hover:bg-muted/80"
                >
                  {secret}
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-foreground">
                Step 2: Verify Code
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app
              </p>
              <div className="mt-4 max-w-xs space-y-4">
                <div>
                  <Label htmlFor="totpCode">Authentication code</Label>
                  <Input
                    id="totpCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setTotpCode(value);
                      if (error) setError('');
                    }}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={handleEnable}
                    isLoading={enableMfa.isPending}
                    disabled={totpCode.length !== 6}
                  >
                    Enable 2FA
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowSetup(false);
                      setQrCode('');
                      setSecret('');
                      setTotpCode('');
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Step 3: Save Backup Codes
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/50 p-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm text-foreground"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                >
                  Copy all codes
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Disable Flow */}
        {showDisable && (
          <div className="mt-6 space-y-4 border-t border-border pt-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">
                Disable Two-Factor Authentication
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a code from your authenticator app to disable 2FA
              </p>
            </div>
            <div className="max-w-xs space-y-4">
              <div>
                <Label htmlFor="disableCode">Authentication code</Label>
                <Input
                  id="disableCode"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={disableCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setDisableCode(value);
                    if (error) setError('');
                  }}
                  className="text-center text-2xl tracking-widest"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleDisable}
                  isLoading={disableMfa.isPending}
                  disabled={disableCode.length !== 6}
                >
                  Disable 2FA
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDisable(false);
                    setDisableCode('');
                    setError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backup Codes Management */}
        {mfaStatus?.enabled && !showSetup && !showDisable && (
          <div className="mt-6 border-t border-border pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <RiKeyLine className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Backup Codes
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {mfaStatus.backupCodesRemaining} backup codes remaining
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRegenerateBackupCodes}
                isLoading={regenerateBackupCodes.isPending}
              >
                Regenerate codes
              </Button>
            </div>

            {backupCodes.length > 0 && (
              <div className="mt-4">
                <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/50 p-4">
                  {backupCodes.map((code, index) => (
                    <div
                      key={index}
                      className="font-mono text-sm text-foreground"
                    >
                      {code}
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyToClipboard(backupCodes.join('\n'))}
                >
                  Copy all codes
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
