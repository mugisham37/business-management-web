import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsString, IsNumber, IsBoolean, IsArray, IsDateString, Min, Max } from 'class-validator';
import { HealthStatus, HealthCheckType, HealthSeverity } from '../types/health.types';

@InputType()
export class HealthCheckInput {
  @Field()
  @IsString()
  name!: string;

  @Field(() => HealthCheckType)
  @IsEnum(HealthCheckType)
  type!: HealthCheckType;

  @Field(() => HealthSeverity)
  @IsEnum(HealthSeverity)
  severity!: HealthSeverity;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @Field(() => Int, { defaultValue: 30 })
  @IsNumber()
  @Min(5)
  @Max(300)
  @IsOptional()
  intervalSeconds?: number;

  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Min(1)
  @Max(60)
  @IsOptional()
  timeoutSeconds?: number;

  @Field(() => Int, { defaultValue: 3 })
  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  retryAttempts?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class HealthFilterInput {
  @Field(() => [HealthStatus], { nullable: true })
  @IsEnum(HealthStatus, { each: true })
  @IsOptional()
  statuses?: HealthStatus[];

  @Field(() => [HealthCheckType], { nullable: true })
  @IsEnum(HealthCheckType, { each: true })
  @IsOptional()
  types?: HealthCheckType[];

  @Field(() => [HealthSeverity], { nullable: true })
  @IsEnum(HealthSeverity, { each: true })
  @IsOptional()
  severities?: HealthSeverity[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isRequired?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  searchTerm?: string;
}

@InputType()
export class HealthHistoryFilterInput {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  checkId?: string;

  @Field(() => [HealthStatus], { nullable: true })
  @IsEnum(HealthStatus, { each: true })
  @IsOptional()
  statuses?: HealthStatus[];

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @Min(1)
  @Max(10000)
  @IsOptional()
  limit?: number;
}

@InputType()
export class HealthAlertInput {
  @Field()
  @IsString()
  checkId!: string;

  @Field(() => HealthSeverity)
  @IsEnum(HealthSeverity)
  severity!: HealthSeverity;

  @Field()
  @IsString()
  message!: string;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  notificationChannels?: string[];
}

@InputType()
export class HealthAlertFilterInput {
  @Field(() => [HealthSeverity], { nullable: true })
  @IsEnum(HealthSeverity, { each: true })
  @IsOptional()
  severities?: HealthSeverity[];

  @Field(() => Boolean, { nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  checkId?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @Field({ nullable: true })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

@InputType()
export class HealthMetricThresholdInput {
  @Field()
  @IsString()
  metricName!: string;

  @Field(() => Float)
  @IsNumber()
  warningThreshold!: number;

  @Field(() => Float)
  @IsNumber()
  criticalThreshold!: number;

  @Field()
  @IsString()
  unit!: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}

@InputType()
export class HealthNotificationConfigInput {
  @Field()
  @IsString()
  channel!: string;

  @Field(() => [HealthSeverity])
  @IsEnum(HealthSeverity, { each: true })
  severityLevels!: HealthSeverity[];

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  @Min(0)
  @Max(3600)
  @IsOptional()
  cooldownSeconds?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  template?: string;
}

@InputType()
export class HealthDashboardConfigInput {
  @Field(() => Int, { defaultValue: 30 })
  @IsNumber()
  @Min(5)
  @Max(300)
  @IsOptional()
  refreshIntervalSeconds?: number;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  visibleChecks?: string[];

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  showTrends?: boolean;

  @Field(() => Boolean, { defaultValue: true })
  @IsBoolean()
  @IsOptional()
  showAlerts?: boolean;

  @Field(() => Int, { defaultValue: 24 })
  @IsNumber()
  @Min(1)
  @Max(168)
  @IsOptional()
  historyHours?: number;
}

@InputType()
export class ExternalServiceConfigInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  url!: string;

  @Field(() => Int, { defaultValue: 10 })
  @IsNumber()
  @Min(1)
  @Max(60)
  @IsOptional()
  timeoutSeconds?: number;

  @Field(() => Int, { defaultValue: 200 })
  @IsNumber()
  @Min(100)
  @Max(599)
  @IsOptional()
  expectedStatusCode?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  expectedResponsePattern?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  headers?: string[];
}