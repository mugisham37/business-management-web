import { registerAs } from '@nestjs/config';

export interface SecurityConfig {
  // Encryption Configuration
  encryptionMasterKey: string;
  encryptionAlgorithm: string;
  bcryptRounds: number;
  
  // Audit Configuration
  auditRetentionDays: number;
  auditEncryptionEnabled: boolean;
  auditIntegrityChecks: boolean;
  
  // Threat Detection Configuration
  threatDetectionEnabled: boolean;
  threatAnalysisThreshold: number;
  behavioralAnalysisEnabled: boolean;
  threatIntelligenceEnabled: boolean;
  
  // Compliance Configuration
  complianceFrameworks: string[];
  complianceAutomatedChecks: boolean;
  complianceReportingEnabled: boolean;
  gdprEnabled: boolean;
  
  // Security Monitoring
  securityMonitoringEnabled: boolean;
  realTimeAlertsEnabled: boolean;
  securityDashboardEnabled: boolean;
  
  // Enterprise Authentication
  samlEnabled: boolean;
  ldapEnabled: boolean;
  oauth2Enabled: boolean;
  ssoSessionTimeout: number;
  
  // Penetration Testing
  penetrationTestingEnabled: boolean;
  automatedScanningEnabled: boolean;
  vulnerabilityReportingEnabled: boolean;
  
  // Data Management
  dataRetentionEnabled: boolean;
  gdprDeletionEnabled: boolean;
  emergencyWipeEnabled: boolean;
  
  // Rate Limiting
  rateLimitEnabled: boolean;
  rateLimitRequests: number;
  rateLimitWindow: number;
  
  // Security Headers
  securityHeadersEnabled: boolean;
  contentSecurityPolicy: string;
  
  // Advanced Features
  anomalyDetectionEnabled: boolean;
  riskBasedAuthEnabled: boolean;
  geoFencingEnabled: boolean;
}

export const securityConfig = registerAs('security', (): SecurityConfig => ({
  // Encryption Configuration
  encryptionMasterKey: process.env.ENCRYPTION_MASTER_KEY || (() => {
    throw new Error('ENCRYPTION_MASTER_KEY is required for security module');
  })(),
  encryptionAlgorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  
  // Audit Configuration
  auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '2555', 10), // 7 years
  auditEncryptionEnabled: process.env.AUDIT_ENCRYPTION_ENABLED !== 'false',
  auditIntegrityChecks: process.env.AUDIT_INTEGRITY_CHECKS !== 'false',
  
  // Threat Detection Configuration
  threatDetectionEnabled: process.env.THREAT_DETECTION_ENABLED !== 'false',
  threatAnalysisThreshold: parseInt(process.env.THREAT_ANALYSIS_THRESHOLD || '70', 10),
  behavioralAnalysisEnabled: process.env.BEHAVIORAL_ANALYSIS_ENABLED !== 'false',
  threatIntelligenceEnabled: process.env.THREAT_INTELLIGENCE_ENABLED !== 'false',
  
  // Compliance Configuration
  complianceFrameworks: (process.env.COMPLIANCE_FRAMEWORKS || 'SOC2,GDPR,PCI_DSS').split(','),
  complianceAutomatedChecks: process.env.COMPLIANCE_AUTOMATED_CHECKS !== 'false',
  complianceReportingEnabled: process.env.COMPLIANCE_REPORTING_ENABLED !== 'false',
  gdprEnabled: process.env.GDPR_ENABLED !== 'false',
  
  // Security Monitoring
  securityMonitoringEnabled: process.env.SECURITY_MONITORING_ENABLED !== 'false',
  realTimeAlertsEnabled: process.env.REAL_TIME_ALERTS_ENABLED !== 'false',
  securityDashboardEnabled: process.env.SECURITY_DASHBOARD_ENABLED !== 'false',
  
  // Enterprise Authentication
  samlEnabled: process.env.SAML_ENABLED === 'true',
  ldapEnabled: process.env.LDAP_ENABLED === 'true',
  oauth2Enabled: process.env.OAUTH2_ENABLED === 'true',
  ssoSessionTimeout: parseInt(process.env.SSO_SESSION_TIMEOUT || '28800', 10), // 8 hours
  
  // Penetration Testing
  penetrationTestingEnabled: process.env.PENETRATION_TESTING_ENABLED !== 'false',
  automatedScanningEnabled: process.env.AUTOMATED_SCANNING_ENABLED === 'true',
  vulnerabilityReportingEnabled: process.env.VULNERABILITY_REPORTING_ENABLED !== 'false',
  
  // Data Management
  dataRetentionEnabled: process.env.DATA_RETENTION_ENABLED !== 'false',
  gdprDeletionEnabled: process.env.GDPR_DELETION_ENABLED !== 'false',
  emergencyWipeEnabled: process.env.EMERGENCY_WIPE_ENABLED === 'true',
  
  // Rate Limiting
  rateLimitEnabled: process.env.RATE_LIMIT_ENABLED !== 'false',
  rateLimitRequests: parseInt(process.env.RATE_LIMIT_REQUESTS || '100', 10),
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
  
  // Security Headers
  securityHeadersEnabled: process.env.SECURITY_HEADERS_ENABLED !== 'false',
  contentSecurityPolicy: process.env.CONTENT_SECURITY_POLICY || "default-src 'self'",
  
  // Advanced Features
  anomalyDetectionEnabled: process.env.ANOMALY_DETECTION_ENABLED !== 'false',
  riskBasedAuthEnabled: process.env.RISK_BASED_AUTH_ENABLED === 'true',
  geoFencingEnabled: process.env.GEO_FENCING_ENABLED === 'true',
}));