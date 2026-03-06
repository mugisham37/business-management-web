/**
 * Error Message Mapper
 * 
 * Maps technical error messages to user-friendly messages with suggestions.
 * Handles common error patterns from Prisma, GraphQL, and application logic.
 */

import { ErrorUserInfo } from './structured-error.types';

interface ErrorPattern {
  pattern: RegExp | string;
  userInfo: ErrorUserInfo;
}

/**
 * Database/Prisma error patterns
 */
const databaseErrorPatterns: ErrorPattern[] = [
  {
    pattern: /Unique constraint failed on the fields: \(`(\w+)`\)/,
    userInfo: {
      title: 'Value Already Exists',
      description: 'This value is already in use.',
      suggestions: [
        'Try a different value',
        'Make your entry more specific',
        'Add additional details to make it unique',
      ],
    },
  },
  {
    pattern: /Foreign key constraint failed/,
    userInfo: {
      title: 'Related Record Not Found',
      description: 'The referenced item does not exist or has been deleted.',
      suggestions: [
        'Verify the related item exists',
        'Refresh the page and try again',
      ],
    },
  },
  {
    pattern: /Record to update not found/,
    userInfo: {
      title: 'Record Not Found',
      description: 'The item you are trying to update no longer exists.',
      suggestions: [
        'The item may have been deleted',
        'Refresh the page to see current data',
      ],
    },
  },
  {
    pattern: /Record to delete does not exist/,
    userInfo: {
      title: 'Already Deleted',
      description: 'This item has already been deleted.',
      suggestions: ['Refresh the page to see current data'],
    },
  },
];

/**
 * Authentication error patterns
 */
const authErrorPatterns: ErrorPattern[] = [
  {
    pattern: /Invalid credentials/i,
    userInfo: {
      title: 'Login Failed',
      description: 'The email or password you entered is incorrect.',
      suggestions: [
        'Check your email and password',
        'Make sure Caps Lock is off',
        'Try resetting your password if you forgot it',
      ],
    },
  },
  {
    pattern: /User with this email already exists/i,
    userInfo: {
      title: 'Email Already Registered',
      description: 'An account with this email address already exists.',
      suggestions: [
        'Try logging in instead',
        'Use a different email address',
        'Reset your password if you forgot it',
      ],
    },
  },
  {
    pattern: /Account is locked/i,
    userInfo: {
      title: 'Account Locked',
      description: 'Your account has been temporarily locked due to multiple failed login attempts.',
      suggestions: [
        'Wait 30 minutes and try again',
        'Contact support if you need immediate access',
      ],
    },
  },
  {
    pattern: /Token expired/i,
    userInfo: {
      title: 'Session Expired',
      description: 'Your session has expired for security reasons.',
      suggestions: ['Please log in again to continue'],
    },
  },
];

/**
 * Validation error patterns
 */
const validationErrorPatterns: ErrorPattern[] = [
  {
    pattern: /Password must be at least/i,
    userInfo: {
      title: 'Weak Password',
      description: 'Your password does not meet the security requirements.',
      suggestions: [
        'Use at least 8 characters',
        'Include uppercase and lowercase letters',
        'Add numbers and special characters',
      ],
    },
  },
  {
    pattern: /Invalid email format/i,
    userInfo: {
      title: 'Invalid Email',
      description: 'Please enter a valid email address.',
      suggestions: ['Check for typos in your email address'],
    },
  },
  {
    pattern: /Field .* is required/i,
    userInfo: {
      title: 'Missing Required Information',
      description: 'Please fill in all required fields.',
      suggestions: ['Check for fields marked with an asterisk (*)'],
    },
  },
];

/**
 * Network error patterns
 */
const networkErrorPatterns: ErrorPattern[] = [
  {
    pattern: /Network request failed/i,
    userInfo: {
      title: 'Connection Failed',
      description: 'Unable to connect to the server.',
      suggestions: [
        'Check your internet connection',
        'Try refreshing the page',
        'Contact support if the problem persists',
      ],
    },
  },
  {
    pattern: /timeout/i,
    userInfo: {
      title: 'Request Timeout',
      description: 'The server took too long to respond.',
      suggestions: [
        'Check your internet connection',
        'Try again in a moment',
        'The server may be experiencing high traffic',
      ],
    },
  },
];

