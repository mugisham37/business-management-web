import { InputType, Field, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsInt, IsUrl, IsObject, Min, Max } from 'class-validator';

@InputType()
export class CreateWebhookInput {
  @Field()
  @ApiProperty({ description: 'Integration ID' })
  @IsString()
  integrationId!: string;

  @Field()
  @ApiProperty({ description: 'Webhook name' })
  @IsString()
  name!: string;

  @Field()
  @ApiProperty({ description: 'Webhook URL' })
  @IsUrl()
  url!: string;

  @Field({ defaultValue: 'POST' })
  @ApiProperty({ description: 'HTTP method', default: 'POST' })
  @IsOptional()
  @IsString()
  method?: string;

  @Field(() => [String])
  @ApiProperty({ type: [String], description: 'Events to subscribe to' })
  @IsArray()
  @IsString({ each: true })
  events!: string[];

  @Field({ nullable: true })
  @ApiProperty({ description: 'Authentication type', required: false })
  @IsOptional()
  @IsString()
  authType?: string;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Secret key for signature verification', required: false })
  @IsOptional()
  @IsString()
  secretKey?: string;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Custom headers', required: false })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @Field(() => Int, { nullable: true, defaultValue: 30 })
  @ApiProperty({ description: 'Timeout in seconds', default: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  timeout?: number;

  @Field(() => Int, { nullable: true, defaultValue: 3 })
  @ApiProperty({ description: 'Retry attempts', default: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  retryAttempts?: number;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Event filters', required: false })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

@InputType()
export class UpdateWebhookInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Webhook name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Webhook URL', required: false })
  @IsOptional()
  @IsUrl()
  url?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'HTTP method', required: false })
  @IsOptional()
  @IsString()
  method?: string;

  @Field(() => [String], { nullable: true })
  @ApiProperty({ type: [String], description: 'Events to subscribe to', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Custom headers', required: false })
  @IsOptional()
  @IsObject()
  headers?: Record<string, string>;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Timeout in seconds', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(300)
  timeout?: number;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Retry attempts', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  retryAttempts?: number;
}

@InputType()
export class TestWebhookInput {
  @Field()
  @ApiProperty({ description: 'Tenant ID' })
  @IsString()
  tenantId!: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Event type', required: false })
  @IsOptional()
  @IsString()
  event?: string;

  @Field(() => Object, { nullable: true })
  @ApiProperty({ description: 'Test data', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
