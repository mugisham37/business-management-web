import * as bcrypt from 'bcrypt';

/**
 * Password utility functions for secure password management
 * Implements requirements 1.3, 14.1, 14.2, 14.8
 */

const BCRYPT_ROUNDS = 12;
const PASSWORD_HISTORY_LIMIT = 5;

/**
 * Hash a password using bcrypt with 12 rounds
 * @param password - Plain text password to hash
 * @returns Promise<string> - Bcrypt hash of the password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a stored bcrypt hash
 * @param password - Plain text password to verify
 * @param hash - Stored bcrypt hash
 * @returns Promise<boolean> - True if password matches hash, false otherwise
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password complexity requirements
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password to validate
 * @returns Object with isValid boolean and errors array
 */
export function validatePasswordComplexity(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Check if a password matches any of the user's password history
 * @param newPassword - New password to check
 * @param passwordHistory - Array of previous password hashes (up to 5)
 * @returns Promise<boolean> - True if password matches any in history, false otherwise
 */
export async function checkPasswordHistory(
  newPassword: string,
  passwordHistory: string[],
): Promise<boolean> {
  // Limit check to last 5 passwords
  const historyToCheck = passwordHistory.slice(-PASSWORD_HISTORY_LIMIT);

  // Check if new password matches any previous password
  for (const oldHash of historyToCheck) {
    const matches = await verifyPassword(newPassword, oldHash);
    if (matches) {
      return true; // Password found in history
    }
  }

  return false; // Password not in history
}

/**
 * Update password history by adding new hash and maintaining limit
 * @param currentHistory - Current password history array
 * @param newHash - New password hash to add
 * @returns string[] - Updated password history (max 5 entries)
 */
export function updatePasswordHistory(
  currentHistory: string[],
  newHash: string,
): string[] {
  const updatedHistory = [...currentHistory, newHash];
  
  // Keep only the last 5 passwords
  if (updatedHistory.length > PASSWORD_HISTORY_LIMIT) {
    return updatedHistory.slice(-PASSWORD_HISTORY_LIMIT);
  }
  
  return updatedHistory;
}
