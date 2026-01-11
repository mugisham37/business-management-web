import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

export enum DisasterType {
  HARDWARE_FAILURE = 'hardware_failure',
  NETWORK_OUTAGE = 'network_outage',
  DATA_CENTER_OUTAGE = 'data_center_outage',
  CYBER_ATTACK = 'cyber_attack',
  NATURAL_DISASTER = 'natural_disaster',
  HUMAN_ERROR = 'human_error',
  SOFTWARE_FAILURE = 'software_failure',
  POWER_OUTAGE = 'power_outage',
}

export enum RecoveryStatus {
  STANDBY = 'standby',
  DETECTING = 'detecting',
  INITIATING = 'initiating',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TESTING = 'testing',
  ROLLBACK = 'rollback',
}

export enum FailoverType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  PLANNED = 'planned',
  EMERGENCY = 'emergency',
}

export enum ReplicationStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  FAILED = 'failed',
  SYNCING = 'syncing',
  LAG_WARNING = 'lag_warning',
  DISCONNECTED = 'disconnected',
}

registerEnumType(DisasterType, {
  name: 'DisasterType',
  description: 'Type of disaster scenario',
});

registerEnumType(RecoveryStatus, {
  name: 'RecoveryStatus',
  description: 'Status of disaster recovery process',
});

registerEnumType(FailoverType, {
  name: 'FailoverType',
  description: 'Type of failover operation',
});

registerEnumType(ReplicationStatus, {
  name: 'ReplicationStatus',
  description: 'Status of data replication',
});

@ObjectType()
export class DisasterRecoveryPlan {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for the DR plan' })
  id: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID this plan belongs to' })
  tenantId: string;

  @Field()
  @ApiProperty({ description: 'Name of the disaster recovery plan' })
  name: string;

  @Field()
  @ApiProperty({ description: 'Description of the plan' })
  description: string;

  @Field(() => [DisasterType])
  @ApiProperty({ enum: DisasterType, isArray: true, description: 'Types of disasters covered' })
  disasterTypes: DisasterType[];

  @Field()
  @ApiProperty({ description: 'Recovery Time Objective in minutes' })
  rtoMinutes: number;

  @Field()
  @ApiProperty({ description: 'Recovery Point Objective in minutes' })
  rpoMinutes: number;

  @Field()
  @ApiProperty({ description: 'Primary data center region' })
  primaryRegion: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Secondary data center regions' })
  secondaryRegions: string[];

  @Field()
  @ApiProperty({ description: 'Automatic failover enabled' })
  automaticFailover: boolean;

  @Field()
  @ApiProperty({ description: 'Plan configuration and procedures' })
  configuration: Record<string, any>;

  @Field()
  @ApiProperty({ description: 'Whether plan is active' })
  isActive: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last test execution date', required: false })
  lastTestedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Next scheduled test date', required: false })
  nextTestAt?: Date;

  @Field()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Field()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User who created the plan', required: false })
  createdBy?: string;
}

@ObjectType()
export class DisasterRecoveryExecution {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for the DR execution' })
  id: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID this execution belongs to' })
  tenantId: string;

  @Field()
  @ApiProperty({ description: 'DR plan ID being executed' })
  planId: string;

  @Field(() => DisasterType)
  @ApiProperty({ enum: DisasterType, description: 'Type of disaster detected' })
  disasterType: DisasterType;

  @Field(() => RecoveryStatus)
  @ApiProperty({ enum: RecoveryStatus, description: 'Current recovery status' })
  status: RecoveryStatus;

  @Field()
  @ApiProperty({ description: 'Timestamp when disaster was detected' })
  detectedAt: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Timestamp when recovery started', required: false })
  startedAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Timestamp when recovery completed', required: false })
  completedAt?: Date;

  @Field()
  @ApiProperty({ description: 'Actual Recovery Time Objective achieved in minutes' })
  actualRtoMinutes: number;

  @Field()
  @ApiProperty({ description: 'Actual Recovery Point Objective achieved in minutes' })
  actualRpoMinutes: number;

