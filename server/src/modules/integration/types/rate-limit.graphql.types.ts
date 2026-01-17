import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class RateLimitInfoType {
  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  remaining!: number;

  @Field(() => Int)
  windowSizeSeconds!: number;

  @Field()
  resetTime!: Date;

  @Field(() => Float)
  retryAfterSeconds!: number;

  @Field()
  isLimited!: boolean;
}

@ObjectType()
export class RateLimitStatsType {
  @Field()
  apiKeyId!: string;

  @Field(() => Int)
  totalRequests!: number;

  @Field(() => Int)
  blockedRequests!: number;

  @Field(() => Float)
  blockRate!: number;

  @Field(() => Int)
  currentWindowRequests!: number;

  @Field()
  windowStart!: Date;

  @Field()
  windowEnd!: Date;

  @Field(() => [HourlyUsageType])
  hourlyUsage!: HourlyUsageType[];
}

@ObjectType()
export class HourlyUsageType {
  @Field()
  hour!: Date;

  @Field(() => Int)
  requests!: number;

  @Field(() => Int)
  blocked!: number;
}