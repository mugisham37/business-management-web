import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-scalars';

// ============================================================================
// KEY MANAGEMENT TYPES
// ============================================================================

export enum KeyStatus {
  ACTIVE = 'ACTIVE',
  ROTATING = 'ROTATING',
  DEPRECATED = 'DEPRECATED',
  REVOKED = 'REVOKED',
}

export enum SSOProvider {
  SAML = 'SAML',
  LDAP = 'LDAP',
  OAUTH2 = 'OAUTH2',
}

export enum TestStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum DeletionStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum DeletionReason {
  GDPR_REQUEST = 'GDPR_REQUEST',
  RETENTION_POLICY = 'RETENTION_POLICY',
  USER_REQUEST = 'USER_REQUEST',
  COMPLIANCE = 'COMPLIANCE',
}

export enum AlertStatus {
  OPEN = 'OPEN',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

registerEnumType(KeyStatus, { name: 'KeyStatus' });
registerEnumType(SSOProvider, { name: 'SSOProvider' });
registerEnumType(TestStatus, { name: 'TestStatus' });
registerEnumType(DeletionStatus, { name: 'DeletionStatus' });
registerEnumType(DeletionReason, { name: 'DeletionReason' });
registerEnumType(AlertStatus, { name: 'AlertStatus' });

@ObjectType()
export class EncryptionKey {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  keyType!: string;

  @Field()
  algorithm!: string;

  @Field()
  version!: number;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field({ nullable: true })
  rotatedAt?: Date;

  @Field(() => KeyStatus)
  status!: KeyStatus;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class KeyRotationPolicy {
  @Field(() => ID)
  id!: string;

  @Field()
  keyType!: string;

  @Field()
  rotationIntervalDays!: number;

  @Field()
  gracePeriodDays!: number;

  @Field()
  autoRotate!: boolean;

  @Field()
  notifyBeforeDays!: number;

  @Field()
  enabled!: boolean;
}

// ============================================================================
// THREAT PATTERN TYPES
// ============================================================================

@ObjectType()
export class ThreatPattern {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  severity!: string;

  @Field()
  timeWindowMs!: number;

  @Field()
  threshold!: number;

  @Field()
  enabled!: boolean;

