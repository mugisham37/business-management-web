'use client';

import { Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useSocialAuth } from '@/hooks/useSocialAuth';

interface SocialLoginButtonsProps {
    onGoogleClick?: () => void;
    onFacebookClick?: () => void;
    onGithubClick?: () => void;
    isLoading?: boolean;
    className?: string;
    usePopup?: boolean;
    redirectTo?: string;
    onSuccess?: (result: any) => void;
    onError?: (error: any) => void;
}

export function SocialLoginButtons({
    onGoogleClick,
    onFacebookClick,
    onGithubClick,
    isLoading: externalLoading = false,
    className,
    usePopup = true,
    redirectTo,
    onSuccess,
    onError,
}: SocialLoginButtonsProps) {
    const {
        isLoading: socialLoading,
        error,
        loginWithGoogle,
        loginWithFacebook,
        loginWithGithub,
        clearError,
        isProviderAvailable,
    } = useSocialAuth({
        usePopup,
        redirectTo,
        onSuccess,
        onError,
    });

    const isLoading = externalLoading || socialLoading;

    const handleGoogleClick = async () => {
        clearError();
        if (onGoogleClick) {
            onGoogleClick();
        } else {
            await loginWithGoogle();
        }
    };

    const handleFacebookClick = async () => {
        clearError();
        if (onFacebookClick) {
            onFacebookClick();
        } else {
            await loginWithFacebook();
        }
    };

    const handleGithubClick = async () => {
        clearError();
        if (onGithubClick) {
            onGithubClick();
        } else {
            await loginWithGithub();
        }
    };
    return (
        <div className={cn('space-y-3', className)}>
            {/* Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
                    >
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Google */}
            {isProviderAvailable('google') && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={handleGoogleClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <motion.svg 
                                className="w-5 h-5 mr-3" 
                                viewBox="0 0 24 24"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </motion.svg>
                        )}
                        Continue with Google
                    </Button>
                </motion.div>
            )}

            {/* Facebook */}
            {isProviderAvailable('facebook') && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={handleFacebookClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <motion.svg 
                                className="w-5 h-5 mr-3" 
                                viewBox="0 0 24 24" 
                                fill="#1877F2"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.95 3.617 9.068 8.343 9.833V14.5H7.667v-2.5h2.676v-1.9c0-2.633 1.567-4.1 3.977-4.1 1.15 0 2.356.2 2.356.2v2.6h-1.33c-1.307 0-1.713.812-1.713 1.643V12h2.917l-.467 2.5h-2.45v7.333C18.383 21.068 22 16.95 22 12z" />
                            </motion.svg>
                        )}
                        Continue with Facebook
                    </Button>
                </motion.div>
            )}

            {/* GitHub */}
            {isProviderAvailable('github') && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                        onClick={handleGithubClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        ) : (
                            <motion.svg 
                                className="w-5 h-5 mr-3" 
                                viewBox="0 0 24 24" 
                                fill="currentColor"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </motion.svg>
                        )}
                        Continue with GitHub
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

export default SocialLoginButtons;
