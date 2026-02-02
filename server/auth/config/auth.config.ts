import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
  };
  password: {
    bcryptRounds: number;
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  session: {
    maxSessions: number;
    sessionTimeout: string;
    rememberMeTimeout: string;
    cleanupInterval: string;
  };
  security: {
    maxFailedAttempts: number;
    lockoutDuration: number;
    rateLimitWindow: number;
    rateLimitMax: number;
    suspiciousActivityThreshold: number;
    ipWhitelist: string[];
    ipBlacklist: string[];
  };
  mfa: {
    issuer: string;
    appName: string;
    backupCodesCount: number;
    tokenWindow: number;
    qrCodeSize: number;
  };
  permissions: {
    cacheTimeout: number;
    defaultRole: string;
    adminRoles: string[];
    managerRoles: string[];
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    logFailedAttempts: boolean;
    logSuccessfulLogins: boolean;
    logPermissionChanges: boolean;
  };
}

export default registerAs('auth', (): AuthConfig => ({
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'unified-business-platform',
    audience: process.env.JWT_AUDIENCE || 'unified-business-platform',
  },
  password: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS === 'true',
  },
  session: {
    maxSessions: parseInt(process.env.MAX_SESSIONS_PER_USER || '5'),
    sessionTimeout: process.env.SESSION_TIMEOUT || '15m',
    rememberMeTimeout: process.env.REMEMBER_ME_TIMEOUT || '30d',
    cleanupInterval: process.env.SESSION_CLEANUP_INTERVAL || '1h',
  },
  security: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '300000'), // 5 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '10'),
    suspiciousActivityThreshold: parseInt(process.env.SUSPICIOUS_ACTIVITY_THRESHOLD || '20'),
    ipWhitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [],
    ipBlacklist: process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [],
  },
  mfa: {
    issuer: process.env.MFA_ISSUER || 'Unified Business Platform',
    appName: process.env.MFA_APP_NAME || 'Unified Business Platform',
    backupCodesCount: parseInt(process.env.MFA_BACKUP_CODES_COUNT || '10'),
    tokenWindow: parseInt(process.env.MFA_TOKEN_WINDOW || '1'),
    qrCodeSize: parseInt(process.env.MFA_QR_CODE_SIZE || '200'),
  },
  permissions: {
    cacheTimeout: parseInt(process.env.PERMISSIONS_CACHE_TIMEOUT || '900'), // 15 minutes
    defaultRole: process.env.DEFAULT_USER_ROLE || 'employee',
    adminRoles: process.env.ADMIN_ROLES ? process.env.ADMIN_ROLES.split(',') : ['super_admin', 'tenant_admin'],
    managerRoles: process.env.MANAGER_ROLES ? process.env.MANAGER_ROLES.split(',') : ['super_admin', 'tenant_admin', 'manager'],
  },
  audit: {
    enabled: process.env.AUDIT_ENABLED === 'true',
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '90'),
    logFailedAttempts: process.env.AUDIT_LOG_FAILED_ATTEMPTS !== 'false',
    logSuccessfulLogins: process.env.AUDIT_LOG_SUCCESSFUL_LOGINS !== 'false',
    logPermissionChanges: process.env.AUDIT_LOG_PERMISSION_CHANGES !== 'false',
  },
}));