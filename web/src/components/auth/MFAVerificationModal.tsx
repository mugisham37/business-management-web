'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useMFA } from '@/lib/hooks/auth/useMFA';
import { cn } from '@/lib/utils';

interface MFAVerificationModalProps {
    isOpen: boolean;
    mfaToken: string;
    onVerify: (token: string) => Promise<void>;
    onCancel: () => void;
}

export function MFAVerificationModal({
    isOpen,
    mfaToken,
    onVerify,
    onCancel,
}: MFAVerificationModalProps) {
    const [verificationCode, setVerificationCode] = useState('');
    const [backupCode, setBackupCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { verifyToken } = useMFA();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsVerifying(true);

        try {
            const code = useBackupCode ? backupCode : verificationCode;
            if (!code.trim()) {
                setError('Please enter a verification code');
                return;
            }

            const success = await verifyToken(code);
            if (success) {
                await onVerify(code);
            } else {
                setError('Invalid verification code. Please try again.');
            }
        } catch (error: any) {
            setError(error.message || 'Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleInputChange = (value: string) => {
        // Only allow numbers and limit to 6 digits for TOTP
        if (!useBackupCode) {
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setVerificationCode(numericValue);
        } else {
            setBackupCode(value);
        }
        setError(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => !isVerifying && onCancel()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        Two-Factor Authentication
                    </DialogTitle>
                </DialogHeader>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {useBackupCode
                                ? 'Enter one of your backup codes to complete sign in'
                                : 'Enter the 6-digit code from your authenticator app'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="mfa-code">
                                {useBackupCode ? 'Backup Code' : 'Verification Code'}
                            </Label>
                            <Input
                                id="mfa-code"
                                type="text"
                                value={useBackupCode ? backupCode : verificationCode}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder={useBackupCode ? 'Enter backup code' : '000000'}
                                className={cn(
                                    'text-center text-lg tracking-widest',
                                    !useBackupCode && 'font-mono',
                                    error && 'border-red-500 focus-visible:ring-red-500'
                                )}
                                disabled={isVerifying}
                                autoComplete="one-time-code"
                                autoFocus
                            />
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <button
                                type="button"
                                onClick={() => {
                                    setUseBackupCode(!useBackupCode);
                                    setVerificationCode('');
                                    setBackupCode('');
                                    setError(null);
                                }}
                                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                disabled={isVerifying}
                            >
                                {useBackupCode ? 'Use authenticator app' : 'Use backup code'}
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={isVerifying}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isVerifying || (!verificationCode && !backupCode)}
                                className="flex-1"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify'
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Having trouble? Contact support for assistance.
                        </p>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}

export default MFAVerificationModal;