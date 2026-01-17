import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class APIKeyType {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  scopes!: string[];

  @Field(() => Int)
  rateLimit!: number;

  @Field()
  isActive!: boolean;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field(() => Int)
  requestCount!: number;
}

@ObjectType()
export class APIKeyWithSecret {
  @Field()
  apiKey!: string;

  @Field(() => ID)
  keyId!: string;

  @Field()
  name!: string;

  @Field(() => [String])
  scopes!: string[];
}

@ObjectType()
export class APIUsageType {
  @Field(() => Int)
  totalRequests!: number;

  @Field(() => Int)
  requestsToday!: number;

  @Field(() => Int)
  rateLimit!: number;

  @Field(() => Int)
  remaining!: number;

  @Field()
  resetTime!: Date;

  @Field(() => Float)
  averageResponseTime!: number;

  @Field(() => Float)
  errorRate!: number;
}

@ObjectType()
export class WebhookLogType {
  @Field(() => ID)
  id!: string;

  @Field()
  webhookId!: string;

  @Field()
  eventType!: string;

  @Field(() => Int)
  statusCode!: number;

  @Field()
  success!: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Int)
  duration!: number;

  @Field()
  deliveredAt!: Date;

  @Field(() => Int)
  retryCount!: number;
}

@ObjectType()
export class DeveloperPortalStatsType {
  @Field(() => Int)
  totalDevelopers!: number;

  @Field(() => Int)
  activeApiKeys!: number;

  @Field(() => Int)
  totalRequests!: number;

  @Field(() => Int)
  requestsToday!: number;

  @Field(() => Float)
  averageResponseTime!: number;

  @Field(() => Float)
  errorRate!: number;
}