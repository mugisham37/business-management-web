'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useVerifyEmail, useResendVerification } from '@/hooks/api/useAuth';
import { Button } from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { RiCheckLine, RiAlertLine, RiMailLine } from '@remixicon/react';
import Link from 'next/link';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const verifyEmail = useVerifyEmail();
  const resendVerification = useResendVerification();
  
  const [status, setStatus] = useState<'pending' | 'verifying' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      handleVerification();
    }
  }, [token]);

  const handleVerification = async () => {
    setStatus('verifying');
    try {
      await verifyEmail.mutateAsync({ token: token! });
      setStatus('success');
      // Redirect to login after 3 seconds
      setTimeout(() => router.push('/auth/login'), 3000);
    } catch (err: any) {
      setStatus('error');
      const message = err.response?.data?.message;
      setErrorMessage(message || 'Verification failed. The link may be expired.');
    }
  };

  const handleResend = async () => {
    if (!email) return;
    
    try {
      await resendVerification.mutateAsync({ email });
      setStatus('pending');
      setErrorMessage('');
    } catch (err: any) {
      const message = err.response?.data?.message;
      setErrorMessage(message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 sm:p-6 bg-background">
      <div className="flex w-full flex-col items-center sm:max-w-md">
        {/* Logo */}
        <div className="relative flex items-center justify-center rounded-lg bg-card p-3 shadow-lg border border-border">
          <Logo
            className="size-8 text-primary"
            aria-label="Business platform logo"
          />
        </div>

        {/* Content */}
        <div className="mt-8 w-full text-center">
          {status === 'pending' && !token && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <RiMailLine className="h-8 w-8 text-primary" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-foreground">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We&apos;ve sent a verification link to
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {email}
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Click the link in the email to verify your account.
              </p>

              <div className="mt-8 space-y-4">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={handleResend}
                  isLoading={resendVerification.isPending}
                  loadingText="Sending..."
                >
                  Resend verification email
                </Button>

                <Link
                  href="/auth/login"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}

          {status === 'verifying' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-foreground">
                Verifying your email...
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Please wait while we verify your email address
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-good/10">
                <RiCheckLine className="h-8 w-8 text-status-good" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-foreground">
                Email verified!
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your email has been successfully verified.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Redirecting to login...
              </p>

              <div className="mt-8">
                <Link href="/auth/login">
                  <Button variant="primary" className="w-full">
                    Continue to login
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <RiAlertLine className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-foreground">
                Verification failed
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {errorMessage}
              </p>

              <div className="mt-8 space-y-4">
                {email && (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={handleResend}
                    isLoading={resendVerification.isPending}
                    loadingText="Sending..."
                  >
                    Resend verification email
                  </Button>
                )}

                <Link
                  href="/auth/login"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
