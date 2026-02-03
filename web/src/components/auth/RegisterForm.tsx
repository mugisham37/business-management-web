'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Building2, Loader2, Check, X, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { AuthErrorDisplay } from './AuthErrorDisplay';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { useSecurity } from '@/lib/hooks/auth/useSecurity';
import { usePermissions } from '@/lib/hooks/auth/usePermissions';
import { AuthEventEmitter } from '@/lib/auth/auth-events';
import { AuthErrorCode } from '@/lib/auth/auth-errors';
import { cn } from '@/lib/utils';

interface RegisterFormProps {
    onSubmit?: (data: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        businessName: string;
        acceptTerms: boolean;
    }) => Promise<void>;
    onRegistrationSuccess?: (user: { id: string; email: string; displayName?: string }) => void;
    isLoading?: boolean;
    error?: string | null;
    className?: string;
}

interface PasswordStrength {
    score: number;
    label: string;
    color: string;
    checks: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumber: boolean;
        hasSpecial: boolean;
    };
}

function calculatePasswordStrength(password: string): PasswordStrength {
    const checks = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    if (score <= 2) {
        return { score, label: 'Weak', color: 'bg-red-500', checks };
    } else if (score <= 3) {
        return { score, label: 'Fair', color: 'bg-orange-500', checks };
    } else if (score <= 4) {
        return { score, label: 'Good', color: 'bg-yellow-500', checks };
    } else {
        return { score, label: 'Strong', color: 'bg-green-500', checks };
    }
}

