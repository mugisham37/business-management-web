'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { useAuthWithRetry } from '@/hooks/useAuthWithRetry';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { cn } from '@/lib/utils/cn';

interface LoginFormProps {
    onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
    onForgotPassword?: () => void;
    isLoading?: boolean;
    error?: string | null;
    useRetryLogic?: boolean;
}

export function LoginForm({
    onSubmit,
    onForgotPassword,
    isLoading: externalLoading = false,
    error: externalError = null,
    useRetryLogic = true,
}: LoginFormProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const networkStatus = useNetworkStatus();
    const authWithRetry = useAuthWithRetry({
        onError: (error) => {
            console.error('Login error:', error);
        },
        onRetry: (attempt) => {
            console.log('Retrying login, attempt:', attempt);
        },
    });

    // Use retry logic if enabled, otherwise use external props
    const isLoading = useRetryLogic ? authWithRetry.isLoading : externalLoading;
    const error = useRetryLogic ? authWithRetry.error : 
        (externalError ? { message: externalError, userMessage: externalError, retryable: false, code: 'UNKNOWN_ERROR' as any } : null);

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

        try {
            if (useRetryLogic) {
                await authWithRetry.login(email, password);
            } else if (onSubmit) {
                await onSubmit({ email, password, rememberMe });
            }
        } catch (error) {
            // Error is handled by the retry logic or parent component
            console.error('Login submission error:', error);
        }
    };

    const handleRetry = async () => {
        if (useRetryLogic) {
            await authWithRetry.retry();
        }
    };

    const handleDismissError = () => {
        if (useRetryLogic) {
            authWithRetry.clearError();
        }
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
            className="space-y-5"
        >
            {/* Network Status Warning */}
            {!networkStatus.isOnline && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900"
                >
                    <WifiOff className="w-5 h-5 text-orange-500 shrink-0" />
                    <p className="text-sm text-orange-700 dark:text-orange-400">
                        You're currently offline. Please check your internet connection.
                    </p>
                </motion.div>
            )}

            {/* Enhanced Error Display */}
            <AuthErrorDisplay
                error={error}
                canRetry={useRetryLogic ? authWithRetry.canRetry : false}
                isRetrying={isLoading}
                retryCount={useRetryLogic ? authWithRetry.retryCount : 0}
                onRetry={handleRetry}
                onDismiss={handleDismissError}
                onAction={handleErrorAction}
            />

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
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
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