/**
 * Server error patterns
 */
const serverErrorPatterns: ErrorPattern[] = [
  {
    pattern: /Internal server error/i,
    userInfo: {
      title: 'Server Error',
      description: 'Something went wrong on our end.',
      suggestions: [
        'Try again in a few moments',
        'Contact support if the problem persists',
      ],
      supportMessage: 'Please provide the error details below when contacting support.',
    },
  },
  {
    pattern: /Service unavailable/i,
    userInfo: {
      title: 'Service Temporarily Unavailable',
      description: 'The service is currently undergoing maintenance or experiencing issues.',
      suggestions: [
        'Try again in a few minutes',
        'Check our status page for updates',
      ],
    },
  },
];

/**
 * All error patterns grouped by category
 */
const allErrorPatterns = [
  ...databaseErrorPatterns,
  ...authErrorPatterns,
  ...validationErrorPatterns,
  ...networkErrorPatterns,
  ...serverErrorPatterns,
];

/**
 * Map a technical error message to user-friendly information
 */
export function mapErrorToUserInfo(
  errorMessage: string,
  errorCode?: string,
): ErrorUserInfo {
  // Try to match against known patterns
  for (const { pattern, userInfo } of allErrorPatterns) {
    if (typeof pattern === 'string') {
      if (errorMessage.includes(pattern)) {
        return enhanceUserInfo(userInfo, errorMessage);
      }
    } else {
      const match = errorMessage.match(pattern);
      if (match) {
        return enhanceUserInfo(userInfo, errorMessage, match);
      }
    }
  }

  // Handle specific error codes
  if (errorCode) {
    const codeBasedInfo = mapErrorCodeToUserInfo(errorCode);
    if (codeBasedInfo) {
      return codeBasedInfo;
    }
  }

  // Default fallback
  return {
    title: 'Operation Failed',
    description: 'An unexpected error occurred.',
    suggestions: [
      'Try again',
      'Refresh the page',
      'Contact support if the problem persists',
    ],
    supportMessage: 'Please provide the error details below when contacting support.',
  };
}

/**
 * Enhance user info with specific details from the error message
 */
function enhanceUserInfo(
  baseInfo: ErrorUserInfo,
  errorMessage: string,
  regexMatch?: RegExpMatchArray,
): ErrorUserInfo {
  let enhanced = { ...baseInfo };

  // Extract field name from unique constraint errors
  if (regexMatch && regexMatch[1]) {
    const fieldName = regexMatch[1];
    const friendlyFieldName = fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
    
    enhanced = {
      ...enhanced,
      description: `A record with this ${friendlyFieldName.toLowerCase()} already exists.`,
    };
  }

  return enhanced;
}

/**
 * Map GraphQL error codes to user-friendly information
 */
function mapErrorCodeToUserInfo(errorCode: string): ErrorUserInfo | null {
  const codeMap: Record<string, ErrorUserInfo> = {
    UNAUTHENTICATED: {
      title: 'Authentication Required',
      description: 'You need to be logged in to perform this action.',
      suggestions: ['Please log in and try again'],
    },
    FORBIDDEN: {
      title: 'Access Denied',
      description: 'You do not have permission to perform this action.',
      suggestions: [
        'Contact your administrator for access',
        'Make sure you are logged in with the correct account',
      ],
    },
    BAD_USER_INPUT: {
      title: 'Invalid Input',
      description: 'The information you provided is not valid.',
      suggestions: ['Please check your input and try again'],
    },
    NOT_FOUND: {
      title: 'Not Found',
      description: 'The requested resource could not be found.',
      suggestions: [
        'Check that the item still exists',
        'Refresh the page',
      ],
    },
    CONFLICT: {
      title: 'Conflict',
      description: 'This action conflicts with existing data.',
      suggestions: [
        'Check for duplicate entries',
        'Refresh the page to see current data',
      ],
    },
    INTERNAL_SERVER_ERROR: {
      title: 'Server Error',
      description: 'An unexpected error occurred on the server.',
      suggestions: [
        'Try again in a moment',
        'Contact support if the problem persists',
      ],
      supportMessage: 'Please provide the error details below when contacting support.',
    },
  };

  return codeMap[errorCode] || null;
}

