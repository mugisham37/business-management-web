/**
 * Sanitization utilities for input validation and security
 */

/**
 * Detect potential SQL injection patterns
 * Note: Prisma ORM already prevents SQL injection through parameterized queries,
 * but this provides an additional layer of defense
 */
export function detectSQLInjection(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|\*\/|\/\*)/g, // SQL comments
    /(\bOR\b.*=.*)/gi, // OR 1=1 patterns
    /(\bAND\b.*=.*)/gi, // AND 1=1 patterns
    /(;|\||&)/g, // Command separators
    /(xp_|sp_)/gi, // SQL Server stored procedures
  ];

  return sqlInjectionPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize string input by removing potential SQL injection patterns
 */
export function sanitizeSQLInput(input: string): string {
  if (detectSQLInjection(input)) {
    // Log the attempt for security monitoring
    console.warn('Potential SQL injection attempt detected:', input);
    
    // Remove dangerous characters and patterns
    return input
      .replace(/[;'"|\\]/g, '') // Remove SQL special characters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove block comment start
      .replace(/\*\//g, '') // Remove block comment end
      .trim();
  }
  
  return input;
}

/**
 * Detect potential XSS patterns
 */
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<embed/gi,
    /<object/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(input));
}

/**
 * Sanitize HTML input by escaping special characters
 */
export function sanitizeHTML(input: string): string {
  if (detectXSS(input)) {
    console.warn('Potential XSS attempt detected:', input);
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize email input
 */
export function sanitizeEmail(email: string): string {
  // Remove any whitespace
  email = email.trim().toLowerCase();
  
  // Basic email validation pattern
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailPattern.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email;
}

/**
 * Sanitize phone number input
 */
export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except + at the start
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

/**
 * Sanitize URL input
 */
export function sanitizeURL(url: string): string {
  try {
    const parsedURL = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsedURL.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsedURL.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

/**
 * Sanitize general text input
 */
export function sanitizeText(input: string): string {
  // Remove null bytes
  input = input.replace(/\0/g, '');
  
  // Detect and handle SQL injection attempts
  if (detectSQLInjection(input)) {
    input = sanitizeSQLInput(input);
  }
  
  // Detect and handle XSS attempts
  if (detectXSS(input)) {
    input = sanitizeHTML(input);
  }
  
  return input.trim();
}

/**
 * Validate and sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts
  fileName = fileName.replace(/\.\./g, '');
  
  // Remove special characters except dots, dashes, and underscores
  fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (fileName.length > 255) {
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    fileName = nameWithoutExt.substring(0, 250) + '.' + extension;
  }
  
  return fileName;
}
