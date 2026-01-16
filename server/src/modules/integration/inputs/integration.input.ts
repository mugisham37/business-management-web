import { InputType, Field, Int } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean, IsInt, IsObject, Min, MaxLength, MinLength } from 'class-validator';
import { IntegrationType, IntegrationStatus, AuthType } from '../types/integration.graphql.types';

@InputType()
export class CreateIntegrationInput {
  @Field()
  @ApiProperty({ description: 'Integration name' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name!: string;

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

  @Field(() => IntegrationType)
  @ApiProperty({ enum: IntegrationType, description: 'Integration type' })
  @IsEnum(IntegrationType)
  type!: IntegrationType;

  @Field(() => AuthType)
  @ApiProperty({ enum: AuthType, description: 'Authentication type' })
  @IsEnum(AuthType)
  authType!: AuthType;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Provider name', required: false })
  @IsOptional()
  @IsString()
  providerName?: string;

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
  @ApiProperty({ description: 'Encrypted credentials', required: false })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @Field({ nullable: true })
  @ApiProperty({ description: 'Sync enabled', required: false, default: false })
  @IsOptional()
  @IsBoolean()
  syncEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  @ApiProperty({ description: 'Sync interval in minutes', required: false })
  @IsOptional()
  @IsInt()
  @Min(1)
  syncInterval?: number;

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
