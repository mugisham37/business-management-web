/**
 * Validator Utilities
 * 
 * Provides utility functions for input validation including:
 * - Email validation
 * - Password strength validation
 * - Input sanitization
 * 
 * Requirements: 19.4, 19.5
 */

/**
 * Validates if a string is a valid email address
 * Uses a comprehensive regex pattern that covers most valid email formats
 * @param email - Email string to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmedEmail = email.trim();

  // Basic length check
  if (trimmedEmail.length === 0 || trimmedEmail.length > 254) {
    return false;
  }

  // RFC 5322 compliant email regex (simplified but comprehensive)
  // Matches: user@domain.com, user.name+tag@example.co.uk, etc.
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Additional validation: check for valid domain structure
  const parts = trimmedEmail.split('@');
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  // Local part (before @) should not be empty and not exceed 64 characters
  if (localPart.length === 0 || localPart.length > 64) {
    return false;
  }

  // Domain should have at least one dot and valid TLD
  if (!domain.includes('.')) {
    return false;
  }

  // Domain parts should not start or end with hyphen
  const domainParts = domain.split('.');
  for (const part of domainParts) {
    if (part.length === 0 || part.startsWith('-') || part.endsWith('-')) {
      return false;
    }
  }

  return true;
}

/**
 * Password strength requirements
 */
export interface PasswordStrengthResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Validates password strength according to security requirements
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * 
 * @param password - Password string to validate
 * @returns PasswordStrengthResult with validation details
 */
export function isStrongPassword(password: string): PasswordStrengthResult {
  const errors: string[] = [];
  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      errors: ['Password is required'],
      strength: 'weak',
    };
  }

  // Check minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for special character
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  const isValid = errors.length === 0;

  // Calculate strength
  if (isValid) {
    let strengthScore = 0;

    // Length bonus
    if (password.length >= 12) strengthScore += 2;
    else if (password.length >= 10) strengthScore += 1;

    // Character variety bonus
    if (/[A-Z]/.test(password)) strengthScore += 1;
    if (/[a-z]/.test(password)) strengthScore += 1;
    if (/[0-9]/.test(password)) strengthScore += 1;
    if (/[^A-Za-z0-9]/.test(password)) strengthScore += 1;

    // Multiple special characters bonus
    const specialCharCount = (password.match(/[^A-Za-z0-9]/g) || []).length;
    if (specialCharCount >= 2) strengthScore += 1;

    // Determine strength level
    if (strengthScore >= 6) {
      strength = 'strong';
    } else if (strengthScore >= 4) {
      strength = 'medium';
    } else {
      strength = 'weak';
    }
  }

  return {
    isValid,
    errors,
    strength,
  };
}

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes or escapes potentially dangerous characters and HTML tags
 * 
 * @param input - Input string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeInput(
  input: string,
  options: {
    allowHtml?: boolean;
    maxLength?: number;
    trimWhitespace?: boolean;
  } = {}
): string {
  const {
    allowHtml = false,
    maxLength,
    trimWhitespace = true,
  } = options;

  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;

  // Trim whitespace if requested
  if (trimWhitespace) {
    sanitized = sanitized.trim();
  }

  // Remove or escape HTML if not allowed
  if (!allowHtml) {
    // Escape HTML special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove control characters (except newlines and tabs)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Truncate to max length if specified
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validates if a string contains only alphanumeric characters
 * @param input - Input string to validate
 * @returns true if input contains only alphanumeric characters, false otherwise
 */
export function isAlphanumeric(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }
  return /^[a-zA-Z0-9]+$/.test(input);
}

/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const urlObj = new URL(url);
    // Check for valid protocol (http or https)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates if a string is a valid phone number (basic validation)
 * Supports various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
 * @param phone - Phone number string to validate
 * @returns true if phone number is valid, false otherwise
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '');

  // Phone number should have 10-15 digits
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return false;
  }

  // Basic phone number pattern (supports international format)
  const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}
