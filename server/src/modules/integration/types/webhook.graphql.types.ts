import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/graphql/base.types';

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed',
  SUSPENDED = 'suspended',
}

export enum WebhookAuthType {
  BEARER_TOKEN = 'bearer_token',
  API_KEY = 'api_key',
  BASIC_AUTH = 'basic_auth',
  NONE = 'none',
}

registerEnumType(WebhookStatus, { name: 'WebhookStatus' });
registerEnumType(WebhookAuthType, { name: 'WebhookAuthType' });

@ObjectType()
export class WebhookType extends BaseEntity {
  @Field(() => ID)
  @ApiProperty({ description: 'Webhook ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Integration ID' })
  integrationId!: string;

  @Field()
  @ApiProperty({ description: 'Webhook name' })
  name!: string;

  @Field()
  @ApiProperty({ description: 'Webhook URL' })
  url!: string;

  @Field()
  @ApiProperty({ description: 'HTTP method' })
  method!: string;

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Subscribed events' })
  events!: string[];

  @Field(() => WebhookStatus)
  @ApiProperty({ enum: WebhookStatus, description: 'Webhook status' })
  status!: WebhookStatus;

  @Field(() => WebhookAuthType)
  @ApiProperty({ enum: WebhookAuthType, description: 'Authentication type' })
  authType!: WebhookAuthType;

  @Field()
  @ApiProperty({ description: 'Is active' })
  isActive!: boolean;

  @Field(() => Int)
  @ApiProperty({ description: 'Timeout in seconds' })
  timeout!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Retry attempts' })
  retryAttempts!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Success count' })
  successCount!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Failure count' })
  failureCount!: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last delivery timestamp', required: false })
  lastDeliveryAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last success timestamp', required: false })
  lastSuccessAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last failure timestamp', required: false })
  lastFailureAt?: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last error message', required: false })
  lastError?: string;

  @Field()
  @ApiProperty({ description: 'Created timestamp' })
  createdAt!: Date;

  @Field()
  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt!: Date;
}

@ObjectType()
export class WebhookDeliveryType {
  @Field(() => ID)
  @ApiProperty({ description: 'Delivery ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Webhook ID' })
  webhookId!: string;

  @Field()
  @ApiProperty({ description: 'Event type' })
  eventType!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'HTTP status code' })
  statusCode!: number;

  @Field()
  @ApiProperty({ description: 'Success status' })
  success!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message', required: false })
  error?: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Duration in milliseconds' })
  duration!: number;

  @Field()
  @ApiProperty({ description: 'Delivered at timestamp' })
  deliveredAt!: Date;

  @Field(() => Int)
  @ApiProperty({ description: 'Retry count' })
  retryCount!: number;
}

@ObjectType()
export class WebhookTestResult {
  @Field()
  @ApiProperty({ description: 'Test success status' })
  success!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'HTTP status code', required: false })
  statusCode?: number;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message', required: false })
  error?: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Duration in milliseconds' })
  duration!: number;

  @Field()
  @ApiProperty({ description: 'Test timestamp' })
  timestamp!: Date;
}