/**
 * Extract field-specific validation errors
 */
export function extractFieldErrors(
  graphQLError: any,
): Record<string, string[]> | undefined {
  const validationErrors = graphQLError?.extensions?.validationErrors;
  if (!validationErrors) return undefined;

  const fieldErrors: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(validationErrors)) {
    fieldErrors[field] = Array.isArray(messages)
      ? messages
      : [messages as string];
  }
  return fieldErrors;
}


/**
 * Extract server-provided context from GraphQL error
 */
export function extractServerContext(graphQLError: any): {
  suggestion?: string;
  action?: string;
  alternatives?: string[];
  context?: Record<string, any>;
} {
  const extensions = graphQLError?.extensions || {};
  
  return {
    suggestion: extensions.suggestion,
    action: extensions.action,
    alternatives: extensions.alternatives,
    context: {
      email: extensions.email,
      organizationName: extensions.organizationName,
      currentBranch: extensions.currentBranch,
      currentDepartment: extensions.currentDepartment,
      currentLength: extensions.currentLength,
      requiredLength: extensions.requiredLength,
      missing: extensions.missing,
      minutesRemaining: extensions.minutesRemaining,
      unlockTime: extensions.unlockTime,
      failedAttempts: extensions.failedAttempts,
      examples: extensions.examples,
      allowed: extensions.allowed,
      requirement: extensions.requirement,
      hasLetters: extensions.hasLetters,
      hasSpecialChars: extensions.hasSpecialChars,
      allowedRange: extensions.allowedRange,
    },
  };
}

/**
 * Enhance user info with server-provided context
 */
export function enhanceWithServerContext(
  baseInfo: ErrorUserInfo,
  serverContext: ReturnType<typeof extractServerContext>,
): ErrorUserInfo {
  const enhanced = { ...baseInfo };

  // Use server suggestion if available (add to beginning of suggestions)
  if (serverContext.suggestion) {
    if (!enhanced.suggestions) {
      enhanced.suggestions = [];
    }
    // Add server suggestion first if not already present
    if (!enhanced.suggestions.includes(serverContext.suggestion)) {
      enhanced.suggestions.unshift(serverContext.suggestion);
    }
  }

  // Add alternatives if provided
  if (serverContext.alternatives && Array.isArray(serverContext.alternatives)) {
    if (!enhanced.suggestions) {
      enhanced.suggestions = [];
    }
    // Add alternatives that aren't already in suggestions
    serverContext.alternatives.forEach(alt => {
      if (!enhanced.suggestions!.includes(alt)) {
        enhanced.suggestions!.push(alt);
      }
    });
  }

  // Enhance description with context
  if (serverContext.context) {
    const ctx = serverContext.context;

    // Add time remaining for locked accounts
    if (ctx.minutesRemaining !== undefined && ctx.unlockTime) {
      enhanced.description = `${enhanced.description} Your account will unlock in ${ctx.minutesRemaining} minute${ctx.minutesRemaining > 1 ? 's' : ''} at ${ctx.unlockTime}.`;
    }

    // Add current vs required for validation errors
    if (ctx.currentLength !== undefined && ctx.requiredLength !== undefined) {
      enhanced.description = `${enhanced.description} You entered ${ctx.currentLength} character${ctx.currentLength > 1 ? 's' : ''}, but need ${ctx.requiredLength}.`;
    }

    // Add examples if provided
    if (ctx.examples && Array.isArray(ctx.examples)) {
      if (!enhanced.suggestions) {
        enhanced.suggestions = [];
      }
      enhanced.suggestions.push(`Examples: ${ctx.examples.join(', ')}`);
    }

    // Add allowed characters for special character requirements
    if (ctx.allowed) {
      if (!enhanced.suggestions) {
        enhanced.suggestions = [];
      }
      enhanced.suggestions.push(`Allowed characters: ${ctx.allowed}`);
    }
  }

  return enhanced;
}

/**
 * Generate context-aware suggestions based on field name and value
 */
