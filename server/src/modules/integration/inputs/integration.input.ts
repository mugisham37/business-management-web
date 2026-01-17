import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsObject, IsArray, Min, MaxLength, MinLength } from 'class-validator';
import { IntegrationType, IntegrationStatus, AuthType } from '../types/integration.graphql.types';

@InputType()
export class CreateIntegrationInput {
  @Field()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field(() => IntegrationType)
  @IsEnum(IntegrationType)
  type!: IntegrationType;

  @Field(() => AuthType)
  @IsEnum(AuthType)
  authType!: AuthType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  providerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  syncInterval?: number;

  @Field(() => [WebhookConfigInput], { nullable: true })
  @IsOptional()
  @IsArray()
  webhooks?: WebhookConfigInput[];
}

@InputType()
export class UpdateIntegrationInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  syncInterval?: number;
}

@InputType()
export class IntegrationFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => IntegrationType, { nullable: true })
  @IsOptional()
  @IsEnum(IntegrationType)
  type?: IntegrationType;

  @Field(() => IntegrationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  providerName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;
}

@InputType()
export class TriggerSyncInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  syncType?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  entities?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  fullSync?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}

@InputType()
export class IntegrationConfigInput {
  @Field()
  @IsString()
  key!: string;

  @Field()
  value!: any;
}

@InputType()
export class WebhookConfigInput {
  @Field()
  @IsString()
  name!: string;

  @Field()
  @IsString()
  url!: string;

  @Field(() => [String])
  @IsArray()
  @IsString({ each: true })
  events!: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  secretKey?: string;
}

  @Field(() => [WebhookConfigInput], { nullable: true })
  @ApiProperty({ description: 'Webhook configurations', required: false })
  @IsOptional()
  webhooks?: WebhookConfigInput[];
}

@InputType()
export class UpdateIntegrationInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Integration name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Display name', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Integration description', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Integration configuration', required: false })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Integration settings', required: false })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Sync enabled', required: false })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Sync interval in minutes', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  syncInterval?: number;
}

@InputType()
export class IntegrationFilterInput {
  @Field({ nullable: true })
  @ApiProperty({ description: 'Search by name', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => IntegrationType, { nullable: true })
  @ApiProperty({ enum: IntegrationType, description: 'Filter by type', required: false })
  @IsOptional()
  @IsEnum(IntegrationType)
  type?: IntegrationType;

  @Field(() => IntegrationStatus, { nullable: true })
  @ApiProperty({ enum: IntegrationStatus, description: 'Filter by status', required: false })
  @IsOptional()
  @IsEnum(IntegrationStatus)
  status?: IntegrationStatus;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Filter by provider name', required: false })
  @IsOptional()
  @IsString()
  providerName?: string;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Filter by sync enabled', required: false })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;
}

@InputType()
export class WebhookConfigInput {
  @Field()
  @ApiProperty({ description: 'Webhook name' })
  @IsString()
  name!: string;

  @Field()
  @ApiProperty({ description: 'Webhook URL' })
  @IsString()
  url!: string;

  @Field(() => [String])
  @ApiProperty({ description: 'Events to listen for' })
  events!: string[];

  @Field(() => AuthType, { nullable: true })
  @ApiProperty({ enum: AuthType, description: 'Authentication type', required: false })
  @IsOptional()
  @IsEnum(AuthType)
  authType?: AuthType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Authentication configuration', required: false })
  @IsOptional()
  @IsObject()
  authConfig?: Record<string, any>;
}
