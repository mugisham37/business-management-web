import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secret: string;
    expiresIn: string;
    refreshSecret: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
    algorithm: string;
  };
  password: {
    bcryptRounds: number;
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    preventReuse: number;
    maxAge: number; // days
  };
  session: {
    maxSessions: number;
    sessionTimeout: string;
    rememberMeTimeout: string;
    cleanupInterval: string;
    extendOnActivity: boolean;
    requireReauth: number; // hours
  };
  security: {
    maxFailedAttempts: number;
    lockoutDuration: number; // milliseconds
    progressiveLockout: boolean;
    rateLimitWindow: number; // milliseconds
    rateLimitMax: number;
    suspiciousActivityThreshold: number;
    ipWhitelist: string[];
    ipBlacklist: string[];
    trustedNetworks: string[];
    deviceTrustThreshold: number;
    riskScoreThreshold: number;
  };
  mfa: {
    issuer: string;
    appName: string;
    backupCodesCount: number;
    tokenWindow: number;
    qrCodeSize: number;
    enforceForRoles: string[];
    gracePeriod: number; // days
  };
  webauthn: {
    enabled: boolean;
    rpName: string;
    rpId: string;
    origin: string[];
    timeout: number;
    userVerification: 'required' | 'preferred' | 'discouraged';
    attestation: 'none' | 'indirect' | 'direct';
  };
  permissions: {
    cacheTimeout: number; // seconds
    defaultRole: string;
    adminRoles: string[];
    managerRoles: string[];
    inheritanceEnabled: boolean;
    wildcardEnabled: boolean;
    policyEngine: 'simple' | 'advanced';
  };
  audit: {
    enabled: boolean;
    retentionDays: number;
    logFailedAttempts: boolean;
    logSuccessfulLogins: boolean;
    logPermissionChanges: boolean;
    logSecurityEvents: boolean;
    logDataAccess: boolean;
    realTimeAlerts: boolean;
    complianceMode: boolean;
  };
  social: {
    google: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
      scope: string[];
    };
    facebook: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
      scope: string[];
    };
    github: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
      scope: string[];
    };
  };
  riskAssessment: {
    enabled: boolean;
    factors: {
      location: { weight: number; enabled: boolean };
      device: { weight: number; enabled: boolean };
      behavior: { weight: number; enabled: boolean };
      network: { weight: number; enabled: boolean };
      time: { weight: number; enabled: boolean };
    };
    thresholds: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    actions: {
      medium: string[]; // ['require_mfa']
      high: string[]; // ['require_mfa', 'require_approval']
      critical: string[]; // ['block_access', 'alert_admin']
    };
  };
  compliance: {
    gdpr: {
      enabled: boolean;
      dataRetentionDays: number;
      consentRequired: boolean;
      rightToErasure: boolean;
    };
    sox: {
      enabled: boolean;
      segregationOfDuties: boolean;
      approvalWorkflows: boolean;
      auditTrail: boolean;
    };
    hipaa: {
      enabled: boolean;
      encryptionRequired: boolean;
      accessLogging: boolean;
      minimumNecessary: boolean;
    };
  };
}