export function generateContextualSuggestions(
  fieldName: string,
  fieldValue?: string,
  operationName?: string,
): string[] {
  const suggestions: string[] = [];

  // Organization name specific suggestions
  if (fieldName === 'name' && operationName?.toLowerCase().includes('register')) {
    if (fieldValue) {
      suggestions.push(`Try "${fieldValue} 2" or "${fieldValue} Inc"`);
      suggestions.push(`Add your location: "${fieldValue} - [City]"`);
      suggestions.push(`Use a more specific name: "${fieldValue} [Industry]"`);
    } else {
      suggestions.push('Try adding a number or location to your organization name');
      suggestions.push('Use a more specific or descriptive name');
      suggestions.push('Include your industry or specialty in the name');
    }
    suggestions.push('Contact support if you believe this is your organization');
    return suggestions;
  }

  // Email specific suggestions
  if (fieldName === 'email') {
    suggestions.push('Try logging in instead - you may already have an account');
    suggestions.push('Use a different email address');
    suggestions.push('Click "Forgot Password" if you can\'t remember your password');
    suggestions.push('Contact support if you need help accessing your account');
    return suggestions;
  }

  // Username specific suggestions
  if (fieldName === 'username') {
    if (fieldValue) {
      suggestions.push(`Try "${fieldValue}123" or "${fieldValue}_official"`);
      suggestions.push(`Add numbers or underscores: "${fieldValue}_2024"`);
    } else {
      suggestions.push('Try adding numbers or special characters');
      suggestions.push('Use a combination of your name and numbers');
    }
    suggestions.push('Choose a more unique username');
    return suggestions;
  }

  // Phone number specific suggestions
  if (fieldName === 'phone' || fieldName === 'phoneNumber') {
    suggestions.push('Verify you entered the correct phone number');
    suggestions.push('This phone number is already registered');
    suggestions.push('Try logging in if you already have an account');
    suggestions.push('Contact support if you need to update your phone number');
    return suggestions;
  }

  // Generic suggestions
  suggestions.push('Try a different value');
  suggestions.push('Make your entry more specific or unique');
  suggestions.push('Contact support if you need assistance');
  
  return suggestions;
}

/**
 * Generate context-aware description based on field and operation
 */
export function generateContextualDescription(
  fieldName: string,
  fieldValue?: string,
  operationName?: string,
): string {
  // Organization name
  if (fieldName === 'name' && operationName?.toLowerCase().includes('register')) {
    if (fieldValue) {
      return `The organization name "${fieldValue}" is already registered. Organization names must be unique to prevent confusion.`;
    }
    return 'This organization name is already registered. Organization names must be unique to prevent confusion.';
  }

  // Email
  if (fieldName === 'email') {
    if (fieldValue) {
      return `An account with the email "${fieldValue}" already exists. Each email can only be used once.`;
    }
    return 'An account with this email already exists. Each email can only be used once.';
  }

  // Username
  if (fieldName === 'username') {
    if (fieldValue) {
      return `The username "${fieldValue}" is already taken. Please choose a different username.`;
    }
    return 'This username is already taken. Please choose a different username.';
  }

  // Phone
  if (fieldName === 'phone' || fieldName === 'phoneNumber') {
    return 'This phone number is already registered to another account.';
  }

  // Generic
  const friendlyFieldName = fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  
  if (fieldValue) {
    return `The ${friendlyFieldName.toLowerCase()} "${fieldValue}" is already in use.`;
  }
  
  return `This ${friendlyFieldName.toLowerCase()} is already in use.`;
}

/**
 * Generate user-friendly title based on field and operation
 */
export function generateContextualTitle(
  fieldName: string,
  operationName?: string,
): string {
  // Organization name
  if (fieldName === 'name' && operationName?.toLowerCase().includes('register')) {
    return 'Organization Name Already Taken';
  }

  // Email
  if (fieldName === 'email') {
    return 'Email Already Registered';
  }

  // Username
  if (fieldName === 'username') {
    return 'Username Already Taken';
  }

  // Phone
  if (fieldName === 'phone' || fieldName === 'phoneNumber') {
    return 'Phone Number Already Registered';
  }

  // Generic
  const friendlyFieldName = fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  
  return `${friendlyFieldName} Already Exists`;
}