  @Field()
  @ApiProperty({ description: 'Recovery steps executed' })
  executedSteps: Record<string, any>[];

  @Field(() => [String])
  @ApiProperty({ description: 'Errors encountered during recovery' })
  errors: string[];

  @Field(() => [String])
  @ApiProperty({ description: 'Warnings generated during recovery' })
  warnings: string[];

  @Field()
  @ApiProperty({ description: 'Whether this was a test execution' })
  isTest: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'User who initiated the recovery', required: false })
  initiatedBy?: string;
}

@ObjectType()
export class FailoverConfiguration {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for failover config' })
  id: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID this config belongs to' })
  tenantId: string;

  @Field()
  @ApiProperty({ description: 'Service or component name' })
  serviceName: string;

  @Field()
  @ApiProperty({ description: 'Primary endpoint or resource' })
  primaryEndpoint: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Secondary endpoints or resources' })
  secondaryEndpoints: string[];

  @Field(() => FailoverType)
  @ApiProperty({ enum: FailoverType, description: 'Type of failover' })
  failoverType: FailoverType;

  @Field()
  @ApiProperty({ description: 'Health check configuration' })
  healthCheckConfig: Record<string, any>;

  @Field()
  @ApiProperty({ description: 'Failover threshold settings' })
  thresholds: Record<string, any>;

  @Field()
  @ApiProperty({ description: 'Whether failover is enabled' })
  isEnabled: boolean;

  @Field()
  @ApiProperty({ description: 'Current active endpoint' })
  currentActiveEndpoint: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last failover timestamp', required: false })
  lastFailoverAt?: Date;

  @Field()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Field()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

@ObjectType()
export class ReplicationConfiguration {
  @Field(() => ID)
  @ApiProperty({ description: 'Unique identifier for replication config' })
  id: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID this config belongs to' })
  tenantId: string;

  @Field()
  @ApiProperty({ description: 'Source database or service' })
  sourceEndpoint: string;

  @Field()
  @ApiProperty({ description: 'Target database or service' })
  targetEndpoint: string;

  @Field()
  @ApiProperty({ description: 'Source region' })
  sourceRegion: string;

  @Field()
  @ApiProperty({ description: 'Target region' })
  targetRegion: string;

  @Field(() => ReplicationStatus)
  @ApiProperty({ enum: ReplicationStatus, description: 'Current replication status' })
  status: ReplicationStatus;

  @Field()
  @ApiProperty({ description: 'Replication lag in seconds' })
  lagSeconds: number;

  @Field()
  @ApiProperty({ description: 'Last successful replication timestamp' })
  lastReplicationAt: Date;

  @Field()
  @ApiProperty({ description: 'Replication configuration settings' })
  configuration: Record<string, any>;

  @Field()
  @ApiProperty({ description: 'Whether replication is enabled' })
  isEnabled: boolean;

  @Field()
  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @Field()
  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

@ObjectType()
export class DisasterRecoveryMetrics {
  @Field()
  @ApiProperty({ description: 'Average RTO achieved in minutes' })
  averageRtoMinutes: number;

  @Field()
  @ApiProperty({ description: 'Average RPO achieved in minutes' })
  averageRpoMinutes: number;

  @Field()
  @ApiProperty({ description: 'Success rate percentage' })
  successRate: number;

  @Field()
  @ApiProperty({ description: 'Total number of DR executions' })
  totalExecutions: number;

  @Field()
  @ApiProperty({ description: 'Number of successful recoveries' })
  successfulRecoveries: number;

  @Field()
  @ApiProperty({ description: 'Number of failed recoveries' })
  failedRecoveries: number;

  @Field()
  @ApiProperty({ description: 'Number of test executions' })
  testExecutions: number;

  @Field()
  @ApiProperty({ description: 'Last successful recovery timestamp' })
  lastSuccessfulRecovery: Date;

  @Field()
  @ApiProperty({ description: 'Next scheduled test timestamp' })
  nextScheduledTest: Date;

  @Field()
  @ApiProperty({ description: 'Current system health score (0-100)' })
  healthScore: number;
}