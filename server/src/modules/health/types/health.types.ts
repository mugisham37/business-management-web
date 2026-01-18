import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  UNHEALTHY = 'UNHEALTHY',
  DEGRADED = 'DEGRADED',
  UNKNOWN = 'UNKNOWN',
}

export enum HealthCheckType {
  DATABASE = 'DATABASE',
  REDIS = 'REDIS',
  MEMORY = 'MEMORY',
  DISK = 'DISK',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
  QUEUE = 'QUEUE',
  CACHE = 'CACHE',
}

export enum HealthSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

registerEnumType(HealthStatus, {
  name: 'HealthStatus',
  description: 'Health status of a component',
});

registerEnumType(HealthCheckType, {
  name: 'HealthCheckType',
  description: 'Type of health check',
});

registerEnumType(HealthSeverity, {
  name: 'HealthSeverity',
  description: 'Severity level of health issues',
});

@ObjectType()
export class HealthMetric {
  @Field()
  name!: string;

  @Field()
  value!: string;

  @Field()
  unit!: string;

  @Field(() => Float, { nullable: true })
  threshold?: number;

  @Field(() => Boolean)
  withinThreshold!: boolean;
}

@ObjectType()
export class HealthDetails {
  @Field(() => [HealthMetric])
  metrics!: HealthMetric[];

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  error?: string;

  @Field()
  timestamp!: Date;

  @Field(() => Int)
  responseTime!: number;
}

@ObjectType()
export class HealthCheck {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => HealthCheckType)
  type!: HealthCheckType;

  @Field(() => HealthStatus)
  status!: HealthStatus;

  @Field(() => HealthSeverity)
  severity!: HealthSeverity;

  @Field(() => HealthDetails)
  details!: HealthDetails;

  @Field()
  lastChecked!: Date;

  @Field(() => Int)
  consecutiveFailures!: number;

  @Field(() => Boolean)
  isRequired!: boolean;
}

@ObjectType()
export class SystemHealth {
  @Field(() => HealthStatus)
  overallStatus!: HealthStatus;

  @Field(() => [HealthCheck])
  checks!: HealthCheck[];

  @Field()
  timestamp!: Date;

  @Field(() => Int)
  totalChecks!: number;

  @Field(() => Int)
  healthyChecks!: number;

  @Field(() => Int)
  unhealthyChecks!: number;

  @Field(() => Int)
  degradedChecks!: number;

  @Field(() => Float)
  uptime!: number;

  @Field()
  version!: string;

  @Field()
  environment!: string;
}

@ObjectType()
export class HealthHistory {
  @Field()
  checkId!: string;

  @Field(() => HealthStatus)
  status!: HealthStatus;

  @Field()
  timestamp!: Date;

  @Field(() => Int)
  responseTime!: number;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType()
export class HealthTrend {
  @Field()
  checkId!: string;

  @Field()
  name!: string;

  @Field(() => [HealthHistory])
  history!: HealthHistory[];

  @Field(() => Float)
  availabilityPercentage!: number;

  @Field(() => Float)
  averageResponseTime!: number;

  @Field(() => Int)
  totalChecks!: number;

  @Field(() => Int)
  failureCount!: number;
}

@ObjectType()
export class HealthAlert {
  @Field()
  id!: string;

  @Field()
  checkId!: string;

  @Field()
  checkName!: string;

  @Field(() => HealthSeverity)
  severity!: HealthSeverity;

  @Field()
  message!: string;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field(() => Boolean)
  isActive!: boolean;

  @Field(() => Int)
  occurrenceCount!: number;
}

@ObjectType()
export class HealthDashboard {
  @Field(() => SystemHealth)
  systemHealth!: SystemHealth;

  @Field(() => [HealthTrend])
  trends!: HealthTrend[];

  @Field(() => [HealthAlert])
  activeAlerts!: HealthAlert[];

  @Field(() => Int)
  totalAlerts!: number;

  @Field(() => Float)
  systemAvailability!: number;
}