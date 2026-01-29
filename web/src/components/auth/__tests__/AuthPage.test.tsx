/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthPage } from '../AuthPage';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    svg: ({ children, ...props }: any) => <svg {...props}>{children}</svg>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock social auth hook
jest.mock('@/hooks/useSocialAuth', () => ({
  useSocialAuth: () => ({
    isLoading: false,
    error: null,
    loginWithGoogle: jest.fn(),
    loginWithFacebook: jest.fn(),
    loginWithGithub: jest.fn(),
    clearError: jest.fn(),
    isProviderAvailable: () => true,
  }),
}));

// Mock network status hook
jest.mock('@/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({
    isOnline: true,
    isConnected: true,
    lastChecked: new Date(),
    retryCount: 0,
    checkConnectivity: jest.fn(),
    retry: jest.fn(),
    resetRetryCount: jest.fn(),
  }),
}));

// Mock auth with retry hook
jest.mock('@/hooks/useAuthWithRetry', () => ({
  useAuthWithRetry: () => ({
    isLoading: false,
    error: null,
    attempts: [],
    canRetry: false,
    retryCount: 0,
    login: jest.fn(),
    register: jest.fn(),
    retry: jest.fn(),
    clearError: jest.fn(),
    resetAttempts: jest.fn(),
  }),
}));

describe('AuthPage', () => {
  it('renders login form by default', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign in to access your business dashboard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders registration form when defaultMode is register', () => {
    render(<AuthPage defaultMode="register" />);
    
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Start managing your business today')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('toggles between login and register modes', async () => {
    render(<AuthPage />);
    
    // Start with login
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    
    // Click sign up link
    const signUpLink = screen.getByText('Sign up');
    fireEvent.click(signUpLink);
    
    // Should show register form
    await waitFor(() => {
      expect(screen.getByText('Create your account')).toBeInTheDocument();
    });
    
    // Click sign in link
    const signInLink = screen.getByText('Sign in');
    fireEvent.click(signInLink);
    
    // Should show login form
    await waitFor(() => {
      expect(screen.getByText('Welcome back')).toBeInTheDocument();
    });
  });

  it('displays social login buttons', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();
    expect(screen.getByText('Continue with GitHub')).toBeInTheDocument();
  });

  it('displays brand name and navigation', () => {
    render(<AuthPage />);
    
    expect(screen.getByText('BizManager')).toBeInTheDocument();
    expect(screen.getByText('Back to home')).toBeInTheDocument();
  });
});