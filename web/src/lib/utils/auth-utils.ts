/**
 * Authentication Utilities
 * 
 * Helper functions for authentication, validation, and security operations.
 * Provides reusable utilities for common authentication tasks.
 */

import { AuthUser, UserRole, BusinessTier } from '../graphql/generated/types';

/**
 * Password strength validation
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export function validatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one number');
  }

  // Special character check
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password must contain at least one special character');
  }

  // Common password check
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123',
    'password123', 'admin', 'letmein', 'welcome', 'monkey'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    score = Math.max(0, score - 2);
    feedback.push('Password is too common');
  }

  return {
    score: Math.min(4, score),
    feedback,
    isValid: score >= 3 && feedback.length === 0,
  };
}

/**
 * Email validation
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone number formatting and validation
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
}

/**
 * Role hierarchy utilities
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 6,
  [UserRole.TENANT_ADMIN]: 5,
  [UserRole.MANAGER]: 4,
  [UserRole.EMPLOYEE]: 3,
  [UserRole.CUSTOMER]: 2,
  [UserRole.READONLY]: 1,
};

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function hasRoleAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

export function getRoleDisplayName(role: UserRole): string {
  const displayNames: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Administrator',
    [UserRole.TENANT_ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.EMPLOYEE]: 'Employee',
    [UserRole.CUSTOMER]: 'Customer',
    [UserRole.READONLY]: 'Read Only',
  };
  
  return displayNames[role] || role;
}

/**
 * Tier hierarchy utilities
 */
const TIER_HIERARCHY: Record<BusinessTier, number> = {
  [BusinessTier.FREE]: 1,
  [BusinessTier.BASIC]: 2,
  [BusinessTier.STANDARD]: 3,
  [BusinessTier.PREMIUM]: 4,
  [BusinessTier.ENTERPRISE]: 5,
};

export function getTierLevel(tier: BusinessTier): number {
  return TIER_HIERARCHY[tier] || 0;
}

export function hasTierAccess(userTier: BusinessTier, requiredTier: BusinessTier): boolean {
  return getTierLevel(userTier) >= getTierLevel(requiredTier);
}

export function getTierDisplayName(tier: BusinessTier): string {
  const displayNames: Record<BusinessTier, string> = {
    [BusinessTier.FREE]: 'Free',
    [BusinessTier.BASIC]: 'Basic',
    [BusinessTier.STANDARD]: 'Standard',
    [BusinessTier.PREMIUM]: 'Premium',
    [BusinessTier.ENTERPRISE]: 'Enterprise',
  };
  
  return displayNames[tier] || tier;
}

export function getTierColor(tier: BusinessTier): string {
  const colors: Record<BusinessTier, string> = {
    [BusinessTier.FREE]: 'gray',
    [BusinessTier.BASIC]: 'blue',
    [BusinessTier.STANDARD]: 'green',
    [BusinessTier.PREMIUM]: 'purple',
    [BusinessTier.ENTERPRISE]: 'gold',
  };
  
  return colors[tier] || 'gray';
}

/**
 * Permission utilities
 */
export function parsePermission(permission: string): {
  resource: string;
  action: string;
  isWildcard: boolean;
} {
  const parts = permission.split(':');
  
  return {
    resource: parts[0] || '',
    action: parts[1] || '',
    isWildcard: parts[1] === '*',
  };
}

export function matchesPermission(userPermissions: string[], requiredPermission: string): boolean {
  // Check exact match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check wildcard match
  const { resource } = parsePermission(requiredPermission);
  const wildcardPermission = `${resource}:*`;
  
  return userPermissions.includes(wildcardPermission);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => matchesPermission(userPermissions, permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => matchesPermission(userPermissions, permission));
}

/**
 * User display utilities
 */
export function getUserDisplayName(user: AuthUser): string {
  if (user.displayName) {
    return user.displayName;
  }
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  if (user.firstName) {
    return user.firstName;
  }
  
  return user.email;
}

export function getUserInitials(user: AuthUser): string {
  const displayName = getUserDisplayName(user);
  
  const parts = displayName.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  
  return displayName.slice(0, 2).toUpperCase();
}

/**
 * Security utilities
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each required category
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

export function maskEmail(email: string): string {
  const [username, domain] = email.split('@');
  
  if (username.length <= 2) {
    return `${username[0]}*@${domain}`;
  }
  
  const maskedUsername = `${username[0]}${'*'.repeat(username.length - 2)}${username[username.length - 1]}`;
  return `${maskedUsername}@${domain}`;
}

export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ***-${cleaned.slice(6)}`;
  }
  
  if (cleaned.length === 11) {
    return `+1 (${cleaned.slice(1, 4)}) ***-${cleaned.slice(7)}`;
  }
  
  return phone.replace(/\d/g, '*');
}

/**
 * Session utilities
 */
export function isSessionExpiringSoon(expiresAt: Date, warningMinutes: number = 5): boolean {
  const now = new Date();
  const warningTime = warningMinutes * 60 * 1000; // Convert to milliseconds
  
  return (expiresAt.getTime() - now.getTime()) <= warningTime;
}

export function formatTimeUntilExpiration(expiresAt: Date): string {
  const now = new Date();
  const diff = expiresAt.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Expired';
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}

/**
 * Device fingerprinting utilities
 */
export function generateDeviceFingerprint(): Record<string, any> {
  if (typeof window === 'undefined') {
    return {};
  }
  
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    timestamp: Date.now(),
  };
}

/**
 * URL utilities for authentication flows
 */
export function getReturnUrl(): string {
  if (typeof window === 'undefined') {
    return '/';
  }
  
  const params = new URLSearchParams(window.location.search);
  return params.get('returnUrl') || '/';
}

export function setReturnUrl(url: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('returnUrl', url);
  window.history.replaceState({}, '', currentUrl.toString());
}

export function clearReturnUrl(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('returnUrl');
  window.history.replaceState({}, '', currentUrl.toString());
}