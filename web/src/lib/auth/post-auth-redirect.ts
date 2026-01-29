/**
 * Post-Authentication Redirect Handler
 * Manages redirects after successful authentication
 * Implements seamless flow from authentication to intended destination
 */

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface PostAuthRedirectConfig {
  defaultDashboard: string;
  onboardingRoute: string;
  fallbackRoute: string;
}

/**
 * Post-Authentication Redirect Manager
 */
export class PostAuthRedirectManager {
  private static instance: PostAuthRedirectManager;
  private config: PostAuthRedirectConfig;

  private constructor() {
    this.config = {
      defaultDashboard: '/dashboard',
      onboardingRoute: '/onboarding',
      fallbackRoute: '/'
    };
  }

  static getInstance(): PostAuthRedirectManager {
    if (!PostAuthRedirectManager.instance) {
      PostAuthRedirectManager.instance = new PostAuthRedirectManager();
    }
    return PostAuthRedirectManager.instance;
  }

  /**
   * Get the intended destination from session storage
   */
  getIntendedDestination(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return sessionStorage.getItem('intended_destination');
    } catch (error) {
      console.error('Failed to get intended destination:', error);
      return null;
    }
  }

  /**
   * Clear the intended destination
   */
  clearIntendedDestination(): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem('intended_destination');
    } catch (error) {
      console.error('Failed to clear intended destination:', error);
    }
  }

  /**
   * Set intended destination
   */
  setIntendedDestination(path: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem('intended_destination', path);
    } catch (error) {
      console.error('Failed to set intended destination:', error);
    }
  }

  /**
   * Determine the appropriate redirect URL after authentication
   */
  determineRedirectUrl(user: any): string {
    // Check for intended destination first
    const intendedDestination = this.getIntendedDestination();
    
    if (intendedDestination) {
      // Validate that the intended destination is safe
      if (this.isValidRedirectPath(intendedDestination)) {
        this.clearIntendedDestination();
        return intendedDestination;
      }
    }

    // If user needs onboarding, redirect to onboarding
    if (user && !user.hasCompletedOnboarding) {
      return this.config.onboardingRoute;
    }

    // Default to dashboard
    return this.config.defaultDashboard;
  }

  /**
   * Validate that a redirect path is safe
   */
  private isValidRedirectPath(path: string): boolean {
    // Prevent open redirects by ensuring path is relative
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return false;
    }

    // Ensure path starts with /
    if (!path.startsWith('/')) {
      return false;
    }

    // Block certain sensitive paths
    const blockedPaths = ['/auth', '/login', '/register'];
    if (blockedPaths.some(blocked => path.startsWith(blocked))) {
      return false;
    }

    return true;
  }

  /**
   * Handle redirect after successful authentication
   */
  handlePostAuthRedirect(user: any, router: any): void {
    const redirectUrl = this.determineRedirectUrl(user);
    
    console.log('Redirecting after authentication to:', redirectUrl);
    
    // Use replace to avoid back button issues
    router.replace(redirectUrl);
  }
}

/**
 * Hook for post-authentication redirect handling
 */
export function usePostAuthRedirect() {
  const router = useRouter();
  const manager = PostAuthRedirectManager.getInstance();

  const handleRedirect = useCallback((user: any) => {
    manager.handlePostAuthRedirect(user, router);
  }, [router, manager]);

  const setIntendedDestination = useCallback((path: string) => {
    manager.setIntendedDestination(path);
  }, [manager]);

  const getIntendedDestination = useCallback(() => {
    return manager.getIntendedDestination();
  }, [manager]);

  const clearIntendedDestination = useCallback(() => {
    manager.clearIntendedDestination();
  }, [manager]);

  return {
    handleRedirect,
    setIntendedDestination,
    getIntendedDestination,
    clearIntendedDestination
  };
}

export default PostAuthRedirectManager;