  @Field(() => [String])
  conditions!: string[];

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class ThreatPatternMatch {
  @Field(() => ID)
  id!: string;

  @Field()
  patternId!: string;

  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field()
  confidence!: number;

  @Field()
  riskScore!: number;

  @Field(() => [String])
  indicators!: string[];

  @Field(() => [String])
  recommendations!: string[];

  @Field()
  detectedAt!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class ThreatPatternRemoved {
  @Field(() => ID)
  id!: string;

  @Field()
  removedAt!: Date;
}

@ObjectType()
export class ThreatAnalysisResult {
  @Field()
  tenantId!: string;

  @Field()
  totalThreats!: number;

  @Field()
  activeThreats!: number;

  @Field()
  resolvedThreats!: number;

  @Field(() => [String])
  topThreatTypes!: string[];

  @Field(() => [String])
  topTargetedResources!: string[];

  @Field(() => [String])
  topSourceIPs!: string[];

  @Field()
  averageResolutionTime!: number;

  @Field(() => [ThreatPatternMatch])
  criticalThreats!: ThreatPatternMatch[];

  @Field()
  analyzedAt!: Date;
}

// ============================================================================
// BEHAVIORAL ANALYSIS TYPES
// ============================================================================

@ObjectType()
export class UserBehaviorProfile {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  tenantId!: string;

  @Field(() => GraphQLJSON)
  loginPatterns!: Record<string, any>;

  @Field(() => GraphQLJSON)
  accessPatterns!: Record<string, any>;

  @Field(() => GraphQLJSON)
  timePatterns!: Record<string, any>;

  @Field(() => GraphQLJSON)
  locationPatterns!: Record<string, any>;

  @Field()
  riskScore!: number;

  @Field()
  lastUpdated!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class BehavioralAnomaly {
  @Field(() => ID)
  id!: string;

  @Field()
  userId!: string;

  @Field()
  tenantId!: string;

  @Field()
  type!: string;

  @Field()
  description!: string;

  @Field()
  severity!: string;

  @Field()
  confidence!: number;

  @Field()
  detectedAt!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class AccountCompromiseResult {
  @Field()
  userId!: string;

  @Field()
  tenantId!: string;

  @Field()
  isCompromised!: boolean;

  @Field()
  riskScore!: number;

  @Field(() => [String])
  indicators!: string[];

  @Field(() => [String])
  recommendations!: string[];

  @Field()
  checkedAt!: Date;

  @Field()
  checkedBy!: string;
}

// ============================================================================
// ENTERPRISE AUTHENTICATION TYPES
// ============================================================================

@ObjectType()
export class SAMLConfiguration {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  entityId!: string;

  @Field()
  ssoUrl!: string;

  @Field({ nullable: true })
  sloUrl?: string;

  @Field()
  certificate!: string;

  @Field({ nullable: true })
  nameIdFormat?: string;

  @Field(() => [String])
  attributeMappings!: string[];

  @Field()
  enabled!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class LDAPConfiguration {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  url!: string;

  @Field()
  bindDN!: string;

  @Field()
  baseDN!: string;

  @Field()
  userSearchFilter!: string;

  @Field({ nullable: true })
  groupSearchFilter?: string;

  @Field(() => [String])
  attributeMappings!: string[];

  @Field()
  useTLS!: boolean;

  @Field()
  enabled!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class OAuth2Configuration {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  clientId!: string;

  @Field(() => [String])
  redirectUris!: string[];

  @Field(() => [String])
  scopes!: string[];

  @Field(() => [String])
  grantTypes!: string[];

  @Field()
  tokenEndpointAuthMethod!: string;

  @Field()
  enabled!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class SSOSession {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  userId!: string;

  @Field(() => SSOProvider)
  provider!: SSOProvider;

  @Field()
  sessionToken!: string;

  @Field()
  createdAt!: Date;

  @Field()
  expiresAt!: Date;

  @Field()
  active!: boolean;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

// ============================================================================
// PENETRATION TESTING TYPES
// ============================================================================

@ObjectType()
export class PenetrationTest {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  testType!: string;

  @Field()
  category!: string;

  @Field()
  name!: string;

  @Field()
  description!: string;

  @Field()
  methodology!: string;

  @Field(() => [String])
  targetEndpoints!: string[];

  @Field(() => TestStatus)
  status!: TestStatus;

  @Field()
  scheduledAt!: Date;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  results?: Record<string, any>;
}

@ObjectType()
export class PenetrationTestFinding {
  @Field(() => ID)
  id!: string;

  @Field()
  testId!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  severity!: string;

  @Field()
  category!: string;

  @Field()
  cweId!: string;

  @Field()
  cvssScore!: number;

  @Field()
  endpoint!: string;

  @Field()
  remediation!: string;

  @Field()
  status!: string;

  @Field()
  discoveredAt!: Date;
}

@ObjectType()
export class VulnerabilityReport {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  testId!: string;

  @Field()
  title!: string;

  @Field()
  summary!: string;

  @Field(() => [PenetrationTestFinding])
  findings!: PenetrationTestFinding[];

  @Field()
  totalFindings!: number;

  @Field()
  criticalFindings!: number;

  @Field()
  highFindings!: number;

  @Field()
  mediumFindings!: number;

  @Field()
  lowFindings!: number;

  @Field()
  generatedAt!: Date;
}

// ============================================================================
// DATA DELETION TYPES
// ============================================================================

@ObjectType()
export class DataDeletionRequest {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field()
  dataType!: string;

  @Field(() => DeletionReason)
  reason!: DeletionReason;

  @Field(() => DeletionStatus)
  status!: DeletionStatus;

  @Field()
  scheduledFor!: Date;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field()
  requiresVerification!: boolean;

  @Field({ nullable: true })
  verificationHash?: string;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class DeletionResult {
  @Field(() => ID)
  id!: string;

  @Field()
  requestId!: string;

  @Field()
  recordsDeleted!: number;

  @Field()
  bytesDeleted!: number;

  @Field()
  deletionMethod!: string;

  @Field()
  completedAt!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

// ============================================================================
// SECURITY MONITORING TYPES
// ============================================================================

@ObjectType()
export class SecurityAlert {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  severity!: string;

  @Field(() => AlertStatus)
  status!: AlertStatus;

  @Field()
  source!: string;

  @Field({ nullable: true })
  userId?: string;

  @Field({ nullable: true })
  resourceId?: string;

  @Field()
  detectedAt!: Date;

  @Field({ nullable: true })
  acknowledgedAt?: Date;

  @Field({ nullable: true })
  acknowledgedBy?: string;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  resolvedBy?: string;

  @Field({ nullable: true })
  resolution?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

@ObjectType()
export class SecurityIncident {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field()
  description!: string;

  @Field()
  severity!: string;

  @Field()
  status!: string;

  @Field()
  reportedBy!: string;

  @Field()
  assignedTo!: string;

  @Field()
  reportedAt!: Date;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field(() => [SecurityAlert])
  relatedAlerts!: SecurityAlert[];

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}

// ============================================================================
// AUDIT ANALYSIS TYPES
// ============================================================================

@ObjectType()
export class SecurityAuditReport {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  reportType!: string;

  @Field()
  startDate!: Date;

  @Field()
  endDate!: Date;

  @Field()
  totalEvents!: number;

  @Field()
  securityEvents!: number;

  @Field()
  criticalEvents!: number;

  @Field(() => GraphQLJSON)
  summary!: Record<string, any>;

  @Field(() => GraphQLJSON)
  findings!: Record<string, any>;

  @Field(() => [String])
  recommendations!: string[];

  @Field()
  generatedAt!: Date;

  @Field()
  generatedBy!: string;
}

@ObjectType()
export class AuditPatternAnalysis {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  analysisType!: string;

  @Field()
  timeWindowDays!: number;

  @Field()
  totalEvents!: number;

  @Field(() => GraphQLJSON)
  patterns!: Record<string, any>;

  @Field(() => GraphQLJSON)
  anomalies!: Record<string, any>;

  @Field(() => [String])
  insights!: string[];

  @Field()
  analyzedAt!: Date;
}

@ObjectType()
export class AuditIntegrityResult {
  @Field()
  tenantId!: string;

  @Field()
  isIntegrityValid!: boolean;

  @Field()
  totalLogsVerified!: number;

  @Field(() => [String])
  checksPerformed!: string[];

  @Field(() => [String])
  anomalies!: string[];

  @Field()
  verifiedAt!: Date;
}

@ObjectType()
export class AuditSearchResult {
  @Field(() => [Object])
  logs!: any[];

  @Field()
  total!: number;

  @Field()
  searchedAt!: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  filters?: Record<string, any>;
}

// ============================================================================
// COMPLIANCE TYPES
// ============================================================================

@ObjectType()
export class ComplianceGap {
  @Field(() => ID)
  id!: string;

  @Field()
  tenantId!: string;

  @Field()
  framework!: string;

  @Field()
  requirement!: string;

  @Field()
  description!: string;

  @Field()
  severity!: string;

  @Field()
  status!: string;

  @Field()
  identifiedAt!: Date;

  @Field({ nullable: true })
  remediation?: string;

  @Field({ nullable: true })
  dueDate?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: Record<string, any>;
}
