import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

// Enums
export enum IntegrationType {
  ACCOUNTING = 'accounting',
  ECOMMERCE = 'ecommerce',
  PAYMENT = 'payment',
  CRM = 'crm',
  INVENTORY = 'inventory',
  SHIPPING = 'shipping',
  MARKETING = 'marketing',
  CUSTOM = 'custom',
}

export enum IntegrationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  SUSPENDED = 'suspended',
}

export enum AuthType {
  OAUTH2 = 'oauth2',
  API_KEY = 'api_key',
  BASIC_AUTH = 'basic_auth',
  BEARER_TOKEN = 'bearer_token',
  CUSTOM = 'custom',
}

registerEnumType(IntegrationType, { name: 'IntegrationType' });
registerEnumType(IntegrationStatus, { name: 'IntegrationStatus' });
registerEnumType(AuthType, { name: 'AuthType' });

@ObjectType()
export class IntegrationType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Integration ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Tenant ID' })
  tenantId!: string;

  @Field()
  @ApiProperty({ description: 'Integration name' })
  name!: string;

  @Field()
  @ApiProperty({ description: 'Display name' })
  displayName!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Integration description', required: false })
  description?: string;

  @Field(() => IntegrationType)
  @ApiProperty({ enum: IntegrationType, description: 'Integration type' })
  type!: IntegrationType;

  @Field(() => IntegrationStatus)
  @ApiProperty({ enum: IntegrationStatus, description: 'Integration status' })
  status!: IntegrationStatus;

  @Field(() => AuthType)
  @ApiProperty({ enum: AuthType, description: 'Authentication type' })
  authType!: AuthType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Provider name', required: false })
  providerName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Provider version', required: false })
  providerVersion?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Connector version', required: false })
  connectorVersion?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last health check timestamp', required: false })
  lastHealthCheck?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Health status', required: false })
  healthStatus?: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Error count', default: 0 })
  errorCount!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last error message', required: false })
  lastError?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last error timestamp', required: false })
  lastErrorAt?: Date;

  @Field(() => Int)
  @ApiProperty({ description: 'Request count', default: 0 })
  requestCount!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last request timestamp', required: false })
  lastRequestAt?: Date;

  @Field()
  @ApiProperty({ description: 'Sync enabled', default: false })
  syncEnabled!: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Sync interval in minutes', required: false })
  syncInterval?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last sync timestamp', required: false })
  lastSyncAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Next sync timestamp', required: false })
  nextSyncAt?: Date;

  @Field()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Deleted timestamp', required: false })
  deletedAt?: Date;

  @Field()
  @ApiProperty({ description: 'Created by user ID' })
  createdBy!: string;

  @Field()
  @ApiProperty({ description: 'Updated by user ID' })
  updatedBy!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Version for optimistic locking', default: 1 })
  version!: number;
}

@ObjectType()
export class IntegrationHealth {
  @Field(() => ID)
  @ApiProperty({ description: 'Integration ID' })
  integrationId!: string;

  @Field()
  @ApiProperty({ description: 'Is healthy' })
  isHealthy!: boolean;

  @Field()
  @ApiProperty({ description: 'Last checked timestamp' })
  lastChecked!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Health details', required: false })
  details?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message', required: false })
  error?: string;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Response time in milliseconds', required: false })
  responseTime?: number;
}

@ObjectType()
export class IntegrationStatistics {
  @Field(() => ID)
  @ApiProperty({ description: 'Integration ID' })
  integrationId!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Total requests' })
  totalRequests!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Successful requests' })
  successfulRequests!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Failed requests' })
  failedRequests!: number;

  @Field()
  @ApiProperty({ description: 'Success rate percentage' })
  successRate!: number;

  @Field()
  @ApiProperty({ description: 'Uptime percentage' })
  uptime!: number;

  @Field()
  @ApiProperty({ description: 'Metrics timestamp' })
  timestamp!: Date;
}