export default registerAs('auth', (): AuthConfig => ({
  jwt: {
    secret: process.env.JWT_SECRET || '',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'business-management-platform',
    audience: process.env.JWT_AUDIENCE || 'business-management-platform',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
  },
  password: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
    maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
    requireUppercase: process.env.PASSWORD_REQUIRE_UPPERCASE !== 'false',
    requireLowercase: process.env.PASSWORD_REQUIRE_LOWERCASE !== 'false',
    requireNumbers: process.env.PASSWORD_REQUIRE_NUMBERS !== 'false',
    requireSpecialChars: process.env.PASSWORD_REQUIRE_SPECIAL_CHARS !== 'false',
    preventReuse: parseInt(process.env.PASSWORD_PREVENT_REUSE || '5'),
    maxAge: parseInt(process.env.PASSWORD_MAX_AGE_DAYS || '90'),
  },
  session: {
    maxSessions: parseInt(process.env.MAX_SESSIONS_PER_USER || '5'),
    sessionTimeout: process.env.SESSION_TIMEOUT || '15m',
    rememberMeTimeout: process.env.REMEMBER_ME_TIMEOUT || '30d',
    cleanupInterval: process.env.SESSION_CLEANUP_INTERVAL || '1h',
    extendOnActivity: process.env.SESSION_EXTEND_ON_ACTIVITY !== 'false',
    requireReauth: parseInt(process.env.SESSION_REQUIRE_REAUTH_HOURS || '24'),
  },
  security: {
    maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS || '5'),
    lockoutDuration: parseInt(process.env.LOCKOUT_DURATION || '900000'), // 15 minutes
    progressiveLockout: process.env.PROGRESSIVE_LOCKOUT !== 'false',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '300000'), // 5 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '10'),
    suspiciousActivityThreshold: parseInt(process.env.SUSPICIOUS_ACTIVITY_THRESHOLD || '20'),
    ipWhitelist: process.env.IP_WHITELIST ? process.env.IP_WHITELIST.split(',') : [],
    ipBlacklist: process.env.IP_BLACKLIST ? process.env.IP_BLACKLIST.split(',') : [],
    trustedNetworks: process.env.TRUSTED_NETWORKS ? process.env.TRUSTED_NETWORKS.split(',') : [],
    deviceTrustThreshold: parseInt(process.env.DEVICE_TRUST_THRESHOLD || '70'),
    riskScoreThreshold: parseInt(process.env.RISK_SCORE_THRESHOLD || '50'),
  },
  mfa: {
    issuer: process.env.MFA_ISSUER || 'Business Management Platform',
    appName: process.env.MFA_APP_NAME || 'Business Management Platform',
    backupCodesCount: parseInt(process.env.MFA_BACKUP_CODES_COUNT || '10'),
    tokenWindow: parseInt(process.env.MFA_TOKEN_WINDOW || '1'),
    qrCodeSize: parseInt(process.env.MFA_QR_CODE_SIZE || '200'),
    enforceForRoles: process.env.MFA_ENFORCE_FOR_ROLES ? process.env.MFA_ENFORCE_FOR_ROLES.split(',') : ['super_admin', 'tenant_admin'],
    gracePeriod: parseInt(process.env.MFA_GRACE_PERIOD_DAYS || '7'),
  },
  webauthn: {
    enabled: process.env.WEBAUTHN_ENABLED === 'true',
    rpName: process.env.WEBAUTHN_RP_NAME || 'Business Management Platform',
    rpId: process.env.WEBAUTHN_RP_ID || 'localhost',
    origin: process.env.WEBAUTHN_ORIGIN ? process.env.WEBAUTHN_ORIGIN.split(',') : ['http://localhost:3000'],
    timeout: parseInt(process.env.WEBAUTHN_TIMEOUT || '60000'),
    userVerification: (process.env.WEBAUTHN_USER_VERIFICATION as any) || 'preferred',
    attestation: (process.env.WEBAUTHN_ATTESTATION as any) || 'none',
  },
  permissions: {
    cacheTimeout: parseInt(process.env.PERMISSIONS_CACHE_TIMEOUT || '900'), // 15 minutes
    defaultRole: process.env.DEFAULT_USER_ROLE || 'employee',
    adminRoles: process.env.ADMIN_ROLES ? process.env.ADMIN_ROLES.split(',') : ['super_admin', 'tenant_admin'],
    managerRoles: process.env.MANAGER_ROLES ? process.env.MANAGER_ROLES.split(',') : ['super_admin', 'tenant_admin', 'manager'],
    inheritanceEnabled: process.env.PERMISSION_INHERITANCE !== 'false',
    wildcardEnabled: process.env.PERMISSION_WILDCARDS !== 'false',
    policyEngine: (process.env.POLICY_ENGINE as any) || 'advanced',
  },
  audit: {
    enabled: process.env.AUDIT_ENABLED !== 'false',
    retentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555'), // 7 years
    logFailedAttempts: process.env.AUDIT_LOG_FAILED_ATTEMPTS !== 'false',
    logSuccessfulLogins: process.env.AUDIT_LOG_SUCCESSFUL_LOGINS !== 'false',
    logPermissionChanges: process.env.AUDIT_LOG_PERMISSION_CHANGES !== 'false',
    logSecurityEvents: process.env.AUDIT_LOG_SECURITY_EVENTS !== 'false',
    logDataAccess: process.env.AUDIT_LOG_DATA_ACCESS !== 'false',
    realTimeAlerts: process.env.AUDIT_REAL_TIME_ALERTS === 'true',
    complianceMode: process.env.AUDIT_COMPLIANCE_MODE === 'true',
  },
  social: {
    google: {
      enabled: process.env.GOOGLE_AUTH_ENABLED === 'true',
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      scope: process.env.GOOGLE_SCOPE ? process.env.GOOGLE_SCOPE.split(',') : ['email', 'profile'],
    },
    facebook: {
      enabled: process.env.FACEBOOK_AUTH_ENABLED === 'true',
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      scope: process.env.FACEBOOK_SCOPE ? process.env.FACEBOOK_SCOPE.split(',') : ['email'],
    },
    github: {
      enabled: process.env.GITHUB_AUTH_ENABLED === 'true',
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      scope: process.env.GITHUB_SCOPE ? process.env.GITHUB_SCOPE.split(',') : ['user:email'],
    },
  },
  riskAssessment: {
    enabled: process.env.RISK_ASSESSMENT_ENABLED !== 'false',
    factors: {
      location: { 
        weight: parseFloat(process.env.RISK_LOCATION_WEIGHT || '0.2'), 
        enabled: process.env.RISK_LOCATION_ENABLED !== 'false' 
      },
      device: { 
        weight: parseFloat(process.env.RISK_DEVICE_WEIGHT || '0.25'), 
        enabled: process.env.RISK_DEVICE_ENABLED !== 'false' 
      },
      behavior: { 
        weight: parseFloat(process.env.RISK_BEHAVIOR_WEIGHT || '0.3'), 
        enabled: process.env.RISK_BEHAVIOR_ENABLED !== 'false' 
      },
      network: { 
        weight: parseFloat(process.env.RISK_NETWORK_WEIGHT || '0.15'), 
        enabled: process.env.RISK_NETWORK_ENABLED !== 'false' 
      },
      time: { 
        weight: parseFloat(process.env.RISK_TIME_WEIGHT || '0.1'), 
        enabled: process.env.RISK_TIME_ENABLED !== 'false' 
      },
    },
    thresholds: {
      low: parseInt(process.env.RISK_THRESHOLD_LOW || '25'),
      medium: parseInt(process.env.RISK_THRESHOLD_MEDIUM || '50'),
      high: parseInt(process.env.RISK_THRESHOLD_HIGH || '75'),
      critical: parseInt(process.env.RISK_THRESHOLD_CRITICAL || '90'),
    },
    actions: {
      medium: process.env.RISK_ACTIONS_MEDIUM ? process.env.RISK_ACTIONS_MEDIUM.split(',') : ['require_mfa'],
      high: process.env.RISK_ACTIONS_HIGH ? process.env.RISK_ACTIONS_HIGH.split(',') : ['require_mfa', 'require_approval'],
      critical: process.env.RISK_ACTIONS_CRITICAL ? process.env.RISK_ACTIONS_CRITICAL.split(',') : ['block_access', 'alert_admin'],
    },
  },
  compliance: {
    gdpr: {
      enabled: process.env.GDPR_COMPLIANCE === 'true',
      dataRetentionDays: parseInt(process.env.GDPR_DATA_RETENTION_DAYS || '2555'), // 7 years
      consentRequired: process.env.GDPR_CONSENT_REQUIRED !== 'false',
      rightToErasure: process.env.GDPR_RIGHT_TO_ERASURE !== 'false',
    },
    sox: {
      enabled: process.env.SOX_COMPLIANCE === 'true',
      segregationOfDuties: process.env.SOX_SEGREGATION_OF_DUTIES !== 'false',
      approvalWorkflows: process.env.SOX_APPROVAL_WORKFLOWS !== 'false',
      auditTrail: process.env.SOX_AUDIT_TRAIL !== 'false',
    },
    hipaa: {
      enabled: process.env.HIPAA_COMPLIANCE === 'true',
      encryptionRequired: process.env.HIPAA_ENCRYPTION_REQUIRED !== 'false',
      accessLogging: process.env.HIPAA_ACCESS_LOGGING !== 'false',
      minimumNecessary: process.env.HIPAA_MINIMUM_NECESSARY !== 'false',
    },
  },
}));