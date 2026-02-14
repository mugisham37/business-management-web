/**
 * Authentication Utility Functions
 * 
 * Provides utility functions for authentication operations including:
 * - Error mapping for user-friendly messages
 * - Password validation
 * - Role-based redirect logic
 * 
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 4.3, 4.4, 4.5, 4.6, 1.4, 1.5, 1.6
 */

import { UserRole } from '@/foundation/types/generated/graphql';

/**
 * Password validation result interface
 */
export interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
  isValid: boolean;
}

/**
 * Maps GraphQL errors to user-friendly error messages
 * 
 * @param error - The error object (can be Error or any type with message property)
 * @returns User-friendly error message
 * 
 * Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8
 */
export function mapAuthError(error: Error | { message: string }): string {
  const message = error.message.toLowerCase();
  
  // Invalid credentials
  if (message.includes('invalid credentials') || message.includes('incorrect password')) {
    return 'Email or password is incorrect';
  }
  
  // Email already exists
  if (message.includes('email already exists') || message.includes('email is already registered')) {
    return 'An account with this email already exists';
  }
  
  // Invalid or expired token
  if (message.includes('invalid token') || message.includes('expired') || message.includes('token not found')) {
    return 'This reset link is invalid or has expired';
  }
  
  // Invalid MFA code
  if (message.includes('invalid mfa') || message.includes('incorrect code') || message.includes('invalid code')) {
    return 'The code you entered is incorrect';
  }
  
  // Network errors
  if (message.includes('network') || message.includes('fetch failed') || message.includes('connection')) {
    return 'Network error. Please check your connection.';
  }
  
  // Organization not found
  if (message.includes('organization not found') || message.includes('invalid organization')) {
    return 'Organization ID not found. Please check and try again.';
  }
  
  // Account locked
  if (message.includes('account locked') || message.includes('account disabled')) {
    return 'Your account has been locked. Please contact support.';
  }
  
  // User not found
  if (message.includes('user not found')) {
    return 'No account found with this email address';
  }
  
  // Default fallback
  return 'An error occurred. Please try again.';
}

/**
 * Validates password against security requirements
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - The password to validate
 * @returns Validation result with individual checks and overall validity
 * 
 * Requirements: 4.3, 4.4, 4.5, 4.6
 */
export function validatePassword(password: string): PasswordValidation {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  return {
    minLength,
    hasUppercase,
    hasNumber,
    hasSpecialChar,
    isValid: minLength && hasUppercase && hasNumber && hasSpecialChar,
  };
}

/**
 * Gets the redirect URL based on user role
 * 
 * Role-based redirects:
 * - OWNER → /dashboard/overview
 * - MANAGER → /dashboard/reports
 * - WORKER → /dashboard/transactions
 * 
 * @param role - The user's role
 * @returns The redirect URL for the role
 * 
 * Requirements: 1.4, 1.5, 1.6
 */
export function getRedirectUrlForRole(role: UserRole): string {
  switch (role) {
    case UserRole.Owner:
      return '/dashboard/overview';
    case UserRole.Manager:
      return '/dashboard/reports';
    case UserRole.Worker:
      return '/dashboard/transactions';
    default:
      return '/dashboard/overview';
  }
}
