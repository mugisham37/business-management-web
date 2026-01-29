'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { socialAuthManager } from '@/lib/auth/social-auth';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        setMessage('Exchanging authorization code...');
        const result = await socialAuthManager.handleCallback('google', code, state);

        setMessage('Authentication successful! Redirecting...');
        setStatus('success');

        // Send result to parent window if in popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_SUCCESS',
            result,
          }, window.location.origin);
          window.close();
          return;
        }

        // Redirect to dashboard or onboarding
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);

      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');

        // Send error to parent window if in popup
        if (window.opener) {
          window.opener.postMessage({
            type: 'OAUTH_ERROR',
            error: {
              message: error instanceof Error ? error.message : 'Authentication failed',
            },
          }, window.location.origin);
          window.close();
          return;
        }

        // Redirect to auth page after delay
        setTimeout(() => {
          router.push('/auth?error=oauth_failed');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-6"
            >
              <Loader2 className="w-full h-full text-indigo-600" />
            </motion.div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authenticating with Google
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </motion.div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Successful!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
            >
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </motion.div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Authentication Failed
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
            <button
              onClick={() => router.push('/auth')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}