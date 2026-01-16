import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class APIKeyType {
  @Field(() => ID)
  @ApiProperty({ description: 'API Key ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'API Key name' })
  name!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Description', required: false })
  description?: string;

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Scopes' })
  scopes!: string[];

  @Field(() => Int)
  @ApiProperty({ description: 'Rate limit' })
  rateLimit!: number;

  @Field()
  @ApiProperty({ description: 'Is active' })
  isActive!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Expires at', required: false })
  expiresAt?: Date;

  @Field()
  @ApiProperty({ description: 'Created at' })
  createdAt!: Date;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Last used at', required: false })
  lastUsedAt?: Date;

  @Field(() => Int)
  @ApiProperty({ description: 'Request count' })
  requestCount!: number;
}

@ObjectType()
export class APIKeyWithSecret {
  @Field()
  @ApiProperty({ description: 'API Key (plain text, shown only once)' })
  apiKey!: string;

  @Field(() => ID)
  @ApiProperty({ description: 'API Key ID' })
  keyId!: string;

  @Field()
  @ApiProperty({ description: 'API Key name' })
  name!: string;

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Scopes' })
  scopes!: string[];
}

@ObjectType()
export class APIUsageType {
  @Field(() => Int)
  @ApiProperty({ description: 'Total requests' })
  totalRequests!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Requests today' })
  requestsToday!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Rate limit' })
  rateLimit!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Remaining requests' })
  remaining!: number;

  @Field()
  @ApiProperty({ description: 'Reset time' })
  resetTime!: Date;

  @Field(() => Float)
  @ApiProperty({ description: 'Average response time in ms' })
  averageResponseTime!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Error rate percentage' })
  errorRate!: number;
}

@ObjectType()
export class WebhookLogType {
  @Field(() => ID)
  @ApiProperty({ description: 'Log ID' })
  id!: string;

  @Field()
  @ApiProperty({ description: 'Webhook ID' })
  webhookId!: string;

  @Field()
  @ApiProperty({ description: 'Event type' })
  eventType!: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Status code' })
  statusCode!: number;

  @Field()
  @ApiProperty({ description: 'Success status' })
  success!: boolean;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Error message', required: false })
  error?: string;

  @Field(() => Int)
  @ApiProperty({ description: 'Duration in ms' })
  duration!: number;

  @Field()
  @ApiProperty({ description: 'Delivered at' })
  deliveredAt!: Date;

  @Field(() => Int)
  @ApiProperty({ description: 'Retry count' })
  retryCount!: number;
}

@ObjectType()
export class DeveloperPortalStatsType {
  @Field(() => Int)
  @ApiProperty({ description: 'Total developers' })
  totalDevelopers!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Active API keys' })
  activeApiKeys!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Total requests' })
  totalRequests!: number;

  @Field(() => Int)
  @ApiProperty({ description: 'Requests today' })
  requestsToday!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Average response time in ms' })
  averageResponseTime!: number;

  @Field(() => Float)
  @ApiProperty({ description: 'Error rate percentage' })
  errorRate!: number;
}
