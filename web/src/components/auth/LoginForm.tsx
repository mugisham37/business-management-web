'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { useSecurity } from '@/lib/hooks/auth/useSecurity';
import { useMFA } from '@/lib/hooks/auth/useMFA';
import { AuthEventEmitter } from '@/lib/auth/auth-events';
import { AuthErrorCode } from '@/lib/auth/auth-errors';
import { cn } from '@/lib/utils';

interface LoginFormProps {
    onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
    onForgotPassword?: () => void;
    onMfaRequired?: (mfaToken: string) => void;
    isLoading?: boolean;
    error?: string | null;
    className?: string;
}

export function LoginForm({
    onSubmit,
    onForgotPassword,
    onMfaRequired,
    isLoading: externalLoading = false,
    error: externalError = null,
    className,
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    // Use foundation layer hooks
    const { login, isLoading: authLoading, error: authErrorString, clearError } = useAuth();
    const { riskScore, riskLevel, logSecurityEvent } = useSecurity();
    const { isEnabled: mfaEnabled } = useMFA();

    // Determine loading and error states
    const isLoading = externalLoading || authLoading;
    const error = externalError || authErrorString;

    // Listen for MFA required events
    useEffect(() => {
        const handleMfaRequired = (data: { mfaToken?: string; userId?: string }) => {
            if (data.mfaToken && onMfaRequired) {
                onMfaRequired(data.mfaToken);
            }
        };

        AuthEventEmitter.on('auth:mfa_required', handleMfaRequired);
        return () => {
            AuthEventEmitter.off('auth:mfa_required', handleMfaRequired);
        };
    }, [onMfaRequired]);

    // Log security events
    useEffect(() => {
        if (error) {
            logSecurityEvent('login_failed', `Login attempt failed: ${error}`, {
                email,
                riskScore,
                timestamp: new Date().toISOString(),
            });
        }
    }, [error, email, riskScore, logSecurityEvent]);

    const validateForm = (): boolean => {
        const errors: { email?: string; password?: string } = {};

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        clearError();

        try {
            // Log security event for login attempt
            await logSecurityEvent('login_attempt', 'User attempting to log in', {
                email,
                riskScore,
                riskLevel,
                timestamp: new Date().toISOString(),
            });

            if (onSubmit) {
                // Use external submit handler
                await onSubmit({ email, password, rememberMe });
            } else {
                // Use foundation layer login
                const result = await login({
                    email,
                    password,
                    rememberMe,
                });

                if (result.requiresMfa && result.mfaToken && onMfaRequired) {
                    onMfaRequired(result.mfaToken);
                }
            }
        } catch (error) {
            console.error('Login submission error:', error);
            // Error is handled by the foundation layer
        }
    };

    const handleRetry = async () => {
        clearError();
        await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    };

    const handleDismissError = () => {
        clearError();
    };

    const handleErrorAction = (action: string) => {
        switch (action) {
            case 'RESET_PASSWORD':
                onForgotPassword?.();
                break;
            case 'RETRY':
                handleRetry();
                break;
            default:
                console.log('Unhandled error action:', action);
        }
    };

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit}
            className={cn("space-y-5", className)}
        >
            {/* Security Risk Indicator */}
            {riskLevel === 'high' || riskLevel === 'critical' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900"
                >
                    <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                            Enhanced Security Check
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500">
                            Additional verification may be required due to security assessment
                        </p>
                    </div>
                </motion.div>
            )}

            {/* MFA Status Indicator */}
            {mfaEnabled && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900"
                >
                    <Shield className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400">
                        Multi-factor authentication is enabled for enhanced security
                    </p>
                </motion.div>
            )}

            {/* Enhanced Error Display */}
            {error && (
                <AuthErrorDisplay
                    error={{ code: AuthErrorCode.UNKNOWN_ERROR, message: error, retryable: true }}
                    canRetry={true}
                    isRetrying={isLoading}
                    onRetry={handleRetry}
                    onDismiss={handleDismissError}
                    onAction={handleErrorAction}
                />
            )}

            {/* Email Field */}
            <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                </Label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            if (validationErrors.email) {
                                setValidationErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.email;
                                    return newErrors;
                                });
                            }
                        }}
                        placeholder="you@example.com"
                        className={cn(
                            'pl-10 h-12',
                            validationErrors.email && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        disabled={isLoading}
                        autoComplete="email"
                    />
                </div>
                {validationErrors.email && (
                    <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">
                        Password
                    </Label>
                    {onForgotPassword && (
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                        >
                            Forgot password?
                        </button>
                    )}
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (validationErrors.password) {
                                setValidationErrors((prev) => {
                                    const newErrors = { ...prev };
                                    delete newErrors.password;
                                    return newErrors;
                                });
                            }
                        }}
                        placeholder="••••••••"
                        className={cn(
                            'pl-10 pr-10 h-12',
                            validationErrors.password && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        disabled={isLoading}
                        autoComplete="current-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
                {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
                <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    disabled={isLoading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Remember me for 30 days
                </Label>
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Signing in...
                    </>
                ) : (
                    'Sign in'
                )}
            </Button>
        </motion.form>
    );
}

export default LoginForm;
