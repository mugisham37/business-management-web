'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { SocialLoginButtons } from './SocialLoginButtons';
import { useAuthGateway } from '@/lib/auth/auth-gateway';

type AuthMode = 'login' | 'register';

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
    redirectTo,
}: AuthPageProps) {
    const router = useRouter();
    const authGateway = useAuthGateway();
    const [mode, setMode] = useState<AuthMode>(defaultMode);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = useCallback(
        async (data: { email: string; password: string; rememberMe: boolean }) => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await authGateway.authenticateAndRedirect({
                    email: data.email,
                    password: data.password,
                    rememberMe: data.rememberMe
                });

                if (!result.success) {
                    setError(result.error || 'Login failed. Please try again.');
                    return;
                }

                onLoginSuccess?.();
                // Redirect is handled by authGateway.authenticateAndRedirect
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [authGateway, onLoginSuccess]
    );

    const handleRegister = useCallback(
        async (data: {
            firstName: string;
            lastName: string;
            email: string;
            password: string;
            businessName: string;
            acceptTerms: boolean;
        }) => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await authGateway.registerAndRedirect(data);

                if (!result.success) {
                    setError(result.error || 'Registration failed. Please try again.');
                    return;
                }

                onRegisterSuccess?.();
                // Redirect is handled by authGateway.registerAndRedirect
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [authGateway, onRegisterSuccess]
    );

    const handleForgotPassword = useCallback(() => {
        router.push('/forgot-password');
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 z-10">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                BizManager
                            </span>
                        </Link>
                        <Link
                            href="/"
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                        >
                            Back to home
                        </Link>
                    </div>
                </div>
            </header>

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
                            usePopup={true}
                            redirectTo={redirectTo || '/dashboard'}
                            onSuccess={async (result) => {
                                console.log('Social auth success:', result);
                                // Handle successful social authentication
                                // The AuthGateway will handle routing based on user state
                                const authResult = await authGateway.handleSocialAuthAndRedirect(
                                    result.provider, 
                                    result.accessToken
                                );
                                if (!authResult.success) {
                                    setError(authResult.error || 'Social authentication failed');
                                }
                            }}
                            onError={(error) => {
                                console.error('Social auth error:', error);
                                setError(error.message);
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
                                        onSubmit={handleLogin}
                                        onForgotPassword={handleForgotPassword}
                                        isLoading={isLoading}
                                        error={error}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="register"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <RegisterForm
                                        onSubmit={handleRegister}
                                        isLoading={isLoading}
                                        error={error}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Toggle Mode */}
                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            {mode === 'login' ? (
                                <>
                                    Don&apos;t have an account?{' '}
                                    <button
                                        onClick={() => {
                                            setMode('register');
                                            setError(null);
                                        }}
                                        className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button
                                        onClick={() => {
                                            setMode('login');
                                            setError(null);
                                        }}
                                        className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </motion.div>
                </div>

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
