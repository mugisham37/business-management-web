// Validation Utilities for Frontend-Backend Foundation Layer
// Provides utilities for validating email addresses and password strength

/**
 * Validates if a string is a valid email address
 * Uses standard email regex pattern
 * 
 * @param email - The email string to validate
 * @returns True if the email is valid, false otherwise
 * 
 * Requirements: 18.3
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if a password meets strong password requirements
 * Requirements:
 * - At least 8 characters long
 * - Contains at least 1 uppercase letter
 * - Contains at least 1 lowercase letter
 * - Contains at least 1 number
 * - Contains at least 1 special character
 * 
 * @param password - The password string to validate
 * @returns True if the password is strong, false otherwise
 * 
 * Requirements: 18.4
 */
export function isStrongPassword(password: string): boolean {
  // At least 8 characters
  const minLength = password.length >= 8;
  
  // At least 1 uppercase letter
  const hasUppercase = /[A-Z]/.test(password);
  
  // At least 1 lowercase letter
  const hasLowercase = /[a-z]/.test(password);
  
  // At least 1 number
  const hasNumber = /\d/.test(password);
  
  // At least 1 special character
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;
}

/**
 * Assesses the strength of a password and returns a strength level
 * Strength is determined by:
 * - Length (8+ chars = 1 point, 12+ chars = 2 points)
 * - Uppercase letters (1 point)
 * - Lowercase letters (1 point)
 * - Numbers (1 point)
 * - Special characters (1 point)
 * 
 * Scoring:
 * - 0-2 points: weak
 * - 3-4 points: medium
 * - 5-6 points: strong
 * 
 * @param password - The password string to assess
 * @returns Strength level: 'weak', 'medium', or 'strong'
 * 
 * Requirements: 18.4
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let strength = 0;

  // Length scoring
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety scoring
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

  // Determine strength level
  if (strength <= 2) return 'weak';
  if (strength <= 4) return 'medium';
  return 'strong';
}
