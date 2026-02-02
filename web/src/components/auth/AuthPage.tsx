'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuth } from '@/lib/hooks/auth/useAuth';
import { useMFA } from '@/lib/hooks/auth/useMFA';
import { useSecurity } from '@/lib/hooks/auth/useSecurity';
import { AuthEventEmitter } from '@/lib/auth/auth-events';
import { MFAVerificationModal } from './MFAVerificationModal';

type AuthMode = 'login' | 'register' | 'mfa';

interface AuthPageProps {
    defaultMode?: AuthMode;
    onLoginSuccess?: () => void;
    onRegisterSuccess?: () => void;
    redirectTo?: string;
}

export function AuthPage({
    defaultMode = 'login',
    onLoginSuccess,
    onRegisterSuccess,
    redirectTo = '/dashboard',
}: AuthPageProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get mode from URL params or use default
    const urlMode = searchParams?.get('mode') as AuthMode;
    const initialMode = urlMode && ['login', 'register'].includes(urlMode) ? urlMode : defaultMode;
    
    const [mode, setMode] = useState<AuthMode>(initialMode);
    const [mfaToken, setMfaToken] = useState<string | null>(null);
    const [showMfaModal, setShowMfaModal] = useState(false);

    // Use foundation layer hooks
    const { user, isAuthenticated, isLoading, error } = useAuth();
    const { verifyToken: verifyMfaToken } = useMFA();
    const { logSecurityEvent } = useSecurity();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated && user) {
            router.push(redirectTo);
        }
    }, [isAuthenticated, user, router, redirectTo]);

    // Update mode when URL params change
    useEffect(() => {
        const urlMode = searchParams?.get('mode') as AuthMode;
        if (urlMode && ['login', 'register'].includes(urlMode) && urlMode !== mode) {
            setMode(urlMode);
        }
    }, [searchParams, mode]);

    // Listen for auth events
    useEffect(() => {
        const handleLoginSuccess = (user: any) => {
            logSecurityEvent('login_success', 'User successfully logged in', {
                userId: user.id,
                email: user.email,
                timestamp: new Date().toISOString(),
            });
            onLoginSuccess?.();
        };

        const handleRegisterSuccess = (user: any) => {
            logSecurityEvent('registration_success', 'User successfully registered', {
                userId: user.id,
                email: user.email,
                timestamp: new Date().toISOString(),
            });
            onRegisterSuccess?.();
        };

        const handleMfaRequired = (data: { mfaToken?: string }) => {
            if (data.mfaToken) {
                setMfaToken(data.mfaToken);
                setShowMfaModal(true);
                setMode('mfa');
            }
        };

        AuthEventEmitter.on('auth:login', handleLoginSuccess);
        AuthEventEmitter.on('auth:register', handleRegisterSuccess);
        AuthEventEmitter.on('auth:mfa_required', handleMfaRequired);

        return () => {
            AuthEventEmitter.off('auth:login', handleLoginSuccess);
            AuthEventEmitter.off('auth:register', handleRegisterSuccess);
            AuthEventEmitter.off('auth:mfa_required', handleMfaRequired);
        };
    }, [onLoginSuccess, onRegisterSuccess, logSecurityEvent]);

    // Function to update URL when mode changes
    const updateModeInUrl = useCallback((newMode: AuthMode) => {
        if (newMode === 'mfa') return; // Don't update URL for MFA mode
        
        const params = new URLSearchParams(searchParams?.toString());
        params.set('mode', newMode);
        router.replace(`/auth?${params.toString()}`, { scroll: false });
        setMode(newMode);
    }, [router, searchParams]);

    const handleMfaRequired = useCallback((token: string) => {
        setMfaToken(token);
        setShowMfaModal(true);
        setMode('mfa');
    }, []);

    const handleMfaVerification = useCallback(async (token: string) => {
        try {
            const success = await verifyMfaToken(token);
            if (success) {
                setShowMfaModal(false);
                setMfaToken(null);
                // Auth success will be handled by the auth event listener
            }
        } catch (error) {
            console.error('MFA verification failed:', error);
        }
    }, [verifyMfaToken]);

    const handleMfaCancel = useCallback(() => {
        setShowMfaModal(false);
        setMfaToken(null);
        setMode('login');
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
            {/* Main Content */}
            <main className="flex min-h-screen">
                {/* Left Panel - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 pt-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full max-w-md"
                    >
                        {/* Title */}
                        <div className="text-center mb-8">
                            <motion.h1
                                key={mode}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                            >
                                {mode === 'login' ? 'Welcome back' : 'Create your account'}
                            </motion.h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {mode === 'login'
                                    ? 'Sign in to access your business dashboard'
                                    : 'Start managing your business today'}
                            </p>
                        </div>

                        {/* Social Login */}
                        <SocialLoginButtons
                            redirectTo={redirectTo}
                            onSuccess={async (result) => {
                                console.log('Social auth success:', result);
                                // Success is handled by auth event listeners
                            }}
                            onError={(error) => {
                                console.error('Social auth error:', error);
                            }}
                        />

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                            <span className="px-4 text-sm text-gray-500 dark:text-gray-400">
                                or continue with email
                            </span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        </div>

                        {/* Form */}
                        <AnimatePresence mode="wait">
                            {mode === 'login' ? (
                                <motion.div
                                    key="login"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <LoginForm
                                        onMfaRequired={handleMfaRequired}
                                        onForgotPassword={() => router.push('/forgot-password')}
                                    />
                                </motion.div>
                            ) : mode === 'register' ? (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <RegisterForm />
                                </motion.div>
                            ) : null}
                        </AnimatePresence>

                        {/* Toggle Mode */}
                        {mode !== 'mfa' && (
                            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                                {mode === 'login' ? (
                                    <>
                                        Don&apos;t have an account?{' '}
                                        <button
                                            onClick={() => updateModeInUrl('register')}
                                            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => updateModeInUrl('login')}
                                            className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* MFA Verification Modal */}
                {showMfaModal && mfaToken && (
                    <MFAVerificationModal
                        isOpen={showMfaModal}
                        mfaToken={mfaToken}
                        onVerify={handleMfaVerification}
                        onCancel={handleMfaCancel}
                    />
                )}

                {/* Right Panel - Decorative */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
                        <div className="absolute inset-0 opacity-30">
                            <svg
                                className="w-full h-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                            >
                                <defs>
                                    <pattern
                                        id="grid"
                                        width="10"
                                        height="10"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <path
                                            d="M 10 0 L 0 0 0 10"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.5"
                                            className="text-white/20"
                                        />
                                    </pattern>
                                </defs>
                                <rect width="100" height="100" fill="url(#grid)" />
                            </svg>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center p-12 text-white">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-center"
                        >
                            <h2 className="text-4xl font-bold mb-6">
                                Manage Your Business
                                <br />
                                Like Never Before
                            </h2>
                            <p className="text-lg text-white/80 mb-8 max-w-md">
                                Point of sale, inventory, customers, employees, and more — all in one
                                powerful platform designed for modern businesses.
                            </p>

                            {/* Feature Pills */}
                            <div className="flex flex-wrap justify-center gap-3">
                                {['POS', 'Inventory', 'CRM', 'Analytics', 'Multi-location'].map(
                                    (feature) => (
                                        <motion.span
                                            key={feature}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: Math.random() * 0.3 }}
                                            className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium"
                                        >
                                            {feature}
                                        </motion.span>
                                    )
                                )}
                            </div>
                        </motion.div>

                        {/* Floating Elements */}
                        <motion.div
                            animate={{
                                y: [0, -20, 0],
                                rotate: [0, 5, 0],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute top-20 right-20 w-32 h-32 rounded-2xl bg-white/10 backdrop-blur-sm"
                        />
                        <motion.div
                            animate={{
                                y: [0, 20, 0],
                                rotate: [0, -5, 0],
                            }}
                            transition={{
                                duration: 6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AuthPage;