export function RegisterForm({
    onSubmit,
    onRegistrationSuccess,
    isLoading: externalLoading = false,
    error: externalError = null,
    className,
}: RegisterFormProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // Use foundation layer hooks
    const { register, isLoading: authLoading, error: authErrorString, clearError: clearAuthError } = useAuth();
    const { riskScore, riskLevel, logSecurityEvent } = useSecurity();
    const { availableRoles } = usePermissions();

    // Determine loading and error states
    const isLoading = externalLoading || authLoading;
    const error = externalError || authErrorString;

    const passwordStrength = useMemo(() => calculatePasswordStrength(password), [password]);

    // Listen for registration success events
    useEffect(() => {
        const handleRegistrationSuccess = (user: { id: string; email: string; displayName?: string }) => {
            if (onRegistrationSuccess) {
                onRegistrationSuccess(user);
            }
        };

        AuthEventEmitter.on('auth:register', handleRegistrationSuccess);
        return () => {
            AuthEventEmitter.off('auth:register', handleRegistrationSuccess);
        };
    }, [onRegistrationSuccess]);

    // Log security events
    useEffect(() => {
        if (error) {
            logSecurityEvent('registration_failed', `Registration attempt failed: ${error}`, {
                email,
                businessName,
                riskScore,
                timestamp: new Date().toISOString(),
            });
        }
    }, [error, email, businessName, riskScore, logSecurityEvent]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!firstName.trim()) {
            errors.firstName = 'First name is required';
        }

        if (!lastName.trim()) {
            errors.lastName = 'Last name is required';
        }

        if (!email) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }

        if (!password) {
            errors.password = 'Password is required';
        } else if (passwordStrength.score < 3) {
            errors.password = 'Password is too weak';
        }

        if (!businessName.trim()) {
            errors.businessName = 'Business name is required';
        }

        if (!acceptTerms) {
            errors.acceptTerms = 'You must accept the terms and conditions';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        clearAuthError();

        const registrationData = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email,
            password,
            businessName: businessName.trim(),
            acceptTerms,
        };

        try {
            // Log security event for registration attempt
            await logSecurityEvent('registration_attempt', 'User attempting to register', {
                email,
                businessName: businessName.trim(),
                riskScore,
                riskLevel,
                timestamp: new Date().toISOString(),
            });

            if (onSubmit) {
                // Use external submit handler
                await onSubmit(registrationData);
            } else {
                // Use foundation layer register - tenantId will be assigned by server for new registrations
                await register({
                    ...registrationData,
                    tenantId: '', // Server will create new tenant for registration
                });
            }
        } catch (error) {
            console.error('Registration submission error:', error);
            // Error is handled by the foundation layer
        }
    };

    const handleRetry = async () => {
        clearAuthError();
        await handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    };

    const handleDismissError = () => {
        clearAuthError();
    };

    const handleErrorAction = (action: string) => {
        switch (action) {
            case 'RETRY':
                handleRetry();
                break;
            default:
                console.log('Unhandled error action:', action);
        }
    };

    const clearFieldError = (field: string) => {
        if (validationErrors[field]) {
            setValidationErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
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
            {(riskLevel === 'high' || riskLevel === 'critical') && (
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
                            Additional verification may be required during registration
                        </p>
                    </div>
                </motion.div>
            )}

            {/* Available Roles Info */}
            {availableRoles.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900"
                >
                    <User className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                            Account Setup
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">
                            Your account will be configured with appropriate permissions after registration
                        </p>
                    </div>
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

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                        First name
                    </Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(e) => {
                                setFirstName(e.target.value);
                                clearFieldError('firstName');
                            }}
                            placeholder="John"
                            className={cn(
                                'pl-10 h-12',
                                validationErrors.firstName && 'border-red-500 focus-visible:ring-red-500'
                            )}
                            disabled={isLoading}
                            autoComplete="given-name"
                        />
                    </div>
                    {validationErrors.firstName && (
                        <p className="text-sm text-red-500">{validationErrors.firstName}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                        Last name
                    </Label>
                    <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => {
                            setLastName(e.target.value);
                            clearFieldError('lastName');
                        }}
                        placeholder="Doe"
                        className={cn(
                            'h-12',
                            validationErrors.lastName && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        disabled={isLoading}
                        autoComplete="family-name"
                    />
                    {validationErrors.lastName && (
                        <p className="text-sm text-red-500">{validationErrors.lastName}</p>
                    )}
                </div>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium">
                    Business name
                </Label>
                <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="businessName"
                        type="text"
                        value={businessName}
                        onChange={(e) => {
                            setBusinessName(e.target.value);
                            clearFieldError('businessName');
                        }}
                        placeholder="Acme Corporation"
                        className={cn(
                            'pl-10 h-12',
                            validationErrors.businessName && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        disabled={isLoading}
                        autoComplete="organization"
                    />
                </div>
                {validationErrors.businessName && (
                    <p className="text-sm text-red-500">{validationErrors.businessName}</p>
                )}
            </div>

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
                            clearFieldError('email');
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
                <Label htmlFor="password" className="text-sm font-medium">
                    Password
                </Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clearFieldError('password');
                        }}
                        placeholder="••••••••"
                        className={cn(
                            'pl-10 pr-10 h-12',
                            validationErrors.password && 'border-red-500 focus-visible:ring-red-500'
                        )}
                        disabled={isLoading}
                        autoComplete="new-password"
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    className={cn('h-full transition-all', passwordStrength.color)}
                                />
                            </div>
                            <span className={cn('text-sm font-medium', passwordStrength.color.replace('bg-', 'text-'))}>
                                {passwordStrength.label}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-xs">
                            {[
                                { key: 'minLength', label: '8+ characters' },
                                { key: 'hasUppercase', label: 'Uppercase' },
                                { key: 'hasLowercase', label: 'Lowercase' },
                                { key: 'hasNumber', label: 'Number' },
                            ].map(({ key, label }) => (
                                <div
                                    key={key}
                                    className={cn(
                                        'flex items-center gap-1',
                                        passwordStrength.checks[key as keyof typeof passwordStrength.checks]
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-gray-400'
                                    )}
                                >
                                    {passwordStrength.checks[key as keyof typeof passwordStrength.checks] ? (
                                        <Check className="w-3 h-3" />
                                    ) : (
                                        <X className="w-3 h-3" />
                                    )}
                                    {label}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {validationErrors.password && (
                    <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2">
                <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => {
                        setAcceptTerms(checked as boolean);
                        clearFieldError('acceptTerms');
                    }}
                    disabled={isLoading}
                    className="mt-0.5"
                />
                <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                    I agree to the{' '}
                    <a href="/terms" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                        Privacy Policy
                    </a>
                </Label>
            </div>
            {validationErrors.acceptTerms && (
                <p className="text-sm text-red-500 -mt-3">{validationErrors.acceptTerms}</p>
            )}

            {/* Submit Button */}
            <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base font-semibold bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating account...
                    </>
                ) : (
                    'Create account'
                )}
            </Button>
        </motion.form>
    );
}

export default RegisterForm;
